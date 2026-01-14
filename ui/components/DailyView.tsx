import React from 'react';
import { Workout, Meal } from '../types';
import { Dumbbell, Utensils, Clock, Flame, Info, Apple, Weight } from 'lucide-react';

interface DailyViewProps {
    date: string;
    workouts: Workout[];
    meals: Meal[];
}

export const DailyView: React.FC<DailyViewProps> = ({ date, workouts, meals }) => {
    const displayDate = new Date(date).toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        year: 'numeric'
    });

    const dailyWorkouts = workouts.filter(w => w.date.startsWith(date));
    const dailyMeals = meals.filter(m => m.date.startsWith(date));

    const totalCalories = dailyMeals.reduce((sum, m) => sum + m.calories, 0);
    const totalProtein = dailyMeals.reduce((sum, m) => sum + m.protein, 0);
    const totalCarbs = dailyMeals.reduce((sum, m) => sum + m.carbs, 0);
    const totalFats = dailyMeals.reduce((sum, m) => sum + m.fats, 0);

    const totalWeight = dailyWorkouts.reduce((acc, w) => {
        return acc + w.exercises.reduce((exAcc, ex) => {
            return exAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.weight * s.reps), 0);
        }, 0);
    }, 0);

    const totalDuration = dailyWorkouts.reduce((acc, w) => acc + (w.durationMinutes || 0), 0);

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-5 duration-700">

            {/* Nutrition Section */}
            <div className="bg-white dark:bg-black p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-900 shadow-sm">
                <div className="flex items-center gap-3 mb-10">
                    <Utensils size={20} className="text-zinc-900 dark:text-white" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Nutrition</h3>
                </div>

                {dailyMeals.length > 0 ? (
                    <div className="space-y-10">
                        <div className="grid grid-cols-4 gap-4">
                            {[
                                { label: 'Calories', val: totalCalories },
                                { label: 'Protein', val: `${totalProtein}g` },
                                { label: 'Carbs', val: `${totalCarbs}g` },
                                { label: 'Fats', val: `${totalFats}g` }
                            ].map((s, i) => (
                                <div key={i} className="text-center">
                                    <p className="text-2xl font-black text-zinc-900 dark:text-white">{s.val}</p>
                                    <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold mt-1">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4 pt-8 border-t border-zinc-50 dark:border-zinc-900">
                            {dailyMeals.map((meal) => (
                                <div key={meal.id} className="p-6 rounded-3xl bg-zinc-50/50 dark:bg-zinc-950/20 border border-zinc-100 dark:border-zinc-900 flex justify-between items-center group">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-zinc-900 dark:bg-white text-white dark:text-black rounded-2xl">
                                            <Flame size={18} />
                                        </div>
                                        <div>
                                            <p className="text-base font-black text-zinc-900 dark:text-white leading-tight">{meal.name}</p>
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{meal.type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-lg font-black text-zinc-900 dark:text-white">{meal.calories} <span className="text-[10px] font-bold opacity-30">kcal</span></p>
                                        <p className="text-[9px] text-zinc-400 font-black uppercase tracking-tighter">P:{meal.protein} C:{meal.carbs} F:{meal.fats}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <Apple size={40} className="mx-auto mb-4 text-zinc-100 dark:text-zinc-900" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">Empty Log</p>
                    </div>
                )}
            </div>

            {/* Fitness Section */}
            <div className="bg-white dark:bg-black p-8 rounded-[2.5rem] border border-zinc-100 dark:border-zinc-900 shadow-sm">
                <div className="flex items-center gap-3 mb-10">
                    <Dumbbell size={20} className="text-zinc-900 dark:text-white" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400">Training</h3>
                </div>

                {dailyWorkouts.length > 0 ? (
                    <div className="space-y-10">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-900">
                                <Clock size={20} className="text-zinc-400" />
                                <div>
                                    <p className="text-xl font-black text-zinc-900 dark:text-white">{totalDuration} min</p>
                                    <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Duration</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-950 p-6 rounded-3xl border border-zinc-100 dark:border-zinc-900">
                                <Weight size={20} className="text-zinc-400" />
                                <div>
                                    <p className="text-xl font-black text-zinc-900 dark:text-white">{totalWeight.toLocaleString()} kg</p>
                                    <p className="text-[9px] uppercase tracking-widest text-zinc-400 font-bold">Volume</p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6 pt-8 border-t border-zinc-50 dark:border-zinc-900">
                            {dailyWorkouts.map((workout) => (
                                <div key={workout.id} className="space-y-6">
                                    <div className="flex justify-between items-center group">
                                        <p className="text-[10px] font-black text-zinc-900 dark:text-white uppercase tracking-[0.2em]">{workout.name}</p>
                                        {workout.notes && <button className="text-zinc-300 hover:text-zinc-600 transition-colors"><Info size={14} /></button>}
                                    </div>
                                    <div className="grid grid-cols-1 gap-4">
                                        {workout.exercises.map((ex) => (
                                            <div key={ex.id} className="p-6 bg-zinc-50/30 dark:bg-zinc-950/10 rounded-3xl border border-zinc-50 dark:border-zinc-900/50">
                                                <div className="flex justify-between items-center mb-4">
                                                    <p className="text-sm font-black text-zinc-800 dark:text-zinc-200">{ex.name}</p>
                                                    <span className="text-[8px] font-black px-2 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 rounded-full uppercase tracking-wider">{ex.muscleGroup}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-2">
                                                    {ex.sets.map((s, idx) => (
                                                        <div key={s.id} className="text-[9px] font-bold bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-100 dark:border-zinc-800/50 text-zinc-500">
                                                            <span className="text-zinc-300 mr-1">{idx + 1}</span> {s.weight}kg x {s.reps}
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="py-20 text-center">
                        <Dumbbell size={40} className="mx-auto mb-4 text-zinc-100 dark:text-zinc-900" />
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-300">No Activity</p>
                    </div>
                )}
            </div>
        </div>
    );
};
