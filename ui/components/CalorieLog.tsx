import React, { useState, useRef, useEffect } from 'react';
import { Meal } from '../types';
import { Utensils, Save, Flame, Search, Plus } from 'lucide-react';
import { Button } from './ui/Button';
import { CustomSelect } from './ui/CustomSelect';
import { CustomDatePicker } from './ui/CustomDatePicker';
import { api } from '../services/api';

interface CalorieLogProps {
  onSave: (meal: Meal) => void;
}

const FOOD_DATABASE = [
  { name: 'Chapati (Whole Wheat Roti)', calories: 104, protein: 3, carbs: 17, fats: 3 },
  { name: 'White Rice (Steamed, 1 bowl)', calories: 204, protein: 4, carbs: 44, fats: 0.4 },
  { name: 'Brown Rice (1 bowl)', calories: 216, protein: 5, carbs: 45, fats: 1.8 },
  { name: 'Dal Fry (Yellow Lentils, 1 bowl)', calories: 198, protein: 10, carbs: 25, fats: 7 },
  { name: 'Chicken Curry (1 bowl)', calories: 290, protein: 25, carbs: 12, fats: 16 },
  { name: 'Paneer Butter Masala (1 bowl)', calories: 350, protein: 12, carbs: 15, fats: 28 },
  { name: 'Aloo Paratha (1 medium)', calories: 290, protein: 5, carbs: 36, fats: 14 },
  { name: 'Dosa (Plain)', calories: 168, protein: 4, carbs: 29, fats: 4 },
  { name: 'Idli (2 pieces)', calories: 116, protein: 4, carbs: 24, fats: 0.4 },
  { name: 'Sambar (1 bowl)', calories: 130, protein: 6, carbs: 20, fats: 4 },
  { name: 'Chicken Biryani (1 plate)', calories: 550, protein: 25, carbs: 65, fats: 20 },
  { name: 'Poha (1 plate)', calories: 250, protein: 4, carbs: 45, fats: 7 },
  { name: 'Boiled Egg (1 large)', calories: 78, protein: 6, carbs: 0.6, fats: 5 },
  { name: 'Banana (1 medium)', calories: 105, protein: 1.3, carbs: 27, fats: 0.3 },
  { name: 'Apple (1 medium)', calories: 95, protein: 0.5, carbs: 25, fats: 0.3 },
  { name: 'Milk (1 glass, 250ml)', calories: 150, protein: 8, carbs: 12, fats: 8 },
];

export const CalorieLog: React.FC<CalorieLogProps> = ({ onSave }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [name, setName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [type, setType] = useState<Meal['type']>('Breakfast');

  const [searchTerm, setSearchTerm] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectFood = (food: { name: string, calories: number, protein: number, carbs: number, fats: number }) => {
    setName(food.name);
    setCalories(food.calories.toString());
    setProtein(food.protein.toString());
    setCarbs(food.carbs.toString());
    setFats(food.fats.toString());
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const handleAiSearch = async (query: string) => {
    setName("Searching...");
    setShowSuggestions(false);
    try {
      const data = await api.searchFood(query);
      if (data && !data.error && data.name) {
        setName(data.name);
        setCalories(data.calories?.toString() || "");
        setProtein(data.protein?.toString() || "");
        setCarbs(data.carbs?.toString() || "");
        setFats(data.fats?.toString() || "");
      } else {
        setName(query);
      }
    } catch (e) {
      console.error(e);
      setName(query);
    }
  };

  const handleSave = () => {
    if (!name || !calories) return;
    onSave({
      id: Date.now().toString(), name, calories: Number(calories),
      protein: Number(protein) || 0, carbs: Number(carbs) || 0, fats: Number(fats) || 0,
      date: new Date(date).toISOString(), type
    });
    setName(''); setCalories(''); setProtein(''); setCarbs(''); setFats('');
  };

  return (
    <div className="pb-24 space-y-6 page-enter max-w-2xl mx-auto">

      {/* Header */}
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Utensils size={20} />
            </div>
            <div>
              <h2 className="text-xl font-extrabold text-zinc-900 dark:text-white tracking-tight">Nutrition</h2>
              <p className="text-xs text-zinc-400 font-medium">Fuel your engine</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 ml-1">Log Date</label>
            <CustomDatePicker value={date} onChange={(val) => setDate(val)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-500 ml-1">Meal Type</label>
            <CustomSelect value={type} onChange={(val) => setType(val as any)} options={['Breakfast', 'Lunch', 'Dinner', 'Snack']} />
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
          <input type="text" value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search food database..."
            className="w-full pl-11 pr-4 py-3.5 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium outline-none placeholder:text-zinc-300 dark:placeholder:text-zinc-700 focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors" />
        </div>

        {showSuggestions && searchTerm && (
          <div className="absolute z-20 w-full mt-1.5 page-enter">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl max-h-60 overflow-y-auto">
              <button onClick={() => handleAiSearch(searchTerm)}
                className="w-full text-left p-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800 flex justify-between items-center transition-colors">
                <div>
                  <span className="text-sm font-semibold flex items-center gap-2"><Flame size={14} className="text-amber-500" /> Search AI for "{searchTerm}"</span>
                  <span className="text-[11px] text-zinc-400">Tap to look up nutrition info</span>
                </div>
              </button>

              {FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map((food, i) => (
                <button key={i} onClick={() => selectFood(food)}
                  className="w-full text-left p-3.5 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-b border-zinc-100 dark:border-zinc-800 last:border-0 flex justify-between items-center transition-colors group">
                  <div>
                    <span className="text-sm font-semibold">{food.name}</span>
                    <span className="text-[11px] text-zinc-400 block">P:{food.protein} C:{food.carbs} F:{food.fats}</span>
                  </div>
                  <div className="w-8 h-8 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-800 group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-zinc-900 transition-all">
                    <Plus size={14} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Macro Form */}
      <div className="space-y-4">
        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Food name..."
          className="w-full text-lg font-bold bg-transparent border-b-2 border-zinc-100 dark:border-zinc-800 focus:border-zinc-900 dark:focus:border-white outline-none py-2 transition-colors placeholder:text-zinc-300 dark:placeholder:text-zinc-700" />

        <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 space-y-6">
          <div className="flex justify-between items-end">
            <div className="flex-1 max-w-[200px]">
              <label className="text-xs font-semibold text-zinc-500 mb-1.5 block">Energy (kcal)</label>
              <input type="number" value={calories} onChange={(e) => setCalories(e.target.value)} placeholder="--"
                className="text-4xl font-extrabold bg-transparent outline-none w-full placeholder:text-zinc-200 dark:placeholder:text-zinc-800 tabular-nums text-amber-500" />
            </div>
            <Flame size={28} className="text-zinc-100 dark:text-zinc-800 mb-1" />
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
            {[
              { label: 'Protein (g)', val: protein, set: setProtein },
              { label: 'Carbs (g)', val: carbs, set: setCarbs },
              { label: 'Fats (g)', val: fats, set: setFats }
            ].map((macro, i) => (
              <div key={i}>
                <label className="text-[11px] font-semibold text-zinc-400 mb-1 block">{macro.label}</label>
                <input type="number" value={macro.val} onChange={(e) => macro.set(e.target.value)} placeholder="--"
                  className="text-lg font-bold bg-transparent outline-none w-full placeholder:text-zinc-200 dark:placeholder:text-zinc-800 tabular-nums" />
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} size="lg" className="w-full">
          <Save size={18} /> Log Meal
        </Button>
      </div>
    </div>
  );
};