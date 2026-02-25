import React, { useState, useEffect, useRef, useMemo } from 'react';
import { DiaryEntry, MOODS, INSPIRATION_PROMPTS } from '../types';
import * as storageService from '../services/storageService';
import { TrashIcon } from './Icons';

interface EntryCardProps {
  dayMonth: string;
  initialData: DiaryEntry;
  onUpdate: () => void;
  onDelete: (id: string) => void;
}

const EntryCard: React.FC<EntryCardProps> = ({ dayMonth, initialData, onUpdate, onDelete }) => {
  const [year, setYear] = useState(initialData.year);
  const [content, setContent] = useState(initialData.content || '');
  const [mood, setMood] = useState<string | undefined>(initialData.mood);
  const [isFocused, setIsFocused] = useState(false);
  
  // If the entry has no content yet, allow editing the year by default
  const [isEditingYear, setIsEditingYear] = useState(!initialData.content && !initialData.mood);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Pick a random prompt when the component mounts
  const randomPrompt = useMemo(() => {
    return INSPIRATION_PROMPTS[Math.floor(Math.random() * INSPIRATION_PROMPTS.length)];
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [content]);

  // Sync with initialData if props change externally
  useEffect(() => {
    setYear(initialData.year);
    setContent(initialData.content);
    setMood(initialData.mood);
  }, [initialData]);

  const handleSave = (newYear: number, newContent: string, newMood: string | undefined) => {
    // If user changed year, we need to delete the OLD year entry from storage first to avoid duplicates
    if (newYear !== initialData.year) {
        storageService.deleteEntry(
            parseInt(dayMonth.split('-')[0]),
            parseInt(dayMonth.split('-')[1]),
            initialData.year
        );
    }

    const entry: DiaryEntry = {
      id: initialData.id,
      dayMonth,
      year: newYear,
      content: newContent,
      mood: newMood,
      lastEdited: Date.now(),
    };

    storageService.saveEntry(entry);
    onUpdate();
  };

  // Debounce save
  useEffect(() => {
    const timer = setTimeout(() => {
      // Only save if dirty
      if (
        content !== initialData.content || 
        mood !== initialData.mood || 
        year !== initialData.year
      ) {
         handleSave(year, content, mood);
      }
    }, 800);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [content, mood, year]);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    e.preventDefault();
    
    // Immediate deletion logic without confirmation ("at will")
    const month = parseInt(dayMonth.split('-')[0]);
    const day = parseInt(dayMonth.split('-')[1]);

    // Delete from storage based on initial loaded year
    storageService.deleteEntry(month, day, initialData.year);
    
    // Also try to delete using current year state if it differs (handle rename edge case)
    if (year !== initialData.year) {
        storageService.deleteEntry(month, day, year);
    }
    
    // Trigger UI removal
    onDelete(initialData.id);
  };

  return (
    <div 
      className={`
        relative group transition-all duration-500 ease-out
        bg-white rounded-xl border border-stone-200 
        ${isFocused ? 'shadow-lg ring-1 ring-accent/40 scale-[1.01]' : 'shadow-sm hover:shadow-md'}
        p-6 flex flex-col gap-4
      `}
    >
      {/* Delete button positioned absolute top-right for easy access */}
      <button 
        onClick={handleDelete}
        className="absolute top-4 right-4 z-20 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity p-2 text-stone-300 hover:text-red-400 hover:bg-red-50 rounded-full"
        title="Delete memory"
        type="button"
      >
        <TrashIcon className="w-4 h-4" />
      </button>

      {/* Header: Year & Mood */}
      <div className="flex justify-between items-start border-b border-stone-100 pb-3 pr-8">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 relative z-10">
            {isEditingYear ? (
              <input
                type="number"
                value={year}
                onChange={(e) => setYear(parseInt(e.target.value) || year)}
                onBlur={() => setIsEditingYear(false)}
                className="font-serif text-3xl font-bold text-ink w-24 bg-stone-50 rounded px-1 outline-none focus:ring-1 focus:ring-accent"
                autoFocus
                placeholder="Year"
              />
            ) : (
              <h3 
                onClick={() => setIsEditingYear(true)}
                className="font-serif text-3xl font-bold text-accent cursor-pointer hover:text-stone-600 transition-colors"
                title="Click to edit year"
              >
                {year}
              </h3>
            )}
          </div>
          
          <span className="text-[10px] text-stone-400 font-medium tracking-widest uppercase ml-1">
            {initialData.lastEdited ? 'Saved' : 'New Entry'}
          </span>
        </div>

        {/* Mood Selector */}
        <div className="relative pt-1 z-10">
            <div className="flex gap-1 justify-end">
                {mood ? (
                    <button 
                        onClick={() => setMood(undefined)}
                        className="text-2xl hover:scale-110 transition-transform"
                    >
                        {mood}
                    </button>
                ) : (
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 flex-wrap justify-end max-w-[150px]">
                        {MOODS.slice(0, 5).map((m) => (
                            <button
                                key={m.label}
                                onClick={() => setMood(m.emoji)}
                                className="text-xl hover:scale-125 transition-transform p-0.5"
                                title={m.label}
                            >
                                {m.emoji}
                            </button>
                        ))}
                    </div>
                )}
            </div>
        </div>
      </div>

      {/* Input Area */}
      <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={randomPrompt}
            className="w-full resize-none outline-none bg-transparent text-lg leading-relaxed text-ink placeholder:text-stone-300 placeholder:italic min-h-[80px]"
            rows={2}
          />
      </div>
      
      {/* Decorative Line */}
      <div className="absolute -left-3 top-8 bottom-8 w-1 bg-gradient-to-b from-stone-200 to-transparent rounded-full hidden md:block opacity-40"></div>
    </div>
  );
};

export default EntryCard;