import React, { useState, useEffect, useRef } from 'react';
import { Meal } from '../types';
import { Utensils, Save, Calendar, Search, Plus, X } from 'lucide-react';
import { Button } from './ui/Button';

interface CalorieLogProps {
  onSave: (meal: Meal) => void;
}

// Predefined Indian Food Database
const FOOD_DATABASE = [
  { name: 'Chapati (Whole Wheat Roti)', calories: 104, protein: 3, carbs: 17, fats: 3 },
  { name: 'White Rice (Steamed, 1 bowl)', calories: 204, protein: 4, carbs: 44, fats: 0.4 },
  { name: 'Brown Rice (1 bowl)', calories: 216, protein: 5, carbs: 45, fats: 1.8 },
  { name: 'Dal Fry (Yellow Lentils, 1 bowl)', calories: 198, protein: 10, carbs: 25, fats: 7 },
  { name: 'Dal Makhani (1 bowl)', calories: 278, protein: 9, carbs: 22, fats: 16 },
  { name: 'Chicken Curry (1 bowl)', calories: 290, protein: 25, carbs: 12, fats: 16 },
  { name: 'Paneer Butter Masala (1 bowl)', calories: 350, protein: 12, carbs: 15, fats: 28 },
  { name: 'Palak Paneer (1 bowl)', calories: 260, protein: 14, carbs: 10, fats: 18 },
  { name: 'Aloo Paratha (1 medium)', calories: 290, protein: 5, carbs: 36, fats: 14 },
  { name: 'Plain Paratha', calories: 260, protein: 4, carbs: 30, fats: 14 },
  { name: 'Dosa (Plain)', calories: 168, protein: 4, carbs: 29, fats: 4 },
  { name: 'Masala Dosa', calories: 380, protein: 6, carbs: 45, fats: 18 },
  { name: 'Idli (2 pieces)', calories: 116, protein: 4, carbs: 24, fats: 0.4 },
  { name: 'Sambar (1 bowl)', calories: 130, protein: 6, carbs: 20, fats: 4 },
  { name: 'Chicken Biryani (1 plate)', calories: 550, protein: 25, carbs: 65, fats: 20 },
  { name: 'Veg Biryani (1 plate)', calories: 420, protein: 9, carbs: 65, fats: 14 },
  { name: 'Poha (1 plate)', calories: 250, protein: 4, carbs: 45, fats: 7 },
  { name: 'Upma (1 plate)', calories: 230, protein: 5, carbs: 35, fats: 8 },
  { name: 'Samosa (1 piece)', calories: 262, protein: 3, carbs: 24, fats: 17 },
  { name: 'Masala Chai (1 cup)', calories: 120, protein: 3, carbs: 12, fats: 5 },
  { name: 'Coffee (with milk & sugar)', calories: 110, protein: 3, carbs: 12, fats: 4 },
  { name: 'Boiled Egg (1 large)', calories: 78, protein: 6, carbs: 0.6, fats: 5 },
  { name: 'Omelette (2 eggs)', calories: 310, protein: 14, carbs: 2, fats: 24 },
  { name: 'Banana (1 medium)', calories: 105, protein: 1.3, carbs: 27, fats: 0.3 },
  { name: 'Apple (1 medium)', calories: 95, protein: 0.5, carbs: 25, fats: 0.3 },
  { name: 'Milk (1 glass, 250ml)', calories: 150, protein: 8, carbs: 12, fats: 8 },
  { name: 'Curd/Yogurt (1 bowl)', calories: 100, protein: 6, carbs: 8, fats: 6 },
  { name: 'Chole Bhature (1 serving)', calories: 450, protein: 12, carbs: 55, fats: 22 },
  { name: 'Rajma Chawal (1 plate)', calories: 360, protein: 12, carbs: 55, fats: 8 },
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

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    setShowSuggestions(true);
  };

  const selectFood = (food: typeof FOOD_DATABASE[0]) => {
    setName(food.name);
    setCalories(food.calories.toString());
    setProtein(food.protein.toString());
    setCarbs(food.carbs.toString());
    setFats(food.fats.toString());
    
    setSearchTerm('');
    setShowSuggestions(false);
  };

  const filteredFoods = FOOD_DATABASE.filter(food => 
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSave = () => {
    if (!name || !calories) return;

    const meal: Meal = {
      id: Date.now().toString(),
      name,
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fats: Number(fats) || 0,
      date: new Date(date).toISOString(),
      type
    };

    onSave(meal);
    
    // Reset
    setName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
  };

  return (
    <div className="pb-20 space-y-6 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold mb-6 flex items-center text-zinc-900 dark:text-white">
          <Utensils className="mr-2 text-zinc-900 dark:text-white" size={20} />
          Log Meal
        </h2>

        <div className="space-y-5">
           {/* Date Picker */}
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

          {/* Search Bar */}
          <div className="relative" ref={searchRef}>
            <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">Search Food Database</label>
            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input 
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => setShowSuggestions(true)}
                    placeholder="Search for common Indian foods..." 
                    className="w-full pl-10 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-500 outline-none text-zinc-900 dark:text-zinc-100"
                />
                {searchTerm && (
                    <button 
                        onClick={() => setSearchTerm('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                    >
                        <X size={14} />
                    </button>
                )}
            </div>
            
            {/* Suggestions Dropdown */}
            {showSuggestions && searchTerm && (
                <div className="absolute z-10 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                    {filteredFoods.length > 0 ? (
                        filteredFoods.map((food, index) => (
                            <button
                                key={index}
                                onClick={() => selectFood(food)}
                                className="w-full text-left p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-b last:border-0 border-zinc-100 dark:border-zinc-800 transition-colors"
                            >
                                <div className="flex justify-between items-center">
                                    <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100">{food.name}</span>
                                    <span className="text-xs text-zinc-500">{food.calories} kcal</span>
                                </div>
                                <div className="text-[10px] text-zinc-400 mt-0.5">
                                    P: {food.protein}g • C: {food.carbs}g • F: {food.fats}g
                                </div>
                            </button>
                        ))
                    ) : (
                        <div className="p-3 text-sm text-zinc-500 text-center">No foods found</div>
                    )}
                </div>
            )}
          </div>
          
          <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2"></div>

          <div>
            <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">Meal Name</label>
            <input 
              type="text" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Oatmeal & Eggs" 
              className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-500 outline-none text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">Meal Type</label>
              <select 
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-500 outline-none text-zinc-900 dark:text-zinc-100 appearance-none"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">Calories</label>
              <input 
                type="number" 
                value={calories}
                onChange={(e) => setCalories(e.target.value)}
                placeholder="kcal" 
                className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-500 outline-none text-zinc-900 dark:text-zinc-100"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
            <p className="text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-3">Macros (Optional)</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-center mb-1 text-zinc-500">Protein (g)</label>
                <input 
                  type="number" 
                  value={protein}
                  onChange={(e) => setProtein(e.target.value)}
                  className="w-full p-2 text-center rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-500 outline-none text-sm text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs text-center mb-1 text-zinc-500">Carbs (g)</label>
                <input 
                  type="number" 
                  value={carbs}
                  onChange={(e) => setCarbs(e.target.value)}
                  className="w-full p-2 text-center rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-500 outline-none text-sm text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-xs text-center mb-1 text-zinc-500">Fats (g)</label>
                <input 
                  type="number" 
                  value={fats}
                  onChange={(e) => setFats(e.target.value)}
                  className="w-full p-2 text-center rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-500 outline-none text-sm text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleSave} 
            className="w-full py-4 text-lg"
          >
            <Save className="mr-2" /> Log Meal
          </Button>
        </div>
      </div>
    </div>
  );
};