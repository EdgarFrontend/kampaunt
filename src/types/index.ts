export type Unit = 'кг' | 'г';

export interface Component {
  id: string;
  name: string;
  amountPerLiter: number;
  unit: Unit;
}

export interface Recipe {
  components: Component[];
}

export interface CalculatedIngredient {
  component: Component;
  required: number;
}

export interface ProductionCalculation {
  liters: number;
  ingredients: CalculatedIngredient[];
}

export interface VacuumationSettings {
  durationMinutes: number;
}

export type VacuumationStatus = 'idle' | 'running' | 'paused' | 'completed' | 'stopped';

export interface PaintColor {
  name: string;
  hex?: string;
}

export interface VacuumationState {
  status: VacuumationStatus;
  /** Timestamp when the process was first started */
  startTime: number | null;
  /** Timestamp when the process is expected to end (recalculated on resume) */
  endTime: number | null;
  /** Remaining seconds frozen at pause moment */
  pausedRemaining: number | null;
  /** Duration as configured by user */
  durationMinutes: number;
  /** Color of the paint batch being processed */
  color: PaintColor | null;
  /** Volume in liters for this process */
  volumeLiters: number;
}

export interface HistoryEntry {
  id: string;
  /** Display date e.g. "19.09.2026" */
  date: string;
  /** Display datetime e.g. "19.09.2026 12:30" */
  createdAt: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  /** Actual running time in seconds (excluding pauses) */
  actualSeconds: number;
  volumeLiters: number;
  color: PaintColor | null;
  status: 'completed' | 'stopped';
}

export type Page = 'dashboard' | 'calculator' | 'configuration' | 'history';

export interface PaintTask {
  id: string;
  colorName: string;
  colorHex?: string;
  liters: number;
  status: 'pending' | 'in-progress' | 'done';
  createdAt: number;
}
