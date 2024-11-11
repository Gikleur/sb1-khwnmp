export interface Message {
  id: string;
  content: string;
  sender: string;
  timestamp: number;
  type: 'text' | 'image' | 'video' | 'system';
  mediaUrl?: string;
}

export interface Room {
  id: string;
  name: string;
  isPrivate: boolean;
  participants: Participant[];
  owner: string;
  invites?: string[];
  bannedUsers: string[];
  lastActivityTimestamp: number;
}

export interface UserProfile {
  username: string;
  age: number;
  gender: 'homme' | 'femme' | 'autre';
  city: string;
  country: string;
  avatar: string;
}

export interface Participant extends UserProfile {
  id: string;
  isOnline: boolean;
  reports?: Report[];
}

export interface Report {
  id: string;
  reporterId: string;
  reason: string;
  timestamp: number;
}