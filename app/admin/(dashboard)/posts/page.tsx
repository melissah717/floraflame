import Link from "next/link";

import { listPosts, togglePublished } from "@/lib/admin/posts";

export const metadata = { title: "Posts" };

export default async function AdminPostsPage() {
  const posts = await listPosts();
  const published = posts.filter((p) => p.published).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-display text-2xl tracking-[-0.01em]">Posts</h1>
          <p className="text-sm text-neutral-400">
            {published} of {posts.length} published, under Learn → The Knowledge.
          </p>
        </div>
        <Link
          href="/admin/posts/new"
          className="rounded-full bg-neutral-50 px-4 py-2 text-sm font-medium text-neutral-900 transition-colors hover:bg-neutral-200"
        >
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="rounded-xl border border-neutral-800 bg-neutral-900 p-8 text-center text-sm text-neutral-500">
          No posts yet.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {posts.map((post) => (
            <li
              key={post.id}
              className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-neutral-800 bg-neutral-900 px-4 py-3"
            >
              <div className="flex min-w-0 flex-1 flex-col">
                <Link
                  href={`/admin/posts/${post.id}`}
                  className="truncate font-display text-base text-neutral-50 hover:underline"
                >
                  {post.title}
                </Link>
                <span className="truncate text-xs text-neutral-500">
                  {post.bucket} · {post.paragraphs.length} section
                  {post.paragraphs.length === 1 ? "" : "s"} · /{post.slug}
                </span>
              </div>

              <form action={togglePublished}>
                <input type="hidden" name="id" value={post.id} />
                {!post.published && <input type="hidden" name="next" value="1" />}
                <button
                  type="submit"
                  className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    post.published
                      ? "border-lime-500/50 text-lime-300 hover:border-lime-400"
                      : "border-amber-500/40 text-amber-300 hover:border-amber-400"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full ${
                      post.published ? "bg-lime-400" : "bg-amber-400"
                    }`}
                    aria-hidden
                  />
                  {post.published ? "Published" : "Draft"}
                </button>
              </form>

              <Link
                href={`/admin/posts/${post.id}`}
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
