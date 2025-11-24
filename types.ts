export enum CEFRLevel {
  A1 = 'A1 (Beginner)',
  A2 = 'A2 (Elementary)',
  B1 = 'B1 (Intermediate)',
  B2 = 'B2 (Upper Intermediate)',
  C1 = 'C1 (Advanced)',
  C2 = 'C2 (Proficiency)',
}

export type Language = 'en' | 'zh';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
}

export interface UserProfile {
  level: CEFRLevel;
  interests: string[];
  customKeywords: string;
  // Gamification
  points: number;
  streak: number;
  lastLoginDate: string; // ISO Date string
  badges: Badge[];
  articlesRead: number;
}

export interface VocabularyWord {
  word: string;
  definition: string;
  translation: string;
  pronunciation?: string; // IPA or similar, optional
}

export interface ArticleData {
  title: string;
  content: string; // Contains {{word}} markers
  vocabulary: VocabularyWord[];
}

export interface Question {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export enum AppView {
  ONBOARDING = 'ONBOARDING',
  DASHBOARD = 'DASHBOARD',
  READING = 'READING',
  QUIZ = 'QUIZ',
  REPORT = 'REPORT',
  FORUM = 'FORUM',
}

// Forum Types
export interface Comment {
  id: string;
  author: string;
  content: string;
  timestamp: number;
}

export interface ForumPost {
  id: string;
  title: string;
  content: string;
  author: string;
  category: 'Vocabulary Help' | 'Article Discussion' | 'Learning Strategies' | 'General';
  timestamp: number;
  comments: Comment[];
  likes: number;
}
