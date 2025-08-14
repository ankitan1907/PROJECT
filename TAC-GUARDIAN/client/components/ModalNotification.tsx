import { useState, useEffect } from "react";
import { X, AlertTriangle, CheckCircle, Info, Zap } from "lucide-react";

interface NotificationModal {
  id: string;
  type: "success" | "warning" | "error" | "info" | "mission";
  title: string;
  message: string;
  actions?: Array<{
    label: string;
    action: () => void;
    variant?: "primary" | "secondary" | "danger";
  }>;
}

// Global state for modals
let modals: NotificationModal[] = [];
let setModals: ((modals: NotificationModal[]) => void) | null = null;

export function showModal(modal: Omit<NotificationModal, "id">) {
  if (!setModals) return;
  
  const id = Date.now().toString();
  const newModal = { ...modal, id };
  modals = [newModal]; // Only show one modal at a time
  setModals([...modals]);
}

export function hideModal(id: string) {
  if (!setModals) return;
  
  modals = modals.filter(m => m.id !== id);
  setModals([...modals]);
}

export function hideAllModals() {
  if (!setModals) return;
  
  modals = [];
  setModals([]);
}

export function ModalNotificationContainer() {
  const [currentModals, setCurrentModals] = useState<NotificationModal[]>([]);

  useEffect(() => {
    setModals = setCurrentModals;
    return () => {
      setModals = null;
    };
  }, []);

  if (currentModals.length === 0) return null;

  const modal = currentModals[0]; // Show only the first modal

  const getIcon = () => {
    switch (modal.type) {
      case "success": return <CheckCircle className="w-8 h-8" />;
      case "warning": return <AlertTriangle className="w-8 h-8" />;
      case "error": return <AlertTriangle className="w-8 h-8" />;
      case "mission": return <Zap className="w-8 h-8" />;
      default: return <Info className="w-8 h-8" />;
    }
  };

  const getStyles = () => {
    switch (modal.type) {
      case "success": 
        return "border-cyborg-teal text-cyborg-teal";
      case "warning": 
        return "border-neon-amber text-neon-amber";
      case "error": 
        return "border-alert-red text-alert-red";
      case "mission": 
        return "border-cyborg-teal text-cyborg-teal neon-glow";
      default: 
        return "border-blue-400 text-blue-400";
    }
  };

  const getButtonStyles = (variant?: string) => {
    switch (variant) {
      case "danger":
        return "bg-alert-red/20 border-alert-red text-alert-red hover:bg-alert-red/30";
      case "secondary":
        return "bg-gray-500/20 border-gray-500 text-gray-300 hover:bg-gray-500/30";
      default:
        return "bg-cyborg-teal/20 border-cyborg-teal text-cyborg-teal hover:bg-cyborg-teal/30";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={() => hideModal(modal.id)}
      />
      
      {/* Modal */}
      <div className={`relative glass-panel rounded-lg border-2 p-6 max-w-md w-full mx-4 shadow-2xl ${getStyles()}`}>
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold">{modal.title}</h3>
              <button
                onClick={() => hideModal(modal.id)}
                className="text-gray-400 hover:text-white transition-colors p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-sm opacity-90 mb-6 whitespace-pre-line leading-relaxed">
              {modal.message}
            </p>
            
            {modal.actions && modal.actions.length > 0 ? (
              <div className="flex space-x-3 justify-end">
                {modal.actions.map((action, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      action.action();
                      hideModal(modal.id);
                    }}
                    className={`px-4 py-2 text-sm rounded border transition-all duration-300 font-semibold ${getButtonStyles(action.variant)}`}
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex justify-end">
                <button
                  onClick={() => hideModal(modal.id)}
                  className={`px-4 py-2 text-sm rounded border transition-all duration-300 font-semibold ${getButtonStyles("primary")}`}
                >
                  OK
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper functions for common notification types
export const showMissionModal = (title: string, message: string, actions?: NotificationModal["actions"]) => {
  showModal({
    type: "mission",
    title,
    message,
    actions
  });
};

export const showSuccessModal = (title: string, message: string) => {
  showModal({
    type: "success",
    title,
    message
  });
};

export const showWarningModal = (title: string, message: string) => {
  showModal({
    type: "warning",
    title,
    message
  });
};

export const showErrorModal = (title: string, message: string) => {
  showModal({
    type: "error",
    title,
    message
  });
};
