import React, { useState, useMemo } from 'react';
import { Workout, Meal } from '../types';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, AreaChart, Area } from 'recharts';
import { Activity, Flame, Dumbbell, TrendingUp, Calendar, Weight, Clock, ChevronDown } from 'lucide-react';

interface DashboardProps {
  workouts: Workout[];
  meals: Meal[];
}

type TimeRange = 'week' | 'month' | 'all' | 'custom';

export const Dashboard: React.FC<DashboardProps> = ({ workouts, meals }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [customStart, setCustomStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [customEnd, setCustomEnd] = useState(() => new Date().toISOString().split('T')[0]);

  // Filter data based on selected time range
  const { filteredWorkouts, filteredMeals, dateLabels } = useMemo(() => {
    let startDate = new Date();
    let endDate = new Date();
    endDate.setHours(23, 59, 59, 999);
    
    // Determine Start/End dates
    if (timeRange === 'week') {
      startDate.setDate(endDate.getDate() - 6);
      startDate.setHours(0, 0, 0, 0);
    } else if (timeRange === 'month') {
      startDate.setDate(endDate.getDate() - 29);
      startDate.setHours(0, 0, 0, 0);
    } else if (timeRange === 'custom') {
      startDate = new Date(customStart);
      startDate.setHours(0, 0, 0, 0);
      endDate = new Date(customEnd);
      endDate.setHours(23, 59, 59, 999);
    } else {
      // 'all'
      startDate = new Date(0); 
    }

    // Filter actual data
    const fWorkouts = workouts.filter(w => {
      const d = new Date(w.date);
      return d >= startDate && d <= endDate;
    });
    
    const fMeals = meals.filter(m => {
      const d = new Date(m.date);
      return d >= startDate && d <= endDate;
    });

    // Generate date labels
    let labels: string[] = [];
    
    if (timeRange === 'all') {
         const allDates = [...workouts.map(w => w.date), ...meals.map(m => m.date)].sort();
        if (allDates.length > 0) {
            const first = new Date(allDates[0]);
            const last = new Date(allDates[allDates.length - 1]);
            const current = new Date(first);
            current.setHours(0,0,0,0);
            const end = new Date(last);
            end.setHours(23,59,59,999);

            // Limit 'all' points if too many, but for now simple loop
            while (current <= end) {
                labels.push(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
            }
        }
    } else {
        // Generate continuous days between start and end
        if (startDate <= endDate) {
            const current = new Date(startDate);
            while (current <= endDate) {
                labels.push(current.toISOString().split('T')[0]);
                current.setDate(current.getDate() + 1);
            }
        }
    }

    return { filteredWorkouts: fWorkouts, filteredMeals: fMeals, dateLabels: labels };
  }, [workouts, meals, timeRange, customStart, customEnd]);

  // Prepare Chart Data
  const chartData = useMemo(() => {
    // If no data or invalid range, return empty
    if (dateLabels.length === 0) return [];

    return dateLabels.map(date => {
      // Calories
      const dailyMeals = filteredMeals.filter(m => m.date.startsWith(date));
      const calories = dailyMeals.reduce((sum, m) => sum + m.calories, 0);

      // Volume
      const dailyWorkouts = filteredWorkouts.filter(w => w.date.startsWith(date));
      const volume = dailyWorkouts.reduce((acc, w) => {
        return acc + w.exercises.reduce((exAcc, ex) => {
          return exAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.weight * s.reps), 0);
        }, 0);
      }, 0);

      // Duration
      const duration = dailyWorkouts.reduce((acc, w) => acc + (w.durationMinutes || 0), 0);

      return {
        date,
        displayDate: new Date(date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }),
        shortDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        calories,
        volume,
        duration
      };
    });
  }, [filteredMeals, filteredWorkouts, dateLabels]);

  // Stats Calculations
  const stats = useMemo(() => {
    const totalVolume = filteredWorkouts.reduce((acc, w) => {
      return acc + w.exercises.reduce((exAcc, ex) => {
        return exAcc + ex.sets.reduce((sAcc, s) => sAcc + (s.weight * s.reps), 0);
      }, 0);
    }, 0);

    const totalSets = filteredWorkouts.reduce((acc, w) => {
      return acc + w.exercises.reduce((exAcc, ex) => exAcc + ex.sets.length, 0);
    }, 0);

    const totalDuration = filteredWorkouts.reduce((acc, w) => acc + (w.durationMinutes || 0), 0);

    // Calculate unique active days within the selected range
    const activeDaysSet = new Set([
      ...filteredWorkouts.map(w => w.date.split('T')[0]),
      ...filteredMeals.map(m => m.date.split('T')[0])
    ]);
    const activeDays = activeDaysSet.size;

    // Avg Calories
    const mealDays = new Set(filteredMeals.map(m => m.date.split('T')[0])).size;
    const totalCalories = filteredMeals.reduce((acc, m) => acc + m.calories, 0);
    const avgCalories = mealDays > 0 ? Math.round(totalCalories / mealDays) : 0;

    return {
      totalWorkouts: filteredWorkouts.length,
      totalSets,
      totalVolume,
      avgCalories,
      activeDays,
      totalDuration
    };
  }, [filteredWorkouts, filteredMeals]);

  return (
    <div className="space-y-6 pb-20 md:pb-0 animate-in fade-in duration-500">
      
      {/* Header & Filter */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Performance Overview</h2>
            <p className="text-sm text-zinc-500">Track your metrics over time</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2 items-end sm:items-center w-full sm:w-auto">
            {timeRange === 'custom' && (
                <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-1 pr-2 rounded-lg border border-zinc-200 dark:border-zinc-800 animate-in fade-in slide-in-from-right-2 shadow-sm">
                    <input 
                        type="date" 
                        value={customStart}
                        onChange={(e) => setCustomStart(e.target.value)}
                        className="bg-transparent border-none text-xs font-medium text-zinc-600 dark:text-zinc-300 focus:ring-0 p-1 outline-none"
                    />
                    <span className="text-zinc-400 text-xs">to</span>
                    <input 
                        type="date" 
                        value={customEnd}
                        onChange={(e) => setCustomEnd(e.target.value)}
                        className="bg-transparent border-none text-xs font-medium text-zinc-600 dark:text-zinc-300 focus:ring-0 p-1 outline-none"
                    />
                </div>
            )}
            <div className="relative w-full sm:w-auto">
                <select
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                    className="w-full sm:w-auto appearance-none pl-4 pr-10 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg text-sm font-medium text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-zinc-500 cursor-pointer shadow-sm"
                >
                    <option value="week">Last 7 Days</option>
                    <option value="month">Last 30 Days</option>
                    <option value="all">All Time</option>
                    <option value="custom">Custom Range</option>
                </select>
                <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" size={16} />
            </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Workouts */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2 text-zinc-900 dark:text-zinc-100">
               <span className="text-sm font-medium">Workouts</span>
            </div>
            <Activity size={16} className="text-zinc-400 dark:text-zinc-500" />
          </div>
          <p className="text-3xl font-bold">{stats.totalWorkouts}</p>
          <div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400 mt-1">
             <Clock size={12} className="mr-1" />
             <span>{Math.round(stats.totalDuration / 60)}h {stats.totalDuration % 60}m total</span>
          </div>
        </div>

        {/* Volume */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
            <div className="flex items-center space-x-2 text-zinc-900 dark:text-zinc-100">
               <span className="text-sm font-medium">Volume</span>
            </div>
            <Weight size={16} className="text-zinc-400 dark:text-zinc-500" />
          </div>
          <p className="text-3xl font-bold">{stats.totalVolume.toLocaleString()}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">kg lifted</p>
        </div>

        {/* Calories */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
             <div className="flex items-center space-x-2 text-zinc-900 dark:text-zinc-100">
               <span className="text-sm font-medium">Avg Calories</span>
            </div>
            <Flame size={16} className="text-zinc-400 dark:text-zinc-500" />
          </div>
          <p className="text-3xl font-bold">{stats.avgCalories}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">Daily average</p>
        </div>

        {/* Days Tracked */}
        <div className="bg-white dark:bg-zinc-900 p-4 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 relative overflow-hidden group">
          <div className="flex justify-between items-start mb-2">
             <div className="flex items-center space-x-2 text-zinc-900 dark:text-zinc-100">
               <span className="text-sm font-medium">Active Days</span>
            </div>
            <Calendar size={16} className="text-zinc-400 dark:text-zinc-500" />
          </div>
          <p className="text-3xl font-bold">{stats.activeDays}</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">In this period</p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Volume Chart */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-sm text-zinc-900 dark:text-zinc-100">
            <TrendingUp className="mr-2 text-indigo-500" size={18} />
            Volume Load
          </h3>
          <div className="h-64 w-full">
            {chartData.some(d => d.volume > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.1} />
                  <XAxis dataKey="shortDate" tick={{fontSize: 10, fill: '#71717a'}} stroke="#71717a" axisLine={false} tickLine={false} interval={dateLabels.length > 14 ? 'preserveStartEnd' : 0} />
                  <YAxis tick={{fontSize: 10, fill: '#71717a'}} stroke="#71717a" axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#18181b', color: '#fff', fontSize: '12px' }} 
                    labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                  />
                  <Area type="monotone" dataKey="volume" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorVolume)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-sm text-center opacity-60">
                    <Dumbbell size={32} className="mb-2" />
                    No workout volume in this period
                </div>
            )}
          </div>
        </div>

        {/* Calories Chart */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-sm text-zinc-900 dark:text-zinc-100">
            <Activity className="mr-2 text-pink-500" size={18} />
            Calorie Intake
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.1} />
                <XAxis dataKey="shortDate" tick={{fontSize: 10, fill: '#71717a'}} stroke="#71717a" axisLine={false} tickLine={false} interval={dateLabels.length > 14 ? 'preserveStartEnd' : 0} />
                <YAxis tick={{fontSize: 10, fill: '#71717a'}} stroke="#71717a" axisLine={false} tickLine={false} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#18181b', color: '#fff', fontSize: '12px' }}
                  cursor={{fill: 'rgba(255,255,255,0.05)'}}
                  labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                />
                <Bar dataKey="calories" fill="#ec4899" radius={[4, 4, 0, 0]} barSize={dateLabels.length > 14 ? 10 : 30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Duration Chart */}
        <div className="bg-white dark:bg-zinc-900 p-5 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800 lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4 flex items-center text-sm text-zinc-900 dark:text-zinc-100">
            <Clock className="mr-2 text-emerald-500" size={18} />
            Workout Duration (Minutes)
          </h3>
          <div className="h-64 w-full">
             {chartData.some(d => d.duration > 0) ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.1} />
                  <XAxis dataKey="shortDate" tick={{fontSize: 10, fill: '#71717a'}} stroke="#71717a" axisLine={false} tickLine={false} interval={dateLabels.length > 14 ? 'preserveStartEnd' : 0} />
                  <YAxis tick={{fontSize: 10, fill: '#71717a'}} stroke="#71717a" axisLine={false} tickLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '8px', border: 'none', backgroundColor: '#18181b', color: '#fff', fontSize: '12px' }}
                    cursor={{fill: 'rgba(255,255,255,0.05)'}}
                    labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
                  />
                  <Bar dataKey="duration" fill="#10b981" radius={[4, 4, 0, 0]} barSize={dateLabels.length > 14 ? 10 : 30} />
                </BarChart>
              </ResponsiveContainer>
             ) : (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 text-sm text-center opacity-60">
                    <Clock size={32} className="mb-2" />
                    No duration data in this period
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};