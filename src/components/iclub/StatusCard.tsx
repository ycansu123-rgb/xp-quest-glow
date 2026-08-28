import { Gift, Sparkles, Trophy, PartyPopper } from "lucide-react";
import { delay, useMotionLab } from "@/lib/motion-lab";
import { useFx } from "./effects";
import { cn } from "@/lib/utils";

export function StatusCard() {
  const { on, haptic } = useMotionLab();
  const { microBurst } = useFx();

  return (
    <section className="mt-4 px-4">
      <button
        type="button"
        onClick={(e) => {
          haptic("light");
          microBurst(e.currentTarget);
        }}
        className={cn(
          "motion-stage press-spring relative w-full overflow-hidden rounded-2xl bg-card p-3.5 text-left shadow-[var(--shadow-card)]",
          on("cta") && "shine-sweep",
        )}
        style={delay(900)}
      >
        <span
          className={cn(
            "pointer-events-none absolute inset-0 opacity-60",
            on("idle") && "drift-gradient",
          )}
          style={{ background: "var(--gradient-premium)", filter: "saturate(1.2)" }}
        />
        <span className="relative flex items-center gap-3">
          <span
            className={cn(
              "flex size-10 items-center justify-center rounded-xl bg-blossom-soft text-blossom",
              on("giftIdle") && "idle-float",
            )}
            style={delay(300)}
          >
            <Gift className="size-5" />
          </span>
          <span className="block">
            <span className="block font-display text-sm font-extrabold text-ink">
              iClup ++ statüsü ve ayrıcalıkları
            </span>
            <span className="block text-[11px] text-ink-soft">
              1.000 XP'ye ulaştığında kazanacaksın!
            </span>
          </span>
        </span>
      </button>
    </section>
  );
}

export function PerksCard() {
  const { on, haptic } = useMotionLab();
  const { microBurst } = useFx();
  const perks = [
    { label: "Sürpriz\nFırsatlar", icon: Sparkles, tone: "text-ember" },
    { label: "Özel\nÖdüller", icon: Trophy, tone: "text-grape" },
    { label: "Sürpriz\nHediyeler", icon: PartyPopper, tone: "text-blossom" },
  ];

  return (
    <section className="mt-5 px-4">
      <div
        className="motion-stage relative overflow-hidden rounded-2xl p-4 shadow-[var(--shadow-card)]"
        style={{ ...delay(1500), background: "var(--gradient-premium)" }}
      >
        <span
          className={cn("pointer-events-none absolute inset-0", on("idle") && "drift-gradient")}
          style={{ background: "var(--gradient-hero)", opacity: 0.6 }}
        />
        <div className="relative flex items-center gap-2">
          <span className={cn("text-lg", on("giftIdle") && "idle-wiggle")}>👑</span>
          <div>
            <h2 className="font-display text-base font-extrabold text-primary-foreground drop-shadow">
              iClub ++ Ayrıcalıkları
            </h2>
            <p className="text-[11px] font-semibold text-ink/70">1.000 XP Puan'da açılır</p>
          </div>
        </div>
        <div className="relative mt-3 grid grid-cols-3 gap-2">
          {perks.map((p, i) => {
            const Icon = p.icon;
            return (
              <button
                key={p.label}
                type="button"
                onClick={(e) => {
                  haptic("light");
                  microBurst(e.currentTarget);
                }}
                className="press-spring rounded-xl bg-surface/70 p-2.5 backdrop-blur"
              >
                <Icon
                  className={cn("size-4", p.tone, on("giftIdle") && "idle-float")}
                  style={delay(i * 900)}
                />
                <span className="mt-1 block text-[11px] leading-tight font-extrabold whitespace-pre-line text-ink">
                  {p.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function Campaigns() {
  const { on, haptic } = useMotionLab();
  const items = [
    { brand: "BOYNER", badge: "% 15 iPuan" },
    { brand: "FLO", badge: "% 15 iPuan" },
    { brand: "mavi", badge: "% 15 iPuan" },
    { brand: "KOTON", badge: "% 20 iPuan" },
  ];

  return (
    <section className="mt-6 px-4 pb-24">
      <header className="motion-stage" style={delay(1600)}>
        <h2 className="font-display text-xl font-extrabold text-ink">
          Size özel iClub ++ Kampanyaları
        </h2>
        <p className="text-xs text-ink-soft">8 Aktif Kampanya</p>
      </header>
      <ul className="mt-3 space-y-2.5">
        {items.map((c, i) => (
          <li key={c.brand}>
            <button
              type="button"
              onClick={() => haptic("light")}
              className={cn(
                "group flex w-full items-center gap-3 rounded-2xl bg-card p-3 text-left shadow-[var(--shadow-card)]",
                on("questCards") && "quest-lift",
                "motion-stage",
              )}
              style={delay(1680 + i * 70)}
            >
              <span className="flex h-11 w-16 shrink-0 items-center justify-center rounded-xl bg-secondary font-display text-[11px] font-black tracking-tight text-ink">
                {c.brand}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  className={cn(
                    "inline-block rounded-full bg-ember-soft px-2 py-0.5 text-[10px] font-bold text-ember",
                    on("idle") && "idle-breathe",
                  )}
                  style={delay(i * 800)}
                >
                  {c.badge}
                </span>
                <span className="mt-1 block text-[12px] leading-snug text-ink-soft">
                  Seçili ürünlerde{" "}
                  <span className="font-bold text-grape">iClub Üyelerine</span> Özel Fırsatları
                  Keşfedin
                </span>
              </span>
              <span className="text-ink-soft transition-transform duration-300 group-hover:translate-x-1">
                ›
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
