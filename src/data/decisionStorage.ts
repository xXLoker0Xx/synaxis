import AsyncStorage from '@react-native-async-storage/async-storage';
import type { DecisionContext, DecisionCategory } from '../core/decisionEngine/decisionEngine';

export interface SavedDecision {
  id: string;
  category: DecisionCategory;
  createdAt: string;
  result: DecisionContext;
}

const KEY = 'biolunar.decisions.v1';

export async function saveDecision(decision: SavedDecision): Promise<void> {
  const serialized = await AsyncStorage.getItem(KEY);
  let current: SavedDecision[] = [];
  if (serialized) {
    try {
      const parsed: unknown = JSON.parse(serialized);
      if (Array.isArray(parsed)) current = parsed as SavedDecision[];
    } catch {
      current = [];
    }
  }
  await AsyncStorage.setItem(KEY, JSON.stringify([decision, ...current].slice(0, 50)));
}
