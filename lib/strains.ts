import { supabase } from "@/lib/supabase";

/**
 * Where a strain sits on the indica → sativa spectrum, relative to the
 * others — not a lab-measured ratio, just a qualitative bucket.
 */
export const SPECTRUM_POSITIONS = [
  "Indica",
  "Indica-Leaning Hybrid",
  "Balanced Hybrid",
  "Sativa-Leaning Hybrid",
  "Sativa",
] as const;

export type SpectrumPosition = (typeof SPECTRUM_POSITIONS)[number];

export type Strain = {
  slug: string;
  name: string;
  image: string;
  spectrum: SpectrumPosition;
  /** Flavor/effect keywords, shown as chips. */
  tags: string[];
  /** One or two sentences, revealed on demand rather than shown up front. */
  description: string;
  /** Cross, e.g. "Zkittlez x Do-Si-Dos". Not all strains have this on file. */
  genetics?: string;
  /** Dominant terpenes, in descending order. */
  terpenes?: string[];
  /** When it's best used, e.g. "Evening" or "Before bed". */
  idealTime?: string;
  /** Total THC from the COA, e.g. "19.8%". */
  thc?: string;
  /** Path to the strain's COA PDF. Not all batches have one on file yet. */
  labReport?: string;
  /** METRC/COA batch code, e.g. "CB040326". */
  batchNumber?: string;
  quarter?: "Q1" | "Q2" | "Q3" | "Q4";
  year?: number;
};

/**
 * Placeholder rows. Only used when the Supabase fetch fails — see
 * fetchDropBatches below. Deliberately small (not the full 7-strain set)
 * so an outage is visually obvious rather than looking identical to a
 * real, fully-populated Drops section.
 */
const FALLBACK_STRAINS: Strain[] = [
  {
    slug: "crunch-berries",
    name: "Crunch Berries",
    image: "/Crunch_Berries.png",
    spectrum: "Indica",
    tags: ["Berry", "Dessert", "Relaxing"],
    description:
      "A dessert-leaning indica with a jammy berry nose and a slow, heavy-lidded body high built for the end of the day.",
    idealTime: "Evenings",
  },
];

const LOG = "[strains]";

type DropBatchRow = {
  slug: string;
  name: string;
  image: string;
  spectrum: string;
  tags: string[] | null;
  description: string;
  genetics: string | null;
  terpenes: string[] | null;
  ideal_time: string | null;
  thc_percent: number | string | null;
  lab_report_url: string | null;
  batch_number: string | null;
  quarter: string | null;
  year: number | null;
};

function isSpectrumPosition(value: string): value is SpectrumPosition {
  return (SPECTRUM_POSITIONS as readonly string[]).includes(value);
}

function rowToStrain(row: DropBatchRow): Strain | null {
  if (!isSpectrumPosition(row.spectrum)) {
    console.error(`${LOG} Unknown spectrum "${row.spectrum}" on "${row.slug}" — skipped.`);
    return null;
  }

  return {
    slug: row.slug,
    name: row.name,
    image: row.image,
    spectrum: row.spectrum,
    tags: row.tags ?? [],
    description: row.description,
    genetics: row.genetics ?? undefined,
    terpenes: row.terpenes ?? undefined,
    idealTime: row.ideal_time ?? undefined,
    thc: row.thc_percent != null ? `${Number(row.thc_percent).toFixed(1)}%` : undefined,
    labReport: row.lab_report_url ?? undefined,
    batchNumber: row.batch_number ?? undefined,
    quarter: row.quarter && ["Q1", "Q2", "Q3", "Q4"].includes(row.quarter) ? (row.quarter as Strain["quarter"]) : undefined,
    year: row.year ?? undefined,
  };
}

const SELECT_COLUMNS =
  "slug, name, image, spectrum, tags, description, genetics, terpenes, ideal_time, thc_percent, lab_report_url, batch_number, quarter, year";

/** The batches shown in the homepage's "Latest Drops" section. */
export async function getCurrentDrops(): Promise<Strain[]> {
  const { data, error } = await supabase
    .from("drop_batches")
    .select(SELECT_COLUMNS)
    .eq("is_current", true)
    .order("name", { ascending: true });

  if (error) {
    console.error(`${LOG} getCurrentDrops failed:`, error.message);
    return FALLBACK_STRAINS;
  }
  if (!data || data.length === 0) {
    console.warn(`${LOG} No rows with is_current = true — using placeholders.`);
    return FALLBACK_STRAINS;
  }

  const strains = data.map(rowToStrain).filter((s): s is Strain => s !== null);
  console.log(`${LOG} Loaded ${strains.length} current drop(s).`);
  return strains;
}

/** Every batch on file, newest first — for the /archive page. */
export async function getArchiveBatches(): Promise<Strain[]> {
  const { data, error } = await supabase
    .from("drop_batches")
    .select(SELECT_COLUMNS)
    .order("year", { ascending: false })
    .order("quarter", { ascending: false })
    .order("name", { ascending: true });

  if (error) {
    console.error(`${LOG} getArchiveBatches failed:`, error.message);
    return [];
  }

  return (data ?? []).map(rowToStrain).filter((s): s is Strain => s !== null);
}
