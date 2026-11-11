import type { AnalyzeResponse } from "@/lib/schema";

export type HistoryEntry = {
  id: string;
  createdAt: number;
  input: string;
  sampleId: string | null;
  response: AnalyzeResponse;
  approved: boolean;
};

export const HISTORY_KEY = "inbound.history.v1";
export const HISTORY_LIMIT = 8;

/** Newest first, de-duplicated by id, capped at `limit`. */
export function addToHistory(list: HistoryEntry[], entry: HistoryEntry, limit = HISTORY_LIMIT): HistoryEntry[] {
  return [entry, ...list.filter((e) => e.id !== entry.id)].slice(0, limit);
}

export function parseHistory(raw: string | null): HistoryEntry[] {
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    if (!Array.isArray(value)) return [];
    return value.filter(
      (e): e is HistoryEntry =>
        typeof e === "object" &&
        e !== null &&
        typeof (e as HistoryEntry).id === "string" &&
        typeof (e as HistoryEntry).createdAt === "number" &&
        typeof (e as HistoryEntry).response?.analysis?.score === "number",
    );
  } catch {
    return [];
  }
}

/** localStorage can throw (private mode, blocked storage); never let it break the app. */
export function loadHistory(): HistoryEntry[] {
  try {
    return parseHistory(window.localStorage.getItem(HISTORY_KEY));
  } catch {
    return [];
  }
}

export function saveHistory(list: HistoryEntry[]): void {
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
  } catch {
    // Storage unavailable or full: history is a convenience, so ignore.
  }
}
