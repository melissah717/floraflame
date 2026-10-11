import { directionsUrl, fetchStockists, stockistKey } from "@/lib/stockists"

/**
 * Every shop, grouped by city, as plain server-rendered HTML.
 *
 * The interactive finder above only lists shops after a search, and the
 * map's pins are drawn by JavaScript, so without this the page's HTML
 * names no shops at all. This is what lets "Flora & Flame Merced" or
 * "cannabis dispensary Fresno Flora & Flame" find the page, and it doubles
 * as a no-JavaScript fallback.
 */
export async function StockistDirectory() {
  const stockists = (await fetchStockists()).filter((s) => s.status !== "paused")
  if (!stockists.length) return null

  const byCity = new Map<string, typeof stockists>()
  for (const s of stockists) {
    const city = s.city?.trim() || "Other"
    byCity.set(city, [...(byCity.get(city) ?? []), s])
  }
  const cities = [...byCity.keys()].sort((a, b) => a.localeCompare(b))

  return (
    <section
      aria-labelledby="all-shops-heading"
      className="bg-neutral-900 px-5 py-16 text-neutral-50 sm:px-8 sm:py-20 lg:px-12"
    >
      <div className="mx-auto max-w-[88rem]">
        <h2
          id="all-shops-heading"
          className="font-display text-3xl tracking-[-0.01em] sm:text-4xl"
        >
          All shops by city
        </h2>
        <p className="mt-3 max-w-2xl text-base text-neutral-400">
          Availability changes from week to week. Call ahead to check what&apos;s
          on the shelf.
        </p>

        <div className="mt-10 columns-1 gap-10 sm:columns-2 lg:columns-3">
          {cities.map((city) => (
            <div key={city} className="mb-8 break-inside-avoid">
              <h3 className="text-[13px] uppercase tracking-[0.18em] text-neutral-400">
                {city}
              </h3>
              <ul className="mt-3 space-y-3">
                {byCity.get(city)!.map((s) => (
                  <li key={stockistKey(s)}>
                    <p className="font-display text-lg leading-tight">{s.name}</p>
                    <p className="text-sm text-neutral-300">
                      {[s.address, s.city].filter(Boolean).join(", ")}
                      {s.state ? `, ${s.state}` : ""} {s.zip}
                    </p>
                    <a
                      href={directionsUrl(s)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-neutral-400 underline underline-offset-4 hover:text-neutral-50"
                    >
                      Directions
                      <span className="sr-only">
                        {" "}to {s.name} (opens in a new tab)
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
