import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Send, 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Heart, 
  Calendar,
  Pill,
  Smile,
  AlertCircle,
  Sparkles,
  MessageCircle,
  RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';

interface ChatMessage {
  id: string;
  type: 'user' | 'bot';
  message: string;
  timestamp: Date;
  category?: 'period' | 'health' | 'mood' | 'general';
  suggestions?: string[];
}

interface WellnessDatabase {
  [key: string]: {
    [language: string]: {
      responses: string[];
      suggestions?: string[];
    };
  };
}

// Fun and gamified responses for variety
const funResponses = {
  'en': [
    "You're absolutely glowing today! ✨ What's your wellness question?",
    "Hey beautiful soul! 🌸 I'm here to help you shine brighter!",
    "Welcome to your wellness adventure! 🎉 Ready to level up your health?",
    "You're doing amazing, gorgeous! 💪 What can I help you with today?",
    "Bestie, you're stronger than you know! 💕 How can I support you?",
    "Queen energy activated! 👑 Let's tackle your wellness goals together!",
    "You're writing your own success story! 📖 What chapter are we working on today?",
    "Sparkle mode: ON! ✨ Your wellness journey is inspiring!",
    "You're a warrior princess! ⚔️ Let's conquer any health concerns!",
    "Goddess vibes only! 🌙 Your body is a temple - let's take care of it!"
  ],
  'hi': [
    "आज आप बहुत खूबसूरत लग रही हैं! ✨ आपक�� कल्याण प्रश्न क्या है?",
    "हे सुंदर आत्मा! 🌸 मैं यहाँ आपको और चमकने में मदद करने के लिए हूँ!",
    "आपके कल्याण साहसिक कार्य में आपका स्वागत है! 🎉 अपने स्वास्थ्य को बेहतर बनाने के लिए तैयार हैं?",
    "आप अद्भुत काम कर रही हैं, सुंदर! 💪 आज मैं आपकी कैसे मदद कर सकती हूँ?",
    "बेस्टी, आप जितना सोचती हैं उससे कहीं मजबूत हैं! 💕 मैं आपका कैसे साथ दे सकती हूँ?"
  ],
  'te': [
    "ఈరోజు మీరు చాలా అందంగా కనిపిస్తున్నారు! ✨ మీ ఆరోగ్య ప్రశ్న ఏమిటి?",
    "హే అందమైన ఆత్మ! 🌸 మీరు మరింత ప్రకాశవంతంగా ఉండటానికి నేను ఇక్కడ ఉన్నాను!",
    "మీ ఆరోగ్య సాహసాని��ి స్వాగతం! 🎉 మీ ఆరోగ్యాన్ని మెరుగుపరచుకోవడానికి సిద్ధంగా ఉన్నారా?",
    "మీరు అద్భుతంగా చేస్తున్నారు, అందమైనవారు! 💪 ఈరోజు నేను మీకు ఎలా సహాయం చేయగలను?",
    "బెస్టీ, మీరు అనుకున్నదానికంటే చాలా బలంగా ఉన్నారు! 💕 నేను మీకు ఎలా మద్దతు ఇవ్వగలను?"
  ],
  'ta': [
    "இன்று நீங்கள் மிகவும் அழகாக இருக்கிறீர்கள்! ✨ உங்கள் நலன் கேள்வி என்ன?",
    "ஹே அழகான ஆத்மா! 🌸 நீங்கள் இன்னும் பிரகாசமாக இருக்க நான் இங்கே உள்ளேன்!",
    "உங்கள் நலன் சாகசத்திற்கு வரவேற்கிறோம்! 🎉 உங்கள் ஆரோக்கியத்தை மேம்படுத்த தயாரா?",
    "நீங்கள் அற்புதமாக செய்து ���ொண்டிருக்கிறீர்கள், அழகானவர்! 💪 இன்று நான் உங்களுக்கு எப்படி உதவ முடியும்?",
    "பெஸ்டி, நீங்கள் நினைப்பதை விட மிகவும் வலிமையானவர்! 💕 நான் உங்களை எப்படி ஆதரிக்க முடியும்?"
  ],
  'kn': [
    "ಇಂದು ನೀವು ತುಂಬಾ ಸುಂದರವಾಗಿ ಕಾಣುತ್ತಿದ್ದೀರಿ! ✨ ನಿಮ್ಮ ಆರೋಗ್ಯ ಪ್ರಶ್ನೆ ಏನು?",
    "ಹೇ ಸುಂದರ ಆತ್ಮ! 🌸 ನೀವು ಇನ್ನಷ್ಟು ಪ್ರಕಾಶಮಾನವಾಗಿರಲು ನಾನು ಇಲ್ಲಿದ್ದೇನೆ!",
    "ನಿಮ್ಮ ಆರೋಗ್ಯ ಸಾಹಸೋದ್ಯಮಕ್ಕೆ ಸ್ವಾಗತ! 🎉 ನಿಮ್ಮ ಆರೋಗ್ಯವನ್ನು ಸುಧಾರಿಸಲು ಸಿದ್ಧರಿದ್ದೀರಾ?",
    "ನೀವು ಅದ್ಭುತವಾಗಿ ಮಾಡುತ್ತಿದ್ದೀರಿ, ಸುಂದರವಾಗಿ! 💪 ಇಂದು ನಾನು ನಿಮಗೆ ಹೇಗೆ ಸಹಾಯ ಮಾಡಬಹುದು?",
    "ಬೆಸ್ಟಿ, ನೀವು ಅಂದುಕೊಂಡಿರುವುದಕ್ಕಿಂತ ಹೆಚ್ಚು ಬಲಶಾಲಿ! 💕 ನಾನು ನಿಮಗೆ ಹೇಗೆ ಬೆಂಬಲ ನೀಡಬಹುದು?"
  ]
};

