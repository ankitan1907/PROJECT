import { MultiLayerActivation } from "@/lib/api";
import { Layers } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

interface ActivationMapsViewerProps {
  activations: Record<string, MultiLayerActivation>;
}

export function ActivationMapsViewer({ activations }: ActivationMapsViewerProps) {
  const [selectedLayer, setSelectedLayer] = useState(Object.keys(activations)[0]);

  if (!activations || Object.keys(activations).length === 0) {
    return null;
  }

  const layers = Object.entries(activations);
  const currentLayer = activations[selectedLayer];

  return (
    <div className="rounded-lg border-2 border-blue-200 bg-blue-50 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Layers className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold text-blue-900">
          Neural Network Layer Activations
        </h3>
      </div>

      <p className="text-sm text-blue-700 mb-4">
        Visualization of feature maps from different layers of the neural network
      </p>

      <div className="mb-4">
        <p className="text-xs font-medium text-gray-600 mb-2">Select Layer</p>
        <div className="flex flex-wrap gap-2">
          {layers.map(([layerName]) => (
            <button
              key={layerName}
              onClick={() => setSelectedLayer(layerName)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-medium transition-colors",
                selectedLayer === layerName
                  ? "bg-blue-600 text-white"
                  : "bg-white border border-blue-200 text-blue-600 hover:bg-blue-100"
              )}
            >
              {layerName.replace(/_/g, " ")}
            </button>
          ))}
        </div>
      </div>

      {currentLayer && (
        <>
          <div className="mb-4">
            <p className="text-xs font-medium text-gray-600 mb-2">
              Activation Visualization
            </p>
            <div className="rounded-lg overflow-hidden border border-blue-200 bg-white">
              <img
                src={currentLayer.visualization}
                alt={`Layer: ${selectedLayer}`}
                className="w-full h-auto"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-gray-600 font-medium mb-1">
                Number of Features
              </p>
              <p className="text-2xl font-bold text-blue-600">
                {currentLayer.num_features}
              </p>
            </div>

            <div className="bg-white rounded-lg p-3 border border-blue-200">
              <p className="text-xs text-gray-600 font-medium mb-1">
                Top Channels
              </p>
              <p className="text-sm text-blue-600">
                {currentLayer.top_channels.slice(0, 5).join(", ")}
              </p>
            </div>
          </div>

          <div className="p-3 bg-blue-100 rounded-lg border border-blue-200">
            <p className="text-xs text-blue-800">
              <span className="font-semibold">Layer:</span> {selectedLayer}
            </p>
            <p className="text-xs text-blue-700 mt-1">
              ℹ️ Each layer extracts different features. Early layers detect edges,
              middle layers detect textures, later layers detect complex patterns.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
