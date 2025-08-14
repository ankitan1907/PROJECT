import { useState, useEffect } from "react";
import { Radio, Lock, Volume2, Send, MapPin, AlertTriangle } from "lucide-react";

const mockComms = [
  { id: 1, channel: "ALPHA", user: "SGT-1058", message: "Position secure, moving to checkpoint bravo", timestamp: "14:32:15", encrypted: true, typing: false },
  { id: 2, channel: "BRAVO", user: "CPL-2041", message: "Visual on suspicious activity, sector 7", timestamp: "14:31:48", encrypted: true, typing: false },
  { id: 3, channel: "CHARLIE", user: "PVT-3092", message: "Request immediate medical assistance", timestamp: "14:31:22", encrypted: false, priority: "high", typing: false },
  { id: 4, channel: "DELTA", user: "SGT-4015", message: "Package delivered, returning to base", timestamp: "14:30:55", encrypted: true, typing: false },
  { id: 5, channel: "COMMAND", user: "BASE-OPS", message: "Weather update: Storm approaching from north", timestamp: "14:30:12", encrypted: false, typing: false },
];

const units = [
  { id: "TAC-1058", name: "SGT Alpha", signal: 92, status: "active" },
  { id: "TAC-2041", name: "CPL Bravo", signal: 78, status: "active" },
  { id: "TAC-3092", name: "PVT Charlie", signal: 45, status: "critical" },
  { id: "TAC-4015", name: "SGT Delta", signal: 89, status: "active" },
  { id: "TAC-5023", name: "CPL Echo", signal: 67, status: "active" },
];

