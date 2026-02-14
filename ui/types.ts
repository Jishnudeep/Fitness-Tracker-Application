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
  reps?: number;
  weight?: number;
  speed?: number;
  incline?: number;
  timeSeconds?: number;
  caloriesBurnt?: number;
  steps?: number;
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
  template_id?: string;
  save_as_template?: boolean;
}

export interface TemplateExercise {
  id?: string;
  exercise_id: string;
  name: string;
  muscleGroup: MuscleGroup;
  defaultSets: number;
  defaultReps?: number;
  defaultWeight?: number;
  defaultSpeed?: number;
  defaultIncline?: number;
  defaultTimeSeconds?: number;
  defaultCaloriesBurnt?: number;
  defaultSteps?: number;
  orderIndex: number;
}

export interface WorkoutTemplate {
  id: string;
  name: string;
  description?: string;
  exercises: TemplateExercise[];
}

export interface ExercisePerformance {
  exerciseName: string;
  lastWeight: number;
  lastReps: number;
  lastSpeed?: number;
  lastIncline?: number;
  lastTimeSeconds?: number;
  lastCaloriesBurnt?: number;
  lastSteps?: number;
  lastDate: string;
}

export interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  quantity: number;
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
  items?: FoodItem[];
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface User {
  id: string;
  email?: string;
  username: string;
  isLoggedIn: boolean;
}

export type ViewState = 'dashboard' | 'workout' | 'cardio' | 'calories' | 'ai';