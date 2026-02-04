import React from 'react';
import { TimeEntry } from '../types';
import { Button } from './Button';
import { Trash2, Calendar, Clock } from 'lucide-react';

interface EntryListProps {
  entries: TimeEntry[];
  onDelete: (id: string) => void;
}

export const EntryList: React.FC<EntryListProps> = ({ entries, onDelete }) => {
  const sortedEntries = [...entries].sort((a, b) => b.timestamp - a.timestamp);

  const formatDuration = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h}h`;
    return `${m}m`;
  };

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-xl border border-gray-100 shadow-sm">
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">No time logged yet. Start tracking your work!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {sortedEntries.map((entry) => (
        <div key={entry.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-1">
              <span className="bg-indigo-100 text-indigo-800 text-xs font-semibold px-2.5 py-0.5 rounded border border-indigo-200">
                {entry.ticketId}
              </span>
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Calendar className="w-3 h-3" />
                {new Date(entry.timestamp).toLocaleDateString()}
              </span>
              <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {formatDuration(entry.durationMinutes)}
              </span>
            </div>
            <p className="text-gray-800 text-sm">{entry.description}</p>
          </div>
          <Button 
            variant="ghost" 
            onClick={() => onDelete(entry.id)}
            className="text-red-500 hover:bg-red-50 hover:text-red-600 self-end md:self-center"
            title="Delete entry"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      ))}
    </div>
  );
};