export function EnhancedCommsFeed({ blackoutMode }: { blackoutMode: boolean }) {
  const [messages, setMessages] = useState(mockComms);
  const [isListening, setIsListening] = useState(true);
  const [selectedUnit, setSelectedUnit] = useState<string | null>(null);
  const [commandText, setCommandText] = useState("");

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        // Add typing indicator first
        const typingMessage = {
          id: Date.now(),
          channel: ["ALPHA", "BRAVO", "CHARLIE", "DELTA"][Math.floor(Math.random() * 4)],
          user: `TAC-${Math.floor(Math.random() * 9000) + 1000}`,
          message: "",
          timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
          encrypted: Math.random() > 0.3,
          typing: true
        };
        
        setMessages(prev => [typingMessage, ...prev.slice(0, 4)]);
        
        // Replace with actual message after delay
        setTimeout(() => {
          const actualMessage = {
            ...typingMessage,
            message: [
              "All clear on this sector",
              "Moving to next waypoint", 
              "Contact established with local asset",
              "Area secured, no threats detected",
              "Requesting supply drop at grid 234-567",
              "Enemy movement detected, maintaining overwatch"
            ][Math.floor(Math.random() * 6)],
            typing: false
          };
          
          setMessages(prev => prev.map(msg => 
            msg.id === typingMessage.id ? actualMessage : msg
          ));
        }, 2000);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleSendCommand = (command: string, unitId?: string) => {
    const newMessage = {
      id: Date.now(),
      channel: "COMMAND",
      user: "CONTROL",
      message: unitId ? `@${unitId}: ${command}` : command,
      timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
      encrypted: true,
      typing: false,
      priority: command.includes("Emergency") ? "high" : undefined
    };
    
    setMessages(prev => [newMessage, ...prev]);
    setCommandText("");
    setSelectedUnit(null);
    
    // Simulate acknowledgment
    setTimeout(() => {
      const ackMessage = {
        id: Date.now() + 1,
        channel: unitId ? unitId.split('-')[1] : "ALL",
        user: unitId || "ALL-UNITS",
        message: "Roger, command received and understood",
        timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
        encrypted: true,
        typing: false
      };
      setMessages(prev => [ackMessage, ...prev]);
    }, 3000);
  };

  const quickCommands = [
    { text: "Hold Position", icon: "🛑", priority: "normal" },
    { text: "Move to Waypoint", icon: "🎯", priority: "normal" },
    { text: "Emergency Evac", icon: "🚨", priority: "high" },
    { text: "Report Status", icon: "📍", priority: "normal" },
    { text: "RTB (Return to Base)", icon: "🏠", priority: "normal" },
    { text: "Go Silent", icon: "🔇", priority: "normal" }
  ];

  const handleUnitSelect = (unitId: string) => {
    setSelectedUnit(selectedUnit === unitId ? null : unitId);
  };

  const handleSignalBoost = (unitId: string) => {
    alert(`📡 SIGNAL BOOST ACTIVATED\n\nBoosting signal for ${unitId}\nExpected improvement: +20dB\nDuration: 15 minutes`);
  };

  const handleEmergencyContact = (unitId: string) => {
    alert(`🚨 EMERGENCY CONTACT\n\nAttempting priority contact with ${unitId}\nUsing all available frequencies\nMedical standby alerted`);
  };

  return (
    <div className="glass-panel rounded-lg p-4 h-80">
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-semibold flex items-center ${
          blackoutMode ? 'text-alert-red' : 'text-cyborg-teal'
        }`}>
          <Radio className="w-5 h-5 mr-2" />
          {blackoutMode ? 'Emergency Comms' : 'Live Comms'}
        </h3>
        <button
          onClick={() => setIsListening(!isListening)}
          className={`p-2 rounded-lg transition-all duration-300 ${
            isListening 
              ? "bg-cyborg-teal/20 text-cyborg-teal neon-glow" 
              : "bg-gray-600/20 text-gray-400"
          }`}
        >
          <Volume2 className="w-4 h-4" />
        </button>
      </div>
      
      {/* Quick Commands */}
      {!blackoutMode && (
        <div className="mb-4">
          <div className="grid grid-cols-2 gap-1 mb-2">
            {quickCommands.slice(0, 4).map((cmd, index) => (
              <button
                key={index}
                onClick={() => handleSendCommand(cmd.text, selectedUnit)}
                className={`px-2 py-1 text-xs rounded transition-all duration-300 ${
                  cmd.priority === "high"
                    ? 'bg-alert-red/20 text-alert-red hover:bg-alert-red/30'
                    : 'bg-cyborg-teal/20 text-cyborg-teal hover:bg-cyborg-teal/30'
                }`}
              >
                {cmd.icon} {cmd.text}
              </button>
            ))}
          </div>
          
          {/* Custom Command Input */}
          <div className="flex space-x-1">
            <input
              type="text"
              value={commandText}
              onChange={(e) => setCommandText(e.target.value)}
              placeholder={selectedUnit ? `Command for ${selectedUnit}` : "Broadcast message"}
              className="flex-1 bg-ghost-gray border border-cyborg-teal/30 text-white rounded px-2 py-1 text-xs placeholder-gray-400"
              onKeyPress={(e) => e.key === 'Enter' && commandText && handleSendCommand(commandText, selectedUnit)}
            />
            <button
              onClick={() => commandText && handleSendCommand(commandText, selectedUnit)}
              className="px-2 py-1 bg-cyborg-teal/20 text-cyborg-teal rounded hover:bg-cyborg-teal/30 transition-all duration-300"
              disabled={!commandText}
            >
              <Send className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
      
      {/* Messages Feed */}
      <div className="space-y-3 overflow-y-auto h-32 mb-4">
        {messages.map((msg) => (
          <div key={msg.id} className="p-3 bg-ghost-gray/50 rounded-lg border-l-2 border-cyborg-teal/50">
            <div className="flex justify-between items-start mb-1">
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded ${
                  msg.channel === "COMMAND" ? "bg-neon-amber/20 text-neon-amber" :
                  msg.priority === "high" ? "bg-alert-red/20 text-alert-red" :
                  "bg-cyborg-teal/20 text-cyborg-teal"
                }`}>
                  {msg.channel}
                </span>
                {msg.encrypted && <Lock className="w-3 h-3 text-green-400" />}
              </div>
              <span className="text-xs text-gray-400 font-mono">{msg.timestamp}</span>
            </div>
            
            {msg.typing ? (
              <div className="flex items-center space-x-1">
                <span className="text-sm text-gray-400">typing</span>
                <div className="flex space-x-1">
                  <div className="w-1 h-1 bg-cyborg-teal rounded-full animate-bounce"></div>
                  <div className="w-1 h-1 bg-cyborg-teal rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-1 h-1 bg-cyborg-teal rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-300 mb-1">{msg.message}</p>
            )}
            
            <span className="text-xs text-gray-500">{msg.user}</span>
          </div>
        ))}
      </div>
      
      {/* Unit Signal Strength */}
      <div className="space-y-2">
        <h4 className="text-sm font-semibold text-cyborg-teal">Unit Signal Strength</h4>
        {units.map((unit) => (
          <div key={unit.id} className="flex items-center justify-between text-xs">
            <button
              onClick={() => handleUnitSelect(unit.id)}
              className={`flex-1 text-left p-1 rounded transition-all duration-300 ${
                selectedUnit === unit.id
                  ? 'bg-cyborg-teal/20 text-cyborg-teal'
                  : 'hover:bg-ghost-gray/30 text-gray-300'
              }`}
            >
              {unit.name}
            </button>
            
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1">
                {[1, 2, 3, 4].map((i) => (
                  <div 
                    key={i}
                    className={`w-1 h-3 rounded ${
                      i <= Math.floor(unit.signal / 25) 
                        ? unit.signal > 70 ? 'bg-cyborg-teal' : 
                          unit.signal > 40 ? 'bg-neon-amber' : 'bg-alert-red'
                        : 'bg-gray-600'
                    }`}
                  ></div>
                ))}
              </div>
              <span className={`text-xs ${
                unit.signal > 70 ? 'text-cyborg-teal' : 
                unit.signal > 40 ? 'text-neon-amber' : 'text-alert-red'
              }`}>
                {unit.signal}%
              </span>
              
              {unit.signal < 50 && (
                <button
                  onClick={() => handleSignalBoost(unit.id)}
                  className="px-1 py-0.5 bg-neon-amber/20 text-neon-amber rounded text-xs hover:bg-neon-amber/30 transition-all duration-300"
                >
                  📡
                </button>
              )}
              
              {unit.status === "critical" && (
                <button
                  onClick={() => handleEmergencyContact(unit.id)}
                  className="px-1 py-0.5 bg-alert-red/20 text-alert-red rounded text-xs hover:bg-alert-red/30 transition-all duration-300 animate-pulse"
                >
                  🚨
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
