import { Workout, Meal, User, WorkoutTemplate, FoodItem, ExercisePerformance } from '../types';
import * as storage from './storage';

// Configuration
// 1. Set this to true when your Python backend is running
// 2. Ensure your backend is running on the URL below
const ENABLE_BACKEND = false;
const API_URL = 'http://127.0.0.1:8000/api';

// Helper for real API calls
const handleResponse = async (response: Response) => {
    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(errorText || `API Error: ${response.statusText}`);
    }
    return response.json();
};

// Simulation delay for realistic UI testing
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const api = {
    // --- Auth ---
    async login(username: string): Promise<User> {
        if (ENABLE_BACKEND) {
            const res = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            return handleResponse(res);
        }

        // Mock Login
        await delay(800);
        const user: User = { username, isLoggedIn: true };
        storage.saveUser(user);
        return user;
    },

    async signup(username: string): Promise<User> {
        if (ENABLE_BACKEND) {
            const res = await fetch(`${API_URL}/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username })
            });
            return handleResponse(res);
        }

        // Mock Signup
        await delay(1000);
        const user: User = { username, isLoggedIn: true };
        storage.saveUser(user);
        return user;
    },

    // --- Workouts ---
    async getWorkouts(): Promise<Workout[]> {
        if (ENABLE_BACKEND) {
            const res = await fetch(`${API_URL}/workouts`);
            return handleResponse(res);
        }

        // Mock Data
        await delay(500);
        return storage.getWorkouts();
    },

    async saveWorkout(workout: Workout): Promise<Workout> {
        if (ENABLE_BACKEND) {
            const res = await fetch(`${API_URL}/workouts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(workout)
            });
            return handleResponse(res);
        }

        // Mock Save
        await delay(500);
        const current = storage.getWorkouts();
        // In a real app, the backend assigns the ID. Here we rely on the frontend ID.
        const updated = [workout, ...current];
        storage.saveWorkouts(updated);
        return workout;
    },

    // --- Meals ---
    async getMeals(): Promise<Meal[]> {
        if (ENABLE_BACKEND) {
            const res = await fetch(`${API_URL}/meals`);
            return handleResponse(res);
        }

        // Mock Data
        await delay(500);
        return storage.getMeals();
    },

    async saveMeal(meal: Meal): Promise<Meal> {
        if (ENABLE_BACKEND) {
            const res = await fetch(`${API_URL}/meals`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(meal)
            });
            return handleResponse(res);
        }

        // Mock Save
        await delay(500);
        const current = storage.getMeals();
        const updated = [meal, ...current];
        storage.saveMeals(updated);

        // Update Recent Foods
        const recent = storage.getRecentFoods();
        const items = meal.items || [];
        const newRecent = [...items, ...recent].slice(0, 20); // Keep top 20
        // Deduplicate by name
        const uniqueRecent = Array.from(new Map(newRecent.map(item => [item.name, item])).values());
        storage.saveRecentFoods(uniqueRecent);

        return meal;
    },

    // --- Templates ---
    async getTemplates(): Promise<WorkoutTemplate[]> {
        if (ENABLE_BACKEND) {
            const res = await fetch(`${API_URL}/templates`);
            return handleResponse(res);
        }
        await delay(300);
        return storage.getTemplates();
    },

    async saveTemplate(template: WorkoutTemplate): Promise<WorkoutTemplate> {
        if (ENABLE_BACKEND) {
            const res = await fetch(`${API_URL}/templates`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(template)
            });
            return handleResponse(res);
        }
        await delay(300);
        const current = storage.getTemplates();
        storage.saveTemplates([template, ...current]);
        return template;
    },

    // --- Performance ---
    async getLastPerformance(exerciseNames: string[]): Promise<ExercisePerformance[]> {
        if (ENABLE_BACKEND) {
            const query = exerciseNames.map(name => `exercise_names=${encodeURIComponent(name)}`).join('&');
            const res = await fetch(`${API_URL}/workouts/last-performance?${query}`);
            return handleResponse(res);
        }

        await delay(400); // Simulate latency
        const workouts = storage.getWorkouts();

        return exerciseNames.map(name => {
            // Find most recent workout containing this exercise
            for (const workout of workouts) {
                const exercise = workout.exercises.find(ex => ex.name.toLowerCase() === name.toLowerCase());
                if (exercise && exercise.sets.length > 0) {
                    const lastSet = exercise.sets[exercise.sets.length - 1];
                    return {
                        exerciseName: name,
                        lastWeight: lastSet.weight,
                        lastReps: lastSet.reps,
                        lastDate: workout.date
                    };
                }
            }
            return {
                exerciseName: name,
                lastWeight: 0,
                lastReps: 0,
                lastDate: ''
            };
        });
    },

    async getRecentFoods(): Promise<FoodItem[]> {
        if (ENABLE_BACKEND) {
            const res = await fetch(`${API_URL}/meals/recent-foods`);
            return handleResponse(res);
        }
        await delay(200);
        return storage.getRecentFoods();
    }
};