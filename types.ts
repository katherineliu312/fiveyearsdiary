export interface DiaryEntry {
  id: string;
  dayMonth: string; // Format "MM-DD"
  year: number;
  content: string;
  mood?: string; // Emoji
  lastEdited: number;
}

export type MoodOption = {
  emoji: string;
  label: string;
  color: string;
};

export interface DailyInsight {
  date: string;
  insight: string;
}

// Map of "MM-DD" to Year to Entry
export type DiaryDatabase = Record<string, Record<number, DiaryEntry>>;

export const MOODS: MoodOption[] = [
  { emoji: '☀️', label: 'Sunny', color: 'bg-amber-100 text-amber-600' },
  { emoji: '☁️', label: 'Cloudy', color: 'bg-gray-100 text-gray-600' },
  { emoji: '🌧️', label: 'Rainy', color: 'bg-blue-100 text-blue-600' },
  { emoji: '🌱', label: 'Growing', color: 'bg-green-100 text-green-600' },
  { emoji: '✨', label: 'Inspired', color: 'bg-purple-100 text-purple-600' },
  { emoji: '🍵', label: 'Calm', color: 'bg-teal-100 text-teal-600' },
  { emoji: '🔥', label: 'Active', color: 'bg-orange-100 text-orange-600' },
  { emoji: '🌚', label: 'Tired', color: 'bg-slate-100 text-slate-600' },
];

export const INSPIRATION_PROMPTS = [
  "What happened on this day?",
  "What made you smile today?",
  "What was the weather like?",
  "A delicious meal you had?",
  "A song that fits today's mood?",
  "Who did you meet today?",
  "A thought that crossed your mind?",
  "Something you are grateful for?",
  "A challenge you faced?",
  "What are you looking forward to?",
  "Describe the sky today.",
  "A small achievement?",
];