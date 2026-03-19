import React, { useState, useRef, useEffect } from 'react';
import { ChatMessage, Workout, Meal } from '../types';
import { Send, Loader2, MessageSquare, Sparkles, User } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

interface AIChatProps {
    workouts: Workout[];
    meals: Meal[];
}

export const AIChat: React.FC<AIChatProps> = ({ workouts, meals }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(scrollToBottom, [messages]);

    const aiClient = new GoogleGenAI({ apiKey: (globalThis as any).process?.env?.GEMINI_API_KEY || '' });

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(), role: 'user', text: input.trim(), timestamp: Date.now()
        };
        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const recentWorkouts = workouts.slice(0, 10).map(w => `${w.name} - ${w.exercises.map(ex => ex.name).join(', ')}`).join('; ');
            const recentMeals = meals.slice(0, 10).map(m => `${m.name} (${m.calories}kcal)`).join('; ');
            const context = `You are the AI Coach for TheCutRoute fitness app. Be concise, expert-level, and encouraging. Context — Recent workouts: ${recentWorkouts || 'None'}. Recent meals: ${recentMeals || 'None'}.`;

            const chatHistory = messages.map(m => ({
                role: m.role as 'user' | 'model',
                parts: [{ text: m.text }]
            }));

            const result = await aiClient.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: [
                    { role: 'user', parts: [{ text: context }] },
                    ...chatHistory,
                    { role: 'user', parts: [{ text: userMessage.text }] }
                ],
            });

            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(), role: 'model',
                text: result.text || "I couldn't generate a response.", timestamp: Date.now()
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error(error);
            const errorMsg: ChatMessage = {
                id: (Date.now() + 1).toString(), role: 'model',
                text: "Sorry, I hit an error. Please try again.", timestamp: Date.now()
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally { setIsLoading(false); }
    };

    return (
        <div className="page-enter h-[calc(100vh-200px)] md:h-[calc(100vh-180px)] flex flex-col max-w-3xl mx-auto">

            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center">
                    <Sparkles size={20} />
                </div>
                <div>
                    <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">AI Coach</h2>
                    <p className="text-xs text-zinc-400 font-medium">Ask anything about fitness & nutrition</p>
                </div>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4 mb-4 -mx-2 px-2">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full text-center gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                            <MessageSquare size={28} className="text-zinc-300 dark:text-zinc-600" />
                        </div>
                        <div>
                            <p className="text-sm font-semibold text-zinc-400">Start a conversation</p>
                            <p className="text-xs text-zinc-300 dark:text-zinc-600 mt-1 max-w-xs">Ask about workout plans, meal suggestions, recovery tips, or form advice.</p>
                        </div>
                    </div>
                )}

                {messages.map(msg => (
                    <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        {msg.role === 'model' && (
                            <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0 mt-1">
                                <Sparkles size={14} className="text-zinc-500" />
                            </div>
                        )}
                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed ${
                            msg.role === 'user'
                                ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-br-md'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-bl-md'
                        }`}>
                            {msg.text.split('\n').map((line, i) => (
                                <p key={i} className={i > 0 ? 'mt-1.5' : ''}>{line}</p>
                            ))}
                        </div>
                        {msg.role === 'user' && (
                            <div className="w-7 h-7 rounded-lg bg-zinc-900 dark:bg-white flex items-center justify-center flex-shrink-0 mt-1">
                                <User size={14} className="text-white dark:text-zinc-900" />
                            </div>
                        )}
                    </div>
                ))}

                {isLoading && (
                    <div className="flex gap-3">
                        <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center flex-shrink-0">
                            <Sparkles size={14} className="text-zinc-500" />
                        </div>
                        <div className="bg-zinc-100 dark:bg-zinc-800 px-5 py-3 rounded-2xl rounded-bl-md flex gap-1.5">
                            <span className="w-2 h-2 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-2 h-2 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-2 h-2 bg-zinc-300 dark:bg-zinc-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 flex items-end gap-2 shadow-sm">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
                    placeholder="Ask your coach..."
                    rows={1}
                    className="flex-1 bg-transparent text-sm font-medium outline-none py-2.5 px-3 resize-none min-h-[40px] max-h-[120px] placeholder:text-zinc-300 dark:placeholder:text-zinc-700"
                />
                <button onClick={handleSend} disabled={!input.trim() || isLoading}
                    className="w-10 h-10 flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl disabled:opacity-30 hover:opacity-80 transition-opacity flex-shrink-0">
                    <Send size={16} />
                </button>
            </div>
        </div>
    );
};