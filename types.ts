export interface VideoResource {
  title: string;
  channel: string;
  description: string;
  duration: string;
  // We strictly use search queries now to ensure 100% link reliability
}

export interface Module {
  id: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced' | 'Mastery';
  title: string;
  learningGoals: string[];
  keyConcepts: string[];
  videos: VideoResource[];
  isCompleted: boolean;
}

export interface CareerInfo {
  projectIdeas: string[];
  interviewQuestions: string[];
  resumeBullets: string[];
  githubStarterDescription: string;
}

export interface Curriculum {
  skillName: string;
  modules: Module[];
  career: CareerInfo;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  explanation: string;
}

export interface Quiz {
  moduleId: string;
  questions: QuizQuestion[];
}

export interface UserState {
  xp: number;
  level: number;
  badges: string[];
  completedModuleIds: string[];
  quizzesTaken: number;
  streakDays: number;
  lastLoginDate: string;
}

export const LEVELS = [
  { level: 1, xp: 0, title: 'Novice' },
  { level: 2, xp: 100, title: 'Apprentice' },
  { level: 3, xp: 300, title: 'Practitioner' },
  { level: 4, xp: 600, title: 'Specialist' },
  { level: 5, xp: 1000, title: 'Expert' },
  { level: 6, xp: 2000, title: 'Master' },
];