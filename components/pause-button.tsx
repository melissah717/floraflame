"use client";

import { Pause, Play } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Pause/play toggle for anything that moves on its own for more than five
 * seconds — looping video, marquees, slideshows. WCAG 2.2.2 requires a way
 * to stop it; the accessibility statement promises one.
 *
 * `label` names the thing being paused ("background video"), and the
 * button reads "Pause background video" / "Play background video".
 */
export function PauseButton({
  paused,
  onToggle,
  label,
  className,
}: {
  paused: boolean;
  onToggle: () => void;
  label: string;
  className?: string;
}) {
  const Icon = paused ? Play : Pause;
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={`${paused ? "Play" : "Pause"} ${label}`}
      className={cn(
        "inline-flex size-10 cursor-pointer items-center justify-center rounded-full border border-neutral-50/60 bg-neutral-900/70 text-neutral-50 backdrop-blur-sm transition-colors hover:bg-neutral-900",
        className
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
    </button>
  );
}
