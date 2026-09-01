import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Gamepad2,
  Gift,
  QrCode,
  ShoppingCart,
  Sparkles,
  Wallet,
} from "lucide-react";
import { delay, useMotionLab } from "@/lib/motion-lab";
import { useQuestSim } from "@/lib/quest-sim";
import { useCountUp, useFx } from "./effects";
import { cn } from "@/lib/utils";


type Quest = {
  id: string;
  title: string;
  xp: number;
  cta: string;
  ctaTone: "grape" | "blossom" | "ember" | "red" | "pink";
  icon: typeof Wallet;
  iconIdle: string;
  iconTone: "grape" | "blossom" | "ember" | "red" | "pink";
  progress?: { current: number; total: number; unit: string };
  steps?: { label: string; done: boolean }[];
  note?: string;
};

const QUESTS: Quest[] = [
  {
    id: "load",
    title: "500 TL bireysel yükleme yap!",
    xp: 150,
    cta: "Yükleme Yap",
    ctaTone: "grape",
    icon: Wallet,
    iconIdle: "idle-coin",
    iconTone: "grape",
    progress: { current: 380, total: 500, unit: "tl" },
  },
  {
    id: "campaign",
    title: "Kampanya noktalarında harca, iPuan kazan!",
    xp: 120,
    cta: "Kampanyaları Gör",
    ctaTone: "pink",
    icon: Gift,
    iconIdle: "idle-wiggle",
    iconTone: "pink",
  },
  {
    id: "ipuan",
    title: "iPuan ile harcama yap!",
    xp: 120,
    cta: "iPuan ile Harca",
    ctaTone: "ember",
    icon: QrCode,
    iconIdle: "idle-breathe",
    iconTone: "ember",
  },
  {
    id: "carrefour",
    title: "Carrefour'da 3 kez alışveriş yap!",
    xp: 500,
    cta: "Alışveriş Yap",
    ctaTone: "red",
    icon: ShoppingCart,
    iconIdle: "idle-cart",
    iconTone: "red",
    steps: [
      { label: "1.Harcama", done: true },
      { label: "2.Harcama", done: false },
      { label: "3.Harcama", done: false },
    ],
  },
  {
    id: "game",
    title: "Oyna, seviyeni atla, XP kazan",
    xp: 80,
    cta: "Oyna",
    ctaTone: "blossom",
    icon: Gamepad2,
    iconIdle: "idle-vibrate",
    iconTone: "blossom",
    note: "Oyun Susa Game'de devam eder, XP'in iClub'ta güncellenir.",
  },
];

const CTA_BG: Record<Quest["ctaTone"], string> = {
  grape: "var(--gradient-grape)",
  blossom: "var(--gradient-blossom)",
  ember: "var(--gradient-ember)",
  red: "linear-gradient(135deg, oklch(0.62 0.23 25), oklch(0.68 0.21 40))",
  pink: "linear-gradient(135deg, oklch(0.6 0.24 350), oklch(0.68 0.2 330))",
};

const ICON_SOFT: Record<Quest["iconTone"], string> = {
  grape: "bg-grape-soft text-grape",
  blossom: "bg-blossom-soft text-blossom",
  ember: "bg-ember-soft text-ember",
  red: "bg-ember-soft text-destructive",
  pink: "bg-blossom-soft text-blossom",
};

/** Completion timeline (ms) */
const T = {
  fill: 0,
  full: 300,
  burst: 350,
  check: 400,
  xpPop: 450,
  banner: 700,
  move: 1000,
  settle: 1550,
  end: 1750,
};

type Phase = "idle" | "celebrate" | "moving" | "done";

export const QUEST_IDS = QUESTS.map((q) => q.id);

/** gap between two queued celebrations */
const QUEUE_GAP = 320;
/** quests celebrated with the full sequence before switching to condensed mode */
const FULL_CELEBRATION_LIMIT = 3;