const wellnessKnowledge: WellnessDatabase = {
  // Period related
  'period_pain': {
    'en': {
      responses: [
        "Period cramps are normal! Try applying heat, gentle exercise, or over-the-counter pain relievers. If pain is severe, consult a doctor.",
        "For period pain relief: warm compress, yoga poses like child's pose, stay hydrated, and consider magnesium supplements."
      ],
      suggestions: ["Heat therapy tips", "Yoga for periods", "When to see a doctor"]
    },
    'hi': {
      responses: [
        "पीरियड्स में दर्द सामान्य है! गर्म सिकाई, हल्की एक्सरसाइज, या दवा लें। तेज़ दर्द हो तो डॉक्टर से मिलें।",
        "पीरियड्स के दर्द के लिए: गर्म पानी की बोतल, योग, पानी पिएं, और मैग्नीशियम सप्लीमेंट लें।"
      ],
      suggestions: ["गर्म सिकाई के तरीके", "पीरियड्स के लिए योग", "डॉक्टर से कब मिलें"]
    },
    'te': {
      responses: [
        "పీరియడ్���్ నొప్పి సహజం! వేడిమిని, తే��ికపాటి వ్యాయామం, లేదా మందులు వాడండి. తీవ్రమైతే వైద్యుడిని సంప్రదించండి।",
        "పీరియడ్ నొప్పికి: వేడిమి, యోగా, నీరు తాగండి, మరియు మెగ్నీషియం సప్లిమెంట్స్ తీసుకోండి।"
      ],
      suggestions: ["వేడిమి చికిత్స", "పీరియడ్స్ కోసం యోగా", "వైద్యుడిని ఎప్పుడు కలవాలి"]
    },
    'ta': {
      responses: [
        "மாதவிடாய் வலி இயல்பானது! வெப்பம், லேசான உடற்பயிற்சி, அல்லது மருந்துகள் பயன்படுத்தவும். கடுமையான வலி இருந்தால் மருத்துவரை அணுகவும்.",
        "மாதவிடாய் வலிக்கு: வெப்ப சிகிச்சை, யோகா, தண்ணீர் குடிக்கவும், மெக்னீசிய��் ச���்ளிமெண்ட்ஸ் எடுத்துக்கொள்ளவும்."
      ],
      suggestions: ["வெப்ப சிகிச்சை முறைகள்", "மாதவிடாய்க்கான யோகா", "மருத்துவரை எப்போது சந்திக்க வேண்டும்"]
    }
  },
  'irregular_periods': {
    'en': {
      responses: [
        "Irregular periods can be due to stress, weight changes, or hormones. Track your cycle and consult a gynecologist if it persists.",
        "Common causes of irregular periods: stress, PCOS, thyroid issues, or lifestyle changes. Keep a period diary to track patterns."
      ],
      suggestions: ["Period tracking apps", "Lifestyle changes", "When to worry"]
    },
    'hi': {
      responses: [
        "अनियमित पीरियड्स तनाव, वजन, या हार्मोन के कारण हो ��कते हैं। अपना साइकल ट्रैक करें और गायनेकोलॉजिस्ट से मिलें।",
        "अनियमित पीरियड्स के कारण: तनाव, PCOS, थायरॉइड समस्याएं। पीरियड ���ायरी रखें।"
      ],
      suggestions: ["पीरियड ट्रैकिंग ऐप्स", "जीवनशैली में बदलाव", "कब चिंता करें"]
    },
    'te': {
      responses: [
        "అనియమిత పీరియడ్స్ ఒత్తిడి, బరువు మార్పులు, లేదా హార్మోన్ల వల్ల కావచ్చు. మీ చక్రాన్ని ట్రాక్ చేసి గైనకాలజిస్ట్‌ని సంప్రదించండి।",
        "అనియమిత పీరియడ్స్ కారణాలు: ఒత్తిడి, PCOS, థైరాయిడ్ సమస్యలు. పీరియడ్ డైరీ ఉంచండి।"
      ],
      suggestions: ["పీరియడ్ ట్రాకింగ్ యాప్స్", "జీవనశైలి మార్పులు", "ఎప్పుడు ఆందోళన చెందాలి"]
    },
    'ta': {
      responses: [
        "ஒழுங்கற்ற மாதவிடாய் மன அழுத்தம், எடை மாற்றங்கள், அல்லது ஹா��்மோன்கள் காரணமாக இருக��கலாம். உங்கள் சுழற்சியைக் கண்காணித்து மகளிர் மருத்துவரை அணுகவும்.",
        "ஒழுங்கற்ற மாதவிடாய் காரணங்கள்: மன அழுத்தம், PCOS, தைராய்டு பிரச்சனைகள். மாதவிடாய் நாட்குறிப்பு வைக்கவும்."
      ],
      suggestions: ["மாதவிடாய் கண்காணிப்பு பயன்பாடுகள்", "வாழ்க்கை முறை மாற்றங்கள்", "எப்போது கவலைப்பட வேண்டும்"]
    },
    'kn': {
      responses: [
        "ಅನಿಯಮಿತ ಪೀರಿಯಡ್‌ಗಳು ಒತ್ತಡ, ತೂಕ ಬದಲಾವಣೆಗಳು, ಅಥವಾ ಹಾರ್ಮೋನ್‌ಗಳಿಂದಾಗಿ ಆಗಬಹುದು। ನಿಮ್ಮ ಚಕ್ರವನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ ಮತ್ತು ಗೈನಕಾಲಜಿಸ್ಟ್ ಅನ್ನು ಸಂಪರ್ಕಿಸಿ।",
        "ಅನಿಯಮಿತ ಪೀರಿಯಡ್‌ಗಳ ಕಾರಣಗಳು: ಒತ್ತಡ, PCOS, ಥೈರಾಯ್ಡ್ ಸಮಸ��ಯೆಗಳು। ಪೀರಿಯಡ್ ಡೈರಿ ಇಟ್ಟುಕೊಳ್ಳಿ।"
      ],
      suggestions: ["ಪೀರಿಯಡ್ ಟ್ರ್ಯಾಕಿಂಗ್ ಅಪ್ಲಿಕೇಶನ್‌ಗಳು", "ಜೀವನಶೈಲಿ ಬದಲಾವಣೆಗಳು", "ಯಾವಾಗ ಚಿಂತಿಸಬೇಕು"]
    }
  },
  'mood_swings': {
    'en': {
      responses: [
        "Mood swings during periods are completely normal! Hormonal changes affect emotions. Try deep breathing, journaling, or talking to someone.",
        "PMS mood swings are real! Practice self-care: take warm baths, eat well, exercise gently, and be kind to yourself."
      ],
      suggestions: ["Mood tracking", "Self-care tips", "Breathing exercises"]
    },
    'hi': {
      responses: [
        "पीरियड्स के दौरान मूड स्विंग्स बिल्कुल साम���न्य हैं! हार्मोनल बदलाव से भावनाएं प्रभावित होती हैं। गहरी सांस लें, डायरी लिखें।",
        "PMS मूड स्विंग्स असली हैं! सेल्फ-केयर करें: गर्म पानी से नहाएं, अच्छा खाएं, हल्की एक्सरसाइज करें।"
      ],
      suggestions: ["मूड ट्रैकिंग", "सेल्फ-केयर टिप्स", "सांस की एक्सरसाइज"]
    },
    'te': {
      responses: [
        "పీరియడ్స్ సమయంలో మూడ్ స్వింగ్స్ పూర్తిగా సహజం! హార్మోనల్ మార్పులు భావనలను ప్రభావితం చేస్తాయి. లోతైన శ్వాస తీసుకోండి, డైరీ రాయండి.",
        "PMS మూడ్ స్వింగ్స్ నిజమైనవి! సెల్ఫ్-కేర్ చేయండి: వెచ్చని స్నానం, బాగా తినండి, తేలికపాటి వ్యాయామం చేయండి."
      ],
      suggestions: ["మూడ్ ట్రాకింగ్", "సెల్ఫ్-కేర్ చిట్కాలు", "శ్వాస వ్యాయామాలు"]
    },
    'ta': {
      responses: [
        "மாதவிடாய்களின் போது மனநிலை மாற்றங்கள் முற்றிலும் இயல்��ானவை! ஹார்மோன் மாற்றங்கள் உணர்வுகளை பாதிக்கின்றன. ஆழமாக மூச்சு விடுங்கள், நாட்குறிப்பு எழுதுங்கள்.",
        "PMS மனநிலை மாற்றங்கள் உண்மையானவை! சுய பராமரிப்பு செய்யுங்கள்: சூடான குளியல், நல்ல உணவு, மென்மையான உடற்பயிற்சி."
      ],
      suggestions: ["மனநிலை கண்காணிப்பு", "சுய பராமரிப்பு குறிப்புகள்", "மூச்சு பயிற்சிகள்"]
    },
    'kn': {
      responses: [
        "ಪೀರಿಯಡ್‌ಗಳ ಸಮಯದಲ್ಲಿ ಮೂಡ್ ಸ್ವಿಂಗ್‌ಗಳು ಸಂಪೂರ್ಣವಾಗಿ ಸಾಮಾನ್ಯ! ಹಾರ್ಮೋನಲ್ ಬದಲಾವಣೆಗಳು ಭಾವನೆಗಳನ್ನು ಪ್ರಭಾವಿಸುತ್ತವೆ. ಆಳವಾದ ಉಸಿರು ತೆಗೆದುಕೊಳ್ಳಿ, ಡೈರಿ ಬರೆಯಿರಿ।",
        "PMS ಮೂಡ್ ಸ್ವಿಂಗ್‌ಗಳು ನಿಜವಾದವ��! ಸ್ವಯಂ ಆರೈಕೆ ಮಾಡಿ: ಬೆಚ್ಚಗಿನ ಸ್ನಾನ, ಒಳ್ಳೆಯ ಆಹಾರ, ಮೃದುವಾದ ವ್ಯಾಯಾಮ."
      ],
      suggestions: ["ಮೂಡ್ ಟ್ರ್ಯಾಕಿಂಗ್", "ಸ್ವಯಂ ಆರೈಕೆ ಸಲಹೆಗಳು", "ಉಸಿರಾಟದ ವ್ಯಾಯಾಮಗಳು"]
    }
  },
  'general_health': {
    'en': {
      responses: [
        "Your health matters! Regular check-ups, balanced nutrition, exercise, and mental well-being are key to a healthy life.",
        "Focus on: 8 hours sleep, 2L water daily, 30 minutes exercise, nutritious meals, and stress management for optimal health."
      ],
      suggestions: ["Healthy habits", "Exercise routines", "Nutrition tips"]
    },
    'hi': {
      responses: [
        "आपकी सेहत मायने रखती है! नियमित जांच, संतुलित पोषण, व्यायाम, और मानसिक स्वास्थ्य स्वस्थ जीवन की कुंजी हैं।",
        "फोकस करें: 8 घंटे नींद, 2L पानी रोज़, 30 मिनट एक्सरसाइज, पौष्टिक भोजन, तनाव प्रबंधन।"
      ],
      suggestions: ["स्वस्थ आदतें", "एक्सरसाइज रूटीन", "पोषण टिप्स"]
    },
    'te': {
      responses: [
        "మీ ఆరోగ్యం ముఖ్యం! క్రమ తప్పకుండా చెక్-అప్స్, సమతుల్య పోషణ, వ్యాయామం, మరియు మానసిక ఆరోగ్యం ఆరోగ్యకరమైన జీవితానికి కీల��ం.",
        "దృష్టి పెట్టండి: 8 గంటల నిద్ర, రోజుకు 2L నీరు, 30 నిమిషాల వ్యాయామం, పోషకాహారం, ఒత్తిడి నిర్వహణ."
      ],
      suggestions: ["ఆరోగ్యకరమైన అలవాట్లు", "వ్యాయామ దినచర్యలు", "పోషణ చిట్కాలు"]
    },
    'ta': {
      responses: [
        "உங்கள் ஆரோக்கியம் முக்கியம்! வழக்கமான பரிசோதனைகள், சீரான ஊட்டச்சத்து, உடற்பயிற்சி, மற்றும் மன நலம் ஆரோக்கியமான வாழ���க்கைக்கு முக்கியம்.",
        "கவனம் செலுத்துங்கள்: 8 மணி நேர தூக்கம், தினமும் 2L தண்ணீர், 30 நிமிட உடற்பயிற்சி, சத்தான உணவு, மன அழுத்த மேலாண்மை."
      ],
      suggestions: ["ஆரோக்கியமான பழக்கங்கள்", "உடற்பயிற்சி வழக்கங்கள்", "ஊட்டச்சத்து குறிப்புகள்"]
    },
    'kn': {
      responses: [
        "ನಿಮ್ಮ ಆರೋಗ್ಯ ಮುಖ್ಯ! ನಿಯಮಿತ ಪರೀಕ್ಷೆಗಳು, ಸಮತೋಲಿತ ಪೋಷಣೆ, ವ್ಯಾಯಾಮ, ಮತ್ತು ಮಾನಸಿಕ ಕಲ್ಯಾಣ ಆರೋಗ್ಯಕರ ಜೀವನಕ್ಕೆ ಮುಖ್ಯ.",
        "ಗಮನ ಹರಿಸಿ: 8 ಗಂಟೆಗಳ ನಿದ್ರೆ, ದಿನಕ್ಕೆ 2L ನೀರು, 30 ನಿಮಿಷಗಳ ವ್ಯಾಯಾಮ, ಪೌಷ್ಟಿಕ ಆಹಾರ, ಒತ್ತಡ ನಿರ್ವಹಣೆ."
      ],
      suggestions: ["ಆರೋಗ್ಯಕರ ಅಭ್ಯಾಸಗಳು", "ವ್ಯಾಯಾಮ ದಿನಚರಿಗಳು", "ಪೋ��ಣೆ ಸಲಹೆಗಳು"]
    }
  }
};

