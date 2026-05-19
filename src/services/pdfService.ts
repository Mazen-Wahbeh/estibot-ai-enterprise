import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { CalculationResult, EstimationState, FunctionPointResult, UseCasePointResult, WeightedRow } from "@/types/estimation";

type PdfWithAutoTable = jsPDF & { lastAutoTable?: { finalY: number } };
interface PdfOptions {
  tenantName?: string;
}

function currency(value: number): string {
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function metric(value: number): string {
  return value.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function addTitle(doc: jsPDF, title: string, subtitle?: string): void {
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(9, 60, 93);
  doc.text(title, 42, 56);
  if (subtitle) {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(59, 117, 151);
    doc.text(subtitle, 42, 74);
  }
}

function table(doc: PdfWithAutoTable, y: number, head: string[][], body: Array<Array<string | number>>): number {
  autoTable(doc, {
    startY: y,
    head,
    body,
    theme: "grid",
    headStyles: {
      fillColor: [9, 60, 93],
      textColor: [255, 255, 255],
      fontStyle: "bold"
    },
    styles: {
      font: "helvetica",
      fontSize: 9,
      cellPadding: 6,
      lineColor: [185, 233, 238],
      lineWidth: 0.6
    },
    alternateRowStyles: {
      fillColor: [239, 251, 252]
    },
    margin: { left: 42, right: 42 }
  });
  return (doc.lastAutoTable?.finalY ?? y) + 18;
}

function rowsForWeighted(values: WeightedRow[]): Array<Array<string | number>> {
  return values.map((row) => [
    row.label,
    row.simple ?? row.rating ?? "-",
    row.average ?? row.weight ?? "-",
    row.complex ?? "-",
    metric(row.weightedValue)
  ]);
}

function addCover(doc: jsPDF, state: EstimationState, calculations: CalculationResult, options?: PdfOptions): void {
  doc.setFillColor(9, 60, 93);
  doc.rect(0, 0, 595, 842, "F");
  doc.setFillColor(93, 248, 216);
  doc.rect(0, 0, 595, 12, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("EstiBot AI SaaS", 52, 118);
  doc.setFontSize(20);
  doc.text("Software Project Estimation Report", 52, 154);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(12);
  doc.text(`Tenant: ${options?.tenantName ?? "Workspace"}`, 52, 218);
  doc.text(`Project: ${state.project.name ?? "Unnamed project"}`, 52, 240);
  doc.text(`Method: ${calculations.method}`, 52, 262);
  doc.text(`Generated: ${new Date(calculations.generatedAt).toLocaleString()}`, 52, 284);
  doc.setDrawColor(93, 248, 216);
  doc.setLineWidth(2);
  doc.line(52, 292, 420, 292);
  doc.setFontSize(10);
  doc.setTextColor(215, 244, 246);
  doc.text("Deterministic state-machine output. Missing data is never inferred.", 52, 326);
}

function addOverview(doc: PdfWithAutoTable, state: EstimationState, calculations: CalculationResult): void {
  doc.addPage();
  addTitle(doc, "Project Overview", "Input summary and estimation scope");
  let y = 98;
  y = table(doc, y, [["Field", "Value"]], [
    ["Project name", state.project.name ?? "-"],
    ["Project overview", state.project.description ?? "-"],
    ["Method", calculations.method],
    ["Hourly rate", currency(state.project.hourlyRate ?? 0)],
    ["State phase", state.phase],
    ["Confidence", calculations.confidence.level],
    ["Confidence basis", calculations.confidence.basis]
  ]);
  doc.setFontSize(10);
  doc.setTextColor(59, 117, 151);
  doc.text("State schema root: phase, project, fp, ucp, technical, environmental, missingFields, isComplete.", 42, y + 8);
}

function addFpSection(doc: PdfWithAutoTable, fp: FunctionPointResult | null): void {
  doc.addPage();
  addTitle(doc, "Function Point Analysis", "UFP, VAF, AFP, effort, duration, and cost");
  if (!fp) {
    doc.setFontSize(11);
    doc.text("Function Point Analysis was not selected for this estimate.", 42, 108);
    return;
  }
  let y = table(doc, 98, [["Component", "Simple", "Average", "Complex", "Weighted Value"]], rowsForWeighted(fp.componentRows));
  y = table(doc, y, [["Metric", "Value"]], [
    ["Unadjusted Function Points (UFP)", metric(fp.ufp)],
    ["Total Degree of Influence (TDI)", metric(fp.tdi)],
    ["Value Adjustment Factor (VAF)", metric(fp.vaf)],
    ["Adjusted Function Points (AFP)", metric(fp.afp)],
    ["Effort hours", metric(fp.effortHours)],
    ["Duration months", metric(fp.durationMonths)],
    ["Cost", currency(fp.cost)]
  ]);
  table(doc, y, [["Technical Factor", "Rating", "Weight", "Unused", "Weighted Value"]], rowsForWeighted(fp.technicalRows));
}

function addUcpSection(doc: PdfWithAutoTable, ucp: UseCasePointResult | null): void {
  doc.addPage();
  addTitle(doc, "Use Case Point Analysis", "Actors, use cases, technical adjustment, environmental adjustment");
  if (!ucp) {
    doc.setFontSize(11);
    doc.text("Use Case Point Analysis was not selected for this estimate.", 42, 108);
    return;
  }
  let y = table(doc, 98, [["Actor Type", "Count", "Weight", "Unused", "Weighted Value"]], rowsForWeighted(ucp.actorRows));
  y = table(doc, y, [["Use Case Type", "Count", "Weight", "Unused", "Weighted Value"]], rowsForWeighted(ucp.useCaseRows));
  y = table(doc, y, [["Metric", "Value"]], [
    ["Unadjusted Actor Weight (UAW)", metric(ucp.uaw)],
    ["Unadjusted Use Case Weight (UUCW)", metric(ucp.uucw)],
    ["Unadjusted Use Case Points (UUCP)", metric(ucp.uucp)],
    ["Technical Factor", metric(ucp.technicalFactor)],
    ["Environmental Factor", metric(ucp.environmentalFactor)],
    ["TCF", metric(ucp.tcf)],
    ["ECF", metric(ucp.ecf)],
    ["Use Case Points", metric(ucp.ucp)],
    ["Effort hours", metric(ucp.effortHours)],
    ["Duration months", metric(ucp.durationMonths)],
    ["Cost", currency(ucp.cost)]
  ]);
  y = table(doc, y, [["Technical Factor", "Rating", "Weight", "Unused", "Weighted Value"]], rowsForWeighted(ucp.technicalRows));
  table(doc, y, [["Environmental Factor", "Rating", "Weight", "Unused", "Weighted Value"]], rowsForWeighted(ucp.environmentalRows));
}

function addComparison(doc: PdfWithAutoTable, calculations: CalculationResult): void {
  doc.addPage();
  addTitle(doc, "Cost Estimation Summary", "Comparison, chart, and confidence score");

  const fpEffort = calculations.fp?.effortHours ?? 0;
  const ucpEffort = calculations.ucp?.effortHours ?? 0;
  const maxEffort = Math.max(fpEffort, ucpEffort, 1);
  const startX = 42;
  const barWidth = 360;
  const y = 128;

  doc.setFontSize(10);
  doc.setTextColor(9, 60, 93);
  doc.text("Effort Comparison Chart", startX, 104);
  if (calculations.fp) {
    doc.text("FP", startX, y);
    doc.setFillColor(59, 117, 151);
    doc.rect(startX + 56, y - 10, barWidth * (fpEffort / maxEffort), 14, "F");
    doc.text(`${metric(fpEffort)} h`, startX + 424, y);
  }
  if (calculations.ucp) {
    doc.text("UCP", startX, y + 34);
    doc.setFillColor(93, 248, 216);
    doc.rect(startX + 56, y + 24, barWidth * (ucpEffort / maxEffort), 14, "F");
    doc.text(`${metric(ucpEffort)} h`, startX + 424, y + 34);
  }

  table(doc, 206, [["Estimate", "Effort Hours", "Duration Months", "Cost"]], [
    ["Function Points", calculations.fp ? metric(calculations.fp.effortHours) : "N/A", calculations.fp ? metric(calculations.fp.durationMonths) : "N/A", calculations.fp ? currency(calculations.fp.cost) : "N/A"],
    ["Use Case Points", calculations.ucp ? metric(calculations.ucp.effortHours) : "N/A", calculations.ucp ? metric(calculations.ucp.durationMonths) : "N/A", calculations.ucp ? currency(calculations.ucp.cost) : "N/A"]
  ]);

  table(doc, 334, [["Confidence", "Difference", "Basis"]], [
    [
      calculations.confidence.level,
      calculations.confidence.differencePercent === null ? "N/A" : `${metric(calculations.confidence.differencePercent)}%`,
      calculations.confidence.basis
    ]
  ]);
}

function addFooters(doc: jsPDF): void {
  const pageCount = doc.getNumberOfPages();
  for (let page = 1; page <= pageCount; page += 1) {
    doc.setPage(page);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(110, 119, 135);
    doc.text(`EstiBot AI SaaS | Page ${page} of ${pageCount}`, 42, 820);
  }
}

export function generatePdfReport(state: EstimationState, calculations: CalculationResult, options?: PdfOptions): Buffer {
  const doc = new jsPDF({ orientation: "portrait", unit: "pt", format: "a4" }) as PdfWithAutoTable;
  addCover(doc, state, calculations, options);
  addOverview(doc, state, calculations);
  addFpSection(doc, calculations.fp);
  addUcpSection(doc, calculations.ucp);
  addComparison(doc, calculations);
  addFooters(doc);
  return Buffer.from(doc.output("arraybuffer"));
}
