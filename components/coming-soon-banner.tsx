import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

export function ComingSoonBanner({
  children = "Coming soon — we're still building this out.",
  tone = "light",
}: {
  children?: string;
  /** "dark" = for light backgrounds. "light" = for dark sections (site default). */
  tone?: "dark" | "light";
}) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-5 py-4 text-sm",
        tone === "light"
          ? "border-neutral-700 bg-neutral-800 text-neutral-300"
          : "border-neutral-200 bg-neutral-100 text-neutral-600"
      )}
    >
      <Sparkles
        className={cn("h-4 w-4 shrink-0", tone === "light" ? "text-neutral-500" : "text-neutral-400")}
      />
      <span>{children}</span>
    </div>
  );
}
