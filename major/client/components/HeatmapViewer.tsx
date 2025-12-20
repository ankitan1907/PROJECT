import { HeatmapData } from "@/lib/api";
import { Zap } from "lucide-react";

interface HeatmapViewerProps {
  heatmap: HeatmapData;
  title?: string;
}

export function HeatmapViewer({ heatmap, title = "Grad-CAM Attention Map" }: HeatmapViewerProps) {
  return (
    <div className="rounded-lg border-2 border-purple-200 bg-purple-50 p-6 animate-fadeIn">
      <div className="flex items-center gap-2 mb-4">
        <Zap className="w-5 h-5 text-purple-600 animate-pulse" />
        <h3 className="text-lg font-semibold text-purple-900">{title}</h3>
      </div>

      <p className="text-sm text-purple-700 mb-4">
        Shows which regions of the X-ray the AI model focuses on for diagnosis
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="animate-slideUp" style={{ animationDelay: '0.1s' }}>
          <p className="text-xs font-medium text-gray-600 mb-2">Attention Heatmap</p>
          <div className="rounded-lg overflow-hidden border border-purple-200 bg-white shadow-md hover:shadow-lg transition-shadow">
            <img
              src={heatmap.heatmap}
              alt="Attention Heatmap"
              className="w-full h-auto hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>

        <div className="animate-slideUp" style={{ animationDelay: '0.2s' }}>
          <p className="text-xs font-medium text-gray-600 mb-2">Overlay on Image</p>
          <div className="rounded-lg overflow-hidden border border-purple-200 bg-white shadow-md hover:shadow-lg transition-shadow">
            <img
              src={heatmap.overlay}
              alt="Heatmap Overlay"
              className="w-full h-auto hover:scale-105 transition-transform duration-300"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg p-3 border border-purple-200 animate-slideUp" style={{ animationDelay: '0.3s' }}>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-600">
              <span className="font-semibold">Intensity:</span>{" "}
              {(heatmap.intensity * 100).toFixed(1)}%
            </p>
          </div>
          <div className="w-24 bg-gray-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-blue-500 to-red-500 h-full rounded-full transition-all"
              style={{ width: `${heatmap.intensity * 100}%` }}
            />
          </div>
        </div>
      </div>

      <div className="mt-3 text-xs text-purple-600">
        <p>
          🔴 Red = High attention | 🟡 Yellow = Medium | 🔵 Blue = Low
        </p>
      </div>
    </div>
  );
}
