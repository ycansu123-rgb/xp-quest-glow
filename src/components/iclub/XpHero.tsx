import { useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Check,
  Coffee,
  Gift,
  HelpCircle,
  Lock,
  Sparkles,
  Ticket,
  Car,
  Clapperboard,
} from "lucide-react";
import { delay, useMotionLab } from "@/lib/motion-lab";
import { useCountUp, useFx } from "./effects";
import { cn } from "@/lib/utils";

export type RewardNode = {
  xp: number;
  title: string;
  subtitle: string;
  icon: typeof Coffee;
  tone: "grape" | "ember" | "blossom";
};

export const REWARD_NODES: RewardNode[] = [
  {
    xp: 250,
    title: "Bedava Kahve",
    subtitle: "Espresso Lab'da 250 TL değerinde",
    icon: Coffee,
    tone: "grape",
  },
  {
    xp: 350,
    title: "Harcama Kodu",
    subtitle: "Amazon'da geçerli",
    icon: Ticket,
    tone: "ember",
  },
  {
    xp: 450,
    title: "Opet Ultra Temiz",
    subtitle: "Araç yıkama kodu",
    icon: Car,
    tone: "blossom",
  },
  {
    xp: 600,
    title: "Sinema Bileti",
    subtitle: "Hafta içi tüm seanslar",
    icon: Clapperboard,
    tone: "grape",
  },
];

const MAX_XP = 700;

const TONE_BG: Record<RewardNode["tone"], string> = {
  grape: "var(--gradient-grape)",
  ember: "var(--gradient-ember)",
  blossom: "var(--gradient-blossom)",
};

