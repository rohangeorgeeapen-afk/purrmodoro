export enum TimerMode {
  WORK = 'WORK',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK',
}

export interface QuoteResponse {
  text: string;
  mood: 'happy' | 'sleepy' | 'focused' | 'playful';
}

export interface Settings {
  workDuration: number;
  shortBreakDuration: number;
  longBreakDuration: number;
}