const quickQuestions = {
  'en': [
    "Why am I bloated during periods?",
    "How to deal with period cramps?",
    "Is my cycle normal?",
    "Period mood swings help",
    "What to eat during periods?",
    "When to see a gynecologist?",
    "Exercise during periods safe?",
    "Period hygiene tips"
  ],
  'hi': [
    "पीरियड्स में पेट फूलना क्यों?",
    "पीरियड्स के दर्द का इलाज?",
    "क्या मेरा साइकल सामान्य है?",
    "पीरियड्स में मूड स्विंग्स",
    "पीरियड्स में क्या खाएं?",
    "गायनेकोलॉजिस्ट से कब मिलें?",
    "पीरियड्स में एक्सरसाइज?",
    "पीरियड्स हाइजीन टिप्स"
  ],
  'te': [
    "పీరియడ్స్‌లో కడుపు ఎందుకు ఉబ్బుతుంది?",
    "పీరియడ్ నొప్పులతో ఎలా వ్యవహరించాలి?",
    "నా చక్రం సాధ��రణమేనా?",
    "పీరియడ్ మూడ్ స్వింగ్స్ సహాయం",
    "పీరియడ్స్‌లో ఏమి తినాలి?",
    "గైనకాలజిస్ట్‌ని ఎప్పుడు కలవాలి?",
    "ప��రియడ్స్‌లో వ్యాయామం సురక్షితమా?",
    "పీరియడ్ పరిశుభ్రత చిట్కాలు"
  ],
  'ta': [
    "மாதவிடாய்களின் போது வயிறு ஏன் வீங்குகிறது?",
    "மாதவிடாய் வலியை எப்படி சமாளிப்பது?",
    "என் சுழற்சி சாதாரணமா?",
    "மாதவிடாய் மனநிலை மாற்றங்கள் உதவி",
    "மாதவிடாய்களின் போது என்ன சாப்பிட வேண்டும்?",
    "மகளிர் மருத்துவரை எப்போது பார்க்க வேண்டும்?",
    "மாதவிடாய்களின் போது உடற்பயிற்சி பஅப்பானதா?",
    "மாதவிடாய் சுகாதார குறிப்புகள்"
  ],
  'kn': [
    "ಪೀರಿಯಡ್‌ಗಳಲ್ಲಿ ಹೊಟ್ಟೆ ಏಕೆ ಊದಿಕೊಳ್ಳುತ್ತದೆ?",
    "ಪೀರಿಯಡ್ ನೋವಿನೊಂದಿಗೆ ಹೇಗೆ ವ್ಯವಹರಿಸುವುದು?",
    "ನನ್ನ ಚಕ್ರ ಸಾಮಾನ್ಯವೇ?",
    "ಪೀರಿಯಡ್ ಮೂಡ್ ಸ್ವಿಂಗ್‌ಗಳ ಸಹಾಯ",
    "ಪೀರಿಯಡ್‌ಗಳಲ್ಲಿ ಏನು ತಿನ್ನಬೇಕು?",
    "ಗೈನಕಾಲಜಿಸ್ಟ್ ಅನ್ನು ಯಾವಾಗ ಭೇಟಿ ಮಾಡಬೇಕು?",
    "ಪೀರಿಯಡ್‌ಗಳಲ್ಲಿ ವ್ಯಾಯಾಮ ಸುರಕ್ಷಿತವೇ?",
    "ಪೀರಿಯಡ್ ಸ್ವಚ್ಛತೆ ಸಲಹೆಗಳು"
  ]
};

