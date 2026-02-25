import React, { useState, useEffect, useMemo } from 'react';
import DateNavigator from './components/DateNavigator';
import EntryCard from './components/EntryCard';
import CalendarView from './components/CalendarView';
import { Sparkles, PlusIcon, CalendarIcon, ListIcon } from './components/Icons';
import * as storageService from './services/storageService';
import * as geminiService from './services/geminiService';
import { DiaryEntry } from './types';

const App: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'timeline' | 'calendar'>('timeline');
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [isGenerating, setIsGenerating] = useState(false);
  const [insight, setInsight] = useState<string | null>(null);

  const dayMonth = useMemo(() => {
    const m = (currentDate.getMonth() + 1).toString().padStart(2, '0');
    const d = currentDate.getDate().toString().padStart(2, '0');
    return `${m}-${d}`;
  }, [currentDate]);

  // Load entries for current day
  useEffect(() => {
    if (viewMode === 'timeline') {
        const loaded = storageService.getEntriesForDay(currentDate.getMonth() + 1, currentDate.getDate());
        setEntries(loaded);
        setInsight(null);
    }
  }, [currentDate, refreshTrigger, viewMode]);

  const handleUpdate = () => {
    setRefreshTrigger(prev => prev + 1);
  };

  const handleManualDelete = (idToDelete: string) => {
     // Optimistically remove from UI
     setEntries(prev => prev.filter(e => e.id !== idToDelete));
     // Trigger refresh to ensure sync with DB (though optimistic update handles UI immediately)
     handleUpdate();
  };

  const handleAddEntry = () => {
    const currentYear = new Date().getFullYear();
    const existingYears = new Set(entries.map(e => e.year));
    
    let suggestedYear = currentYear;
    while (existingYears.has(suggestedYear)) {
        suggestedYear--;
    }

    const newEntry: DiaryEntry = {
        id: crypto.randomUUID(),
        dayMonth,
        year: suggestedYear,
        content: '',
        lastEdited: 0
    };

    setEntries(prev => [newEntry, ...prev].sort((a, b) => b.year - a.year));
  };

  const generateInsight = async () => {
    setIsGenerating(true);
    try {
      const currentEntries = storageService.getEntriesForDay(currentDate.getMonth() + 1, currentDate.getDate());
      const result = await geminiService.generateTimeCapsuleInsight(dayMonth, currentEntries);
      setInsight(result);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-paper relative">
      
      {/* View Switcher Button */}
      <div className="fixed top-6 right-4 z-50">
        <button 
            onClick={() => setViewMode(prev => prev === 'timeline' ? 'calendar' : 'timeline')}
            className="bg-white/80 backdrop-blur-md p-3 rounded-full shadow-sm hover:shadow-md border border-stone-200 text-stone-500 hover:text-accent transition-all"
            title={viewMode === 'timeline' ? "View Calendar" : "View Timeline"}
        >
            {viewMode === 'timeline' ? <CalendarIcon className="w-5 h-5" /> : <ListIcon className="w-5 h-5" />}
        </button>
      </div>

      {viewMode === 'timeline' ? (
        <>
            <DateNavigator currentDate={currentDate} onDateChange={setCurrentDate} />

            <div className="flex-1 overflow-y-auto no-scrollbar pb-32">
                <main className="max-w-2xl mx-auto px-4 w-full flex flex-col gap-6 pt-4">
                
                <div className="flex justify-between items-center px-1 mb-2">
                    <h2 className="text-sm font-serif text-stone-400 italic">Timeline</h2>
                </div>

                {entries.length === 0 ? (
                    <div className="text-center py-20 opacity-40">
                        <p className="font-serif text-xl mb-2">No memories yet.</p>
                        <p className="text-sm">Click the + button to start a ring.</p>
                    </div>
                ) : (
                    entries.map((entry) => (
                        <EntryCard
                            key={entry.id}
                            dayMonth={dayMonth}
                            initialData={entry}
                            onUpdate={handleUpdate}
                            onDelete={handleManualDelete}
                        />
                    ))
                )}

                {/* AI Insight Section */}
                <div className="mt-4 mb-8">
                    {insight ? (
                    <div className="bg-gradient-to-br from-stone-50 to-stone-100 rounded-2xl p-6 border border-stone-200 shadow-inner relative overflow-hidden animate-in fade-in duration-700">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Sparkles className="w-24 h-24 text-accent" />
                        </div>
                        <h3 className="font-serif text-xl font-medium text-accent mb-3 flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            Time Patterns
                        </h3>
                        <p className="text-stone-600 leading-relaxed font-serif whitespace-pre-wrap">{insight}</p>
                        <button onClick={() => setInsight(null)} className="mt-4 text-xs text-stone-400 hover:text-stone-600">Close</button>
                    </div>
                    ) : (
                        entries.filter(e => e.content.length > 5).length >= 2 && (
                            <div className="flex justify-center">
                                <button
                                    onClick={generateInsight}
                                    disabled={isGenerating}
                                    className={`
                                        group relative overflow-hidden
                                        bg-white hover:bg-stone-50
                                        border border-stone-200 text-stone-500 hover:text-accent
                                        px-6 py-3 rounded-full shadow-sm
                                        transition-all duration-300
                                        flex items-center gap-2 text-sm font-medium tracking-wide
                                        ${isGenerating ? 'opacity-70 cursor-wait' : ''}
                                    `}
                                >
                                    <Sparkles className={`w-4 h-4 ${isGenerating ? 'animate-pulse' : 'group-hover:rotate-12 transition-transform'}`} />
                                    {isGenerating ? 'Connecting dots...' : 'Find patterns across years'}
                                </button>
                            </div>
                        )
                    )}
                </div>
                </main>
            </div>

            {/* Floating Action Button */}
            <div className="absolute bottom-8 right-6 md:right-1/4 z-20">
                <button
                    onClick={handleAddEntry}
                    className="bg-accent text-white p-4 rounded-full shadow-lg hover:bg-stone-600 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group"
                >
                    <PlusIcon className="w-8 h-8 group-hover:rotate-90 transition-transform" />
                </button>
            </div>

            {/* Decorative vertical line */}
            <div className="fixed top-0 bottom-0 left-1/2 -translate-x-1/2 w-px bg-stone-200 -z-0 hidden md:block pointer-events-none opacity-40"></div>
        </>
      ) : (
          <CalendarView 
            initialDate={currentDate} 
            onSelectDate={(date) => {
                setCurrentDate(date);
                setViewMode('timeline');
            }} 
          />
      )}

    </div>
  );
};

export default App;