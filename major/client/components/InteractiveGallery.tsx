import { useState } from "react";
import { AnalysisResponse } from "@/lib/api";
import { ChevronLeft, ChevronRight, Calendar, Zap, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface InteractiveGalleryProps {
  analyses: AnalysisResponse[];
  onSelectAnalysis: (analysis: AnalysisResponse) => void;
}

export function InteractiveGallery({ analyses, onSelectAnalysis }: InteractiveGalleryProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState<"all" | "pneumonia" | "normal">("all");

  const filteredAnalyses = analyses.filter(a => {
    if (selectedCategory === "all") return true;
    if (selectedCategory === "pneumonia") return a.analysis.diagnosis === "PNEUMONIA";
    return a.analysis.diagnosis === "NORMAL";
  });

  const sortedAnalyses = [...filteredAnalyses].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  if (sortedAnalyses.length === 0) {
    return (
      <div className="bg-white rounded-lg p-8 text-center text-gray-500">
        <p>No analyses in this category yet.</p>
      </div>
    );
  }

  const current = sortedAnalyses[currentIndex];

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % sortedAnalyses.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + sortedAnalyses.length) % sortedAnalyses.length);
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden">
      {/* Filter Tabs */}
      <div className="flex border-b">
        {["all", "pneumonia", "normal"].map((category) => (
          <button
            key={category}
            onClick={() => {
              setSelectedCategory(category as typeof selectedCategory);
              setCurrentIndex(0);
            }}
            className={cn(
              "flex-1 py-3 px-4 font-semibold transition-colors text-sm md:text-base",
              selectedCategory === category
                ? "bg-medical-blue text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
          >
            {category === "all" && `All (${sortedAnalyses.length})`}
            {category === "pneumonia" && `Pneumonia (${sortedAnalyses.filter(a => a.analysis.diagnosis === "PNEUMONIA").length})`}
            {category === "normal" && `Normal (${sortedAnalyses.filter(a => a.analysis.diagnosis === "NORMAL").length})`}
          </button>
        ))}
      </div>

      {/* Main Gallery View */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Slide Display */}
          <div className="lg:col-span-2">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg p-8 min-h-96 flex flex-col justify-between">
              {/* Main Content */}
              <div className="space-y-6">
                {/* Diagnosis Header */}
                <div className={cn(
                  "rounded-lg p-6 text-white",
                  current.analysis.diagnosis === "PNEUMONIA"
                    ? "bg-red-500"
                    : "bg-green-500"
                )}>
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold opacity-90">Diagnosis</h3>
                      <p className="text-3xl font-bold mt-2">{current.analysis.diagnosis}</p>
                    </div>
                    {current.analysis.diagnosis === "PNEUMONIA" ? (
                      <AlertTriangle className="w-12 h-12 opacity-70" />
                    ) : (
                      <CheckCircle2 className="w-12 h-12 opacity-70" />
                    )}
                  </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                    <p className="text-xs text-gray-600 font-semibold uppercase">Confidence</p>
                    <p className="text-2xl font-bold text-medical-blue mt-2">
                      {(current.analysis.confidence * 100).toFixed(1)}%
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                    <p className="text-xs text-gray-600 font-semibold uppercase">Severity</p>
                    <p className="text-lg font-bold text-purple-600 mt-2">
                      {current.analysis.severity}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-4 border-2 border-teal-200">
                    <p className="text-xs text-gray-600 font-semibold uppercase">Models Agree</p>
                    <div className="mt-2 flex gap-1 text-xs">
                      {Object.values(current.model_scores).length > 0 && (
                        <Zap className="w-4 h-4 text-yellow-500" />
                      )}
                      <span className="font-bold text-teal-600">Strong</span>
                    </div>
                  </div>
                </div>

                {/* Risk Factors Preview */}
                <div className="bg-white rounded-lg p-4 border-l-4 border-medical-blue">
                  <p className="text-sm font-semibold text-gray-900 mb-3">Key Findings</p>
                  <ul className="space-y-2">
                    {current.analysis.risk_factors.slice(0, 3).map((factor, idx) => (
                      <li key={idx} className="text-sm text-gray-700 flex gap-2">
                        <span className="font-bold text-medical-blue flex-shrink-0">•</span>
                        <span>{factor}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Slide Info */}
              <div className="flex items-center justify-between text-xs text-gray-600 mt-4 pt-4 border-t">
                <span>{currentIndex + 1} of {sortedAnalyses.length}</span>
                <span className="flex items-center gap-1">
                  <Calendar className="w-3 h-3" />
                  {new Date(current.timestamp).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={prevSlide}
                className="p-2 bg-medical-blue text-white rounded-lg hover:bg-medical-dark transition-colors"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <div className="flex gap-2 flex-wrap justify-center flex-1 mx-4">
                {sortedAnalyses.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      idx === currentIndex
                        ? "bg-medical-blue w-8"
                        : "bg-gray-300 hover:bg-gray-400"
                    )}
                  />
                ))}
              </div>

              <button
                onClick={nextSlide}
                className="p-2 bg-medical-blue text-white rounded-lg hover:bg-medical-dark transition-colors"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>

          {/* Thumbnail Strip */}
          <div className="lg:col-span-1">
            <h4 className="font-bold text-gray-900 mb-4">Recent Cases</h4>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {sortedAnalyses.map((analysis, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setCurrentIndex(idx);
                    onSelectAnalysis(analysis);
                  }}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border-2 transition-all hover:shadow-md",
                    idx === currentIndex
                      ? "border-medical-blue bg-blue-50"
                      : "border-gray-200 hover:border-medical-blue/50"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0 mt-1.5",
                      analysis.analysis.diagnosis === "PNEUMONIA" ? "bg-red-500" : "bg-green-500"
                    )} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">
                        {analysis.filename.split("/").pop()}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {new Date(analysis.timestamp).toLocaleDateString()}
                      </p>
                      <p className={cn(
                        "text-xs font-bold mt-1",
                        analysis.analysis.diagnosis === "PNEUMONIA" ? "text-red-600" : "text-green-600"
                      )}>
                        {analysis.analysis.diagnosis}
                      </p>
                      <p className="text-xs text-gray-600 mt-1">
                        {(analysis.analysis.confidence * 100).toFixed(0)}% confidence
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
