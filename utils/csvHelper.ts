import { TimeEntry } from '../types';

export const downloadEntriesAsCSV = (entries: TimeEntry[]) => {
  // 1. Define Headers
  const headers = ['Date', 'Ticket ID', 'Project', 'Duration (Minutes)', 'Duration (Formatted)', 'Description'];

  // 2. Map Data to Rows
  const rows = entries.map(entry => {
    const date = new Date(entry.timestamp).toLocaleDateString();
    const hours = Math.floor(entry.durationMinutes / 60);
    const mins = entry.durationMinutes % 60;
    const formattedTime = `${hours}h ${mins}m`;
    const project = entry.ticketId.split('-')[0] || 'N/A';
    
    // Escape quotes for CSV safety
    const safeDescription = `"${entry.description.replace(/"/g, '""')}"`;
    
    return [
      date,
      entry.ticketId,
      project,
      entry.durationMinutes.toString(),
      formattedTime,
      safeDescription
    ].join(',');
  });

  // 3. Combine with BOM (for Excel) and Newlines
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\n');

  // 4. Create Blob and Trigger Download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `jira_time_report_${new Date().toISOString().slice(0, 10)}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};