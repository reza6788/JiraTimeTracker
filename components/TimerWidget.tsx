import React, { useState, useEffect, useRef } from 'react';
import { TimeEntry, ActiveTimer } from '../types';
import { Button } from './Button';
import { Play, Square, Hash, FileText, Clock } from 'lucide-react';
import { saveActiveTimer, loadActiveTimer, clearActiveTimer } from '../services/storage';

interface TimerWidgetProps {
  onStopTimer: (entry: TimeEntry) => void;
}

export const TimerWidget: React.FC<TimerWidgetProps> = ({ onStopTimer }) => {
  const [activeTimer, setActiveTimer] = useState<ActiveTimer | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  
  // Form inputs for new timer
  const [ticketId, setTicketId] = useState('');
  const [description, setDescription] = useState('');

  const intervalRef = useRef<number | null>(null);

  // Load active timer on mount
  useEffect(() => {
    const savedTimer = loadActiveTimer();
    if (savedTimer) {
      setActiveTimer(savedTimer);
      setTicketId(savedTimer.ticketId);
      setDescription(savedTimer.description);
      // Calculate elapsed time immediately so we don't wait 1s for update
      setElapsedSeconds(Math.floor((Date.now() - savedTimer.startTime) / 1000));
    }
  }, []);

  // Timer tick logic
  useEffect(() => {
    if (activeTimer) {
      intervalRef.current = window.setInterval(() => {
        const seconds = Math.floor((Date.now() - activeTimer.startTime) / 1000);
        setElapsedSeconds(seconds);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setElapsedSeconds(0);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [activeTimer]);

  const handleStart = () => {
    if (!ticketId) {
      alert("Please enter a Ticket ID before starting.");
      return;
    }

    const newTimer: ActiveTimer = {
      startTime: Date.now(),
      ticketId: ticketId.toUpperCase().trim(),
      description: description
    };

    setActiveTimer(newTimer);
    saveActiveTimer(newTimer);
  };

  const handleStop = () => {
    if (!activeTimer) return;

    const endTime = Date.now();
    const durationMinutes = Math.max(1, Math.round((endTime - activeTimer.startTime) / 1000 / 60));

    const newEntry: TimeEntry = {
      id: crypto.randomUUID(),
      ticketId: activeTimer.ticketId,
      description: activeTimer.description || 'Worked on ticket',
      durationMinutes: durationMinutes,
      timestamp: activeTimer.startTime 
    };

    onStopTimer(newEntry);
    
    // Cleanup
    setActiveTimer(null);
    clearActiveTimer();
    setTicketId('');
    setDescription('');
    setElapsedSeconds(0);
  };

  const formatTime = (totalSeconds: number) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-lg relative overflow-hidden">
      {/* Background decoration */}
      <div className={`absolute top-0 left-0 w-1 h-full transition-colors duration-300 ${activeTimer ? 'bg-green-500' : 'bg-indigo-500'}`}></div>
      
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Timer Display */}
        <div className="flex flex-col items-center md:items-start min-w-[140px]">
          <span className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-1">
            {activeTimer ? 'Running' : 'Timer'}
          </span>
          <div className={`text-4xl font-mono font-bold tracking-tight ${activeTimer ? 'text-green-600' : 'text-gray-700'}`}>
            {formatTime(elapsedSeconds)}
          </div>
        </div>

        {/* Inputs */}
        <div className="flex-1 w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Hash className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              disabled={!!activeTimer}
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="Ticket ID (e.g. JIRA-123)"
              className="pl-10 block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors uppercase"
            />
          </div>
          <div className="relative">
             <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FileText className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              disabled={!!activeTimer}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you working on?"
              className="pl-10 block w-full border-gray-300 rounded-md focus:ring-indigo-500 focus:border-indigo-500 disabled:bg-gray-50 disabled:text-gray-500 transition-colors"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex-shrink-0">
          {!activeTimer ? (
            <Button 
              onClick={handleStart} 
              className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-full shadow-md hover:shadow-lg transform transition hover:-translate-y-0.5"
            >
              <Play className="w-5 h-5 mr-2 fill-current" />
              Start Timer
            </Button>
          ) : (
            <Button 
              onClick={handleStop} 
              className="w-full md:w-auto bg-red-500 hover:bg-red-600 text-white px-8 py-3 rounded-full shadow-md hover:shadow-lg transform transition hover:-translate-y-0.5 animate-pulse"
            >
              <Square className="w-5 h-5 mr-2 fill-current" />
              Stop Timer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
