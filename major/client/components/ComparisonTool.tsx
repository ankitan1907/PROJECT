import { useState } from "react";
import { AnalysisResponse } from "@/lib/api";
import { X, TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ComparisonToolProps {
  analyses: AnalysisResponse[];
  onClose: () => void;
}

export function ComparisonTool({ analyses, onClose }: ComparisonToolProps) {
  const [selectedIndices, setSelectedIndices] = useState<number[]>([0, 1].filter(i => i < analyses.length));

  const toggleSelection = (index: number) => {
    if (selectedIndices.includes(index)) {
      setSelectedIndices(selectedIndices.filter(i => i !== index));
    } else if (selectedIndices.length < 4) {
      setSelectedIndices([...selectedIndices, index].sort((a, b) => a - b));
    }
  };

  const selectedAnalyses = selectedIndices.map(i => analyses[i]);

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 border-2 border-medical-blue/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-medical-blue">Comparison Tool</h3>
        <button
          onClick={onClose}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Selection Panel */}
      <div className="mb-8">
        <h4 className="font-semibold text-gray-700 mb-3">Select up to 4 analyses to compare:</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {analyses.map((analysis, idx) => (
            <button
              key={idx}
              onClick={() => toggleSelection(idx)}
              className={cn(
                "p-3 rounded-lg border-2 transition-all text-left",
                selectedIndices.includes(idx)
                  ? "border-medical-blue bg-blue-50"
                  : "border-gray-200 hover:border-medical-blue/50"
              )}
            >
              <p className="text-sm font-semibold text-gray-900">
                {analysis.filename.split("/").pop()}
              </p>
              <p className="text-xs text-gray-600 mt-1">
                {new Date(analysis.timestamp).toLocaleDateString()}
              </p>
              <p className={cn(
                "text-xs font-bold mt-2",
                analysis.analysis.diagnosis === "PNEUMONIA" ? "text-red-600" : "text-green-600"
              )}>
                {analysis.analysis.diagnosis}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Comparison Grid */}
      {selectedAnalyses.length > 0 && (
        <div className="space-y-6">
          {/* Diagnosis Comparison */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-bold text-lg mb-4 text-gray-900">Diagnosis Comparison</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedAnalyses.map((analysis, idx) => (
                <div
                  key={idx}
                  className={cn(
                    "rounded-lg p-4 text-white text-center",
                    analysis.analysis.diagnosis === "PNEUMONIA"
                      ? "bg-red-500"
                      : "bg-green-500"
                  )}
                >
                  <p className="text-sm opacity-90">Sample {idx + 1}</p>
                  <p className="text-2xl font-bold mt-2">{analysis.analysis.diagnosis}</p>
                  <p className="text-sm mt-2">
                    {new Date(analysis.timestamp).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence Scores */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-bold text-lg mb-4 text-gray-900">Confidence Scores</h4>
            <div className="space-y-4">
              {selectedAnalyses.map((analysis, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-700">
                      Sample {idx + 1} - {analysis.filename.split("/").pop()}
                    </span>
                    <span className="text-lg font-bold text-medical-blue">
                      {(analysis.analysis.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-medical-blue to-blue-400 h-full rounded-full transition-all"
                      style={{ width: `${analysis.analysis.confidence * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Model Scores Comparison */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-bold text-lg mb-4 text-gray-900">Ensemble Model Scores</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedAnalyses.map((analysis, idx) => (
                <div key={idx} className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700">Sample {idx + 1}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">ResNet50</span>
                      <span className="font-bold text-medical-blue">
                        {(analysis.model_scores.resnet50 * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">DenseNet121</span>
                      <span className="font-bold text-purple-600">
                        {(analysis.model_scores.densenet121 * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">EfficientNet</span>
                      <span className="font-bold text-teal-600">
                        {(analysis.model_scores.efficientnet * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Severity Comparison */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-bold text-lg mb-4 text-gray-900">Severity Assessment</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedAnalyses.map((analysis, idx) => {
                const severityColor = {
                  NONE: "bg-green-100 text-green-800 border-green-300",
                  MILD: "bg-yellow-100 text-yellow-800 border-yellow-300",
                  MODERATE: "bg-orange-100 text-orange-800 border-orange-300",
                  SEVERE: "bg-red-100 text-red-800 border-red-300"
                }[analysis.analysis.severity];

                return (
                  <div
                    key={idx}
                    className={cn(
                      "rounded-lg p-4 border-2 text-center",
                      severityColor
                    )}
                  >
                    <p className="text-sm opacity-90">Sample {idx + 1}</p>
                    <p className="text-lg font-bold mt-2">{analysis.analysis.severity}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Risk Factors Summary */}
          <div className="bg-gray-50 rounded-lg p-6">
            <h4 className="font-bold text-lg mb-4 text-gray-900">Risk Factors</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {selectedAnalyses.map((analysis, idx) => (
                <div key={idx} className="space-y-2">
                  <p className="text-sm font-semibold text-gray-700">Sample {idx + 1}</p>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {analysis.analysis.risk_factors.slice(0, 3).map((factor, fidx) => (
                      <li key={fidx} className="flex gap-2">
                        <span className="font-bold text-medical-blue flex-shrink-0">•</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          {/* Insights */}
          <div className="bg-blue-50 rounded-lg p-6 border-l-4 border-medical-blue">
            <h4 className="font-bold text-lg mb-3 text-medical-blue">Comparison Insights</h4>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex gap-2">
                <TrendingUp className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                <span>
                  {selectedAnalyses.filter(a => a.analysis.diagnosis === "PNEUMONIA").length} of {selectedAnalyses.length} samples show pneumonia indicators
                </span>
              </li>
              <li className="flex gap-2">
                <TrendingDown className="w-4 h-4 text-medical-blue flex-shrink-0 mt-0.5" />
                <span>
                  Average confidence across samples: {(selectedAnalyses.reduce((sum, a) => sum + a.analysis.confidence, 0) / selectedAnalyses.length * 100).toFixed(1)}%
                </span>
              </li>
              <li className="flex gap-2">
                <TrendingUp className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                <span>
                  Most confident model: {getMostConfidentModel(selectedAnalyses)}
                </span>
              </li>
            </ul>
          </div>
        </div>
      )}

      {selectedAnalyses.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>Select at least one analysis to begin comparison</p>
        </div>
      )}
    </div>
  );
}

function getMostConfidentModel(analyses: AnalysisResponse[]): string {
  const scores = {
    resnet50: 0,
    densenet121: 0,
    efficientnet: 0
  };

  analyses.forEach(a => {
    scores.resnet50 += a.model_scores.resnet50;
    scores.densenet121 += a.model_scores.densenet121;
    scores.efficientnet += a.model_scores.efficientnet;
  });

  const avg = (total: number) => total / analyses.length;
  const avgScores = {
    resnet50: avg(scores.resnet50),
    densenet121: avg(scores.densenet121),
    efficientnet: avg(scores.efficientnet)
  };

  return Object.entries(avgScores).reduce((a, b) => 
    a[1] > b[1] ? a : b
  )[0].replace(/([A-Z])/g, ' $1').trim();
}
