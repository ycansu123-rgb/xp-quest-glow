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
import { useMotionLab } from "@/lib/motion-lab";

type Piece = {
  id: number;
  x: number;
  y: number;
  cx: number;
  cy: number;
  cr: number;
  color: string;
  size: number;
  rounded: boolean;
  duration: number;
  kind: "confetti" | "micro";
};

type Orb = {
  id: number;
  x: number;
  y: number;
  dx: number;
  dy: number;
  label: string;
  delay: number;
};

type FxCtx = {
  registerXpTarget: (el: HTMLElement | null) => void;
  /** small particle burst at element center */
  microBurst: (el: HTMLElement | null, color?: string) => void;
  confetti: (el: HTMLElement | null, amount?: number) => void;
  /** orbs fly from element to the XP bar; resolves when they land */
  flyXp: (el: HTMLElement | null, amount: number, onArrive?: () => void) => void;
  screenFlash: (tone?: "grape" | "ember") => void;
  flashing: boolean;
};

const Ctx = createContext<FxCtx | null>(null);

const CONFETTI_COLORS = [
  "var(--grape)",
  "var(--ember)",
  "var(--blossom)",
  "var(--mint)",
  "oklch(0.8 0.16 85)",
];

let uid = 0;

export function FxProvider({ children }: { children: ReactNode }) {
  const { on, level } = useMotionLab();
  const [pieces, setPieces] = useState<Piece[]>([]);
  const [orbs, setOrbs] = useState<Orb[]>([]);
  const [flashing, setFlashing] = useState(false);
  const [flashTone, setFlashTone] = useState<"grape" | "ember">("grape");
  const xpTarget = useRef<HTMLElement | null>(null);
  const timers = useRef<number[]>([]);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);
  const later = (fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  };

  const registerXpTarget = useCallback((el: HTMLElement | null) => {
    xpTarget.current = el;
  }, []);

  const spawn = useCallback(
    (el: HTMLElement | null, count: number, kind: "confetti" | "micro") => {
      if (!el) return;
      const r = el.getBoundingClientRect();
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const spreadX = kind === "confetti" ? 200 : 70;
      const spreadY = kind === "confetti" ? 240 : 70;
      const next: Piece[] = Array.from({ length: count }, () => {
        const id = ++uid;
        return {
          id,
          x: cx + (Math.random() - 0.5) * (kind === "confetti" ? r.width * 0.7 : 16),
          y: cy + (Math.random() - 0.5) * 12,
          cx: (Math.random() - 0.5) * spreadX * 2,
          cy: -Math.random() * spreadY + (kind === "confetti" ? 120 : 10),
          cr: Math.random() * 720 - 360,
          color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)] ?? "var(--grape)",
          size: kind === "confetti" ? 5 + Math.random() * 6 : 3 + Math.random() * 4,
          rounded: Math.random() > 0.5,
          duration: kind === "confetti" ? 900 + Math.random() * 700 : 520 + Math.random() * 260,
          kind,
        };
      });
      setPieces((p) => [...p, ...next]);
      const ids = new Set(next.map((n) => n.id));
      later(() => setPieces((p) => p.filter((x) => !ids.has(x.id))), 1900);
    },
    [],
  );

  const microBurst = useCallback(
    (el: HTMLElement | null) => {
      if (!on("confetti")) return;
      spawn(el, level === "crazy" ? 18 : 10, "micro");
    },
    [on, spawn, level],
  );

  const confetti = useCallback(
    (el: HTMLElement | null, amount = 46) => {
      if (!on("confetti")) return;
      spawn(el, level === "crazy" ? amount * 2 : amount, "confetti");
    },
    [on, spawn, level],
  );

  const screenFlash = useCallback(
    (tone: "grape" | "ember" = "grape") => {
      if (!on("rewardUnlock")) return;
      setFlashTone(tone);
      setFlashing(true);
      later(() => setFlashing(false), 900);
    },
    [on],
  );

  const flyXp = useCallback(
    (el: HTMLElement | null, amount: number, onArrive?: () => void) => {
      if (!on("xpFly") || !el || !xpTarget.current) {
        onArrive?.();
        return;
      }
      const from = el.getBoundingClientRect();
      const to = xpTarget.current.getBoundingClientRect();
      const sx = from.left + from.width / 2;
      const sy = from.top + from.height / 2;
      const tx = to.left + to.width * 0.55;
      const ty = to.top + to.height / 2;
      const count = level === "crazy" ? 12 : 7;
      const next: Orb[] = Array.from({ length: count }, (_, i) => ({
        id: ++uid,
        x: sx + (Math.random() - 0.5) * 26,
        y: sy + (Math.random() - 0.5) * 16,
        dx: tx - sx + (Math.random() - 0.5) * 18,
        dy: ty - sy + (Math.random() - 0.5) * 10,
        label: i === 0 ? `+${amount} XP` : "",
        delay: i * 55,
      }));
      setOrbs((o) => [...o, ...next]);
      const ids = new Set(next.map((n) => n.id));
      later(() => setOrbs((o) => o.filter((x) => !ids.has(x.id))), 1500);
      later(() => onArrive?.(), 620);
    },
    [on, level],
  );

  const value = useMemo(
    () => ({ registerXpTarget, microBurst, confetti, flyXp, screenFlash, flashing }),
    [registerXpTarget, microBurst, confetti, flyXp, screenFlash, flashing],
  );

  return (
    <Ctx.Provider value={value}>
      {children}
      <div className="pointer-events-none fixed inset-0 z-[70] overflow-hidden">
        {flashing && (
          <div
            className="absolute inset-0"
            style={{
              background:
                flashTone === "grape"
                  ? "radial-gradient(circle at 50% 30%, oklch(0.7 0.22 300 / 0.45), transparent 65%)"
                  : "radial-gradient(circle at 50% 30%, oklch(0.78 0.19 55 / 0.45), transparent 65%)",
              animation: "iclub-screen-glow 900ms ease-out both",
            }}
          />
        )}
        {pieces.map((p) => (
          <span
            key={p.id}
            className="absolute block will-change-transform"
            style={{
              left: p.x,
              top: p.y,
              width: p.size,
              height: p.kind === "confetti" ? p.size * 1.8 : p.size,
              background: p.color,
              borderRadius: p.rounded ? 999 : 2,
              ["--cx" as string]: `${p.cx}px`,
              ["--cy" as string]: `${p.cy}px`,
              ["--cr" as string]: `${p.cr}deg`,
              animation: `${p.kind === "confetti" ? "iclub-confetti" : "iclub-burst"} ${p.duration}ms cubic-bezier(0.2,0.7,0.3,1) both`,
            }}
          />
        ))}
        {orbs.map((o) => (
          <span
            key={o.id}
            className="absolute flex items-center justify-center will-change-transform"
            style={{
              left: o.x,
              top: o.y,
              ["--dx" as string]: `${o.dx}px`,
              ["--dy" as string]: `${o.dy}px`,
              animation: `iclub-orb-fly 720ms cubic-bezier(0.5,0,0.35,1) ${o.delay}ms both`,
            }}
          >
            {o.label ? (
              <span className="rounded-full bg-grape px-2 py-0.5 text-[10px] font-bold text-primary-foreground shadow-[0_0_16px_2px_oklch(0.6_0.22_300/0.6)]">
                {o.label}
              </span>
            ) : (
              <span className="block size-2.5 rounded-full bg-ember shadow-[0_0_12px_3px_oklch(0.75_0.19_55/0.7)]" />
            )}
          </span>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useFx() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useFx must be used inside FxProvider");
  return ctx;
}

/** Count-up hook — animates 0 → value with an ease-out curve. */
export function useCountUp(value: number, enabled: boolean, duration = 1100, startDelay = 0) {
  const [display, setDisplay] = useState(enabled ? 0 : value);

  useEffect(() => {
    if (!enabled) {
      setDisplay(value);
      return;
    }
    let raf = 0;
    let start = 0;
    const tick = (t: number) => {
      if (!start) start = t;
      const p = Math.min(1, (t - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(value * eased));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    const to = window.setTimeout(() => {
      raf = requestAnimationFrame(tick);
    }, startDelay);
    return () => {
      window.clearTimeout(to);
      cancelAnimationFrame(raf);
    };
  }, [value, enabled, duration, startDelay]);

  return display;
}

/** Fires once the component has mounted (client only) after an optional delay. */
export function useDelayedFlag(ms: number, deps: unknown[] = []) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(false);
    const t = window.setTimeout(() => setReady(true), ms);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
  return ready;
}
