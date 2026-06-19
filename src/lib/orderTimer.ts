export const ORDER_TIMER_STORAGE_KEY = 'mandi_order_timer';

export type OrderStatus =
  | 'idle'
  | 'confirmed'
  | 'cooking'
  | 'on-the-way'
  | 'delivered'
  | 'ready-for-pickup';

export interface StoredTimerState {
  startTime: number;
  durationSeconds: number;
  orderStatus: OrderStatus;
}

const DURATIONS_SECONDS: Record<OrderStatus, number> = {
  idle: 0,
  confirmed: 5,
  cooking: 45,
  'on-the-way': 0,
  delivered: 0,
  'ready-for-pickup': 0,
};

function safeJsonParse<T>(value: string | null): T | null {
  if (!value) return null;
  try {
    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export function getOrderStatusDurationSeconds(status: OrderStatus): number {
  return DURATIONS_SECONDS[status] ?? 0;
}

export function getOrderTimerState(): StoredTimerState | null {
  return safeJsonParse<StoredTimerState>(localStorage.getItem(ORDER_TIMER_STORAGE_KEY));
}

export function getOrderTimerRemainingSeconds(now = Date.now()): number {
  const state = getOrderTimerState();
  if (!state) return 0;
  const elapsed = Math.floor((now - state.startTime) / 1000);
  return Math.max(0, state.durationSeconds - elapsed);
}

export function clearOrderTimer() {
  localStorage.removeItem(ORDER_TIMER_STORAGE_KEY);
}

/**
 * Ensures a timer exists for the current status and is NOT restarted across refresh.
 * If status changes, a new timer starts for the new status.
 */
export function ensureOrderTimerForStatus(status: OrderStatus): StoredTimerState | null {
  if (status === 'idle' || status === 'delivered' || status === 'ready-for-pickup') {
    clearOrderTimer();
    return null;
  }

  const durationSeconds = getOrderStatusDurationSeconds(status);
  const stored = getOrderTimerState();

  if (stored && stored.orderStatus === status && stored.durationSeconds === durationSeconds) {
    return stored;
  }

  const next: StoredTimerState = {
    startTime: Date.now(),
    durationSeconds,
    orderStatus: status,
  };

  localStorage.setItem(ORDER_TIMER_STORAGE_KEY, JSON.stringify(next));
  return next;
}
