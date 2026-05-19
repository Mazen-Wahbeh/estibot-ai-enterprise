import { calculateEstimation } from "@/calculation-engine";
import { validateCalculationReadiness } from "@/ai-engine/validators";
import { loadProjectState } from "@/server/projectStore";
import { generatePdfReport } from "@/services/pdfService";
import { badRequest, type ProtectedApiHandler } from "@/api/http";
import { hasStrictStateShape, sanitizeState } from "@/utils/state";
import { enforceMonthlyUsage, logUsage } from "@/server/rateLimit";
import { stateRequestSchema } from "@/server/schemas";
import { audit } from "@/server/audit";

export const pdfHandler: ProtectedApiHandler = async (req, res, user) => {
  const limit = await enforceMonthlyUsage(user, "pdf");
  if (!limit.allowed) {
    res.status(402).json({ ok: false, error: limit.message });
    return;
  }

  const parsed = stateRequestSchema.safeParse(req.body ?? {});
  if (!parsed.success) {
    badRequest(res, parsed.error.issues[0]?.message ?? "Invalid PDF request.");
    return;
  }

  const { projectId, state: inputState } = parsed.data;
  let { state } = await loadProjectState(user, projectId);
  if (inputState !== undefined) {
    if (!hasStrictStateShape(inputState)) {
      badRequest(res, "State must match the strict EstiBot state schema with no root-level extra keys.");
      return;
    }
    state = sanitizeState(inputState);
  }

  const readiness = validateCalculationReadiness(state);
  if (!readiness.valid) {
    res.status(422).json({
      ok: false,
      error: readiness.error,
      data: {
        state: {
          ...state,
          missingFields: readiness.missingFields
        }
      }
    });
    return;
  }

  try {
    const calculations = calculateEstimation(state);
    const pdf = generatePdfReport(state, calculations, { tenantName: user.tenantName });
    const fileName = `${(state.project.name ?? "estibot-report").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-estimation.pdf`;
    await logUsage(user, "pdf");
    await audit(user, "EXPORT_PDF", "Project", projectId, { fileName });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${fileName}"`);
    res.status(200).send(pdf);
  } catch (error) {
    console.error("PDF generation blocked", error);
    res.status(422).json({
      ok: false,
      error: error instanceof Error ? error.message : "PDF generation failed."
    });
  }
};
