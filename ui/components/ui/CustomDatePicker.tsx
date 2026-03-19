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

    for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-9 w-9"></div>);
    }

    for (let i = 1; i <= totalDays; i++) {
        const dateStr = new Date(currentYear, currentMonth, i).toISOString().split('T')[0];
        const isSelected = value === dateStr;
        const isToday = new Date().toISOString().split('T')[0] === dateStr;

        days.push(
            <button
                key={i}
                type="button"
                onClick={() => handleDateSelect(i)}
                className={`h-9 w-9 rounded-lg text-xs font-medium transition-all duration-150 flex items-center justify-center ${isSelected
                    ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 shadow-sm'
                    : isToday
                        ? 'ring-1 ring-zinc-900 dark:ring-white text-zinc-900 dark:text-white font-semibold'
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
                className={`w-full flex items-center gap-3 px-4 py-3 bg-zinc-50 dark:bg-zinc-900 border rounded-xl text-sm font-medium outline-none transition-all duration-200 ${
                    isOpen
                        ? 'border-zinc-400 dark:border-zinc-500 ring-2 ring-zinc-200 dark:ring-zinc-700'
                        : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
            >
                <CalendarIcon size={16} className="text-zinc-400 flex-shrink-0" />
                <span className={value ? "text-zinc-900 dark:text-white" : "text-zinc-400"}>
                    {formatDate(value)}
                </span>
            </button>

            {isOpen && (
                <div className="absolute top-full left-0 mt-1.5 z-[110] bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-2xl shadow-xl p-5 w-[300px] animate-in zoom-in-95 fade-in duration-150">
                    <div className="flex items-center justify-between mb-4">
                        <button type="button" onClick={handlePrevMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                            <ChevronLeft size={16} />
                        </button>
                        <span className="text-sm font-semibold text-zinc-900 dark:text-white">
                            {months[currentMonth]} {currentYear}
                        </span>
                        <button type="button" onClick={handleNextMonth} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors">
                            <ChevronRight size={16} />
                        </button>
                    </div>

                    <div className="grid grid-cols-7 gap-0.5 mb-1">
                        {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map(d => (
                            <div key={d} className="h-9 w-9 flex items-center justify-center text-[11px] font-medium text-zinc-400">
                                {d}
                            </div>
                        ))}
                        {days}
                    </div>

                    <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex justify-end">
                        <button
                            type="button"
                            onClick={() => {
                                const today = new Date();
                                onChange(today.toISOString().split('T')[0]);
                                setViewDate(today);
                                setIsOpen(false);
                            }}
                            className="text-xs font-semibold text-zinc-500 hover:text-zinc-900 dark:hover:text-white px-3 py-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};
