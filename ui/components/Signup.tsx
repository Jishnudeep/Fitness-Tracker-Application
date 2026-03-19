import React, { useState } from 'react';
import { Button } from './ui/Button';
import { User } from '../types';
import { UserPlus, Key, Mail, User as UserIcon, ArrowLeft, Dumbbell } from 'lucide-react';
import { api } from '../services/api';

interface SignupProps {
    onSignup: (user: User) => void;
    onBackToLogin: () => void;
}

export const Signup: React.FC<SignupProps> = ({ onSignup, onBackToLogin }) => {
    const [email, setEmail] = useState('');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        if (!email.includes('@')) { setError('Please enter a valid email'); setIsLoading(false); return; }
        if (username.trim().length < 3) { setError('Username must be at least 3 characters'); setIsLoading(false); return; }
        if (password.length < 4) { setError('Password must be at least 4 characters'); setIsLoading(false); return; }
        if (password !== confirmPassword) { setError('Passwords do not match'); setIsLoading(false); return; }

        try {
            const user = await api.signup(email, password, username);
            onSignup(user);
        } catch (err: any) {
            setError(err.message || 'Signup failed');
        } finally { setIsLoading(false); }
    };

    const inputClass = "w-full pl-10 pr-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl text-sm font-medium outline-none focus:border-zinc-400 dark:focus:border-zinc-500 transition-colors";

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-dark p-4">
            <div className="w-full max-w-sm page-enter">

                {/* Brand */}
                <div className="text-center mb-10">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 flex items-center justify-center mx-auto mb-4 shadow-lg">
                        <Dumbbell size={28} />
                    </div>
                    <h1 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight">TheCutRoute</h1>
                    <p className="text-sm text-zinc-400 mt-1">Create your account</p>
                </div>

                {/* Form card */}
                <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-sm">
                    <button onClick={onBackToLogin}
                        className="flex items-center gap-1 text-sm text-zinc-400 hover:text-zinc-900 dark:hover:text-white mb-5 transition-colors font-medium">
                        <ArrowLeft size={14} /> Back to Login
                    </button>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-500 ml-1">Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                                    className={inputClass} placeholder="you@email.com" autoComplete="email" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-500 ml-1">Username</label>
                            <div className="relative">
                                <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)}
                                    className={inputClass} placeholder="Choose a username" autoComplete="username" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-500 ml-1">Password</label>
                            <div className="relative">
                                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                                    className={inputClass} placeholder="Create a password" autoComplete="new-password" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-semibold text-zinc-500 ml-1">Confirm Password</label>
                            <div className="relative">
                                <Key className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
                                <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)}
                                    className={inputClass} placeholder="Confirm password" autoComplete="new-password" />
                            </div>
                        </div>

                        {error && (
                            <div className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-900/20 p-3 rounded-xl font-medium">{error}</div>
                        )}

                        <Button type="submit" loading={isLoading} size="lg" className="w-full">
                            <UserPlus size={18} /> Sign Up
                        </Button>
                    </form>
                </div>
            </div>
        </div>
    );
};
