"use client";

import { Card } from "@/components/ui/card";
import { PieChart, Pie, Cell, Tooltip, BarChart, Bar, XAxis, YAxis, LineChart, Line, ResponsiveContainer } from "recharts";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// Mock aggregated insights
const mockInsights = [
  { classification: "Resume", confidence: 87, trends: [{ label: "Growth", value: 12 }] },
  { classification: "NDA", confidence: 76, trends: [{ label: "Risk", value: 34 }] },
  { classification: "Annual Report", confidence: 92, trends: [{ label: "Revenue", value: 48 }] },
  { classification: "Resume", confidence: 66, trends: [{ label: "Growth", value: 9 }] },
  { classification: "General", confidence: 81, trends: [{ label: "Compliance", value: 27 }] },
];

const COLORS = ["#3b82f6", "#ef4444", "#10b981", "#6366f1"];

export default function ChartsPage() {
  const [classificationData, setClassificationData] = useState([]);
  const [trendData, setTrendData] = useState([]);
  const [confidenceData, setConfidenceData] = useState([]);

  useEffect(() => {
    const classifications = {};
    const trends = {};
    const confidence = [];

    mockInsights.forEach((insight, index) => {
      classifications[insight.classification] = (classifications[insight.classification] || 0) + 1;

      insight.trends.forEach((t) => {
        trends[t.label] = (trends[t.label] || 0) + t.value;
      });

      confidence.push({ index: index + 1, confidence: insight.confidence });
    });

    setClassificationData(
      Object.entries(classifications).map(([name, value]) => ({ name, value }))
    );

    setTrendData(
      Object.entries(trends).map(([label, value]) => ({ label, value }))
    );

    setConfidenceData(confidence);
  }, []);

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-semibold">📊 Document Analysis Dashboard</h2>

      <motion.div layout className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Classification Pie Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Document Types</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={classificationData}
                dataKey="value"
                nameKey="name"
                outerRadius={80}
                label
              >
                {classificationData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        {/* Trend Bar Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">Key Trends</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={trendData}>
              <XAxis dataKey="label" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Confidence Line Chart */}
        <Card className="p-4">
          <h3 className="text-lg font-semibold mb-2">AI Confidence Over Documents</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={confidenceData}>
              <XAxis dataKey="index" />
              <YAxis domain={[50, 100]} />
              <Tooltip />
              <Line type="monotone" dataKey="confidence" stroke="#10b981" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </Card>
      </motion.div>
    </div>
  );
}
