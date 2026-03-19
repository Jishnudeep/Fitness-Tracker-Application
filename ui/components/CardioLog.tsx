import React, { useState, useEffect } from 'react';
import { Workout, Exercise, Set, MuscleGroup, WorkoutTemplate, ExercisePerformance } from '../types';
import { Plus, Trash2, Clock, CheckCircle, List, Loader2, X, Activity, Footprints, Save } from 'lucide-react';
import { Button } from './ui/Button';
import { CustomDatePicker } from './ui/CustomDatePicker';
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
            const cardioTemplates = allTemplates.filter(t =>
                t.exercises.every(te => te.muscleGroup === MuscleGroup.CARDIO) ||
                t.name.toLowerCase().includes('cardio')
            );
            setTemplates(cardioTemplates);
        } catch (err) { console.error(err); } finally { setIsLoadingTemplates(false); }
    };

    useEffect(() => { loadTemplates(); }, []);

    useEffect(() => {
        const exerciseNames = exercises.map(ex => ex.name).filter(name => name.length > 2);
        if (exerciseNames.length === 0) return;
        const fetchPerformance = async () => {
            try {
                const performances = await api.getLastPerformance(exerciseNames);
                const perfMap: Record<string, ExercisePerformance> = {};
                performances.forEach(p => { perfMap[p.exerciseName.toLowerCase()] = p; });
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
                id: Math.random().toString(36).substr(2, 9), name: te.name, muscleGroup: te.muscleGroup,
                sets: Array.from({ length: te.defaultSets }).map((_, i) => ({
                    id: Math.random().toString(36).substr(2, 9) + '-' + i,
                    speed: te.defaultSpeed, incline: te.defaultIncline,
                    timeSeconds: te.defaultTimeSeconds, caloriesBurnt: te.defaultCaloriesBurnt || 60,
                    steps: te.defaultSteps || 0, completed: false
                }))
            }));
        setExercises(templateExercises);
        setShowTemplateModal(false);
    };

    const addExercise = () => {
        setExercises([...exercises, {
            id: Date.now().toString(), name: '', muscleGroup: MuscleGroup.CARDIO,
            sets: [{ id: Date.now().toString() + '-1', speed: 0, incline: 0, timeSeconds: 0, caloriesBurnt: 60, steps: 0, completed: false }]
        }]);
    };

    const updateExercise = (id: string, field: keyof Exercise, value: any) => {
        setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
    };

    const addSet = (exerciseId: string) => {
        setExercises(exercises.map(ex => {
            if (ex.id === exerciseId) {
                const lastSet = ex.sets[ex.sets.length - 1];
                return { ...ex, sets: [...ex.sets, { id: Date.now().toString(), speed: lastSet?.speed || 0, incline: lastSet?.incline || 0, timeSeconds: lastSet?.timeSeconds || 0, caloriesBurnt: lastSet?.caloriesBurnt || 60, steps: lastSet?.steps || 0, completed: false }] };
            }
            return ex;
        }));
    };

    const updateSet = (exerciseId: string, setId: string, field: keyof Set, value: any) => {
        setExercises(exercises.map(ex => ex.id === exerciseId ? { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s) } : ex));
    };

    const removeExercise = (id: string) => setExercises(exercises.filter(ex => ex.id !== id));

    const handleSave = () => {
        if (!name || exercises.length === 0) return;
        onSave({ id: Date.now().toString(), name, date: new Date(date).toISOString(), durationMinutes: Number(duration) || 0, exercises, notes } as any);
        setExercises([]); setName('');
    };

    return (
        <div className="pb-24 space-y-6 page-enter max-w-2xl mx-auto">
            {/* Header */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 flex items-center justify-center">
                            <Activity size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Cardio Session</h2>
                            <p className="text-xs text-zinc-400 font-medium">Movement is medicine</p>
                        </div>
                    </div>
                    <button onClick={() => setShowTemplateModal(true)}
                        className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors" title="Templates">
                        <List size={18} />
                    </button>
                </div>

                <div className="space-y-4">
                    <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="E.g. Morning Run, Treadmill..."
                        className="w-full text-lg font-bold bg-transparent border-b-2 border-zinc-100 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-white outline-none py-2 transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-700" />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-500 ml-1">Session Date</label>
                            <CustomDatePicker value={date} onChange={(val) => setDate(val)} />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-500 ml-1">Duration</label>
                            <div className="relative">
                                <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input type="number" value={duration} onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))} placeholder="Minutes"
                                    className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Exercises */}
            <div className="space-y-4">
                {exercises.map((exercise, exIndex) => {
                    const perf = recentPerformances[exercise.name.toLowerCase()];
                    return (
                        <div key={exercise.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
                            <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start gap-3">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-xs font-bold text-zinc-300 dark:text-zinc-600">{String(exIndex + 1).padStart(2, '0')}</span>
                                        <span className="text-[11px] font-semibold text-pink-500 px-2 py-0.5 rounded bg-pink-50 dark:bg-pink-900/20">CARDIO</span>
                                    </div>
                                    <input type="text" value={exercise.name} onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                                        placeholder="Exercise name (e.g. Treadmill)..." className="w-full bg-transparent text-base font-bold outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700" />
                                    {perf && perf.lastSpeed && perf.lastSpeed > 0 && (
                                        <div className="mt-1.5 text-[11px] text-zinc-400 font-medium flex items-center gap-1">
                                            Last: {perf.lastSpeed}km/h · {perf.lastIncline}inc · {perf.lastTimeSeconds}s
                                            {perf.lastSteps && perf.lastSteps > 0 && <span>· {perf.lastSteps} steps</span>}
                                        </div>
                                    )}
                                </div>
                                <button onClick={() => removeExercise(exercise.id)}
                                    className="w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-red-500 transition-colors">
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="p-5 space-y-3">
                                {exercise.sets.map((set, sIndex) => (
                                    <div key={set.id} className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-bold text-zinc-300 dark:text-zinc-600 w-5">{sIndex + 1}</span>
                                            <div className="flex-1 grid grid-cols-5 gap-1.5">
                                                <input type="number" step="0.1" value={set.speed || ''} onChange={(e) => updateSet(exercise.id, set.id, 'speed', Number(e.target.value))}
                                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-center text-xs font-semibold outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors" placeholder="km/h" title="Speed" />
                                                <input type="number" step="0.5" value={set.incline || ''} onChange={(e) => updateSet(exercise.id, set.id, 'incline', Number(e.target.value))}
                                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-center text-xs font-semibold outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors" placeholder="inc" title="Incline" />
                                                <input type="number" value={set.timeSeconds || ''} onChange={(e) => updateSet(exercise.id, set.id, 'timeSeconds', Number(e.target.value))}
                                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-center text-xs font-semibold outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors" placeholder="sec" title="Time" />
                                                <input type="number" value={set.caloriesBurnt ?? ''} onChange={(e) => updateSet(exercise.id, set.id, 'caloriesBurnt', Number(e.target.value))}
                                                    className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 text-center text-xs font-semibold outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors" placeholder="kcal" title="Calories" />
                                                <div className="relative">
                                                    <Footprints size={10} className="absolute left-1.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                                                    <input type="number" value={set.steps || ''} onChange={(e) => updateSet(exercise.id, set.id, 'steps', Number(e.target.value))}
                                                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2 pl-6 text-center text-xs font-semibold outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors" placeholder="steps" title="Steps" />
                                                </div>
                                            </div>
                                        </div>
                                        <button onClick={() => updateSet(exercise.id, set.id, 'completed', !set.completed)}
                                            className={`w-full py-2 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 ${set.completed ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-300 dark:text-zinc-600 hover:text-zinc-500'}`}>
                                            <CheckCircle size={14} />
                                            <span className="text-xs font-semibold">{set.completed ? 'Completed' : 'Mark Complete'}</span>
                                        </button>
                                    </div>
                                ))}

                                <button onClick={() => addSet(exercise.id)}
                                    className="w-full py-3 mt-2 border border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 transition-all flex items-center justify-center gap-1.5">
                                    <Plus size={14} /> Add Interval
                                </button>
                            </div>
                        </div>
                    );
                })}

                <button onClick={addExercise}
                    className="w-full py-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center gap-2 text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 transition-all group">
                    <Plus size={20} className="group-hover:rotate-90 transition-transform" />
                    <span className="text-xs font-semibold">New Cardio Exercise</span>
                </button>
            </div>

            {/* Footer */}
            <div className="space-y-3">
                <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Session notes..."
                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-medium min-h-[100px] outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors" />
                <Button onClick={handleSave} size="lg" className="w-full">
                    <Save size={18} /> Complete Session
                </Button>
            </div>

            {/* Template Modal */}
            {showTemplateModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTemplateModal(false)} />
                    <div className="relative bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 shadow-2xl page-enter">
                        <div className="flex justify-between items-center mb-5">
                            <h3 className="text-lg font-bold">Cardio Routines</h3>
                            <button onClick={() => setShowTemplateModal(false)} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"><X size={18} /></button>
                        </div>
                        <div className="space-y-2 max-h-[50vh] overflow-y-auto">
                            {isLoadingTemplates ? (
                                <div className="py-8 flex flex-col items-center gap-3 text-zinc-400">
                                    <Loader2 className="animate-spin" size={20} /><span className="text-xs font-medium">Loading...</span>
                                </div>
                            ) : templates.length === 0 ? (
                                <div className="py-8 text-center"><p className="text-sm text-zinc-400">No cardio templates yet</p></div>
                            ) : (
                                templates.map(t => (
                                    <button key={t.id} onClick={() => applyTemplate(t)}
                                        className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-left border border-zinc-100 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-white transition-all">
                                        <span className="text-sm font-semibold block">{t.name}</span>
                                        <span className="text-xs text-zinc-400 mt-0.5">{(t.exercises || []).length} movements</span>
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
