
import React, { useState, useEffect } from 'react';
import { Target, Calculator, Save, AlertCircle, Clock } from 'lucide-react';
import { Button } from './ui/Button';
import { CustomDatePicker } from './ui/CustomDatePicker';
import { AIResponse } from './ui/AIResponse';
import { api } from '../services/api';

interface Goal {
    id?: string;
    current_height: number;
    current_weight: number;
    age: number;
    current_body_fat: number;
    goal_weight: number;
    goal_body_fat: number;
    target_date?: string;
    daily_caloric_deficit?: number;
    daily_calories?: number;
    analysis?: string; // Markdown
}

export const GoalMenu: React.FC = () => {
    const [goal, setGoal] = useState<Goal>(() => {
        const threeMonthsFromNow = new Date();
        threeMonthsFromNow.setMonth(threeMonthsFromNow.getMonth() + 3);

        return {
            current_height: 180,
            current_weight: 100,
            age: 30,
            current_body_fat: 28,
            goal_weight: 90,
            goal_body_fat: 20,
            target_date: threeMonthsFromNow.toISOString().split('T')[0]
        };
    });
    const [loading, setLoading] = useState(false);
    const [analysis, setAnalysis] = useState<string | null>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        // Fetch existing goal
        const fetchGoal = async () => {
            try {
                const data = await api.getGoal();
                if (data && data.current_weight) { // Check for valid data
                    setGoal(prev => ({ ...prev, ...data }));
                }
            } catch (err) {
                console.error("Failed to fetch goal", err);
            }
        };
        fetchGoal();
    }, []);

    const handleAnalyze = async () => {
        setLoading(true);
        try {
            const data = await api.analyzeGoal(goal);
            if (data.analysis) {
                setAnalysis(data.analysis);
                setGoal(prev => ({
                    ...prev,
                    daily_caloric_deficit: data.daily_caloric_deficit,
                    daily_calories: data.daily_calories
                }));
            }
        } catch (err) {
            console.error("Analysis failed", err);
            setAnalysis("Error running analysis. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await api.saveGoal(goal);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("Failed to save", err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div className="bg-white dark:bg-black rounded-[2.5rem] p-10 border border-zinc-100 dark:border-zinc-900 shadow-sm">
                <div className="flex items-center gap-4 mb-8">
                    <div className="p-3 bg-zinc-100 dark:bg-zinc-900 rounded-xl">
                        <Target size={24} className="text-zinc-900 dark:text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black tracking-tighter">Goal Setting</h2>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Define your targets</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Current Stats */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold">Current Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase">Height (cm)</label>
                                <input
                                    type="number"
                                    value={goal.current_height}
                                    onChange={e => setGoal({ ...goal, current_height: Number(e.target.value) })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase">Weight (kg)</label>
                                <input
                                    type="number"
                                    value={goal.current_weight}
                                    onChange={e => setGoal({ ...goal, current_weight: Number(e.target.value) })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase">Age</label>
                                <input
                                    type="number"
                                    value={goal.age}
                                    onChange={e => setGoal({ ...goal, age: Number(e.target.value) })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase">Body Fat % (Est.)</label>
                                <input
                                    type="number"
                                    value={goal.current_body_fat}
                                    onChange={e => setGoal({ ...goal, current_body_fat: Number(e.target.value) })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Target Stats */}
                    <div className="space-y-6">
                        <h3 className="text-lg font-bold">Target</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase">Goal Weight (kg)</label>
                                <input
                                    type="number"
                                    value={goal.goal_weight}
                                    onChange={e => setGoal({ ...goal, goal_weight: Number(e.target.value) })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-bold text-zinc-500 uppercase">Goal Body Fat %</label>
                                <input
                                    type="number"
                                    value={goal.goal_body_fat}
                                    onChange={e => setGoal({ ...goal, goal_body_fat: Number(e.target.value) })}
                                    className="w-full bg-zinc-50 dark:bg-zinc-900 p-4 rounded-xl font-bold outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-all"
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-xs font-bold text-zinc-500 uppercase flex items-center gap-2 mb-2">
                                    <Clock size={12} /> Target Date
                                </label>
                                <CustomDatePicker
                                    value={goal.target_date || ''}
                                    onChange={val => setGoal({ ...goal, target_date: val })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="mt-10 flex gap-4">
                    <button
                        onClick={handleAnalyze}
                        disabled={loading}
                        className="flex-1 bg-black dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:opacity-80 transition-opacity disabled:opacity-50"
                    >
                        {loading ? <span className="animate-spin">⏳</span> : <Calculator size={20} />}
                        {loading ? "Analyzing..." : "Ask AI Coach"}
                    </button>
                    <button
                        onClick={handleSave}
                        className="px-8 bg-zinc-100 dark:bg-zinc-900 text-black dark:text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <Save size={20} />
                        {saved ? "Saved!" : "Save"}
                    </button>
                </div>

                {/* Analysis Result */}
                {analysis && (
                    <div className="mt-8 p-6 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 animate-in slide-in-from-bottom-4">
                        <div className="flex items-start gap-4">
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
                                <AlertCircle size={20} />
                            </div>
                            <div className="space-y-4 w-full">
                                <h4 className="font-black text-xl tracking-tight">Coach's Strategy</h4>
                                <AIResponse markdown={analysis} className="mt-2" />
                                {goal.daily_caloric_deficit && (
                                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-zinc-400">Suggested Deficit</p>
                                            <p className="text-xl font-black text-red-500">-{goal.daily_caloric_deficit} kcal</p>
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-black text-zinc-400">Target Daily Intake</p>
                                            <p className="text-xl font-black text-green-500">{goal.daily_calories} kcal</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
