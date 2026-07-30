/**
 * Parses one CSV line, respecting quoted fields.
 *
 * Google quotes any cell containing a comma — common in addresses, blurbs,
 * and paragraph bodies — so a naive line.split(",") shreds the data. This
 * walks character by character and only treats commas outside quotes as
 * separators. Shared by every Google-Sheet-as-data-source in this project
 * (see lib/stockists.ts, lib/blog.ts) rather than reimplemented per file.
 */
export function parseCsvLine(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];

    if (ch === '"') {
      // A doubled quote inside a quoted field is an escaped quote.
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (ch === "," && !inQuotes) {
      out.push(cur);
      cur = "";
    } else {
      cur += ch;
    }
  }
  out.push(cur);
  return out.map((c) => c.trim());
}
