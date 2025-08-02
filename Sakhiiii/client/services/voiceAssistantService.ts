import { notificationService } from './notificationService';
import { advancedSMSService } from './advancedSMS';

interface VoiceConfig {
  language: string;
  rate: number;
  pitch: number;
  volume: number;
  voice?: SpeechSynthesisVoice;
}

interface SOSAnnouncementConfig {
  enableCountdown: boolean;
  enableLocationAnnouncement: boolean;
  enableStatusUpdates: boolean;
  emergencyTone: boolean;
}

class VoiceAssistantService {
  private synthesis: SpeechSynthesis;
  private isEnabled: boolean = false;
  private config: VoiceConfig;
  private sosConfig: SOSAnnouncementConfig;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private emergencyMode: boolean = false;
  private messageQueue: Array<{ text: string; priority: 'low' | 'high' | 'emergency' }> = [];
  private isProcessingQueue: boolean = false;
  private hasUserInteracted: boolean = false;
  private voicesLoaded: boolean = false;
  private initializationAttempts: number = 0;
  private maxInitializationAttempts: number = 3;
  private lastSpokenMessage: string = '';
  private lastSpokenTime: number = 0;
  private debounceTimeMs: number = 3000; // 3 seconds debounce

  // Multilingual emergency phrases
  private emergencyPhrases = {
    en: {
      sosActivated: 'S O S emergency alert activated. Sending location to your emergency contacts.',
      sosCountdown: 'Emergency alert will be sent in {seconds} seconds. Press cancel to stop.',
      sosCancelled: 'S O S alert cancelled.',
      locationSent: 'Your location has been sent to emergency contacts.',
      smsDelivered: 'Emergency message delivered to {count} contacts.',
      smsDeliveryFailed: 'Warning: Message delivery failed. Please call for help.',
      emergencyCircleActive: 'Emergency circle activated. Your location is being shared live.',
      emergencyCircleDeactivated: 'Emergency circle deactivated. You are marked as safe.',
      dangerZoneEntered: 'Caution: You have entered a high risk area. Stay alert.',
      safeZoneEntered: 'You are now in a verified safe zone.',
      lowBattery: 'Warning: Your phone battery is low. Consider informing your contacts.',
      helpOnTheWay: 'Help is on the way. Stay calm and stay safe.',
      stayCalm: 'Stay calm. Your emergency contacts have been notified.',
      voiceAssistantReady: 'Sakhi voice assistant is ready to help keep you safe.',
      guidanceMode: 'Voice guidance mode activated.',
      listeningMode: 'Listening for emergency commands.'
    },
    hi: {
      sosActivated: 'एस ओ एस आपातकालीन अलर्ट सक्रिय। आपकी स्थित��� आपके आपातकालीन संपर्कों को भेजी जा रही है।',
      sosCountdown: '{seconds} सेकंड में आपातकालीन अलर्ट भेजा जाएगा। रोकने के लिए रद्द दबाएं।',
      sosCancelled: 'एस ओ एस अलर्ट रद्द किया गया।',
      locationSent: 'आपकी स्थिति आपातकालीन संपर्कों को भेज दी गई है।',
      smsDelivered: 'आपातकालीन संदेश {count} संपर्कों को पहुंचाया गया।',
      smsDeliveryFailed: 'चेतावनी: संदेश पहुंचाने में असफल। कृपया मदद के लिए कॉल करें।',
      emergencyCircleActive: 'आपातकालीन सर्कल सक���रिय। आपकी स्थिति लाइव साझा की जा रही है।',
      emergencyCircleDeactivated: 'आपातकालीन सर्कल निष्क्रिय। आप सुरक्षित चिह्नित हैं।',
      dangerZoneEntered: 'सावधान: आप उच्च ��ोखिम क्षेत्र में प्रवेश कर गए हैं। सतर्क रहें।',
      safeZoneEntered: 'अब आप एक सत्यापित सुरक्षित क्षेत्र में हैं।',
      lowBattery: 'चेतावनी: आपके फोन की बैटरी कम है। अपने संपर्कों को सूचित करने पर विचार करें।',
      helpOnTheWay: 'मदद आ रही है। शांत रहें और सुरक्षित रहें।',
      stayCalm: 'शांत रहें। आपके आपातकालीन संपर्कों को सूचित कर दिया गया है।',
      voiceAssistantReady: 'सखी आवाज सहायक आपको सुरक���षित रखने में मदद के लिए तैयार है।',
      guidanceMode: 'आवाज मार्गदर्शन मोड सक्रिय।',
      listeningMode: 'आपातकालीन कमांड सुन रहा है।'
    },
    kn: {
      sosActivated: 'ಎಸ್ ಓ ಎಸ್ ತುರ್ತು ಎಚ್ಚರಿಕೆ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದ���. ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ತುರ್ತು ಸಂಪರ್ಕಗಳಿಗೆ ಕಳುಹಿಸಲಾಗುತ್ತಿದೆ.',
      sosCountdown: '{seconds} ಸೆಕೆಂಡ್‌ಗಳಲ್ಲಿ ತುರ್ತು ಎಚ್ಚರಿಕೆಯನ್ನು ಕಳುಹಿಸಲಾಗುತ್ತದೆ. ನಿಲ್ಲಿಸಲು ರದ್ದು ಒತ್ತಿ.',
      sosCancelled: 'ಎಸ್ ಓ ಎಸ್ ಎಚ್ಚರಿಕೆಯನ್ನು ರದ್ದುಪಡಿಸಲಾಗಿದೆ.',
      locationSent: 'ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ತುರ್ತು ಸಂಪರ್ಕಗಳಿಗೆ ಕಳುಹಿಸಲಾಗಿದೆ.',
      smsDelivered: 'ತುರ್ತು ಸಂದೇಶವನ್ನು {count} ಸಂಪರ್ಕಗಳಿಗೆ ತಲುಪಿಸಲಾಗಿದೆ.',
      smsDeliveryFailed: 'ಎಚ್ಚರಿಕೆ: ��ಂದೇಶ ತಲುಪಿಸುವಿಕೆ ವಿಫಲವಾಗಿದೆ. ದಯವಿ��್ಟು ಸಹಾಯಕ್ಕಾಗಿ ಕರೆ ಮಾಡಿ.',
      emergencyCircleActive: 'ತುರ್ತು ವೃತ್ತ ಸಕ್ರಿಯ. ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ನೇರ ಪ್ರಸಾರ ಮಾಡಲಾಗುತ್ತಿದೆ.',
      emergencyCircleDeactivated: 'ತುರ್ತು ವೃತ್ತ ನ��ಷ್ಕ್ರಿಯ. ನೀವು ಸುರಕ್ಷಿತವಾಗಿ ಗುರುತಿಸಲ್ಪಟ್ಟಿದ್ದೀರಿ.',
      dangerZoneEntered: 'ಎಚ್ಚರಿಕೆ: ನೀವು ಹೆಚ್ಚಿನ ಅಪಾಯದ ಪ್ರದೇಶವನ್ನು ಪ್ರವೇಶಿಸಿದ್ದೀರಿ. ಜಾಗರೂಕರಾಗಿರಿ.',
      safeZoneEntered: 'ನೀವು ಈಗ ಪರಿಶೀಲಿಸಿದ ಸುರಕ್ಷಿತ ವಲಯದಲ್ಲಿದ್ದೀರಿ.',
      lowBattery: 'ಎಚ್ಚರಿಕೆ: ನಿಮ್ಮ ಫೋನ್ ಬ್ಯಾಟರಿ ಕಡಿಮೆಯಾಗಿದೆ. ನಿಮ್ಮ ಸಂಪರ್ಕಗಳಿಗೆ ತಿಳಿಸುವುದನ್ನು ಪರಿಗಣಿಸಿ.',
      helpOnTheWay: 'ಸಹಾಯ ಬರುತ್ತಿದೆ. ಶಾಂತವಾಗಿರಿ ಮತ್ತು ಸುರಕ್ಷಿತವಾ��ಿರಿ.',
      stayCalm: 'ಶಾಂತವಾಗಿರಿ. ನಿಮ್ಮ ತುರ್ತ�� ಸಂಪರ್ಕಗಳಿಗೆ ತಿಳಿಸಲಾಗಿದೆ.',
      voiceAssistantReady: 'ಸಖಿ ಧ್ವನಿ ಸಹಾಯಕ ನಿಮ್ಮನ್ನು ಸುರಕ್ಷಿತವಾಗಿಡಲು ಸಹಾಯ ಮಾಡಲು ಸಿದ್ಧ.',
      guidanceMode: 'ಧ್ವನಿ ಮಾರ್ಗದರ್ಶನ ಮ��ಡ್ ಸಕ್ರಿಯ.',
      listeningMode: 'ತುರ್ತು ಆದೇಶಗಳನ್ನು ಕೇಳುತ್ತಿದೆ.'
    },
    ta: {
      sosActivated: 'எஸ் ஓ எஸ் அவசர எச்சரிக்கை செயல்படுத்தப்பட்டது. உங்கள் இருப்பிடம் அவசர தொடர்புகளுக்கு அனுப்பப்படுகிறது.',
      sosCountdown: '{seconds} விநாடிகளில் அவசர எச்சரிக்கை அனுப்பப்படும். நிறுத்த ரத்து அழுத்தவும்.',
      sosCancelled: 'எஸ் ஓ எஸ் எச்சரிக்கை ரத்து செய்யப்பட்டது.',
      locationSent: 'உங்கள் இருப்பிடம் அவசர தொடர்புகளுக்கு அனுப்பப்பட்டது.',
      smsDelivered: 'அவசர செய்தி {count} தொடர்புகளுக்கு வழங்கப்பட்டது.',
      smsDeliveryFailed: 'எச்சரிக்கை: செய்தி வழங்கல் தோல்வியடைந்தது. தயவுசெய்து உதவிக்கு அழைக்கவும்.',
      emergencyCircleActive: 'அவசர வட்டம் செயல்படுத்தப்பட்டது. உங்கள் இருப்பிடம் நேரடியாக பகிரப்படுகிறது.',
      emergencyCircleDeactivated: 'அவசர வட்டம் செயலிழந்தது. நீங்கள் பாதுகாப்பாக குறிக்கப்பட்டுள்ளீர்கள்.',
      dangerZoneEntered: 'எச்சரிக்கை: நீங்கள் அதிக ஆபத்து பகுதியில் நுழைந்துள்ளீர்கள். எச்சரிக்கையாக இருங்கள்.',
      safeZoneEntered: 'நீங்கள் இப்போது சரிபார்க்கப்பட்ட பாதுகா��்பான மண்டலத்தில் உள்ளீர்கள்.',
      lowBattery: 'எச்சரிக்கை: உங்கள் தொலைபேசி பேட்டரி குறைவாக உள்ளது. உங்கள் தொடர்புகளுக்கு தெரிவிக்கவும்.',
      helpOnTheWay: 'உதவி வழியில் உள்ளது. அமைத���யாக இருங்கள் மற்றும் பாதுகாப்பாக இருங்கள்.',
      stayCalm: 'அமைதியாக இருங்கள். உங்கள் அவசர தொடர்புகளுக்கு அறிவிக்கப்பட்டுள்ளது.',
      voiceAssistantReady: 'சகி குரல் உதவியாளர் உங்களை பாதுகாப்பாக வைக்க உதவ தயார்.',
      guidanceMode: 'குரல் வழிகாட்டுதல் பயன்முறை செயல்படுத்தப்பட்டது.',
      listeningMode: 'அவசர கட்டளைகளை கேட்கிறது.'
    },
    te: {
      sosActivated: 'ఎస్ ఓ ఎస్ అత్యవసర హెచ్చరిక సక్రియం చేయ���డింది. మీ స్థానం అత్యవసర పరిచయాలకు ప��పబడుతోంది.',
      sosCountdown: '{seconds} సెకన్లలో అత్యవసర హెచ్చరిక పంపబడుతుంది. ఆపడానికి రద్దు నొక్కండి.',
      sosCancelled: 'ఎస్ ఓ ఎస్ హెచ్చరిక రద్దు ���ేయబడింది.',
      locationSent: 'మీ స్థానం అత్యవసర పరిచయాలకు పంపబడింది.',
      smsDelivered: 'అత్యవసర సందేశం {count} పరిచయాలకు అందించబడింది.',
      smsDeliveryFailed: 'హెచ్చరిక: సందేశ డెలివరీ విఫలమైంది. దయచేసి సహాయం కోసం కాల్ చేయండి.',
      emergencyCircleActive: 'అత్యవసర వృత్తం సక్రియం. మీ స్థానం ప్రత్యక్ష ప్రసారం చేయబడుతోంది.',
      emergencyCircleDeactivated: 'అత్యవసర వృత్తం నిష్క్రియం. మీరు సురక్షితంగా గుర్తించబడ్డారు.',
      dangerZoneEntered: 'హెచ్చరిక: మీరు అధిక ప్రమాద ప్రాంతంలోకి ప్రవేశించారు. అప్రమత్తంగా ఉండండి.',
      safeZoneEntered: 'మీరు ఇప్పుడు ధృవీకరించబడిన సురక్షిత మండలంలో ఉన్నారు.',
      lowBattery: 'హెచ్��రిక: మీ ఫోన్ బ్యాటరీ తక్కువగా ఉంది. మీ పరిచయాలకు తెలియజేయడాన్ని పరిగణించండి.',
      helpOnTheWay: 'సహాయం వస్తోంది. ప్రశాంతంగా ఉండండి మరియు సురక్షితంగా ఉండండి.',
      stayCalm: 'ప్రశాంతంగా ఉండండి. మీ అత్యవసర పరిచయాలకు తెలియజేయబడింది.',
      voiceAssistantReady: 'సఖి వాయిస్ అసిస్టెంట్ మిమ్మల్ని సురక్షితంగా ఉంచడానికి సహాయం చేయడానికి సిద్ధం.',
      guidanceMode: 'వాయిస్ గైడెన్స్ మోడ్ సక్రియం చేయబడింది.',
      listeningMode: 'అత్యవసర కమాండ్లను ��ింటోంది.'
    }
  };

