import { calculateEstimation } from "@/calculation-engine";
import { validateCalculationReadiness } from "@/ai-engine/validators";
import { readState } from "@/database/jsonStore";
import { generatePdfReport } from "@/services/pdfService";
import { badRequest, type ApiHandler } from "@/api/http";
import { hasStrictStateShape, sanitizeState } from "@/utils/state";

export const pdfHandler: ApiHandler = async (req, res) => {
  let state = await readState();
  if (req.body?.state !== undefined) {
    if (!hasStrictStateShape(req.body.state)) {
      badRequest(res, "State must match the strict EstiBot state schema with no root-level extra keys.");
      return;
    }
    state = sanitizeState(req.body.state);
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
    const pdf = generatePdfReport(state, calculations);
    const fileName = `${(state.project.name ?? "estibot-report").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-estimation.pdf`;

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
