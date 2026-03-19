import React, { useState } from 'react';
import { Button } from './ui/Button';
import { User } from '../types';
import { Mail, Key, LogIn, Dumbbell } from 'lucide-react';
import { api } from '../services/api';

interface LoginProps {
  onLogin: (user: User) => void;
  onShowSignup: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin, onShowSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      const user = await api.login(email, password);
      onLogin(user);
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-dark p-4">
      <div className="w-full max-w-sm page-enter">

        {/* Brand */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <Dumbbell size={28} />
          </div>
          <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">TheCutRoute</h1>
          <p className="text-sm text-zinc-400 mt-1">Welcome back</p>
        </div>

        {/* Form card */}
        <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                  placeholder="you@email.com" autoComplete="email" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-zinc-500 ml-1">Password</label>
              <div className="relative">
                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors"
                  placeholder="••••••••" autoComplete="current-password" />
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-xl font-medium">
                {error}
              </div>
            )}

            <Button type="submit" loading={isLoading} size="lg" className="w-full">
              <LogIn size={18} /> Sign In
            </Button>
          </form>

          <div className="mt-5 pt-5 border-t border-zinc-100 dark:border-zinc-800 text-center">
            <p className="text-sm text-zinc-400">
              Don't have an account?{' '}
              <button onClick={onShowSignup} className="font-semibold text-zinc-900 dark:text-white hover:underline">Sign Up</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};