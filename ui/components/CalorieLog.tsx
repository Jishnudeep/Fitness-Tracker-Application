import React, { useState, useRef, useEffect } from 'react';
import { Meal } from '../types';
import { Utensils, Save, Calendar, Flame, Search, Plus, Clock } from 'lucide-react';
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

  // Search state
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
          alert("Could not find food info.");
        }
      } catch (e) {
        console.error(e);
        setName(query);
        alert("Search failed.");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSave = () => {
    if (!name || !calories) return;
    onSave({
      id: Date.now().toString(),
      name,
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fats: Number(fats) || 0,
      date: new Date(date).toISOString(),
      type
    });
    // Reset
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
  };

  return (
    <div className="pb-24 space-y-8 animate-in fade-in duration-500 max-w-2xl mx-auto">

      {/* Header - Minimalist */}
      <div className="bg-white dark:bg-black p-8 rounded-[2rem] border border-zinc-100 dark:border-zinc-900 shadow-sm">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h2 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter">Nutrition</h2>
            <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest mt-1">Fuel Your Engine!</p>
          </div>
          <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800 text-zinc-400">
            <Utensils size={20} />
          </div>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Log Date</label>
              <CustomDatePicker
                value={date}
                onChange={(val) => setDate(val)}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Meal Type</label>
              <CustomSelect
                value={type}
                onChange={(val) => setType(val as any)}
                options={['Breakfast', 'Lunch', 'Dinner', 'Snack']}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Search Field - Restored */}
      <div className="relative px-2" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setShowSuggestions(true); }}
            onFocus={() => setShowSuggestions(true)}
            placeholder="Search food database..."
            className="w-full pl-14 pr-6 py-5 bg-zinc-50 dark:bg-zinc-950 border border-zinc-100 dark:border-zinc-900 rounded-3xl text-sm font-black outline-none placeholder:opacity-20"
          />
        </div>

        {showSuggestions && searchTerm && (
          <div className="absolute z-20 w-full mt-2 left-0 px-2 animate-in slide-in-from-top-2 duration-200">
            <div className="bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-3xl shadow-2xl max-h-64 overflow-y-auto">

              {/* AI Search Option */}
              <button
                onClick={() => handleAiSearch(searchTerm)}
                className="w-full text-left p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-b border-zinc-50 dark:border-zinc-900 flex justify-between items-center transition-all group bg-zinc-50/50 dark:bg-zinc-900/50"
              >
                <div>
                  <span className="text-sm font-black flex items-center gap-2"><Flame size={14} className="text-orange-500" /> Search AI for "{searchTerm}"</span>
                  <span className="text-[10px] block text-zinc-400 font-bold uppercase tracking-tight">Tap to retrieve from web</span>
                </div>
              </button>

              {FOOD_DATABASE.filter(f => f.name.toLowerCase().includes(searchTerm.toLowerCase())).map((food, i) => (
                <button key={i} onClick={() => selectFood(food)} className="w-full text-left p-4 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-b border-zinc-50 dark:border-zinc-900 last:border-0 flex justify-between items-center transition-all group">
                  <div>
                    <span className="text-sm font-black">{food.name}</span>
                    <span className="text-[10px] block text-zinc-400 font-bold uppercase tracking-tight">P:{food.protein} C:{food.carbs} F:{food.fats}</span>
                  </div>
                  <div className="w-10 h-10 flex items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-950 group-hover:bg-zinc-900 dark:group-hover:bg-white group-hover:text-white dark:group-hover:text-black transition-all">
                    <Plus size={14} />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Form Area */}
      <div className="space-y-8 px-2">
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Selection or manual name..."
          className="w-full text-2xl font-black bg-transparent border-b border-zinc-100 dark:border-zinc-900 focus:border-zinc-900 dark:focus:border-white outline-none py-2 transition-all placeholder:opacity-10"
        />

        <div className="bg-white dark:bg-zinc-950 p-8 rounded-[2rem] border border-zinc-50 dark:border-zinc-900 shadow-sm space-y-8">
          <div className="flex justify-between items-end">
            <div className="flex-1 max-w-[200px]">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">Energy (kcal)</label>
              <input
                type="number"
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="--"
                className="text-5xl font-black bg-transparent outline-none w-full placeholder:opacity-10 tabular-nums"
              />
            </div>
            <Flame size={32} className="text-zinc-100 dark:text-zinc-900 mb-2" />
          </div>

          <div className="grid grid-cols-3 gap-6 pt-8 border-t border-zinc-50 dark:border-zinc-900">
            {[
              { label: 'Protein (g)', val: protein, set: (v: string) => setProtein(v) },
              { label: 'Carbs (g)', val: carbs, set: (v: string) => setCarbs(v) },
              { label: 'Fats (g)', val: fats, set: (v: string) => setFats(v) }
            ].map((macro, i) => (
              <div key={i}>
                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-2 block">{macro.label}</label>
                <input
                  type="number"
                  value={macro.val}
                  onChange={(e) => macro.set(e.target.value)}
                  placeholder="--"
                  className="text-xl font-black bg-transparent outline-none w-full placeholder:opacity-20 tabular-nums"
                />
              </div>
            ))}
          </div>
        </div>

        <Button onClick={handleSave} className="w-full py-6 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] bg-zinc-900 dark:bg-white text-white dark:text-black border-none shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all">
          <Save className="mr-3" size={18} /> Finish Entry
        </Button>
      </div>
    </div>
  );
};