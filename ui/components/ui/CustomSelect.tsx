import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

interface Option {
    label: string;
    value: string;
}

interface CustomSelectProps {
    options: (string | Option)[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export const CustomSelect: React.FC<CustomSelectProps> = ({ options, value, onChange, placeholder, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const normalizedOptions = options.map(opt =>
        typeof opt === 'string' ? { label: opt, value: opt } : opt
    );

    const selectedOption = normalizedOptions.find(opt => opt.value === value);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full flex items-center justify-between px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border rounded-xl text-sm font-medium outline-none transition-all duration-200 ${
                    isOpen 
                        ? 'border-zinc-400 dark:border-zinc-500 ring-2 ring-zinc-200 dark:ring-zinc-700' 
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
            >
                <span className={selectedOption ? "text-zinc-900 dark:text-white" : "text-zinc-400"}>
                    {selectedOption ? selectedOption.label : placeholder || "Select..."}
                </span>
                <ChevronDown size={16} className={`text-zinc-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 right-0 mt-1.5 z-[100] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl p-1.5 animate-in zoom-in-95 fade-in duration-150">
                    {normalizedOptions.map((opt) => (
                        <button
                            key={opt.value}
                            onClick={() => {
                                onChange(opt.value);
                                setIsOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 flex items-center justify-between ${value === opt.value
                                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-white'
                                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-600 dark:text-zinc-400'
                                }`}
                        >
                            {opt.label}
                            {value === opt.value && <Check size={14} className="text-zinc-900 dark:text-white" />}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};
