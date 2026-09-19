import Link from "next/link";

import { listBatches, toggleCurrent } from "@/lib/admin/strains";

export const metadata = { title: "Strains" };

export default async function AdminStrainsPage() {
  const batches = await listBatches();
  const currentCount = batches.filter((b) => b.is_current).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl tracking-[-0.01em]">Strains</h1>
          <p className="text-sm text-neutral-400">
            {currentCount} of {batches.length} in rotation. Everything in rotation shows
            in Latest Drops on the homepage; everything here shows on /strains.
          </p>
        </div>
        <Link
          href="/admin/strains/new"
          className="rounded-full bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
        >
          New strain
        </Link>
      </div>

      {batches.length === 0 ? (
        <p className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-center text-sm text-neutral-500">
          No batches yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {batches.map((batch) => (
            <li
              key={batch.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3"
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  href={`/admin/strains/${batch.id}`}
                  className="truncate font-display text-base text-neutral-50 hover:underline"
                >
                  {batch.name}
                </Link>
                <span className="truncate text-xs text-neutral-500">
                  {batch.spectrum}
                  {batch.batch_number ? ` · ${batch.batch_number}` : ""}
                  {` · /${batch.slug}`}
                </span>
              </div>

              {/* A plain form, no client JS: `bool()` reads presence, so the
                  `next` field is only sent when switching ON. */}
              <form action={toggleCurrent}>
                <input type="hidden" name="id" value={batch.id} />
                {!batch.is_current && <input type="hidden" name="next" value="1" />}
                <button
                  type="submit"
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    batch.is_current
                      ? "border-lime-500/50 text-lime-300 hover:border-lime-400"
                      : "border-neutral-700 text-neutral-500 hover:border-neutral-500 hover:text-neutral-300"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      batch.is_current ? "bg-lime-400" : "bg-neutral-600"
                    }`}
                    aria-hidden
                  />
                  {batch.is_current ? "In rotation" : "Not in rotation"}
                </button>
              </form>

              <Link
                href={`/admin/strains/${batch.id}`}
                className="rounded-full border border-neutral-700 px-3 py-1.5 text-xs text-neutral-300 transition-colors hover:border-neutral-500 hover:text-neutral-50"
              >
                Edit
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