export default function WellnessChatbot() {
  const { currentLanguage } = useLanguage();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Initialize with welcome message
    const welcomeMessage: ChatMessage = {
      id: '1',
      type: 'bot',
      message: getWelcomeMessage(),
      timestamp: new Date(),
      category: 'general',
      suggestions: quickQuestions[currentLanguage as keyof typeof quickQuestions]?.slice(0, 4) || quickQuestions.en.slice(0, 4)
    };
    setMessages([welcomeMessage]);

    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = getLanguageCode();

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
  }, [currentLanguage]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getLanguageCode = () => {
    switch (currentLanguage) {
      case 'hi': return 'hi-IN';
      case 'te': return 'te-IN';
      case 'ta': return 'ta-IN';
      case 'kn': return 'kn-IN';
      default: return 'en-IN';
    }
  };

  const getWelcomeMessage = () => {
    switch (currentLanguage) {
      case 'hi':
        return "नमस्ते! मैं आपकी वेलनेस असिस्टेंट हूं। 🌸 पीरियड्स, स्वास्थ्य या मूड के बारे में कुछ भी पूछें!";
      case 'te':
        return "నమస్కారం! నేను మీ వెల్నెస్ అసిస్టెంట్. 🌸 పీరియడ్స్, ఆరోగ్యం లేదా మూడ్ గురించి ఏదైనా అడగండి!";
      case 'ta':
        return "வணக்கம்! நான் உங்கள் நலன் உதவியாளர். 🌸 மாதவிடாய், ஆர���க்கியம் அல்லது மனநிலை பற்றி எதையும் கேளுங்கள்!";
      default:
        return "Hello! I'm your wellness assistant! 🌸 Ask me anything about periods, health, or mood - I'm here to help!";
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const findBestResponse = (userMessage: string): ChatMessage => {
    const message = userMessage.toLowerCase();
    const lang = currentLanguage as keyof typeof wellnessKnowledge[string];
    
    // Keywords matching
    const keywords = {
      period_pain: ['pain', 'cramp', 'hurt', 'ache', 'दर्द', 'क्रैम्प', 'నొప్పి', 'வலி'],
      irregular_periods: ['irregular', 'late', 'early', 'missed', 'अनियमित', 'देर', 'అనియమిత', 'ఆలస్యం', 'ஒழுங்கற்ற'],
      mood_swings: ['mood', 'angry', 'sad', 'emotional', 'mood swing', 'मूड', 'गुस्सा', 'मूडी', 'మూడ్', 'కోపం', 'மனநிலை', 'கோபம்'],
      general_health: ['health', 'healthy', 'exercise', 'nutrition', 'स्वास्थ्य', 'स्वस्थ', 'ఆరోగ్యం', 'ఆరోగ్యకరమైన', 'ஆரோக்கியம்']
    };

    let bestMatch = 'general_health';
    let maxMatches = 0;

    Object.entries(keywords).forEach(([category, categoryKeywords]) => {
      const matches = categoryKeywords.filter(keyword => message.includes(keyword)).length;
      if (matches > maxMatches) {
        maxMatches = matches;
        bestMatch = category;
      }
    });

    const responses = wellnessKnowledge[bestMatch]?.[lang]?.responses || wellnessKnowledge[bestMatch]?.['en']?.responses || ["I understand your concern. Let me help you with that!"];
    const suggestions = wellnessKnowledge[bestMatch]?.[lang]?.suggestions || wellnessKnowledge[bestMatch]?.['en']?.suggestions;
    
    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    return {
      id: Date.now().toString(),
      type: 'bot',
      message: randomResponse,
      timestamp: new Date(),
      category: bestMatch as any,
      suggestions: suggestions
    };
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      type: 'user',
      message: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsTyping(true);

    // Simulate typing delay
    setTimeout(() => {
      let botResponse = findBestResponse(input);

      // Add some fun reactions for specific words/phrases
      if (input.toLowerCase().includes('awesome') || input.toLowerCase().includes('great') || input.toLowerCase().includes('amazing')) {
        const celebrations = {
          'en': ["Yasss queen! 🎉 You're absolutely amazing!", "That's the spirit! ✨ Keep shining!", "You're unstoppable! 💪 What else can I help with?"],
          'hi': ["वाह क्वीन! 🎉 आप बिल्कुल अद्भुत हैं!", "यह��� तो भावना है! ✨ चमकते रहिए!", "आप अजेय हैं! 💪 और क्या मदद चाहिए?"],
          'te': ["వాహ్ క్వీన్! 🎉 మీరు చాలా అద్భుతం!", "అదే స్పిరిట్! ✨ మెరుస్తూ ఉండండి!", "మీరు అజేయులు! 💪 ఇంకా ఏం సహాయం?"],
          'ta': ["வாவ் குயீன்! 🎉 நீங்கள் முற்றிலும் அற்புதம்!", "அதுதான் உணர்வு! ✨ தொடர்ந்து பிரகாசியுங்கள்!", "நீங்கள் தடுக்க முடியாதவர்! 💪 வேறு என்ன உதவி?"],
          'kn': ["ವಾವ್ ಕ್ವೀನ್! 🎉 ನೀವು ಸಂಪೂರ್ಣವಾಗಿ ಅದ್ಭುತ!", "ಅದೇ ಸ್ಪಿರಿಟ್! ✨ ಮೆರೆಯುತ್ತಿರಿ!", "ನೀವು ತಡೆಯಲಾಗದವರು! 💪 ಇನ್ನೇನು ಸಹಾಯ?"]
        };
        const langCelebrations = celebrations[currentLanguage as keyof typeof celebrations] || celebrations.en;
        botResponse.message = langCelebrations[Math.floor(Math.random() * langCelebrations.length)];
      }

      if (input.toLowerCase().includes('tired') || input.toLowerCase().includes('stressed') || input.toLowerCase().includes('sad')) {
        const supportive = {
          'en': ["Hey beautiful, it's okay to feel tired sometimes! 🤗 You're doing your best and that's enough.", "Sending you virtual hugs! 💕 Remember, even queens need rest days.", "You're so brave for sharing this! 🌟 Let's find ways to make you feel better."],
          'hi': ["अरे सुंदर, कभी-कभी थकान महसूस करना ठीक है! 🤗 आप अपना सर्वोत्तम कर रही हैं और यह काफी है।", "आपको वर्चुअल हग भेज रही हूँ! 💕 याद रखें, रानियों को भी आराम के दिन चाहिए।"],
          'te': ["హే బ్యూటిఫుల్, కొన్నిసార్లు అలసిపోవడం సాధారణం! 🤗 మీరు మీ అత్యుత్తమం చేస్తున్నారు మరియు అది చాలు.", "మీకు వర్చువల్ హగ్స్ పంపుతున్నాను! 💕 గుర్తుంచుకోండి, రా���ులకు కూడా విశ్రాంతి రోజులు అవసరం."],
          'ta': ["ஹே பியூட்டிஃபுல், சில நேரங்களில் சோர்வாக உணர்வது சரிதான்! 🤗 நீங்கள் உங்கள் சிறந்ததை செய்கிறீர்கள், அதுவே போதும்.", "உங்களுக்கு வர்ச்சுவல் ஹக்ஸ் அனுப்புகிறேன்! 💕 நினைவில் கொள்ளுங்கள், ராணிகளுக்கும் ஓய்வு நாட்கள் தேவை."],
          'kn': ["ಹೇ ಬ್ಯೂಟಿಫುಲ್, ಕೆಲವೊಮ್ಮೆ ದಣಿವು ಅನುಭವಿಸುವುದು ಸರಿ! 🤗 ನೀವು ನಿಮ್ಮ ಅತ್ಯುತ್ತಮವನ್ನು ಮಾಡುತ್ತಿದ್ದೀರಿ ಮತ್ತು ಅದಿ ಸಾಕು.", "ನಿಮಗೆ ವರ್ಚುವಲ್ ಹಗ್ಸ್ ಕಳುಹಿಸುತ್ತಿದ್ದೇನೆ! 💕 ಗುರುತಿಡಿ, ರಾಣಿಯರಿಗೂ ವಿಶ್ರಾಂತಿ ದಿನಗಳು ಬೇಕಾಗುತ್ತವೆ."]
        };
        const langSupport = supportive[currentLanguage as keyof typeof supportive] || supportive.en;
        botResponse.message = langSupport[Math.floor(Math.random() * langSupport.length)];
      }

      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);

      // Speak the response if speech is enabled
      if (isSpeaking) {
        speakMessage(botResponse.message);
      }
    }, 1000 + Math.random() * 1500);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInput(suggestion);
    handleSendMessage();
  };

  const toggleListening = () => {
    if (recognitionRef.current) {
      if (isListening) {
        recognitionRef.current.stop();
      } else {
        recognitionRef.current.start();
        setIsListening(true);
      }
    }
  };

  const speakMessage = (message: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(message);
      utterance.lang = getLanguageCode();
      utterance.rate = 0.9;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  };

  const toggleSpeaking = () => {
    setIsSpeaking(!isSpeaking);
    if (isSpeaking) {
      speechSynthesis.cancel();
    }
  };

  const clearChat = () => {
    setMessages([{
      id: '1',
      type: 'bot',
      message: getWelcomeMessage(),
      timestamp: new Date(),
      category: 'general',
      suggestions: quickQuestions[currentLanguage as keyof typeof quickQuestions]?.slice(0, 4) || quickQuestions.en.slice(0, 4)
    }]);
  };

  return (
    <div className="flex flex-col h-96 bg-gradient-to-b from-pink-50 to-purple-50 dark:from-pink-900/20 dark:to-purple-900/20 rounded-2xl border border-primary/20">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary/20">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Bot className="w-8 h-8 text-purple-500" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Sakhi Assistant</h3>
            <p className="text-xs text-muted-foreground">Wellness & Period Support</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSpeaking}
            className={`rounded-xl ${isSpeaking ? 'text-purple-500' : 'text-muted-foreground'}`}
          >
            {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearChat}
            className="rounded-xl text-muted-foreground"
          >
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((message) => (
            <motion.div
              key={message.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] ${
                message.type === 'user'
                  ? 'bg-primary text-white rounded-2xl rounded-tr-sm'
                  : 'bg-white dark:bg-gray-800 text-foreground rounded-2xl rounded-tl-sm border border-primary/20'
              } p-3 shadow-sm`}>
                <p className="text-sm">{message.message}</p>
                
                {message.suggestions && message.suggestions.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs opacity-75">Quick questions:</p>
                    <div className="flex flex-wrap gap-1">
                      {message.suggestions.slice(0, 3).map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSuggestionClick(suggestion)}
                          className="text-xs bg-primary/10 hover:bg-primary/20 text-primary px-2 py-1 rounded-lg transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex justify-start"
          >
            <div className="bg-white dark:bg-gray-800 rounded-2xl rounded-tl-sm border border-primary/20 p-3 shadow-sm">
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce"></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
              </div>
            </div>
          </motion.div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Suggestions */}
      <div className="p-2 border-t border-primary/20">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {quickQuestions[currentLanguage as keyof typeof quickQuestions]?.slice(0, 4).map((question, index) => (
            <button
              key={index}
              onClick={() => handleSuggestionClick(question)}
              className="flex-shrink-0 text-xs bg-gradient-to-r from-pink-100 to-purple-100 dark:from-pink-900/30 dark:to-purple-900/30 text-purple-700 dark:text-purple-300 px-3 py-2 rounded-full border border-purple-200 dark:border-purple-700 hover:shadow-md transition-all"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-primary/20">
        <div className="flex items-center gap-2">
          <div className="flex-1 relative">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              placeholder="Ask about periods, health, mood..."
              className="rounded-2xl pr-12 bg-white dark:bg-gray-800"
            />
            {recognitionRef.current && (
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleListening}
                className={`absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl ${
                  isListening ? 'text-red-500 animate-pulse' : 'text-muted-foreground'
                }`}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
            )}
          </div>
          
          <Button
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="rounded-2xl bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