export function XpHero({
  xp,
  justUnlocked,
  onEasterEgg,
}: {
  xp: number;
  justUnlocked: number | null;
  onEasterEgg: () => void;
}) {
  const { on, haptic, replayKey } = useMotionLab();
  const { registerXpTarget, microBurst, confetti, screenFlash } = useFx();
  const barRef = useRef<HTMLDivElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const [fill, setFill] = useState(0);
  const [impact, setImpact] = useState(false);
  const [tapCount, setTapCount] = useState(0);
  const [nice, setNice] = useState(false);
  const [shakeLock, setShakeLock] = useState<number | null>(null);
  const [activeCard, setActiveCard] = useState(0);
  const [scrollP, setScrollP] = useState(0);

  const pct = useMemo(() => Math.min(100, (xp / MAX_XP) * 100), [xp]);
  const xpDisplay = useCountUp(xp, on("xpBar"), 1200, 450);

  useEffect(() => {
    registerXpTarget(barRef.current);
  }, [registerXpTarget]);

  // animated fill 0 -> pct on mount / replay, then follows xp
  useEffect(() => {
    if (!on("xpBar")) {
      setFill(pct);
      return;
    }
    setFill(0);
    const t = window.setTimeout(() => setFill(pct), 420);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [replayKey]);

  useEffect(() => {
    setFill(pct);
    setImpact(true);
    const t = window.setTimeout(() => setImpact(false), 700);
    return () => window.clearTimeout(t);
  }, [pct]);

  // reward unlock celebration
  useEffect(() => {
    if (justUnlocked == null) return;
    screenFlash("ember");
    haptic("success");
    const el = scrollerRef.current?.querySelector<HTMLElement>(`[data-node="${justUnlocked}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
      window.setTimeout(() => confetti(el, 54), 260);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [justUnlocked]);

  const onScroll = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setScrollP(el.scrollLeft);
    const cardW = el.scrollWidth / REWARD_NODES.length;
    setActiveCard(Math.round(el.scrollLeft / cardW));
  };

  const tapXp = () => {
    if (!on("easterEgg")) return;
    const next = tapCount + 1;
    setTapCount(next);
    window.setTimeout(() => setTapCount((c) => Math.max(0, c - 1)), 1400);
    if (next >= 4) {
      setTapCount(0);
      setNice(true);
      haptic("success");
      confetti(barRef.current, 30);
      onEasterEgg();
      window.setTimeout(() => setNice(false), 1200);
    }
  };

  return (
    <section className="px-4">
      {/* Hero card */}
      <div
        className="motion-stage relative overflow-hidden rounded-3xl p-4 pb-6 shadow-[var(--shadow-card)]"
        style={{ ...delay(60), background: "var(--gradient-hero)" }}
      >
        <div
          className="drift-gradient pointer-events-none absolute inset-0 opacity-70"
          style={{ background: "var(--gradient-premium)", mixBlendMode: "soft-light" }}
        />

        <div className="relative flex items-start justify-between gap-2">
          <div className="motion-stage-drop" style={delay(160)}>
            <h1 className="font-display text-lg font-extrabold text-grape-deep">
              Onur <span className="font-semibold text-ink/70">Yıldız</span>
            </h1>
            <p className="mt-0.5 flex items-center gap-1 text-xs font-semibold text-ember">
              <Sparkles className="idle-wiggle size-3.5" style={delay(400)} />
              iClup Üyesi
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className="motion-stage-drop flex items-center gap-1 rounded-full bg-surface/80 px-2.5 py-1 text-[11px] font-semibold text-ink/80 backdrop-blur"
              style={delay(230)}
            >
              <CalendarDays className="idle-tick size-3.5 text-grape" style={delay(1200)} />
              30 Gün Kaldı!
            </span>
            <button
              type="button"
              onClick={() => haptic("light")}
              className="shine-sweep press-spring motion-stage-drop flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold text-primary-foreground shadow-[var(--shadow-card)]"
              style={{ ...delay(300), background: "var(--gradient-ember)" }}
            >
              <HelpCircle className="size-3.5" />
              iClup Nedir?
            </button>
          </div>
        </div>

        {/* XP TRACK */}
        <div
          className="relative mt-8 select-none"
          onClick={tapXp}
          style={{ touchAction: "manipulation" }}
        >
          {/* current xp chip */}
          <div
            className="absolute -top-7 z-20 transition-[left] duration-[1200ms] ease-[var(--ease-out-game)]"
            style={{ left: `calc(${fill}% - 26px)` }}
          >
            <span
              className={cn(
                "block rounded-full px-2 py-0.5 text-[10px] font-extrabold text-primary-foreground shadow-[var(--shadow-glow-ember)]",
                on("xpGlow") && "idle-breathe",
              )}
              style={{ background: "var(--gradient-ember)" }}
            >
              {xpDisplay} XP
            </span>
          </div>

          <div
            ref={barRef}
            className="relative h-2.5 w-full rounded-full bg-surface/70 shadow-inner"
          >
            <div
              className={cn(
                "bar-energy absolute inset-y-0 left-0 rounded-full",
                impact && on("xpBar") && "shadow-[0_0_22px_4px_oklch(0.7_0.2_320/0.75)]",
              )}
              style={{
                width: `${fill}%`,
                background: "var(--gradient-xp)",
                transition: "width 1200ms cubic-bezier(0.16,1,0.3,1), box-shadow 400ms ease",
              }}
            />
            {/* glowing head */}
            <span
              className="pointer-events-none absolute top-1/2 z-10 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-surface shadow-[0_0_14px_4px_oklch(0.72_0.2_45/0.8)] transition-[left] duration-[1200ms] ease-[var(--ease-out-game)]"
              style={{ left: `${fill}%` }}
            >
              {on("xpParticles") && (
                <span className="absolute inset-0 rounded-full border-2 border-ember [animation:iclub-pulse-ring_1800ms_ease-out_infinite]" />
              )}
            </span>

            {/* nodes */}
            {REWARD_NODES.map((n, i) => {
              const unlocked = xp >= n.xp;
              const isNext = !unlocked && REWARD_NODES.findIndex((m) => xp < m.xp) === i;
              return (
                <button
                  key={n.xp}
                  type="button"
                  aria-label={`${n.xp} XP ödülü`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (unlocked) {
                      haptic("medium");
                      microBurst(e.currentTarget);
                    } else {
                      haptic("warning");
                      setShakeLock(n.xp);
                      window.setTimeout(() => setShakeLock(null), 520);
                    }
                  }}
                  className="motion-stage-pop absolute top-1/2 z-10 -translate-x-1/2 -translate-y-1/2"
                  style={{ left: `${(n.xp / MAX_XP) * 100}%`, ...delay(600 + i * 110) }}
                >
                  <span
                    className={cn(
                      "relative flex size-5 items-center justify-center rounded-full ring-4",
                      unlocked
                        ? "bg-grape ring-surface/80"
                        : "bg-surface ring-surface/60 shadow-[inset_0_0_0_2px_oklch(0.88_0.02_300)]",
                      isNext && on("xpGlow") && "idle-breathe",
                    )}
                  >
                    {unlocked && <Check className="size-3 text-primary-foreground" strokeWidth={4} />}
                    {isNext && on("xpParticles") && (
                      <>
                        <span className="absolute inset-0 rounded-full border-2 border-grape [animation:iclub-pulse-ring_2000ms_ease-out_infinite]" />
                        <span className="absolute inset-0 flex items-center justify-center">
                          <span className="size-1 rounded-full bg-ember [animation:iclub-orbit_3200ms_linear_infinite]" />
                        </span>
                      </>
                    )}
                  </span>
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-[10px] font-bold whitespace-nowrap text-ink/55">
                    {n.xp} XP
                  </span>
                </button>
              );
            })}
          </div>

          {nice && (
            <span className="pointer-events-none absolute left-1/2 -top-12 -translate-x-1/2 font-display text-xl font-black text-grape [animation:iclub-tada_800ms_var(--ease-spring)_both]">
              Nice! 🎉
            </span>
          )}
        </div>

        {/* REWARD PATH */}
        <div
          ref={scrollerRef}
          onScroll={onScroll}
          className="no-scrollbar mt-9 flex snap-x snap-mandatory gap-3 overflow-x-auto pb-1"
          style={{ perspective: "900px" }}
        >
          {REWARD_NODES.map((n, i) => {
            const unlocked = xp >= n.xp;
            const isActive = i === activeCard;
            const Icon = n.icon;
            const justOpened = justUnlocked === n.xp;
            return (
              <article
                key={n.xp}
                data-node={n.xp}
                className={cn(
                  "motion-stage-pop press-spring relative w-[62%] shrink-0 snap-center overflow-hidden rounded-2xl p-3 text-left",
                  unlocked ? "text-primary-foreground" : "bg-surface/85 text-ink",
                )}
                style={{
                  ...delay(760 + i * 120),
                  background: unlocked ? TONE_BG[n.tone] : undefined,
                  transform: on("rewardCards")
                    ? `scale(${isActive ? 1 : 0.94}) translateY(${isActive ? 0 : 4}px)`
                    : undefined,
                  transition: "transform 380ms var(--ease-spring), box-shadow 380ms ease",
                  boxShadow: isActive ? "var(--shadow-lift)" : "var(--shadow-card)",
                  ["--tw-translate-x" as string]: undefined,
                }}
                onClick={(e) => {
                  haptic(unlocked ? "medium" : "warning");
                  if (unlocked) microBurst(e.currentTarget);
                  else {
                    setShakeLock(n.xp);
                    window.setTimeout(() => setShakeLock(null), 520);
                  }
                }}
              >
                {unlocked && on("rewardCards") && (
                  <span
                    className="pointer-events-none absolute -inset-8 opacity-60"
                    style={{
                      background:
                        "radial-gradient(circle at 30% 20%, oklch(1 0 0 / 0.35), transparent 60%)",
                      animation: `iclub-glow-soft ${3200 + i * 400}ms ease-in-out infinite`,
                    }}
                  />
                )}

                {/* gift / lock badge */}
                <span
                  className={cn(
                    "absolute -top-0.5 right-3 flex size-8 items-center justify-center rounded-full bg-surface shadow-[var(--shadow-card)]",
                    unlocked && on("giftIdle") && "idle-float",
                    !unlocked && on("locks") && "idle-breathe",
                    shakeLock === n.xp && "[animation:iclub-shake_450ms_ease-in-out_both]",
                  )}
                  style={delay(i * 850)}
                >
                  {unlocked ? (
                    <Gift className="size-4 text-grape" />
                  ) : (
                    <Lock
                      className={cn(
                        "size-4 text-ember",
                        justOpened && "[animation:iclub-lock-open_700ms_ease-in_both]",
                      )}
                    />
                  )}
                  {!unlocked && on("locks") && (
                    <span className="pointer-events-none absolute inset-0 rounded-full border border-ember/50 [animation:iclub-pulse-ring_2600ms_ease-out_infinite]" />
                  )}
                </span>

                <span
                  className={cn(
                    "flex size-9 items-center justify-center rounded-xl",
                    unlocked ? "bg-surface/25" : "bg-grape-soft",
                    on("giftIdle") && "idle-wiggle",
                  )}
                  style={delay(i * 700)}
                >
                  <Icon className={cn("size-5", unlocked ? "" : "text-grape")} />
                </span>

                <h3
                  className={cn(
                    "mt-2 font-display text-sm font-extrabold",
                    justOpened && "[animation:iclub-card-reveal_650ms_var(--ease-spring)_both]",
                  )}
                >
                  {n.title}
                </h3>
                <p className={cn("text-[11px] leading-tight", unlocked ? "opacity-85" : "text-ink-soft")}>
                  {n.subtitle}
                </p>

                <span
                  className={cn(
                    "mt-2 inline-block rounded-full px-2.5 py-1 text-[10px] font-bold",
                    unlocked
                      ? "shine-sweep bg-surface/25 text-primary-foreground"
                      : "bg-ember-soft text-ember",
                  )}
                >
                  {unlocked ? `${n.xp} XP · Ödülünü Al` : `${n.xp} XP · Kilitli`}
                </span>

                {justOpened && (
                  <span className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(circle,oklch(1_0_0/0.7),transparent_65%)] [animation:iclub-flash_700ms_ease-out_both]" />
                )}
              </article>
            );
          })}
        </div>
        <div className="mt-2 flex justify-center gap-1.5">
          {REWARD_NODES.map((n, i) => (
            <span
              key={n.xp}
              className={cn(
                "h-1 rounded-full transition-all duration-300",
                i === activeCard ? "w-5 bg-grape" : "w-1.5 bg-grape/25",
              )}
            />
          ))}
        </div>
        <span className="sr-only">{scrollP}</span>
      </div>
    </section>
  );
}
