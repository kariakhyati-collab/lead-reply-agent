"use client";

import { useSyncExternalStore } from "react";

import { addToHistory, HISTORY_KEY, loadHistory, saveHistory, type HistoryEntry } from "@/lib/history";

/**
 * A tiny external store over localStorage so React reads history without a
 * hydration mismatch (the server snapshot is always empty).
 */
const EMPTY: HistoryEntry[] = [];
let cache: HistoryEntry[] | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const l of listeners) l();
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === HISTORY_KEY) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

function getSnapshot(): HistoryEntry[] {
  cache ??= loadHistory();
  return cache;
}

function write(next: HistoryEntry[]) {
  cache = next;
  saveHistory(next);
  emit();
}

export const historyStore = {
  add(entry: HistoryEntry) {
    write(addToHistory(getSnapshot(), entry));
  },
  markApproved(id: string) {
    write(getSnapshot().map((e) => (e.id === id ? { ...e, approved: true } : e)));
  },
  clear() {
    write([]);
  },
};

export function useHistory(): HistoryEntry[] {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);
}
