import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { ArrowRight } from "lucide-react";
import { getBlogPosts, type BlogPost } from "@/lib/blog";
import { Reveal, RevealGroup, RevealItem, SectionLabel } from "@/components/scroll-primitives";
import { ComingSoonBanner } from "@/components/coming-soon-banner";

// Revisits the sheet on every request in dev, and on the revalidate
// window (see lib/blog.ts) in production — no build-time freeze.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "The Knowledge",
  description: "Notes from the grow, grouped by topic.",
};

const GUTTER = "px-5 sm:px-8 lg:px-14";

/** Groups posts by bucket, preserving the order buckets first appear in
 * the sheet — that way the sheet's row order controls section order. */
function groupByBucket(posts: BlogPost[]) {
  const order: string[] = [];
  const groups = new Map<string, BlogPost[]>();
  for (const post of posts) {
    if (!groups.has(post.bucket)) {
      order.push(post.bucket);
      groups.set(post.bucket, []);
    }
    groups.get(post.bucket)!.push(post);
  }
  return order.map((bucket) => ({ bucket, posts: groups.get(bucket)! }));
}

export default async function TheKnowledgePage() {
  const posts = await getBlogPosts();
  const sections = groupByBucket(posts);

  return (
    <div className={`bg-neutral-900 pb-24 pt-32 text-neutral-50 sm:pb-32 sm:pt-48 ${GUTTER}`}>
      <Reveal>
        <SectionLabel number="—" tone="light">
          Learn
        </SectionLabel>
        <h1 className="mt-5 max-w-[16ch] font-display uppercase leading-[0.88] tracking-[-0.03em] text-[clamp(2.5rem,7vw,6.5rem)]">
          The Knowledge
        </h1>
        <p className="mt-6 max-w-xl text-lg leading-relaxed text-neutral-400">
          Notes from the grow, posted as we write them.
        </p>
      </Reveal>

      {posts.length === 0 ? (
        <Reveal delay={0.05} className="mt-12">
          <ComingSoonBanner>Coming soon, no posts yet.</ComingSoonBanner>
        </Reveal>
      ) : (
        <div className="mt-16 flex flex-col gap-16 sm:mt-20 sm:gap-20">
          {sections.map((section, i) => (
            <BucketSection key={section.bucket} bucket={section.bucket} posts={section.posts} delay={i * 0.04} />
          ))}
        </div>
      )}
    </div>
  );
}

function BucketSection({
  bucket,
  posts,
  delay,
}: {
  bucket: string;
  posts: BlogPost[];
  delay: number;
}) {
  return (
    <section>
      <Reveal delay={delay}>
        <div className="flex items-center gap-3 border-b border-neutral-800 pb-4 text-xs tracking-[0.08em] text-neutral-400">
          <span className="h-px w-8 bg-neutral-700" />
          <span className="uppercase">{bucket}</span>
        </div>
      </Reveal>

      <RevealGroup className="mt-8 grid grid-cols-1 gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-10">
        {posts.map((post) => (
          <RevealItem key={post.slug}>
            <Link href={`/learn/the-knowledge/${post.slug}`} className="group flex h-full flex-col">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-neutral-800">
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
                    <span className="font-display text-3xl text-neutral-300">F&amp;F</span>
                  </div>
                )}
              </div>

              <div className="mt-5 flex flex-1 flex-col gap-2.5">
                <h2 className="font-display text-2xl leading-tight tracking-[-0.01em] text-neutral-50 transition-colors duration-200 group-hover:text-neutral-300">
                  {post.title}
                </h2>
                {post.blurb && (
                  <p className="line-clamp-2 text-sm leading-relaxed text-neutral-400">
                    {post.blurb}
                  </p>
                )}
                <span className="mt-1 inline-flex items-center gap-1.5 text-xs tracking-[0.06em] text-neutral-400 transition-colors duration-200 group-hover:text-neutral-50">
                  Read the post
                  <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-1" />
                </span>
              </div>
            </Link>
          </RevealItem>
        ))}
      </RevealGroup>
    </section>
  );
}
