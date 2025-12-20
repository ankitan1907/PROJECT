import { AnalysisResponse } from "@/lib/api";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { TrendingUp, Activity, AlertCircle, CheckCircle2 } from "lucide-react";

interface StatisticsDashboardProps {
  analyses: AnalysisResponse[];
}

export function StatisticsDashboard({ analyses }: StatisticsDashboardProps) {
  if (!analyses || analyses.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No analysis data available yet. Upload some X-rays to see statistics.</p>
      </div>
    );
  }

  // Calculate statistics
  const total = analyses.length;
  const pneumoniaCases = analyses.filter(a => a.analysis.diagnosis === "PNEUMONIA").length;
  const normalCases = total - pneumoniaCases;
  const avgConfidence = analyses.reduce((sum, a) => sum + a.analysis.confidence, 0) / total;

  const severityDistribution = {
    NONE: analyses.filter(a => a.analysis.severity === "NONE").length,
    MILD: analyses.filter(a => a.analysis.severity === "MILD").length,
    MODERATE: analyses.filter(a => a.analysis.severity === "MODERATE").length,
    SEVERE: analyses.filter(a => a.analysis.severity === "SEVERE").length
  };

  // Timeline data - group by date
  const timelineData = [...analyses]
    .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
    .map(a => ({
      date: new Date(a.timestamp).toLocaleDateString(),
      confidence: parseFloat((a.analysis.confidence * 100).toFixed(1)),
    }));

  // FIXED: Model comparison data matches backend keys: resnet50, densenet, efficientnet
  const modelComparison = [
    {
      name: "ResNet50",
      avgScore: (analyses.reduce((sum, a) => sum + (a.model_scores?.resnet50 || 0), 0) / total * 100).toFixed(1)
    },
    {
      name: "DenseNet",
      avgScore: (analyses.reduce((sum, a) => sum + (a.model_scores?.densenet || 0), 0) / total * 100).toFixed(1)
    },
    {
      name: "EfficientNet",
      avgScore: (analyses.reduce((sum, a) => sum + (a.model_scores?.efficientnet || 0), 0) / total * 100).toFixed(1)
    }
  ];

  const diagnosisPieData = [
    { name: "Pneumonia", value: pneumoniaCases, color: "#EF4444" },
    { name: "Normal", value: normalCases, color: "#10B981" }
  ];

  const severityChartData = [
    { name: "None", value: severityDistribution.NONE, color: "#10B981" },
    { name: "Mild", value: severityDistribution.MILD, color: "#FBBF24" },
    { name: "Moderate", value: severityDistribution.MODERATE, color: "#F97316" },
    { name: "Severe", value: severityDistribution.SEVERE, color: "#EF4444" }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-500">Total Analyses</h3>
            <Activity className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{total}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-500">Pneumonia Cases</h3>
            <AlertCircle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-3xl font-bold text-red-600">{pneumoniaCases}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-500">Normal Cases</h3>
            <CheckCircle2 className="w-5 h-5 text-green-500" />
          </div>
          <p className="text-3xl font-bold text-green-600">{normalCases}</p>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-gray-500">Avg Confidence</h3>
            <TrendingUp className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-3xl font-bold text-purple-600">{(avgConfidence * 100).toFixed(1)}%</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Diagnosis Distribution</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={diagnosisPieData}
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {diagnosisPieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h3 className="text-lg font-bold text-gray-900 mb-6">Model Performance (%)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={modelComparison}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" />
              <YAxis domain={[0, 100]} />
              <Tooltip cursor={{fill: '#f3f4f6'}} />
              <Bar dataKey="avgScore" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}