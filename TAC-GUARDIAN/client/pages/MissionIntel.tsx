import { Navigation } from "@/components/Navigation";
import { useState } from "react";
import { Download, FileText, AlertTriangle, Clock, TrendingUp, Users, Target, Zap } from "lucide-react";

// Mock mission data
const missionData = {
  missionId: "GUARDIAN-7-2024-001",
  duration: "04:23:17",
  status: "COMPLETED",
  outcome: "SUCCESS",
  casualties: 0,
  objectives: { completed: 8, total: 10 },
  efficiency: 87,
  threatLevel: { avg: 42, peak: 78 },
  personnelInvolved: 12,
  equipmentFailures: 2
};

const stressData = [
  { time: "00:00", stress: 25, hr: 78 },
  { time: "01:00", stress: 35, hr: 85 },
  { time: "02:00", stress: 65, hr: 112 },
  { time: "02:30", stress: 89, hr: 145 },
  { time: "03:00", stress: 75, hr: 128 },
  { time: "04:00", stress: 45, hr: 92 },
  { time: "04:23", stress: 30, hr: 82 }
];

const threatEvents = [
  { time: "02:15", event: "Hostile contact", severity: "HIGH", location: "Sector 7-A", resolved: true },
  { time: "02:32", event: "Equipment malfunction", severity: "MEDIUM", location: "Sector 5-B", resolved: true },
  { time: "03:45", event: "Communication jam", severity: "LOW", location: "Sector 9-D", resolved: true },
  { time: "04:12", event: "Civilian spotted", severity: "LOW", location: "Sector 3-C", resolved: true }
];

const equipmentStatus = [
  { item: "Comm Array", status: "OPERATIONAL", uptime: "100%" },
  { item: "GPS System", status: "DEGRADED", uptime: "78%" },
  { item: "Thermal Optics", status: "FAILED", uptime: "45%" },
  { item: "Weapon Systems", status: "OPERATIONAL", uptime: "98%" },
  { item: "Medical Kit", status: "OPERATIONAL", uptime: "100%" },
  { item: "Power Supply", status: "OPERATIONAL", uptime: "92%" }
];

const recommendations = [
  "Replace thermal optics unit before next deployment",
  "Additional communication redundancy needed in sector 5",
  "Consider stress management protocol for extended missions",
  "GPS backup system performed excellently during primary failure"
];

