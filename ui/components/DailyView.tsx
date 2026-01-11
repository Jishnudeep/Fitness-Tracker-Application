import React from 'react';
import { Workout, Meal } from '../types';
import { Dumbbell, Utensils, Clock, Flame, Info, ChevronRight, Apple, Beef, Droplets, Weight } from 'lucide-react';

interface DailyViewProps {
    date: string; // ISO string or YYYY-MM-DD
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
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-zinc-900 dark:text-white">{displayDate}</h2>
                    <p className="text-sm text-zinc-500">Summary of your day</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nutrition Summary Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-6 text-pink-500">
                        <Utensils size={20} className="text-pink-500" />
                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Nutrition Log</h3>
                    </div>

                    {dailyMeals.length > 0 ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-4 gap-2">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-zinc-900 dark:text-white leading-tight">{totalCalories}</p>
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mt-1">Calories</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-zinc-900 dark:text-white">{totalProtein}g</p>
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mt-1">Protein</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-zinc-900 dark:text-white">{totalCarbs}g</p>
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mt-1">Carbs</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-lg font-bold text-zinc-900 dark:text-white">{totalFats}g</p>
                                    <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold mt-1">Fats</p>
                                </div>
                            </div>

                            <div className="space-y-3 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                {dailyMeals.map((meal) => (
                                    <div key={meal.id} className="space-y-2">
                                        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-pink-100 dark:bg-pink-900/30 rounded-lg text-pink-600 dark:text-pink-400">
                                                    <Flame size={16} />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-bold text-zinc-900 dark:text-white leading-tight">{meal.name}</p>
                                                    <p className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider">{meal.type}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-sm font-black text-zinc-900 dark:text-white">{meal.calories} <span className="text-[10px] font-normal">kcal</span></p>
                                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-tighter">P:{meal.protein}g C:{meal.carbs}g F:{meal.fats}g</p>
                                            </div>
                                        </div>

                                        {/* Itemized List */}
                                        {meal.items && meal.items.length > 0 && (
                                            <div className="ml-4 pl-4 border-l-2 border-zinc-100 dark:border-zinc-800 space-y-1 py-1">
                                                {meal.items.map((item, idx) => (
                                                    <div key={item.id} className="flex justify-between items-center text-[10px]">
                                                        <span className="text-zinc-500 font-medium">
                                                            {idx + 1}. <span className="text-pink-500 font-bold">{item.quantity}x</span> {item.name}
                                                        </span>
                                                        <span className="text-zinc-400">{item.calories * item.quantity} kcal</span>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-10 opacity-50">
                            <Apple size={40} className="mb-2 text-zinc-300" />
                            <p className="text-sm text-zinc-500">No meals logged for this day</p>
                        </div>
                    )}
                </div>

                {/* Workout Summary Card */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 shadow-sm border border-zinc-200 dark:border-zinc-800">
                    <div className="flex items-center gap-2 mb-6 text-indigo-500">
                        <Dumbbell size={20} className="text-indigo-500" />
                        <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Training Sessions</h3>
                    </div>

                    {dailyWorkouts.length > 0 ? (
                        <div className="space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl">
                                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                                        <Clock size={16} className="text-indigo-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{totalDuration} min</p>
                                        <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Total Duration</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-3 rounded-xl">
                                    <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
                                        <Weight size={16} className="text-emerald-500" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{totalWeight.toLocaleString()} kg</p>
                                        <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-bold">Total Volume</p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                {dailyWorkouts.map((workout) => (
                                    <div key={workout.id} className="space-y-3">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-bold text-indigo-500 uppercase tracking-tight">{workout.name}</p>
                                            {workout.notes && <button title={workout.notes} className="text-orange-400 hover:text-orange-600"><Info size={14} className="text-orange-500" /></button>}
                                        </div>
                                        <div className="grid grid-cols-1 gap-2">
                                            {workout.exercises.map((ex) => (
                                                <div key={ex.id} className="p-3 border border-zinc-100 dark:border-zinc-800 rounded-xl">
                                                    <div className="flex justify-between items-center mb-2">
                                                        <p className="text-xs font-bold text-zinc-900 dark:text-white">{ex.name}</p>
                                                        <span className="text-[10px] px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-500 rounded font-medium">{ex.muscleGroup}</span>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {ex.sets.map((s, idx) => (
                                                            <div key={s.id} className="text-[10px] bg-zinc-50 dark:bg-zinc-800/50 px-2 py-1 rounded text-zinc-600 dark:text-zinc-400 flex items-center">
                                                                <span className="font-bold mr-1">{idx + 1}.</span> {s.weight}kg x {s.reps}
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
                        <div className="flex flex-col items-center justify-center py-10 opacity-50">
                            <Dumbbell size={40} className="mb-2 text-zinc-300" />
                            <p className="text-sm text-zinc-500">No workouts logged for this day</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
