interface VoiceConfig {
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
}

const languageConfigs: Record<string, VoiceConfig> = {
  'en': { lang: 'en-IN', rate: 0.9, pitch: 1.0, volume: 0.8 },
  'hi': { lang: 'hi-IN', rate: 0.85, pitch: 1.1, volume: 0.8 },
  'te': { lang: 'te-IN', rate: 0.8, pitch: 1.0, volume: 0.8 },
  'ta': { lang: 'ta-IN', rate: 0.8, pitch: 1.0, volume: 0.8 },
  'kn': { lang: 'kn-IN', rate: 0.8, pitch: 1.0, volume: 0.8 }
};

const safetyMessages = {
  'en': {
    enteringRiskZone: "Warning! You are entering a high risk area. Please stay alert and consider an alternative route.",
    exitingRiskZone: "You have left the risk area. You are now in a safer zone.",
    sosActivated: "SOS alert has been activated. Emergency contacts are being notified.",
    navigationStarted: "Safe navigation started. I will guide you through the safest route.",
    reachedDestination: "You have safely reached your destination. Have a great day!",
    medicineReminder: "It's time to take your medicine. Don't forget to stay healthy!",
    periodTracker: "Your period is predicted to start in 3 days. Take care of yourself.",
    safetyTip: "Remember to share your location with trusted contacts when traveling alone."
  },
  'hi': {
    enteringRiskZone: "चेतावनी! आप एक उच्च जोखिम वाले क्षेत्र में प्रवेश कर रहे हैं। कृपया सतर्क रहें और वैकल्पिक मार्ग पर विचार करें।",
    exitingRiskZone: "आपने जोखिम क्षेत्र छोड़ दिया है। अब आप एक सुरक्षित क्षेत्र में हैं।",
    sosActivated: "एसओएस अलर्ट सक्रिय हो गया है। आपातकालीन संपर्कों को सूचित किया जा रहा है।",
    navigationStarted: "सुरक्षित नेवीगेशन शुरू हुआ। मैं आपको सबसे सुरक्षित म���र्ग से मार्गदर्शन करूंगा।",
    reachedDestination: "आप सुरक्षित रूप से अपने गंतव्य पहुंच गए हैं। आपका दिन शुभ हो!",
    medicineReminder: "आपकी दवा लेने का समय है। स्वस्थ रहना न भूलें!",
    periodTracker: "आपका पीरियड 3 दिनों में शुरू होने की भविष्यवाणी है। अपना ख्याल रखें।",
    safetyTip: "अकेले यात्रा करते समय विश्वसनीय संपर्कों के साथ अपना स्थान साझा करना याद रखें।"
  },
  'te': {
    enteringRiskZone: "హెచ్చరిక! మీరు అధిక ప్రమాద ప్రాంతంలోకి ప్రవేశిస్తున్నారు. దయచేసి అప్రమత్తంగా ఉండండి మరియు ప్రత్యామ్నాయ మార్గాన్ని పరిగణించండి।",
    exitingRiskZone: "మీరు ప్రమాద ప్రాంతాన్ని విడిచి��ెట్టారు. ఇప్పుడు మీరు సురక్షితమైన ప్రాంతంలో ఉన్నారు।",
    sosActivated: "ఎస్ఒఎస్ అలర్ట్ సక్రియం చేయబడింది. అత్యవసర పరిచయాలకు తెలియజేస్తున్నాము।",
    navigationStarted: "సురక్షిత నావిగేషన్ ప్రారంభమైంది. నేను మిమ్మల్ని అత్యంత సురక్షితమైన మార్గంలో మార్గనిర్దేశనం చేస్తాను।",
    reachedDestination: "మీరు సురక్షితంగా మీ గమ్యస్థానానికి చేరుకున్నారు. మంచి రోజు గడపండి!",
    medicineReminder: "మీ మందు తీసుకునే సమయం వచ్చింది. ఆరోగ్యంగా ఉండటం మర్చిపోకండి!",
    periodTracker: "మీ పీరియడ్ 3 రోజుల్లో మొదలు కావాలని అంచనా. మిమ్మల్ని మీరు జాగ్రత్తగా చూసుకోండి।",
    safetyTip: "ఒం���రిగా ప్రయాణిస్తున్నప్పుడు విశ్వసనీయ పరిచయాలతో మీ స్థానాన్ని పంచుకోవాలని గుర్తుంచుకోండి।"
  },
  'ta': {
    enteringRiskZone: "எச்சரிக்கை! நீங்கள் அதிக ஆபத்துள்ள பகுதியில் நுழைகிறீர்கள். தயவுசெய்து எச்சரிக்கையாக இருங்கள் மற்றும் மாற்று வழியைக் கருத்தில் கொள்ளுங்கள்.",
    exitingRiskZone: "நீங்கள் ஆபத்து பகுதியை விட்டு வெளியேறிவிட்டீர்கள். இப்போது நீங்கள் பாதுகாப்பான பகுதியில் உள்ளீர்கள்.",
    sosActivated: "எஸ்ஓஎஸ் அலர்ட் செயல்படுத்தப்பட்டுள்ளது. அவசர தொடர்புகளுக்கு அறிவிக்கப்படுகிறது.",
    navigationStarted: "பாதுகாப்பான வழிசெலுத்தல் தொடங்கியது. நான் உங்களை மிகவும் பாதுகாப்பான வழியில் வழிநடத்துவேன்.",
    reachedDestination: "நீங்கள் பாதுகாப்பாக உங்கள் இலக்கை அடைந்துவிட்டீர்கள். நல்ல நாள் அனுபவிக்கவும்!",
    medicineReminder: "உங்கள் மருந்து எடுக்கும் நேரம் வந்துவிட்டது. ஆரோக்கியமாக இருக்க மறக்காதீர்கள்!",
    periodTracker: "உங்கள் மாதவிடாய் 3 நாட்களில் தொடங்கும் என்று கணிக்கப்படுகிறது. உங்களை நீங்களே கவனித்துக்கொள்ளுங்கள்.",
    safetyTip: "தனியாக பயணிக்கும்போது நம்பகமான தொடர்புகளுடன் உங்கள் இருப்பிடத்தைப் பகிர்ந்துகொள்ள நினைவில் கொள்ளுங்கள்."
  },
  'kn': {
    enteringRiskZone: "ಎಚ್ಚರಿಕೆ! ನೀವು ಹೆಚ್ಚಿನ ಅಪಾಯದ ಪ್ರದೇಶವನ್ನು ಪ್ರವೇಶಿಸುತ್ತಿದ್ದೀರಿ. ದಯವಿಟ್ಟು ಜಾಗರೂಕರಾಗಿರಿ ಮತ್ತು ಪರ್ಯಾಯ ಮಾರ್ಗವನ್ನು ಪರಿಗಣಿಸಿ.",
    exitingRiskZone: "ನೀವು ಅಪಾಯದ ಪ್ರದೇಶವನ್ನು ತೊರೆದಿದ್ದೀರಿ. ಈಗ ನೀವು ಸುರಕ್ಷಿತ ಪ್ರದೇಶದಲ್ಲಿದ್ದೀರಿ.",
    sosActivated: "ಎಸ್ಒಎಸ್ ಅಲರ್ಟ್ ಸಕ್ರಿಯಗೊಳಿಸಲಾಗಿದೆ. ತುರ್ತು ಸಂಪರ್ಕಗಳಿಗೆ ತಿಳಿಸಲಾಗುತ್ತಿದೆ.",
    navigationStarted: "ಸುರಕ್ಷಿತ ನೇವಿಗೇಷನ್ ಪ್ರಾರಂಭವಾಗಿದೆ. ನಾನು ನಿಮ್ಮನ್ನು ಅತ್ಯಂತ ಸುರಕ್ಷಿತ ಮಾರ್ಗದಲ್ಲಿ ಮಾರ್ಗದರ್ಶನ ಮಾಡುತ್ತೇನೆ.",
    reachedDestination: "ನೀವು ಸುರಕ್ಷಿತವಾಗಿ ನಿಮ್ಮ ಗಮ್ಯಸ್ಥಾನವನ್ನು ತಲುಪಿದ್ದೀರಿ. ಒಳ್ಳೆಯ ದಿನ ಕಳೆಯಿರಿ!",
    medicineReminder: "ನಿಮ್ಮ ಔಷಧಿ ತೆಗೆದ��ಕೊಳ್ಳುವ ಸಮಯ ಬಂದಿದೆ. ಆರೋಗ್ಯವಾಗಿರಲು ಮರೆಯಬೇಡಿ!",
    periodTracker: "ನಿಮ್ಮ ಪೀರಿಯಡ್ 3 ದಿನಗಳಲ್ಲಿ ಪ್ರಾರಂಭವಾಗುತ್ತದೆ ಎಂದು ಮುನ್ಸೂಚಿಸಲಾಗಿದೆ. ನಿಮ್ಮ ಕಾಳಜಿ ವಹಿಸಿ.",
    safetyTip: "ಒಬ್ಬಂಟಿಯಾಗಿ ಪ್ರಯಾಣಿಸುವಾಗ ವಿಶ್ವಸ್ತ ಸಂಪರ್ಕಗಳೊಂದಿಗೆ ನಿಮ್ಮ ಸ್ಥಳವನ್ನು ಹಂಚಿಕೊಳ್ಳಲು ನೆನಪಿಡಿ."
  }
};

