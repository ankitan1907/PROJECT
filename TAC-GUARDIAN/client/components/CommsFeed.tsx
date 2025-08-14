import { useState, useEffect } from "react";
import { Radio, Lock, Volume2 } from "lucide-react";

const mockComms = [
  { id: 1, channel: "ALPHA", user: "SGT-1058", message: "Position secure, moving to checkpoint bravo", timestamp: "14:32:15", encrypted: true },
  { id: 2, channel: "BRAVO", user: "CPL-2041", message: "Visual on suspicious activity, sector 7", timestamp: "14:31:48", encrypted: true },
  { id: 3, channel: "CHARLIE", user: "PVT-3092", message: "Request immediate medical assistance", timestamp: "14:31:22", encrypted: false, priority: "high" },
  { id: 4, channel: "DELTA", user: "SGT-4015", message: "Package delivered, returning to base", timestamp: "14:30:55", encrypted: true },
  { id: 5, channel: "COMMAND", user: "BASE-OPS", message: "Weather update: Storm approaching from north", timestamp: "14:30:12", encrypted: false },
];

export function CommsFeed() {
  const [messages, setMessages] = useState(mockComms);
  const [isListening, setIsListening] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        const newMessage = {
          id: Date.now(),
          channel: ["ALPHA", "BRAVO", "CHARLIE", "DELTA"][Math.floor(Math.random() * 4)],
          user: `TAC-${Math.floor(Math.random() * 9000) + 1000}`,
          message: [
            "All clear on this sector",
            "Moving to next waypoint", 
            "Contact established with local asset",
            "Area secured, no threats detected"
          ][Math.floor(Math.random() * 4)],
          timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
          encrypted: Math.random() > 0.3
        };
        
        setMessages(prev => [newMessage, ...prev.slice(0, 4)]);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="glass-panel rounded-lg p-4 h-80">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold text-cyborg-teal flex items-center">
          <Radio className="w-5 h-5 mr-2" />
          Live Comms
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
      
      <div className="space-y-3 overflow-y-auto h-60">
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
            <p className="text-sm text-gray-300 mb-1">{msg.message}</p>
            <span className="text-xs text-gray-500">{msg.user}</span>
          </div>
        ))}
      </div>
      
      <div className="mt-3 flex space-x-2">
        <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
          <div className="h-full bg-cyborg-teal animate-pulse w-3/4"></div>
        </div>
        <span className="text-xs text-cyborg-teal">Signal: 78%</span>
      </div>
    </div>
  );
}
