/**
 * Blog content for Learn → The Knowledge (app/learn/the-knowledge).
 *
 * Posts live in Supabase `blog_posts` and are written from /admin/posts.
 * They used to live in a public Google Sheet read as CSV — that is gone:
 * the sheet had a hard cap of ten paragraphs baked into its columns, no
 * drafts (a half-finished row was live the moment you typed it), no real
 * ordering, and it answered a 200 with an HTML sign-in page whenever
 * someone tightened the sharing settings, which looked exactly like
 * "zero posts" to the parser.
 *
 * The exported shapes are unchanged, so the pages that render posts did
 * not need to change with them.
 */

import { supabase } from "@/lib/supabase";
import { optimizedImage } from "@/lib/cloudinary";

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

/**
 * Placeholder rows. Only used when the Supabase fetch fails outright —
 * not when it legitimately returns zero posts, which is a real answer.
 */
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
        body: "This placeholder shows while the blog_posts fetch is failing. See lib/blog.ts.",
      },
    ],
  },
];

/**
 * Title → URL segment. Shared with the admin, which offers it as the
 * default slug for a new post but lets you override it — so renaming a
 * post's title later doesn't have to break its URL.
 */
export function slugify(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

type BlogPostRow = {
  slug: string;
  title: string;
  bucket: string | null;
  hero_image: string | null;
  blurb: string | null;
  paragraphs: unknown;
};

/**
 * `paragraphs` is jsonb, so Postgres will hand back whatever was written
 * to it. Everything that writes goes through the admin's own validation,
 * but this is the boundary where untyped JSON becomes a typed object, so
 * it checks rather than casts.
 */
function toParagraphs(value: unknown): BlogParagraph[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((entry): BlogParagraph[] => {
    if (typeof entry !== "object" || entry === null) return [];
    const p = entry as Record<string, unknown>;
    const para: BlogParagraph = {
      title: typeof p.title === "string" ? p.title : "",
      image: typeof p.image === "string" ? optimizedImage(p.image) : "",
      body: typeof p.body === "string" ? p.body : "",
    };
    // A paragraph with nothing in it is a leftover empty row in the
    // admin's repeater, not content.
    return para.title || para.image || para.body ? [para] : [];
  });
}

function rowToPost(row: BlogPostRow): BlogPost {
  return {
    slug: row.slug,
    title: row.title,
    bucket: row.bucket || "General",
    heroImage: optimizedImage(row.hero_image),
    blurb: row.blurb ?? "",
    paragraphs: toParagraphs(row.paragraphs),
  };
}

const SELECT_COLUMNS = "slug, title, bucket, hero_image, blurb, paragraphs";

/**
 * Published posts, in admin-defined order.
 *
 * Drafts are filtered out by the row-level security policy rather than by
 * a `.eq("published", true)` here — the anon key literally cannot see
 * them, so an unpublished post can't leak through a query someone forgets
 * to filter. See supabase/admin-schema.sql.
 */
export async function getBlogPosts(): Promise<BlogPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(SELECT_COLUMNS)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error(`${LOG} getBlogPosts failed:`, error.message);
    return BLOG_POSTS;
  }

  const posts = (data ?? []).map(rowToPost);
  console.log(`${LOG} Loaded ${posts.length} published post(s).`);
  return posts;
}

export async function getBlogPost(slug: string): Promise<BlogPost | undefined> {
  const posts = await getBlogPosts();
  return posts.find((p) => p.slug === slug);
}
