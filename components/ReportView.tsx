import React, { useState, useMemo } from 'react';
import { TimeEntry } from '../types';
import { generateReport } from '../services/geminiService';
import { downloadEntriesAsCSV } from '../utils/csvHelper';
import { Button } from './Button';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Sparkles, Copy, Download, Filter } from 'lucide-react';

interface ReportViewProps {
  entries: TimeEntry[];
}

const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];

export const ReportView: React.FC<ReportViewProps> = ({ entries }) => {
  const [reportText, setReportText] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Filters
  const [reportRange, setReportRange] = useState<'all' | '7days' | '30days'>('7days');
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // 1. Extract unique projects for the dropdown
  const availableProjects = useMemo(() => {
    const projects = new Set(entries.map(e => e.ticketId.split('-')[0]));
    return Array.from(projects).sort();
  }, [entries]);

  // 2. Apply Filters
  const filteredEntries = useMemo(() => {
    const now = new Date();
    let result = entries;

    // Date Filter
    if (reportRange !== 'all') {
      const days = reportRange === '7days' ? 7 : 30;
      const ms = days * 24 * 60 * 60 * 1000;
      const cutoff = now.getTime() - ms;
      result = result.filter(e => e.timestamp >= cutoff);
    }

    // Project Filter
    if (selectedProject !== 'all') {
      result = result.filter(e => e.ticketId.startsWith(selectedProject));
    }

    // Sort by Date Descending
    return result.sort((a, b) => b.timestamp - a.timestamp);
  }, [entries, reportRange, selectedProject]);

  // 3. Aggregate data for Pie Chart
  const chartData = useMemo(() => {
    const map = new Map<string, number>();
    filteredEntries.forEach(e => {
      // Group by Project prefix
      const key = e.ticketId.includes('-') ? e.ticketId.split('-')[0] : e.ticketId;
      map.set(key, (map.get(key) || 0) + e.durationMinutes);
    });
    
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [filteredEntries]);

  // Handlers
  const handleGenerateAIReport = async () => {
    setIsGenerating(true);
    const text = await generateReport(filteredEntries, 'professional');
    setReportText(text);
    setIsGenerating(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(reportText);
    alert('Report copied to clipboard!');
  };

  const handleExportCSV = () => {
    downloadEntriesAsCSV(filteredEntries);
  };

  const formatDuration = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
  };

  return (
    <div className="space-y-8">
      {/* Controls Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="flex items-center gap-2 text-gray-600">
            <Filter className="w-4 h-4" />
            <span className="text-sm font-medium">Filter:</span>
          </div>
          
          {/* Date Range Select */}
          <select 
            value={reportRange}
            onChange={(e) => setReportRange(e.target.value as any)}
            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="7days">Last 7 Days</option>
            <option value="30days">Last 30 Days</option>
            <option value="all">All Time</option>
          </select>

          {/* Project Select */}
          <select 
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            className="text-sm border-gray-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          >
            <option value="all">All Projects</option>
            {availableProjects.map(proj => (
              <option key={proj} value={proj}>{proj}</option>
            ))}
          </select>
        </div>

        <Button onClick={handleExportCSV} variant="secondary" className="w-full md:w-auto">
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-96">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Project Distribution</h2>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value: number) => [formatDuration(value), 'Time Spent']}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-gray-400">
              No data for selected filters
            </div>
          )}
        </div>

        {/* AI Report Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex flex-col h-96">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              AI Summary
            </h2>
            {reportText && (
               <Button variant="ghost" onClick={handleCopy} className="text-xs">
                 <Copy className="w-3 h-3" />
               </Button>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto bg-gray-50 rounded-lg p-4 border border-gray-200">
            {!reportText ? (
              <div className="h-full flex flex-col items-center justify-center text-center">
                <p className="text-sm text-gray-500 mb-4">
                  Generate a standup report based on the <br/><strong>{filteredEntries.length} filtered entries</strong>.
                </p>
                <Button 
                  onClick={handleGenerateAIReport} 
                  isLoading={isGenerating}
                  disabled={filteredEntries.length === 0}
                  className="bg-purple-600 hover:bg-purple-700"
                >
                  Generate
                </Button>
              </div>
            ) : (
              <pre className="whitespace-pre-wrap font-sans text-sm text-gray-700">{reportText}</pre>
            )}
          </div>
        </div>
      </div>

      {/* Detailed Data Table */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-800">Detailed Logs</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ticket</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEntries.map((entry) => (
                <tr key={entry.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(entry.timestamp).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-indigo-600">
                    {entry.ticketId}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-700 max-w-md truncate">
                    {entry.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-mono">
                    {formatDuration(entry.durationMinutes)}
                  </td>
                </tr>
              ))}
              {filteredEntries.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No entries match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};