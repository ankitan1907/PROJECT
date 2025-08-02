import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Volume2, 
  VolumeX, 
  Bell, 
  BellOff, 
  Shield, 
  Moon, 
  Sun,
  Globe,
  Mic,
  MicOff,
  Vibrate,
  Save
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';
import { voiceService } from '@/services/voiceService';
import { Language } from '@shared/types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const { currentLanguage, setLanguage, availableLanguages } = useLanguage();
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [autoVoiceGreeting, setAutoVoiceGreeting] = useState(true);
  const [darkMode, setDarkMode] = useState(false);

  const handleSave = () => {
    // Save settings to localStorage
    const settings = {
      voiceEnabled,
      notificationsEnabled,
      vibrationEnabled,
      autoVoiceGreeting,
      darkMode
    };
    localStorage.setItem('sakhi-settings', JSON.stringify(settings));
    
    // Apply settings
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    // Voice confirmation
    if (voiceEnabled) {
      voiceService.speakGuidance('Settings saved successfully', currentLanguage);
    }

    onClose();
  };

  const testVoice = () => {
    if (voiceEnabled) {
      const testMessage = currentLanguage === 'en' ? 'Voice assistant is working correctly' :
                         currentLanguage === 'hi' ? 'आवाज सहायक सही तरीके से काम कर रहा है' :
                         currentLanguage === 'kn' ? 'ಧ್ವನಿ ಸಹಾಯಕ ಸರಿಯಾಗಿ ಕೆಲಸ ಮಾಡುತ್ತಿದೆ' :
                         currentLanguage === 'ta' ? 'குரல் உதவியாளர் சரியாக வேலை செய்கிறது' :
                         'వాయిస్ అసిస్టెంట్ సరిగ్గా పని చేస్తోంది';
      voiceService.speakGuidance(testMessage, currentLanguage);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Settings</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Language Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Globe className="w-5 h-5 mr-2 text-purple-600" />
                Language
              </h3>
              <div className="grid grid-cols-1 gap-2">
                {availableLanguages.map((language) => (
                  <button
                    key={language.code}
                    onClick={() => setLanguage(language.code as Language)}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors ${
                      currentLanguage === language.code 
                        ? 'bg-purple-50 border-purple-200 text-purple-900' 
                        : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    <span className="font-medium">{language.nativeName}</span>
                    <span className="text-sm text-gray-500">({language.name})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Voice Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Mic className="w-5 h-5 mr-2 text-purple-600" />
                Voice Assistant
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {voiceEnabled ? <Volume2 className="w-5 h-5 text-green-600" /> : <VolumeX className="w-5 h-5 text-gray-400" />}
                    <span className="font-medium">Voice Output</span>
                  </div>
                  <button
                    onClick={() => setVoiceEnabled(!voiceEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      voiceEnabled ? 'bg-green-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      voiceEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {autoVoiceGreeting ? <Mic className="w-5 h-5 text-blue-600" /> : <MicOff className="w-5 h-5 text-gray-400" />}
                    <span className="font-medium">Auto Greeting</span>
                  </div>
                  <button
                    onClick={() => setAutoVoiceGreeting(!autoVoiceGreeting)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      autoVoiceGreeting ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      autoVoiceGreeting ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <Button
                  onClick={testVoice}
                  disabled={!voiceEnabled}
                  variant="outline"
                  className="w-full"
                >
                  <Volume2 className="w-4 h-4 mr-2" />
                  Test Voice
                </Button>
              </div>
            </div>

            {/* Notification Settings */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Bell className="w-5 h-5 mr-2 text-purple-600" />
                Notifications
              </h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {notificationsEnabled ? <Bell className="w-5 h-5 text-blue-600" /> : <BellOff className="w-5 h-5 text-gray-400" />}
                    <span className="font-medium">Push Notifications</span>
                  </div>
                  <button
                    onClick={() => setNotificationsEnabled(!notificationsEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      notificationsEnabled ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      notificationsEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    {vibrationEnabled ? <Vibrate className="w-5 h-5 text-orange-600" /> : <Vibrate className="w-5 h-5 text-gray-400" />}
                    <span className="font-medium">Vibration</span>
                  </div>
                  <button
                    onClick={() => setVibrationEnabled(!vibrationEnabled)}
                    className={`w-12 h-6 rounded-full transition-colors ${
                      vibrationEnabled ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      vibrationEnabled ? 'translate-x-6' : 'translate-x-0.5'
                    }`} />
                  </button>
                </div>
              </div>
            </div>

            {/* Privacy & Security */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Shield className="w-5 h-5 mr-2 text-purple-600" />
                Privacy & Security
              </h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>• Voice data is processed locally on your device</p>
                <p>• Location data is only shared during emergencies</p>
                <p>• Anonymous reporting protects your identity</p>
                <p>• SMS alerts are sent only to your emergency contacts</p>
              </div>
            </div>

            {/* App Info */}
            <div className="bg-purple-50 rounded-lg p-4">
              <h4 className="font-semibold text-purple-900 mb-2">About Sakhi</h4>
              <p className="text-sm text-purple-700">
                Your personal safety companion built for Indian women. 
                Sakhi means "female friend" in Sanskrit, representing our commitment 
                to keeping you safe and connected.
              </p>
              <div className="mt-2 text-xs text-purple-600">
                Version 1.0.0 • Made with ❤️ for women's safety
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 rounded-b-2xl">
            <Button
              variant="outline"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Settings
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default SettingsModal;
