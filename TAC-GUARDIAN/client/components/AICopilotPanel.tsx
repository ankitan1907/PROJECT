import { useState, useEffect } from "react";
import { Bot, Zap, Route, Shield, AlertTriangle } from "lucide-react";
import { showMissionModal, showSuccessModal } from "./ModalNotification";

const aiNarrations = [
  "All units maintaining operational status. Perimeter secure.",
  "Threat analysis complete. Recommend alternate route through sector 5.",
  "Drone reconnaissance detecting movement in grid 7-Alpha.",
  "Weather conditions optimal for continued operations.",
  "Communication systems functioning at 94% efficiency.",
  "Medical systems report all personnel within normal parameters.",
  "Quantum encryption cycling complete. All channels secure.",
  "Satellite imagery updated. No new threats detected.",
  "Supply drop requested for grid coordinates 34.0522, -118.2437.",
  "Emergency protocols on standby. All systems green."
];

export function AICopilotPanel({ missionTime, selectedSoldier, threatZones }: any) {
  const [currentNarration, setCurrentNarration] = useState(aiNarrations[0]);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentNarration(aiNarrations[Math.floor(Math.random() * aiNarrations.length)]);
      
      // Generate contextual suggestions
      const newSuggestions = [];
      
      if (selectedSoldier?.status === "critical") {
        newSuggestions.push({
          id: "evac",
          label: "Emergency Evac",
          description: "Deploy extraction team",
          action: () => showMissionModal("🚁 AI RECOMMENDATION", `Emergency evacuation suggested for ${selectedSoldier.name}\n\n• Medical priority: URGENT\n• Nearest LZ: 400m\n• Extraction time: 6 minutes\n• Success probability: 94%`, [
            { label: "Authorize", action: () => showSuccessModal("✅ EVAC AUTHORIZED", "Emergency extraction initiated by AI recommendation"), variant: "danger" }
          ])
        });
      }
      
      if (threatZones.length > 0) {
        newSuggestions.push({
          id: "reroute",
          label: "AI Reroute",
          description: "Calculate safe paths",
          action: () => showMissionModal("🤖 AI PATHFINDING", "Calculating optimal routes around threat zones\n\n• Analyzing 1,247 possible paths\n• Factoring real-time intel\n• Optimizing for speed and safety\n• ETA reduction: 8 minutes", [
            { label: "Apply Routes", action: () => showSuccessModal("✅ ROUTES APPLIED", "AI-optimized routes now active\n\n• All units rerouted\n• Threat avoidance: 96%\n• Mission timeline updated"), variant: "primary" }
          ])
        });
      }
      
      newSuggestions.push({
        id: "drone",
        label: "Deploy Drone",
        description: "Enhanced reconnaissance",
        action: () => showMissionModal("🛸 AI DRONE DEPLOYMENT", "Recommending drone deployment for enhanced intelligence\n\n• Target area: Sector 7-Alpha\n• Mission duration: 30 minutes\n• Intel gathering: High priority\n• Risk assessment: Low", [
          { label: "Deploy", action: () => showSuccessModal("🚁 DRONE DEPLOYED", "AI-recommended drone mission launched\n\n• Stealth mode active\n• Live feed streaming\n• Threat detection enhanced"), variant: "primary" }
        ])
      });
      
      if (Math.random() > 0.7) {
        newSuggestions.push({
          id: "support",
          label: "Request Support",
          description: "Air/Medical backup",
          action: () => showMissionModal("📡 AI SUPPORT REQUEST", "AI systems recommend additional support\n\n• Medical team: Available\n• Air support: 12 minutes out\n• Supply drop: Ready for deployment\n• Emergency backup: On standby", [
            { label: "Request", action: () => showSuccessModal("✅ SUPPORT REQUESTED", "Additional support assets en route\n\n• ETA: 12 minutes\n• Medical team notified\n• Air cover available"), variant: "primary" }
          ])
        });
      }
      
      setSuggestions(newSuggestions.slice(0, 3));
    }, 8000);

    return () => clearInterval(interval);
  }, [selectedSoldier, threatZones]);

  return (
    <div className="glass-panel rounded-lg p-4">
      <div className="flex items-center space-x-2 mb-4">
        <Bot className="w-5 h-5 text-cyborg-teal" />
        <h3 className="text-lg font-semibold text-cyborg-teal">AI Copilot</h3>
        <div className="w-2 h-2 bg-cyborg-teal rounded-full animate-pulse"></div>
      </div>

      {/* AI Narration */}
      <div className="mb-6 p-3 bg-cyborg-teal/10 border border-cyborg-teal/30 rounded-lg">
        <div className="text-sm text-cyborg-teal font-semibold mb-1">TACTICAL ASSESSMENT</div>
        <p className="text-sm text-gray-300 italic">"{currentNarration}"</p>
        <div className="text-xs text-gray-400 mt-2">
          AI Analysis • {new Date().toLocaleTimeString()}
        </div>
      </div>

      {/* Mission Status Summary */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="p-2 bg-void/30 rounded border border-cyborg-teal/20">
          <div className="text-xs text-gray-400">Mission Progress</div>
          <div className="text-lg font-bold text-cyborg-teal">67%</div>
        </div>
        <div className="p-2 bg-void/30 rounded border border-cyborg-teal/20">
          <div className="text-xs text-gray-400">Threat Level</div>
          <div className="text-lg font-bold text-neon-amber">MEDIUM</div>
        </div>
      </div>

      {/* AI Suggestions */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-cyborg-teal">AI Recommendations</h4>
        {suggestions.map((suggestion) => (
          <button
            key={suggestion.id}
            onClick={suggestion.action}
            className="w-full p-3 rounded-lg border bg-cyborg-teal/10 border-cyborg-teal/30 text-left hover:bg-cyborg-teal/20 transition-all duration-300"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-cyborg-teal text-sm">{suggestion.label}</div>
                <div className="text-xs text-gray-400">{suggestion.description}</div>
              </div>
              <Zap className="w-4 h-4 text-cyborg-teal" />
            </div>
          </button>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mt-4 pt-3 border-t border-gray-600">
        <h4 className="text-sm font-semibold text-cyborg-teal mb-2">Quick Actions</h4>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => showMissionModal("📊 AI ANALYSIS", "Comprehensive mission analysis\n\n• Personnel status: OPTIMAL\n• Equipment functionality: 96%\n• Mission timeline: ON TRACK\n• Risk assessment: MANAGEABLE\n• Success probability: 87%")}
            className="px-2 py-1 bg-blue-400/20 text-blue-400 rounded text-xs hover:bg-blue-400/30 transition-all duration-300"
          >
            📊 Analysis
          </button>
          <button
            onClick={() => showMissionModal("🎯 PREDICTIVE MODEL", "AI threat prediction active\n\n• Next threat window: 23 minutes\n• Probability: 34%\n• Recommended prep time: 8 minutes\n• Countermeasures: Ready")}
            className="px-2 py-1 bg-purple-400/20 text-purple-400 rounded text-xs hover:bg-purple-400/30 transition-all duration-300"
          >
            🔮 Predict
          </button>
        </div>
      </div>
    </div>
  );
}
