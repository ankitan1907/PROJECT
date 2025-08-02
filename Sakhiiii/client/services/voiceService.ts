import { Language } from '@shared/types';

interface VoiceConfig {
  lang: string;
  voice?: SpeechSynthesisVoice;
  rate: number;
  pitch: number;
  volume: number;
}

interface VoiceMessage {
  text: string;
  language: Language;
  priority?: 'normal' | 'high' | 'emergency';
  callback?: () => void;
}

class VoiceService {
  private synthesis: SpeechSynthesis;
  private voices: SpeechSynthesisVoice[] = [];
  private isInitialized = false;
  private currentLanguage: Language = 'en';
  private queue: VoiceMessage[] = [];
  private isPlaying = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private retryCount = 0;
  private maxRetries = 3;

  // Language-specific voice configurations
  private languageConfigs: Record<Language, VoiceConfig> = {
    en: { lang: 'en-US', rate: 0.9, pitch: 1.1, volume: 0.8 },
    hi: { lang: 'hi-IN', rate: 0.8, pitch: 1.0, volume: 0.9 },
    kn: { lang: 'kn-IN', rate: 0.8, pitch: 1.0, volume: 0.9 },
    ta: { lang: 'ta-IN', rate: 0.8, pitch: 1.0, volume: 0.9 },
    te: { lang: 'te-IN', rate: 0.8, pitch: 1.0, volume: 0.9 },
  };

  // Emergency phrases in different languages
  private emergencyPhrases: Record<Language, Record<string, string>> = {
    en: {
      sosActivated: 'Emergency SOS activated. Sending alerts to your emergency contacts.',
      locationSent: 'Your location has been sent to emergency services.',
      stayCalm: 'Stay calm. Help is on the way.',
      safeRouteFound: 'Safe route found. Follow the highlighted path.',
      incidentReported: 'Incident reported successfully. Stay safe.',
      helplineConnecting: 'Connecting you to emergency helpline.',
    },
    hi: {
      sosActivated: 'आपातकालीन SOS सक्रिय। आपके आपातकालीन संपर्कों को अलर्ट भेजा जा रहा है।',
      locationSent: 'आपका स्थान आपातकालीन सेवाओं को भेज दिया गया है।',
      stayCalm: 'शांत रहें। मदद आ रही है।',
      safeRouteFound: 'सुरक्षित मार्ग मिल गया। हाइलाइट किए गए पथ का पालन करें।',
      incidentReported: '���टना सफलतापूर्वक रिपोर्ट की गई। सुरक्षित रहें।',
      helplineConnecting: 'आपको आपातकालीन हेल्पलाइन से जोड़ा जा रहा है।',
    },
    kn: {
      sosActivated: 'ತುರ್ತು SOS ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ। ನಿಮ್ಮ ತುರ್ತು ಸಂಪರ್ಕಗಳಿಗೆ ಎಚ್ಚರಿಕೆಗಳನ್ನು ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ।',
      locationSent: 'ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ತುರ್ತು ಸೇವೆಗಳಿಗೆ ಕಳುಹಿಸಲಾಗಿದೆ।',
      stayCalm: 'ಶಾಂತವಾಗಿರಿ। ಸಹಾಯ ಬರುತ್ತಿದೆ।',
      safeRouteFound: 'ಸುರಕ್ಷಿತ ಮಾರ್ಗ ಕಂಡುಬಂದಿದೆ। ಹೈಲೈಟ್ ಮಾಡಿದ ಮಾರ್ಗವನ್ನು ಅನುಸರಿಸಿ।',
      incidentReported: 'ಘಟನೆಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ವರದಿ ಮಾಡಲಾಗಿದೆ। ಸುರಕ್ಷಿತವಾಗಿರಿ।',
      helplineConnecting: 'ನಿಮ್ಮನ್ನು ತುರ್ತು ಹೆಲ್ಪ್‌ಲೈನ್‌ಗೆ ಸಂಪರ್ಕಿಸಲಾಗುತ��ತಿದೆ।',
    },
    ta: {
      sosActivated: 'அவசர SOS செயல்படுத்தப்பட்டது. உங்கள் அவசர தொடர்புகளுக்கு எச்சரிக்கைகள் அனுப்பப்படுகின்றன.',
      locationSent: 'உங்கள் இடம் அவசர சேவைகளுக்கு அனுப்பப்பட்டது.',
      stayCalm: 'அமைதியாக இருங்கள். உதவி வருகிறது.',
      safeRouteFound: 'பாதுகா���்பான வழி கண்டுபிடிக்கப்பட்டது. தனிப்படுத்தப்பட்ட பாதையைப் பின்பற்றவும்.',
      incidentReported: 'சம்பவம் வெற்றிகரமாக புகாரளிக்கப்பட்டது. பாதுகாப்பாக இருங்கள்.',
      helplineConnecting: 'உங்களை அவசர உதவி எண்ணுடன் இணைக்கிறது.',
    },
    te: {
      sosActivated: 'అత్యవసర SOS యాక్టివేట్ చేయబడింది. మీ అత్యవసర పరిచయాలకు అలర్ట్��లు పంపబడుతున్నాయి.',
      locationSent: 'మీ స్థానం అత్యవసర సేవలకు పంపబడింది.',
      stayCalm: 'ప్రశాంతంగా ఉండండి. సహాయం వస్తోంది.',
      safeRouteFound: 'సురక్షితమైన మార్గం కనుగొనబడింది. హైలైట్ చేసిన మార్గాన్ని అనుసరించండి.',
      incidentReported: 'సంఘటన విజయవంతంగా నివేదించ���డింది. భద్రంగా ఉండండి.',
      helplineConnecting: 'మిమ్మల్ని అత్యవసర హెల్ప్‌లైన్‌కు కనెక్ట్ చేస్తోంది.',
    },
  };

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synthesis = window.speechSynthesis;
      this.initializeVoices();

