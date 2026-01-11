import React, { useState, useEffect } from 'react';
import { Workout, Exercise, Set, MuscleGroup } from '../types';
import { Plus, Trash2, Save, Dumbbell, Calendar, Clock } from 'lucide-react';
import { Button } from './ui/Button';

interface WorkoutLogProps {
  onSave: (workout: Workout) => void;
}

export const WorkoutLog: React.FC<WorkoutLogProps> = ({ onSave }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [duration, setDuration] = useState<number | ''>('');
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // Calculate duration automatically when start/end times change
  useEffect(() => {
    if (startTime && endTime) {
      const start = new Date(`2000-01-01T${startTime}`);
      const end = new Date(`2000-01-01T${endTime}`);
      
      if (end > start) {
        const diffMs = end.getTime() - start.getTime();
        const diffMins = Math.round(diffMs / 60000);
        setDuration(diffMins);
      }
    }
  }, [startTime, endTime]);

  const addExercise = () => {
    const newExercise: Exercise = {
      id: Date.now().toString(),
      name: '',
      muscleGroup: MuscleGroup.CHEST,
      sets: [
        { id: Date.now().toString() + '-1', reps: 0, weight: 0, completed: true }
      ]
    };
    setExercises([...exercises, newExercise]);
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
            reps: lastSet ? lastSet.reps : 0, 
            weight: lastSet ? lastSet.weight : 0, 
            completed: true 
          }]
        };
      }
      return ex;
    }));
  };

  const updateSet = (exerciseId: string, setId: string, field: keyof Set, value: any) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return {
          ...ex,
          sets: ex.sets.map(s => s.id === setId ? { ...s, [field]: Number(value) } : s)
        };
      }
      return ex;
    }));
  };

  const removeSet = (exerciseId: string, setId: string) => {
    setExercises(exercises.map(ex => {
      if (ex.id === exerciseId) {
        return { ...ex, sets: ex.sets.filter(s => s.id !== setId) };
      }
      return ex;
    }));
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter(ex => ex.id !== id));
  };

  const handleSave = () => {
    if (!name || exercises.length === 0) return;
    const workout: Workout = {
      id: Date.now().toString(),
      name,
      date: new Date(date).toISOString(),
      durationMinutes: Number(duration) || 0,
      exercises,
      notes
    };
    onSave(workout);
    // Reset
    setName('');
    setDate(new Date().toISOString().split('T')[0]);
    setStartTime('');
    setEndTime('');
    setDuration('');
    setNotes('');
    setExercises([]);
  };

  return (
    <div className="pb-20 space-y-6 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold mb-4 flex items-center text-zinc-900 dark:text-white">
          <Dumbbell className="mr-2 text-zinc-900 dark:text-white" size={20} />
          Log Workout
        </h2>
        
        <p className="text-zinc-500 text-sm mb-6">Track your exercises, sets, reps, and weights</p>

        <div className="space-y-4">
           {/* Date & Name */}
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input 
                    type="date" 
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full pl-10 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-500 outline-none text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">Workout Name</label>
                <input 
                  type="text" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Pull Day" 
                  className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-500 outline-none text-zinc-900 dark:text-zinc-100"
                />
              </div>
           </div>

           {/* Time & Duration */}
           <div className="grid grid-cols-3 gap-4">
             <div>
                <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">Start Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input 
                    type="time" 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full pl-10 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-500 outline-none text-zinc-900 dark:text-zinc-100"
                  />
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">End Time</label>
                <div className="relative">
                  <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                  <input 
                    type="time" 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full pl-10 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-500 outline-none text-zinc-900 dark:text-zinc-100"
                  />
                </div>
             </div>
             <div>
                <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">Duration (min)</label>
                <input 
                  type="number" 
                  value={duration}
                  onChange={(e) => setDuration(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="0"
                  className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-500 outline-none text-zinc-900 dark:text-zinc-100"
                />
             </div>
           </div>
        </div>
      </div>

      <div className="space-y-4">
        {exercises.map((exercise, index) => (
          <div key={exercise.id} className="bg-white dark:bg-zinc-900 p-4 rounded-xl shadow-sm border border-zinc-200 dark:border-zinc-800 relative">
             <button 
                onClick={() => removeExercise(exercise.id)}
                className="absolute top-4 right-4 text-zinc-400 hover:text-red-500 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            
            <div className="mb-4">
              <label className="text-xs uppercase font-bold text-zinc-500 mb-2 block">Add Exercise</label>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  {/* Muscle Group */}
                  <div>
                     <label className="block text-xs font-medium mb-1 text-zinc-500">Muscle Group</label>
                     <select 
                        value={exercise.muscleGroup}
                        onChange={(e) => updateExercise(exercise.id, 'muscleGroup', e.target.value)}
                        className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-500 outline-none text-zinc-900 dark:text-zinc-100 appearance-none"
                     >
                        {Object.values(MuscleGroup).map(mg => (
                          <option key={mg} value={mg}>{mg}</option>
                        ))}
                     </select>
                  </div>
                  
                  {/* Exercise Name */}
                   <div>
                     <label className="block text-xs font-medium mb-1 text-zinc-500">Exercise</label>
                     <input 
                      type="text" 
                      value={exercise.name}
                      onChange={(e) => updateExercise(exercise.id, 'name', e.target.value)}
                      placeholder="e.g. Bench Press" 
                      className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-500 outline-none text-zinc-900 dark:text-zinc-100"
                    />
                  </div>
              </div>
            </div>

            <div className="space-y-2 bg-zinc-50 dark:bg-zinc-950/50 p-3 rounded-lg border border-zinc-100 dark:border-zinc-800/50">
              <div className="grid grid-cols-10 gap-2 text-xs font-medium text-zinc-500 mb-1">
                <span className="col-span-2 text-center">Sets</span>
                <span className="col-span-3">Reps</span>
                <span className="col-span-3">Weight (kg)</span>
                <span className="col-span-2"></span>
              </div>
              {exercise.sets.map((set, sIndex) => (
                <div key={set.id} className="grid grid-cols-10 gap-2 items-center">
                  <div className="col-span-2 flex justify-center">
                    <div className="w-8 h-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-xs font-bold text-zinc-600 dark:text-zinc-300">
                      {sIndex + 1}
                    </div>
                  </div>
                  <div className="col-span-3">
                    <input 
                      type="number" 
                      value={set.reps || ''} 
                      onChange={(e) => updateSet(exercise.id, set.id, 'reps', e.target.value)}
                      className="w-full p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-1 focus:ring-zinc-500 outline-none text-zinc-900 dark:text-zinc-100"
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-3">
                    <input 
                      type="number" 
                      value={set.weight || ''} 
                      onChange={(e) => updateSet(exercise.id, set.id, 'weight', e.target.value)}
                      className="w-full p-2 rounded bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm focus:ring-1 focus:ring-zinc-500 outline-none text-zinc-900 dark:text-zinc-100"
                      placeholder="0"
                    />
                  </div>
                  <div className="col-span-2 flex justify-center">
                     <button 
                      onClick={() => removeSet(exercise.id, set.id)}
                      className="text-zinc-400 hover:text-red-500 transition-colors"
                     >
                       <Trash2 size={16} />
                     </button>
                  </div>
                </div>
              ))}
              <Button variant="ghost" size="sm" onClick={() => addSet(exercise.id)} className="w-full mt-2 text-xs border-dashed border border-zinc-300 dark:border-zinc-700 hover:border-zinc-400 dark:hover:border-zinc-600">
                <Plus size={14} className="mr-1" /> Add Set
              </Button>
            </div>
          </div>
        ))}

        <Button variant="secondary" onClick={addExercise} className="w-full py-4 border-dashed border-2">
          <Plus className="mr-2" /> Add Exercise
        </Button>
      </div>
      
      {/* Notes */}
      <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
        <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">Notes (Optional)</label>
        <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did you feel? Any observations?"
            className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-500 outline-none text-zinc-900 dark:text-zinc-100 min-h-[80px]"
        />
      </div>

      <div className="flex flex-col gap-3">
        <Button onClick={handleSave} className="w-full py-4 text-lg">
          <Save className="mr-2" /> Save Workout
        </Button>
      </div>
    </div>
  );
};