"use client";

import { useInsightStore } from "@/lib/useInsightStore";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const COLORS = ["#6366F1", "#10B981", "#EF4444", "#F59E0B", "#8B5CF6"];

export default function ChartsPage() {
  const { insights } = useInsightStore();

  if (insights.length === 0) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center text-center px-4">
        <h1 className="text-2xl font-semibold mb-2">📉 No Data to Show</h1>
        <p className="text-sm text-gray-500 mb-4">Upload and process documents first.</p>
        <Link href="/" passHref>
          <Button variant="outline">← Go Back to Upload</Button>
        </Link>
      </div>
    );
  }

  // Classification count
  const classificationCounts = insights.reduce((acc, curr) => {
    acc[curr.classification] = (acc[curr.classification] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const classificationData = Object.entries(classificationCounts).map(([name, value]) => ({
    name,
    value,
  }));

  // Average confidence
  const avgConfidence =
    insights.reduce((sum, curr) => sum + curr.confidence, 0) / insights.length;

  return (
    <main className="p-6 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-xl font-semibold">📊 Document Analysis Dashboard</h1>
        <Link href="/" passHref>
          <Button variant="outline">← Back</Button>
        </Link>
      </div>

      {/* Chart: Document Types */}
      <Card className="p-6">
        <h2 className="text-lg font-medium mb-4">📄 Document Classification</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={classificationData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {classificationData.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Legend />
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </Card>

      {/* Chart: AI Confidence */}
      <Card className="p-6">
        <h2 className="text-lg font-medium mb-4">🤖 Average AI Confidence</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={[{ name: "Confidence", value: Number(avgConfidence.toFixed(2)) }]}
          >
            <XAxis dataKey="name" />
            <YAxis domain={[0, 100]} />
            <Tooltip />
            <Bar dataKey="value" fill="#6366F1" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-sm text-gray-500 mt-2 text-center">
          Across {insights.length} processed documents
        </p>
      </Card>
    </main>
  );
}
