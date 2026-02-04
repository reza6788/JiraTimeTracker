export interface TimeEntry {
  id: string;
  ticketId: string;
  description: string;
  durationMinutes: number;
  timestamp: number; // Epoch time
}

export interface ActiveTimer {
  startTime: number;
  ticketId: string;
  description: string;
}

export enum ViewState {
  LOG_TIME = 'LOG_TIME',
  HISTORY = 'HISTORY',
  REPORTS = 'REPORTS'
}

export interface ReportConfig {
  includeWeekend: boolean;
  tone: 'professional' | 'casual' | 'bullet-points';
}