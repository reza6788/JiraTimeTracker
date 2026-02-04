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

const API_URL = '/api/entries';

export const loadEntries = async (): Promise<TimeEntry[]> => {
  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch entries');
    return await response.json();
  } catch (error) {
    console.error('Failed to load entries from API', error);
    return [];
  }
};

export const addEntry = async (entry: TimeEntry): Promise<TimeEntry | null> => {
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
    if (!response.ok) throw new Error('Failed to save entry');
    return await response.json();
  } catch (error) {
    console.error('Failed to add entry', error);
    return null;
  }
};

export const deleteEntry = async (id: string): Promise<boolean> => {
  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  } catch (error) {
    console.error('Failed to delete entry', error);
    return false;
  }
};

export const saveEntries = async (entries: TimeEntry[]): Promise<void> => {
  // Deprecated: bulk save is not efficient for DB. 
  // Kept empty to prevent errors if still called, but logic should move to addEntry/deleteEntry.
  console.warn('saveEntries (bulk) is deprecated. Use addEntry/deleteEntry instead.');
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