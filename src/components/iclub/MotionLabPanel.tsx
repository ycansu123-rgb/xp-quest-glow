import { useState } from "react";
import { RotateCcw, SlidersHorizontal, X } from "lucide-react";
import {
  FLAGS,
  MOTION_LEVELS,
  MOTION_LEVEL_LABEL,
  useMotionLab,
  type MotionLevel,
} from "@/lib/motion-lab";
import { useQuestSim } from "@/lib/quest-sim";
import { QUEST_IDS } from "@/components/iclub/Quests";
import { cn } from "@/lib/utils";

export function MotionLabPanel() {
  const { level, setLevel, flags, toggle, replay } = useMotionLab();
  const { simulate, resetCompletion } = useQuestSim();
  const [open, setOpen] = useState(false);


  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="press-spring fixed right-4 bottom-4 z-[80] flex size-12 items-center justify-center rounded-full text-primary-foreground shadow-[var(--shadow-lift)]"
        style={{ background: "var(--gradient-grape)" }}
        aria-label="Motion Lab"
      >
        {open ? <X className="size-5" /> : <SlidersHorizontal className="size-5" />}
      </button>

      {open && (
        <aside className="fixed right-3 bottom-20 z-[80] max-h-[70vh] w-[16.5rem] overflow-y-auto rounded-2xl border border-border bg-popover/95 p-3 shadow-[var(--shadow-lift)] backdrop-blur [animation:iclub-pop-in_320ms_var(--ease-spring)_both]">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-extrabold">Motion Lab</h3>
            <button
              type="button"
              onClick={replay}
              className="flex items-center gap-1 rounded-full bg-secondary px-2 py-1 text-[10px] font-semibold text-secondary-foreground"
            >
              <RotateCcw className="size-3" /> Replay
            </button>
          </div>

          <p className="mt-3 text-[10px] font-bold tracking-wide text-ink-soft uppercase">
            Motion level
          </p>
          <div className="mt-1.5 grid grid-cols-3 gap-1">
            {MOTION_LEVELS.map((l: MotionLevel) => (
              <button
                key={l}
                type="button"
                onClick={() => setLevel(l)}
                className={cn(
                  "rounded-lg px-1.5 py-1.5 text-[10px] font-bold transition-colors",
                  level === l
                    ? "bg-grape text-primary-foreground"
                    : "bg-secondary text-secondary-foreground",
                )}
              >
                {MOTION_LEVEL_LABEL[l]}
              </button>
            ))}
          </div>

          <p className="mt-3 text-[10px] font-bold tracking-wide text-ink-soft uppercase">
            Effects
          </p>
          <ul className="mt-1.5 space-y-0.5">
            {FLAGS.map((f) => (
              <li key={f.key}>
                <label className="flex cursor-pointer items-center justify-between gap-2 rounded-lg px-1.5 py-1 text-[11px] hover:bg-secondary">
                  <span>{f.label}</span>
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      toggle(f.key);
                    }}
                    className={cn(
                      "relative h-4 w-7 shrink-0 rounded-full transition-colors",
                      flags[f.key] ? "bg-grape" : "bg-muted",
                    )}
                  >
                    <span
                      className={cn(
                        "absolute top-0.5 size-3 rounded-full bg-surface shadow transition-all duration-200",
                        flags[f.key] ? "left-3.5" : "left-0.5",
                      )}
                    />
                  </span>
                </label>
              </li>
            ))}
          </ul>

          <p className="mt-3 rounded-lg bg-secondary p-2 text-[10px] leading-snug text-ink-soft">
            Haptic map (native): CTA tap → light · quest complete → medium · reward unlock →
            success · locked reward → warning · level-up → strong success.
          </p>
        </aside>
      )}
    </>
  );
}
