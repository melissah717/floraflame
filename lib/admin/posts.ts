"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { verifySession } from "@/lib/admin/auth";
import { createClient } from "@/lib/supabase/server";
import { slugify, type BlogParagraph } from "@/lib/blog";
import {
  bool,
  fail,
  int,
  ok,
  repeater,
  text,
  textOrNull,
  type ActionState,
} from "@/lib/admin/form";

/**
 * Blog posts for Learn → The Knowledge.
 *
 * Replaces the BLOG_URL Google Sheet. The sheet's P1..P10 columns are now
 * a jsonb array, so the paragraph repeater in the form isn't capped at ten
 * and doesn't leave holes when you delete the middle one.
 */

const ADMIN_SELECT =
  "id, slug, title, bucket, hero_image, blurb, paragraphs, published, sort_order, updated_at";

export type AdminPost = {
  id: number;
  slug: string;
  title: string;
  bucket: string;
  hero_image: string | null;
  blurb: string | null;
  paragraphs: BlogParagraph[];
  published: boolean;
  sort_order: number;
  updated_at: string | null;
};

export async function listPosts(): Promise<AdminPost[]> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(ADMIN_SELECT)
    .order("sort_order", { ascending: true })
    .order("id", { ascending: true });

  if (error) {
    console.error("[admin] listPosts failed:", error.message);
    return [];
  }

  return (data ?? []) as AdminPost[];
}

export async function getPost(id: number): Promise<AdminPost | null> {
  await verifySession();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("blog_posts")
    .select(ADMIN_SELECT)
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[admin] getPost failed:", error.message);
    return null;
  }

  return (data as AdminPost) ?? null;
}

function revalidatePublicPages(slug: string) {
  revalidatePath("/learn/the-knowledge");
  revalidatePath(`/learn/the-knowledge/${slug}`);
}

export async function savePost(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  await verifySession();
  const supabase = await createClient();

  const id = int(formData, "id", 0);
  const title = text(formData, "title");
  // A blank slug field falls back to the title, which is what the sheet
  // always did. Typing one explicitly keeps an existing URL alive through
  // a title change.
  const slug = text(formData, "slug") || slugify(title);

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "Required.";
  if (!slug) fieldErrors.slug = "Required — and the title didn't produce one.";

  const paragraphs = repeater<BlogParagraph>(formData, "paragraph", [
    "title",
    "image",
    "body",
  ]).filter((p) => p.title || p.image || p.body);

  if (Object.keys(fieldErrors).length) {
    return fail("Check the highlighted fields.", fieldErrors);
  }

  const row = {
    slug,
    title,
    bucket: text(formData, "bucket") || "General",
    hero_image: textOrNull(formData, "hero_image"),
    blurb: textOrNull(formData, "blurb"),
    paragraphs,
    published: bool(formData, "published"),
    sort_order: int(formData, "sort_order", 0),
  };

  if (id) {
    const { error } = await supabase.from("blog_posts").update(row).eq("id", id);
    if (error) {
      console.error("[admin] savePost update failed:", error.message);
      // The slug is the only unique column, so this is the likely collision.
      return error.code === "23505"
        ? fail("Another post already uses that slug.", { slug: "Already taken." })
        : fail(error.message);
    }
    revalidatePublicPages(slug);
    revalidatePath("/admin/posts");
    return ok(`Saved “${title}”.`);
  }

  const { data, error } = await supabase
    .from("blog_posts")
    .insert(row)
    .select("id")
    .single();

  if (error) {
    console.error("[admin] savePost insert failed:", error.message);
    return error.code === "23505"
      ? fail("Another post already uses that slug.", { slug: "Already taken." })
      : fail(error.message);
  }

  revalidatePublicPages(slug);
  revalidatePath("/admin/posts");
  redirect(`/admin/posts/${data.id}?created=1`);
}

/** The list view's publish switch. */
export async function togglePublished(formData: FormData): Promise<void> {
  await verifySession();
  const supabase = await createClient();

  const id = int(formData, "id", 0);
  if (!id) return;

  const { data, error } = await supabase
    .from("blog_posts")
    .update({ published: bool(formData, "next") })
    .eq("id", id)
    .select("slug")
    .single();

  if (error) {
    console.error("[admin] togglePublished failed:", error.message);
    return;
  }

  revalidatePublicPages(data.slug);
  revalidatePath("/admin/posts");
}

export async function deletePost(formData: FormData): Promise<void> {
  await verifySession();
  const supabase = await createClient();

  const id = int(formData, "id", 0);
  if (!id) return;

  const { data, error } = await supabase
    .from("blog_posts")
    .delete()
    .eq("id", id)
    .select("slug")
    .single();

  if (error) {
    console.error("[admin] deletePost failed:", error.message);
    return;
  }

  revalidatePublicPages(data.slug);
  revalidatePath("/admin/posts");
  redirect("/admin/posts");
}
