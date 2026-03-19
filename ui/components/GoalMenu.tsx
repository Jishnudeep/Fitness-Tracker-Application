import React, { useState, useEffect } from 'react';
import { Target, Loader2, Save, CalendarDays, Scale, TrendingDown, Flame, Activity } from 'lucide-react';
import { CustomDatePicker } from './ui/CustomDatePicker';
import { Button } from './ui/Button';
import { AIResponse } from './ui/AIResponse';
import { api } from '../services/api';
import { useToast } from './ui/Toast';

export const GoalMenu: React.FC = () => {
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [gender, setGender] = useState('Male');
  const [lifestyle, setLifestyle] = useState('Active');
  const [weight, setWeight] = useState('');
  const [targetWeight, setTargetWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [targetBodyFat, setTargetBodyFat] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    const loadGoal = async () => {
      try {
        const goal = await api.getGoal();
        if (goal) {
          setAge(goal.age?.toString() || '');
          setHeight(goal.current_height?.toString() || '');
          setGender(goal.gender || localStorage.getItem('user_gender') || 'Male');
          setLifestyle(goal.lifestyle || localStorage.getItem('user_lifestyle') || 'Active');
          setWeight(goal.current_weight?.toString() || '');
          setTargetWeight(goal.goal_weight?.toString() || '');
          setBodyFat(goal.current_body_fat?.toString() || '');
          setTargetBodyFat(goal.goal_body_fat?.toString() || '');
          setTargetDate(goal.target_date || '');
        }
      } catch (e) { console.error(e); } finally { setLoaded(true); }
    };
    loadGoal();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      localStorage.setItem('user_gender', gender);
      localStorage.setItem('user_lifestyle', lifestyle);
      await api.saveGoal({
        age: Number(age) || 0, current_height: Number(height) || 0,
        current_weight: Number(weight) || 0, goal_weight: Number(targetWeight) || 0,
        current_body_fat: Number(bodyFat) || 0, goal_body_fat: Number(targetBodyFat) || 0,
        lifestyle: lifestyle,
        target_date: targetDate
      });
      showToast("Goals saved!", "success");
    } catch (e) {
      showToast("Failed to save goals", "error");
    } finally { setIsSaving(false); }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setAnalysis(null);
    try {
      localStorage.setItem('user_gender', gender);
      localStorage.setItem('user_lifestyle', lifestyle);
      const result = await api.analyzeGoal({
        age: Number(age) || 0, current_height: Number(height) || 0,
        current_weight: Number(weight) || 0, goal_weight: Number(targetWeight) || 0,
        current_body_fat: Number(bodyFat) || 0, goal_body_fat: Number(targetBodyFat) || 0,
        lifestyle: lifestyle,
        target_date: targetDate
      });
      setAnalysis(result.analysis || result.message || "Analysis complete.");
    } catch (e) {
      showToast("Failed to get analysis", "error");
    } finally { setIsAnalyzing(false); }
  };

  if (!loaded) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
        <Loader2 size={28} className="animate-spin mb-3" />
        <p className="text-sm font-medium">Loading goals...</p>
      </div>
    );
  }

  return (
    <div className="pb-24 space-y-6 page-enter max-w-2xl mx-auto">

      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center">
            <Target size={20} />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Your Goals</h2>
            <p className="text-xs text-zinc-400 font-medium">Track your transformation</p>
          </div>
        </div>

        <div className="space-y-8">
          
          {/* Physical Profile */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 ml-1">Age</label>
              <input type="number" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Years"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 ml-1">Height (cm)</label>
              <input type="number" value={height} onChange={(e) => setHeight(e.target.value)} placeholder="cm"
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors" />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 ml-1">Gender</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors appearance-none">
                <option value="Male">Male</option>
                <option value="Female">Female</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 ml-1">Lifestyle</label>
              <select value={lifestyle} onChange={(e) => setLifestyle(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors appearance-none">
                <option value="Sedentary">Sedentary</option>
                <option value="Lightly Active">Lightly Active</option>
                <option value="Active">Active</option>
                <option value="Very Active">Very Active</option>
              </select>
            </div>
          </div>
          
          <hr className="border-t border-zinc-100 dark:border-zinc-800 -mx-6" />

          {/* Current vs Target */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <Scale size={12} /> Current
              </h4>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 ml-1">Weight (kg)</label>
                <input type="number" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="--"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 ml-1">Body Fat (%)</label>
                <input type="number" value={bodyFat} onChange={(e) => setBodyFat(e.target.value)} placeholder="--"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors" />
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                <TrendingDown size={12} /> Target
              </h4>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 ml-1">Weight (kg)</label>
                <input type="number" value={targetWeight} onChange={(e) => setTargetWeight(e.target.value)} placeholder="--"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-500 ml-1">Body Fat (%)</label>
                <input type="number" value={targetBodyFat} onChange={(e) => setTargetBodyFat(e.target.value)} placeholder="--"
                  className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-semibold outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors" />
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 ml-1 flex items-center gap-1.5"><CalendarDays size={12} /> Target Date</label>
            <CustomDatePicker value={targetDate} onChange={(val) => setTargetDate(val)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={handleSave} loading={isSaving} className="w-full">
              <Save size={16} /> Save
            </Button>
            <Button onClick={handleAnalyze} loading={isAnalyzing} className="w-full">
              <Activity size={16} /> Ask AI Coach
            </Button>
          </div>
        </div>
      </div>

      {/* Analysis Result */}
      {analysis && (
        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 page-enter">
          <div className="flex items-center gap-2 mb-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
            <Flame size={16} className="text-amber-500" />
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">AI Coach Analysis</h3>
          </div>
          <AIResponse markdown={analysis} />
        </div>
      )}
    </div>
  );
};
