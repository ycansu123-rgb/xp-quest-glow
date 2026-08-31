import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft } from "lucide-react";
import { MotionLabProvider, useMotionLab } from "@/lib/motion-lab";
import { FxProvider, useFx } from "@/components/iclub/effects";
import { REWARD_NODES, XpHero } from "@/components/iclub/XpHero";
import { Quests } from "@/components/iclub/Quests";
import { Campaigns, PerksCard, StatusCard } from "@/components/iclub/StatusCard";
import { MotionLabPanel } from "@/components/iclub/MotionLabPanel";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "iClub XP — Oyunlaştırılmış Sadakat Deneyimi" },
      {
        name: "description",
        content:
          "iClub XP progression ekranı: XP barı, ödül yolu, görevler ve oyun hissi veren mikro etkileşimlerle canlı bir sadakat deneyimi.",
      },
      { property: "og:title", content: "iClub XP — Oyunlaştırılmış Sadakat Deneyimi" },
      {
        property: "og:description",
        content:
          "XP kazan, checkpoint'leri aç, ödülleri topla. Motion Lab ile tüm animasyonları tek tek dene.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Page,
});

function Page() {
  return (
    <MotionLabProvider>
      <FxProvider>
        <Screen />
        <MotionLabPanel />
      </FxProvider>
    </MotionLabProvider>
  );
}

function Screen() {
  const { on, haptic, replayKey } = useMotionLab();
  const { confetti, screenFlash } = useFx();
  const [xp, setXp] = useState(300);
  const [justUnlocked, setJustUnlocked] = useState<number | null>(null);
  const [scrollY, setScrollY] = useState(0);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const { flyXp } = useFx();

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrollY(window.scrollY));
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  const earnXp = useCallback(
    (amount: number, el: HTMLElement | null) => {
      if (amount <= 0) return;
      flyXp(el, amount, () => {
        setXp((prev) => {
          const next = prev + amount;
          const crossed = REWARD_NODES.filter((n) => prev < n.xp && next >= n.xp);
          if (crossed.length) {
            const top = crossed[crossed.length - 1];
            if (top) window.setTimeout(() => setJustUnlocked(top.xp), 260);
            window.setTimeout(() => setJustUnlocked(null), 2600);
          }
          return next;
        });
      });
    },
    [flyXp],
  );

  const compress = Math.min(1, scrollY / 120);

  return (
    <main
      ref={rootRef}
      key={replayKey}
      className="relative mx-auto min-h-screen w-full max-w-md overflow-x-hidden bg-background"
    >
      {/* ambient background */}
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          background:
            "radial-gradient(circle at 15% -5%, oklch(0.9 0.07 300 / 0.85), transparent 55%), radial-gradient(circle at 95% 5%, oklch(0.92 0.07 45 / 0.8), transparent 50%)",
          transform: on("parallax") ? `translateY(${scrollY * -0.08}px)` : undefined,
        }}
      />

      <header
        className="sticky top-0 z-40 px-4 backdrop-blur-md"
        style={{
          paddingTop: `${18 - compress * 8}px`,
          paddingBottom: `${12 - compress * 5}px`,
          background: `oklch(0.98 0.006 300 / ${0.15 + compress * 0.75})`,
        }}
      >
        <button
          type="button"
          onClick={() => haptic("light")}
          className="press-spring motion-stage-drop flex size-9 items-center justify-center rounded-xl bg-card shadow-[var(--shadow-card)]"
          style={{ transform: `scale(${1 - compress * 0.12})` }}
        >
          <ArrowLeft className="size-4 text-ink" />
        </button>
      </header>

      <div
        className={cn("pb-2")}
        style={{
          transform: on("parallax") ? `translateY(${scrollY * -0.04}px)` : undefined,
          willChange: "transform",
        }}
      >
        <XpHero
          xp={xp}
          justUnlocked={justUnlocked}
          onEasterEgg={() => {
            screenFlash("grape");
          }}
        />
      </div>

      <StatusCard />
      <Quests onEarnXp={earnXp} />
      <PerksCard />
      <Campaigns />

      {justUnlocked != null && (
        <div className="pointer-events-none fixed inset-x-0 top-24 z-[75] flex justify-center">
          <span
            className="rounded-full px-4 py-2 font-display text-sm font-black text-primary-foreground shadow-[var(--shadow-lift)] [animation:iclub-pop-in_600ms_var(--ease-spring)_both]"
            style={{ background: "var(--gradient-ember)" }}
            onAnimationStart={() => confetti(rootRef.current, 40)}
          >
            🎉 Ödül Açıldı! {justUnlocked} XP
          </span>
        </div>
      )}
    </main>
  );
}
