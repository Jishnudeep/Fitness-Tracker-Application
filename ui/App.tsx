import React, { useState, useEffect } from 'react';
import { ViewState, Workout, Meal, User } from './types';
import { LayoutDashboard, Dumbbell, Utensils, MessageSquare, Moon, Sun, Plus, LogOut } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { WorkoutLog } from './components/WorkoutLog';
import { CalorieLog } from './components/CalorieLog';
import { AIChat } from './components/AIChat';
import { Login } from './components/Login';
import { 
  getWorkouts, saveWorkouts, 
  getMeals, saveMeals, 
  getTheme, saveTheme,
  getUser, saveUser, clearUser
} from './services/storage';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<ViewState>('dashboard');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  useEffect(() => {
    // Check for user session
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
    }

    // Load data on mount
    setWorkouts(getWorkouts());
    setMeals(getMeals());
    
    // Load theme
    const savedTheme = getTheme();
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
    saveUser(newUser);
  };

  const handleLogout = () => {
    setUser(null);
    clearUser();
    setView('dashboard'); // Reset view on logout
  };

  const handleSaveWorkout = (workout: Workout) => {
    const updated = [workout, ...workouts];
    setWorkouts(updated);
    saveWorkouts(updated);
    setView('dashboard');
  };

  const handleSaveMeal = (meal: Meal) => {
    const updated = [meal, ...meals];
    setMeals(updated);
    saveMeals(updated);
    setView('dashboard');
  };

  const renderView = () => {
    switch(view) {
      case 'dashboard': return <Dashboard workouts={workouts} meals={meals} />;
      case 'workout': return (
        <div className="max-w-2xl mx-auto">
          <WorkoutLog onSave={handleSaveWorkout} />
        </div>
      );
      case 'calories': return (
        <div className="max-w-2xl mx-auto">
          <CalorieLog onSave={handleSaveMeal} />
        </div>
      );
      case 'ai': return (
        <div className="max-w-4xl mx-auto">
          <AIChat workouts={workouts} meals={meals} />
        </div>
      );
      default: return <Dashboard workouts={workouts} meals={meals} />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workout', label: 'Workouts', icon: Dumbbell },
    { id: 'calories', label: 'Calories', icon: Utensils },
    { id: 'ai', label: 'AI Chat', icon: MessageSquare },
  ];

  // If not logged in, show Login screen
  if (!user) {
    return <Login onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-dark text-zinc-900 dark:text-zinc-100 flex justify-center">
      <div className="w-full md:max-w-6xl min-h-screen relative shadow-2xl bg-white dark:bg-dark flex flex-col transition-all duration-300">
        
        {/* Header */}
        <header className="sticky top-0 z-30 bg-white/80 dark:bg-dark/80 backdrop-blur-lg border-b border-zinc-200 dark:border-zinc-800 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-black text-zinc-900 dark:text-white tracking-tight">
                TheCutRoute
              </h1>
              <p className="text-xs text-zinc-500 hidden md:block mt-1">
                Welcome back, {user.username}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
               {/* Theme Toggle */}
              <button 
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-600 dark:text-zinc-300"
                title="Toggle Theme"
              >
                {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
              </button>

              {/* Logout Button */}
              <button 
                onClick={handleLogout}
                className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-600 dark:text-zinc-300 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                title="Sign Out"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <div className="hidden md:flex mt-6 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl overflow-hidden">
            {navItems.map(item => (
                <button
                    key={item.id}
                    onClick={() => setView(item.id as ViewState)}
                    className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                        view === item.id 
                        ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-sm ring-1 ring-black/5 dark:ring-white/10' 
                        : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-200 hover:bg-zinc-200/50 dark:hover:bg-zinc-800/50'
                    }`}
                >
                    <item.icon size={18} />
                    {item.label}
                </button>
            ))}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 pb-24 md:pb-8 overflow-x-hidden">
          {renderView()}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 px-6 py-3 z-40 pb-6 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
          <div className="flex justify-between items-center max-w-lg mx-auto relative">
            <button 
              onClick={() => setView('dashboard')}
              className={`flex flex-col items-center gap-1 transition-colors ${view === 'dashboard' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
            >
              <LayoutDashboard size={24} strokeWidth={view === 'dashboard' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Home</span>
            </button>
            <button 
              onClick={() => setView('workout')}
              className={`flex flex-col items-center gap-1 transition-colors ${view === 'workout' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
            >
              <Dumbbell size={24} strokeWidth={view === 'workout' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Lift</span>
            </button>
            
            {/* Center Space for Floating Button */}
            <div className="w-12"></div> 
            
            {/* Floating Action Button for Mobile */}
            <button 
              onClick={() => setView('workout')} 
              className="absolute left-1/2 -translate-x-1/2 -top-10 bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black p-4 rounded-full shadow-lg shadow-zinc-500/20 hover:scale-105 transition-transform active:scale-95 border-4 border-white dark:border-dark"
            >
              <Plus size={24} strokeWidth={3} />
            </button>

            <button 
              onClick={() => setView('calories')}
              className={`flex flex-col items-center gap-1 transition-colors ${view === 'calories' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
            >
              <Utensils size={24} strokeWidth={view === 'calories' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Food</span>
            </button>
            <button 
              onClick={() => setView('ai')}
              className={`flex flex-col items-center gap-1 transition-colors ${view === 'ai' ? 'text-zinc-900 dark:text-white' : 'text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300'}`}
            >
              <MessageSquare size={24} strokeWidth={view === 'ai' ? 2.5 : 2} />
              <span className="text-[10px] font-medium">Coach</span>
            </button>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default App;