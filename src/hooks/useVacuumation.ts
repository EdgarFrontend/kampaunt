import { useState, useEffect, useCallback, useRef } from 'react';
import type { VacuumationState, HistoryEntry, PaintColor, VacuumationStatus } from '../types';
import { generateId, formatTimeStamp } from '../utils';

const VACUUM_KEY = 'kampaunt_vacuum';
const HISTORY_KEY = 'kampaunt_history';

function loadVacuumState(): VacuumationState {
  try {
    const raw = localStorage.getItem(VACUUM_KEY);
    if (raw) {
      const state = JSON.parse(raw) as VacuumationState;
      if (state.status === 'running' && state.endTime && Date.now() >= state.endTime) {
        return { ...state, status: 'completed' };
      }
      return state;
    }
  } catch {}
  return { 
    status: 'idle', 
    startTime: null, 
    endTime: null, 
    durationMinutes: 60,
    pausedRemaining: null,
    color: null,
    volumeLiters: 0,
  };
}

function loadHistory(): HistoryEntry[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (raw) return JSON.parse(raw) as HistoryEntry[];
  } catch {}
  return [];
}

export function useVacuumation(currentVolumeLiters: number) {
  const [vacuumState, setVacuumState] = useState<VacuumationState>(loadVacuumState);
  const [history, setHistory] = useState<HistoryEntry[]>(loadHistory);
  
  // These are derived from state & current time
  const [remaining, setRemaining] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const saveVacuumState = useCallback((state: VacuumationState) => {
    localStorage.setItem(VACUUM_KEY, JSON.stringify(state));
    setVacuumState(state);
  }, []);

  const addHistory = useCallback((entry: HistoryEntry) => {
    setHistory((prev) => {
      const updated = [entry, ...prev];
      localStorage.setItem(HISTORY_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const completeProcess = useCallback((state: VacuumationState, status: 'completed' | 'stopped', finalElapsed: number) => {
    if (!state.startTime) return;
    
    const now = Date.now();
    const completedState: VacuumationState = { ...state, status, pausedRemaining: null };
    localStorage.setItem(VACUUM_KEY, JSON.stringify(completedState));
    setVacuumState(completedState);

    const date = new Date(state.startTime);
    const dateStr = date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
    const timeStr = date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const entry: HistoryEntry = {
      id: generateId(),
      date: dateStr,
      createdAt: `${dateStr} ${timeStr}`,
      startTime: timeStr,
      endTime: formatTimeStamp(now),
      durationMinutes: state.durationMinutes,
      actualSeconds: finalElapsed,
      volumeLiters: state.volumeLiters,
      color: state.color,
      status,
    };
    addHistory(entry);
  }, [addHistory]);

  const tick = useCallback(() => {
    setVacuumState((state) => {
      if (state.status !== 'running' || !state.endTime || !state.startTime) return state;
      const now = Date.now();
      const totalSeconds = state.durationMinutes * 60;
      
      const rem = Math.max(0, Math.ceil((state.endTime - now) / 1000));
      const el = Math.max(0, totalSeconds - rem);
      
      setRemaining(rem);
      setElapsed(el);

      if (now >= state.endTime) {
        completeProcess(state, 'completed', totalSeconds);
        return { ...state, status: 'completed' as VacuumationStatus };
      }

      return state;
    });
  }, [completeProcess]);

  useEffect(() => {
    if (vacuumState.status === 'running') {
      if (vacuumState.endTime) {
        const now = Date.now();
        const totalSeconds = vacuumState.durationMinutes * 60;
        const rem = Math.max(0, Math.ceil((vacuumState.endTime - now) / 1000));
        setRemaining(rem);
        setElapsed(Math.max(0, totalSeconds - rem));
      }
      intervalRef.current = setInterval(tick, 500);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      if (vacuumState.status === 'idle') {
        setRemaining(0);
        setElapsed(0);
      } else if (vacuumState.status === 'paused' && vacuumState.pausedRemaining !== null) {
         setRemaining(vacuumState.pausedRemaining);
         setElapsed((vacuumState.durationMinutes * 60) - vacuumState.pausedRemaining);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [vacuumState.status, tick, vacuumState.endTime, vacuumState.durationMinutes, vacuumState.pausedRemaining]);

  const start = useCallback((durationMinutes: number, color: PaintColor) => {
    const now = Date.now();
    const endTime = now + durationMinutes * 60 * 1000;
    const state: VacuumationState = {
      status: 'running',
      startTime: now,
      endTime,
      durationMinutes,
      pausedRemaining: null,
      color,
      volumeLiters: currentVolumeLiters,
    };
    saveVacuumState(state);
  }, [saveVacuumState, currentVolumeLiters]);
  
  const pause = useCallback(() => {
    if (vacuumState.status !== 'running' || !vacuumState.endTime) return;
    const rem = Math.max(0, Math.ceil((vacuumState.endTime - Date.now()) / 1000));
    const state: VacuumationState = {
      ...vacuumState,
      status: 'paused',
      pausedRemaining: rem,
    };
    saveVacuumState(state);
  }, [vacuumState, saveVacuumState]);

  const resume = useCallback(() => {
    if (vacuumState.status !== 'paused' || vacuumState.pausedRemaining === null) return;
    const now = Date.now();
    const endTime = now + vacuumState.pausedRemaining * 1000;
    const state: VacuumationState = {
      ...vacuumState,
      status: 'running',
      endTime,
      pausedRemaining: null,
    };
    saveVacuumState(state);
  }, [vacuumState, saveVacuumState]);
  
  const stop = useCallback(() => {
    if (vacuumState.status !== 'running' && vacuumState.status !== 'paused') return;
    
    // Calculate final elapsed time
    let finalElapsed = 0;
    const totalSeconds = vacuumState.durationMinutes * 60;
    
    if (vacuumState.status === 'paused' && vacuumState.pausedRemaining !== null) {
      finalElapsed = Math.max(0, totalSeconds - vacuumState.pausedRemaining);
    } else if (vacuumState.endTime) {
      const rem = Math.max(0, Math.ceil((vacuumState.endTime - Date.now()) / 1000));
      finalElapsed = Math.max(0, totalSeconds - rem);
    }
    
    completeProcess(vacuumState, 'stopped', finalElapsed);
  }, [vacuumState, completeProcess]);

  const reset = useCallback(() => {
    const state: VacuumationState = {
      status: 'idle',
      startTime: null,
      endTime: null,
      durationMinutes: vacuumState.durationMinutes,
      pausedRemaining: null,
      color: null,
      volumeLiters: 0,
    };
    saveVacuumState(state);
    setRemaining(0);
    setElapsed(0);
  }, [saveVacuumState, vacuumState.durationMinutes]);

  const totalSeconds = vacuumState.durationMinutes * 60;
  const progress = totalSeconds > 0 ? Math.min(1, elapsed / totalSeconds) : 0;

  return {
    vacuumState,
    remaining,
    elapsed,
    progress,
    history,
    start,
    pause,
    resume,
    stop,
    reset,
  };
}
