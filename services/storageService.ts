import { DiaryDatabase, DiaryEntry } from '../types';

const STORAGE_KEY = 'chronolog_data_v1';

const getDB = (): DiaryDatabase => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    console.error("Failed to load diary data", e);
    return {};
  }
};

const saveDB = (db: DiaryDatabase) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Failed to save diary data", e);
  }
};

export const getEntryForDate = (month: number, day: number, year: number): DiaryEntry | null => {
  const db = getDB();
  const dateKey = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  return db[dateKey]?.[year] || null;
};

export const getEntriesForDay = (month: number, day: number): DiaryEntry[] => {
  const db = getDB();
  const dateKey = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  const yearMap = db[dateKey];
  if (!yearMap) return [];
  return Object.values(yearMap).sort((a, b) => b.year - a.year);
};

export const saveEntry = (entry: DiaryEntry): void => {
  const db = getDB();
  const dateKey = entry.dayMonth;
  
  if (!db[dateKey]) {
    db[dateKey] = {};
  }
  
  db[dateKey][entry.year] = entry;
  saveDB(db);
};

export const deleteEntry = (month: number, day: number, year: number): void => {
  const db = getDB();
  const dateKey = `${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
  if (db[dateKey] && db[dateKey][year]) {
    delete db[dateKey][year];
    saveDB(db);
  }
};

/**
 * Returns a map of Day -> Count of entries for a specific month.
 * Key: day number (1-31), Value: count of entries across all years.
 */
export const getEntryCountsForMonth = (month: number): Record<number, number> => {
    const db = getDB();
    const result: Record<number, number> = {};
    const monthPrefix = month.toString().padStart(2, '0');

    // Key format is "MM-DD"
    Object.keys(db).forEach(key => {
        const [m, d] = key.split('-');
        if (m === monthPrefix) {
            const dayNum = parseInt(d);
            // Count how many years have entries
            const count = Object.keys(db[key]).length;
            if (count > 0) {
                result[dayNum] = count;
            }
        }
    });

    return result;
};