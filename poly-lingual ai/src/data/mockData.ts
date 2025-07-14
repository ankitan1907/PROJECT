import { Message, User, Room, Language } from '../types';
import { Globe, Code, Coffee, Music, Book, Gamepad2 } from 'lucide-react';

export const LANGUAGES: Language[] = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', flag: '🇪🇸' },
  { code: 'fr', name: 'French', flag: '🇫🇷' },
  { code: 'de', name: 'German', flag: '🇩🇪' },
  { code: 'it', name: 'Italian', flag: '🇮🇹' },
  { code: 'jp', name: 'Japanese', flag: '🇯🇵' },
  { code: 'kr', name: 'Korean', flag: '🇰🇷' },
  { code: 'cn', name: 'Chinese', flag: '🇨🇳' },
  { code: 'ru', name: 'Russian', flag: '🇷🇺' },
  { code: 'ar', name: 'Arabic', flag: '🇸🇦' },
  { code: 'hi', name: 'Hindi', flag: '🇮🇳' },
  { code: 'pt', name: 'Portuguese', flag: '🇧🇷' },
];

export const USERS: User[] = [
  {
    id: 'user-1',
    name: 'Sophia Chen',
    avatar: 'https://images.pexels.com/photos/762020/pexels-photo-762020.jpeg?auto=compress&cs=tinysrgb&w=150',
    language: 'en',
  },
  {
    id: 'user-2',
    name: 'Miguel Álvarez',
    avatar: 'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=150',
    language: 'es',
  },
  {
    id: 'user-3',
    name: 'Aiko Tanaka',
    avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150',
    language: 'jp',
  },
  {
    id: 'user-4',
    name: 'Pierre Dubois',
    avatar: 'https://images.pexels.com/photos/220453/pexels-photo-220453.jpeg?auto=compress&cs=tinysrgb&w=150',
    language: 'fr',
  },
  {
    id: 'user-5',
    name: 'Raj Patel',
    avatar: 'https://images.pexels.com/photos/1681010/pexels-photo-1681010.jpeg?auto=compress&cs=tinysrgb&w=150',
    language: 'hi',
  },
  {
    id: 'user-6',
    name: 'You',
    avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150',
    language: 'en',
  }
];

export const ROOMS: Room[] = [
  {
    id: 'room-1',
    name: 'Global Chat',
    description: 'Connect with people from around the world',
    participants: USERS,
    icon: 'Globe',
  },
  {
    id: 'room-2',
    name: 'Tech Talk',
    description: 'Discuss the latest in technology',
    participants: [USERS[0], USERS[1], USERS[5]],
    icon: 'Code',
  },
  {
    id: 'room-3',
    name: 'Coffee Chat',
    description: 'Casual conversation about anything',
    participants: [USERS[2], USERS[3], USERS[5]],
    icon: 'Coffee',
  },
  {
    id: 'room-4',
    name: 'Music Lovers',
    description: 'Share and discover music from different cultures',
    participants: [USERS[1], USERS[4], USERS[5]],
    icon: 'Music',
  },
  {
    id: 'room-5',
    name: 'Book Club',
    description: 'Discuss books from around the world',
    participants: [USERS[0], USERS[3], USERS[4], USERS[5]],
    icon: 'Book',
  },
  {
    id: 'room-6',
    name: 'Gaming Zone',
    description: 'Connect with gamers globally',
    participants: [USERS[1], USERS[2], USERS[5]],
    icon: 'Gamepad2',
  },
];

export const getIconComponent = (iconName: string) => {
  switch (iconName) {
    case 'Globe': return Globe;
    case 'Code': return Code;
    case 'Coffee': return Coffee;
    case 'Music': return Music;
    case 'Book': return Book;
    case 'Gamepad2': return Gamepad2;
    default: return Globe;
  }
};

export const MESSAGES: Message[] = [
  {
    id: 'msg-1',
    content: '¡Hola a todos! ¿Cómo están hoy?',
    translation: 'Hello everyone! How are you today?',
    translationConfidence: 0.97,
    sender: USERS[1],
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    emotion: 'happy',
    culturalInsight: 'In Spanish culture, greetings are often warm and enthusiastic',
  },
  {
    id: 'msg-2',
    content: 'Bonjour Miguel! Je vais bien, merci. Et toi?',
    translation: 'Hello Miguel! I\'m doing well, thank you. And you?',
    translationConfidence: 0.95,
    sender: USERS[3],
    timestamp: new Date(Date.now() - 1000 * 60 * 14),
    emotion: 'happy',
  },
  {
    id: 'msg-3',
    content: 'こんにちは皆さん！今日の話題は何ですか？',
    translation: 'Hello everyone! What is today\'s topic?',
    translationConfidence: 0.89,
    sender: USERS[2],
    timestamp: new Date(Date.now() - 1000 * 60 * 12),
    emotion: 'curious',
    culturalInsight: 'In Japanese communication, it\'s common to establish the topic early in conversation',
  },
  {
    id: 'msg-4',
    content: 'I think we should discuss our favorite books from our cultures!',
    translation: '',
    translationConfidence: 1,
    sender: USERS[0],
    timestamp: new Date(Date.now() - 1000 * 60 * 10),
    emotion: 'excited',
  },
  {
    id: 'msg-5',
    content: 'मुझे लगता है कि यह एक अच्छा विचार है। मैं अपने पसंदीदा भारतीय लेखकों के बारे में बात कर सकता हूं।',
    translation: 'I think that\'s a good idea. I can talk about my favorite Indian authors.',
    translationConfidence: 0.86,
    sender: USERS[4],
    timestamp: new Date(Date.now() - 1000 * 60 * 8),
    emotion: 'excited',
    culturalInsight: 'Literature is highly valued in Indian culture, with a rich tradition dating back thousands of years',
  },
  {
    id: 'msg-6',
    content: 'Excelente idea! Gabriel García Márquez es uno de mis favoritos.',
    translation: 'Excellent idea! Gabriel García Márquez is one of my favorites.',
    translationConfidence: 0.98,
    sender: USERS[1],
    timestamp: new Date(Date.now() - 1000 * 60 * 7),
    emotion: 'happy',
  },
  {
    id: 'msg-7',
    content: '村上春樹は私の一番好きな作家です。皆さんは彼の作品を読んだことがありますか？',
    translation: 'Haruki Murakami is my favorite author. Have any of you read his works?',
    translationConfidence: 0.91,
    sender: USERS[2],
    timestamp: new Date(Date.now() - 1000 * 60 * 5),
    emotion: 'curious',
  },
  {
    id: 'msg-8',
    content: 'Yes! I love Murakami. "Norwegian Wood" is one of my favorites.',
    translation: '',
    translationConfidence: 1,
    sender: USERS[5],
    timestamp: new Date(Date.now() - 1000 * 60 * 3),
    emotion: 'excited',
  },
];