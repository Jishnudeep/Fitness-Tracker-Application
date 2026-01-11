export enum MuscleGroup {
  CHEST = 'Chest',
  BACK = 'Back',
  LEGS = 'Legs',
  SHOULDERS = 'Shoulders',
  ARMS = 'Arms',
  ABS = 'Abs',
  CARDIO = 'Cardio',
  OTHER = 'Other'
}

export interface Set {
  id: string;
  reps: number;
  weight: number;
  completed: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: MuscleGroup;
  sets: Set[];
}

export interface Workout {
  id: string;
  name: string;
  date: string; // ISO string
  durationMinutes: number;
  exercises: Exercise[];
  notes?: string;
}

export interface Meal {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  date: string; // ISO string
  type: 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface User {
  username: string;
  isLoggedIn: boolean;
}

export type ViewState = 'dashboard' | 'workout' | 'calories' | 'ai';