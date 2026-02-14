import React, { useState, useMemo } from 'react';
import { Workout, Meal, MuscleGroup } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Activity, Flame, Dumbbell, Calendar, Weight, Clock, ChevronDown, ChevronLeft, ChevronRight, Target, Footprints } from 'lucide-react';
import { DailyView } from './DailyView';
import { Button } from './ui/Button';

interface DashboardProps {
  workouts: Workout[];
  meals: Meal[];
}

type TimeRange = 'week' | 'month' | 'all' | 'custom';

export const Dashboard: React.FC<DashboardProps> = ({ workouts, meals }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'daily'>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 3);
    return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().split('T')[0];
  });
  const [selectedDay, setSelectedDay] = useState(todayStr);

  const goToToday = () => {
    setSelectedDay(todayStr);
    setActiveTab('daily');
  };

  // Centered Date Logic for "Week"
  const { filteredWorkouts, filteredMeals, dateLabels } = useMemo(() => {
    let startDate = new Date();
    let endDate = new Date();

    if (timeRange === 'week') {
      // Center on Today: 3 days before, 3 days after
      startDate.setDate(startDate.getDate() - 3);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(endDate.getDate() + 3);
      endDate.setHours(23, 59, 59, 999);
    } else if (timeRange === 'month') {
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
      endDate.setHours(23, 59, 59, 999);
    } else if (timeRange === 'custom') {
      startDate = new Date(customStart);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
    } else {
      startDate = new Date(0);
      endDate.setHours(23, 59, 59, 999);
    }

    const fWorkouts = workouts.filter(w => {
      const d = new Date(w.date);
      return d >= startDate && d <= endDate;
    });

    const fMeals = meals.filter(m => {
      const d = new Date(m.date);
      return d >= startDate && d <= endDate;
    });

    let labels: string[] = [];
    const current = new Date(startDate);
    while (current <= endDate) {
      labels.push(current.toISOString().split('T')[0]);
      current.setDate(current.getDate() + 1);
    }

    return { filteredWorkouts: fWorkouts, filteredMeals: fMeals, dateLabels: labels };
  }, [workouts, meals, timeRange, customStart, customEnd]);

  const todayStats = useMemo(() => {
    const todayWorkouts = workouts.filter(w => w.date.startsWith(todayStr));
    const todayMeals = meals.filter(m => m.date.startsWith(todayStr));
    const calories = todayMeals.reduce((sum, m) => sum + m.calories, 0);
    const protein = todayMeals.reduce((sum, m) => sum + (m.protein || 0), 0);
    const duration = todayWorkouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0);
    const cardioMinutes = todayWorkouts.reduce((sum, w) => sum + w.exercises.reduce((exAcc, ex) => {
      if (ex.muscleGroup !== MuscleGroup.CARDIO) return exAcc;
      return exAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.timeSeconds || 0), 0);
    }, 0), 0) / 60;
    const cardioBurned = todayWorkouts.reduce((sum, w) => sum + w.exercises.reduce((exAcc, ex) => {
      return exAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.caloriesBurnt || 0), 0);
    }, 0), 0);
    const steps = todayWorkouts.reduce((sum, w) => sum + w.exercises.reduce((exAcc, ex) => {
      return exAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.steps || 0), 0);
    }, 0), 0);
    return { calories, protein, duration, sessions: todayWorkouts.length, cardioMinutes, cardioBurned, steps };
  }, [workouts, meals, todayStr]);

  const chartData = useMemo(() => {
    return dateLabels.map(date => {
      const dailyMeals = filteredMeals.filter(m => m.date.startsWith(date));
      const calories = dailyMeals.reduce((sum, m) => sum + m.calories, 0);
      const dailyWorkouts = filteredWorkouts.filter(w => w.date.startsWith(date));
      const volume = dailyWorkouts.reduce((acc, w) => acc + w.exercises.reduce((exAcc, ex) => {
        if (ex.muscleGroup === MuscleGroup.CARDIO) return exAcc;
        return exAcc + ex.sets.reduce((sAcc, s) => sAcc + ((s.weight || 0) * (s.reps || 0)), 0);
      }, 0), 0);
      const duration = dailyWorkouts.reduce((acc, w) => acc + (w.durationMinutes || 0), 0);
      const cardioMinutes = dailyWorkouts.reduce((acc, w) => acc + w.exercises.reduce((exAcc, ex) => {
        if (ex.muscleGroup !== MuscleGroup.CARDIO) return exAcc;
        return exAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.timeSeconds || 0), 0);
      }, 0), 0) / 60;
      const cardioBurned = dailyWorkouts.reduce((acc, w) => acc + w.exercises.reduce((exAcc, ex) => {
        return exAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.caloriesBurnt || 0), 0);
      }, 0), 0);
      const steps = dailyWorkouts.reduce((acc, w) => acc + w.exercises.reduce((exAcc, ex) => {
        return exAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.steps || 0), 0);
      }, 0), 0);
      return {
        date,
        shortDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calories,
        volume,
        duration,
        cardioMinutes,
        cardioBurned,
        steps,
        isToday: date === todayStr
      };
    });
  }, [filteredMeals, filteredWorkouts, dateLabels, todayStr]);

  const stats = useMemo(() => {
    const totalVolume = filteredWorkouts.reduce((acc, w) => acc + w.exercises.reduce((exAcc, ex) => {
      if (ex.muscleGroup === MuscleGroup.CARDIO) return exAcc;
      return exAcc + ex.sets.reduce((sAcc, s) => sAcc + ((s.weight || 0) * (s.reps || 0)), 0);
    }, 0), 0);
    const totalDuration = filteredWorkouts.reduce((acc, w) => acc + (w.durationMinutes || 0), 0);
    const totalCardioBurned = filteredWorkouts.reduce((acc, w) => acc + w.exercises.reduce((exAcc, ex) => {
      return exAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.caloriesBurnt || 0), 0);
    }, 0), 0);
    const totalSteps = filteredWorkouts.reduce((acc, w) => acc + w.exercises.reduce((exAcc, ex) => {
      return exAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.steps || 0), 0);
    }, 0), 0);
    const activeDays = new Set([...filteredWorkouts.map(w => w.date.split('T')[0]), ...filteredMeals.map(m => m.date.split('T')[0])]).size;
    const totalCalories = filteredMeals.reduce((acc, m) => acc + m.calories, 0);
    return { totalWorkouts: filteredWorkouts.length, totalVolume, activeDays, totalDuration, totalCalories, totalCardioBurned, totalSteps };
  }, [filteredWorkouts, filteredMeals]);

  return (
    <div className="space-y-12 pb-24 animate-in fade-in duration-700 max-w-4xl mx-auto">

      {/* Centered Pulse - Monochrome Minimalist */}
      <div className="bg-white dark:bg-black rounded-[2.5rem] p-10 border border-zinc-100 dark:border-zinc-900 shadow-sm flex flex-col md:flex-row justify-between items-center gap-8">
        <div className="text-center md:text-left">
          <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 mb-2">Focus</h3>
          <p className="text-4xl font-black text-zinc-900 dark:text-white tracking-tighter">
            {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
          </p>
        </div>

        <div className="flex gap-10">
          {[
            { label: 'Kcal In', val: todayStats.calories, color: 'text-zinc-900 dark:text-white' },
            { label: 'Kcal Out (Gym)', val: Math.round(todayStats.cardioBurned), color: 'text-zinc-500' },
            { label: 'Steps', val: todayStats.steps.toLocaleString(), color: 'text-zinc-500', icon: Footprints },
            { label: 'Cardio Min', val: Math.round(todayStats.cardioMinutes), color: 'text-zinc-500' },
            { label: 'Duration', val: todayStats.duration, color: 'text-zinc-500' }
          ].map((s, i) => (
            <div key={i} className="text-center">
              <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1 flex items-center justify-center gap-1">
                {s.icon && <s.icon size={10} />}
                {s.label}
              </p>
              <p className={`text-2xl font-black ${s.color}`}>{s.val}</p>
            </div>
          ))}
        </div>

        <button onClick={goToToday} className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-2xl hover:scale-105 transition-transform">
          <Target size={24} className="text-zinc-900 dark:text-white" />
        </button>
      </div>

      {/* Tabs - Monochrome */}
      <div className="flex justify-center">
        <div className="bg-zinc-50 dark:bg-zinc-900 p-1.5 rounded-2xl flex border border-zinc-100 dark:border-zinc-800">
          <button onClick={() => setActiveTab('overview')} className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'overview' ? 'bg-white dark:bg-black shadow-lg text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>Insights</button>
          <button onClick={() => setActiveTab('daily')} className={`px-10 py-3 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all ${activeTab === 'daily' ? 'bg-white dark:bg-black shadow-lg text-zinc-900 dark:text-white' : 'text-zinc-400'}`}>Timeline</button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-12">
          {/* Trends Header */}
          <div className="flex justify-between items-center px-4">
            <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Activity Trends</h4>
            <div className="relative">
              <select value={timeRange} onChange={(e) => setTimeRange(e.target.value as TimeRange)} className="appearance-none bg-transparent text-[10px] font-black uppercase tracking-widest pr-8 py-2 outline-none">
                <option value="week">Past 7 Days</option>
                <option value="month">Last 30 Days</option>
                <option value="all">Lifetime</option>
              </select>
              <ChevronDown size={14} className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none opacity-40" />
            </div>
          </div>

          {/* Charts - Monochrome Minimalist */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {[
              { id: 'vol', title: 'Strength Volume (kg)', key: 'volume', color: '#111', type: 'area' },
              { id: 'cal', title: 'Caloric Intake', key: 'calories', color: '#111', type: 'bar' },
              { id: 'steps', title: 'Steps Tracked', key: 'steps', color: '#111', type: 'bar' },
              { id: 'cardio_min', title: 'Cardio (Min)', key: 'cardioMinutes', color: '#111', type: 'bar' },
              { id: 'cardio_cal', title: 'Kcal Burned (Cardio)', key: 'cardioBurned', color: '#111', type: 'area' }
            ].map(chart => (
              <div key={chart.id} className="bg-white dark:bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-50 dark:border-zinc-900">
                <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-8">{chart.title}</h5>
                <div className="h-48 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {chart.type === 'bar' ? (
                      <BarChart data={chartData}>
                        <XAxis dataKey="shortDate" hide />
                        <Tooltip cursor={{ fill: 'rgba(0,0,0,0.02)' }} contentStyle={{ borderRadius: '12px', border: 'none', background: '#000', color: '#fff', fontSize: '10px' }} />
                        <Bar dataKey={chart.key} fill="currentColor" className="text-zinc-900 dark:text-white" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) : (
                      <AreaChart data={chartData}>
                        <defs><linearGradient id="monochrome" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#111" stopOpacity={0.1} /><stop offset="95%" stopColor="#111" stopOpacity={0} /></linearGradient></defs>
                        <XAxis dataKey="shortDate" hide />
                        <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', background: '#000', color: '#fff', fontSize: '10px' }} />
                        <Area type="monotone" dataKey={chart.key} stroke="currentColor" fill="url(#monochrome)" strokeWidth={3} className="text-zinc-900 dark:text-white" />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>

          {/* Large Duration Chart */}
          <div className="bg-white dark:bg-zinc-950 p-8 rounded-[2.5rem] border border-zinc-50 dark:border-zinc-900">
            <h5 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-8">Minutes Lifted</h5>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="shortDate" axisLine={false} tickLine={false} tick={{ fontSize: 9, fontWeight: 900, fill: '#aaa' }} />
                  <Bar dataKey="duration" fill="currentColor" className="text-zinc-900 dark:text-white" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-8 animate-in slide-in-from-right-4 duration-500">
          <div className="bg-white dark:bg-black rounded-[2.5rem] border border-zinc-100 dark:border-zinc-900 overflow-hidden shadow-sm">
            <div className="p-10 border-b border-zinc-50 dark:border-zinc-900 flex justify-between items-center">
              <div>
                <h3 className="text-2xl font-black tracking-tighter">Timeline</h3>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mt-1">Daily Breakdown</p>
              </div>
              <div className="flex items-center gap-4 bg-zinc-50 dark:bg-zinc-900 px-4 py-2 rounded-2xl">
                <button onClick={() => { const d = new Date(selectedDay); d.setDate(d.getDate() - 1); setSelectedDay(d.toISOString().split('T')[0]); }}><ChevronLeft size={20} /></button>
                <input type="date" value={selectedDay} onChange={(e) => setSelectedDay(e.target.value)} className="bg-transparent border-none text-xs font-black outline-none w-28 text-center" />
                <button onClick={() => { const d = new Date(selectedDay); d.setDate(d.getDate() + 1); setSelectedDay(d.toISOString().split('T')[0]); }}><ChevronRight size={20} /></button>
              </div>
            </div>
            <div className="p-10">
              <DailyView date={selectedDay} workouts={workouts} meals={meals} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};