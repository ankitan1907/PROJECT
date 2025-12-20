import { useState, useEffect } from "react";
import { UploadZone } from "@/components/UploadZone";
import { ProcessingAnimation } from "@/components/ProcessingAnimation";
import { HistoryList } from "@/components/HistoryList";
import { HeatmapViewer } from "@/components/HeatmapViewer";
import { LungSegmentationViewer } from "@/components/LungSegmentationViewer";
import { ActivationMapsViewer } from "@/components/ActivationMapsViewer";
import { PreprocessingStatsViewer } from "@/components/PreprocessingStats";
import { EnsembleScores } from "@/components/EnsembleScores";
import { StatisticsDashboard } from "@/components/StatisticsDashboard";
import { InteractiveGallery } from "@/components/InteractiveGallery";
import { ResultsCard } from "@/components/ResultsCard";

import {
  analyzeImage,
  AnalysisResponse,
  healthCheck,
  mapToDiagnosisResult,
  DiagnosisResult,
} from "@/lib/api";
import { DEMO_ANALYSES } from "@/lib/demo-data";

import {
  Stethoscope,
  TrendingUp,
  Heart,
  Download,
  AlertTriangle,
  BarChart3,
  Grid3x3,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface AnalysisHistory {
  id: string;
  imageName: string;
  analysis: AnalysisResponse;
}

type ViewMode = "home" | "results" | "gallery" | "statistics";

export default function Index() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [diagnosisResult, setDiagnosisResult] =
    useState<DiagnosisResult | null>(null);
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [selectedHistoryItem, setSelectedHistoryItem] =
    useState<AnalysisHistory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [backendAvailable, setBackendAvailable] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("home");
  const [showDemoMode, setShowDemoMode] = useState(false);

  // Backend check + local history
  useEffect(() => {
    const checkBackend = async () => {
      try {
        const available = await healthCheck();
        setBackendAvailable(available);
        if (!available) setShowDemoMode(true);
      } catch {
        setBackendAvailable(false);
        setShowDemoMode(true);
      }
    };
    checkBackend();

    const saved = localStorage.getItem("pneumoniaAnalysisHistory");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        setHistory([]);
      }
    }
  }, []);

  useEffect(() => {
    if (viewMode === "results") {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [viewMode]);

  const updateHistory = (h: AnalysisHistory[]) => {
    setHistory(h);
    localStorage.setItem("pneumoniaAnalysisHistory", JSON.stringify(h));
  };

  const handleRemove = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    updateHistory(updated);
    if (selectedHistoryItem?.id === id) handleNewAnalysis();
  };

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setIsAnalyzing(true);
    setAnalysis(null);
    setDiagnosisResult(null);
    setViewMode("results");
    setError(null);

    try {
      if (!backendAvailable) {
        throw new Error("Backend unavailable. Demo mode active.");
      }

      const result = await analyzeImage(file);
      const diagnosis = mapToDiagnosisResult(result);

      setAnalysis(result);
      setDiagnosisResult(diagnosis);

      updateHistory([
        {
          id: `${Date.now()}-${Math.random()}`,
          imageName: file.name,
          analysis: result,
        },
        ...history,
      ]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
      setShowDemoMode(true);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleLoadDemoAnalysis = (demo: AnalysisResponse) => {
    setAnalysis(demo);
    setDiagnosisResult(mapToDiagnosisResult(demo));
    setViewMode("results");

    updateHistory([
      {
        id: `demo-${Date.now()}`,
        imageName: demo.filename,
        analysis: demo,
      },
      ...history,
    ]);
  };

  const handleSelectHistory = (item: AnalysisHistory) => {
    setSelectedHistoryItem(item);
    setAnalysis(item.analysis);
    setDiagnosisResult(mapToDiagnosisResult(item.analysis));
    setViewMode("results");
  };

  const handleNewAnalysis = () => {
    setAnalysis(null);
    setDiagnosisResult(null);
    setSelectedFile(null);
    setSelectedHistoryItem(null);
    setViewMode("home");
    setError(null);
  };

  const handleDownloadPDF = async () => {
    if (!diagnosisResult || !analysis) return;
    const { generatePDFReport, downloadPDF } = await import(
      "@/lib/pdf-generator"
    );

    const blob = await generatePDFReport(diagnosisResult, {
      hospitalName: "AI Pneumonia Detection System",
      doctorName: "ML Analysis Engine",
      patientAge: "Unknown",
      riskScore: analysis.analysis.confidence * 100,
    });

    downloadPDF(blob, `pneumonia-report-${Date.now()}.pdf`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-medical-light">
      <main className="max-w-7xl mx-auto px-4 py-10">
        {error && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 mt-1" />
            <div className="text-sm text-amber-800">{error}</div>
          </div>
        )}

        {/* NAV */}
        {(analysis || history.length > 0) && (
          <div className="mb-8 flex gap-2 border-b">
            <button
              onClick={() => setViewMode("results")}
              disabled={!analysis}
              className={cn(
                "px-6 py-3 font-bold",
                viewMode === "results"
                  ? "border-b-4 border-medical-blue"
                  : "text-gray-400"
              )}
            >
              Current Analysis
            </button>
            <button
              onClick={() => setViewMode("gallery")}
              className={cn(
                "px-6 py-3 font-bold flex items-center gap-2",
                viewMode === "gallery"
                  ? "border-b-4 border-medical-blue"
                  : "text-gray-400"
              )}
            >
              <Grid3x3 className="w-4 h-4" /> Gallery
            </button>
            <button
              onClick={() => setViewMode("statistics")}
              className={cn(
                "px-6 py-3 font-bold flex items-center gap-2",
                viewMode === "statistics"
                  ? "border-b-4 border-green-600"
                  : "text-gray-400"
              )}
            >
              <BarChart3 className="w-4 h-4" /> Stats
            </button>
          </div>
        )}

        {/* VIEWS */}
        {isAnalyzing && !analysis ? (
          <ProcessingAnimation />
        ) : viewMode === "results" && analysis ? (
          <div className="space-y-10">
            <ResultsCard
              result={diagnosisResult!}
              onDownloadPDF={handleDownloadPDF}
              imageName={selectedFile?.name || analysis.filename}
            />

            {analysis.heatmap && <HeatmapViewer heatmap={analysis.heatmap} />}
            {analysis.segmentation && (
              <LungSegmentationViewer
                segmentation={analysis.segmentation}
              />
            )}
            {analysis.model_scores && (
              <EnsembleScores
                scores={analysis.model_scores}
                ensembleScore={analysis.analysis.confidence}
              />
            )}
            {analysis.multi_layer_activations && (
              <ActivationMapsViewer
                activations={analysis.multi_layer_activations}
              />
            )}
            {analysis.preprocessing && (
              <PreprocessingStatsViewer stats={analysis.preprocessing} />
            )}
          </div>
        ) : viewMode === "gallery" ? (
          <InteractiveGallery
            analyses={history.map((h) => h.analysis)}
            onSelectAnalysis={(a) => {
              setAnalysis(a);
              setDiagnosisResult(mapToDiagnosisResult(a));
              setViewMode("results");
            }}
          />
        ) : viewMode === "statistics" ? (
          <StatisticsDashboard analyses={history.map((h) => h.analysis)} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2 space-y-10">
              <UploadZone
                onFileSelect={handleFileSelect}
                disabled={isAnalyzing}
                loading={isAnalyzing}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[
                  {
                    icon: TrendingUp,
                    title: "Ensemble Learning",
                    desc: "Multiple ML models vote together.",
                  },
                  {
                    icon: Stethoscope,
                    title: "Explainable AI",
                    desc: "Grad-CAM & attention heatmaps.",
                  },
                  {
                    icon: Heart,
                    title: "Lung Segmentation",
                    desc: "Precise lung isolation.",
                  },
                  {
                    icon: Zap,
                    title: "Fast Inference",
                    desc: "Optimized preprocessing pipeline.",
                  },
                ].map((f, i) => (
                  <div
                    key={i}
                    className="p-6 bg-white rounded-2xl shadow-sm"
                  >
                    <f.icon className="w-6 h-6 text-medical-blue" />
                    <h4 className="mt-3 font-bold">{f.title}</h4>
                    <p className="text-sm text-gray-500">{f.desc}</p>
                  </div>
                ))}
              </div>

              {showDemoMode && (
                <div className="bg-blue-900 text-white p-8 rounded-3xl">
                  <h3 className="font-bold text-xl mb-4">
                    Demo Case Gallery
                  </h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    {DEMO_ANALYSES.map((d, i) => (
                      <button
                        key={i}
                        onClick={() => handleLoadDemoAnalysis(d)}
                        className="bg-white/10 p-4 rounded-xl text-left"
                      >
                        {d.filename}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {history.length > 0 && (
              <HistoryList
                history={history}
                onSelect={handleSelectHistory}
                onRemove={handleRemove}
                loading={false}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
