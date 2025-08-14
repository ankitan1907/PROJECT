import { Link, useLocation } from "react-router-dom";
import { Shield, Activity, Eye, Route, BarChart3 } from "lucide-react";

const navItems = [
  { path: "/", label: "Mission Dashboard", icon: Shield },
  { path: "/soldier", label: "Soldier Twin", icon: Activity },
  { path: "/intel", label: "Intel Reports", icon: Eye },
  { path: "/routes", label: "Route Planner", icon: Route },
  { path: "/analytics", label: "Mission Intel", icon: BarChart3 },
];

export function Navigation() {
  const location = useLocation();

  return (
    <nav className="glass-panel border-b border-cyborg-teal/20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-2">
            <Shield className="w-8 h-8 text-cyborg-teal neon-glow" />
            <span className="text-xl font-bold text-cyborg-teal">TAC-GUARDIAN</span>
          </div>
          
          <div className="flex space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => {
              const isActive = location.pathname === path;
              return (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 ${
                    isActive
                      ? "bg-cyborg-teal/20 text-cyborg-teal neon-glow"
                      : "text-gray-400 hover:text-cyborg-teal hover:bg-cyborg-teal/10"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </Link>
              );
            })}
          </div>

          <div className="flex items-center space-x-4">
            <div className="text-sm text-alert-red font-mono">
              CLASSIFIED
            </div>
            <div className="w-2 h-2 bg-cyborg-teal rounded-full pulse-animation"></div>
          </div>
        </div>
      </div>
    </nav>
  );
}