      // Handle page visibility changes to prevent speech synthesis issues
      document.addEventListener('visibilitychange', () => {
        if (document.hidden && this.currentUtterance) {
          this.synthesis.cancel();
        }
      });
    }
  }

  private async initializeVoices(): Promise<void> {
    return new Promise((resolve) => {
      const loadVoices = () => {
        try {
          this.voices = this.synthesis.getVoices();

          // Set preferred voices for each language
          Object.keys(this.languageConfigs).forEach((lang) => {
            const langCode = this.languageConfigs[lang as Language].lang;
            const preferredVoice = this.voices.find(voice =>
              voice.lang.startsWith(langCode.split('-')[0]) && voice.localService
            ) || this.voices.find(voice =>
              voice.lang.startsWith(langCode.split('-')[0])
            ) || this.voices.find(voice =>
              voice.lang.startsWith('en') // Fallback to English
            );

            if (preferredVoice) {
              this.languageConfigs[lang as Language].voice = preferredVoice;
            }
          });

          this.isInitialized = true;
          resolve();
        } catch (error) {
          console.warn('Error loading voices:', error);
          this.isInitialized = true; // Mark as initialized even with errors
          resolve();
        }
      };

      // Try to get voices immediately
      const voices = this.synthesis.getVoices();
      if (voices && voices.length > 0) {
        this.voices = voices;
        loadVoices();
      } else {
        // Wait for voices to load
        let voicesLoaded = false;
        const onVoicesChanged = () => {
          if (!voicesLoaded) {
            voicesLoaded = true;
            this.synthesis.removeEventListener('voiceschanged', onVoicesChanged);
            loadVoices();
          }
        };

        this.synthesis.addEventListener('voiceschanged', onVoicesChanged);

        // Fallback timeout
        setTimeout(() => {
          if (!voicesLoaded) {
            voicesLoaded = true;
            this.synthesis.removeEventListener('voiceschanged', onVoicesChanged);
            loadVoices();
          }
        }, 3000);
      }
    });
  }

  public setLanguage(language: Language): void {
    this.currentLanguage = language;
  }

  public async speak(message: VoiceMessage): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeVoices();
    }

    // Add to queue based on priority
    if (message.priority === 'emergency') {
      // Emergency messages go to the front of the queue
      this.queue.unshift(message);
      // Stop current speech for emergency
      this.stop();
    } else if (message.priority === 'high') {
      // High priority messages go after emergency but before normal
      const emergencyCount = this.queue.filter(m => m.priority === 'emergency').length;
      this.queue.splice(emergencyCount, 0, message);
    } else {
      // Normal priority goes to the end
      this.queue.push(message);
    }

    this.processQueue();
  }

  private async processQueue(): Promise<void> {
    if (this.isPlaying || this.queue.length === 0) {
      return;
    }

    this.isPlaying = true;
    const message = this.queue.shift()!;
    
    await this.speakMessage(message);
    
    this.isPlaying = false;
    
    // Process next message in queue
    if (this.queue.length > 0) {
      setTimeout(() => this.processQueue(), 100);
    }
  }

  private speakMessage(message: VoiceMessage): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Cancel any existing speech first
        this.synthesis.cancel();

        // Wait a bit for cancellation to complete
        setTimeout(() => {
          try {
            const config = this.languageConfigs[message.language];
            const utterance = new SpeechSynthesisUtterance(message.text);

            this.currentUtterance = utterance;

            // Set voice properties with fallbacks
            utterance.voice = config.voice || null;
            utterance.lang = config.lang || 'en-US';
            utterance.rate = Math.max(0.1, Math.min(2.0, config.rate || 1.0));
            utterance.pitch = Math.max(0.0, Math.min(2.0, config.pitch || 1.0));
            utterance.volume = Math.max(0.0, Math.min(1.0, config.volume || 0.8));

            let resolved = false;

            utterance.onstart = () => {
              console.log('Speech started:', message.text.substring(0, 50) + '...');
            };

            utterance.onend = () => {
              if (!resolved) {
                resolved = true;
                this.currentUtterance = null;
                if (message.callback) {
                  try {
                    message.callback();
                  } catch (callbackError) {
                    console.warn('Callback error:', callbackError);
                  }
                }
                resolve();
              }
            };

            utterance.onerror = (event) => {
              console.warn('Speech synthesis error:', {
                error: event.error,
                message: message.text.substring(0, 50) + '...',
                language: message.language,
                retryCount: this.retryCount
              });

              if (!resolved) {
                resolved = true;
                this.currentUtterance = null;

                // Retry logic for certain errors
                if (this.retryCount < this.maxRetries &&
                    (event.error === 'interrupted' || event.error === 'network')) {
                  this.retryCount++;
                  console.log(`Retrying speech synthesis (attempt ${this.retryCount})`);
                  setTimeout(() => {
                    this.speakMessage(message).then(resolve).catch(reject);
                  }, 500);
                } else {
                  this.retryCount = 0;
                  resolve(); // Resolve instead of reject to continue with queue
                }
              }
            };

            // Set a timeout as a fallback
            const timeoutId = setTimeout(() => {
              if (!resolved) {
                resolved = true;
                console.warn('Speech synthesis timeout');
                this.synthesis.cancel();
                this.currentUtterance = null;
                resolve();
              }
            }, 30000); // 30 second timeout

            // Clear timeout when speech ends normally
            utterance.addEventListener('end', () => clearTimeout(timeoutId));
            utterance.addEventListener('error', () => clearTimeout(timeoutId));

            // Speak the utterance
            this.synthesis.speak(utterance);

          } catch (error) {
            console.error('Error creating utterance:', error);
            resolve(); // Resolve to continue with queue
          }
        }, 100); // Small delay to ensure cancellation completes

      } catch (error) {
        console.error('Error in speakMessage:', error);
        resolve(); // Resolve to continue with queue
      }
    });
  }

  public stop(): void {
    try {
      this.synthesis.cancel();
      this.currentUtterance = null;
      this.queue = [];
      this.isPlaying = false;
      this.retryCount = 0;
    } catch (error) {
      console.warn('Error stopping speech:', error);
    }
  }

  public pause(): void {
    try {
      this.synthesis.pause();
    } catch (error) {
      console.warn('Error pausing speech:', error);
    }
  }

  public resume(): void {
    try {
      this.synthesis.resume();
    } catch (error) {
      console.warn('Error resuming speech:', error);
    }
  }

  // Convenience methods for common use cases
  public speakEmergency(key: string, language?: Language): void {
    const lang = language || this.currentLanguage;
    const text = this.emergencyPhrases[lang][key] || this.emergencyPhrases.en[key] || key;

    this.speak({
      text,
      language: lang,
      priority: 'emergency',
      callback: () => {
        // Show notification as fallback when speech might not be audible
        this.showFallbackNotification(text, 'emergency');
      }
    });
  }

  public speakNotification(text: string, language?: Language): void {
    const lang = language || this.currentLanguage;
    
    this.speak({
      text,
      language: lang,
      priority: 'high'
    });
  }

  public speakGuidance(text: string, language?: Language): void {
    const lang = language || this.currentLanguage;
    
    this.speak({
      text,
      language: lang,
      priority: 'normal'
    });
  }

  // Vibration support for emergency alerts
  public vibrateEmergency(): void {
    if ('navigator' in window && 'vibrate' in navigator) {
      // Emergency pattern: long, short, long, short, long
      navigator.vibrate([1000, 200, 1000, 200, 1000]);
    }
  }

  public vibrateNotification(): void {
    if ('navigator' in window && 'vibrate' in navigator) {
      // Notification pattern: two short pulses
      navigator.vibrate([200, 100, 200]);
    }
  }

  // Check if speech synthesis is supported and working
  public isSupported(): boolean {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      return false;
    }

    try {
      // Try to access speech synthesis to verify it's working
      const synthesis = window.speechSynthesis;
      return synthesis !== null && typeof synthesis.speak === 'function';
    } catch (error) {
      console.warn('Speech synthesis not properly supported:', error);
      return false;
    }
  }

  // Get available voices for a language
  public getVoicesForLanguage(language: Language): SpeechSynthesisVoice[] {
    const langCode = this.languageConfigs[language].lang.split('-')[0];
    return this.voices.filter(voice => voice.lang.startsWith(langCode));
  }

  // Fallback notification when speech synthesis fails
  private showFallbackNotification(text: string, priority: 'normal' | 'high' | 'emergency' = 'normal'): void {
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        const options: NotificationOptions = {
          body: text,
          icon: '/favicon.ico',
          tag: `voice-${priority}`,
          requireInteraction: priority === 'emergency',
          silent: false
        };

        if (priority === 'emergency') {
          options.body = '🚨 ' + text;
          options.vibrate = [200, 100, 200, 100, 200];
        }

        new Notification('Sakhi - Voice Message', options);
      } else {
        // Console fallback for development
        console.log(`Voice message (${priority}):`, text);
      }
    } catch (error) {
      console.warn('Error showing fallback notification:', error);
    }
  }
}

// Export singleton instance
export const voiceService = new VoiceService();
export default voiceService;
