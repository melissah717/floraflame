import type { AdminBatch } from "@/lib/admin/strains";

/**
 * What's incomplete about a batch, and what it actually costs.
 *
 * Deliberately NOT a list of empty fields. "genetics is blank" is a fact
 * about a database row; "the Genetics line won't render on the card" is
 * the thing worth acting on, and only one of those tells you whether to
 * care. Every entry here names a consequence.
 *
 * A plain module rather than part of lib/admin/strains.ts, because that
 * file is "use server" and may only export async functions. This is shared
 * by a server page and a client form, so it has to be neither.
 */

export type IssueSeverity =
  /** Visible on the public site, or actively wrong. */
  | "warn"
  /** Just incomplete — a line quietly doesn't render. */
  | "info";

export type StrainIssue = {
  field: string;
  label: string;
  detail: string;
  severity: IssueSeverity;
};

type Checkable = Pick<
  AdminBatch,
  | "nug_image"
  | "batch_number"
  | "collected_at"
  | "tags"
  | "terpenes"
  | "genetics"
  | "ideal_time"
>;

export function strainIssues(batch: Checkable): StrainIssue[] {
  const issues: StrainIssue[] = [];

  if (!batch.nug_image) {
    issues.push({
      field: "nug_image",
      label: "No nug shot",
      detail:
        "Left off /strains entirely until it has one. Still shows in Latest Drops, which uses the product photo.",
      severity: "warn",
    });
  }

  /*
   * Not cosmetic. archive-client.tsx tells batches apart by slug +
   * batch_number, for React keys and for which card is selected. Two
   * batches of the same strain with no batch number are literally
   * indistinguishable to it — duplicate keys, and both highlight at once.
   */
  if (!batch.batch_number) {
    issues.push({
      field: "batch_number",
      label: "No batch number",
      detail:
        "/strains identifies a batch by slug + batch number. A second batch of this strain without one would clash with this one.",
      severity: "warn",
    });
  }

  if (!batch.collected_at) {
    issues.push({
      field: "collected_at",
      label: "No collected date",
      detail: "/strains sorts newest first, so this sinks to the bottom of the list.",
      severity: "warn",
    });
  }

  if (!batch.tags?.length) {
    issues.push({
      field: "tags",
      label: "No tags",
      detail: "The flavour/effect chips under the strain name won't render.",
      severity: "info",
    });
  }

  if (!batch.terpenes?.length) {
    issues.push({
      field: "terpenes",
      label: "No terpenes",
      detail: "The Terpenes line is dropped from the expanded card.",
      severity: "info",
    });
  }

  if (!batch.genetics) {
    issues.push({
      field: "genetics",
      label: "No genetics",
      detail: "The Genetics line is dropped from the expanded card.",
      severity: "info",
    });
  }

  if (!batch.ideal_time) {
    issues.push({
      field: "ideal_time",
      label: "No best time",
      detail: "The Best time line is dropped from the expanded card.",
      severity: "info",
    });
  }

  return issues;
}

export function worstSeverity(issues: StrainIssue[]): IssueSeverity | null {
  if (issues.some((i) => i.severity === "warn")) return "warn";
  return issues.length ? "info" : null;
}
