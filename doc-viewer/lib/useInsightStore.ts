"use client";

import { create } from 'zustand';

export interface DocumentInsight {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  classification: string;
  summary: string;
  confidence: number;
  keyPoints: string[];
  risks: string[];
  trends: { label: string; value: number }[];
  processedAt: Date;
}

interface InsightStore {
  insights: DocumentInsight[];
  setInsights: (newInsights: DocumentInsight[]) => void;
  clearInsights: () => void;
}

export const useInsightStore = create<InsightStore>((set) => ({
  insights: [],
  setInsights: (newInsights) => set((state) => ({
    insights: [...state.insights, ...newInsights]
  })),
  clearInsights: () => set({ insights: [] })
}));
