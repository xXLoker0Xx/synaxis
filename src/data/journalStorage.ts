import AsyncStorage from '@react-native-async-storage/async-storage';

export interface DailyLog {
  id: string;
  date: string;
  sleepHours: number;
  sunlightMinutes: number;
  reflection: string;
}

const LOGS_KEY = 'biolunar.daily-logs.v1';

export async function readDailyLogs(): Promise<DailyLog[]> {
  const serialized = await AsyncStorage.getItem(LOGS_KEY);
  if (!serialized) return [];
  try {
    const parsed: unknown = JSON.parse(serialized);
    return Array.isArray(parsed) ? parsed as DailyLog[] : [];
  } catch {
    return [];
  }
}

export async function saveDailyLog(log: DailyLog): Promise<DailyLog[]> {
  const existing = await readDailyLogs();
  const updated = [log, ...existing.filter((item) => item.date !== log.date)];
  await AsyncStorage.setItem(LOGS_KEY, JSON.stringify(updated));
  return updated;
}
