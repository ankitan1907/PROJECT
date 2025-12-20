interface DiagnosisReport {
  diagnosis: "PNEUMONIA" | "NORMAL";
  confidence: number;
  severity: "NONE" | "MILD" | "MODERATE" | "SEVERE";
  riskScore: number;
  recommendations: string[];
  detectionTimestamp: Date;
}

interface PDFGenerationOptions {
  patientName?: string;
  patientAge?: string;
  patientId?: string;
  doctorName?: string;
  hospitalName?: string;
}

// --- PDF GENERATION ---
export async function generatePDFReport(
  result: DiagnosisReport,
  options: PDFGenerationOptions = {}
): Promise<Blob> {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d")!;
  canvas.width = 595;
  canvas.height = 842;

  // Background
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, 595, 842);

  // Blue Header Bar
  ctx.fillStyle = "#1A5F7A";
  ctx.fillRect(0, 0, 595, 100);

  // Header Text
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px Arial";
  ctx.fillText("AI RADIOLOGY ANALYSIS REPORT", 40, 50);
  
  ctx.font = "12px Arial";
  ctx.fillText("Architecture: Edge-Cloud Synergy (Hybrid Processing)", 40, 80);

  // Diagnosis Section
  ctx.fillStyle = "#1a1a1a";
  ctx.font = "bold 18px Arial";
  ctx.fillText(`Final Diagnosis: ${result.diagnosis}`, 40, 160);
  
  ctx.font = "14px Arial";
  ctx.fillText(`Confidence Score: ${(result.confidence * 100).toFixed(2)}%`, 40, 190);
  ctx.fillText(`Clinical Severity: ${result.severity}`, 40, 215);

  // Clinical Recommendations
  ctx.font = "bold 15px Arial";
  ctx.fillText("Recommendations:", 40, 260);
  
  ctx.font = "13px Arial";
  result.recommendations.forEach((rec, i) => {
    ctx.fillText(`${i + 1}. ${rec}`, 50, 290 + (i * 25));
  });

  // Footer
  ctx.fillStyle = "#666666";
  ctx.font = "italic 10px Arial";
  ctx.fillText(`Generated on: ${new Date().toLocaleString()}`, 40, 800);
  ctx.fillText("Note: This AI analysis should be verified by a medical professional.", 40, 815);

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(blob || new Blob());
    }, "image/png");
  });
}

export function downloadPDF(blob: Blob, filename: string = "report.pdf") {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }, 200);
}

// --- CSV EXPORT ---
export function generateCSVReport(result: DiagnosisReport): string {
  const rows = [
    ["Field", "Value"],
    ["Diagnosis", result.diagnosis],
    ["Confidence", `${(result.confidence * 100).toFixed(2)}%`],
    ["Severity", result.severity],
    ["Timestamp", result.detectionTimestamp.toISOString()],
    ["Recommendations", result.recommendations.join(" | ")]
  ];
  return rows.map(e => e.join(",")).join("\n");
}

export function downloadCSV(csv: string, filename: string = "report.csv") {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// --- JSON EXPORT ---
export function generateJSONReport(result: DiagnosisReport): string {
  return JSON.stringify(result, null, 2);
}

export function downloadJSON(json: string, filename: string = "report.json") {
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}