import { SegmentationData } from "@/lib/api";
import { Target } from "lucide-react";

interface LungSegmentationViewerProps {
  segmentation: SegmentationData;
}

export function LungSegmentationViewer({ segmentation }: LungSegmentationViewerProps) {
  const metrics = segmentation.metrics;

  return (
    <div className="rounded-lg border-2 border-teal-200 bg-teal-50 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Target className="w-5 h-5 text-teal-600" />
        <h3 className="text-lg font-semibold text-teal-900">
          Lung Segmentation Analysis
        </h3>
      </div>

      <p className="text-sm text-teal-700 mb-4">
        Automated detection and segmentation of lung regions from chest X-ray
      </p>

      <div className="mb-4">
        <p className="text-xs font-medium text-gray-600 mb-2">Segmentation Mask</p>
        <div className="rounded-lg overflow-hidden border border-teal-200 bg-white">
          <img
            src={segmentation.mask}
            alt="Lung Segmentation"
            className="w-full h-auto"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        <div className="bg-white rounded-lg p-3 border border-teal-200">
          <p className="text-xs text-gray-600 font-medium">Coverage</p>
          <p className="text-lg font-bold text-teal-600">
            {metrics.coverage_percentage.toFixed(1)}%
          </p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-teal-200">
          <p className="text-xs text-gray-600 font-medium">Lungs Detected</p>
          <p className="text-lg font-bold text-teal-600">
            {metrics.num_lungs_detected}
          </p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-teal-200">
          <p className="text-xs text-gray-600 font-medium">Contrast</p>
          <p className="text-lg font-bold text-teal-600">
            {(metrics.contrast * 100).toFixed(1)}%
          </p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-teal-200">
          <p className="text-xs text-gray-600 font-medium">Lung Intensity</p>
          <p className="text-lg font-bold text-teal-600">
            {metrics.lung_intensity.toFixed(0)}
          </p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-teal-200">
          <p className="text-xs text-gray-600 font-medium">BG Intensity</p>
          <p className="text-lg font-bold text-teal-600">
            {metrics.background_intensity.toFixed(0)}
          </p>
        </div>

        <div className="bg-white rounded-lg p-3 border border-teal-200">
          <p className="text-xs text-gray-600 font-medium">Lung Pixels</p>
          <p className="text-lg font-bold text-teal-600">
            {(metrics.lung_pixels / 1000).toFixed(0)}K
          </p>
        </div>
      </div>

      <div className="mt-4 p-3 bg-teal-100 rounded-lg border border-teal-200">
        <p className="text-xs text-teal-800">
          ℹ️ Segmentation helps identify lung boundaries and assess consolidation patterns
        </p>
      </div>
    </div>
  );
}
