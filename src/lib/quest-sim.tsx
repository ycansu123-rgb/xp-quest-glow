import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

/**
 * Mock "backend" quest state.
 *
 * PRODUCTION NOTE:
 * `completed` mirrors the server truth (quest finished in another flow, e.g. Hediye Et).
 * `celebrated` is a *client* concern: whether the user already watched the completion
 * animation. In production keep `completed` in the API payload and persist `celebrated`
 * either as a `completion_animation_seen` column (write on animation end) or in local
 * persistent storage keyed by user id. Never derive one from the other.
 */

const COMPLETED_KEY = "iclub.quests.completed";
const CELEBRATED_KEY = "iclub.quests.celebrated";

/** Quests that the backend already marked complete on the user's first arrival (demo). */
const DEFAULT_COMPLETED = ["campaign", "ipuan", "game"];

function read(key: string, fallback: string[] | null = null): string[] | null {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    if (raw == null) return fallback;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as string[]) : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* noop */
  }
}

type Ctx = {
  /** ids the backend considers complete */
  completed: string[];
  /** ids whose completion animation the user already saw */
  celebrated: string[];
  /** bumps whenever the mock backend state changes → re-runs page-entry detection */
  token: number;
  markCelebrated: (id: string) => void;
  /** dev: pretend the user completed `count` quests elsewhere and came back */
  simulate: (count: number, allIds: string[]) => void;
  resetCompletion: () => void;
};

const QuestSimContext = createContext<Ctx | null>(null);

export function QuestSimProvider({ children }: { children: ReactNode }) {
  const [completed, setCompleted] = useState<string[]>([]);
  const [celebrated, setCelebrated] = useState<string[]>([]);
  const [token, setToken] = useState(0);
  const hydrated = useRef(false);

  // Page entry: read the mock backend + seen state (client only).
  useEffect(() => {
    if (hydrated.current) return;
    hydrated.current = true;
    const storedCompleted = read(COMPLETED_KEY);
    const initialCompleted = storedCompleted ?? DEFAULT_COMPLETED;
    if (!storedCompleted) write(COMPLETED_KEY, initialCompleted);
    setCompleted(initialCompleted);
    setCelebrated(read(CELEBRATED_KEY, []) ?? []);
    setToken((t) => t + 1);
  }, []);

  const markCelebrated = useCallback((id: string) => {
    setCelebrated((prev) => {
      if (prev.includes(id)) return prev;
      const next = [...prev, id];
      write(CELEBRATED_KEY, next);
      return next;
    });
  }, []);

  const simulate = useCallback((count: number, allIds: string[]) => {
    const picked = allIds.slice(0, count);
    setCompleted(picked);
    write(COMPLETED_KEY, picked);
    setCelebrated([]);
    write(CELEBRATED_KEY, []);
    setToken((t) => t + 1);
  }, []);

  const resetCompletion = useCallback(() => {
    setCompleted([]);
    write(COMPLETED_KEY, []);
    setCelebrated([]);
    write(CELEBRATED_KEY, []);
    setToken((t) => t + 1);
  }, []);

  const value = useMemo(
    () => ({ completed, celebrated, token, markCelebrated, simulate, resetCompletion }),
    [completed, celebrated, token, markCelebrated, simulate, resetCompletion],
  );

  return <QuestSimContext.Provider value={value}>{children}</QuestSimContext.Provider>;
}

export function useQuestSim() {
  const ctx = useContext(QuestSimContext);
  if (!ctx) throw new Error("useQuestSim must be used inside QuestSimProvider");
  return ctx;
}
