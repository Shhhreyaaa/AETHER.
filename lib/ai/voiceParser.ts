import { addDays, nextMonday, addWeeks, setHours, setMinutes } from 'date-fns';

interface ParsedVoiceTask {
  title: string;
  dueDate: string;
  category: string;
  confidence: number;
}

const SUBJECT_KEYWORDS: Record<string, string> = {
  ml: 'ML / Technical',
  'machine learning': 'ML / Technical',
  physics: 'Academics',
  chemistry: 'Academics',
  math: 'Academics',
  mathematics: 'Academics',
  marketing: 'Business',
  finance: 'Business',
  investor: 'Business',
  pitch: 'Business',
  deck: 'Business',
  assignment: 'Academics',
  project: 'General',
  report: 'General',
  presentation: 'Business',
  exam: 'Academics',
  test: 'Academics',
};

export function parseVoiceInput(transcript: string): ParsedVoiceTask {
  const lower = transcript.toLowerCase().trim();
  let category = 'General';
  let title = transcript;
  let dueDate = new Date(Date.now() + 1000 * 3600 * 48); // Default: 2 days

  // === 1. Detect Category / Subject ===
  for (const [keyword, cat] of Object.entries(SUBJECT_KEYWORDS)) {
    if (lower.includes(keyword)) {
      category = cat;
      break;
    }
  }

  // === 2. Clean Title ===
  title = transcript
    .replace(/^(i have to|i need to|please|can you|add|create|task|remind me to)/gi, '')
    .replace(/by\s+.*$/gi, '') // Remove everything after "by"
    .trim();

  if (title.length < 4) title = transcript;

  // === 3. Advanced Deadline Parsing ===
  const now = new Date();

  // Today
  if (lower.includes('today')) {
    dueDate = setMinutes(setHours(now, 23), 59);
  } 
  // Tomorrow
  else if (lower.includes('tomorrow')) {
    dueDate = setMinutes(setHours(addDays(now, 1), 23), 59);
  } 
  // Next Monday / Next Week
  else if (lower.includes('next monday')) {
    dueDate = setMinutes(setHours(nextMonday(now), 23), 59);
  } 
  else if (lower.includes('next week')) {
    dueDate = setMinutes(setHours(addWeeks(now, 1), 23), 59);
  } 
  // In X days
  else if (lower.match(/in\s+(\d+)\s*days?/)) {
    const match = lower.match(/in\s+(\d+)\s*days?/);
    const days = parseInt(match?.[1] || '2');
    dueDate = setMinutes(setHours(addDays(now, days), 23), 59);
  } 
  // By evening / tonight
  else if (lower.includes('evening') || lower.includes('tonight')) {
    dueDate = setMinutes(setHours(now, 20), 0); // 8 PM
  } 
  // By morning
  else if (lower.includes('morning')) {
    dueDate = setMinutes(setHours(addDays(now, 1), 9), 0); // 9 AM next day
  } 
  // Specific date like "30 june"
  else if (lower.match(/(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i)) {
    const match = lower.match(/(\d{1,2})\s*(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i);
    if (match) {
      const day = parseInt(match[1]);
      const monthMap: Record<string, number> = {
        jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
        jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
      };
      const month = monthMap[match[2].toLowerCase()];
      dueDate = new Date(now.getFullYear(), month, day, 23, 59);
    }
  } 
  // Fallback: Try to find time like "12 am", "5 pm"
  else if (lower.match(/(\d{1,2})\s*(am|pm)/)) {
    const match = lower.match(/(\d{1,2})\s*(am|pm)/);
    if (match) {
      let hour = parseInt(match[1]);
      const isPM = match[2].toLowerCase() === 'pm';
      if (isPM && hour !== 12) hour += 12;
      if (!isPM && hour === 12) hour = 0;

      dueDate = setMinutes(setHours(now, hour), 0);
      if (dueDate < now) dueDate = addDays(dueDate, 1); // If time already passed, move to next day
    }
  }

  return {
    title: title || "Untitled Task",
    dueDate: dueDate.toISOString(),
    category,
    confidence: 0.88,
  };
}
