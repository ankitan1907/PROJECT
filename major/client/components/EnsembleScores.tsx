import { ModelScore } from "@/lib/api";
import { GitCompare } from "lucide-react";

interface EnsembleScoresProps {
  scores: ModelScore;
  ensembleScore: number;
  thresholdUsed: number;
  diagnosis: "PNEUMONIA" | "NORMAL" | "UNCERTAIN";
}

export function EnsembleScores({ scores, ensembleScore, thresholdUsed, diagnosis }: EnsembleScoresProps) {
  const models = [
    { name: "SVM", key: "svm" as const, weight: 0.35, color: "bg-blue-500" },
    { name: "Random Forest", key: "rf" as const, weight: 0.35, color: "bg-purple-500" },
    { name: "Logistic Regression", key: "lr" as const, weight: 0.30, color: "bg-pink-500" },
  ];

  return (
    <div className="rounded-lg border-2 border-indigo-200 bg-indigo-50 p-6">
      <div className="flex items-center gap-2 mb-4">
        <GitCompare className="w-5 h-5 text-indigo-600" />
        <h3 className="text-lg font-semibold text-indigo-900">
          Machine Learning Model Predictions
        </h3>
      </div>

      <p className="text-sm text-indigo-700 mb-6">
        Three ML models vote on the diagnosis
      </p>

      <div className="space-y-4 mb-6">
        {models.map(({ name, key, weight, color }) => {
          const score = scores[key] || 0;
          const percentage = (score * 100).toFixed(1);

          return (
            <div key={key}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${color}`} />
                  <span className="font-medium text-gray-700">{name}</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-indigo-600">{percentage}%</span>
                  <span className="text-xs text-gray-500 ml-2">(weight: {(weight * 100).toFixed(0)}%)</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div
                  className={`h-full ${color} transition-all duration-500`}
                  style={{ width: `${Math.min(score * 100, 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="bg-white rounded-lg p-4 border-2 border-indigo-300">
        <p className="text-xs text-gray-600 font-medium mb-2">FINAL ENSEMBLE PREDICTION</p>
        <div className="flex items-baseline gap-2">
          {/* FIXED: Calculates and displays the raw PNEUMONIA probability from the model scores */}
          <span className="text-3xl font-bold text-indigo-600">
            {((scores.svm * 0.35 + scores.rf * 0.35 + scores.lr * 0.30) * 100).toFixed(1)}%
          </span>
          <span className="text-sm font-semibold text-gray-700">
            {diagnosis === "PNEUMONIA" ? "PNEUMONIA DETECTED" : "NORMAL"}
          </span>
        </div>
        <p className="text-xs text-indigo-700 mt-3">
          Weighted average: (SVM × 0.35) + (Random Forest × 0.35) + (Logistic Regression × 0.30)
        </p>
        <p className="text-xs text-gray-600 mt-1">
          Threshold: {(thresholdUsed * 100).toFixed(0)}% • Diagnosis: {diagnosis}
        </p>
      </div>

      <div className="mt-4 p-3 bg-indigo-100 rounded-lg border border-indigo-200 text-xs text-indigo-800">
        <p className="font-semibold mb-1">Why Ensemble Models?</p>
        <p>
          Combining multiple ML models reduces individual model bias and improves prediction
          reliability. Each model detects different patterns in the X-ray.
        </p>
      </div>
    </div>
  );
}