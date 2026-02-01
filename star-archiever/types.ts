export type MathDifficulty = 'easy' | 'medium' | 'challenge';

export interface MathQuestion {
  id: string;
  prompt: string;
  answer: number;
  difficulty: MathDifficulty;
}

export interface Reward {
  id: string;
  title: string;
  cost: number;
  icon: string;
  link?: string;
}

export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'EARN' | 'SPEND';
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedDate?: string;
}

export type WordFamiliarity = 'new' | 'fuzzy' | 'known';

export interface WordItem {
  id: string;
  word: string;
  meaning: string;
  stage: number; // 0-4
  familiarity: WordFamiliarity;
  nextReview: number; // timestamp
  lastReview?: number;
  correctCount: number;
  wrongCount: number;
}

export interface GrammarQuestion {
  id: string;
  sentence: string;
  options: string[]; // A/B/C/D
  answerIndex: number;
  explanation: string;
}

export interface AppState {
  rewards: Reward[];
  achievements: Achievement[];
  words: WordItem[];
  grammarQuestions: GrammarQuestion[];
  points: number;
  totalAnswered: number;
  totalCorrect: number;
  consecutiveCorrect: number;
  bestStreak: number;
}