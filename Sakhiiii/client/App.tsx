import "./global.css";
import "./utils/authDebug"; // Development debugging

import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import Index from "./pages/Index";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import ProfileSetup from "./pages/ProfileSetup";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import NotificationSystem from "./components/NotificationSystem";
import { OfflineIndicator } from "./components/OfflineIndicator";
import { LocationErrorHandler } from "./components/LocationErrorHandler";

const queryClient = new QueryClient();

// Protected route wrapper
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-pastel-pink to-soft-lavender">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/signin" replace />;
  }

  if (!user.profileComplete) {
    return <Navigate to="/setup" replace />;
  }

  return <>{children}</>;
};

// Routes component
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Index />} />
      <Route path="/signin" element={user ? <Navigate to="/dashboard" replace /> : <SignIn />} />
      <Route path="/signup" element={user ? <Navigate to="/dashboard" replace /> : <SignUp />} />
      <Route path="/setup" element={user && !user.profileComplete ? <ProfileSetup /> : <Navigate to="/" replace />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <AuthProvider>
        <LanguageProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <NotificationSystem />
            <OfflineIndicator />
            <LocationErrorHandler />
            <BrowserRouter>
              <AppRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </LanguageProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

// Prevent double mounting in development and handle React StrictMode
const container = document.getElementById("root")!;

// Store the root instance to prevent multiple createRoot calls
let root: ReturnType<typeof createRoot>;

const renderApp = () => {
  try {
    if (!root) {
      root = createRoot(container);
    }
    root.render(<App />);
  } catch (error) {
    console.error('Error rendering app:', error);
    // Fallback: clear container and try again
    container.innerHTML = '';
    root = createRoot(container);
    root.render(<App />);
  }
};

// Handle hot module replacement in development
if (import.meta.hot) {
  import.meta.hot.accept(() => {
    renderApp();
  });
}

renderApp();
