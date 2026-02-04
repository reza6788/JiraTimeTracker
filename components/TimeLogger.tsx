import React, { useState } from 'react';
import { TimeEntry } from '../types';
import { Button } from './Button';
import { Plus, Clock, FileText, Hash } from 'lucide-react';

interface TimeLoggerProps {
  onAddEntry: (entry: TimeEntry) => void;
}

export const TimeLogger: React.FC<TimeLoggerProps> = ({ onAddEntry }) => {
  const [ticketId, setTicketId] = useState('');
  const [description, setDescription] = useState('');
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const h = parseInt(hours || '0', 10);
    const m = parseInt(minutes || '0', 10);
    
    if (!ticketId || (h === 0 && m === 0) || !description) {
      alert("Please fill in Ticket ID, Description and at least some time.");
      return;
    }

    const totalMinutes = h * 60 + m;
    const entryDate = new Date(date);
    // Set to noon to avoid timezone rolling issues with simple date pickers
    entryDate.setHours(12, 0, 0, 0); 

    const newEntry: TimeEntry = {
      id: crypto.randomUUID(),
      ticketId: ticketId.toUpperCase().trim(),
      description,
      durationMinutes: totalMinutes,
      timestamp: entryDate.getTime()
    };

    onAddEntry(newEntry);
    
    // Reset form partially
    setTicketId('');
    setDescription('');
    setHours('');
    setMinutes('');
    // Keep date same as user might enter multiple logs for same day
  };

  return (
    <div className="max-w-2xl mx-auto bg-white p-6 rounded-xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
        <Clock className="w-5 h-5 text-indigo-600" />
        Log Work
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
              <Hash className="w-4 h-4 text-gray-400" />
              Ticket ID
            </label>
            <input
              type="text"
              value={ticketId}
              onChange={(e) => setTicketId(e.target.value)}
              placeholder="e.g. PROJ-123"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all uppercase"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="space-y-2">
           <label className="block text-sm font-medium text-gray-700 flex items-center gap-1">
              <FileText className="w-4 h-4 text-gray-400" />
              Description
            </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What did you work on?"
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Hours</label>
            <input
              type="number"
              min="0"
              value={hours}
              onChange={(e) => setHours(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">Minutes</label>
            <input
              type="number"
              min="0"
              max="59"
              value={minutes}
              onChange={(e) => setMinutes(e.target.value)}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all"
            />
          </div>
        </div>

        <div className="pt-2">
          <Button type="submit" className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Entry
          </Button>
        </div>
      </form>
    </div>
  );
};
