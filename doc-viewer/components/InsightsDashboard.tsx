"use client";

import { useState } from 'react';
import { DocumentInsight } from '@/app/page';
import { InsightCard } from './InsightCard';
import { DataVisualization } from './DataVisualization';
import { ExportTools } from './ExportTools';
import { Filter, BarChart3, FileText, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';

interface InsightsDashboardProps {
  insights: DocumentInsight[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onRemoveInsight: (insightId: string) => void;
}

export function InsightsDashboard({ insights, selectedCategory, onCategoryChange, onRemoveInsight }: InsightsDashboardProps) {
  const [activeTab, setActiveTab] = useState('insights');

  const categories = ['all', 'Resume', 'NDA', 'Annual Report', 'General'];
  
  const stats = {
    total: insights.length,
    avgConfidence: insights.reduce((acc, curr) => acc + curr.confidence, 0) / insights.length || 0,
    classifications: insights.reduce((acc, curr) => {
      acc[curr.classification] = (acc[curr.classification] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return (
    <div className="space-y-4 sm:space-y-6 lg:space-y-8">
      {/* Header with Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6"
      >
        <Card className="p-4 sm:p-5 lg:p-6">
          <div className="flex items-center space-x-3">
            <FileText className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500 flex-shrink-0" />
            <div>
              <p className="text-xl sm:text-2xl font-bold">{stats.total}</p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Documents Analyzed</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 sm:p-5 lg:p-6">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-xl sm:text-2xl font-bold">{Math.round(stats.avgConfidence)}%</p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Avg Confidence</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 sm:p-5 lg:p-6 sm:col-span-2 lg:col-span-1">
          <div className="flex items-center space-x-3">
            <Filter className="h-6 w-6 sm:h-8 sm:w-8 text-purple-500 flex-shrink-0" />
            <div>
              <p className="text-xl sm:text-2xl font-bold">{Object.keys(stats.classifications).length}</p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Categories Found</p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Controls */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-start sm:items-center justify-between"
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 w-full sm:w-auto">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4" />
            <span className="text-xs sm:text-sm font-medium">Filter by category:</span>
          </div>
          <Select value={selectedCategory} onValueChange={onCategoryChange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Documents' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full sm:w-auto">
          <ExportTools insights={insights} />
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 h-auto">
            <TabsTrigger value="insights">Document Insights</TabsTrigger>
            <TabsTrigger value="analytics">Analytics Dashboard</TabsTrigger>
          </TabsList>

          <TabsContent value="insights" className="space-y-4 sm:space-y-6 mt-4 sm:mt-6">
            {insights.length === 0 ? (
              <Card className="p-6 sm:p-8 text-center">
                <FileText className="h-10 w-10 sm:h-12 sm:w-12 text-slate-400 mx-auto mb-3 sm:mb-4" />
                <h3 className="text-base sm:text-lg font-medium mb-2">No documents analyzed yet</h3>
                <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400">
                  Upload some documents to see AI-powered insights here.
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                {insights.map((insight, index) => (
                  <motion.div
                    key={insight.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <InsightCard 
                      insight={insight} 
                      onRemove={onRemoveInsight}
                    />
                  </motion.div>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="analytics" className="mt-4 sm:mt-6">
            <DataVisualization insights={insights} />
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}