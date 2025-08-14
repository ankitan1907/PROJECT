import { Navigation } from "@/components/Navigation";
import { useState, useEffect } from "react";
import { Eye, MapPin, Clock, AlertTriangle, User, Search, Filter, Flag, TrendingUp } from "lucide-react";

// Mock intel data
const mockIntelReports = [
  {
    id: "INTEL-001",
    timestamp: "14:42:15",
    source: "Civilian Asset",
    location: { sector: "7-B", coordinates: "34.0545, -118.2501" },
    priority: "CRITICAL",
    risk: 95,
    category: "THREAT",
    keywords: ["weapons", "movement", "convoy"],
    content: "Large convoy of armed vehicles spotted moving towards checkpoint alpha. Estimated 15-20 personnel with heavy equipment.",
    verified: false,
    sourceReliability: 0.78,
    aiConfidence: 0.92,
    tags: ["convoy", "armed", "checkpoint"],
    investigationStatus: "PENDING"
  },
  {
    id: "INTEL-002", 
    timestamp: "14:38:42",
    source: "Drone Recon",
    location: { sector: "5-A", coordinates: "34.0498, -118.2445" },
    priority: "HIGH",
    risk: 75,
    category: "SURVEILLANCE",
    keywords: ["suspicious", "gathering", "rooftop"],
    content: "Suspicious gathering on rooftop of building complex. Multiple individuals with optical equipment possibly conducting surveillance.",
    verified: true,
    sourceReliability: 0.95,
    aiConfidence: 0.87,
    tags: ["surveillance", "rooftop", "optics"],
    investigationStatus: "INVESTIGATING"
  },
  {
    id: "INTEL-003",
    timestamp: "14:35:18",
    source: "Local Informant",
    location: { sector: "3-C", coordinates: "34.0423, -118.2398" },
    priority: "MEDIUM",
    risk: 45,
    category: "CIVILIAN",
    keywords: ["evacuation", "families", "safe house"],
    content: "Local families requesting evacuation assistance. Report of safe house location compromised.",
    verified: false,
    sourceReliability: 0.65,
    aiConfidence: 0.71,
    tags: ["evacuation", "civilian", "safe house"],
    investigationStatus: "COMPLETED"
  },
  {
    id: "INTEL-004",
    timestamp: "14:32:55",
    source: "Signal Intelligence",
    location: { sector: "9-D", coordinates: "34.0567, -118.2523" },
    priority: "LOW",
    risk: 25,
    category: "COMMS",
    keywords: ["radio", "chatter", "coordinates"],
    content: "Intercepted radio chatter mentioning grid coordinates. Transmission weak and partially encrypted.",
    verified: true,
    sourceReliability: 0.88,
    aiConfidence: 0.64,
    tags: ["radio", "encrypted", "coordinates"],
    investigationStatus: "MONITORING"
  },
  {
    id: "INTEL-005",
    timestamp: "14:29:33",
    source: "Satellite Imagery",
    location: { sector: "2-E", coordinates: "34.0389, -118.2356" },
    priority: "HIGH",
    risk: 80,
    category: "MOVEMENT",
    keywords: ["vehicles", "unusual", "pattern"],
    content: "Satellite detected unusual vehicle movement patterns in industrial sector. Possible supply route establishment.",
    verified: true,
    sourceReliability: 0.98,
    aiConfidence: 0.89,
    tags: ["satellite", "vehicles", "industrial"],
    investigationStatus: "INVESTIGATING"
  }
];

const threatHeatmap = [
  { sector: "7-B", threat: 95, incidents: 3 },
  { sector: "2-E", threat: 80, incidents: 2 },
  { sector: "5-A", threat: 75, incidents: 4 },
  { sector: "3-C", threat: 45, incidents: 1 },
  { sector: "9-D", threat: 25, incidents: 1 },
  { sector: "1-A", threat: 15, incidents: 0 },
  { sector: "4-B", threat: 30, incidents: 1 },
  { sector: "6-C", threat: 60, incidents: 2 },
];

