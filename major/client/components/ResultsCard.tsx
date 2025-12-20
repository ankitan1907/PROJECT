import { DiagnosisResult } from "@/lib/api";
import { AlertCircle, CheckCircle2, Download, AlertTriangle, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface ResultsCardProps {
  result: DiagnosisResult;
  onDownloadPDF: () => void;
  imageName?: string;
}

export function ResultsCard({ result, onDownloadPDF, imageName }: ResultsCardProps) {
  const confidence = result.confidence || 0;
  const threshold = result.threshold_used || 0.8;
  
  const isPneumonia = result.diagnosis === "PNEUMONIA";
  const isUncertain = result.diagnosis === "UNCERTAIN";
  
  // Use risk_level from backend
  const riskLevel = result.risk_level || "LOW";

  const severityColors = {
    NONE: { bg: "bg-green-50", border: "border-green-200", text: "text-green-700" },
    MILD: { bg: "bg-yellow-50", border: "border-yellow-200", text: "text-yellow-700" },
    MODERATE: { bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
    SEVERE: { bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
  };

  const currentSeverityStyle = severityColors[result.severity] || severityColors.NONE;

  const riskColors = {
    CRITICAL: "text-red-600",
    HIGH: "text-red-600",
    MODERATE: "text-orange-600",
    LOW: "text-green-600",
  };

  const getAlertMessage = () => {
    if (isPneumonia) {
      return confidence > threshold ? "Pneumonia Detected - Urgent Action Required" : "Possible Pneumonia";
    } else if (isUncertain) {
      return "Inconclusive Findings - Clinical Correlation Required";
    } else {
      return "No Pneumonia Detected";
    }
  };

  const getAlertDescription = () => {
    if (isPneumonia) {
      return `Confidence: ${(confidence * 100).toFixed(1)}% with ${result.severity} severity. Threshold: ${(threshold * 100).toFixed(0)}%. Please consult a physician.`;
    } else if (isUncertain) {
      return "The analysis was inconclusive. Clinical assessment and possibly repeat imaging are recommended.";
    } else {
      return "The analysis indicates no signs of pneumonia. Continue with routine monitoring.";
    }
  };

  return (
    <div className={cn(
      "rounded-lg border-2 p-6 md:p-8",
      currentSeverityStyle.border,
      currentSeverityStyle.bg
    )}>
      <div className="flex items-start gap-4 mb-6">
        <div className="flex-shrink-0">
          {isPneumonia ? (
            <AlertCircle className="w-10 h-10 text-red-600" />
          ) : isUncertain ? (
            <AlertTriangle className="w-10 h-10 text-yellow-600" />
          ) : (
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          )}
        </div>
        <div className="flex-1">
          <h2 className={cn(
            "text-3xl md:text-4xl font-bold mb-2",
            isPneumonia ? "text-red-600" : 
            isUncertain ? "text-yellow-600" : 
            "text-green-600"
          )}>
            {result.diagnosis}
          </h2>
          <p className="text-gray-600">
            {imageName && `Analysis of: ${imageName}`}
            {imageName && " • "}
            {result.detectionTimestamp.toLocaleTimeString()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white/60 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Confidence
          </p>
          <p className="text-2xl font-bold text-medical-blue">
            {(confidence * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-white/60 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Severity
          </p>
          <p className="text-2xl font-bold text-medical-blue">
            {result.severity}
          </p>
        </div>

        <div className="bg-white/60 rounded-lg p-4 backdrop-blur-sm">
          <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide mb-1">
            Risk Level
          </p>
          <p className={cn("text-2xl font-bold", riskColors[riskLevel] || riskColors.LOW)}>
            {riskLevel}
          </p>
        </div>
      </div>

      <div className="bg-white/70 rounded-lg p-4 mb-6 backdrop-blur-sm">
        <p className="text-sm font-semibold text-gray-700 mb-2">Confidence Level</p>
        <div className="w-full bg-gray-300 rounded-full h-3 overflow-hidden">
          <div
            className={cn(
              "h-full transition-all duration-300",
              confidence > threshold
                ? "bg-red-500"
                : confidence > (threshold * 0.7)
                  ? "bg-yellow-500"
                  : "bg-green-500"
            )}
            style={{ width: `${Math.min(confidence * 100, 100)}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-600 mt-2">
          <span>0%</span>
          <span>Threshold: {(threshold * 100).toFixed(0)}%</span>
          <span>100%</span>
        </div>
        <p className="text-xs text-gray-600 mt-1">
          {/* FIXED: Conditional logic uses isPneumonia status for descriptive text */}
          Confidence: {(confidence * 100).toFixed(1)}% - {isPneumonia ? "Pneumonia Likely" : "Normal Likely"}
        </p>
      </div>

      <div className={cn(
        "rounded-lg border p-4 mb-6",
        isPneumonia ? "border-red-200 bg-red-50/50" :
        isUncertain ? "border-yellow-200 bg-yellow-50/50" :
        "border-green-200 bg-green-50/50"
      )}>
        <div className="flex items-start gap-3 mb-3">
          {isPneumonia ? (
            <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
          ) : isUncertain ? (
            <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
          )}
          <div>
            <h3 className={cn(
              "font-semibold mb-2",
              isPneumonia ? "text-red-700" :
              isUncertain ? "text-yellow-700" :
              "text-green-700"
            )}>
              {getAlertMessage()}
            </h3>
            <p className="text-sm text-gray-700">
              {getAlertDescription()}
            </p>
          </div>
        </div>
      </div>

      {result.risk_factors && result.risk_factors.length > 0 && (
        <div className="mb-6">
          <h3 className="font-semibold text-gray-900 mb-3">Findings</h3>
          <ul className="space-y-2">
            {result.risk_factors.map((factor, idx) => (
              <li key={idx} className="text-sm text-gray-700 flex gap-2">
                <span className={cn(
                  "font-bold flex-shrink-0 mt-0.5",
                  isPneumonia ? "text-red-500" :
                  isUncertain ? "text-yellow-500" :
                  "text-green-500"
                )}>•</span>
                <span>{factor}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="mb-6">
        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Clock className="w-5 h-5 text-medical-blue" />
          Clinical Recommendations
        </h3>
        <ul className="space-y-2">
          {result.recommendations && result.recommendations.map((rec, idx) => (
            <li key={idx} className="flex gap-3 text-sm">
              <span className="text-medical-blue font-bold flex-shrink-0 mt-0.5">
                {idx + 1}.
              </span>
              <span className="text-gray-700">{rec}</span>
            </li>
          ))}
        </ul>
      </div>

      <button
        onClick={onDownloadPDF}
        className="w-full bg-medical-blue text-white py-3 rounded-lg font-semibold hover:bg-medical-dark transition-colors flex items-center justify-center gap-2"
      >
        <Download className="w-5 h-5" />
        Download PDF Report
      </button>
    </div>
  );
}