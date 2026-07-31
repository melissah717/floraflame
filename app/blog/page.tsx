import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getBlogPosts } from "@/lib/blog";
import { Reveal, RevealGroup, RevealItem, SectionLabel } from "@/components/scroll-primitives";
import { ComingSoonBanner } from "@/components/coming-soon-banner";

// Revisits the sheet on every request in dev, and on the revalidate
// window (see lib/blog.ts) in production — no build-time freeze.
export const dynamic = "force-dynamic";

export default async function BlogPage() {
  const posts = await getBlogPosts();

  return (
    <div className="mx-auto max-w-7xl px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
      <Reveal>
        <SectionLabel number="—">Blog</SectionLabel>
        <h1 className="mt-4 max-w-[16ch] font-display text-4xl leading-[1.05] tracking-[-0.01em] sm:text-5xl lg:text-6xl">
          Notes from the grow.
        </h1>
      </Reveal>

      {posts.length === 0 ? (
        <Reveal delay={0.05} className="mt-8 sm:mt-10">
          <ComingSoonBanner>
            Coming soon — no posts yet.
          </ComingSoonBanner>
        </Reveal>
      ) : (
        <RevealGroup className="mt-10 grid grid-cols-1 gap-x-8 gap-y-14 sm:mt-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10">
          {posts.map((post) => (
            <RevealItem key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="group flex h-full flex-col">
                <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-100">
                  {post.heroImage ? (
                    <Image
                      src={post.heroImage}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      <span className="font-display text-3xl text-neutral-300">
                        F&amp;F
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex flex-1 flex-col gap-2.5">
                  <h2 className="font-display text-2xl leading-tight tracking-[-0.01em] text-neutral-900 transition-colors duration-200 group-hover:text-neutral-600">
                    {post.title}
                  </h2>
                  {post.blurb && (
                    <p className="line-clamp-2 text-sm leading-relaxed text-neutral-500">
                      {post.blurb}
                    </p>
                  )}
                  <span className="mt-1 inline-flex items-center gap-1.5 text-xs tracking-[0.06em] text-neutral-400 transition-colors duration-200 group-hover:text-neutral-900">
                    Read the post
                    <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                  </span>
                </div>
              </Link>
            </RevealItem>
          ))}
        </RevealGroup>
      )}
    </div>
  );
}
