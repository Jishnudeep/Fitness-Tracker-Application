import React, { useState, useEffect, useRef } from 'react';
import { Workout, Exercise, Set, MuscleGroup, WorkoutTemplate, ExercisePerformance } from '../types';
import { Plus, Trash2, Save, Dumbbell, Calendar, Clock, Timer, CheckCircle, ChevronDown, List, Star, Play, X, Loader2 } from 'lucide-react';
import { Button } from './ui/Button';
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

  // UI states
  const [templates, setTemplates] = useState<WorkoutTemplate[]>([]);
  const [isLoadingTemplates, setIsLoadingTemplates] = useState(false);
  const [templateError, setTemplateError] = useState<string | null>(null);
  const [recentPerformances, setRecentPerformances] = useState<Record<string, ExercisePerformance>>({});
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [activeSelect, setActiveSelect] = useState<string | null>(null);

  // Manual Rest Timer State
  const [timerActive, setTimerActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(90);
  const [timerInput, setTimerInput] = useState(90);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const loadTemplates = async () => {
    setIsLoadingTemplates(true);
    setTemplateError(null);
    try {
      const data = await api.getTemplates();
      // Filter out templates that are purely cardio
      const liftingTemplates = data.filter(t => !t.exercises.every(te => te.muscleGroup === MuscleGroup.CARDIO));
      setTemplates(liftingTemplates);
    } catch (err) {
      setTemplateError("Failed to load templates");
      console.error(err);
    } finally {
      setIsLoadingTemplates(false);
    }
  };

  useEffect(() => {
    loadTemplates();
  }, []);

  // Refresh templates when modal opens
  useEffect(() => {
    if (showTemplateModal) {
      loadTemplates();
    }
  }, [showTemplateModal]);

  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      if (end > start) {
        setDuration(Math.round((end.getTime() - start.getTime()) / 60000));
      }
    }
  }, [startTime, endTime]);

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

  // Timer Logic
  useEffect(() => {
    if (timerActive && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
    } else if (timeLeft <= 0) {
      setTimerActive(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [timerActive, timeLeft]);

  const handleStartTimer = () => {
    setTimeLeft(timerInput);
    setTimerActive(true);
  };

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
          reps: te.defaultReps,
          weight: te.defaultWeight,
          speed: te.defaultSpeed,
          incline: te.defaultIncline,
          timeSeconds: te.defaultTimeSeconds,
          caloriesBurnt: te.defaultCaloriesBurnt || 60,
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
      muscleGroup: MuscleGroup.CHEST,
      sets: [{
        id: Date.now().toString() + '-1',
        reps: 0,
        weight: 0,
        speed: 0,
        incline: 0,
        timeSeconds: 0,
        caloriesBurnt: 60,
        completed: false
      }]
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
        return {
          ...ex,
          sets: [...ex.sets, {
            id: Date.now().toString(),
            reps: lastSet ? lastSet.reps : 0,
            weight: lastSet ? lastSet.weight : 0,
            speed: lastSet ? lastSet.speed : 0,
            incline: lastSet ? lastSet.incline : 0,
            timeSeconds: lastSet ? lastSet.timeSeconds : 0,
            caloriesBurnt: lastSet ? lastSet.caloriesBurnt : 60,
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
      notes,
      ...(selectedTemplateId && { template_id: selectedTemplateId }),
      ...(saveAsTemplate && { save_as_template: true })
    } as any);
    setExercises([]);
    setName('');
    setSelectedTemplateId(null);
    setSaveAsTemplate(false);
  };

  return (
    <div className="pb-24 space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">

      {/* Manual Rest Timer Overlay */}
      {timerActive && (
        <div className="fixed bottom-24 right-6 z-50 animate-in zoom-in slide-in-from-bottom-4 duration-300">
          <div className="bg-zinc-900 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-6 border border-zinc-800">
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-black tracking-widest opacity-40">Resting</span>
              <span className="text-3xl font-black tabular-nums">{Math.floor(timeLeft / 60)}:{String(timeLeft % 60).padStart(2, '0')}</span>
            </div>
            <button onClick={() => setTimerActive(false)} className="bg-zinc-800 p-2 rounded-xl hover:bg-zinc-700 transition-colors">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      {/* Header - Minimalist */}
      <div className="bg-white dark:bg-black p-8 rounded-[2rem] border border-zinc-200 dark:border-zinc-800 shadow-sm">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">Workout Session</h2>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Step by step...</p>
          </div>
          <button
            onClick={() => setShowTemplateModal(true)}
            className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
          >
            <List size={20} />
          </button>
        </div>

        <div className="space-y-6">
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Routine name..."
            className="w-full text-2xl font-black bg-transparent border-b-2 border-zinc-100 dark:border-zinc-900 focus:border-zinc-900 dark:focus:border-white outline-none py-2 transition-all placeholder:opacity-20"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="w-full pl-12 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-xs font-bold outline-none" />
            </div>
            <div className="flex items-center gap-2 bg-zinc-50 dark:bg-zinc-900 p-2 px-4 rounded-2xl border border-zinc-100 dark:border-zinc-800">
              <Timer size={16} className="text-zinc-400" />
              <input type="number" value={timerInput} onChange={(e) => setTimerInput(Number(e.target.value))} className="w-12 bg-transparent text-xs font-black text-center outline-none" />
              <span className="text-[10px] font-black uppercase text-zinc-400">Sec Rest</span>
              <button onClick={handleStartTimer} disabled={timerActive} className="ml-auto bg-zinc-900 dark:bg-white text-white dark:text-black p-2 rounded-xl disabled:opacity-30">
                <Play size={12} fill="currentColor" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="space-y-6">
        {exercises.map((exercise, exIndex) => {
          const perf = recentPerformances[exercise.name.toLowerCase()];
          const isGroupSelectOpen = activeSelect === exercise.id;

          return (
            <div key={exercise.id} className="bg-white dark:bg-zinc-950 rounded-[2rem] border border-zinc-100 dark:border-zinc-900 overflow-hidden shadow-sm">
              <div className="p-6 border-b border-zinc-50 dark:border-zinc-900 flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">{String(exIndex + 1).padStart(2, '0')}</span>
                    <div className="relative">
                      <button
                        onClick={() => setActiveSelect(isGroupSelectOpen ? null : exercise.id)}
                        className="text-[9px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
                      >
                        {exercise.muscleGroup}
                      </button>
                      {isGroupSelectOpen && (
                        <>
                          <div className="fixed inset-0 z-40" onClick={() => setActiveSelect(null)}></div>
                          <div className="absolute top-full left-0 mt-2 z-50 bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl shadow-2xl p-2 w-40 animate-in zoom-in-95 duration-200">
                            {MUSCLE_GROUPS.map(mg => (
                              <button key={mg} onClick={() => updateExercise(exercise.id, 'muscleGroup', mg)} className="w-full text-left p-3 rounded-xl text-[10px] font-black uppercase tracking-wider hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors">
                                {mg}
                              </button>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  <input
                    type="text"
                    value={exercise.name}
                    onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                    placeholder="Exercise name..."
                    className="w-full bg-transparent text-xl font-black outline-none placeholder:opacity-10"
                  />
                  {perf && perf.lastWeight > 0 && (
                    <div className="mt-2 text-[9px] font-black text-zinc-300 dark:text-zinc-600 uppercase tracking-widest">
                      Last: {perf.lastWeight}kg x {perf.lastReps}
                    </div>
                  )}
                </div>
                <button onClick={() => removeExercise(exercise.id)} className="p-2 text-zinc-100 dark:text-zinc-900 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>

              <div className="p-6 space-y-2">
                {exercise.sets.map((set, sIndex) => {
                  return (
                    <div key={set.id} className="grid grid-cols-12 gap-4 items-center">
                      <div className="col-span-1 text-[10px] font-black text-zinc-300">{sIndex + 1}</div>

                      <div className="col-span-4">
                        <input type="number" value={set.weight || ''} onChange={(e) => updateSet(exercise.id, set.id, 'weight', Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl p-2.5 text-center text-xs font-black" placeholder="kg" />
                      </div>
                      <div className="col-span-4">
                        <input type="number" value={set.reps || ''} onChange={(e) => updateSet(exercise.id, set.id, 'reps', Number(e.target.value))} className="w-full bg-zinc-50 dark:bg-zinc-900 border-none rounded-xl p-2.5 text-center text-xs font-black" placeholder="reps" />
                      </div>

                      <div className="col-span-3 flex justify-end">
                        <button
                          onClick={() => updateSet(exercise.id, set.id, 'completed', !set.completed)}
                          className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${set.completed ? 'bg-zinc-900 dark:bg-white text-white dark:text-black scale-105' : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-200 dark:text-zinc-700'}`}
                        >
                          <CheckCircle size={18} />
                        </button>
                      </div>
                    </div>
                  );
                })}

                <button
                  onClick={() => addSet(exercise.id)}
                  className="w-full py-4 mt-4 border border-zinc-50 dark:border-zinc-900 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all"
                >
                  Add Set
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
          <span className="text-[10px] font-black uppercase tracking-[0.3em]">New Exercise</span>
        </button>
      </div>

      {/* Footer Actions */}
      <div className="space-y-4">
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Session notes..."
          className="w-full p-6 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-[2rem] text-xs font-medium min-h-[120px] outline-none placeholder:opacity-30"
        />
        <div className="flex items-center gap-3 px-6 py-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
          <input
            type="checkbox"
            id="saveAsTemplate"
            checked={saveAsTemplate}
            onChange={(e) => setSaveAsTemplate(e.target.checked)}
            className="w-5 h-5 rounded-lg border-zinc-300 text-zinc-900 focus:ring-zinc-900"
          />
          <label htmlFor="saveAsTemplate" className="text-xs font-black uppercase tracking-widest text-zinc-500 cursor-pointer">
            Save as new template
          </label>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="secondary" onClick={handleSave} className="py-5 rounded-2xl font-black text-sm uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 dark:text-white border-0">
            Finish
          </Button>
          <Button onClick={handleSave} className="py-5 rounded-2xl font-black text-sm uppercase tracking-widest bg-zinc-900 dark:bg-white text-white dark:text-black border-0">
            Complete
          </Button>
        </div>
      </div>

      {/* Modal - Minimalist */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-in fade-in duration-300">
          <div className="absolute inset-0 bg-zinc-900/60 backdrop-blur-md" onClick={() => setShowTemplateModal(false)}></div>
          <div className="relative bg-white dark:bg-zinc-950 w-full max-w-sm rounded-[2.5rem] border border-zinc-200 dark:border-zinc-800 p-8 shadow-2xl">
            <h3 className="text-2xl font-black mb-6 tracking-tighter">Templates</h3>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-2">
              {isLoadingTemplates ? (
                <div className="py-10 flex flex-col items-center justify-center gap-4 text-zinc-400">
                  <Loader2 className="animate-spin" size={24} />
                  <span className="text-[10px] font-black uppercase tracking-widest">Loading...</span>
                </div>
              ) : templateError ? (
                <div className="py-10 text-center space-y-4">
                  <p className="text-xs font-bold text-red-500">{templateError}</p>
                  <button onClick={loadTemplates} className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors underline">Try Again</button>
                </div>
              ) : templates.length === 0 ? (
                <div className="py-10 text-center space-y-4">
                  <p className="text-xs font-bold text-zinc-500">No templates found</p>
                  <button onClick={loadTemplates} className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 hover:text-white transition-colors underline">Refresh</button>
                </div>
              ) : (
                templates.map(t => (
                  <button key={t.id} onClick={() => applyTemplate(t)} className="w-full p-5 bg-zinc-50 dark:bg-zinc-900 rounded-3xl text-left border border-zinc-100 dark:border-zinc-800 hover:border-zinc-900 dark:hover:border-white transition-all">
                    <span className="text-sm font-black uppercase block">{t.name}</span>
                    <span className="text-[10px] font-bold text-zinc-400 mt-1 uppercase opacity-60">{(t.exercises || []).length} Exercises</span>
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