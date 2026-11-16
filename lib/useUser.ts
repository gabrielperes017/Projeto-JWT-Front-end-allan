"use client";

import { useMemo, useSyncExternalStore } from "react";
import { User } from "@/lib/api";

const subscribe = () => () => {};
const snapshot = () => localStorage.getItem("user");
const serverSnapshot = () => null;

export function useUser(): User | null {
  const raw = useSyncExternalStore(subscribe, snapshot, serverSnapshot);
  return useMemo(() => {
    try {
      return raw ? (JSON.parse(raw) as User) : null;
    } catch {
      return null;
    }
  }, [raw]);
}
