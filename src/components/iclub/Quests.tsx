import { useRef, useState } from "react";
import {
  ArrowRight,
  Check,
  Gamepad2,
  Gift,
  QrCode,
  ShoppingCart,
  Wallet,
} from "lucide-react";
import { delay, useMotionLab } from "@/lib/motion-lab";
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
    xp: 0,
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

export function Quests({ onEarnXp }: { onEarnXp: (amount: number, el: HTMLElement | null) => void }) {
  const { on, haptic } = useMotionLab();
  const { microBurst, confetti } = useFx();
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [pulsing, setPulsing] = useState<string | null>(null);
  const [steps, setSteps] = useState(1);
  const [floaters, setFloaters] = useState<{ id: number; quest: string; xp: number }[]>([]);
  const xpRefs = useRef<Record<string, HTMLElement | null>>({});
  const activeCount = useCountUp(QUESTS.length + 3, on("entrance"), 900, 700);

  const complete = (q: Quest, el: HTMLElement | null) => {
    if (completed[q.id]) return;
    haptic("medium");
    setCompleted((c) => ({ ...c, [q.id]: true }));
    setPulsing(q.id);
    window.setTimeout(() => setPulsing(null), 700);
    if (on("questComplete")) {
      microBurst(el);
      const fid = Date.now();
      setFloaters((f) => [...f, { id: fid, quest: q.id, xp: q.xp }]);
      window.setTimeout(() => setFloaters((f) => f.filter((x) => x.id !== fid)), 1200);
    }
    onEarnXp(q.xp, xpRefs.current[q.id] ?? el);
  };

  return (
    <section className="mt-6 px-4">
      <header className="motion-stage flex items-end justify-between" style={delay(1000)}>
        <div>
          <h2 className="font-display text-xl font-extrabold text-ink">Görevlerini Tamamla</h2>
          <p className="text-xs text-ink-soft">{activeCount} Aktif Görev</p>
        </div>
        <button
          type="button"
          onClick={() => haptic("light")}
          className="group relative flex items-center gap-1 text-sm font-semibold text-ink-soft"
        >
          Tümü
          <ArrowRight className="size-3.5 transition-transform duration-300 group-hover:translate-x-1" />
          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-grape transition-all duration-300 group-hover:w-full" />
        </button>
      </header>

      <div className="mt-3 space-y-3">
        {QUESTS.map((q, i) => {
          const Icon = q.icon;
          const done = completed[q.id];
          const pct = q.progress
            ? done
              ? 100
              : (q.progress.current / q.progress.total) * 100
            : 0;
          return (
            <article
              key={q.id}
              className={cn(
                "motion-stage relative overflow-hidden rounded-2xl bg-card p-3.5 shadow-[var(--shadow-card)]",
                on("questCards") && "quest-lift",
                pulsing === q.id && "[animation:iclub-press_650ms_var(--ease-spring)_both]",
              )}
              style={delay(1120 + i * 80)}
            >
              {done && (
                <span className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,oklch(0.72_0.16_165/0.18),transparent_60%)]" />
              )}
              <div className="relative flex items-start gap-3">
                <span
                  className={cn(
                    "relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-xl",
                    ICON_SOFT[q.iconTone],
                    on("idle") && q.iconIdle,
                  )}
                  style={delay(i * 640)}
                >
                  <Icon className="size-5" />
                  {q.id === "ipuan" && on("idle") && (
                    <span className="pointer-events-none absolute inset-x-0 h-1/2 bg-[linear-gradient(180deg,transparent,oklch(0.7_0.19_42/0.45))] [animation:iclub-scanline_2600ms_ease-in-out_infinite]" />
                  )}
                </span>

                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-display text-sm leading-snug font-extrabold text-ink">
                      {q.title}
                    </h3>
                    <button
                      type="button"
                      onClick={(e) => complete(q, e.currentTarget)}
                      className={cn(
                        "press-spring shrink-0 rounded-full px-3 py-1.5 text-[11px] font-bold text-primary-foreground shadow-[var(--shadow-card)]",
                        on("cta") && "shine-sweep",
                        on("cta") && q.id === "game" && "idle-breathe",
                        on("cta") && q.ctaTone === "ember" && "shadow-[var(--shadow-glow-ember)]",
                        on("cta") && q.ctaTone === "pink" && "drift-gradient",
                        on("cta") && q.id === "carrefour" && "idle-cart",
                      )}
                      style={{ background: CTA_BG[q.ctaTone], ...delay(i * 520) }}
                    >
                      {done ? "Tamamlandı" : q.cta}
                    </button>
                  </div>

                  {q.note && <p className="mt-1 text-[11px] text-ink-soft">{q.note}</p>}

                  {q.xp > 0 && (
                    <p
                      ref={(el) => {
                        xpRefs.current[q.id] = el;
                      }}
                      className={cn(
                        "relative mt-1 inline-block text-sm font-extrabold text-grape",
                        on("idle") && "idle-breathe",
                        done && "[animation:iclub-tada_700ms_var(--ease-spring)_both]",
                      )}
                      style={delay(i * 430)}
                    >
                      +{q.xp} XP
                      {floaters
                        .filter((f) => f.quest === q.id)
                        .map((f) => (
                          <span
                            key={f.id}
                            className="pointer-events-none absolute -top-1 left-0 text-sm font-black text-ember [animation:iclub-xp-float-up_1100ms_ease-out_both]"
                          >
                            +{f.xp} XP
                          </span>
                        ))}
                      {done && (
                        <Check
                          className="ml-1 inline size-4 text-mint [animation:iclub-pop-in_500ms_var(--ease-spring)_both]"
                          strokeWidth={4}
                        />
                      )}
                    </p>
                  )}

                  {q.progress && (
                    <ProgressRow
                      pct={pct}
                      value={done ? q.progress.total : q.progress.current}
                      total={q.progress.total}
                      unit={q.progress.unit}
                    />
                  )}

                  {q.steps && (
                    <StepRow
                      steps={q.steps}
                      current={done ? 3 : steps}
                      onAdvance={(el) => {
                        if (steps >= 3) return;
                        haptic("light");
                        microBurst(el);
                        setSteps((s) => s + 1);
                      }}
                    />
                  )}
                </div>
              </div>

              {done && q.id === "carrefour" && confetti === undefined && null}
            </article>
          );
        })}
      </div>
    </section>
  );
}