export function Quests({ onEarnXp }: { onEarnXp: (amount: number, el: HTMLElement | null) => void }) {
  const { on, haptic } = useMotionLab();
  const { microBurst } = useFx();
  const { completed, celebrated, token, markCelebrated } = useQuestSim();
  const [phase, setPhase] = useState<Record<string, Phase>>({});
  const [order, setOrder] = useState<string[]>(QUESTS.map((q) => q.id));
  const [steps, setSteps] = useState(1);
  const [condensedNote, setCondensedNote] = useState<string | null>(null);
  const xpRefs = useRef<Record<string, HTMLElement | null>>({});
  const cardRefs = useRef<Record<string, HTMLElement | null>>({});
  const prevRects = useRef<Record<string, DOMRect>>({});
  const timers = useRef<number[]>([]);
  const state = useRef({ completed, celebrated, markCelebrated, onEarnXp, haptic, microBurst });
  state.current = { completed, celebrated, markCelebrated, onEarnXp, haptic, microBurst };
  const activeIds = order.filter((id) => (phase[id] ?? "idle") !== "done");
  const doneIds = order.filter((id) => phase[id] === "done");
  const activeCount = useCountUp(QUESTS.length + 3, on("entrance"), 900, 700);

  useEffect(() => () => timers.current.forEach((t) => window.clearTimeout(t)), []);

  /* ---- FLIP list reorder ---- */
  useLayoutEffect(() => {
    const next: Record<string, DOMRect> = {};
    Object.entries(cardRefs.current).forEach(([id, el]) => {
      if (!el) return;
      const rect = el.getBoundingClientRect();
      next[id] = rect;
      const prev = prevRects.current[id];
      if (!prev) return;
      const dy = prev.top - rect.top;
      const dx = prev.left - rect.left;
      if (Math.abs(dy) < 1 && Math.abs(dx) < 1) return;
      const moved = phase[id] === "done" || phase[id] === "moving";
      el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(${moved ? 0.96 : 1})`, opacity: moved ? 0.9 : 1 },
          { transform: "translate(0,0) scale(1)", opacity: 1 },
        ],
        {
          duration: moved ? 460 : 420,
          easing: "cubic-bezier(0.2, 1.25, 0.35, 1)",
          fill: "both",
        },
      );
    });
    prevRects.current = next;
  }, [order, phase]);

  /* ---- Page entry: detect quests completed elsewhere and celebrate them in a FIFO queue ---- */
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    const { completed: done, celebrated: seen } = state.current;

    // already-seen completions render straight into the completed list, no animation
    const silent = QUEST_IDS.filter((id) => done.includes(id) && seen.includes(id));
    const queue = QUEST_IDS.filter((id) => done.includes(id) && !seen.includes(id));

    setCondensedNote(null);
    setPhase(Object.fromEntries(silent.map((id) => [id, "done" as Phase])));
    setOrder([...QUEST_IDS.filter((id) => !silent.includes(id)), ...silent]);
    if (!queue.length) return;

    const wait = (ms: number) =>
      new Promise<void>((resolve) => {
        timers.current.push(window.setTimeout(resolve, ms));
      });

    const moveToDone = (id: string) => {
      setPhase((p) => ({ ...p, [id]: "moving" }));
      setOrder((o) => [...o.filter((x) => x !== id), id]);
    };

    const celebrate = async (id: string) => {
      const q = QUESTS.find((x) => x.id === id)!;
      const el = () => xpRefs.current[id] ?? cardRefs.current[id] ?? null;
      state.current.haptic("medium");
      setPhase((p) => ({ ...p, [id]: "celebrate" }));

      await wait(T.burst);
      if (cancelled) return;
      state.current.haptic("success");
      state.current.microBurst(el());

      await wait(T.xpPop - T.burst);
      if (cancelled) return;
      state.current.onEarnXp(q.xp, el());

      await wait(T.move - T.xpPop);
      if (cancelled) return;
      moveToDone(id);

      await wait(T.settle - 100 - T.move);
      if (cancelled) return;
      setPhase((p) => ({ ...p, [id]: "done" }));
      state.current.markCelebrated(id);

      await wait(T.end - (T.settle - 100));
    };

    const condense = async (ids: string[]) => {
      setCondensedNote(`+${ids.length} görev daha tamamlandı`);
      for (const id of ids) {
        if (cancelled) return;
        const q = QUESTS.find((x) => x.id === id)!;
        state.current.haptic("light");
        setPhase((p) => ({ ...p, [id]: "moving" }));
        setOrder((o) => [...o.filter((x) => x !== id), id]);
        state.current.onEarnXp(q.xp, xpRefs.current[id] ?? cardRefs.current[id] ?? null);
        await wait(240);
        if (cancelled) return;
        setPhase((p) => ({ ...p, [id]: "done" }));
        state.current.markCelebrated(id);
        await wait(160);
      }
      await wait(900);
      if (!cancelled) setCondensedNote(null);
    };

    (async () => {
      const full = queue.slice(0, FULL_CELEBRATION_LIMIT);
      const rest = queue.slice(FULL_CELEBRATION_LIMIT);
      for (const id of full) {
        if (cancelled) return;
        await celebrate(id);
        if (cancelled) return;
        await wait(QUEUE_GAP);
      }
      if (rest.length && !cancelled) await condense(rest);
    })();

    return () => {
      cancelled = true;
      timers.current.forEach((t) => window.clearTimeout(t));
      timers.current = [];
    };
  }, [token]);

  const byId = (id: string) => QUESTS.find((q) => q.id === id)!;

  return (
    <section className="mt-6 px-4">
      <header className="motion-stage flex items-end justify-between" style={delay(1000)}>
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">Görevlerini Tamamla</h2>
          <p className="text-xs text-ink-soft">
            <span
              key={activeIds.length}
              className="inline-block font-bold text-grape [animation:iclub-pop-in_420ms_var(--ease-spring)_both]"
            >
              {activeIds.length}
            </span>{" "}
            / {activeCount} Aktif Görev
          </p>
        </div>
        <div className="flex items-center gap-3">
          {condensedNote && (
            <span
              className="rounded-full bg-mint/15 px-2.5 py-1 text-[11px] font-bold text-mint [animation:iclub-pop-in_420ms_var(--ease-spring)_both]"
            >
              ✨ {condensedNote}
            </span>
          )}
          <button
            type="button"
            onClick={() => haptic("light")}
            className="group relative flex items-center gap-1 text-sm font-semibold text-ink-soft"
          >
            Tümü
            <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-grape transition-all duration-300 group-hover:w-full" />
          </button>
        </div>
      </header>

      <div className="mt-3 space-y-3">
        {activeIds.map((id, i) => (
          <QuestCard
            key={id}
            quest={byId(id)}
            index={i}
            phase={phase[id] ?? "idle"}
            steps={steps}
            onAdvanceStep={(el) => {
              if (steps >= 3) return;
              haptic("light");
              microBurst(el);
              setSteps((s) => s + 1);
            }}
            registerCard={(el) => {
              cardRefs.current[id] = el;
            }}
            registerXp={(el) => {
              xpRefs.current[id] = el;
            }}
          />
        ))}
      </div>

      {doneIds.length > 0 && (
        <div className="mt-6">
          <h3 className="flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-ink-soft uppercase [animation:iclub-rise_520ms_cubic-bezier(0.16,1,0.3,1)_both]">
            <Check className="size-3.5 text-mint" strokeWidth={4} />
            Tamamlanan Görevler
          </h3>
          <div className="mt-2.5 space-y-3">
            {doneIds.map((id, i) => (
              <QuestCard
                key={id}
                quest={byId(id)}
                index={i}
                phase="done"
                steps={3}
                onAdvanceStep={() => {}}
                registerCard={(el) => {
                  cardRefs.current[id] = el;
                }}
                registerXp={(el) => {
                  xpRefs.current[id] = el;
                }}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}


function QuestCard({
  quest: q,
  index,
  phase,
  steps,
  onAdvanceStep,
  onComplete,
  registerCard,
  registerXp,
}: {
  quest: Quest;
  index: number;
  phase: Phase;
  steps: number;
  onAdvanceStep: (el: HTMLElement) => void;
  onComplete: (el: HTMLElement | null) => void;
  registerCard: (el: HTMLElement | null) => void;
  registerXp: (el: HTMLElement | null) => void;
}) {
  const { on } = useMotionLab();
  const Icon = q.icon;
  const celebrating = phase === "celebrate" || phase === "moving";
  const finished = phase !== "idle";
  const [stage, setStage] = useState({ burst: false, check: false, xp: false, banner: false });
  const [settled, setSettled] = useState(false);

  useEffect(() => {
    if (phase !== "celebrate") return;
    const ts = [
      window.setTimeout(() => setStage((s) => ({ ...s, burst: true })), T.burst),
      window.setTimeout(() => setStage((s) => ({ ...s, check: true })), T.check),
      window.setTimeout(() => setStage((s) => ({ ...s, xp: true })), T.xpPop),
      window.setTimeout(() => setStage((s) => ({ ...s, banner: true })), T.banner),
      window.setTimeout(() => setStage((s) => ({ ...s, banner: false })), T.move + 300),
      window.setTimeout(() => setStage((s) => ({ ...s, burst: false })), T.burst + 1200),
    ];
    return () => ts.forEach(window.clearTimeout);
  }, [phase]);

  useEffect(() => {
    if (phase !== "done") return;
    setStage({ burst: false, check: true, xp: false, banner: false });
    setSettled(false);
    const t = window.setTimeout(() => setSettled(true), 60);
    const t2 = window.setTimeout(() => setSettled(false), 900);
    return () => {
      window.clearTimeout(t);
      window.clearTimeout(t2);
    };
  }, [phase]);

  const pct = q.progress
    ? finished
      ? 100
      : (q.progress.current / q.progress.total) * 100
    : 0;

  return (
    <article
      ref={registerCard}
      className={cn(
        "motion-stage relative overflow-hidden rounded-2xl bg-card p-3.5 shadow-[var(--shadow-card)]",
        on("questCards") && !finished && "quest-lift",
        celebrating && "quest-puf",
        settled && "quest-settle",
        phase === "done" && "ring-1 ring-mint/40",
      )}
      style={delay(1120 + index * 80)}
    >
      {finished && (
        <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.72_0.16_165/0.16),transparent_60%)]" />
      )}
      {stage.burst && (
        <>
          <span className="pointer-events-none absolute inset-0 quest-success-glow" />
          <span className="pointer-events-none absolute bottom-3 right-4 size-6 -translate-x-1/2 rounded-full border-2 border-mint quest-ring" />
          {Array.from({ length: 10 }).map((_, i) => (
            <span
              key={i}
              className="pointer-events-none absolute bottom-4 right-5 block size-1.5 rounded-full"
              style={{
                background: i % 3 === 0 ? "var(--ember)" : i % 3 === 1 ? "var(--mint)" : "var(--grape)",
                ["--cx" as string]: `${Math.cos((i / 10) * Math.PI * 2) * (40 + Math.random() * 30)}px`,
                ["--cy" as string]: `${Math.sin((i / 10) * Math.PI * 2) * (26 + Math.random() * 20)}px`,
                ["--cr" as string]: "180deg",
                animation: `iclub-burst ${520 + i * 24}ms cubic-bezier(0.2,0.7,0.3,1) both`,
              }}
            />
          ))}
        </>
      )}

      {stage.banner && (
        <span
          className="pointer-events-none absolute right-3 top-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-black text-primary-foreground shadow-[var(--shadow-lift)] [animation:iclub-pop-in_460ms_var(--ease-spring)_both]"
          style={{ background: "var(--gradient-ember)" }}
        >
          ✨ Görev Tamamlandı!
        </span>
      )}

      <div className="relative flex items-start gap-3">
        <span
          className={cn(
            "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl",
            stage.check ? "bg-mint/20 text-mint" : ICON_SOFT[q.iconTone],
            on("idle") && !finished && q.iconIdle,
          )}
          style={delay(index * 640)}
        >
          {stage.check ? (
            <Check className="size-5 quest-check-pop" strokeWidth={4} />
          ) : (
            <Icon className="size-5" />
          )}
          {settled && (
            <Sparkles className="pointer-events-none absolute -right-0.5 -top-0.5 size-3 text-ember [animation:iclub-sparkle_900ms_ease-out_both]" />
          )}
          {q.id === "ipuan" && on("idle") && !finished && (
            <span className="pointer-events-none absolute inset-x-0 h-1/2 bg-[linear-gradient(180deg,transparent,oklch(0.7_0.19_42/0.45))] [animation:iclub-scanline_2600ms_ease-in-out_infinite]" />
          )}
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-sm leading-snug font-extrabold text-ink">{q.title}</h3>
            {phase === "done" ? (
              <span className="flex shrink-0 items-center gap-1 rounded-full bg-mint/15 px-3 py-1.5 text-[11px] font-bold text-mint">
                <Check className="size-3" strokeWidth={4} />
                Tamamlandı
              </span>
            ) : (
              <button
                type="button"
                disabled={finished}
                onClick={(e) => onComplete(e.currentTarget)}
                className={cn(
                  "press-spring shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold text-primary-foreground shadow-[var(--shadow-card)]",
                  on("cta") && "shine-sweep",
                  on("cta") && q.id === "game" && "idle-breathe",
                  on("cta") && q.ctaTone === "ember" && "shadow-[var(--shadow-glow-ember)]",
                  on("cta") && q.ctaTone === "pink" && "drift-gradient",
                  on("cta") && q.id === "carrefour" && "idle-cart",
                )}
                style={{ background: CTA_BG[q.ctaTone], ...delay(index * 520) }}
              >
                {finished ? "Tamamlandı" : q.cta}
              </button>
            )}
          </div>

          {q.note && phase !== "done" && <p className="mt-1 text-[11px] text-ink-soft">{q.note}</p>}

          {q.xp > 0 && (
            <p
              ref={registerXp}
              className={cn(
                "relative mt-1 inline-block text-sm font-extrabold",
                phase === "done" ? "text-mint" : "text-grape",
                on("idle") && !finished && "idle-breathe",
                stage.xp && "quest-xp-pop",
              )}
              style={delay(index * 430)}
            >
              +{q.xp} XP{phase === "done" ? " Kazanıldı" : ""}
              {stage.xp && phase !== "done" && (
                <span className="pointer-events-none absolute -top-1 left-0 text-sm font-black text-ember [animation:iclub-xp-float-up_1100ms_ease-out_both]">
                  +{q.xp} XP
                </span>
              )}
            </p>
          )}

          {q.progress && (
            <ProgressRow
              pct={pct}
              value={finished ? q.progress.total : q.progress.current}
              total={q.progress.total}
              unit={q.progress.unit}
              rushing={celebrating}
              complete={phase === "done"}
            />
          )}

          {q.steps && (
            <StepRow
              steps={q.steps}
              current={finished ? 3 : steps}
              onAdvance={onAdvanceStep}
              complete={phase === "done"}
            />
          )}

        </div>
      </div>
    </article>
  );
}

function ProgressRow({
  pct,
  value,
  total,
  unit,
  rushing,
  complete,
}: {
  pct: number;
  value: number;
  total: number;
  unit: string;
  rushing: boolean;
  complete: boolean;
}) {
  const { on } = useMotionLab();
  const [w, setW] = useState(0);
  const shown = useCountUp(value, on("progress"), rushing ? 320 : 1100, rushing ? 0 : 300);

  useEffect(() => {
    const t = window.setTimeout(() => setW(pct), 60);
    return () => window.clearTimeout(t);
  }, [pct]);

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-[11px] text-ink-soft">
        <span>Görev İlerlemen</span>
        <span className={cn("font-bold", complete ? "text-mint" : "text-grape")}>
          {shown}/{total} {unit} {complete && "✓"}
        </span>
      </div>
      <div className="relative mt-1 h-2 rounded-full bg-muted">
        <div
          className="bar-energy absolute inset-y-0 left-0 rounded-full"
          style={{
            width: `${w}%`,
            background: complete ? "linear-gradient(90deg, oklch(0.72 0.16 165), oklch(0.8 0.16 150))" : "var(--gradient-grape)",
            transition: `width ${rushing ? 320 : 1100}ms cubic-bezier(0.16,1,0.3,1)`,
          }}
        />
        <span
          className={cn(
            "absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface transition-[left]",
            rushing ? "shadow-[0_0_16px_6px_oklch(0.75_0.19_55/0.85)]" : "shadow-[0_0_10px_3px_oklch(0.55_0.22_300/0.7)]",
          )}
          style={{
            left: `${w}%`,
            transitionDuration: rushing ? "320ms" : "1100ms",
            transitionTimingFunction: "cubic-bezier(0.16,1,0.3,1)",
          }}
        />
      </div>
    </div>
  );
}

function StepRow({
  steps,
  current,
  onAdvance,
  complete,
}: {
  steps: { label: string }[];
  current: number;
  onAdvance: (el: HTMLElement) => void;
  complete: boolean;
}) {
  const { on } = useMotionLab();
  return (
    <div className="mt-2">
      <p className="text-[11px] text-ink-soft">Görev İlerlemen</p>
      <div className="mt-1.5 flex gap-1.5">
        {steps.map((s, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <button
              key={s.label}
              type="button"
              onClick={(e) => onAdvance(e.currentTarget)}
              className="group flex-1 text-left"
            >
              <span className="relative block h-1.5 overflow-hidden rounded-full bg-muted">
                <span
                  className="absolute inset-0 origin-left rounded-full"
                  style={{
                    background: complete
                      ? "linear-gradient(90deg, oklch(0.72 0.16 165), oklch(0.8 0.16 150))"
                      : "var(--gradient-ember)",
                    transform: done ? "scaleX(1)" : "scaleX(0)",
                    transition: "transform 700ms cubic-bezier(0.16,1,0.3,1)",
                  }}
                />
              </span>
              <span
                className={cn(
                  "mt-1 flex items-center gap-1 text-[10px] font-semibold",
                  complete ? "text-mint" : done ? "text-destructive" : active ? "text-ink-soft" : "text-ink-soft/50",
                  active && on("progress") && !complete && "idle-breathe",
                )}
              >
                {done && (
                  <Check
                    className="size-3 [animation:iclub-pop-in_450ms_var(--ease-spring)_both]"
                    strokeWidth={4}
                  />
                )}
                {s.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
