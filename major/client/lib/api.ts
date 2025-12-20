const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export interface ModelScore {
  svm: number;
  rf: number;
  lr: number;
}

export interface ModelWeights {
  svm: number;
  rf: number;
  lr: number;
}

export interface SegmentationMetrics {
  coverage_percentage: number;
  lung_pixels: number;
  lung_intensity: number;
  background_intensity: number;
  contrast: number;
  num_lungs_detected: number;
}
// ... existing interfaces and code above ...

export async function deleteAnalysis(id: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE_URL}/api/history/${id}`, {
      method: 'DELETE',
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("Delete failed:", error.detail);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error("Network error during deletion:", error);
    return false;
  }
}

export interface PreprocessingStats {
  original: {
    mean: number;
    std: number;
    min: number;
    max: number;
    contrast: number;
    brightness: number;
    entropy: number;
  };
  normalized: {
    mean: number;
    std: number;
    min: number;
    max: number;
    contrast: number;
    brightness: number;
    entropy: number;
  };
  enhanced: {
    mean: number;
    std: number;
    min: number;
    max: number;
    contrast: number;
    brightness: number;
    entropy: number;
  };
}

export interface HeatmapData {
  heatmap: string;
  overlay: string;
  intensity: number;
}

export interface SegmentationData {
  mask: string;
  metrics: SegmentationMetrics;
}

export interface MultiLayerActivation {
  visualization: string;
  num_features: number;
  top_channels: number[];
}

export interface AnalysisResponse {
  status: string;
  timestamp: string;
  filename: string;
  analysis: {
    diagnosis: "PNEUMONIA" | "NORMAL" | "UNCERTAIN";
    confidence: number;
    severity: "NONE" | "MILD" | "MODERATE" | "SEVERE";
    risk_factors: string[];
    recommendations: string[];
    risk_level: string;
  };
  model_scores: ModelScore;
  model_weights: ModelWeights;
  ensemble_score: number;
  threshold_used: number;
  segmentation?: {
    metrics: SegmentationMetrics;
    overlay?: string;
  };
  heatmap: HeatmapData | null;
  multi_layer_activations: Record<string, MultiLayerActivation> | null;
}

export interface DiagnosisResult {
  diagnosis: "PNEUMONIA" | "NORMAL" | "UNCERTAIN";
  confidence: number;
  severity: "NONE" | "MILD" | "MODERATE" | "SEVERE";
  risk_factors: string[];
  recommendations: string[];
  model_scores: ModelScore;
  ensemble_score: number;
  detectionTimestamp: Date;
  risk_level: string;
  threshold_used: number;
}

export async function analyzeImage(file: File): Promise<AnalysisResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/analyze`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || "Analysis failed");
  }

  return response.json();
}

export async function healthCheck(): Promise<boolean> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${API_BASE_URL}/api/health`, {
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response.ok;
  } catch {
    clearTimeout(timeoutId);
    return false;
  }
}

export async function getModelInfo() {
  const response = await fetch(`${API_BASE_URL}/api/model-info`);
  return response.json();
}

export async function getPreprocessingInfo(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/api/preprocess-info`, {
    method: "POST",
    body: formData,
  });

  return response.json();
}

export function mapToDiagnosisResult(analysis: AnalysisResponse): DiagnosisResult {
  return {
    diagnosis: analysis.analysis.diagnosis,
    confidence: analysis.analysis.confidence,
    severity: analysis.analysis.severity,
    risk_factors: analysis.analysis.risk_factors,
    recommendations: analysis.analysis.recommendations,
    model_scores: analysis.model_scores,
    ensemble_score: analysis.ensemble_score,
    detectionTimestamp: new Date(analysis.timestamp || Date.now()),
    risk_level: analysis.analysis.risk_level,
    threshold_used: analysis.threshold_used,
  };
}