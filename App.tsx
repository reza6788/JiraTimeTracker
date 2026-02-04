import React, { useState, useEffect } from 'react';
import { TimeEntry, ViewState } from './types';
import { loadEntries, saveEntries } from './services/storage';
import { TimeLogger } from './components/TimeLogger';
import { TimerWidget } from './components/TimerWidget';
import { EntryList } from './components/EntryList';
import { ReportView } from './components/ReportView';
import { Clock, PieChart, List, LayoutDashboard } from 'lucide-react';

const App: React.FC = () => {
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.LOG_TIME);

  useEffect(() => {
    // Load entries asynchronously
    loadEntries().then(loaded => setEntries(loaded));
  }, []);

  useEffect(() => {
    saveEntries(entries);
  }, [entries]);

  const handleAddEntry = (entry: TimeEntry) => {
    setEntries(prev => [entry, ...prev]);
  };

  const handleDeleteEntry = (id: string) => {
    if (confirm('Are you sure you want to delete this entry?')) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case ViewState.LOG_TIME:
        return (
          <div className="space-y-8">
            <section>
               <h3 className="text-lg font-medium text-gray-700 mb-4 px-1">Timer</h3>
               <TimerWidget onStopTimer={handleAddEntry} />
            </section>
            
            <section>
              <h3 className="text-lg font-medium text-gray-700 mb-4 px-1">Manual Entry</h3>
              <TimeLogger onAddEntry={handleAddEntry} />
            </section>

            <section>
              <h3 className="text-lg font-medium text-gray-700 mb-4 px-1">Recent Activity</h3>
              <EntryList entries={entries.slice(0, 5)} onDelete={handleDeleteEntry} />
              {entries.length > 5 && (
                <button 
                  onClick={() => setCurrentView(ViewState.HISTORY)}
                  className="mt-4 w-full text-center text-sm text-indigo-600 hover:text-indigo-800 font-medium"
                >
                  View all history
                </button>
              )}
            </section>
          </div>
        );
      case ViewState.HISTORY:
        return (
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Work History</h2>
            <EntryList entries={entries} onDelete={handleDeleteEntry} />
          </div>
        );
      case ViewState.REPORTS:
        return (
          <div className="max-w-4xl mx-auto">
             <ReportView entries={entries} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row font-sans text-gray-900">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-gray-200 md:h-screen sticky top-0 z-10">
        <div className="p-6 border-b border-gray-100 flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg">
             <Clock className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-xl font-bold text-gray-800 tracking-tight">TimeTracker</h1>
        </div>
        
        <nav className="p-4 space-y-2">
          <button
            onClick={() => setCurrentView(ViewState.LOG_TIME)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              currentView === ViewState.LOG_TIME 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </button>
          
          <button
            onClick={() => setCurrentView(ViewState.HISTORY)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              currentView === ViewState.HISTORY 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <List className="w-5 h-5" />
            History
          </button>
          
          <button
            onClick={() => setCurrentView(ViewState.REPORTS)}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
              currentView === ViewState.REPORTS 
                ? 'bg-indigo-50 text-indigo-700' 
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            <PieChart className="w-5 h-5" />
            Reports
          </button>
        </nav>

        <div className="absolute bottom-0 w-full p-4 border-t border-gray-100">
          <p className="text-xs text-center text-gray-400">
             &copy; {new Date().getFullYear()} TimeTracker App
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 overflow-y-auto">
        {renderContent()}
      </main>
    </div>
  );
};

export default App;