import { GoogleGenAI } from "@google/genai";
import { TimeEntry } from "../types";

// Check if API key is present in environment
const API_KEY = process.env.API_KEY || '';

export const generateReport = async (entries: TimeEntry[], tone: string): Promise<string> => {
  if (!API_KEY) {
    return "Error: API Key is missing. Please ensure process.env.API_KEY is set.";
  }

  if (entries.length === 0) {
    return "No entries found to report on.";
  }

  const ai = new GoogleGenAI({ apiKey: API_KEY });
  
  // Format entries for the prompt
  const entriesText = entries.map(e => 
    `- Ticket: ${e.ticketId}, Time: ${e.durationMinutes} mins, Date: ${new Date(e.timestamp).toLocaleDateString()}, Description: ${e.description}`
  ).join('\n');

  const prompt = `
    You are a helpful assistant generating a work status report.
    
    Here are my work logs:
    ${entriesText}
    
    Please generate a ${tone} summary report suitable for sending to a manager or posting in a standup channel.
    Group the work logically by Ticket ID if possible.
    Calculate total time spent.
    Highlight key accomplishments based on the descriptions.
    Format the output in clean Markdown.
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Failed to generate report text.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return `Error generating report: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
};
