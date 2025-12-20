import { AnalysisResponse } from "@/lib/api";
import { generatePDFReport, downloadPDF, generateCSVReport, downloadCSV, generateJSONReport, downloadJSON } from "@/lib/pdf-generator";
import { Download, FileText, Sheet, Code } from "lucide-react";
import { useState } from "react";

interface ExportMenuProps {
  analysis: AnalysisResponse;
  selectedFile: File | null;
}

export function ExportMenu({ analysis, selectedFile }: ExportMenuProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      const pdfBlob = await generatePDFReport({
        diagnosis: analysis.analysis.diagnosis,
        confidence: analysis.analysis.confidence,
        severity: analysis.analysis.severity,
        riskScore: analysis.analysis.confidence,
        recommendations: analysis.analysis.recommendations,
        detectionTimestamp: new Date(analysis.timestamp),
      }, {
        hospitalName: "AI Pneumonia Detection System",
        doctorName: "ML Analysis Engine",
        patientAge: "Unknown",
      });

      const filename = selectedFile
        ? `pneumonia-report-${selectedFile.name.split(".")[0]}.pdf`
        : `pneumonia-report-${new Date().getTime()}.pdf`;

      downloadPDF(pdfBlob, filename);
    } catch (err) {
      console.error("Error exporting PDF:", err);
      alert("Failed to export PDF");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportCSV = () => {
    setIsExporting(true);
    try {
      const csv = generateCSVReport({
        diagnosis: analysis.analysis.diagnosis,
        confidence: analysis.analysis.confidence,
        severity: analysis.analysis.severity,
        riskScore: analysis.analysis.confidence,
        recommendations: analysis.analysis.recommendations,
        detectionTimestamp: new Date(analysis.timestamp),
      }, {
        hospitalName: "AI Pneumonia Detection System",
        doctorName: "ML Analysis Engine",
        patientAge: "Unknown",
      });

      const filename = selectedFile
        ? `pneumonia-report-${selectedFile.name.split(".")[0]}.csv`
        : `pneumonia-report-${new Date().getTime()}.csv`;

      downloadCSV(csv, filename);
    } catch (err) {
      console.error("Error exporting CSV:", err);
      alert("Failed to export CSV");
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJSON = () => {
    setIsExporting(true);
    try {
      const json = generateJSONReport({
        diagnosis: analysis.analysis.diagnosis,
        confidence: analysis.analysis.confidence,
        severity: analysis.analysis.severity,
        riskScore: analysis.analysis.confidence,
        recommendations: analysis.analysis.recommendations,
        detectionTimestamp: new Date(analysis.timestamp),
      }, {
        hospitalName: "AI Pneumonia Detection System",
        doctorName: "ML Analysis Engine",
        patientAge: "Unknown",
      });

      const filename = selectedFile
        ? `pneumonia-report-${selectedFile.name.split(".")[0]}.json`
        : `pneumonia-report-${new Date().getTime()}.json`;

      downloadJSON(json, filename);
    } catch (err) {
      console.error("Error exporting JSON:", err);
      alert("Failed to export JSON");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md border-2 border-medical-blue/20 p-6">
      <h3 className="font-bold text-lg text-medical-blue mb-4 flex items-center gap-2">
        <Download className="w-5 h-5" />
        Export Report
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <button
          onClick={handleExportPDF}
          disabled={isExporting}
          className="flex items-center gap-3 p-4 border-2 border-red-200 rounded-lg hover:bg-red-50 transition-colors disabled:opacity-50"
        >
          <div className="p-2 bg-red-100 rounded-lg">
            <FileText className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm text-gray-900">PDF Report</p>
            <p className="text-xs text-gray-600">Formatted document</p>
          </div>
        </button>

        <button
          onClick={handleExportCSV}
          disabled={isExporting}
          className="flex items-center gap-3 p-4 border-2 border-green-200 rounded-lg hover:bg-green-50 transition-colors disabled:opacity-50"
        >
          <div className="p-2 bg-green-100 rounded-lg">
            <Sheet className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm text-gray-900">CSV Export</p>
            <p className="text-xs text-gray-600">Spreadsheet format</p>
          </div>
        </button>

        <button
          onClick={handleExportJSON}
          disabled={isExporting}
          className="flex items-center gap-3 p-4 border-2 border-blue-200 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
        >
          <div className="p-2 bg-blue-100 rounded-lg">
            <Code className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-semibold text-sm text-gray-900">JSON Export</p>
            <p className="text-xs text-gray-600">Data format</p>
          </div>
        </button>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
        <p className="text-xs text-blue-900">
          💡 <span className="font-semibold">Tip:</span> Export your analysis results in multiple formats for easy sharing and integration with other systems.
        </p>
      </div>
    </div>
  );
}
