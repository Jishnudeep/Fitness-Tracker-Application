import React, { useState, useMemo, useEffect } from 'react';
import { Workout, Meal, MuscleGroup, Goal } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Activity, Flame, Dumbbell, Clock, ChevronLeft, ChevronRight, Target, Footprints, TrendingUp, TrendingDown, Minus, Zap, Award } from 'lucide-react';
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
  const [goal, setGoal] = useState<Goal | null>(null);

  useEffect(() => {
    api.getGoal().then(setGoal).catch(console.error);
  }, []);

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
    } catch (e) { console.error(e); } finally { setReviewing(false); }
  };

  const goToToday = () => { setSelectedDay(todayStr); setActiveTab('daily'); };

  // Filtered data for charts
  const { filteredWorkouts, filteredMeals, dateLabels } = useMemo(() => {
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    let startDate = new Date();

    if (timeRange === 'week') {
      startDate.setDate(startDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    } else if (timeRange === 'month') {
      startDate.setDate(startDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    } else {
      const allDates = [...workouts.map(w => new Date(w.date).getTime()), ...meals.map(m => new Date(m.date).getTime())].filter(d => !isNaN(d));
      if (allDates.length > 0) {
        startDate = new Date(Math.min(...allDates));
        startDate.setHours(0, 0, 0, 0);
        const ninetyDaysAgo = new Date();
        ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
        if (startDate < ninetyDaysAgo) startDate = ninetyDaysAgo;
      } else {
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
      }
    }

    const fWorkouts = workouts.filter(w => { const d = new Date(w.date); return d >= startDate && d <= endDate; });
    const fMeals = meals.filter(m => { const d = new Date(m.date); return d >= startDate && d <= endDate; });

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
    const duration = todayWorkouts.reduce((sum, w) => sum + (w.durationMinutes || 0), 0);
    const cardioMinutes = todayWorkouts.reduce((sum, w) => sum + w.exercises.reduce((exAcc, ex) => ex.muscleGroup !== MuscleGroup.CARDIO ? exAcc : exAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.timeSeconds || 0), 0), 0), 0) / 60;
    const cardioBurned = todayWorkouts.reduce((sum, w) => sum + w.exercises.reduce((exAcc, ex) => ex.muscleGroup !== MuscleGroup.CARDIO ? exAcc : exAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.caloriesBurnt || 0), 0), 0), 0);
    const steps = todayWorkouts.reduce((sum, w) => sum + w.exercises.reduce((exAcc, ex) => exAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.steps || 0), 0), 0), 0);
    return { calories, duration, sessions: todayWorkouts.length, cardioMinutes, cardioBurned, steps };
  }, [workouts, meals, todayStr]);

  // Streak Calculation
  const { streak, activeDays } = useMemo(() => {
    const active = new Set([...workouts.map(w => w.date.split('T')[0]), ...meals.map(m => m.date.split('T')[0])]);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    let currentStreak = 0;
    let d = new Date(today);
    
    if (active.has(d.toISOString().split('T')[0])) {
      currentStreak++;
      d.setDate(d.getDate() - 1);
    } else {
      d.setDate(d.getDate() - 1);
      if (active.has(d.toISOString().split('T')[0])) {
        currentStreak++;
        d.setDate(d.getDate() - 1);
      } else {
        return { streak: 0, activeDays: active };
      }
    }
    
    while (active.has(d.toISOString().split('T')[0])) {
      currentStreak++;
      d.setDate(d.getDate() - 1);
    }
    return { streak: currentStreak, activeDays: active };
  }, [workouts, meals]);

  // Week over Week calculation
  const { weekStats, lastWeekStats } = useMemo(() => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    
    const weekAgo = new Date(today);
    weekAgo.setDate(weekAgo.getDate() - 6);
    weekAgo.setHours(0, 0, 0, 0);

    const twoWeeksAgo = new Date(weekAgo);
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 7);
    const lastWeekEnd = new Date(weekAgo);
    lastWeekEnd.setMilliseconds(lastWeekEnd.getMilliseconds() - 1);

    const getStats = (start: Date, end: Date) => {
      const fW = workouts.filter(w => new Date(w.date) >= start && new Date(w.date) <= end);
      const fM = meals.filter(m => new Date(m.date) >= start && new Date(m.date) <= end);
      
      const calories = fM.reduce((sum, m) => sum + m.calories, 0) / 7; // avg parsing 7 days
      const volume = fW.reduce((sum, w) => sum + w.exercises.reduce((exAcc, ex) => ex.muscleGroup === MuscleGroup.CARDIO ? exAcc : exAcc + ex.sets.reduce((sAcc, s) => sAcc + ((s.weight || 0) * (s.reps || 0)), 0), 0), 0);
      return { calories, volume, sessions: fW.length };
    };

    return { weekStats: getStats(weekAgo, today), lastWeekStats: getStats(twoWeeksAgo, lastWeekEnd) };
  }, [workouts, meals]);

  const chartData = useMemo(() => {
    return dateLabels.map(date => {
      const dailyMeals = filteredMeals.filter(m => m.date.startsWith(date));
      const calories = dailyMeals.reduce((sum, m) => sum + m.calories, 0);
      const dailyWorkouts = filteredWorkouts.filter(w => w.date.startsWith(date));
      const volume = dailyWorkouts.reduce((acc, w) => acc + w.exercises.reduce((exAcc, ex) => ex.muscleGroup === MuscleGroup.CARDIO ? exAcc : exAcc + ex.sets.reduce((sAcc, s) => sAcc + ((s.weight || 0) * (s.reps || 0)), 0), 0), 0);
      const duration = dailyWorkouts.reduce((acc, w) => acc + (w.durationMinutes || 0), 0);
      const cardioMinutes = dailyWorkouts.reduce((acc, w) => acc + w.exercises.reduce((exAcc, ex) => ex.muscleGroup !== MuscleGroup.CARDIO ? exAcc : exAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.timeSeconds || 0), 0), 0), 0) / 60;
      const cardioBurned = dailyWorkouts.reduce((acc, w) => acc + w.exercises.reduce((exAcc, ex) => exAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.caloriesBurnt || 0), 0), 0), 0);
      const steps = dailyWorkouts.reduce((acc, w) => acc + w.exercises.reduce((exAcc, ex) => exAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.steps || 0), 0), 0), 0);
      
      // Calculate daily score representation
      let score = 0;
      let scoreColor = 'bg-zinc-200 dark:bg-zinc-800'; // No data
      const hasMeal = dailyMeals.length > 0;
      const hasWorkout = dailyWorkouts.length > 0;

      if (hasMeal || hasWorkout) {
          if (hasMeal && hasWorkout) { score = 100; scoreColor = 'bg-emerald-500'; }
          else if (hasWorkout) { score = 70; scoreColor = 'bg-teal-500'; }
          else if (hasMeal) { score = 50; scoreColor = 'bg-amber-500'; }
      }

      return {
        date, shortDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calories, volume, duration, cardioMinutes, cardioBurned, steps, score, scoreColor,
        isToday: date === todayStr
      };
    });
  }, [filteredMeals, filteredWorkouts, dateLabels, todayStr]);

  // Chart config with semantic colors
  const charts = [
    { id: 'vol', title: 'Strength Volume', key: 'volume', color: '#6366f1', type: 'area' },
    { id: 'steps', title: 'Steps Tracked', key: 'steps', color: '#14b8a6', type: 'bar' },
    { id: 'cardio_min', title: 'Cardio Minutes', key: 'cardioMinutes', color: '#ec4899', type: 'bar' },
    { id: 'cardio_cal', title: 'Calories Burned', key: 'cardioBurned', color: '#ef4444', type: 'area' }
  ];

  // Helper for trend icons
  const TrendIcon = ({ current, previous, inverse = false }: { current: number, previous: number, inverse?: boolean }) => {
    if (previous === 0 && current === 0) return <Minus size={14} className="text-zinc-400" />;
    const percent = previous === 0 ? 100 : Math.round(((current - previous) / previous) * 100);
    const isPositive = current > previous;
    const isGood = inverse ? !isPositive : isPositive;
    
    if (percent === 0) return <Minus size={14} className="text-zinc-400" />;
    if (isPositive) return <span className={`flex items-center text-xs font-bold ${isGood ? 'text-emerald-500' : 'text-red-500'}`}><TrendingUp size={14} className="mr-0.5" /> +{percent}%</span>;
    return <span className={`flex items-center text-xs font-bold ${isGood ? 'text-emerald-500' : 'text-red-500'}`}><TrendingDown size={14} className="mr-0.5" /> {percent}%</span>;
  };

  return (
    <div className="space-y-6 md:space-y-8 pb-24 max-w-5xl mx-auto page-enter">

      {/* ─── Hero Row: Progress Story ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Focus Card */}
        <div className="lg:col-span-2 bg-white dark:bg-zinc-900 rounded-2xl p-6 md:p-8 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between">
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

          <div className="flex flex-wrap gap-6 justify-center md:justify-start">
            <ProgressRing value={todayStats.calories} max={goal?.goal_weight ? 2500 : 2000} color="#f59e0b" label="Kcal In" unit="kcal" />
            <ProgressRing value={todayStats.duration} max={60} color="#8b5cf6" label="Gym Time" unit="min" />
            <ProgressRing value={Math.round(todayStats.cardioBurned)} max={500} color="#ef4444" label="Burned" unit="kcal" />
            <ProgressRing value={todayStats.steps} max={10000} color="#14b8a6" label="Steps" />
          </div>
        </div>

        {/* Story Cards */}
        <div className="space-y-6 flex flex-col justify-between">
          
          {/* Streak Card */}
          <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-6 text-white shadow-lg shadow-orange-500/20 relative overflow-hidden">
            <div className="absolute -right-4 -bottom-4 opacity-20">
              <Flame size={120} />
            </div>
            <div className="relative z-10">
              <h3 className="text-orange-100 font-semibold text-sm mb-1">Current Streak</h3>
              <div className="flex items-end gap-2">
                <span className="text-5xl font-black tabular-nums tracking-tighter">{streak}</span>
                <span className="mb-2 font-medium text-orange-100">days</span>
              </div>
              <p className="text-xs text-orange-50 font-medium mt-2">
                {streak === 0 ? "Log a workout or meal to start!" : "Keep the momentum going!"}
              </p>
            </div>
          </div>

          {/* Goal Progress Card */}
          {goal && (goal.current_weight || 0) > 0 && (goal.goal_weight || 0) > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-4 flex items-center gap-2">
                <Target size={14} className="text-indigo-500" /> Goal Progress
              </h3>
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold text-zinc-900 dark:text-white">
                  <span>{goal.current_weight} kg</span>
                  <span className="text-indigo-500">{goal.goal_weight} kg</span>
                </div>
                <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" 
                    style={{ width: `${Math.min(100, Math.max(5, 100 - (Math.abs(goal.current_weight! - goal.goal_weight!) / goal.current_weight!) * 100))}%` }} />
                </div>
                <p className="text-[10px] text-zinc-500 font-medium text-right">Getting closer!</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ─── Week vs Last Week Narrative ─── */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl p-6 border border-zinc-200 dark:border-zinc-800">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-5 flex items-center gap-2">
          <Award size={14} className="text-amber-500" /> This Week vs Last Week
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-zinc-100 dark:divide-zinc-800">
          
          <div className="pt-4 md:pt-0 md:px-6 first:pt-0 first:px-0 flex flex-col justify-center">
            <span className="text-xs font-medium text-zinc-500 mb-1">Avg Daily Calories</span>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-amber-500 to-orange-500 tabular-nums">
                {Math.round(weekStats.calories)}
              </span>
              <TrendIcon current={weekStats.calories} previous={lastWeekStats.calories} inverse={true} />
            </div>
          </div>

          <div className="pt-4 md:pt-0 md:px-6 flex flex-col justify-center">
            <span className="text-xs font-medium text-zinc-500 mb-1">Strength Volume</span>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500 tabular-nums">
                {(weekStats.volume / 1000).toFixed(1)}k
              </span>
              <TrendIcon current={weekStats.volume} previous={lastWeekStats.volume} />
            </div>
          </div>

          <div className="pt-4 md:pt-0 md:px-6 flex flex-col justify-center">
            <span className="text-xs font-medium text-zinc-500 mb-1">Sessions Logged</span>
            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-emerald-500 tabular-nums">
                {weekStats.sessions}
              </span>
              <TrendIcon current={weekStats.sessions} previous={lastWeekStats.sessions} />
            </div>
          </div>

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
        <div className="space-y-6">
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

          {/* Hero Chart */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              <h5 className="text-sm font-bold text-zinc-900 dark:text-white">Caloric Intake Overview</h5>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <XAxis dataKey="shortDate" tick={{ fontSize: 11, fill: '#a1a1aa' }} axisLine={false} tickLine={false} tickMargin={10} />
                  <Tooltip
                    cursor={{ fill: 'rgba(0,0,0,0.03)' }}
                    contentStyle={{ borderRadius: '12px', border: '1px solid #e4e4e7', background: '#fff', fontSize: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }}
                    itemStyle={{ color: '#f59e0b', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="calories" fill="#f59e0b" radius={[6, 6, 0, 0]} opacity={0.9} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Supporting Charts grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Button onClick={() => handleReviewDay(selectedDay)} disabled={reviewing} loading={reviewing} size="sm">
                  <Activity size={14} /> {reviewing ? "Analyzing..." : "Review Day"}
                </Button>
                <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl relative">
                  <button onClick={() => { const d = new Date(selectedDay); d.setDate(d.getDate() - 1); setSelectedDay(d.toISOString().split('T')[0]); }} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-400 transition-colors">
                    <ChevronLeft size={16} />
                  </button>
                  <div className="w-44 relative">
                    {/* Daily Score Dot Indicator */}
                    <div className="absolute top-1/2 left-2 -translate-y-1/2 flex gap-1 pointer-events-none z-10">
                      {chartData.find(d => d.date === selectedDay)?.scoreColor && (
                        <div className={`w-2 h-2 rounded-full ${chartData.find(d => d.date === selectedDay)?.scoreColor}`} />
                      )}
                    </div>
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
                    {review.activity && (<div><p className="text-xs font-semibold text-zinc-500 uppercase mb-1">Activity</p><p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{review.activity}</p></div>)}
                    {review.diet && (<div><p className="text-xs font-semibold text-zinc-500 uppercase mb-1">Nutrition</p><p className="text-sm leading-relaxed text-zinc-700 dark:text-zinc-300">{review.diet}</p></div>)}
                  </div>
                </div>
              </div>
            )}

            <div className="p-6 md:p-8">
              {/* Daily Score Summary inside Timeline */}
              {chartData.find(d => d.date === selectedDay) && (
                <div className={`mb-8 p-4 rounded-xl flex items-center gap-4 ${
                  chartData.find(d => d.date === selectedDay)!.score === 100 ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' :
                  chartData.find(d => d.date === selectedDay)!.score === 70 ? 'bg-teal-50 text-teal-900 border border-teal-200' :
                  chartData.find(d => d.date === selectedDay)!.score === 50 ? 'bg-amber-50 text-amber-900 border border-amber-200' :
                  'bg-zinc-50 text-zinc-500 border border-zinc-200 dark:bg-zinc-800 dark:border-zinc-700'
                }`}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white/50">
                    <Zap size={20} className={
                      chartData.find(d => d.date === selectedDay)!.score === 100 ? 'text-emerald-500' :
                      chartData.find(d => d.date === selectedDay)!.score === 70 ? 'text-teal-500' :
                      chartData.find(d => d.date === selectedDay)!.score === 50 ? 'text-amber-500' : 'text-zinc-400'
                    } />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm">
                      {chartData.find(d => d.date === selectedDay)!.score === 100 ? 'Perfect Day' :
                       chartData.find(d => d.date === selectedDay)!.score === 70 ? 'Activity Logged' :
                       chartData.find(d => d.date === selectedDay)!.score === 50 ? 'Nutrition Logged' : 'No Data Logged'}
                    </h4>
                    <p className="text-xs opacity-70 mt-0.5">
                      {chartData.find(d => d.date === selectedDay)!.score === 100 ? 'Both nutrition and training completed.' :
                       chartData.find(d => d.date === selectedDay)!.score === 70 ? 'Great workout, make sure to fuel up.' :
                       chartData.find(d => d.date === selectedDay)!.score === 50 ? 'Meals are tracked, time to hit the gym.' : 'Take a rest day or log your progress.'}
                    </p>
                  </div>
                </div>
              )}
              
              <DailyView date={selectedDay} workouts={workouts} meals={meals} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};