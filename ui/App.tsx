import React, { useState, useEffect } from 'react';
import { ViewState, Workout, Meal, User } from './types';
import { LayoutDashboard, Dumbbell, Utensils, MessageSquare, Moon, Sun, LogOut, Loader2, Activity, Target, Plus, X } from 'lucide-react';
import { Dashboard } from './components/Dashboard';
import { WorkoutLog } from './components/WorkoutLog';
import { CalorieLog } from './components/CalorieLog';
import { CardioLog } from './components/CardioLog';
import { AIChat } from './components/AIChat';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { GoalMenu } from './components/GoalMenu';
import { api } from './services/api';
import {
  getTheme, saveTheme,
  getUser, clearUser, saveUser
} from './services/storage';
import { supabase } from './services/supabase';
import { ToastProvider, useToast } from './components/ui/Toast';

const AppContent: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [authView, setAuthView] = useState<'login' | 'signup'>('login');
  const [view, setView] = useState<ViewState>('dashboard');
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [meals, setMeals] = useState<Meal[]>([]);
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  // Loading states
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Mobile log sheet
  const [showLogSheet, setShowLogSheet] = useState(false);

  const { showToast } = useToast();

  useEffect(() => {
    const currentUser = getUser();
    if (currentUser) {
      setUser(currentUser);
    }

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const currentStoredUser = getUser();
        if (!currentStoredUser || currentStoredUser.id !== session.user.id) {
          const userData: User = {
            id: session.user.id,
            email: session.user.email,
            username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'User',
            isLoggedIn: true
          }
          setUser(userData);
          saveUser(userData);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        clearUser();
        setAuthView('login');
      }
    });

    const savedTheme = getTheme();
    setTheme(savedTheme);
    document.documentElement.classList.toggle('dark', savedTheme === 'dark');

    const handleViewChange = (e: any) => {
      if (e.detail) setView(e.detail as ViewState);
    };
    window.addEventListener('changeView', handleViewChange);
    return () => {
      window.removeEventListener('changeView', handleViewChange);
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Fetch data when user logs in
  useEffect(() => {
    if (user) {
      const fetchData = async () => {
        setIsLoadingData(true);
        try {
          const [loadedWorkouts, loadedMeals] = await Promise.all([
            api.getWorkouts(),
            api.getMeals()
          ]);
          setWorkouts(loadedWorkouts);
          setMeals(loadedMeals);
        } catch (error) {
          console.error("Failed to load data", error);
          showToast("Failed to load data", "error");
        } finally {
          setIsLoadingData(false);
        }
      };
      fetchData();
    }
  }, [user]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    saveTheme(newTheme);
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
  };

  const handleLogin = (newUser: User) => {
    setUser(newUser);
  };

  const handleSignup = (newUser: User) => {
    setUser(newUser);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setView('dashboard');
    setWorkouts([]);
    setMeals([]);
  };

  const handleSaveWorkout = async (workout: Workout) => {
    setIsSaving(true);
    try {
      const savedWorkout = await api.saveWorkout(workout);
      setWorkouts(prev => [savedWorkout, ...prev]);
      setView('dashboard');
      showToast("Workout saved successfully!", "success");
    } catch (error) {
      console.error("Failed to save workout", error);
      showToast("Failed to save workout. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveMeal = async (meal: Meal) => {
    setIsSaving(true);
    try {
      const savedMeal = await api.saveMeal(meal);
      setMeals(prev => [savedMeal, ...prev]);
      setView('dashboard');
      showToast("Meal logged successfully!", "success");
    } catch (error) {
      console.error("Failed to save meal", error);
      showToast("Failed to save meal. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveCardio = async (cardio: Workout) => {
    setIsSaving(true);
    try {
      const savedCardio = await api.saveWorkout(cardio);
      setWorkouts(prev => [savedCardio, ...prev]);
      setView('dashboard');
      showToast("Cardio session saved!", "success");
    } catch (error) {
      console.error("Failed to save cardio", error);
      showToast("Failed to save cardio session. Please try again.", "error");
    } finally {
      setIsSaving(false);
    }
  };

  const renderView = () => {
    if (isLoadingData) {
      return (
        <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
          <Loader2 size={28} className="animate-spin mb-3" />
          <p className="text-sm font-medium">Loading your data...</p>
        </div>
      )
    }

    const content = (() => {
      switch (view) {
        case 'dashboard': return <Dashboard workouts={workouts} meals={meals} />;
        case 'workout': return (
          <div className="max-w-2xl mx-auto">
            {isSaving ? (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                <Loader2 size={28} className="animate-spin mb-3" />
                <p className="text-sm font-medium">Saving workout...</p>
              </div>
            ) : (
              <WorkoutLog onSave={handleSaveWorkout} />
            )}
          </div>
        );
        case 'calories': return (
          <div className="max-w-2xl mx-auto">
            {isSaving ? (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                <Loader2 size={28} className="animate-spin mb-3" />
                <p className="text-sm font-medium">Saving meal...</p>
              </div>
            ) : (
              <CalorieLog onSave={handleSaveMeal} />
            )}
          </div>
        );
        case 'cardio': return (
          <div className="max-w-2xl mx-auto">
            {isSaving ? (
              <div className="flex flex-col items-center justify-center h-64 text-zinc-400">
                <Loader2 size={28} className="animate-spin mb-3" />
                <p className="text-sm font-medium">Saving cardio...</p>
              </div>
            ) : (
              <CardioLog onSave={handleSaveCardio} />
            )}
          </div>
        );
        case 'ai': return (
          <div className="max-w-4xl mx-auto">
            <AIChat workouts={workouts} meals={meals} />
          </div>
        );
        case 'goals': return <GoalMenu />;
        default: return <Dashboard workouts={workouts} meals={meals} />;
      }
    })();

    return <div key={view} className="page-enter">{content}</div>;
  };

  const sidebarItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'workout', label: 'Workout', icon: Dumbbell },
    { id: 'cardio', label: 'Cardio', icon: Activity },
    { id: 'calories', label: 'Nutrition', icon: Utensils },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'ai', label: 'AI Coach', icon: MessageSquare },
  ];

  const mobileNavItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'log', label: 'Log', icon: Plus },
    { id: 'goals', label: 'Goals', icon: Target },
    { id: 'ai', label: 'Coach', icon: MessageSquare },
  ];

  // If not logged in, show Auth screens
  if (!user) {
    if (authView === 'signup') {
      return <Signup onSignup={handleSignup} onBackToLogin={() => setAuthView('login')} />;
    }
    return <Login onLogin={handleLogin} onShowSignup={() => setAuthView('signup')} />;
  }

  return (
    <div className="min-h-[100dvh] bg-zinc-50 dark:bg-dark text-zinc-900 dark:text-zinc-100 transition-colors duration-200">

      {/* ─── Desktop Sidebar ─── */}
      <aside className="hidden md:flex fixed left-0 top-0 bottom-0 w-[72px] hover:w-[220px] group flex-col z-40 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-all duration-300 overflow-hidden">
        {/* Brand */}
        <div className="px-5 py-6 border-b border-zinc-100 dark:border-zinc-800">
          <h1 className="text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight whitespace-nowrap">
            <span className="inline group-hover:hidden">TC</span>
            <span className="hidden group-hover:inline">TheCutRoute</span>
          </h1>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {sidebarItems.map(item => (
            <button
              key={item.id}
              onClick={() => setView(item.id as ViewState)}
              disabled={isSaving}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                view === item.id
                  ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900'
              } ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <item.icon size={20} className="flex-shrink-0" />
              <span className="sidebar-label">{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Bottom actions */}
        <div className="px-3 py-4 border-t border-zinc-100 dark:border-zinc-800 space-y-1">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all whitespace-nowrap"
          >
            {theme === 'light' ? <Moon size={20} className="flex-shrink-0" /> : <Sun size={20} className="flex-shrink-0" />}
            <span className="sidebar-label">{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all whitespace-nowrap"
          >
            <LogOut size={20} className="flex-shrink-0" />
            <span className="sidebar-label">Sign Out</span>
          </button>
        </div>
      </aside>

      {/* ─── Mobile Header ─── */}
      <header className="md:hidden sticky top-0 z-30 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-zinc-200 dark:border-zinc-800 px-5 py-3">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-extrabold text-zinc-900 dark:text-white tracking-tight">TheCutRoute</h1>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">Welcome, {user.username}</p>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors text-zinc-500"
            >
              {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
            </button>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-500 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* ─── Main Content ─── */}
      <main className="md:ml-[72px] min-h-[100dvh] pb-32 md:pb-8">
        <div className="p-4 md:p-8 max-w-6xl mx-auto">
          {/* Desktop welcome bar */}
          <div className="hidden md:flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">
                {view === 'dashboard' ? `Welcome back, ${user.username}` : sidebarItems.find(i => i.id === view)?.label}
              </h2>
              <p className="text-sm text-zinc-400 mt-0.5">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
              </p>
            </div>
          </div>

          {renderView()}
        </div>
      </main>

      {/* ─── Mobile Bottom Nav ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-t border-zinc-200 dark:border-zinc-800 px-4 pt-2 pb-[max(1.5rem,env(safe-area-inset-bottom))] z-40">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {mobileNavItems.map(item => {
            if (item.id === 'log') {
              return (
                <button
                  key={item.id}
                  onClick={() => setShowLogSheet(true)}
                  className="flex flex-col items-center gap-0.5 p-1"
                >
                  <div className="w-11 h-11 rounded-2xl bg-zinc-900 dark:bg-white flex items-center justify-center shadow-lg">
                    <Plus size={22} className="text-white dark:text-zinc-900" />
                  </div>
                  <span className="text-[10px] font-semibold text-zinc-400 mt-0.5">Log</span>
                </button>
              );
            }
            const isActive = view === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setView(item.id as ViewState)}
                disabled={isSaving}
                className={`flex flex-col items-center gap-0.5 p-1 transition-colors ${isActive ? 'text-zinc-900 dark:text-white' : 'text-zinc-400'}`}
              >
                <item.icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
                <span className="text-[10px] font-semibold">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ─── Mobile Log Sheet ─── */}
      {showLogSheet && (
        <div className="md:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setShowLogSheet(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-white dark:bg-zinc-900 rounded-t-3xl p-6 pb-10 animate-in slide-in-from-bottom duration-300">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Log Activity</h3>
              <button onClick={() => setShowLogSheet(false)} className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
                <X size={20} />
              </button>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { id: 'workout', label: 'Workout', icon: Dumbbell, desc: 'Strength training' },
                { id: 'cardio', label: 'Cardio', icon: Activity, desc: 'Running, cycling...' },
                { id: 'calories', label: 'Meal', icon: Utensils, desc: 'Log nutrition' },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => { setView(item.id as ViewState); setShowLogSheet(false); }}
                  className="flex flex-col items-center gap-2 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-100 dark:border-zinc-700 hover:border-zinc-900 dark:hover:border-white transition-all"
                >
                  <item.icon size={24} className="text-zinc-900 dark:text-white" />
                  <span className="text-sm font-semibold text-zinc-900 dark:text-white">{item.label}</span>
                  <span className="text-[11px] text-zinc-400">{item.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AppContent />
    </ToastProvider>
  );
};

export default App;