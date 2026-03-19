import React, { useState, useEffect, useRef } from 'react';
import { Workout, Exercise, Set, MuscleGroup, WorkoutTemplate, ExercisePerformance } from '../types';
import { Plus, Trash2, Save, Dumbbell, Calendar, Clock, Timer, CheckCircle, ChevronDown, List, Star, Play, X, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
import { CustomDatePicker } from './ui/CustomDatePicker';
import { api } from '../services/api';

interface WorkoutLogProps {
  onSave: (workout: Workout) => void;
}

const MUSCLE_GROUPS = Object.values(MuscleGroup).filter(mg => mg !== MuscleGroup.CARDIO);

export const WorkoutLog: React.FC<WorkoutLogProps> = ({ onSave }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [recentPerformances, setRecentPerformances] = useState<Record<string, ExercisePerformance>>({});
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [activeSelect, setActiveSelect] = useState<string | null>(null);

  // Rest Timer
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [timerInput, setTimerInput] = useState(90);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    setTemplateError(null);
    try {
      const data = await api.getTemplates();
      const liftingTemplates = data.filter(t => !t.exercises.every(te => te.muscleGroup === MuscleGroup.CARDIO));
      setTemplates(liftingTemplates);
    } catch (err) {
      setTemplateError("Failed to load templates");
      console.error(err);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  useEffect(() => { loadTemplates(); }, []);
  useEffect(() => { if (showTemplateModal) loadTemplates(); }, [showTemplateModal]);

  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      if (end > start) setDuration(Math.round((end.getTime() - start.getTime()) / 60000));
    }
  }, [startTime, endTime]);

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

  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
    } else if (timeLeft <= 0) {
      setTimerActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerActive, timeLeft]);

  const handleStartTimer = () => { setTimeLeft(timerInput); setTimerActive(true); };

  const applyTemplate = (template: WorkoutTemplate) => {
    setName(template.name);
    setSelectedTemplateId(template.id);
    const templateExercises: Exercise[] = template.exercises
      .filter(te => te.muscleGroup !== MuscleGroup.CARDIO)
      .sort((a, b) => a.orderIndex - b.orderIndex)
      .map(te => ({
        id: Math.random().toString(36).substr(2, 9),
        name: te.name,
        muscleGroup: te.muscleGroup,
        sets: Array.from({ length: te.defaultSets }).map((_, i) => ({
          id: Math.random().toString(36).substr(2, 9) + '-' + i,
          reps: te.defaultReps, weight: te.defaultWeight,
          speed: te.defaultSpeed, incline: te.defaultIncline,
          timeSeconds: te.defaultTimeSeconds, caloriesBurnt: te.defaultCaloriesBurnt || 60,
          completed: false
        }))
      }));
    setExercises(templateExercises);
    setShowTemplateModal(false);
  };

  const addExercise = () => {
    setExercises([...exercises, {
      id: Date.now().toString(), name: '', muscleGroup: MuscleGroup.CHEST,
      sets: [{ id: Date.now().toString() + '-1', reps: 0, weight: 0, speed: 0, incline: 0, timeSeconds: 0, caloriesBurnt: 60, completed: false }]
    }]);
  };

  const updateExercise = (id: string, field: keyof Exercise, value: any) => {
    setExercises(exercises.map(ex => ex.id === id ? { ...ex, [field]: value } : ex));
    if (field === 'muscleGroup') setActiveSelect(null);
  };

  const addSet = (exerciseId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        const lastSet = ex.sets[ex.sets.length - 1];
        return { ...ex, sets: [...ex.sets, { id: Date.now().toString(), reps: lastSet?.reps || 0, weight: lastSet?.weight || 0, speed: lastSet?.speed || 0, incline: lastSet?.incline || 0, timeSeconds: lastSet?.timeSeconds || 0, caloriesBurnt: lastSet?.caloriesBurnt || 60, completed: false }] };
      }
      return ex;
    }));
  };

  const updateSet = (exerciseId: string, setId: string, field: keyof Set, value: any) => {
    setExercises(exercises.map(ex => ex.id === exerciseId ? { ...ex, sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: value } : s) } : ex));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(ex => ex.id === exerciseId ? { ...ex, sets: ex.sets.filter(s => s.id !== setId) } : ex));
  };

  const removeExercise = (id: string) => setExercises(exercises.filter(ex => ex.id !== id));

  const handleSave = () => {
    if (!name || exercises.length === 0) return;
    onSave({
      id: Date.now().toString(), name, date: new Date(date).toISOString(),
      durationMinutes: Number(duration) || 0, exercises, notes,
      ...(selectedTemplateId && { template_id: selectedTemplateId }),
      ...(saveAsTemplate && { save_as_template: true })
    } as any);
    setExercises([]); setName(''); setSelectedTemplateId(null); setSaveAsTemplate(false);
  };

  return (
    <div className="pb-24 space-y-6 page-enter max-w-2xl mx-auto">

      {/* Rest Timer Overlay */}
      {timerActive && (
        <div className="fixed bottom-24 right-6 z-50 page-enter">
          <div className="bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-4">
            <div>
              <span className="text-[10px] uppercase font-semibold opacity-50 block">Resting</span>
              <span className="text-2xl font-extrabold tabular-nums">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
            </div>
            <button onClick={() => setTimerActive(false)} className="w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-800 dark:bg-zinc-200 text-zinc-400 dark:text-zinc-600 hover:text-white dark:hover:text-zinc-900 transition-colors">
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Dumbbell size={20} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Workout Session</h2>
              <p className="text-xs text-zinc-400 font-medium">Log your lifts</p>
            </div>
          </div>
          <button onClick={() => setShowTemplateModal(true)}
            className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-xl text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors" title="Templates">
            <List size={18} />
          </button>
        </div>

        <div className="space-y-4">
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Workout name..."
            className="w-full text-lg font-bold bg-transparent border-b-2 border-zinc-100 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-white outline-none py-2 transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-700" />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 ml-1">Session Date</label>
              <CustomDatePicker value={date} onChange={(val) => setDate(val)} />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 ml-1">Rest Timer</label>
              <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-800 p-2 px-3 rounded-xl border border-zinc-200 dark:border-zinc-700">
                <Timer size={14} className="text-zinc-400" />
                <input type="number" value={timerInput} onChange={(e) => setTimerInput(Number(e.target.value))} className="w-12 bg-transparent text-sm font-semibold text-center outline-none" />
                <span className="text-xs text-zinc-400">sec</span>
                <button onClick={handleStartTimer} disabled={timerActive}
                  className="ml-auto w-8 h-8 flex items-center justify-center bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg disabled:opacity-30 hover:opacity-80 transition-opacity">
                  <Play size={10} fill="currentColor" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Exercises */}
      <div className="space-y-4">
        {exercises.map((exercise, exIndex) => {
          const perf = recentPerformances[exercise.name.toLowerCase()];
          const isGroupSelectOpen = activeSelect === exercise.id;

          return (
            <div key={exercise.id} className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
              <div className="p-5 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xs font-bold text-zinc-300 dark:text-zinc-600">{String(exIndex + 1).padStart(2, '0')}</span>
                    <div className="relative">
                      <button onClick={() => setActiveSelect(isGroupSelectOpen ? null : exercise.id)}
                        className="text-[11px] font-semibold text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800">
                        {exercise.muscleGroup}
                      </button>
                      {isGroupSelectOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveSelect(null)} />
                          <div className="absolute top-full left-0 mt-1 z-50 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl p-1.5 w-36 animate-in zoom-in-95 fade-in duration-150">
                            {MUSCLE_GROUPS.map(mg => (
                              <button key={mg} onClick={() => updateExercise(exercise.id, 'muscleGroup', mg)}
                                className="w-full text-left p-2 rounded-lg text-xs font-medium hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                {mg}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <input type="text" value={exercise.name} onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                    placeholder="Exercise name..." className="w-full bg-transparent text-base font-bold outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700" />
                  {perf && perf.lastWeight > 0 && (
                    <div className="mt-1.5 text-[11px] text-zinc-400 font-medium">
                      Last: {perf.lastWeight}kg × {perf.lastReps}
                    </div>
                  )}
                </div>
                <button onClick={() => removeExercise(exercise.id)}
                  className="w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 text-zinc-400 hover:text-red-500 transition-colors" title="Remove">
                  <Trash2 size={16} />
                </button>
              </div>

              <div className="p-5 space-y-2">
                {exercise.sets.map((set, sIndex) => (
                  <div key={set.id} className="grid grid-cols-12 gap-3 items-center">
                    <div className="col-span-1 text-xs font-bold text-zinc-300 dark:text-zinc-600">{sIndex + 1}</div>
                    <div className="col-span-4">
                      <input type="number" value={set.weight || ''} onChange={(e) => updateSet(exercise.id, set.id, 'weight', Number(e.target.value))}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-center text-sm font-semibold outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors" placeholder="kg" />
                    </div>
                    <div className="col-span-4">
                      <input type="number" value={set.reps || ''} onChange={(e) => updateSet(exercise.id, set.id, 'reps', Number(e.target.value))}
                        className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg p-2.5 text-center text-sm font-semibold outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors" placeholder="reps" />
                    </div>
                    <div className="col-span-3 flex justify-end gap-1.5">
                      <button onClick={() => removeSet(exercise.id, set.id)}
                        className="w-9 h-9 rounded-lg flex items-center justify-center bg-zinc-50 dark:bg-zinc-800 text-zinc-300 hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                      <button onClick={() => updateSet(exercise.id, set.id, 'completed', !set.completed)}
                        className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all duration-200 ${set.completed ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900' : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-200 dark:text-zinc-700 hover:text-zinc-400'}`}>
                        <CheckCircle size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                <button onClick={() => addSet(exercise.id)}
                  className="w-full py-3 mt-2 border border-dashed border-zinc-200 dark:border-zinc-700 rounded-xl text-xs font-semibold text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-500 transition-all">
                  + Add Set
                </button>
              </div>
            </div>
          );
        })}

        <button onClick={addExercise}
          className="w-full py-8 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl flex flex-col items-center gap-2 text-zinc-300 hover:text-zinc-900 dark:hover:text-white hover:border-zinc-400 dark:hover:border-zinc-600 transition-all group">
          <Plus size={20} className="group-hover:rotate-90 transition-transform" />
          <span className="text-xs font-semibold">New Exercise</span>
        </button>
      </div>

      {/* Footer */}
      <div className="space-y-3">
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Session notes..."
          className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm font-medium min-h-[100px] outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors" />
        <div className="flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-700">
          <input type="checkbox" id="saveAsTemplate" checked={saveAsTemplate} onChange={(e) => setSaveAsTemplate(e.target.checked)}
            className="w-4 h-4 rounded border-zinc-300 text-zinc-900 focus:ring-zinc-900" />
          <label htmlFor="saveAsTemplate" className="text-sm font-medium text-zinc-500 cursor-pointer">Save as template</label>
        </div>
        <Button onClick={handleSave} size="lg" className="w-full">
          <Save size={18} /> Complete Workout
        </Button>
      </div>

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowTemplateModal(false)} />
          <div className="relative bg-white dark:bg-zinc-900 w-full max-w-sm rounded-2xl border border-zinc-200 dark:border-zinc-700 p-6 shadow-2xl page-enter">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold">Templates</h3>
              <button onClick={() => setShowTemplateModal(false)} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 transition-colors"><X size={18} /></button>
            </div>
            <div className="space-y-2 max-h-[50vh] overflow-y-auto">
              {isLoadingTemplates ? (
                <div className="py-8 flex flex-col items-center gap-3 text-zinc-400">
                  <Loader2 className="animate-spin" size={20} />
                  <span className="text-xs font-medium">Loading...</span>
                </div>
              ) : templateError ? (
                <div className="py-8 text-center space-y-3">
                  <p className="text-sm text-red-500">{templateError}</p>
                  <button onClick={loadTemplates} className="text-xs font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white transition-colors">Try Again</button>
                </div>
              ) : templates.length === 0 ? (
                <div className="py-8 text-center">
                  <p className="text-sm text-zinc-400">No templates found</p>
                </div>
              ) : (
                templates.map(t => (
                  <button key={t.id} onClick={() => applyTemplate(t)}
                    className="w-full p-4 bg-zinc-50 dark:bg-zinc-800 rounded-xl text-left border border-zinc-100 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-white transition-all">
                    <span className="text-sm font-semibold block">{t.name}</span>
                    <span className="text-xs text-zinc-400 mt-0.5">{(t.exercises || []).length} exercises</span>
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