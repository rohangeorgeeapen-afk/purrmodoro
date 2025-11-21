import { TimerMode } from './types';

export const DEFAULT_SETTINGS = {
  workDuration: 25 * 60,
  shortBreakDuration: 5 * 60,
  longBreakDuration: 15 * 60,
};

export const MODE_LABELS: Record<TimerMode, string> = {
  [TimerMode.WORK]: 'Focus Time',
  [TimerMode.SHORT_BREAK]: 'Short Break',
  [TimerMode.LONG_BREAK]: 'Long Break',
};

export const MODE_COLORS: Record<TimerMode, string> = {
  [TimerMode.WORK]: 'bg-pastel-pink',
  [TimerMode.SHORT_BREAK]: 'bg-pastel-blue',
  [TimerMode.LONG_BREAK]: 'bg-pastel-yellow',
};

export const GEMINI_MODEL = 'gemini-2.5-flash';