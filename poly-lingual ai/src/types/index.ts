export type Language = {
  code: string;
  name: string;
  flag: string;
};

export type MessageEmotion = 
  | 'neutral'
  | 'happy'
  | 'sad'
  | 'excited'
  | 'angry'
  | 'curious'
  | 'sarcastic';

export type User = {
  id: string;
  name: string;
  avatar: string;
  language: string;
};

export type Message = {
  id: string;
  content: string;
  translation?: string;
  translationConfidence?: number;
  sender: User;
  timestamp: Date;
  emotion?: MessageEmotion;
  culturalInsight?: string;
};

export type Room = {
  id: string;
  name: string;
  description?: string;
  participants: User[];
  icon?: string;
};