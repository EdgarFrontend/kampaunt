import { useState, useCallback } from 'react';

const DURATION_KEY = 'kampaunt_vacuum_duration';

function loadDuration(): number {
  try {
    const raw = localStorage.getItem(DURATION_KEY);
    if (raw) return parseInt(raw, 10);
  } catch {}
  return 60;
}

export function useVacuumSettings() {
  const [durationMinutes, setDurationMinutes] = useState<number>(loadDuration);

  const updateDuration = useCallback((minutes: number) => {
    setDurationMinutes(minutes);
    localStorage.setItem(DURATION_KEY, String(minutes));
  }, []);

  return { durationMinutes, updateDuration };
}
