import { useState, useCallback } from 'react';
import { Message, Room, User, MessageEmotion } from '../types';
import { MESSAGES, ROOMS, USERS } from '../data/mockData';

// Mock function to generate a random emotion
const generateRandomEmotion = (): MessageEmotion => {
  const emotions: MessageEmotion[] = ['neutral', 'happy', 'sad', 'excited', 'angry', 'curious', 'sarcastic'];
  return emotions[Math.floor(Math.random() * emotions.length)];
};

// Mock translation function (would be replaced with a real API)
const translateMessage = (text: string, targetLang: string): { translation: string, confidence: number } => {
  // In a real app, this would call a translation API
  // Just returning a mock result for demonstration
  return {
    translation: `[Translated to ${targetLang}]: ${text}`,
    confidence: Math.random() * 0.3 + 0.7 // Random confidence between 0.7 and 1.0
  };
};

// Mock cultural insight generator
const generateCulturalInsight = (sender: User): string | undefined => {
  // Only generate insights occasionally
  if (Math.random() > 0.7) {
    const insights = [
      `In ${sender.language === 'jp' ? 'Japanese' : sender.language === 'es' ? 'Spanish' : 'this'} culture, it's common to use more formal language when speaking with new acquaintances.`,
      `The way questions are phrased in this language often reveals cultural attitudes about directness.`,
      `This greeting style is typical for ${sender.language === 'fr' ? 'French' : sender.language === 'hi' ? 'Hindi' : 'this'} language and indicates respect.`,
      `The expression used here has cultural significance related to community values.`,
      `Notice how pauses are used differently in this language compared to English.`
    ];
    return insights[Math.floor(Math.random() * insights.length)];
  }
  return undefined;
};

export const useChat = () => {
  const [messages, setMessages] = useState<Message[]>(MESSAGES);
  const [rooms, setRooms] = useState<Room[]>(ROOMS);
  const [currentRoom, setCurrentRoom] = useState<Room>(ROOMS[0]);
  const [currentUser, setCurrentUser] = useState<User>(USERS[5]); // Default to "You" user

  const sendMessage = useCallback((content: string) => {
    if (!content.trim()) return;
    
    const newMessage: Message = {
      id: `msg-${Date.now()}`,
      content,
      sender: currentUser,
      timestamp: new Date(),
      emotion: 'neutral', // Current user messages are neutral by default
      translationConfidence: 1, // Perfect confidence for user's own messages
    };
    
    setMessages(prevMessages => [...prevMessages, newMessage]);
    
    // Simulate response after a short delay
    setTimeout(() => {
      // Pick a random user from the current room (excluding current user)
      const otherUsers = currentRoom.participants.filter(user => user.id !== currentUser.id);
      const randomUser = otherUsers[Math.floor(Math.random() * otherUsers.length)];
      
      // Generate a random response
      const responses = [
        "That's interesting! Tell me more.",
        "I completely agree with you.",
        "I have a different perspective on that.",
        "I've never thought about it that way before.",
        "What made you think of that?",
        "That reminds me of something I read recently."
      ];
      
      // Random non-English responses
      const nonEnglishResponses: Record<string, string[]> = {
        es: ["¡Muy interesante! Cuéntame más.", "Estoy de acuerdo contigo.", "Tengo una perspectiva diferente."],
        fr: ["C'est intéressant ! Dis-m'en plus.", "Je suis tout à fait d'accord.", "J'ai un point de vue différent."],
        jp: ["面白いですね！もっと教えてください。", "全く同感です。", "それについては違う見方をしています。"],
        hi: ["यह दिलचस्प है! मुझे और बताओ।", "मैं पूरी तरह सहमत हूं।", "मेरा एक अलग दृष्टिकोण है।"]
      };
      
      let responseContent: string;
      
      // If user has a non-English language, use that for responses
      if (randomUser.language !== 'en' && nonEnglishResponses[randomUser.language]) {
        const langResponses = nonEnglishResponses[randomUser.language];
        responseContent = langResponses[Math.floor(Math.random() * langResponses.length)];
      } else {
        responseContent = responses[Math.floor(Math.random() * responses.length)];
      }
      
      // Generate translation if needed
      const needsTranslation = randomUser.language !== 'en';
      const { translation, confidence } = needsTranslation 
        ? translateMessage(responseContent, 'en') 
        : { translation: '', confidence: 1 };
      
      const emotion = generateRandomEmotion();
      const culturalInsight = generateCulturalInsight(randomUser);
      
      const responseMessage: Message = {
        id: `msg-${Date.now() + 1}`,
        content: responseContent,
        translation: needsTranslation ? translation : undefined,
        translationConfidence: needsTranslation ? confidence : undefined,
        sender: randomUser,
        timestamp: new Date(),
        emotion,
        culturalInsight
      };
      
      setMessages(prevMessages => [...prevMessages, responseMessage]);
    }, 1500);
  }, [currentRoom, currentUser]);

  const changeRoom = useCallback((room: Room) => {
    setCurrentRoom(room);
  }, []);

  const changeLanguage = useCallback((language: string) => {
    setCurrentUser(prev => ({ ...prev, language }));
  }, []);

  return {
    messages,
    rooms,
    currentRoom,
    currentUser,
    sendMessage,
    changeRoom,
    changeLanguage
  };
};

export default useChat;