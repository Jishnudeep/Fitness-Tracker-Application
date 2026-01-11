import { Workout, Meal, ChatMessage, User } from '../types';

const WORKOUTS_KEY = 'cutroute_workouts';
const MEALS_KEY = 'cutroute_meals';
const THEME_KEY = 'cutroute_theme';
const USER_KEY = 'cutroute_user';

export const saveWorkouts = (workouts: Workout[]) => {
  localStorage.setItem(WORKOUTS_KEY, JSON.stringify(workouts));
};

export const getWorkouts = (): Workout[] => {
  const data = localStorage.getItem(WORKOUTS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveMeals = (meals: Meal[]) => {
  localStorage.setItem(MEALS_KEY, JSON.stringify(meals));
};

export const getMeals = (): Meal[] => {
  const data = localStorage.getItem(MEALS_KEY);
  return data ? JSON.parse(data) : [];
};

export const saveTheme = (theme: 'light' | 'dark') => {
  localStorage.setItem(THEME_KEY, theme);
};

export const getTheme = (): 'light' | 'dark' => {
  return (localStorage.getItem(THEME_KEY) as 'light' | 'dark') || 'dark';
};

export const saveUser = (user: User) => {
  localStorage.setItem(USER_KEY, JSON.stringify(user));
};

export const getUser = (): User | null => {
  const data = localStorage.getItem(USER_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearUser = () => {
  localStorage.removeItem(USER_KEY);
};

// Helper to calculate daily totals
export const getDailyCalories = (date: string): number => {
  const meals = getMeals();
  const dayStart = new Date(date).setHours(0, 0, 0, 0);
  const dayEnd = new Date(date).setHours(23, 59, 59, 999);

  return meals
    .filter(m => {
      const mDate = new Date(m.date).getTime();
      return mDate >= dayStart && mDate <= dayEnd;
    })
    .reduce((acc, curr) => acc + curr.calories, 0);
};