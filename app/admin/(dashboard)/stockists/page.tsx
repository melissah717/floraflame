import Link from "next/link";

import { listStockists } from "@/lib/admin/stockists";

export const metadata = { title: "Stockists" };

const STATUS_STYLE: Record<string, string> = {
  carrying: "border-lime-500/50 text-lime-300",
  restocking: "border-amber-500/50 text-amber-300",
  paused: "border-neutral-700 text-neutral-500",
};

export default async function AdminStockistsPage() {
  const stockists = await listStockists();
  const unpinned = stockists.filter((s) => s.lat == null || s.lng == null).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl tracking-[-0.01em]">Stockists</h1>
          <p className="text-sm text-neutral-400">
            {stockists.length} location{stockists.length === 1 ? "" : "s"} on the
            homepage&apos;s Find Us map.
            {unpinned > 0 && (
              <span className="text-amber-300">
                {" "}
                {unpinned} missing coordinates and hidden from it.
              </span>
            )}
          </p>
        </div>
        <Link
          href="/admin/stockists/new"
          className="rounded-full bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
        >
          New stockist
        </Link>
      </div>

      {stockists.length === 0 ? (
        <p className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-center text-sm text-neutral-500">
          No stockists yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {stockists.map((stockist) => {
            const pinned = stockist.lat != null && stockist.lng != null;
            return (
              <li
                key={stockist.id}
                className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3"
              >
                <div className="flex min-w-0 flex-1 flex-col">
                  <Link
                    href={`/admin/stockists/${stockist.id}`}
                    className="truncate font-display text-base text-neutral-50 hover:underline"
                  >
                    {stockist.name}
                  </Link>
                  <span className="truncate text-xs text-neutral-500">
                    {stockist.address}, {stockist.city}, {stockist.state} {stockist.zip}
                  </span>
                </div>

                {!pinned && (
                  <span className="rounded-full border border-amber-500/40 px-3 py-1.5 text-xs text-amber-300">
                    Not on map
                  </span>
                )}

                <span
                  className={`rounded-full border px-3 py-1.5 text-xs capitalize ${
                    STATUS_STYLE[stockist.status] ?? STATUS_STYLE.paused
                  }`}
                >
                  {stockist.status}
                </span>

                <Link
                  href={`/admin/stockists/${stockist.id}`}
                  className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:border-neutral-500 hover:text-neutral-50"
                >
                  Edit
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
