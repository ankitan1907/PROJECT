export function ProcessingAnimation() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <div className="relative w-24 h-24 mb-6">
        <div
          className="absolute inset-0 border-4 border-medical-light rounded-full"
          style={{
            animation: "pulse-ring 2s infinite",
          }}
        />
        <div className="absolute inset-2 flex items-center justify-center">
          <div className="flex gap-1">
            <div
              className="w-2 h-2 bg-medical-blue rounded-full"
              style={{
                animation: "processing-dots 1.4s infinite 0s",
              }}
            />
            <div
              className="w-2 h-2 bg-medical-blue rounded-full"
              style={{
                animation: "processing-dots 1.4s infinite 0.2s",
              }}
            />
            <div
              className="w-2 h-2 bg-medical-blue rounded-full"
              style={{
                animation: "processing-dots 1.4s infinite 0.4s",
              }}
            />
          </div>
        </div>
      </div>
      <h3 className="text-lg font-semibold text-medical-blue mb-2">
        Analyzing X-ray...
      </h3>
      <p className="text-sm text-gray-500 text-center max-w-xs">
        Our system is processing your image. This usually takes a few seconds.
      </p>
    </div>
  );
}
