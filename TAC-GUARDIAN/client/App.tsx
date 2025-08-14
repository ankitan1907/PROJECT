import "./global.css";

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { createRoot } from "react-dom/client";
import { useState } from "react";
import { LandingScreen } from "@/components/LandingScreen";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import SoldierTwin from "./pages/SoldierTwin";
import IntelReports from "./pages/IntelReports";
import RoutePlanner from "./pages/RoutePlanner";
import MissionIntel from "./pages/MissionIntel";

const queryClient = new QueryClient();

function App() {
  const [showLanding, setShowLanding] = useState(true);

  const handleEnterDashboard = () => {
    setShowLanding(false);
  };

  if (showLanding) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <LandingScreen onEnter={handleEnterDashboard} />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/soldier" element={<SoldierTwin />} />
            <Route path="/intel" element={<IntelReports />} />
            <Route path="/routes" element={<RoutePlanner />} />
            <Route path="/analytics" element={<MissionIntel />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById("root")!).render(<App />);
