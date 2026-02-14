import React, { useState, useEffect } from 'react';
import { Workout, Exercise, Set, MuscleGroup, WorkoutTemplate, ExercisePerformance } from '../types';
import { Plus, Trash2, Calendar, Clock, CheckCircle, List, Loader2, X, Activity, Footprints } from 'lucide-react';
import { Button } from './ui/Button';
import { api } from '../services/api';

interface CardioLogProps {
    onSave: (workout: Workout) => void;
}

export const CardioLog: React.FC<CardioLogProps> = ({ onSave }) => {
    const [name, setName] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [duration, setDuration] = useState<number | ''>('');
    const [notes, setNotes] = useState('');
    const [exercises, setExercises] = useState<Exercise[]>([]);

    const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
    const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
    const [showTemplateModal, setShowTemplateModal] = useState(false);
    const [recentPerformances, setRecentPerformances] = useState<Record<string, ExercisePerformance>>({});

    const loadTemplates = async () => {
        setIsLoadingTemplates(true);
        try {
            const allTemplates = await api.getTemplates();
            // Only show templates that are exclusively cardio
            const cardioTemplates = allTemplates.filter(t =>
                t.exercises.every(te => te.muscleGroup === MuscleGroup.CARDIO) ||
                t.name.toLowerCase().includes('cardio')
            );
            setTemplates(cardioTemplates);
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingTemplates(false);
        }
    };

    useEffect(() => {
        loadTemplates();
    }, []);

    useEffect(() => {
        const exerciseNames = exercises.map(ex => ex.name).filter(name => name.length > 2);
        if (exerciseNames.length === 0) return;

        const fetchPerformance = async () => {
            try {
                const performances = await api.getLastPerformance(exerciseNames);
                const perfMap: Record<string, ExercisePerformance> = {};
                performances.forEach(p => {
                    perfMap[p.exerciseName.toLowerCase()] = p;
                });
                setRecentPerformances(prev => ({ ...prev, ...perfMap }));
            } catch (err) { }
        };

        const timer = setTimeout(fetchPerformance, 500);
        return () => clearTimeout(timer);
    }, [exercises.map(ex => ex.name).join(',')]);

    const applyTemplate = (template: WorkoutTemplate) => {
        setName(template.name);
        const templateExercises: Exercise[] = template.exercises
            .sort((a, b) => a.orderIndex - b.orderIndex)
            .map(te => ({
                id: Math.random().toString(36).substr(2, 9),
                name: te.name,
                muscleGroup: te.muscleGroup,
                sets: Array.from({ length: te.defaultSets }).map((_, i) => ({
                    id: Math.random().toString(36).substr(2, 9) + '-' + i,
                    speed: te.defaultSpeed,
                    incline: te.defaultIncline,
                    timeSeconds: te.defaultTimeSeconds,
                    caloriesBurnt: te.defaultCaloriesBurnt || 60,
                    steps: te.defaultSteps || 0,
                    completed: false
                }))
            }));
        setExercises(templateExercises);
        setShowTemplateModal(false);
    };

    const addExercise = () => {
        setExercises([...exercises, {
            id: Date.now().toString(),
            name: '',
            muscleGroup: MuscleGroup.CARDIO,
            sets: [{
                id: Date.now().toString() + '-1',
                speed: 0,
                incline: 0,
                timeSeconds: 0,
                caloriesBurnt: 60,
                steps: 0,
                completed: false
            }]
        }]);
    };

    const updateExercise = (id: string, field: keyof Exercise, value: any) => {
        setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
    };

    const addSet = (exerciseId: string) => {
        setExercises(exercises.map(ex => {
            if (ex.id === exerciseId) {
                const lastSet = ex.sets[ex.sets.length - 1];
                return {
                    ...ex,
                    sets: [...ex.sets, {
                        id: Date.now().toString(),
                        speed: lastSet ? lastSet.speed : 0,
                        incline: lastSet ? lastSet.incline : 0,
                        timeSeconds: lastSet ? lastSet.timeSeconds : 0,
                        caloriesBurnt: lastSet ? lastSet.caloriesBurnt : 60,
                        steps: lastSet ? lastSet.steps : 0,
                        completed: false
                    }]
                };
            }
            return ex;
        }));
    };

    const updateSet = (exerciseId: string, setId: string, field: keyof Set, value: any) => {
        setExercises(exercises.map(ex => ex.id === exerciseId ? {
            ...ex,
            sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s)
        } : ex));
    };

    const removeExercise = (id: string) => setExercises(exercises.filter(ex => ex.id !== id));

    const handleSave = () => {
        if (!name || exercises.length === 0) return;
        onSave({
            id: Date.now().toString(),
            name,
            date: new Date(date).toISOString(),
            durationMinutes: Number(duration) || 0,
            exercises,
            notes
        } as any);
        setExercises([]);
        setName('');
    };

    return (
        <div className="pb-24 space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">
            {/* Header */}
            <div className="bg-white dark:bg-black p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:shadow-md">
                <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-3 bg-zinc-900 dark:bg-white rounded-2xl text-white dark:text-black">
                            <Activity size={24} />
                        </div>
                        <div>
                            <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">Cardio Session</h2>
                            <p className="text-zinc-500 text-[10px] font-black uppercase tracking-widest mt-1">Movement is medicine</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowTemplateModal(true)}
                        className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all shadow-sm"
                    >
                        <List size={20} />
                    </button>
                </div>

                <div className="space-y-6">
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="E.g. Morning Run, Treadmill..."
                        className="w-full text-2xl font-black bg-transparent border-b-2 border-zinc-100 dark:border-zinc-900 focus:border-zinc-900 dark:focus:border-white outline-none py-2 transition-all placeholder:opacity-20"
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="relative group">
                            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" size={18} />
                            <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-xs font-bold outline-none group-focus-within:border-zinc-900 dark:group-focus-within:border-white transition-all" />
                        </div>
                        <div className="relative group">
                            <Clock className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-zinc-900 dark:group-focus-within:text-white transition-colors" size={18} />
                            <input type="number" value={duration} onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Duration (min)" className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-xs font-bold outline-none group-focus-within:border-zinc-900 dark:group-focus-within:border-white transition-all" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Exercise List */}
            <div className="space-y-6">
                {exercises.map((exercise, exIndex) => {
                    const perf = recentPerformances[exercise.name.toLowerCase()];
                    return (
                        <div key={exercise.id} className="bg-white dark:bg-zinc-950 rounded-[2rem] border border-zinc-100 dark:border-zinc-900 overflow-hidden shadow-sm transition-all hover:shadow-md">
                            <div className="p-6 border-b border-zinc-50 dark:border-zinc-900 flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-3">
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{String(exIndex + 1).padStart(2, '0')}</span>
                                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-300">CARDIO</span>
                                    </div>
                                    <input
                                        type="text"
                                        value={exercise.name}
                                        onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                                        placeholder="Exercise name (e.g. Treadmill)..."
                                        className="w-full bg-transparent text-xl font-black outline-none placeholder:opacity-10"
                                    />
                                    {perf && perf.lastSpeed && perf.lastSpeed > 0 && (
                                        <div className="mt-2 text-[9px] font-black text-zinc-300 dark:text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                                            Last: {perf.lastSpeed}km/h · {perf.lastIncline}inc · {perf.lastTimeSeconds}s
                                            {perf.lastSteps && perf.lastSteps > 0 && <span> · {perf.lastSteps} steps</span>}
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => removeExercise(exercise.id)} className="p-2 text-zinc-100 dark:text-zinc-900 hover:text-red-500 transition-colors">
                                    <Trash2 size={18} />
                                </button>
                            </div>

                            <div className="p-6 space-y-3">
                                {exercise.sets.map((set, sIndex) => (
                                    <div key={set.id} className="grid grid-cols-12 gap-3 items-center">
                                        <div className="col-span-1 text-[10px] font-black text-zinc-300">{sIndex + 1}</div>
                                        <div className="grid grid-cols-5 col-span-11 gap-2 items-center">
                                            <input type="number" step="0.1" value={set.speed || ''} onChange={(e) => updateSet(exercise.id, set.id, 'speed', Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl p-2.5 text-center text-[10px] font-black focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all" placeholder="km/h" title="Speed" />
                                            <input type="number" step="0.5" value={set.incline || ''} onChange={(e) => updateSet(exercise.id, set.id, 'incline', Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl p-2.5 text-center text-[10px] font-black focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all" placeholder="inc" title="Incline" />
                                            <input type="number" value={set.timeSeconds || ''} onChange={(e) => updateSet(exercise.id, set.id, 'timeSeconds', Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl p-2.5 text-center text-[10px] font-black focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all" placeholder="sec" title="Time (sec)" />
                                            <input type="number" value={set.caloriesBurnt ?? ''} onChange={(e) => updateSet(exercise.id, set.id, 'caloriesBurnt', Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl p-2.5 text-center text-[10px] font-black focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all" placeholder="kcal" title="Calories Burnt" />
                                            <div className="relative group/step">
                                                <Footprints size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within/step:text-zinc-900 dark:group-focus-within/step:text-white" />
                                                <input type="number" value={set.steps || ''} onChange={(e) => updateSet(exercise.id, set.id, 'steps', Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl p-2.5 pl-7 text-center text-[10px] font-black focus:ring-1 focus:ring-zinc-900 dark:focus:ring-white transition-all" placeholder="steps" title="Total Steps" />
                                            </div>
                                        </div>
                                        <div className="col-span-12 flex justify-end mt-1">
                                            <button
                                                onClick={() => updateSet(exercise.id, set.id, 'completed', !set.completed)}
                                                className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all ${set.completed ? 'bg-zinc-900 dark:bg-white text-white dark:text-black shadow-lg' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-200 dark:text-zinc-700 hover:text-zinc-400'}`}
                                            >
                                                <CheckCircle size={16} />
                                                <span className="text-[9px] font-black uppercase tracking-widest">{set.completed ? 'Completed' : 'Complete Step'}</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <button
                                    onClick={() => addSet(exercise.id)}
                                    className="w-full py-4 mt-4 border border-zinc-50 dark:border-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus size={14} />
                                    Add Step / Interval
                                </button>
                            </div>
                        </div>
                    );
                })}

                <button
                    onClick={addExercise}
                    className="w-full py-10 border-2 border-dashed border-zinc-100 dark:border-zinc-900 rounded-[2rem] flex flex-col items-center gap-3 text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-300 transition-all group"
                >
                    <Plus size={24} className="group-hover:rotate-90 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em]">New Cardio Exercise</span>
                </button>
            </div>

            {/* Footer Notes */}
            <div className="space-y-4">
                <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Session notes (How was your focus? Breathing?)..."
                    className="w-full p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] text-xs font-medium min-h-[120px] outline-none placeholder:opacity-30 focus:border-zinc-900 dark:focus:border-white transition-all"
                />
                <Button onClick={handleSave} className="w-full py-6 rounded-2xl font-black text-sm uppercase tracking-[0.2em] bg-zinc-900 dark:bg-white text-white dark:text-black border-0 shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
                    Complete Session
                </Button>
            </div>

            {/* Template Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md" onClick={() => setShowTemplateModal(false)}></div>
                    <div className="relative bg-white dark:bg-zinc-950 w-full max-w-sm rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 shadow-2xl">
                        <div className="flex justify-between items-center mb-6">
                            <h3 className="text-2xl font-black tracking-tighter">Cardio Routines</h3>
                            <button onClick={() => setShowTemplateModal(false)} className="p-2 text-zinc-400 transition-colors"><X size={20} /></button>
                        </div>
                        <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2 custom-scrollbar">
                            {isLoadingTemplates ? (
                                <div className="py-10 flex flex-col items-center justify-center gap-4 text-zinc-400">
                                    <Loader2 className="animate-spin" size={24} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">Syncing...</span>
                                </div>
                            ) : templates.length === 0 ? (
                                <div className="py-10 text-center text-zinc-400 italic text-xs">No cardio templates yet.</div>
                            ) : (
                                templates.map(t => (
                                    <button key={t.id} onClick={() => applyTemplate(t)} className="w-full p-5 bg-zinc-50 dark:bg-zinc-900 rounded-3xl text-left border border-zinc-100 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-white transition-all group">
                                        <span className="text-sm font-black uppercase block group-hover:translate-x-1 transition-transform">{t.name}</span>
                                        <span className="text-[10px] font-bold text-zinc-400 mt-1 uppercase opacity-60">{(t.exercises || []).length} Movements</span>
                                    </button>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
