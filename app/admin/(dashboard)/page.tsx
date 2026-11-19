import Link from "next/link";

import { listBatches } from "@/lib/admin/strains";
import { listStockists } from "@/lib/admin/stockists";
import { listEvents } from "@/lib/admin/events";
import { isPast, rowToEvent } from "@/lib/events";
import { strainIssues, worstSeverity } from "@/lib/admin/strain-issues";

export default async function AdminOverviewPage() {
  const [batches, stockists, eventsResult] = await Promise.all([
    listBatches(),
    listStockists(),
    listEvents(),
  ]);
  const upcomingEvents = eventsResult.events.filter(
    (e) => e.published && !isPast(rowToEvent(e))
  );
  const draftEvents = eventsResult.events.filter((e) => !e.published);

  const current = batches.filter((b) => b.is_current);
  // Same check the strains list and the edit form use, so the three can't
  // drift into disagreeing about what counts as incomplete.
  const needsAttention = batches.filter(
    (b) => worstSeverity(strainIssues(b)) === "warn"
  );
  // Geocoding is allowed to fail on save, and a stockist without
  // coordinates is silently dropped from the map — so it gets counted here
  // rather than discovered later.
  const unpinned = stockists.filter((s) => s.lat == null || s.lng == null);

  const cards = [
    {
      href: "/admin/strains",
      title: "Strains",
      stat: `${batches.length} batch${batches.length === 1 ? "" : "es"}`,
      detail:
        needsAttention.length > 0
          ? `${needsAttention.length} missing something that shows on the site: ${needsAttention
              .map((b) => b.name)
              .join(", ")}`
          : current.length > 0
            ? `${current.length} in rotation: ${current.map((b) => b.name).join(", ")}`
            : "Nothing is in rotation — the homepage is showing placeholders.",
      warn: current.length === 0 || needsAttention.length > 0,
    },
    {
      href: "/admin/events",
      title: "Events",
      stat: eventsResult.error
        ? "Not set up"
        : `${upcomingEvents.length} upcoming`,
      detail: eventsResult.error
        ? "Run supabase/events.sql to create the table."
        : draftEvents.length > 0
          ? `${draftEvents.length} draft${draftEvents.length === 1 ? "" : "s"} hidden from the site`
          : upcomingEvents.length > 0
            ? upcomingEvents.map((e) => e.title).join(", ")
            : "Nothing coming up — /events says so.",
      warn: Boolean(eventsResult.error),
    },
    {
      href: "/admin/stockists",
      title: "Stockists",
      stat: `${stockists.length} location${stockists.length === 1 ? "" : "s"}`,
      detail:
        unpinned.length > 0
          ? `${unpinned.length} missing coordinates — not shown on the map`
          : "All geocoded.",
      warn: unpinned.length > 0,
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-1">
        <h1 className="font-display text-2xl tracking-[-0.01em]">Overview</h1>
        <p className="text-sm text-neutral-400">
          Everything the public site reads now lives in Supabase. Edits here go live
          within a minute or two — the public pages are cached and get busted on save.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map((card) => (
          <Link
            key={card.href}
            href={card.href}
            className="flex flex-col gap-2 rounded-xl border border-neutral-800 bg-neutral-900 p-5 transition-colors hover:border-neutral-600"
          >
            <span className="text-xs uppercase tracking-[0.08em] text-neutral-500">
              {card.title}
            </span>
            <span className="font-display text-xl text-neutral-50">{card.stat}</span>
            <span
              className={`text-xs ${card.warn ? "text-amber-300" : "text-neutral-500"}`}
            >
              {card.detail}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
