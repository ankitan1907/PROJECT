"use client";

import { DocumentInsight } from '@/app/page';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FileText, TrendingUp, AlertTriangle, Calendar, BarChart, Trash2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

interface InsightCardProps {
  insight: DocumentInsight;
  onRemove: (insightId: string) => void;
}

const getClassificationColor = (classification: string) => {
  switch (classification) {
    case 'Resume': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'NDA': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    case 'Annual Report': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

const formatFileSize = (bytes: number) => {
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
};

export function InsightCard({ insight, onRemove }: InsightCardProps) {
  const handleRemove = () => {
    toast.success(`Removed insights for ${insight.fileName}`);
    onRemove(insight.id);
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300 }}
      layout
    >
      <Card className="p-4 sm:p-6 space-y-3 sm:space-y-4 h-full hover:shadow-lg transition-shadow relative group">
        {/* Remove Button */}
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-950/20 z-10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        {/* Header */}
        <div className="flex items-start justify-between pr-8">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg">
              <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm sm:text-base lg:text-lg truncate">{insight.fileName}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {formatFileSize(insight.fileSize)} • {insight.fileType}
              </p>
            </div>
          </div>
        </div>
        
        {/* Classification Badge */}
        <div className="flex justify-end">
          <Badge className={`${getClassificationColor(insight.classification)} text-xs`}>
            {insight.classification}
          </Badge>
        </div>

        {/* Confidence Score */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-xs sm:text-sm font-medium">AI Confidence</span>
            <span className="text-xs sm:text-sm font-semibold">{insight.confidence}%</span>
          </div>
          <Progress value={insight.confidence} className="h-2" />
        </div>

        {/* Summary */}
        <div className="space-y-2">
          <h4 className="font-medium text-xs sm:text-sm">Summary</h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {insight.summary}
          </p>
        </div>

        {/* Key Points */}
        {insight.keyPoints.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500" />
              <h4 className="font-medium text-xs sm:text-sm">Key Points</h4>
            </div>
            <ul className="space-y-1">
              {insight.keyPoints.slice(0, 3).map((point, index) => (
                <li key={index} className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-start">
                  <span className="w-1 h-1 bg-green-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Risks */}
        {insight.risks.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-3 w-3 sm:h-4 sm:w-4 text-red-500" />
              <h4 className="font-medium text-xs sm:text-sm">Identified Risks</h4>
            </div>
            <ul className="space-y-1">
              {insight.risks.slice(0, 2).map((risk, index) => (
                <li key={index} className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-start">
                  <span className="w-1 h-1 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0" />
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Trends Preview */}
        {insight.trends.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <BarChart className="h-3 w-3 sm:h-4 sm:w-4 text-blue-500" />
              <h4 className="font-medium text-xs sm:text-sm">Key Metrics</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {insight.trends.slice(0, 2).map((trend, index) => (
                <div key={index} className="bg-slate-50 dark:bg-slate-800 rounded-lg p-2">
                  <p className="text-xs text-slate-600 dark:text-slate-400">{trend.label}</p>
                  <p className="text-xs sm:text-sm font-semibold">{trend.value}%</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="flex items-center justify-center pt-2 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Calendar className="h-3 w-3" />
            <span>Processed {insight.processedAt.toLocaleDateString()}</span>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}