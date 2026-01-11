import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Meal, FoodItem } from '../types';
import { Utensils, Save, Calendar, Search, Plus, X, Trash2, ChevronRight, Minus } from 'lucide-react';
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
  const [mealName, setMealName] = useState('');
  const [type, setType] = useState<Meal['type']>('Breakfast');

  // Current item state (for manual entry)
  const [itemName, setItemName] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fats, setFats] = useState('');
  const [manualQuantity, setManualQuantity] = useState(1);

  // Search quantity state
  const [searchQuantity, setSearchQuantity] = useState(1);

  // Multiple items state
  const [selectedItems, setSelectedItems] = useState<FoodItem[]>([]);

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
    const newItem: FoodItem = {
      id: Date.now().toString(),
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      carbs: food.carbs,
      fats: food.fats,
      quantity: searchQuantity
    };
    setSelectedItems(prev => [...prev, newItem]);
    setSearchTerm('');
    setShowSuggestions(false);
    setSearchQuantity(1); // Reset quantity
  };

  const addManualItem = () => {
    if (!itemName || !calories) return;
    const newItem: FoodItem = {
      id: Date.now().toString(),
      name: itemName,
      calories: Number(calories),
      protein: Number(protein) || 0,
      carbs: Number(carbs) || 0,
      fats: Number(fats) || 0,
      quantity: manualQuantity
    };
    setSelectedItems(prev => [...prev, newItem]);
    setItemName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
    setManualQuantity(1); // Reset quantity
  };

  const removeItem = (id: string) => {
    setSelectedItems(prev => prev.filter(item => item.id !== id));
  };

  const totals = useMemo(() => {
    return selectedItems.reduce((acc, item) => ({
      calories: acc.calories + (item.calories * item.quantity),
      protein: acc.protein + (item.protein * item.quantity),
      carbs: acc.carbs + (item.carbs * item.quantity),
      fats: acc.fats + (item.fats * item.quantity)
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });
  }, [selectedItems]);

  const filteredFoods = FOOD_DATABASE.filter(food =>
    food.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSaveMeal = () => {
    if (selectedItems.length === 0) return;

    const finalMealName = mealName || (selectedItems.length === 1 ? selectedItems[0].name : `${type} with ${selectedItems.length} items`);

    const meal: Meal = {
      id: Date.now().toString(),
      name: finalMealName,
      calories: totals.calories,
      protein: totals.protein,
      carbs: totals.carbs,
      fats: totals.fats,
      date: new Date(date).toISOString(),
      type,
      items: selectedItems
    };

    onSave(meal);

    // Reset all
    setSelectedItems([]);
    setMealName('');
    setItemName('');
    setCalories('');
    setProtein('');
    setCarbs('');
    setFats('');
  };

  return (
    <div className="pb-20 space-y-6 animate-in slide-in-from-bottom-5 duration-300">
      <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl shadow-sm border border-zinc-200 dark:border-zinc-800">
        <h2 className="text-xl font-bold mb-6 flex items-center text-zinc-900 dark:text-white">
          <Utensils className="mr-2 text-pink-500" size={20} />
          Log Food Items
        </h2>

        <div className="space-y-6">
          {/* Top Section: Date and Meal Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 ml-1">Date</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full pl-10 p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-500 outline-none text-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 ml-1">Meal Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as any)}
                className="w-full p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-500 outline-none text-sm appearance-none"
              >
                <option value="Breakfast">Breakfast</option>
                <option value="Lunch">Lunch</option>
                <option value="Dinner">Dinner</option>
                <option value="Snack">Snack</option>
              </select>
            </div>
          </div>

          {/* Search Section */}
          <div className="relative" ref={searchRef}>
            <div className="flex justify-between items-end mb-1.5 px-1">
              <label className="block text-sm font-medium text-zinc-600 dark:text-zinc-300">Fast Add from Database</label>
              {/* Search Quantity Counter */}
              <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 px-2 border border-zinc-200 dark:border-zinc-700">
                <button onClick={() => setSearchQuantity(Math.max(1, searchQuantity - 1))} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white p-0.5"><Minus size={14} /></button>
                <span className="text-xs font-bold min-w-[1.5rem] text-center">{searchQuantity}</span>
                <button onClick={() => setSearchQuantity(searchQuantity + 1)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white p-0.5"><Plus size={14} /></button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                onFocus={() => setShowSuggestions(true)}
                placeholder="Search Indian foods (e.g. Roti, Chicken...)"
                className="w-full pl-10 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-500 outline-none text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {showSuggestions && searchTerm && (
              <div className="absolute z-20 w-full mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                {filteredFoods.length > 0 ? (
                  filteredFoods.map((food, index) => (
                    <button
                      key={index}
                      onClick={() => selectFood(food)}
                      className="w-full text-left p-3 hover:bg-zinc-50 dark:hover:bg-zinc-800 border-b last:border-0 border-zinc-100 dark:border-zinc-800 transition-colors group"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="font-medium text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-pink-500 transition-colors">{food.name}</span>
                          <p className="text-[10px] text-zinc-400">P:{food.protein}g C:{food.carbs}g F:{food.fats}g</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <span className="block text-xs font-bold text-zinc-700 dark:text-zinc-300">{food.calories * searchQuantity} kcal</span>
                            {searchQuantity > 1 && <span className="text-[10px] text-zinc-400 italic">({searchQuantity} x {food.calories})</span>}
                          </div>
                          <Plus size={16} className="text-zinc-300 group-hover:text-pink-500" />
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-3 text-sm text-zinc-500 text-center">No foods found</div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <div className="h-px bg-zinc-100 dark:bg-zinc-800 flex-1"></div>
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">OR MANUAL ENTREE</span>
            <div className="h-px bg-zinc-100 dark:bg-zinc-800 flex-1"></div>
          </div>

          {/* Manual Entry */}
          <div className="space-y-4 p-4 bg-zinc-50/50 dark:bg-zinc-950/30 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                placeholder="Item name (e.g. Protein Shake)"
                className="w-full p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none"
              />
              <div className="flex gap-2">
                <input
                  type="number"
                  value={calories}
                  onChange={(e) => setCalories(e.target.value)}
                  placeholder="Calories (each)"
                  className="flex-1 p-2.5 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm outline-none"
                />
                <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 rounded-lg p-1 px-3 border border-zinc-200 dark:border-zinc-700">
                  <span className="text-[10px] font-bold text-zinc-400">QTY:</span>
                  <button onClick={() => setManualQuantity(Math.max(1, manualQuantity - 1))} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"><Minus size={14} /></button>
                  <span className="text-xs font-bold w-4 text-center">{manualQuantity}</span>
                  <button onClick={() => setManualQuantity(manualQuantity + 1)} className="text-zinc-500 hover:text-zinc-900 dark:hover:text-white"><Plus size={14} /></button>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <input type="number" value={protein} onChange={(e) => setProtein(e.target.value)} placeholder="Prot (g)" className="w-full p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-center outline-none" />
              <input type="number" value={carbs} onChange={(e) => setCarbs(e.target.value)} placeholder="Carbs (g)" className="w-full p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-center outline-none" />
              <input type="number" value={fats} onChange={(e) => setFats(e.target.value)} placeholder="Fats (g)" className="w-full p-2 rounded-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-center outline-none" />
            </div>
            <Button variant="secondary" onClick={addManualItem} className="w-full py-2 h-auto text-xs" disabled={!itemName || !calories}>
              <Plus size={14} className="mr-1" /> Add {manualQuantity} x {itemName || 'Item'} to Meal
            </Button>
          </div>

          {/* Selected Items List */}
          {selectedItems.length > 0 && (
            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-center justify-between px-1">
                <h3 className="text-sm font-bold text-zinc-900 dark:text-white flex items-center">
                  <Utensils size={14} className="mr-2 text-pink-500" />
                  Items in this {type}
                </h3>
                <span className="text-[10px] font-bold text-zinc-500 uppercase">{selectedItems.length} {selectedItems.length === 1 ? 'Entry' : 'Entries'}</span>
              </div>

              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {selectedItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-zinc-50 dark:bg-zinc-950/50 rounded-xl border border-zinc-100 dark:border-zinc-800 group transition-all hover:border-pink-500/30">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-pink-100 dark:bg-pink-900/30 flex items-center justify-center text-pink-600 font-bold text-xs">
                        {item.quantity}x
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-800 dark:text-zinc-200">{item.name}</p>
                        <p className="text-[10px] text-zinc-400 font-medium">Each: {item.calories} kcal • P: {item.protein}g C: {item.carbs}g F: {item.fats}g</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-sm font-black text-zinc-900 dark:text-white">{item.calories * item.quantity} kcal</p>
                        <p className="text-[9px] font-bold text-pink-500 uppercase tracking-tighter">Total for {item.quantity}</p>
                      </div>
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 text-zinc-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Macros Card */}
              <div className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black p-4 rounded-2xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 bg-white/5 dark:bg-black/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                <div className="relative z-10">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest leading-none mb-1">Total Meal Calories</p>
                      <p className="text-4xl font-black">{totals.calories} <span className="text-sm font-normal opacity-60">kcal</span></p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-bold opacity-60 uppercase tracking-widest">Grouping</p>
                      <p className="text-sm font-bold italic opacity-80">{type}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-white/10 dark:border-black/10">
                    <div className="text-center">
                      <p className="text-[9px] font-bold uppercase opacity-50 mb-0.5">Protein</p>
                      <p className="text-sm font-bold">{Math.round(totals.protein * 10) / 10}g</p>
                    </div>
                    <div className="text-center border-x border-white/10 dark:border-black/10">
                      <p className="text-[9px] font-bold uppercase opacity-50 mb-0.5">Carbs</p>
                      <p className="text-sm font-bold">{Math.round(totals.carbs * 10) / 10}g</p>
                    </div>
                    <div className="text-center">
                      <p className="text-[9px] font-bold uppercase opacity-50 mb-0.5">Fats</p>
                      <p className="text-sm font-bold">{Math.round(totals.fats * 10) / 10}g</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Optional Custom Meal Name */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-zinc-500 uppercase mb-1.5 ml-1">Meal Name Override (Optional)</label>
                <input
                  type="text"
                  value={mealName}
                  onChange={(e) => setMealName(e.target.value)}
                  placeholder="e.g. My Cheat Meal"
                  className="w-full p-3 rounded-lg bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-sm outline-none focus:ring-1 focus:ring-pink-500"
                />
              </div>

              <Button
                onClick={handleSaveMeal}
                className="w-full py-4 text-lg bg-pink-600 hover:bg-pink-700 text-white shadow-xl shadow-pink-500/20"
              >
                <Save className="mr-2" /> Finish & Log {selectedItems.length} Entries
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};