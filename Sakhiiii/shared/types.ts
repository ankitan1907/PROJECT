export type Language = 'en' | 'hi' | 'kn' | 'ta' | 'te';

export interface LanguageOption {
  code: Language;
  name: string;
  nativeName: string;
}

export interface User {
  _id: string;
  _id: string;
  id: string;
  name: string;
  age: number;
  gender: 'female' | 'male' | 'other' | 'prefer-not-to-say';
  memberSince: Date;
  language: Language;
  profileComplete: boolean;
  email?: string;
  avatar?: string;
  isGuest?: boolean;
}

export interface SafetyLocation {
  id: string;
  lat: number;
  lng: number;
  type: 'safe' | 'risky' | 'neutral';
  name: string;
  description?: string;
}

export interface IncidentReport {
  id: string;
  type: 'eve-teasing' | 'harassment' | 'stalking' | 'assault' | 'other';
  location: {
    lat: number;
    lng: number;
    address: string;
  };
  timestamp: Date;
  description?: string;
  images?: string[];
  isAnonymous: boolean;
  reporterId?: string;
  status: 'pending' | 'verified' | 'resolved';
}

export interface CommunityPost {
  id: string;
  authorName: string;
  incidentType: string;
  location: string;
  timeAgo: string;
  description?: string;
  isAnonymous: boolean;
  upvotes: number;
  comments: number;
}

export interface Helpline {
  id: string;
  name: string;
  number: string;
  category: 'police' | 'women-helpline' | 'domestic-violence' | 'mental-health' | 'emergency';
  available247: boolean;
  languages: Language[];
}
