import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type MotionLevel = "off" | "minimal" | "balanced" | "playful" | "crazy";

export const MOTION_LEVELS: MotionLevel[] = ["off", "minimal", "balanced", "playful", "crazy"];

export const MOTION_LEVEL_LABEL: Record<MotionLevel, string> = {
  off: "Off",
  minimal: "Minimal",
  balanced: "Balanced",
  playful: "Playful",
  crazy: "Crazy",
};

export type FlagKey =
  | "entrance"
  | "xpBar"
  | "xpGlow"
  | "xpParticles"
  | "rewardCards"
  | "giftIdle"
  | "locks"
  | "cta"
  | "questCards"
  | "progress"
  | "xpFly"
  | "questComplete"
  | "rewardUnlock"
  | "confetti"
  | "parallax"
  | "idle"
  | "easterEgg";

export const FLAGS: { key: FlagKey; label: string }[] = [
  { key: "entrance", label: "Entrance animations" },
  { key: "xpBar", label: "XP bar animation" },
  { key: "xpGlow", label: "XP glow / energy" },
  { key: "xpParticles", label: "XP node particles" },
  { key: "rewardCards", label: "Reward card motion" },
  { key: "giftIdle", label: "Gift idle animations" },
  { key: "locks", label: "Lock animations" },
  { key: "cta", label: "CTA animations" },
  { key: "questCards", label: "Quest card motion" },
  { key: "progress", label: "Progress animations" },
  { key: "xpFly", label: "XP fly animation" },
  { key: "questComplete", label: "Quest complete celebration" },
  { key: "rewardUnlock", label: "Reward unlock" },
  { key: "confetti", label: "Confetti / particles" },
  { key: "parallax", label: "Scroll parallax" },
  { key: "idle", label: "Idle animations" },
  { key: "easterEgg", label: "Easter egg" },
];

const ALL_ON = Object.fromEntries(FLAGS.map((f) => [f.key, true])) as Record<FlagKey, boolean>;
const ALL_OFF = Object.fromEntries(FLAGS.map((f) => [f.key, false])) as Record<FlagKey, boolean>;

const LEVEL_PRESET: Record<MotionLevel, Record<FlagKey, boolean>> = {
  off: ALL_OFF,
  minimal: {
    ...ALL_OFF,
    entrance: true,
    xpBar: true,
    progress: true,
    cta: true,
  },
  balanced: {
    ...ALL_ON,
    xpParticles: false,
    parallax: false,
    easterEgg: true,
  },
  playful: ALL_ON,
  crazy: ALL_ON,
};

const LEVEL_TUNING: Record<MotionLevel, { scale: number; amp: number }> = {
  off: { scale: 1, amp: 0 },
  minimal: { scale: 1.15, amp: 0.45 },
  balanced: { scale: 1, amp: 0.8 },
  playful: { scale: 0.9, amp: 1 },
  crazy: { scale: 0.7, amp: 1.6 },
};

type Ctx = {
  level: MotionLevel;
  setLevel: (l: MotionLevel) => void;
  flags: Record<FlagKey, boolean>;
  toggle: (k: FlagKey) => void;
  on: (k: FlagKey) => boolean;
  /** replay key — bump to re-run entrance sequence */
  replayKey: number;
  replay: () => void;
  haptic: (kind: "light" | "medium" | "success" | "warning") => void;
};

const MotionLabContext = createContext<Ctx | null>(null);

export function MotionLabProvider({ children }: { children: ReactNode }) {
  const [level, setLevelState] = useState<MotionLevel>("playful");
  const [flags, setFlags] = useState<Record<FlagKey, boolean>>(ALL_ON);
  const [replayKey, setReplayKey] = useState(0);

  const setLevel = useCallback((l: MotionLevel) => {
    setLevelState(l);
    setFlags(LEVEL_PRESET[l]);
    setReplayKey((k) => k + 1);
  }, []);

  const toggle = useCallback((k: FlagKey) => {
    setFlags((f) => ({ ...f, [k]: !f[k] }));
  }, []);

  const on = useCallback((k: FlagKey) => flags[k] && level !== "off", [flags, level]);

  useEffect(() => {
    const root = document.documentElement;
    const tune = LEVEL_TUNING[level];
    root.style.setProperty("--motion-scale", String(tune.scale));
    root.style.setProperty("--motion-amp", String(tune.amp));
    root.classList.toggle("mo-off-entrance", !(flags.entrance && level !== "off"));
    root.classList.toggle("mo-off-idle", !(flags.idle && level !== "off"));
    root.classList.toggle("mo-off-shine", !(flags.cta && level !== "off"));
    root.classList.toggle("mo-off-barglow", !(flags.xpGlow && level !== "off"));
  }, [level, flags]);

  const haptic = useCallback((kind: "light" | "medium" | "success" | "warning") => {
    // Native app mapping: light=selection, medium=impactMedium,
    // success=notificationSuccess, warning=notificationWarning.
    if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
    const map = { light: [8], medium: [18], success: [12, 40, 24], warning: [26, 30, 26] };
    try {
      navigator.vibrate(map[kind]);
    } catch {
      /* noop */
    }
  }, []);

  const value = useMemo(
    () => ({
      level,
      setLevel,
      flags,
      toggle,
      on,
      replayKey,
      replay: () => setReplayKey((k) => k + 1),
      haptic,
    }),
    [level, setLevel, flags, toggle, on, replayKey, haptic],
  );

  return <MotionLabContext.Provider value={value}>{children}</MotionLabContext.Provider>;
}

export function useMotionLab() {
  const ctx = useContext(MotionLabContext);
  if (!ctx) throw new Error("useMotionLab must be used inside MotionLabProvider");
  return ctx;
}

/** stagger delay helper */
export function delay(ms: number): React.CSSProperties {
  return { ["--d" as string]: `${ms}ms` };
}