export class EnhancedVoiceService {
  private currentLanguage: string = 'en';
  private isEnabled: boolean = true;
  private availableVoices: SpeechSynthesisVoice[] = [];

  constructor() {
    this.initializeVoices();
  }

  private initializeVoices() {
    const updateVoices = () => {
      this.availableVoices = speechSynthesis.getVoices();
    };

    updateVoices();
    speechSynthesis.onvoiceschanged = updateVoices;
  }

  setLanguage(language: string) {
    this.currentLanguage = language;
  }

  enable() {
    this.isEnabled = true;
  }

  disable() {
    this.isEnabled = false;
    speechSynthesis.cancel();
  }

  private getBestVoice(language: string): SpeechSynthesisVoice | null {
    const config = languageConfigs[language] || languageConfigs['en'];
    
    // First try to find exact language match
    let voice = this.availableVoices.find(v => v.lang === config.lang);
    
    // If not found, try broader language match
    if (!voice) {
      const langCode = config.lang.split('-')[0];
      voice = this.availableVoices.find(v => v.lang.startsWith(langCode));
    }
    
    // Fall back to English if available
    if (!voice) {
      voice = this.availableVoices.find(v => v.lang.startsWith('en'));
    }
    
    return voice || null;
  }

  speak(messageKey: keyof typeof safetyMessages['en'], customMessage?: string) {
    if (!this.isEnabled || !('speechSynthesis' in window)) return;

    const messages = safetyMessages[this.currentLanguage as keyof typeof safetyMessages] || safetyMessages['en'];
    const message = customMessage || messages[messageKey];
    
    if (!message) return;

    speechSynthesis.cancel(); // Cancel any ongoing speech

    const utterance = new SpeechSynthesisUtterance(message);
    const config = languageConfigs[this.currentLanguage] || languageConfigs['en'];
    const voice = this.getBestVoice(this.currentLanguage);

    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.lang = config.lang;
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = config.volume;

    utterance.onerror = (event) => {
      console.warn('Speech synthesis error:', event.error);
    };

    speechSynthesis.speak(utterance);
  }

