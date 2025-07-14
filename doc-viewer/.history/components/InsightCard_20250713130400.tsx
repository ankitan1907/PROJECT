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
      whileHover={{ scale: 1.015 }}
      transition={{ type: "spring", stiffness: 250 }}
      layout
    >
      <Card className="p-4 sm:p-6 space-y-4 h-full hover:shadow-xl transition-shadow duration-300 relative group border border-slate-200 dark:border-slate-700">
        <Button
          variant="ghost"
          size="icon"
          onClick={handleRemove}
          className="absolute top-2 right-2 h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/30 z-10"
        >
          <Trash2 className="h-4 w-4" />
        </Button>

        <div className="flex items-start justify-between pr-8">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-md">
              <FileText className="h-4 w-4 text-white" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-sm sm:text-base lg:text-lg truncate">{insight.fileName}</h3>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                {formatFileSize(insight.fileSize)} • {insight.fileType}
              </p>
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <Badge className={`${getClassificationColor(insight.classification)} text-xs`}>
            {insight.classification}
          </Badge>
        </div>

        <div className="space-y-1">
          <div className="flex justify-between text-xs sm:text-sm font-medium">
            <span>AI Confidence</span>
            <span>{insight.confidence}%</span>
          </div>
          <Progress value={insight.confidence} className="h-2" />
        </div>

        <div className="space-y-1">
          <h4 className="text-sm font-medium">Summary</h4>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">{insight.summary}</p>
        </div>

        {insight.keyPoints.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <h4 className="text-sm font-medium">Key Points</h4>
            </div>
            <ul className="space-y-1 pl-2">
              {insight.keyPoints.slice(0, 3).map((point, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-start">
                  <span className="w-1 h-1 bg-green-500 rounded-full mt-2 mr-2" />
                  {point}
                </li>
              ))}
            </ul>
          </div>
        )}

        {insight.risks.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <h4 className="text-sm font-medium">Risks</h4>
            </div>
            <ul className="space-y-1 pl-2">
              {insight.risks.slice(0, 2).map((risk, idx) => (
                <li key={idx} className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 flex items-start">
                  <span className="w-1 h-1 bg-red-500 rounded-full mt-2 mr-2" />
                  {risk}
                </li>
              ))}
            </ul>
          </div>
        )}

        {insight.trends.length > 0 && (
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <BarChart className="h-4 w-4 text-blue-500" />
              <h4 className="text-sm font-medium">Metrics</h4>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {insight.trends.slice(0, 2).map((trend, index) => (
                <div key={index} className="bg-slate-100 dark:bg-slate-800 p-2 rounded-md">
                  <p className="text-xs text-slate-500">{trend.label}</p>
                  <p className="text-sm font-semibold">{trend.value}%</p>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-3 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-500">
          <Calendar className="inline h-3 w-3 mr-1" />
          Processed on {insight.processedAt.toLocaleDateString()}
        </div>
      </Card>
    </motion.div>
  );
}