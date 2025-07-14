"use client";

import { useState } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import { DocumentUpload } from '@/components/DocumentUpload';
import { InsightsDashboard } from '@/components/InsightsDashboard';
import { Header } from '@/components/Header';
import { ProcessingLoader } from '@/components/ProcessingLoader';
import { motion } from 'framer-motion';

export interface DocumentInsight {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  classification: 'Resume' | 'NDA' | 'Annual Report' | 'General';
  confidence: number;
  summary: string;
  keyPoints: string[];
  risks: string[];
  trends: Array<{ label: string; value: number; change: number }>;
  financials?: Array<{ metric: string; value: string; change: number }>;
  processedAt: Date;
}

export default function Home() {
  const [insights, setInsights] = useState<DocumentInsight[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const handleDocumentsProcessed = (newInsights: DocumentInsight[]) => {
    setInsights(prev => [...prev, ...newInsights]);
    setIsProcessing(false);
  };

  const handleProcessingStart = () => {
    setIsProcessing(true);
  };

  const handleRemoveInsight = (insightId: string) => {
    setInsights(prev => prev.filter(insight => insight.id !== insightId));
  };

  const filteredInsights = insights.filter(insight => 
    selectedCategory === 'all' || insight.classification === selectedCategory
  );

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-950 dark:via-blue-950 dark:to-indigo-950 transition-colors duration-500">
        <Header />
        
        <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 space-y-6 sm:space-y-8 lg:space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3 sm:space-y-4 lg:space-y-6"
          >
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent leading-tight">
              Document Intelligence
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-300 max-w-3xl mx-auto px-4">
              Advanced AI-powered document analysis and insights platform for enterprise consulting
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <DocumentUpload 
              onDocumentsProcessed={handleDocumentsProcessed}
              onProcessingStart={handleProcessingStart}
            />
          </motion.div>

          {isProcessing && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <ProcessingLoader />
            </motion.div>
          )}

          {insights.length > 0 && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <InsightsDashboard 
                insights={filteredInsights}
                selectedCategory={selectedCategory}
                onCategoryChange={setSelectedCategory}
                onRemoveInsight={handleRemoveInsight}
              />
            </motion.div>
          )}
        </main>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: 'hsl(var(--background))',
              color: 'hsl(var(--foreground))',
              border: '1px solid hsl(var(--border))',
            },
          }}
        />
      </div>
    </ThemeProvider>
  );
}