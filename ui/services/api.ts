import { Workout, Meal, User, WorkoutTemplate, FoodItem, ExercisePerformance, MuscleGroup } from '../types';
import * as storage from './storage';
import { supabase } from './supabase';

// Configuration
// 1. Set this to true when your Python backend is running
// 2. Ensure your backend is running on the URL below
const ENABLE_BACKEND = true;
const API_URL = 'http://127.0.0.1:8000'; // Removed /api suffix to match backend

// Helper for real API calls
const getAuthHeader = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ? { 'Authorization': `Bearer ${session.access_token}` } : {};
};

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
    async login(email: string, password: string): Promise<User> {
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) throw error;
        if (!data.user) throw new Error('No user data returned');

        const user: User = {
            id: data.user.id,
            email: data.user.email,
            username: data.user.user_metadata?.username || email.split('@')[0], // Fallback to email prefix
            isLoggedIn: true
        };

        storage.saveUser(user);
        return user;
    },

    async signup(email: string, password: string, username: string): Promise<User> {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    username,
                    full_name: username, // Populates 'Display Name' in Supabase Dashboard
                    display_name: username,
                },
            },
        });

        if (error) throw error;
        if (!data.user) throw new Error('No user data returned');

        // Note: functionality depends on email confirmation settings in Supabase
        const user: User = {
            id: data.user.id,
            email: data.user.email,
            username: username,
            isLoggedIn: true // You might want to check data.session if email confirmation is required
        };

        storage.saveUser(user);
        return user;
    },

    // --- Workouts ---
    async getWorkouts(): Promise<Workout[]> {
        if (ENABLE_BACKEND) {
            // TODO: Get real user ID from auth context
            const authHeaders = await getAuthHeader();
            const res = await fetch(`${API_URL}/workouts/`, {
                headers: { ...authHeaders }
            });
            return handleResponse(res);
        }

        // Mock Data
        await delay(500);
        return storage.getWorkouts();
    },

    async saveWorkout(workout: Workout): Promise<Workout> {
        if (ENABLE_BACKEND) {
            const authHeaders = await getAuthHeader();
            const res = await fetch(`${API_URL}/workouts/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders
                },
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
            const authHeaders = await getAuthHeader();
            // Get today's date in YYYY-MM-DD
            const date = new Date().toISOString().split('T')[0];
            const res = await fetch(`${API_URL}/meals/?date=${date}`, {
                headers: { ...authHeaders }
            });
            return handleResponse(res);
        }

        // Mock Data
        await delay(500);
        return storage.getMeals();
    },

    async saveMeal(meal: Meal): Promise<Meal> {
        if (ENABLE_BACKEND) {
            const authHeaders = await getAuthHeader();
            const res = await fetch(`${API_URL}/meals/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders
                },
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
            const authHeaders = await getAuthHeader();
            const res = await fetch(`${API_URL}/templates/`, {
                headers: { ...authHeaders }
            });
            // Backend returns snake_case for exercises if we didn't alias, but let's check.
            // My Pydantic schema used default_sets etc.
            // Usually we want to camelCase them in the frontend.
            try {
                const data = await handleResponse(res);
                if (!Array.isArray(data)) return [];

                return data.map((t: any) => ({
                    id: t.id,
                    name: t.name,
                    description: t.description,
                    exercises: (t.exercises || t.workout_template_exercises || []).map((te: any) => ({
                        id: te.id,
                        exercise_id: te.exercise_id,
                        name: te.name || 'Unknown Exercise',
                        muscleGroup: (te.muscle_group || MuscleGroup.OTHER) as MuscleGroup,
                        defaultSets: te.default_sets || 3,
                        defaultReps: te.default_reps,
                        defaultWeight: te.default_weight,
                        defaultSpeed: te.default_speed,
                        defaultIncline: te.default_incline,
                        defaultTimeSeconds: te.default_time_seconds,
                        defaultCaloriesBurnt: te.default_calories_burnt,
                        orderIndex: te.order_index || 0
                    }))
                }));
            } catch (err) {
                console.error("Failed to fetch templates from backend", err);
                return storage.getTemplates();
            }
        }
        await delay(300);
        return storage.getTemplates();
    },

    async createTemplate(template: Omit<WorkoutTemplate, 'id'>): Promise<WorkoutTemplate> {
        if (ENABLE_BACKEND) {
            const authHeaders = await getAuthHeader();
            const res = await fetch(`${API_URL}/templates/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify({
                    name: template.name,
                    description: template.description,
                    exercises: template.exercises.map(ex => ({
                        exercise_id: ex.exercise_id,
                        default_sets: ex.defaultSets,
                        default_reps: ex.defaultReps,
                        default_weight: ex.defaultWeight,
                        default_speed: ex.defaultSpeed,
                        default_incline: ex.defaultIncline,
                        default_time_seconds: ex.defaultTimeSeconds,
                        default_calories_burnt: ex.defaultCaloriesBurnt,
                        order_index: ex.orderIndex
                    }))
                })
            });
            return handleResponse(res);
        }
        const newTemplate = { ...template, id: Math.random().toString(36).substr(2, 9) } as WorkoutTemplate;
        storage.saveTemplates([newTemplate, ...storage.getTemplates()]);
        return newTemplate;
    },

    async deleteTemplate(id: string): Promise<void> {
        if (ENABLE_BACKEND) {
            const authHeaders = await getAuthHeader();
            await fetch(`${API_URL}/templates/${id}`, {
                method: 'DELETE',
                headers: { ...authHeaders }
            });
            return;
        }
        const current = storage.getTemplates();
        storage.saveTemplates(current.filter(t => t.id !== id));
    },

    // --- Performance ---
    async getLastPerformance(exerciseNames: string[]): Promise<ExercisePerformance[]> {
        if (ENABLE_BACKEND) {
            const authHeaders = await getAuthHeader();
            const query = exerciseNames.map(name => `exercise_names=${encodeURIComponent(name)}`).join('&');
            const res = await fetch(`${API_URL}/workouts/last-performance?${query}`, {
                headers: { ...authHeaders }
            });
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
                        lastWeight: lastSet.weight || 0,
                        lastReps: lastSet.reps || 0,
                        lastSpeed: lastSet.speed || 0,
                        lastIncline: lastSet.incline || 0,
                        lastTimeSeconds: lastSet.timeSeconds || 0,
                        lastCaloriesBurnt: lastSet.caloriesBurnt || 0,
                        lastDate: workout.date
                    };
                }
            }
            return {
                exerciseName: name,
                lastWeight: 0,
                lastReps: 0,
                lastSpeed: 0,
                lastIncline: 0,
                lastTimeSeconds: 0,
                lastCaloriesBurnt: 0,
                lastDate: ''
            };
        });
    },

    async getRecentFoods(): Promise<FoodItem[]> {
        if (ENABLE_BACKEND) {
            const authHeaders = await getAuthHeader();
            const res = await fetch(`${API_URL}/meals/recent-foods`, {
                headers: { ...authHeaders }
            });
            return handleResponse(res);
        }
        await delay(200);
        return storage.getRecentFoods();
    },

    // --- Goals ---
    async getGoal(): Promise<any> {
        if (ENABLE_BACKEND) {
            const authHeaders = await getAuthHeader();
            const res = await fetch(`${API_URL}/goals/`, {
                headers: { ...authHeaders }
            });
            return handleResponse(res);
        }
        return {};
    },

    async saveGoal(goal: any): Promise<any> {
        if (ENABLE_BACKEND) {
            const authHeaders = await getAuthHeader();
            const res = await fetch(`${API_URL}/goals/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify(goal)
            });
            return handleResponse(res);
        }
        return goal;
    },

    async analyzeGoal(goal: any): Promise<any> {
        if (ENABLE_BACKEND) {
            const authHeaders = await getAuthHeader();
            const res = await fetch(`${API_URL}/goals/analyze`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', ...authHeaders },
                body: JSON.stringify(goal)
            });
            return handleResponse(res);
        }
        return { analysis: "Backend disabled." };
    },

    // --- Agents ---
    async reviewDay(date: string): Promise<any> {
        if (ENABLE_BACKEND) {
            const authHeaders = await getAuthHeader();
            const res = await fetch(`${API_URL}/agents/review/day?date=${date}`, {
                method: 'POST',
                headers: { ...authHeaders }
            });
            return handleResponse(res);
        }
        return { activity: "Backend disabled.", diet: "Backend disabled." };
    },

    async searchFood(query: string): Promise<any> {
        if (ENABLE_BACKEND) {
            const authHeaders = await getAuthHeader();
            const res = await fetch(`${API_URL}/agents/food/search?query=${encodeURIComponent(query)}`, {
                headers: { ...authHeaders }
            });
            return handleResponse(res);
        }
        return { name: query, calories: 0, protein: 0, carbs: 0, fats: 0, message: "Backend disabled." };
    }
};