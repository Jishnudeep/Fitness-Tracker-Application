import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { Workout, Meal } from '../types';

// Initialize Gemini Client
// Note: In a production app, you might want to handle key missing more gracefully
const apiKey = process.env.API_KEY || '';
let ai: GoogleGenAI | null = null;

if (apiKey) {
  ai = new GoogleGenAI({ apiKey });
}

export const createChatSession = (workouts: Workout[], meals: Meal[]): Chat | null => {
  if (!ai) return null;

  // Prepare context data
  const recentWorkouts = workouts.slice(0, 5).map(w =>
    `${w.date.split('T')[0]}: ${w.name} (${w.exercises.length} exercises)`
  ).join('\n');

  const recentMeals = meals.slice(0, 10).map(m =>
    `${m.date.split('T')[0]}: ${m.name} (${m.calories}kcal)`
  ).join('\n');

  const systemInstruction = `
    You are TheCutRoute, a helpful and knowledgeable fitness assistant.
    
    Here is a summary of the user's recent activity:
    
    Recent Workouts:
    ${recentWorkouts || 'No recent workouts logged.'}
    
    Recent Meals:
    ${recentMeals || 'No recent meals logged.'}
    
    Answer questions about their fitness progress, suggest workouts, analyze their nutrition, 
    and provide motivation. Be concise, encouraging, and scientific.
  `;

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction,
    },
  });
};

export const sendMessageStream = async (chat: Chat, message: string) => {
  return await chat.sendMessageStream({ message });
};