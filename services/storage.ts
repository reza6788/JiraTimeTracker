import { TimeEntry, ActiveTimer } from '../types';

const STORAGE_KEY = 'jira-time-tracker-entries';
const TIMER_KEY = 'jira-time-tracker-active-timer';

// ============================================================================
// ARCHITECTURE NOTE:
// This service acts as an abstraction layer for data persistence.
// Currently, it uses localStorage for the browser-only prototype.
//
// TO INTEGRATE POSTGRESQL:
// 1. Set up a backend API (Node/Express/Supabase) connecting to Postgres.
// 2. Replace the localStorage logic below with async fetch() calls.
// 
// Example:
// export const saveEntries = async (entries: TimeEntry[]) => {
//    await fetch('/api/time-entries', { method: 'POST', body: JSON.stringify(entries) });
// }
// ============================================================================

export const saveEntries = async (entries: TimeEntry[]): Promise<void> => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
  } catch (error) {
    console.error('Failed to save entries', error);
  }
};

export const loadEntries = async (): Promise<TimeEntry[]> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to load entries', error);
    return [];
  }
};

export const saveActiveTimer = (timer: ActiveTimer): void => {
  try {
    localStorage.setItem(TIMER_KEY, JSON.stringify(timer));
  } catch (error) {
    console.error('Failed to save active timer', error);
  }
};

export const loadActiveTimer = (): ActiveTimer | null => {
  try {
    const stored = localStorage.getItem(TIMER_KEY);
    return stored ? JSON.parse(stored) : null;
  } catch (error) {
    console.error('Failed to load active timer', error);
    return null;
  }
};

export const clearActiveTimer = (): void => {
  localStorage.removeItem(TIMER_KEY);
};