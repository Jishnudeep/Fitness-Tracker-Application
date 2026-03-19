import React, { useState, useMemo } from 'react';
import { Workout, Meal, MuscleGroup } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Flame, Dumbbell, Clock, ChevronDown, ChevronLeft, ChevronRight, Target, Footprints } from 'lucide-react';
import { DailyView } from './DailyView';
import { Button } from './ui/Button';
import { CustomDatePicker } from './ui/CustomDatePicker';
import { api } from '../services/api';

interface DashboardProps {
  workouts: Workout[];
  meals: Meal[];
}

type TimeRange = 'week' | 'month' | 'all';

// Progress Ring SVG component
const ProgressRing: React.FC<{ value: number; max: number; size?: number; strokeWidth?: number; color?: string; label: string; unit?: string }> = ({
  value, max, size = 120, strokeWidth = 8, color = '#18181b', label, unit = ''
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = max > 0 ? Math.min(value / max, 1) : 0;
  const offset = circumference - progress * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="block">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth={strokeWidth}
            className="text-zinc-100 dark:text-zinc-800" />
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={color} strokeWidth={strokeWidth}
            strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset}
            className="progress-ring-circle" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold text-zinc-900 dark:text-white">{value.toLocaleString()}</span>
          {unit && <span className="text-[10px] font-medium text-zinc-400">{unit}</span>}
        </div>
      </div>
      <span className="text-xs font-medium text-zinc-500">{label}</span>
    </div>
  );
};

