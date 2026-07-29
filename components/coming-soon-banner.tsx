import { Sparkles } from "lucide-react";

export function ComingSoonBanner({
  children = "Coming soon — we're still building this out.",
}: {
  children?: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-neutral-200 bg-neutral-100 px-5 py-4 text-sm text-neutral-600">
      <Sparkles className="h-4 w-4 shrink-0 text-neutral-400" />
      <span>{children}</span>
    </div>
  );
}