  // Convenience methods for common scenarios
  announceRiskZoneEntry() {
    this.speak('enteringRiskZone');
    // Also vibrate if supported
    if (navigator.vibrate) {
      navigator.vibrate([200, 100, 200, 100, 200]);
    }
  }

  announceRiskZoneExit() {
    this.speak('exitingRiskZone');
    if (navigator.vibrate) {
      navigator.vibrate([100]);
    }
  }

  announceSOS() {
    this.speak('sosActivated');
    if (navigator.vibrate) {
      navigator.vibrate([300, 200, 300, 200, 300]);
    }
  }

  announceNavigationStart() {
    this.speak('navigationStarted');
  }

  announceMedicineReminder() {
    this.speak('medicineReminder');
    if (navigator.vibrate) {
      navigator.vibrate([100, 50, 100]);
    }
  }

  announcePeriodPrediction() {
    this.speak('periodTracker');
  }

  announceSafetyTip() {
    this.speak('safetyTip');
  }

  // Custom message with language detection
  speakCustom(message: string, language?: string) {
    if (!this.isEnabled || !('speechSynthesis' in window)) return;

    const lang = language || this.currentLanguage;
    const config = languageConfigs[lang] || languageConfigs['en'];
    const voice = this.getBestVoice(lang);

    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(message);
    
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.lang = config.lang;
    utterance.rate = config.rate;
    utterance.pitch = config.pitch;
    utterance.volume = config.volume;

    speechSynthesis.speak(utterance);
  }

  // Test voice for a specific language
  testVoice(language: string) {
    const messages = safetyMessages[language as keyof typeof safetyMessages] || safetyMessages['en'];
    this.speakCustom(messages.safetyTip, language);
  }

  isVoiceSupported(language: string): boolean {
    const config = languageConfigs[language];
    if (!config) return false;
    
    return this.availableVoices.some(voice => 
      voice.lang === config.lang || voice.lang.startsWith(config.lang.split('-')[0])
    );
  }

  getAvailableLanguages(): string[] {
    return Object.keys(languageConfigs).filter(lang => this.isVoiceSupported(lang));
  }
}

export const enhancedVoiceService = new EnhancedVoiceService();