export default function IntelReports() {
  const [reports, setReports] = useState(mockIntelReports);
  const [selectedReport, setSelectedReport] = useState<any>(null);
  const [filter, setFilter] = useState("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  // Simulate new intel coming in
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) {
        const newReport = {
          id: `INTEL-${String(Date.now()).slice(-3)}`,
          timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
          source: ["Civilian Asset", "Drone Recon", "Signal Intelligence", "Satellite Imagery"][Math.floor(Math.random() * 4)],
          location: { 
            sector: `${Math.floor(Math.random() * 9) + 1}-${String.fromCharCode(65 + Math.floor(Math.random() * 5))}`,
            coordinates: `${(34.04 + Math.random() * 0.03).toFixed(4)}, ${(-118.25 + Math.random() * 0.03).toFixed(4)}`
          },
          priority: ["LOW", "MEDIUM", "HIGH", "CRITICAL"][Math.floor(Math.random() * 4)],
          risk: Math.floor(Math.random() * 100),
          category: ["THREAT", "SURVEILLANCE", "CIVILIAN", "COMMS", "MOVEMENT"][Math.floor(Math.random() * 5)],
          keywords: ["suspicious", "movement", "activity"],
          content: [
            "New suspicious activity detected in sector",
            "Unidentified personnel movement observed",
            "Communication intercept requires analysis",
            "Visual confirmation of unusual behavior"
          ][Math.floor(Math.random() * 4)],
          verified: Math.random() > 0.5,
          sourceReliability: Math.random(),
          aiConfidence: Math.random(),
          tags: ["new", "unverified"],
          investigationStatus: "PENDING"
        };
        
        setReports(prev => [newReport, ...prev.slice(0, 9)]);
      }
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const filteredReports = reports.filter(report => {
    const matchesFilter = filter === "ALL" || report.priority === filter;
    const matchesSearch = searchTerm === "" || 
      report.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.keywords.some(k => k.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "CRITICAL": return "text-alert-red bg-alert-red/20 border-alert-red";
      case "HIGH": return "text-neon-amber bg-neon-amber/20 border-neon-amber";
      case "MEDIUM": return "text-cyborg-teal bg-cyborg-teal/20 border-cyborg-teal";
      default: return "text-gray-400 bg-gray-400/20 border-gray-400";
    }
  };

  const getRiskColor = (risk: number) => {
    if (risk >= 80) return "text-alert-red";
    if (risk >= 50) return "text-neon-amber";
    return "text-cyborg-teal";
  };

  const handleMarkForInvestigation = (reportId: string) => {
    setReports(prev => prev.map(report => 
      report.id === reportId 
        ? { ...report, investigationStatus: "INVESTIGATING" }
        : report
    ));
  };

  return (
    <div className="min-h-screen bg-void text-cyborg-teal">
      <Navigation />
      
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-cyborg-teal neon-glow">Intel Reports</h1>
            <p className="text-gray-400 mt-2">Eyes & Ears on the Ground - AI Risk Classification</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-400 font-mono">
              Live Feed: {filteredReports.length} reports
            </div>
            <div className="w-2 h-2 bg-cyborg-teal rounded-full pulse-animation"></div>
          </div>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left Panel - Threat Heatmap */}
          <div className="col-span-3">
            <div className="glass-panel rounded-lg p-4 mb-6">
              <h3 className="text-lg font-semibold text-cyborg-teal mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2" />
                Threat Heatmap
              </h3>
              <div className="space-y-3">
                {threatHeatmap.map((area) => (
                  <div key={area.sector} className="flex justify-between items-center p-3 bg-ghost-gray/30 rounded-lg">
                    <div>
                      <div className="font-semibold text-white">{area.sector}</div>
                      <div className="text-xs text-gray-400">{area.incidents} incidents</div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-16 bg-gray-700 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            area.threat >= 80 ? 'bg-alert-red' :
                            area.threat >= 50 ? 'bg-neon-amber' : 'bg-cyborg-teal'
                          }`}
                          style={{ width: `${area.threat}%` }}
                        />
                      </div>
                      <span className={`text-sm font-bold ${getRiskColor(area.threat)}`}>
                        {area.threat}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="glass-panel rounded-lg p-4">
              <h3 className="text-lg font-semibold text-cyborg-teal mb-4 flex items-center">
                <Filter className="w-5 h-5 mr-2" />
                Filters
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Priority</label>
                  <select 
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                    className="w-full bg-ghost-gray border border-cyborg-teal/30 text-cyborg-teal rounded-lg px-3 py-2 text-sm"
                  >
                    <option value="ALL">All Priorities</option>
                    <option value="CRITICAL">Critical</option>
                    <option value="HIGH">High</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="LOW">Low</option>
                  </select>
                </div>

                <div>
                  <label className="text-sm text-gray-400 mb-2 block">Search</label>
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Keywords, locations..."
                      className="w-full bg-ghost-gray border border-cyborg-teal/30 text-white rounded-lg pl-10 pr-3 py-2 text-sm placeholder-gray-400"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Center Panel - Intel Feed */}
          <div className="col-span-6">
            <div className="glass-panel rounded-lg p-4">
              <h3 className="text-lg font-semibold text-cyborg-teal mb-4">Live Intelligence Feed</h3>
              
              <div className="space-y-4 max-h-[700px] overflow-y-auto">
                {filteredReports.map((report) => (
                  <div 
                    key={report.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-all duration-300 hover:scale-105 ${
                      selectedReport?.id === report.id 
                        ? 'bg-cyborg-teal/10 border-cyborg-teal' 
                        : 'bg-ghost-gray/30 border-gray-600 hover:border-cyborg-teal/50'
                    }`}
                    onClick={() => setSelectedReport(report)}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex items-center space-x-3">
                        <span className={`px-2 py-1 rounded text-xs font-semibold border ${getPriorityColor(report.priority)}`}>
                          {report.priority}
                        </span>
                        <span className="text-xs text-gray-400 font-mono">{report.id}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="w-3 h-3 text-gray-400" />
                        <span className="text-xs text-gray-400">{report.timestamp}</span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <MapPin className="w-4 h-4 text-cyborg-teal" />
                      <span className="text-sm text-cyborg-teal">{report.location.sector}</span>
                      <span className="text-xs text-gray-400">{report.location.coordinates}</span>
                    </div>

                    <p className="text-gray-300 text-sm mb-3">{report.content}</p>

                    <div className="flex justify-between items-center">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                          <AlertTriangle className={`w-4 h-4 ${getRiskColor(report.risk)}`} />
                          <span className={`text-sm font-bold ${getRiskColor(report.risk)}`}>
                            {report.risk}% Risk
                          </span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="text-xs text-gray-400">{report.source}</span>
                        </div>
                      </div>
                      
                      {!report.verified && (
                        <span className="text-xs px-2 py-1 bg-neon-amber/20 text-neon-amber rounded">
                          UNVERIFIED
                        </span>
                      )}
                    </div>

                    {/* Keywords */}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {report.keywords.map((keyword, index) => (
                        <span 
                          key={index}
                          className="text-xs px-2 py-1 bg-cyborg-teal/20 text-cyborg-teal rounded hover:bg-cyborg-teal/30 transition-colors"
                        >
                          {keyword}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Panel - Selected Report Details */}
          <div className="col-span-3">
            {selectedReport ? (
              <div className="space-y-4">
                <div className="glass-panel rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-cyborg-teal mb-4">Report Analysis</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <span className="text-gray-400 text-sm">AI Confidence:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-2 bg-cyborg-teal rounded-full"
                            style={{ width: `${selectedReport.aiConfidence * 100}%` }}
                          />
                        </div>
                        <span className="text-cyborg-teal text-sm font-bold">
                          {Math.round(selectedReport.aiConfidence * 100)}%
                        </span>
                      </div>
                    </div>

                    <div>
                      <span className="text-gray-400 text-sm">Source Reliability:</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <div className="flex-1 bg-gray-700 rounded-full h-2">
                          <div 
                            className="h-2 bg-neon-amber rounded-full"
                            style={{ width: `${selectedReport.sourceReliability * 100}%` }}
                          />
                        </div>
                        <span className="text-neon-amber text-sm font-bold">
                          {Math.round(selectedReport.sourceReliability * 100)}%
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-ghost-gray/30 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Investigation Status:</div>
                      <div className={`text-sm font-semibold ${
                        selectedReport.investigationStatus === 'COMPLETED' ? 'text-cyborg-teal' :
                        selectedReport.investigationStatus === 'INVESTIGATING' ? 'text-neon-amber' :
                        selectedReport.investigationStatus === 'MONITORING' ? 'text-blue-400' :
                        'text-alert-red'
                      }`}>
                        {selectedReport.investigationStatus}
                      </div>
                    </div>

                    <div className="p-3 bg-ghost-gray/30 rounded-lg">
                      <div className="text-sm text-gray-400 mb-1">Category:</div>
                      <div className="text-sm font-semibold text-white">{selectedReport.category}</div>
                    </div>
                  </div>
                </div>

                <div className="glass-panel rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-cyborg-teal mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <button 
                      onClick={() => handleMarkForInvestigation(selectedReport.id)}
                      className="w-full px-3 py-2 bg-cyborg-teal/20 border border-cyborg-teal text-cyborg-teal rounded-lg hover:bg-cyborg-teal/30 transition-all duration-300 text-sm animate-pulse"
                      disabled={selectedReport.investigationStatus === 'INVESTIGATING'}
                    >
                      <Flag className="w-4 h-4 inline mr-2" />
                      Mark for Investigation
                    </button>
                    <button className="w-full px-3 py-2 bg-neon-amber/20 border border-neon-amber text-neon-amber rounded-lg hover:bg-neon-amber/30 transition-all duration-300 text-sm">
                      🎯 Verify Source
                    </button>
                    <button className="w-full px-3 py-2 bg-alert-red/20 border border-alert-red text-alert-red rounded-lg hover:bg-alert-red/30 transition-all duration-300 text-sm">
                      ⚠️ Escalate Threat
                    </button>
                  </div>
                </div>

                <div className="glass-panel rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-cyborg-teal mb-4">Related Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedReport.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="text-xs px-2 py-1 bg-cyborg-teal/20 text-cyborg-teal rounded border border-cyborg-teal/50"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="glass-panel rounded-lg p-8 text-center">
                <Eye className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-400">Select a report to view detailed analysis</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
