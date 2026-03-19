import React from 'react';
import { Workout, Meal, MuscleGroup } from '../types';
import { Dumbbell, Utensils, Clock, Flame, Info, Apple, Footprints } from 'lucide-react';

interface DailyViewProps {
    date: string;
    workouts: Workout[];
    meals: Meal[];
}

export const DailyView: React.FC<DailyViewProps> = ({ date, workouts, meals }) => {
    const dailyWorkouts = workouts.filter(w => w.date.startsWith(date));
    const dailyMeals = meals.filter(m => m.date.startsWith(date));

    const totalCalories = dailyMeals.reduce((sum, m) => sum + m.calories, 0);
    const totalProtein = dailyMeals.reduce((sum, m) => sum + m.protein, 0);
    const totalCarbs = dailyMeals.reduce((sum, m) => sum + m.carbs, 0);
    const totalFats = dailyMeals.reduce((sum, m) => sum + m.fats, 0);

    const totalWeight = dailyWorkouts.reduce((acc, w) => {
        return acc + w.exercises.reduce((exAcc, ex) => {
            if (ex.muscleGroup === MuscleGroup.CARDIO) return exAcc;
            return exAcc + ex.sets.reduce((sAcc, s) => sAcc + ((s.weight || 0) * (s.reps || 0)), 0);
        }, 0);
    }, 0);

    const totalBurned = dailyWorkouts.reduce((acc, w) => {
        return acc + w.exercises.reduce((exAcc, ex) => {
            return exAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.caloriesBurnt || 0), 0);
        }, 0);
    }, 0);

    const totalSteps = dailyWorkouts.reduce((acc, w) => {
        return acc + w.exercises.reduce((exAcc, ex) => {
            return exAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.steps || 0), 0);
        }, 0);
    }, 0);

    const totalDuration = dailyWorkouts.reduce((acc, w) => acc + (w.durationMinutes || 0), 0);

    return (
        <div className="space-y-8 page-enter">

            {/* Nutrition */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Utensils size={16} className="text-amber-500" />
                    <h3 className="text-sm font-semibold text-zinc-500">Nutrition</h3>
                </div>

                {dailyMeals.length > 0 ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-4 gap-3">
                            {[
                                { label: 'Calories', val: totalCalories, color: 'text-amber-500' },
                                { label: 'Protein', val: `${totalProtein}g`, color: 'text-zinc-900 dark:text-white' },
                                { label: 'Carbs', val: `${totalCarbs}g`, color: 'text-zinc-900 dark:text-white' },
                                { label: 'Fats', val: `${totalFats}g`, color: 'text-zinc-900 dark:text-white' }
                            ].map((s, i) => (
                                <div key={i} className="text-center bg-zinc-50 dark:bg-zinc-800 rounded-xl p-3">
                                    <p className={`text-lg font-bold ${s.color}`}>{s.val}</p>
                                    <p className="text-[11px] text-zinc-400 font-medium mt-0.5">{s.label}</p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2">
                            {dailyMeals.map((meal) => (
                                <div key={meal.id} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                                            <Flame size={16} />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-zinc-900 dark:text-white">{meal.name}</p>
                                            <p className="text-xs text-zinc-400 font-medium">{meal.type}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{meal.calories} <span className="text-xs font-normal text-zinc-400">kcal</span></p>
                                        <p className="text-[11px] text-zinc-400">P:{meal.protein} C:{meal.carbs} F:{meal.fats}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="py-12 text-center bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
                        <Apple size={32} className="mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
                        <p className="text-sm text-zinc-400 font-medium">No meals logged</p>
                    </div>
                )}
            </div>

            {/* Training */}
            <div>
                <div className="flex items-center gap-2 mb-4">
                    <Dumbbell size={16} className="text-indigo-500" />
                    <h3 className="text-sm font-semibold text-zinc-500">Training</h3>
                </div>

                {dailyWorkouts.length > 0 ? (
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                            {[
                                { icon: Clock, label: 'Duration', val: `${totalDuration} min`, color: 'text-purple-500' },
                                { icon: Dumbbell, label: 'Volume', val: `${totalWeight.toLocaleString()} kg`, color: 'text-indigo-500' },
                                { icon: Flame, label: 'Burned', val: `${totalBurned.toLocaleString()} kcal`, color: 'text-red-500' },
                                { icon: Footprints, label: 'Steps', val: totalSteps.toLocaleString(), color: 'text-teal-500' },
                            ].map((s, i) => (
                                <div key={i} className="flex items-center gap-3 bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                    <s.icon size={16} className={s.color} />
                                    <div>
                                        <p className="text-sm font-bold text-zinc-900 dark:text-white">{s.val}</p>
                                        <p className="text-[11px] text-zinc-400 font-medium">{s.label}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-4">
                            {dailyWorkouts.map((workout) => (
                                <div key={workout.id} className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <p className="text-sm font-semibold text-zinc-900 dark:text-white">{workout.name}</p>
                                        {workout.notes && <button className="text-zinc-300 hover:text-zinc-500 transition-colors"><Info size={14} /></button>}
                                    </div>
                                    <div className="space-y-2">
                                        {workout.exercises.map((ex) => (
                                            <div key={ex.id} className="p-4 bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-zinc-100 dark:border-zinc-800">
                                                <div className="flex justify-between items-center mb-3">
                                                    <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{ex.name}</p>
                                                    <span className="text-[10px] font-medium px-2 py-0.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-500 dark:text-zinc-400 rounded-full">{ex.muscleGroup}</span>
                                                </div>
                                                <div className="flex flex-wrap gap-1.5">
                                                    {ex.sets.map((s, idx) => {
                                                        const isCardio = ex.muscleGroup === MuscleGroup.CARDIO;
                                                        return (
                                                            <div key={s.id} className="text-xs font-medium bg-white dark:bg-zinc-900 px-2.5 py-1 rounded-lg border border-zinc-100 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400">
                                                                <span className="text-zinc-300 dark:text-zinc-600 mr-1">{idx + 1}</span>
                                                                {isCardio ? (
                                                                    `${s.speed || 0}km/h · ${s.incline || 0}inc · ${s.timeSeconds || 0}s · ${s.caloriesBurnt || 0}kcal${s.steps ? ` · ${s.steps} steps` : ''}`
                                                                ) : (
                                                                    `${s.weight || 0}kg × ${s.reps || 0}`
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="py-12 text-center bg-zinc-50 dark:bg-zinc-800/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-700">
                        <Dumbbell size={32} className="mx-auto mb-2 text-zinc-300 dark:text-zinc-600" />
                        <p className="text-sm text-zinc-400 font-medium">No activity logged</p>
                    </div>
                )}
            </div>
        </div>
    );
};