export default function MissionIntel() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const [exportFormat, setExportFormat] = useState("PDF");

  const handleExportReport = () => {
    // Simulate export with animation
    const button = document.getElementById("export-btn");
    if (button) {
      button.classList.add("animate-pulse");
      setTimeout(() => {
        button.classList.remove("animate-pulse");
        // Show success message
        alert(`Mission report exported as ${exportFormat}`);
      }, 1000);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: Target },
    { id: "stress", label: "Stress Analysis", icon: TrendingUp },
    { id: "threats", label: "Threat Timeline", icon: AlertTriangle },
    { id: "equipment", label: "Equipment", icon: Zap }
  ];

  const renderOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="glass-panel rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <Clock className="w-8 h-8 text-cyborg-teal" />
          <span className="text-2xl font-bold text-cyborg-teal">{missionData.duration}</span>
        </div>
        <h3 className="text-lg font-semibold text-white">Mission Duration</h3>
        <p className="text-gray-400 text-sm">Total operational time</p>
      </div>

      <div className="glass-panel rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <Target className="w-8 h-8 text-neon-amber" />
          <span className="text-2xl font-bold text-neon-amber">{missionData.objectives.completed}/{missionData.objectives.total}</span>
        </div>
        <h3 className="text-lg font-semibold text-white">Objectives</h3>
        <p className="text-gray-400 text-sm">Completed successfully</p>
      </div>

      <div className="glass-panel rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <Users className="w-8 h-8 text-alert-red" />
          <span className="text-2xl font-bold text-alert-red">{missionData.casualties}</span>
        </div>
        <h3 className="text-lg font-semibold text-white">Casualties</h3>
        <p className="text-gray-400 text-sm">Personnel lost</p>
      </div>

      <div className="glass-panel rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <TrendingUp className="w-8 h-8 text-cyborg-teal" />
          <span className="text-2xl font-bold text-cyborg-teal">{missionData.efficiency}%</span>
        </div>
        <h3 className="text-lg font-semibold text-white">Efficiency</h3>
        <p className="text-gray-400 text-sm">Mission effectiveness</p>
      </div>
    </div>
  );

  const renderStressAnalysis = () => (
    <div className="glass-panel rounded-lg p-6">
      <h3 className="text-xl font-bold text-cyborg-teal mb-6">Stress Heatmap Timeline</h3>
      <div className="space-y-4">
        {stressData.map((data, index) => (
          <div key={index} className="flex items-center space-x-4">
            <span className="text-sm font-mono text-gray-400 w-16">{data.time}</span>
            <div className="flex-1 bg-gray-700 rounded-full h-6 relative overflow-hidden">
              <div 
                className={`h-full rounded-full transition-all duration-500 ${
                  data.stress < 40 ? 'bg-cyborg-teal' :
                  data.stress < 70 ? 'bg-neon-amber' : 'bg-alert-red'
                }`}
                style={{ width: `${data.stress}%` }}
              />
              <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-semibold">
                {data.stress}% stress | {data.hr} BPM
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const renderThreatTimeline = () => (
    <div className="glass-panel rounded-lg p-6">
      <h3 className="text-xl font-bold text-cyborg-teal mb-6">Threat Encounter Timeline</h3>
      <div className="space-y-4">
        {threatEvents.map((threat, index) => (
          <div key={index} className="flex items-center space-x-4 p-4 bg-ghost-gray/30 rounded-lg">
            <div className="flex items-center space-x-3 flex-1">
              <span className="text-sm font-mono text-gray-400 w-16">{threat.time}</span>
              <AlertTriangle className={`w-5 h-5 ${
                threat.severity === 'HIGH' ? 'text-alert-red' :
                threat.severity === 'MEDIUM' ? 'text-neon-amber' : 'text-cyborg-teal'
              }`} />
              <div className="flex-1">
                <p className="text-white font-semibold">{threat.event}</p>
                <p className="text-gray-400 text-sm">{threat.location}</p>
              </div>
            </div>
            <div className={`px-3 py-1 rounded text-xs font-semibold ${
              threat.severity === 'HIGH' ? 'bg-alert-red/20 text-alert-red' :
              threat.severity === 'MEDIUM' ? 'bg-neon-amber/20 text-neon-amber' : 'bg-cyborg-teal/20 text-cyborg-teal'
            }`}>
              {threat.severity}
            </div>
            {threat.resolved && (
              <div className="text-green-400 text-sm">✓ RESOLVED</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderEquipment = () => (
    <div className="glass-panel rounded-lg p-6">
      <h3 className="text-xl font-bold text-cyborg-teal mb-6">Equipment Status Report</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {equipmentStatus.map((equipment, index) => (
          <div key={index} className="p-4 bg-ghost-gray/30 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <h4 className="text-white font-semibold">{equipment.item}</h4>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                equipment.status === 'OPERATIONAL' ? 'bg-cyborg-teal/20 text-cyborg-teal' :
                equipment.status === 'DEGRADED' ? 'bg-neon-amber/20 text-neon-amber' :
                'bg-alert-red/20 text-alert-red'
              }`}>
                {equipment.status}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400 text-sm">Uptime:</span>
              <span className="text-white font-mono">{equipment.uptime}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-void text-cyborg-teal">
      <Navigation />
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-cyborg-teal neon-glow">Post-Mission Intelligence</h1>
            <p className="text-gray-400 mt-2">Mission ID: {missionData.missionId}</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <select 
              value={exportFormat}
              onChange={(e) => setExportFormat(e.target.value)}
              className="bg-ghost-gray border border-cyborg-teal/30 text-cyborg-teal rounded-lg px-3 py-2"
            >
              <option value="PDF">PDF Report</option>
              <option value="Excel">Excel Data</option>
              <option value="JSON">Raw JSON</option>
            </select>
            
            <button
              id="export-btn"
              onClick={handleExportReport}
              className="flex items-center space-x-2 px-6 py-2 bg-cyborg-teal/20 border border-cyborg-teal text-cyborg-teal rounded-lg hover:bg-cyborg-teal/30 transition-all duration-300 neon-glow"
            >
              <Download className="w-4 h-4" />
              <span>Export Report</span>
            </button>
          </div>
        </div>

        {/* Mission Status */}
        <div className="glass-panel rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className={`w-4 h-4 rounded-full ${
                missionData.status === 'COMPLETED' ? 'bg-cyborg-teal' : 'bg-alert-red'
              } pulse-animation`}></div>
              <span className="text-2xl font-bold text-white">Mission {missionData.status}</span>
              <span className={`px-3 py-1 rounded text-sm font-semibold ${
                missionData.outcome === 'SUCCESS' ? 'bg-cyborg-teal/20 text-cyborg-teal' : 'bg-alert-red/20 text-alert-red'
              }`}>
                {missionData.outcome}
              </span>
            </div>
            <div className="text-gray-400">
              Completed at {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 mb-6">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                  selectedTab === tab.id
                    ? "bg-cyborg-teal/20 text-cyborg-teal neon-glow"
                    : "text-gray-400 hover:text-cyborg-teal hover:bg-cyborg-teal/10"
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div className="mb-8">
          {selectedTab === "overview" && renderOverview()}
          {selectedTab === "stress" && renderStressAnalysis()}
          {selectedTab === "threats" && renderThreatTimeline()}
          {selectedTab === "equipment" && renderEquipment()}
        </div>

        {/* AI Insights */}
        <div className="glass-panel rounded-lg p-6">
          <h3 className="text-xl font-bold text-cyborg-teal mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2" />
            AI Mission Recommendations
          </h3>
          <div className="space-y-3">
            {recommendations.map((rec, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-ghost-gray/30 rounded-lg">
                <div className="w-6 h-6 bg-neon-amber/20 text-neon-amber rounded-full flex items-center justify-center text-sm font-bold mt-0.5">
                  {index + 1}
                </div>
                <p className="text-gray-300 flex-1">{rec}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