export const Dashboard: React.FC<DashboardProps> = ({ workouts, meals }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'daily'>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('week');

  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  const [selectedDay, setSelectedDay] = useState(todayStr);

  const [review, setReview] = useState<{ activity?: string, diet?: string } | null>(null);
  const [reviewing, setReviewing] = useState(false);

  const handleReviewDay = async (date: string) => {
    setReviewing(true);
    setReview(null);
    try {
      const data = await api.reviewDay(date);
      setReview(data);
    } catch (e) {
      console.error(e);
    } finally {
      setReviewing(false);
    }
  };

  const goToToday = () => {
    setSelectedDay(todayStr);
    setActiveTab('daily');
  };

  // Filtered data
  const { filteredWorkouts, filteredMeals, dateLabels } = useMemo(() => {
    let startDate = new Date();
    let endDate = new Date();

    if (timeRange === 'week') {
      startDate.setDate(startDate.getDate() - 3);
      startDate.setHours(0, 0, 0, 0);
      endDate.setDate(endDate.getDate() + 3);
      endDate.setHours(23, 59, 59, 999);
    } else if (timeRange === 'month') {
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
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
  }, [workouts, meals, timeRange]);

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
      if (ex.muscleGroup !== MuscleGroup.CARDIO) return exAcc;
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
        calories, volume, duration, cardioMinutes, cardioBurned, steps,
        isToday: date === todayStr
      };
    });
  }, [filteredMeals, filteredWorkouts, dateLabels, todayStr]);

  // Chart config with semantic colors
  const charts = [
    { id: 'vol', title: 'Strength Volume', key: 'volume', color: '#6366f1', type: 'area' },
    { id: 'cal', title: 'Caloric Intake', key: 'calories', color: '#f59e0b', type: 'bar' },
    { id: 'steps', title: 'Steps Tracked', key: 'steps', color: '#14b8a6', type: 'bar' },
    { id: 'cardio_min', title: 'Cardio Minutes', key: 'cardioMinutes', color: '#ec4899', type: 'bar' },
    { id: 'cardio_cal', title: 'Calories Burned', key: 'cardioBurned', color: '#ef4444', type: 'area' },
    { id: 'duration', title: 'Minutes Lifted', key: 'duration', color: '#8b5cf6', type: 'bar' }
  ];

  return (
    <div className="space-y-8 pb-24 max-w-5xl mx-auto">

      {/* ─── Today's Focus ─── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400">Today's Focus</h3>
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight mt-1">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
            </p>
          </div>
          <button onClick={goToToday} className="w-10 h-10 flex items-center justify-center bg-zinc-100 dark:bg-zinc-800 rounded-xl hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors text-zinc-600 dark:text-zinc-300" title="Go to Today">
            <Target size={20} />
          </button>
        </div>

        {/* Progress rings + stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6 md:gap-4 justify-items-center">
          <ProgressRing value={todayStats.calories} max={2500} color="#f59e0b" label="Kcal In" unit="kcal" />
          <ProgressRing value={Math.round(todayStats.cardioBurned)} max={800} color="#ef4444" label="Kcal Burned" unit="kcal" />
          <ProgressRing value={todayStats.steps} max={10000} color="#14b8a6" label="Steps" />
          <ProgressRing value={Math.round(todayStats.cardioMinutes)} max={60} color="#ec4899" label="Cardio" unit="min" />
          <ProgressRing value={todayStats.duration} max={120} color="#8b5cf6" label="Gym Time" unit="min" />
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div className="flex justify-center">
        <div className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl flex">
          <button onClick={() => setActiveTab('overview')} className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'overview' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
            Insights
          </button>
          <button onClick={() => setActiveTab('daily')} className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${activeTab === 'daily' ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
            Timeline
          </button>
        </div>
      </div>

      {activeTab === 'overview' ? (
        <div className="space-y-8">
          {/* Time range selector */}
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-semibold text-zinc-500">Activity Trends</h4>
            <div className="flex bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
              {([['week', '7D'], ['month', '30D'], ['all', 'All']] as [TimeRange, string][]).map(([val, label]) => (
                <button key={val} onClick={() => setTimeRange(val)}
                  className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${timeRange === val ? 'bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-sm' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Charts grid with semantic colors */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {charts.map(chart => (
              <div key={chart.id} className="bg-white dark:bg-zinc-900 p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: chart.color }} />
                  <h5 className="text-xs font-semibold text-zinc-500">{chart.title}</h5>
                </div>
                <div className="h-40 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    {chart.type === 'bar' ? (
                      <BarChart data={chartData}>
                        <XAxis dataKey="shortDate" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                        <Tooltip
                          cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', background: '#fff', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                          itemStyle={{ color: chart.color }}
                        />
                        <Bar dataKey={chart.key} fill={chart.color} radius={[4, 4, 0, 0]} opacity={0.85} />
                      </BarChart>
                    ) : (
                      <AreaChart data={chartData}>
                        <defs>
                          <linearGradient id={`grad-${chart.id}`} x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor={chart.color} stopOpacity={0.2} />
                            <stop offset="95%" stopColor={chart.color} stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="shortDate" tick={{ fontSize: 10, fill: '#a1a1aa' }} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', background: '#fff', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                          itemStyle={{ color: chart.color }}
                        />
                        <Area type="monotone" dataKey={chart.key} stroke={chart.color} fill={`url(#grad-${chart.id})`} strokeWidth={2.5} />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-6 md:p-8 border-b border-zinc-100 dark:border-zinc-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <h3 className="text-xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Timeline</h3>
                <p className="text-xs font-medium text-zinc-400 mt-0.5">Daily breakdown</p>
              </div>
              <div className="flex items-center gap-3">
                <Button
                  onClick={() => handleReviewDay(selectedDay)}
                  disabled={reviewing}
                  loading={reviewing}
                  size="sm"
                >
                  <Activity size={14} />
                  {reviewing ? "Analyzing..." : "Review Day"}
                </Button>
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl">
                  <button onClick={() => { const d = new Date(selectedDay); d.setDate(d.getDate() - 1); setSelectedDay(d.toISOString().split('T')[0]); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <div className="w-44">
                    <CustomDatePicker value={selectedDay} onChange={(val) => setSelectedDay(val)} />
                  </div>
                  <button onClick={() => { const d = new Date(selectedDay); d.setDate(d.getDate() + 1); setSelectedDay(d.toISOString().split('T')[0]); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 transition-colors">
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>

            {review && (
              <div className="px-6 md:px-8 pt-6 page-enter">
                <div className="bg-zinc-50 dark:bg-zinc-800 p-5 rounded-xl border border-zinc-200 dark:border-zinc-700">
                  <div className="flex justify-between items-start mb-3">
                    <h4 className="font-semibold flex items-center gap-2 text-sm"><Activity size={14} /> AI Coach Review</h4>
                    <button onClick={() => setReview(null)} className="text-xs font-medium text-zinc-400 hover:text-red-500 transition-colors">Dismiss</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {review.activity && (
                      <div>
                        <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">Activity</p>
                        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{review.activity}</p>
                      </div>
                    )}
                    {review.diet && (
                      <div>
                        <p className="text-xs font-semibold text-zinc-500 uppercase mb-1">Nutrition</p>
                        <p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{review.diet}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 md:p-8">
              <DailyView date={selectedDay} workouts={workouts} meals={meals} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};