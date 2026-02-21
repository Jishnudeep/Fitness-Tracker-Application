import React, { useState, useRef, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from 'lucide-react';

interface CustomDatePickerProps {
    value: string; // YYYY-MM-DD
    onChange: (value: string) => void;
    className?: string;
}

export const CustomDatePicker: React.FC<CustomDatePickerProps> = ({ value, onChange, className }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(value ? new Date(value) : new Date());
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

    const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();

    const handlePrevMonth = () => setViewDate(new Date(currentYear, currentMonth - 1, 1));
    const handleNextMonth = () => setViewDate(new Date(currentYear, currentMonth + 1, 1));

    const handleDateSelect = (day: number) => {
        const selectedDate = new Date(currentYear, currentMonth, day);
        // Correct for timezone offset to ensure YYYY-MM-DD matches local date
        const offset = selectedDate.getTimezoneOffset();
        const localDate = new Date(selectedDate.getTime() - (offset * 60 * 1000));
        onChange(localDate.toISOString().split('T')[0]);
        setIsOpen(false);
    };

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "Select date...";
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    };

    const days = [];
    const totalDays = daysInMonth(currentYear, currentMonth);
    const firstDay = firstDayOfMonth(currentYear, currentMonth);

    // Empty slots for previous month
    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-10 w-10"></div>);
    }

    // Actual days
    for (let i = 1; i <= totalDays; i++) {
        const isSelected = value === new Date(currentYear, currentMonth, i).toISOString().split('T')[0];
        const isToday = new Date().toISOString().split('T')[0] === new Date(currentYear, currentMonth, i).toISOString().split('T')[0];

        days.push(
            <button
                key={i}
                type="button"
                onClick={() => handleDateSelect(i)}
                className={`h-10 w-10 rounded-xl text-[10px] font-black transition-all flex items-center justify-center ${isSelected
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-black scale-110 shadow-lg'
                    : isToday
                        ? 'border border-zinc-900 dark:border-white text-zinc-900 dark:text-white'
                        : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                    }`}
            >
                {i}
            </button>
        );
    }

    return (
        <div className={`relative ${className}`} ref={containerRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center gap-4 px-4 py-3.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 rounded-2xl text-xs font-bold outline-none transition-all group hover:border-zinc-400 dark:hover:border-zinc-700"
            >
                <CalendarIcon size={16} className="text-zinc-400" />
                <span className={value ? "text-zinc-900 dark:text-white" : "text-zinc-400"}>
                    {formatDate(value)}
                </span>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-2 z-[110] bg-white dark:bg-black border border-zinc-200 dark:border-zinc-800 rounded-[2rem] shadow-2xl p-6 w-80 animate-in zoom-in-95 slide-in-from-top-2 duration-300">
                    <div className="flex items-center justify-between mb-6">
                        <button type="button" onClick={handlePrevMonth} className="w-10 h-10 flex items-center justify-center rounded-xl bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all">
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-xs font-black uppercase tracking-widest text-zinc-900 dark:text-white">
                            {months[currentMonth]} {currentYear}
                        </span>
                        <button type="button" onClick={handleNextMonth} className="w-10 h-10 flex items-center justify-center rounded-xl bg-transparent hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all">
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                            <div key={d} className="h-10 w-10 flex items-center justify-center text-[9px] font-black text-zinc-400 uppercase tracking-tighter">
                                {d}
                            </div>
                        ))}
                        {days}
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                const today = new Date();
                                onChange(today.toISOString().split('T')[0]);
                                setViewDate(today);
                                setIsOpen(false);
                            }}
                            className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 dark:hover:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900 px-3 py-1.5 rounded-lg transition-all"
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
