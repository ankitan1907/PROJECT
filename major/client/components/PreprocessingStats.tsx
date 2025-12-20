import { PreprocessingStats } from "@/lib/api";
import { FileQuestion } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface PreprocessingStatsProps {
  stats: PreprocessingStats;
}

export function PreprocessingStatsViewer({ stats }: PreprocessingStatsProps) {
  const [selectedPhase, setSelectedPhase] = useState<"original" | "normalized" | "enhanced">("enhanced");

  const phases = [
    { key: "original" as const, label: "Original", color: "bg-gray-100" },
    { key: "normalized" as const, label: "Normalized", color: "bg-yellow-100" },
    { key: "enhanced" as const, label: "Enhanced", color: "bg-green-100" },
  ];

  const currentStats = stats[selectedPhase];

  return (
    <div className="rounded-lg border-2 border-amber-200 bg-amber-50 p-6">
      <div className="flex items-center gap-2 mb-4">
        <FileQuestion className="w-5 h-5 text-amber-600" />
        <h3 className="text-lg font-semibold text-amber-900">
          Image Preprocessing Pipeline
        </h3>
      </div>

      <p className="text-sm text-amber-700 mb-4">
        Track how image quality improves through preprocessing stages
      </p>

      <div className="mb-4">
        <p className="text-xs font-medium text-gray-600 mb-2">Processing Stage</p>
        <div className="flex flex-wrap gap-2">
          {phases.map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setSelectedPhase(key)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border-2",
                selectedPhase === key
                  ? "border-amber-600 bg-amber-600 text-white"
                  : "border-amber-200 bg-white text-amber-700 hover:border-amber-400"
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-4">
        <div className="bg-white rounded-lg p-3 border border-amber-200">
          <p className="text-xs text-gray-600 font-medium">Mean</p>
          <p className="text-lg font-bold text-amber-600">
            {currentStats.mean.toFixed(3)}
          </p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-amber-200">
          <p className="text-xs text-gray-600 font-medium">Std Dev</p>
          <p className="text-lg font-bold text-amber-600">
            {currentStats.std.toFixed(3)}
          </p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-amber-200">
          <p className="text-xs text-gray-600 font-medium">Contrast</p>
          <p className="text-lg font-bold text-amber-600">
            {currentStats.contrast.toFixed(3)}
          </p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-amber-200">
          <p className="text-xs text-gray-600 font-medium">Brightness</p>
          <p className="text-lg font-bold text-amber-600">
            {currentStats.brightness.toFixed(3)}
          </p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-amber-200">
          <p className="text-xs text-gray-600 font-medium">Min Value</p>
          <p className="text-lg font-bold text-amber-600">
            {currentStats.min.toFixed(3)}
          </p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-amber-200">
          <p className="text-xs text-gray-600 font-medium">Max Value</p>
          <p className="text-lg font-bold text-amber-600">
            {currentStats.max.toFixed(3)}
          </p>
        </div>
      </div>

      <div className="p-3 bg-amber-100 rounded-lg border border-amber-200 text-xs text-amber-800">
        <p className="font-semibold mb-1">Preprocessing Stages:</p>
        <ol className="space-y-1 text-xs">
          <li>1. Load and convert to grayscale</li>
          <li>2. Normalize pixel intensity</li>
          <li>3. Apply CLAHE (Contrast Limited Adaptive Histogram Equalization)</li>
          <li>4. Remove noise using bilateral filtering</li>
          <li>5. Resize to 224×224 pixels</li>
          <li>6. Convert to RGB for model input</li>
        </ol>
      </div>
    </div>
  );
}
