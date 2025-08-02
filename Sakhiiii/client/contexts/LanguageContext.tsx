import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, LanguageOption } from '@shared/types';
import { enhancedVoiceService } from '@/services/enhancedVoiceService';

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  availableLanguages: LanguageOption[];
  t: (key: string) => string;
}

const languageOptions: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు' },
];

// Basic translations - in a real app, these would come from a translation service
const translations: Record<Language, Record<string, string>> = {
  en: {
    'app.name': 'Sakhi',
    'landing.title': 'Your Safety, Our Priority',
    'landing.subtitle': 'Empowering women with tools for safety, community support, and emergency assistance.',
    'landing.cta': 'Get Started',
    'landing.features.sos': 'Emergency SOS',
    'landing.features.routes': 'Safe Routes',
    'landing.features.community': 'Community Support',
    'landing.features.reports': 'Incident Reports',
    'auth.signin': 'Sign In with Google',
    'nav.home': 'Home',
    'nav.routes': 'Routes',
    'nav.reports': 'Reports',
    'nav.community': 'Community',
    'nav.profile': 'Profile',
    'language.select': 'Select Language',
  },
  hi: {
    'app.name': 'सखी',
    'landing.title': 'आपकी सुरक्षा, हमारी प्राथमिकता',
    'landing.subtitle': 'महिलाओं को सुरक्षा, सामुदायिक सहायता और आपातकालीन सहायता के उपकरणों के साथ सशक्त बनाना।',
    'landing.cta': 'शुरू करें',
    'landing.features.sos': 'आपातकालीन SOS',
    'landing.features.routes': '���ुरक्षित मार्ग',
    'landing.features.community': 'सामुदायिक सह���यता',
    'landing.features.reports': 'घटना रिपोर्ट',
    'auth.signin': 'Google से साइन इन करें',
    'nav.home': 'होम',
    'nav.routes': 'मार्ग',
    'nav.reports': 'रिपोर्ट',
    'nav.community': 'समुदाय',
    'nav.profile': 'प्रोफ़ाइल',
    'language.select': 'भाषा चुनें',
  },
  kn: {
    'app.name': 'ಸಖಿ',
    'landing.title': 'ನಿಮ್ಮ ಸುರಕ್ಷತೆ, ನಮ್ಮ ಆದ್ಯತೆ',
    'landing.subtitle': 'ಮಹಿಳೆಯರನ್ನು ಸುರಕ್ಷತೆ, ಸಮುದಾಯ ಬೆಂಬಲ ಮತ್ತು ತುರ್ತು ಸಹಾಯದ ಸಾಧನಗಳೊಂದಿಗೆ ಸಶಕ್ತಗೊಳಿಸುವುದು.',
    'landing.cta': 'ಪ್ರಾರಂಭಿಸಿ',
    'landing.features.sos': 'ತುರ್ತು SOS',
    'landing.features.routes': 'ಸುರಕ್ಷಿತ ಮಾರ್ಗಗಳು',
    'landing.features.community': 'ಸಮುದಾಯ ಬೆಂಬಲ',
    'landing.features.reports': 'ಘಟನೆ ವರದಿಗಳು',
    'auth.signin': 'Google ನೊಂದಿಗೆ ಸೈನ್ ಇ��್ ಮಾಡಿ',
    'nav.home': 'ಮುಖ್ಯ',
    'nav.routes': 'ಮಾರ್ಗಗಳು',
    'nav.reports': 'ವರದಿಗಳು',
    'nav.community': 'ಸಮುದಾಯ',
    'nav.profile': 'ಪ್ರೊಫೈಲ್',
    'language.select': 'ಭಾಷೆ ಆಯ್ಕೆಮಾ��ಿ',
  },
  ta: {
    'app.name': 'சகி',
    'landing.title': 'உங்கள் பாதுகாப்பு, எங்கள் முன்னுரிமை',
    'landing.subtitle': 'பெண்களை பாதுகாப்பு, சமுதாய ஆதரவு மற்றும் அவசர உதவியின் கருவிகளுடன் மேம்படுத்துதல்.',
    'landing.cta': 'தொடங்குக',
    'landing.features.sos': 'அவசர SOS',
    'landing.features.routes': 'பாதுகாப்பான வழிகள்',
    'landing.features.community': 'சமுதாய ஆதரவு',
    'landing.features.reports': 'சம்பவ அறிக்கைகள்',
    'auth.signin': 'Google உடன் உள்நுழையவும்',
    'nav.home': 'முகப்பு',
    'nav.routes': 'வழிகள்',
    'nav.reports': 'அறிக்கைகள்',
    'nav.community': 'சமுதாயம்',
    'nav.profile': 'சுயவிவரம்',
    'language.select': 'மொழியைத் தேர்ந்தெடுக்கவும்',
  },
  te: {
    'app.name': 'సఖి',
    'landing.title': 'మీ భద్రత, మా ప్రాధాన్యత',
    'landing.subtitle': 'మహిళలను భద్రత, కమ్యూనిటీ మద్దతు మరియు అత్యవసర సహాయం యొక్క సాధనాలతో సాధికారత కల్పించడం.',
    'landing.cta': 'ప్రారంభించండి',
    'landing.features.sos': 'అత్యవసర SOS',
    'landing.features.routes': 'సురక్షిత మార్గాలు',
    'landing.features.community': 'కమ్యూనిటీ మద్దతు',
    'landing.features.reports': 'సంఘటన నివేదికలు',
    'auth.signin': 'Google తో సైన్ ఇన్ చేయండి',
    'nav.home': 'హోమ్',
    'nav.routes': 'మార్గాలు',
    'nav.reports': 'నివేదికలు',
    'nav.community': 'కమ్యూనిటీ',
    'nav.profile': 'ప్రొఫైల్',
    'language.select': 'భాష ఎంచుకోండి',
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('preferred-language') as Language;
    if (savedLanguage && languageOptions.find(lang => lang.code === savedLanguage)) {
      setCurrentLanguage(savedLanguage);
      enhancedVoiceService.setLanguage(savedLanguage);
    } else {
      enhancedVoiceService.setLanguage(currentLanguage);
    }
  }, []);

  // Sync voice service when current language changes
  useEffect(() => {
    enhancedVoiceService.setLanguage(currentLanguage);
  }, [currentLanguage]);

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    localStorage.setItem('preferred-language', language);
    // Update voice service language when language changes
    enhancedVoiceService.setLanguage(language);
  };

  const t = (key: string): string => {
    return translations[currentLanguage][key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        availableLanguages: languageOptions,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};
