import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, AnnualRingGraph } from './Icons';
import * as storageService from '../services/storageService';

interface CalendarViewProps {
  onSelectDate: (date: Date) => void;
  initialDate: Date;
}

const CalendarView: React.FC<CalendarViewProps> = ({ onSelectDate, initialDate }) => {
  const [currentMonth, setCurrentMonth] = useState(initialDate.getMonth());
  // Counts map: Day -> Number of entries
  const [counts, setCounts] = useState<Record<number, number>>({});

  useEffect(() => {
    // Month is 0-indexed in JS Date, but 1-indexed in our storage
    const data = storageService.getEntryCountsForMonth(currentMonth + 1);
    setCounts(data);
  }, [currentMonth]);

  const daysInMonth = new Date(2024, currentMonth + 1, 0).getDate(); // Using leap year 2024 to allow 29 days in Feb generally
  const monthName = new Date(2024, currentMonth).toLocaleString('en-US', { month: 'long' });

  const handleMonthChange = (delta: number) => {
    let newMonth = currentMonth + delta;
    if (newMonth > 11) newMonth = 0;
    if (newMonth < 0) newMonth = 11;
    setCurrentMonth(newMonth);
  };

  const handleDayClick = (day: number) => {
    const newDate = new Date();
    newDate.setMonth(currentMonth);
    newDate.setDate(day);
    onSelectDate(newDate);
  };

  return (
    <div className="flex flex-col h-full bg-paper pt-6">
      {/* Month Navigator */}
      <div className="flex items-center justify-between px-8 mb-8">
        <button 
          onClick={() => handleMonthChange(-1)}
          className="p-2 rounded-full hover:bg-white text-stone-400 hover:text-ink transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <h2 className="font-serif text-3xl text-ink font-medium tracking-wide">
          {monthName}
        </h2>
        <button 
          onClick={() => handleMonthChange(1)}
          className="p-2 rounded-full hover:bg-white text-stone-400 hover:text-ink transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-20">
        <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-7 gap-3 max-w-3xl mx-auto">
          {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
            const count = counts[day] || 0;
            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                className={`
                  aspect-square rounded-2xl border flex flex-col items-center justify-between p-2 transition-all duration-300
                  ${count > 0 
                    ? 'bg-white border-accent/30 hover:shadow-md hover:border-accent' 
                    : 'bg-transparent border-stone-200/50 hover:bg-stone-50'
                  }
                `}
              >
                <span className={`text-sm font-serif ${count > 0 ? 'text-ink font-bold' : 'text-stone-300'}`}>
                  {day}
                </span>
                
                <div className="flex-1 w-full h-full flex items-center justify-center p-1">
                  {count === 0 ? (
                      <div className="w-1 h-1 rounded-full bg-stone-200" />
                  ) : (
                      <AnnualRingGraph count={count} className="w-full h-full text-accent" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;