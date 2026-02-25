import React from 'react';
import { ChevronLeft, ChevronRight, CalendarIcon } from './Icons';

interface DateNavigatorProps {
  currentDate: Date;
  onDateChange: (date: Date) => void;
}

const DateNavigator: React.FC<DateNavigatorProps> = ({ currentDate, onDateChange }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', { month: 'long', day: 'numeric' }).format(date);
  };

  const changeDay = (days: number) => {
    const newDate = new Date(currentDate);
    newDate.setDate(currentDate.getDate() + days);
    onDateChange(newDate);
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.getDate() === today.getDate() && date.getMonth() === today.getMonth();
  };

  return (
    <div className="sticky top-0 z-10 bg-paper/95 backdrop-blur-sm border-b border-stone-200/60 pb-4 pt-6 px-4 mb-6 shadow-[0_4px_20px_-12px_rgba(0,0,0,0.05)]">
      <div className="max-w-xl mx-auto flex items-center justify-between">
        
        <button 
          onClick={() => changeDay(-1)}
          className="p-2 rounded-full hover:bg-white hover:shadow-sm text-stone-500 hover:text-ink transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="flex flex-col items-center">
            <h2 className="font-serif text-3xl font-medium text-ink tracking-tight flex items-center gap-2">
                {formatDate(currentDate)}
            </h2>
            {isToday(currentDate) && (
                <span className="text-xs font-bold text-accent tracking-widest uppercase mt-1">Today</span>
            )}
        </div>

        <button 
          onClick={() => changeDay(1)}
          className="p-2 rounded-full hover:bg-white hover:shadow-sm text-stone-500 hover:text-ink transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

      </div>
      
      {/* Decorative timeline circles */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-accent rounded-full hidden md:block"></div>
    </div>
  );
};

export default DateNavigator;