  constructor() {
    this.synthesis = window.speechSynthesis;
    this.config = {
      language: 'en',
      rate: 0.9,
      pitch: 1.0,
      volume: 1.0
    };
    this.sosConfig = {
      enableCountdown: true,
      enableLocationAnnouncement: true,
      enableStatusUpdates: true,
      emergencyTone: true
    };

    this.loadConfiguration();
    this.initializeVoiceAssistant();
  }

  private loadConfiguration(): void {
    try {
      const savedConfig = localStorage.getItem('sakhi-voice-config');
      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }

      const savedSOSConfig = localStorage.getItem('sakhi-sos-voice-config');
      if (savedSOSConfig) {
        this.sosConfig = { ...this.sosConfig, ...JSON.parse(savedSOSConfig) };
      }

      const isEnabled = localStorage.getItem('sakhi-voice-enabled');
      this.isEnabled = isEnabled === 'true';
    } catch (error) {
      console.warn('Error loading voice configuration:', error);
    }
  }

  private saveConfiguration(): void {
    try {
      localStorage.setItem('sakhi-voice-config', JSON.stringify(this.config));
      localStorage.setItem('sakhi-sos-voice-config', JSON.stringify(this.sosConfig));
      localStorage.setItem('sakhi-voice-enabled', this.isEnabled.toString());
    } catch (error) {
      console.warn('Error saving voice configuration:', error);
    }
  }

  private initializeVoiceAssistant(): void {
    // Add user interaction listener
    this.setupUserInteractionListener();

    // Wait for voices to load with retry mechanism
    this.initializeVoices();

    // Listen for SMS service events
    this.subscribeToSMSEvents();
    this.subscribeToNotificationEvents();
    this.startMessageProcessor();
  }

  private setupUserInteractionListener(): void {
    const handleUserInteraction = () => {
      this.hasUserInteracted = true;
      document.removeEventListener('click', handleUserInteraction);
      document.removeEventListener('touch', handleUserInteraction);
      document.removeEventListener('keydown', handleUserInteraction);

      // Try to initialize voices again after user interaction
      if (!this.voicesLoaded) {
        setTimeout(() => this.initializeVoices(), 100);
      }
    };

    document.addEventListener('click', handleUserInteraction, { once: true });
    document.addEventListener('touch', handleUserInteraction, { once: true });
    document.addEventListener('keydown', handleUserInteraction, { once: true });
  }

  private initializeVoices(): void {
    const voices = this.synthesis.getVoices();

    if (voices.length === 0 && this.initializationAttempts < this.maxInitializationAttempts) {
      this.initializationAttempts++;

      // Set up voice change listener
      const handleVoicesChanged = () => {
        this.synthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        this.voicesLoaded = true;
        this.selectBestVoice();
      };

      this.synthesis.addEventListener('voiceschanged', handleVoicesChanged);

      // Fallback timeout
      setTimeout(() => {
        if (!this.voicesLoaded) {
          this.synthesis.removeEventListener('voiceschanged', handleVoicesChanged);
          this.voicesLoaded = true;
          this.selectBestVoice();
        }
      }, 2000);
    } else if (voices.length > 0) {
      this.voicesLoaded = true;
      this.selectBestVoice();
    }
  }

  private selectBestVoice(): void {
    try {
      const voices = this.synthesis.getVoices();
      if (voices.length === 0) {
        console.warn('No voices available for speech synthesis');
        return;
      }

      // Prefer female voices for safety app
      const femaleVoices = voices.filter(voice =>
        voice.name.toLowerCase().includes('female') ||
        voice.name.toLowerCase().includes('woman') ||
        voice.name.toLowerCase().includes('samantha') ||
        voice.name.toLowerCase().includes('karen') ||
        voice.name.toLowerCase().includes('zira') ||
        voice.name.toLowerCase().includes('veena') ||
        voice.name.toLowerCase().includes('kanya')
      );

      // Language-specific voice selection
      const languageVoices = voices.filter(voice =>
        voice.lang.startsWith(this.config.language) ||
        voice.lang.includes(this.config.language.split('-')[0])
      );

      // Select best voice based on preference order
      this.config.voice = femaleVoices.find(v => v.lang.startsWith(this.config.language)) ||
                         languageVoices[0] ||
                         femaleVoices[0] ||
                         voices.find(v => v.default) ||
                         voices[0];

      if (this.config.voice) {
        console.log(`Selected voice: ${this.config.voice.name} (${this.config.voice.lang})`);
      }
    } catch (error) {
      console.warn('Error selecting voice:', error);
    }
  }

  private subscribeToSMSEvents(): void {
    // Mock subscription - in real app, this would listen to SMS service events
    console.log('Voice assistant subscribed to SMS service events');
  }

  private subscribeToNotificationEvents(): void {
    // Subscribe to notification service updates
    notificationService.subscribe((notifications) => {
      const unreadNotifications = notifications.filter(n => !n.isRead);
      if (unreadNotifications.length > 0) {
        const latestNotification = unreadNotifications[0];
        this.announceNotification(latestNotification);
      }
    });
  }

  private announceNotification(notification: any): void {
    if (!this.isEnabled || this.emergencyMode) return;

    let announcement = '';
    const priorityMap = {
      urgent: 'Urgent alert',
      high: 'High priority alert',
      medium: 'Safety alert',
      low: 'Information alert'
    };

    const priorityText = priorityMap[notification.priority as keyof typeof priorityMap] || 'Notification';
    announcement = `${priorityText}: ${notification.message}`;

    this.queueMessage(announcement, notification.priority === 'urgent' ? 'emergency' : 'high');
  }

  private startMessageProcessor(): void {
    setInterval(() => {
      if (!this.isProcessingQueue && this.messageQueue.length > 0) {
        this.processMessageQueue();
      }
    }, 1000);
  }

  private processMessageQueue(): void {
    if (this.messageQueue.length === 0 || this.isProcessingQueue) return;

    this.isProcessingQueue = true;

    // Sort by priority: emergency > high > low
    this.messageQueue.sort((a, b) => {
      const priorityOrder = { emergency: 3, high: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    const message = this.messageQueue.shift();
    if (message) {
      this.speakMessage(message.text, message.priority === 'emergency')
        .finally(() => {
          this.isProcessingQueue = false;
        });
    } else {
      this.isProcessingQueue = false;
    }
  }

  private queueMessage(text: string, priority: 'low' | 'high' | 'emergency' = 'low'): void {
    const now = Date.now();

    // Prevent duplicate messages in queue
    const isDuplicate = this.messageQueue.some(msg => msg.text === text);

    // Prevent same message within debounce time (except emergency messages)
    const isRecentDuplicate = priority !== 'emergency' &&
      this.lastSpokenMessage === text &&
      (now - this.lastSpokenTime) < this.debounceTimeMs;

    if (!isDuplicate && !isRecentDuplicate) {
      this.messageQueue.push({ text, priority });
    }
  }

  public enable(): void {
    this.isEnabled = true;
    this.hasUserInteracted = true; // Enabling counts as user interaction
    this.saveConfiguration();

    // Clear disabled-by-user flag when manually enabling
    localStorage.removeItem('sakhi-voice-disabled-by-user');

    // Initialize voices if not already done
    if (!this.voicesLoaded) {
      this.initializeVoices();
    }

    // Delay announcement to ensure everything is ready
    setTimeout(() => {
      this.announceReady();
    }, 500);
  }

  public disable(): void {
    this.isEnabled = false;
    this.stop();
    this.saveConfiguration();

    // Mark as disabled by user to prevent auto-re-enabling
    localStorage.setItem('sakhi-voice-disabled-by-user', 'true');
  }

  public isVoiceEnabled(): boolean {
    return this.isEnabled;
  }

  public setLanguage(language: string): void {
    this.config.language = language;
    this.selectBestVoice();
    this.saveConfiguration();
  }

  public setVoiceSettings(settings: Partial<VoiceConfig>): void {
    this.config = { ...this.config, ...settings };
    this.saveConfiguration();
  }

  public setSOSSettings(settings: Partial<SOSAnnouncementConfig>): void {
    this.sosConfig = { ...this.sosConfig, ...settings };
    this.saveConfiguration();
  }

  private announceReady(): void {
    const phrases = this.emergencyPhrases[this.config.language as keyof typeof this.emergencyPhrases] || this.emergencyPhrases.en;
    this.queueMessage(phrases.voiceAssistantReady, 'low');
  }

  // SOS-specific announcements
  public announceSOSActivation(): void {
    if (!this.isEnabled) return;
    
    this.emergencyMode = true;
    const phrases = this.emergencyPhrases[this.config.language as keyof typeof this.emergencyPhrases] || this.emergencyPhrases.en;
    
    // Play emergency tone first if enabled
    if (this.sosConfig.emergencyTone) {
      this.playEmergencyTone();
    }

    // Immediate SOS announcement
    this.speakMessage(phrases.sosActivated, true);
    
    // Vibrate device if available
    this.vibrateDevice([200, 100, 200, 100, 200]);
  }

  public announceSOSCountdown(seconds: number): void {
    if (!this.isEnabled || !this.sosConfig.enableCountdown) return;
    
    const phrases = this.emergencyPhrases[this.config.language as keyof typeof this.emergencyPhrases] || this.emergencyPhrases.en;
    const message = phrases.sosCountdown.replace('{seconds}', seconds.toString());
    
    this.speakMessage(message, true);
  }

  public announceSOSCancellation(): void {
    if (!this.isEnabled) return;
    
    this.emergencyMode = false;
    const phrases = this.emergencyPhrases[this.config.language as keyof typeof this.emergencyPhrases] || this.emergencyPhrases.en;
    
    this.speakMessage(phrases.sosCancelled, true);
  }

  public announceLocationSent(): void {
    if (!this.isEnabled || !this.sosConfig.enableLocationAnnouncement) return;
    
    const phrases = this.emergencyPhrases[this.config.language as keyof typeof this.emergencyPhrases] || this.emergencyPhrases.en;
    this.queueMessage(phrases.locationSent, 'emergency');
  }

  public announceSMSDelivery(contactCount: number, success: boolean): void {
    if (!this.isEnabled || !this.sosConfig.enableStatusUpdates) return;
    
    const phrases = this.emergencyPhrases[this.config.language as keyof typeof this.emergencyPhrases] || this.emergencyPhrases.en;
    
    const message = success 
      ? phrases.smsDelivered.replace('{count}', contactCount.toString())
      : phrases.smsDeliveryFailed;
    
    this.queueMessage(message, 'emergency');
  }

  public announceEmergencyCircleStatus(active: boolean): void {
    if (!this.isEnabled) return;
    
    const phrases = this.emergencyPhrases[this.config.language as keyof typeof this.emergencyPhrases] || this.emergencyPhrases.en;
    const message = active ? phrases.emergencyCircleActive : phrases.emergencyCircleDeactivated;
    
    this.queueMessage(message, active ? 'emergency' : 'high');
    
    if (!active) {
      this.emergencyMode = false;
    }
  }

  public announceDangerZone(entering: boolean): void {
    if (!this.isEnabled) return;
    
    const phrases = this.emergencyPhrases[this.config.language as keyof typeof this.emergencyPhrases] || this.emergencyPhrases.en;
    const message = entering ? phrases.dangerZoneEntered : phrases.safeZoneEntered;
    
    this.queueMessage(message, 'high');
    
    // Additional vibration for danger zones
    if (entering) {
      this.vibrateDevice([300, 200, 300]);
    }
  }

  public announceLowBattery(): void {
    if (!this.isEnabled) return;
    
    const phrases = this.emergencyPhrases[this.config.language as keyof typeof this.emergencyPhrases] || this.emergencyPhrases.en;
    this.queueMessage(phrases.lowBattery, 'high');
  }

  public announceHelpOnTheWay(): void {
    if (!this.isEnabled) return;
    
    const phrases = this.emergencyPhrases[this.config.language as keyof typeof this.emergencyPhrases] || this.emergencyPhrases.en;
    this.queueMessage(phrases.helpOnTheWay, 'emergency');
  }

  public announceStayCalm(): void {
    if (!this.isEnabled) return;
    
    const phrases = this.emergencyPhrases[this.config.language as keyof typeof this.emergencyPhrases] || this.emergencyPhrases.en;
    this.queueMessage(phrases.stayCalm, 'emergency');
  }

  // General voice functionality
  public speakCustomMessage(message: string, priority: 'low' | 'high' | 'emergency' = 'low'): void {
    if (!this.isEnabled) return;
    this.queueMessage(message, priority);
  }

  private async speakMessage(text: string, isEmergency: boolean = false): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        // Validate prerequisites
        if (!this.synthesis) {
          console.warn('Speech synthesis not supported');
          resolve(); // Don't reject, just skip silently
          return;
        }

        if (!this.hasUserInteracted && !isEmergency) {
          console.warn('Speech requires user interaction first');
          resolve(); // Don't reject, just skip silently
          return;
        }

        if (!text || text.trim().length === 0) {
          console.warn('Empty text provided for speech');
          resolve();
          return;
        }

        // Check if synthesis is paused and resume if needed
        if (this.synthesis.paused) {
          this.synthesis.resume();
        }

        // Stop current speech if it's not emergency or if this is emergency
        if (this.currentUtterance && (isEmergency || !this.emergencyMode)) {
          this.synthesis.cancel();
          this.currentUtterance = null;
        }

        // Wait a bit for cancel to complete
        setTimeout(() => {
          try {
            const utterance = new SpeechSynthesisUtterance(text.trim());

            // Configure utterance with safe defaults
            utterance.lang = this.config.language || 'en-US';
            utterance.rate = Math.max(0.1, Math.min(2.0, isEmergency ? Math.min(this.config.rate + 0.1, 1.0) : this.config.rate));
            utterance.pitch = Math.max(0, Math.min(2, this.config.pitch));
            utterance.volume = Math.max(0, Math.min(1, isEmergency ? 1.0 : this.config.volume));

            // Only set voice if it's available
            if (this.config.voice && this.voicesLoaded) {
              try {
                utterance.voice = this.config.voice;
              } catch (voiceError) {
                console.warn('Error setting voice, using default:', voiceError);
              }
            }

            let timeoutId: NodeJS.Timeout;
            let resolved = false;

            const cleanup = () => {
              if (timeoutId) clearTimeout(timeoutId);
              this.currentUtterance = null;
              resolved = true;
            };

            utterance.onstart = () => {
              console.log('Speech started:', text.substring(0, 50) + '...');
              this.lastSpokenMessage = text;
              this.lastSpokenTime = Date.now();
            };

            utterance.onend = () => {
              if (!resolved) {
                cleanup();
                resolve();
              }
            };

            utterance.onerror = (event: SpeechSynthesisErrorEvent) => {
              if (!resolved) {
                cleanup();
                console.warn('Speech synthesis error:', {
                  error: event.error,
                  message: event.message,
                  text: text.substring(0, 50) + '...'
                });

                // Don't reject on common errors, just resolve silently
                if (event.error === 'not-allowed' || event.error === 'network' || event.error === 'service-unavailable') {
                  resolve();
                } else {
                  resolve(); // Changed from reject to resolve to prevent unhandled promise rejections
                }
              }
            };

            // Set timeout for long-running speech
            timeoutId = setTimeout(() => {
              if (!resolved) {
                console.warn('Speech synthesis timeout');
                this.synthesis.cancel();
                cleanup();
                resolve();
              }
            }, Math.max(5000, text.length * 100)); // Dynamic timeout based on text length

            this.currentUtterance = utterance;
            this.synthesis.speak(utterance);

          } catch (utteranceError) {
            console.warn('Error creating speech utterance:', utteranceError);
            resolve(); // Don't reject, just resolve silently
          }
        }, isEmergency ? 50 : 100); // Shorter delay for emergency messages

      } catch (error) {
        console.warn('Speech synthesis error:', error);
        resolve(); // Don't reject, just resolve silently
      }
    });
  }

  private playEmergencyTone(): void {
    try {
      if (!this.hasUserInteracted) {
        console.warn('Cannot play emergency tone without user interaction');
        return;
      }

      // Create audio context for emergency tone
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('Web Audio API not supported');
        return;
      }

      const audioContext = new AudioContextClass();

      // Check if audio context needs to be resumed (Chrome requirement)
      if (audioContext.state === 'suspended') {
        audioContext.resume().then(() => {
          this.generateEmergencyTone(audioContext);
        }).catch((error) => {
          console.warn('Could not resume audio context:', error);
        });
      } else {
        this.generateEmergencyTone(audioContext);
      }
    } catch (error) {
      console.warn('Could not play emergency tone:', error);
    }
  }

  private generateEmergencyTone(audioContext: AudioContext): void {
    try {
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Emergency siren-like tone
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(1200, audioContext.currentTime + 0.5);
      oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 1);

      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime); // Reduced volume
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 1);

      // Clean up audio context
      setTimeout(() => {
        audioContext.close().catch((error) => {
          console.warn('Error closing audio context:', error);
        });
      }, 1500);
    } catch (error) {
      console.warn('Error generating emergency tone:', error);
    }
  }

  private vibrateDevice(pattern: number[] = [200]): void {
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch (error) {
      console.warn('Vibration not supported:', error);
    }
  }

  public stop(): void {
    try {
      if (this.synthesis) {
        this.synthesis.cancel();

        // Wait a bit and cancel again to ensure it's really stopped
        setTimeout(() => {
          if (this.synthesis) {
            this.synthesis.cancel();
          }
        }, 100);
      }

      this.currentUtterance = null;
      this.messageQueue = [];
      this.isProcessingQueue = false;
      this.emergencyMode = false;
    } catch (error) {
      console.warn('Error stopping voice synthesis:', error);
    }
  }

  public pause(): void {
    if (this.synthesis) {
      this.synthesis.pause();
    }
  }

  public resume(): void {
    if (this.synthesis) {
      this.synthesis.resume();
    }
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return this.synthesis.getVoices();
  }

  public isSupported(): boolean {
    return 'speechSynthesis' in window;
  }

  public getConfig(): VoiceConfig {
    return { ...this.config };
  }

  public getSOSConfig(): SOSAnnouncementConfig {
    return { ...this.sosConfig };
  }

  // Integration with existing services
  public integrateWithSMSService(smsService: any): void {
    // Hook into SMS service events
    const originalSendSOS = smsService.sendSOSAlert?.bind(smsService);
    if (originalSendSOS) {
      smsService.sendSOSAlert = async (...args: any[]) => {
        this.announceSOSActivation();
        try {
          const result = await originalSendSOS(...args);
          this.announceLocationSent();
          this.announceSMSDelivery(args[0]?.contacts?.length || 1, true);
          return result;
        } catch (error) {
          this.announceSMSDelivery(0, false);
          throw error;
        }
      };
    }
  }
}

export const voiceAssistantService = new VoiceAssistantService();
export default voiceAssistantService;
