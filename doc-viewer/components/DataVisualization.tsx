"use client";

import { DocumentInsight } from '@/app/page';
import { Card } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer } from 'recharts';
import { motion } from 'framer-motion';

interface DataVisualizationProps {
  insights: DocumentInsight[];
}

const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export function DataVisualization({ insights }: DataVisualizationProps) {
  if (insights.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-slate-600 dark:text-slate-400">
          No data available for visualization. Upload and process some documents first.
        </p>
      </Card>
    );
  }

  // Classification distribution
  const classificationData = Object.entries(
    insights.reduce((acc, insight) => {
      acc[insight.classification] = (acc[insight.classification] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  // Confidence distribution
  const confidenceData = insights.map((insight, index) => ({
    name: `Doc ${index + 1}`,
    confidence: insight.confidence,
    classification: insight.classification
  }));

  // Trends aggregation
  const trendsData = insights.reduce((acc, insight) => {
    insight.trends.forEach(trend => {
      const existing = acc.find(item => item.metric === trend.label);
      if (existing) {
        existing.value += trend.value;
        existing.count += 1;
      } else {
        acc.push({ metric: trend.label, value: trend.value, count: 1 });
      }
    });
    return acc;
  }, [] as Array<{ metric: string; value: number; count: number }>)
  .map(item => ({ metric: item.metric, avgValue: Math.round(item.value / item.count) }));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
      {/* Classification Distribution */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Document Classification</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={classificationData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={70}
                fill="#8884d8"
                dataKey="value"
              >
                {classificationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Confidence Scores */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">AI Confidence Scores</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={confidenceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" fontSize={12} />
              <YAxis />
              <Tooltip 
                formatter={(value, name, props) => [
                  `${value}%`, 
                  `Confidence (${props.payload.classification})`
                ]}
              />
              <Bar dataKey="confidence" fill="#3B82F6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>

      {/* Trends Analysis */}
      {trendsData.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2"
        >
          <Card className="p-4 sm:p-6">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Key Metrics Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={trendsData} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="metric" type="category" width={100} fontSize={12} />
                <Tooltip formatter={(value) => [`${value}%`, 'Average Value']} />
                <Bar dataKey="avgValue" fill="#10B981" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </motion.div>
      )}

      {/* Summary Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="lg:col-span-2"
      >
        <Card className="p-4 sm:p-6">
          <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">Analytics Summary</h3>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            <div className="text-center p-3 sm:p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <p className="text-xl sm:text-2xl font-bold text-blue-600">{insights.length}</p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Total Documents</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-green-50 dark:bg-green-950/20 rounded-lg">
              <p className="text-xl sm:text-2xl font-bold text-green-600">
                {Math.round(insights.reduce((acc, curr) => acc + curr.confidence, 0) / insights.length)}%
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Avg Confidence</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
              <p className="text-xl sm:text-2xl font-bold text-purple-600">
                {Object.keys(insights.reduce((acc, curr) => ({ ...acc, [curr.classification]: true }), {})).length}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Categories</p>
            </div>
            <div className="text-center p-3 sm:p-4 bg-orange-50 dark:bg-orange-950/20 rounded-lg">
              <p className="text-xl sm:text-2xl font-bold text-orange-600">
                {insights.reduce((acc, curr) => acc + curr.risks.length, 0)}
              </p>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">Total Risks</p>
            </div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}