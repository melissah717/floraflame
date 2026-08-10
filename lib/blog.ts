/**
 * Blog content lives in a public Google Sheet, not the codebase — anyone
 * on the team can add a post by filling in a row, no deploy required.
 * Posts render under Learn → The Knowledge (app/learn/the-knowledge),
 * grouped into sections by the Bucket column.
 *
 * SPREADSHEET SCHEMA — one row per post:
 *
 *   Title | Bucket | Hero Image | Blurb | P1 Title | P1 Body | P2 Title | P2 Body | ...
 *
 * up to P10 Title / P10 Body. A row with no title is treated as
 * blank/unused. There's no slug column — the URL is derived from the
 * title (see slugify below). Bucket is freeform text; posts sharing a
 * bucket are grouped under that label, in the order they first appear.
 */

import { parseCsvLine } from "@/lib/csv";

const MAX_PARAGRAPHS = 10;
const LOG = "[blog]";

export type BlogParagraph = {
  title: string;
  image: string;
  body: string;
};

export type BlogPost = {
  slug: string;
  title: string;
  bucket: string;
  heroImage: string;
  blurb: string;
  paragraphs: BlogParagraph[];
};

/** Placeholder rows. Only used when the sheet fetch fails — see below. */
export const BLOG_POSTS: BlogPost[] = [
  {
    slug: "welcome-to-the-blog",
    title: "Welcome to the blog",
    bucket: "General",
    heroImage: "",
    blurb: "Notes from the grow, posted here as we write them.",
    paragraphs: [
      {
        title: "More soon",
        image: "",
        body: "This placeholder shows while BLOG_URL is unset or the sheet fetch fails. See lib/blog.ts.",
      },
    ],
  },
];

function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * BLOG_URL is the normal "share/edit" link a user pastes from the
 * browser bar (…/spreadsheets/d/{id}/edit?gid={gid}#gid={gid}), not a
 * separately-published URL — Sheets serves CSV straight off that id via
 * /export?format=csv without requiring File → Share → Publish to web.
 */
function csvUrlFrom(sheetUrl: string): string | null {
  const idMatch = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch) return null;
  const gidMatch = sheetUrl.match(/gid=(\d+)/);
  const gid = gidMatch ? gidMatch[1] : "0";
  return `https://docs.google.com/spreadsheets/d/${idMatch[1]}/export?format=csv&gid=${gid}`;
}

/**
 * Pull posts from the published Google Sheet.
 *
 * EVERY PATH LOGS, INCLUDING SUCCESS — see lib/stockists.ts for why: a
 * fallback that fires silently is worse than one that's loud about it.
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  const sheetUrl = process.env.BLOG_URL;
  if (!sheetUrl) {
    console.warn(`${LOG} BLOG_URL not set — using placeholders.`);
    return BLOG_POSTS;
  }

  const csvUrl = csvUrlFrom(sheetUrl);
  if (!csvUrl) {
    console.error(`${LOG} Couldn't parse a sheet id out of BLOG_URL: ${sheetUrl}`);
    return BLOG_POSTS;
  }

  try {
    const res = await fetch(csvUrl, {
      next: { revalidate: 3600 },
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) {
      console.error(`${LOG} HTTP ${res.status} ${res.statusText}`);
      return BLOG_POSTS;
    }

    const contentType = res.headers.get("content-type") ?? "";
    const raw = await res.text();

    /**
     * The most common failure, and the sneakiest: when the sheet's
     * sharing is set to private, Google answers 200 with an HTML
     * sign-in page. res.ok is true and the body is a valid string, so
     * without this check it looks exactly like success with zero posts.
     */
    if (!contentType.includes("csv") && raw.trimStart().startsWith("<")) {
      console.error(
        `${LOG} Expected CSV, got ${contentType || "unknown"}. ` +
          `Body starts: ${raw.slice(0, 120).replace(/\s+/g, " ")}`
      );
      console.error(
        `${LOG} Usually means sharing isn't "Anyone with the link can view".`
      );
      return BLOG_POSTS;
    }

    const withoutBom = raw.charCodeAt(0) === 0xfeff ? raw.slice(1) : raw;
    const csv = withoutBom.replace(/\r\n/g, "\n");
    const lines = csv.trim().split("\n");

    if (lines.length < 1) {
      console.error(`${LOG} Empty sheet — no header row. Body: ${raw.slice(0, 200)}`);
      return BLOG_POSTS;
    }

    const headers = parseCsvLine(lines[0]).map((h) => h.toLowerCase());

    if (!headers.includes("title")) {
      console.error(
        `${LOG} No "title" column. Found: ${headers.join(", ")}. ` +
          `Check the gid in BLOG_URL points at the right tab.`
      );
      return BLOG_POSTS;
    }

    const col = (row: string[], key: string) => {
      const i = headers.indexOf(key);
      return i === -1 ? "" : (row[i] ?? "").trim();
    };

    const seenSlugs = new Set<string>();
    const posts: BlogPost[] = [];

    for (const line of lines.slice(1)) {
      const row = parseCsvLine(line);
      const title = col(row, "title");
      if (!title) continue;

      const paragraphs: BlogParagraph[] = [];
      for (let p = 1; p <= MAX_PARAGRAPHS; p++) {
        const pTitle = col(row, `p${p} title`);
        const pImage = col(row, `p${p} image`);
        const pBody = col(row, `p${p} body`);
        if (!pTitle && !pImage && !pBody) continue;
        paragraphs.push({ title: pTitle, image: pImage, body: pBody });
      }

      // Duplicate titles would otherwise collide on the same URL — later
      // rows lose, since editors are more likely to notice a missing new
      // post than a silently overwritten old one.
      const slug = slugify(title);
      if (seenSlugs.has(slug)) {
        console.warn(`${LOG} Duplicate slug "${slug}" (from "${title}") — skipped.`);
        continue;
      }
      seenSlugs.add(slug);

      posts.push({
        slug,
        title,
        bucket: col(row, "bucket") || "General",
        heroImage: col(row, "hero image"),
        blurb: col(row, "blurb"),
        paragraphs,
      });
    }

    console.log(`${LOG} Loaded ${posts.length} post(s) from the sheet.`);
    return posts;
  } catch (err) {
    console.error(`${LOG} Fetch threw:`, err);
    return BLOG_POSTS;
  }
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  const posts = await getBlogPosts();
  return posts.find((p) => p.slug === slug);
}
