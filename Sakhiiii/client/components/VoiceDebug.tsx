import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { voiceService } from '@/services/voiceService';
import { useLanguage } from '@/contexts/LanguageContext';

const VoiceDebug: React.FC = () => {
  const { currentLanguage } = useLanguage();
  const [isSupported, setIsSupported] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [currentVoice, setCurrentVoice] = useState<SpeechSynthesisVoice | null>(null);
  const [testText, setTestText] = useState('Hello, this is a test message from Sakhi.');
  const [isTesting, setIsTesting] = useState(false);

  useEffect(() => {
    setIsSupported(voiceService.isSupported());
    
    if (voiceService.isSupported()) {
      // Get voices for current language
      const availableVoices = voiceService.getVoicesForLanguage(currentLanguage);
      setVoices(availableVoices);
      
      if (availableVoices.length > 0) {
        setCurrentVoice(availableVoices[0]);
      }
    }
  }, [currentLanguage]);

  const testVoice = async () => {
    setIsTesting(true);
    try {
      await voiceService.speakGuidance(testText, currentLanguage);
    } catch (error) {
      console.error('Voice test failed:', error);
    } finally {
      setTimeout(() => setIsTesting(false), 3000);
    }
  };

  const testEmergency = () => {
    voiceService.speakEmergency('sosActivated', currentLanguage);
  };

  if (!isSupported) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm">
        <h3 className="font-semibold text-red-800 mb-2">Voice Not Supported</h3>
        <p className="text-red-700">
          Speech synthesis is not supported in your browser or device. 
          Voice features will not work.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm space-y-3">
      <h3 className="font-semibold text-blue-800">Voice Debug Panel</h3>
      
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <Badge variant="outline">Speech Synthesis</Badge>
          <span className="text-green-700">✅ Supported</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline">Current Language</Badge>
          <span className="text-blue-700">{currentLanguage.toUpperCase()}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Badge variant="outline">Available Voices</Badge>
          <span className="text-blue-700">{voices.length}</span>
        </div>
        
        {currentVoice && (
          <div className="flex items-center space-x-2">
            <Badge variant="outline">Current Voice</Badge>
            <span className="text-blue-700">{currentVoice.name}</span>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <textarea
          value={testText}
          onChange={(e) => setTestText(e.target.value)}
          className="w-full p-2 border rounded text-sm"
          rows={2}
          placeholder="Enter test text..."
        />
        
        <div className="flex space-x-2">
          <Button
            onClick={testVoice}
            disabled={isTesting}
            size="sm"
            variant="outline"
          >
            {isTesting ? 'Testing...' : 'Test Voice'}
          </Button>
          
          <Button
            onClick={testEmergency}
            size="sm"
            variant="destructive"
          >
            Test Emergency
          </Button>
          
          <Button
            onClick={() => voiceService.stop()}
            size="sm"
            variant="ghost"
          >
            Stop All
          </Button>
        </div>
      </div>

      <div className="text-xs text-blue-600">
        <p>• Use this panel to test voice functionality</p>
        <p>• Check browser console for detailed error messages</p>
        <p>• Emergency test will trigger vibration if supported</p>
      </div>
    </div>
  );
};

export default VoiceDebug;
