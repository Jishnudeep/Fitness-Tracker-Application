import React, { useState } from 'react';
import { Button } from './ui/Button';
import { User } from '../types';
import { LogIn, Key, User as UserIcon } from 'lucide-react';
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

    if (!email.includes('@')) {
      setError('Please enter a valid email');
      setIsLoading(false);
      return;
    }

    if (password.length < 4) {
      setError('Password is too short');
      setIsLoading(false);
      return;
    }

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
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-black p-4">
      <div className="w-full max-w-md bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200 dark:border-zinc-800 p-8 animate-in fade-in duration-700">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-zinc-900 dark:text-white tracking-tighter mb-2">
            TheCutRoute
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-sm">
            Enter your credentials to access your dashboard
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">Email</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-500 outline-none text-zinc-900 dark:text-zinc-100 transition-all"
                  placeholder="Enter your email"
                  autoComplete="email"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1.5 text-zinc-600 dark:text-zinc-400">Password</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 focus:ring-1 focus:ring-zinc-500 outline-none text-zinc-900 dark:text-zinc-100 transition-all"
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/20 p-2 rounded-lg">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full py-4 text-base font-bold shadow-lg shadow-zinc-500/10"
            disabled={isLoading}
          >
            {isLoading ? 'Signing In...' : (
              <>
                <LogIn className="mr-2" size={18} /> Sign In
              </>
            )}
          </Button>
        </form>

        <div className="mt-8 pt-6 border-t border-zinc-100 dark:border-zinc-800 text-center">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Don't have an account?{' '}
            <button
              onClick={onShowSignup}
              className="font-bold text-zinc-900 dark:text-white hover:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};