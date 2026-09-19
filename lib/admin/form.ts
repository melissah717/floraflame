import "server-only";

/**
 * FormData readers shared by the three admin resources.
 *
 * Everything arriving in a Server Action is a string or a File, including
 * the things that are meant to be numbers and booleans, and including the
 * fields a user simply left blank. These normalise that once so each
 * action isn't re-deciding what an empty string means.
 */

/** The shape every admin action returns to its form via useActionState. */
export type ActionState = {
  ok: boolean;
  message: string;
  /** Field name → problem, for inline errors. */
  fieldErrors?: Record<string, string>;
} | null;

export function text(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === "string" ? value.trim() : "";
}

/** Empty string → null, so a cleared optional field nulls its column. */
export function textOrNull(formData: FormData, key: string): string | null {
  return text(formData, key) || null;
}

export function bool(formData: FormData, key: string): boolean {
  // An unchecked checkbox isn't submitted at all, so absence is false.
  return formData.get(key) != null;
}

export function int(formData: FormData, key: string, fallback = 0): number {
  const n = Number(text(formData, key));
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

export function numberOrNull(formData: FormData, key: string): number | null {
  const raw = text(formData, key);
  if (!raw) return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
}

/**
 * Comma-separated input → string[], for the `tags` and `terpenes` columns.
 * Both are Postgres text[], and both are entered as one line in the form
 * because asking someone to add five separate inputs for five terpenes is
 * worse than asking them to type commas.
 */
export function list(formData: FormData, key: string): string[] {
  return text(formData, key)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

/**
 * Date input → "YYYY-MM-DD" or null.
 *
 * `<input type="date">` already emits exactly that format, so this is
 * really just the empty-string guard — a blank date column must be null,
 * not "", which Postgres rejects for a `date`.
 */
export function dateOrNull(formData: FormData, key: string): string | null {
  const raw = text(formData, key);
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : null;
}

/** Collects `${prefix}-${i}-${field}` groups out of a repeater. */
export function repeater<T extends Record<string, string>>(
  formData: FormData,
  prefix: string,
  fields: (keyof T & string)[]
): T[] {
  const out: T[] = [];

  for (let i = 0; ; i++) {
    // The repeater renumbers on submit, so the first gap is the end.
    const present = fields.some((f) => formData.get(`${prefix}-${i}-${f}`) != null);
    if (!present) break;

    const entry = {} as T;
    for (const field of fields) {
      entry[field] = text(formData, `${prefix}-${i}-${field}`) as T[typeof field];
    }
    out.push(entry);
  }

  return out;
}

export function fail(message: string, fieldErrors?: Record<string, string>): ActionState {
  return { ok: false, message, fieldErrors };
}

export function ok(message: string): ActionState {
  return { ok: true, message };
}
