export type LearningLevel = 'presilábico' | 'silábico' | 'alfabético';
export type Difficulty = 'easy' | 'medium' | 'hard';
export type LearningStyle = 'visual' | 'auditivo' | 'escritura';
export type AssistantVoice = 'male' | 'female';

export interface Child {
  id: string;
  therapistId: string;
  name: string;
  age: number;
  avatar: string;
  themeColor: string;
  assistantVoice: AssistantVoice;
  learningLevel: LearningLevel;
  difficulty: Difficulty;
  learningStyle: LearningStyle;
  sessionDuration: number; // in minutes
  points: number;
  stars: number;
  lastSessionAt?: string;
  status?: 'active' | 'idle';
  lastActivity?: string;
  progressPercent?: number;
  lastUpdateAt?: string;
}

export interface Session {
  id: string;
  childId: string;
  therapistId: string;
  date: string;
  levelReached: string;
  difficultyWorked: Difficulty;
  correctCount: number;
  incorrectCount: number;
  totalWords: number;
  pointsEarned: number;
  starsEarned: number;
  timeSpent: number; // in seconds
  chatHistory?: { role: 'user' | 'assistant'; content: string; timestamp: string }[];
  practicedWords?: { word: string; success: boolean; attempts: number }[];
}

export interface Therapist {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface LiveCommand {
  id: string;
  type: 'message' | 'confetti' | 'sparkle';
  content?: string;
  timestamp: string;
}
