export const calculateVariance = (scheduled: string, actual: string): number | null => {
  if (!scheduled || !actual) return null;

  const scheduledDate = new Date(scheduled);
  const actualDate = new Date(actual);

  // Check for invalid dates (e.g., "2023-02-30" or malformed strings)
  if (isNaN(scheduledDate.getTime()) || isNaN(actualDate.getTime())) {
    return null;
  }

  // Reset hours to ensure pure date calculation
  scheduledDate.setHours(0, 0, 0, 0);
  actualDate.setHours(0, 0, 0, 0);

  // Formula: -(Actual - Scheduled) = Scheduled - Actual
  const diffTime = scheduledDate.getTime() - actualDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays;
};

export const getVarianceColor = (variance: number | null): string => {
  if (variance === null) return 'text-gray-400';
  if (variance < 0) return 'text-red-600 font-bold'; // Late
  if (variance > 0) return 'text-green-600 font-bold'; // Early
  return 'text-gray-800'; // On time
};

export const formatDateForInput = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const calculateDuration = (start: string, end: string): number | null => {
  if (!start || !end) return null;

  const startDate = new Date(start);
  const endDate = new Date(end);

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
    return null;
  }

  // Normalize to midnight
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(0, 0, 0, 0);

  const diffTime = endDate.getTime() - startDate.getTime();
  // Duration includes the start day, so +1
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
};