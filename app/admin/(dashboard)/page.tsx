import Link from "next/link";

import { listBatches } from "@/lib/admin/strains";
import { listPosts } from "@/lib/admin/posts";
import { listStockists } from "@/lib/admin/stockists";

export default async function AdminOverviewPage() {
  const [batches, posts, stockists] = await Promise.all([
    listBatches(),
    listPosts(),
    listStockists(),
  ]);

  const current = batches.filter((b) => b.is_current);
  const drafts = posts.filter((p) => !p.published);
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
        current.length > 0
          ? `${current.length} in rotation: ${current.map((b) => b.name).join(", ")}`
          : "Nothing is in rotation — the homepage is showing placeholders.",
      warn: current.length === 0,
    },
    {
      href: "/admin/posts",
      title: "Posts",
      stat: `${posts.length} post${posts.length === 1 ? "" : "s"}`,
      detail:
        drafts.length > 0
          ? `${drafts.length} draft${drafts.length === 1 ? "" : "s"} not yet published`
          : "All published.",
      warn: false,
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