function ProgressRow({
  pct,
  value,
  total,
  unit,
}: {
  pct: number;
  value: number;
  total: number;
  unit: string;
}) {
  const { on } = useMotionLab();
  const [w, setW] = useState(0);
  const shown = useCountUp(value, on("progress"), 1100, 300);
  const ref = useRef<HTMLDivElement | null>(null);

  // fill in when mounted / when pct changes
  useState(() => {
    window.setTimeout(() => setW(pct), 250);
  });
  if (on("progress") ? false : w !== pct) setW(pct);
  if (w !== pct && pct === 100) setW(100);

  return (
    <div className="mt-2">
      <div className="flex items-center justify-between text-[11px] text-ink-soft">
        <span>Görev İlerlemen</span>
        <span className="font-bold text-grape">
          {shown}/{total} {unit}
        </span>
      </div>
      <div ref={ref} className="relative mt-1 h-2 rounded-full bg-muted">
        <div
          className={cn("bar-energy absolute inset-y-0 left-0 rounded-full")}
          style={{
            width: `${w}%`,
            background: "var(--gradient-grape)",
            transition: "width 1100ms cubic-bezier(0.16,1,0.3,1)",
          }}
        />
        <span
          className="absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface shadow-[0_0_10px_3px_oklch(0.55_0.22_300/0.7)] transition-[left] duration-[1100ms] ease-[var(--ease-out-game)]"
          style={{ left: `${w}%` }}
        />
      </div>
    </div>
  );
}

function StepRow({
  steps,
  current,
  onAdvance,
}: {
  steps: { label: string }[];
  current: number;
  onAdvance: (el: HTMLElement) => void;
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
                  className={cn("absolute inset-0 origin-left rounded-full")}
                  style={{
                    background: "var(--gradient-ember)",
                    transform: done ? "scaleX(1)" : "scaleX(0)",
                    transition: "transform 700ms cubic-bezier(0.16,1,0.3,1)",
                  }}
                />
              </span>
              <span
                className={cn(
                  "mt-1 flex items-center gap-1 text-[10px] font-semibold",
                  done ? "text-destructive" : active ? "text-ink-soft" : "text-ink-soft/50",
                  active && on("progress") && "idle-breathe",
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
