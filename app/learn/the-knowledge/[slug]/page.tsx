import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getBlogPost } from "@/lib/blog";
import { Reveal } from "@/components/scroll-primitives";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) return { title: "Not found" };

  const description = post.blurb || `Notes from the grow: ${post.title}.`
  const socialTitle = `${post.title} | Flora & Flame`

  return {
    title: post.title,
    description,
    alternates: { canonical: `/learn/the-knowledge/${slug}` },
    openGraph: post.heroImage
      ? { title: socialTitle, description, images: [post.heroImage] }
      : { title: socialTitle, description },
    twitter: { title: socialTitle, description },
  }
}

export default async function KnowledgePostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getBlogPost(slug);
  if (!post) notFound();

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.blurb || undefined,
    image: post.heroImage || undefined,
    author: { "@type": "Organization", name: "Flora & Flame" },
    publisher: { "@type": "Organization", name: "Flora & Flame" },
    mainEntityOfPage: `https://floraflame.ca/learn/the-knowledge/${slug}`,
  };

  return (
    <article className="mx-auto max-w-3xl px-5 pb-24 pt-32 sm:px-8 sm:pt-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />
      <Reveal>
        <Link
          href="/learn/the-knowledge"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 transition-colors hover:text-neutral-50"
        >
          <ArrowLeft className="h-4 w-4" />
          The Knowledge
        </Link>

        <h1 className="mt-6 font-display text-4xl leading-[1.05] tracking-[-0.01em] sm:text-5xl">
          {post.title}
        </h1>

        {post.blurb && (
          <p className="mt-5 text-lg leading-relaxed text-neutral-400">
            {post.blurb}
          </p>
        )}
      </Reveal>

      {post.heroImage && (
        <Reveal delay={0.05}>
          <div className="relative mt-10 aspect-[16/9] w-full overflow-hidden rounded-2xl">
            <Image
              src={post.heroImage}
              alt={post.title}
              fill
              sizes="(max-width: 768px) 100vw, 768px"
              priority
              className="object-cover"
            />
          </div>
        </Reveal>
      )}

      <div className="mt-12 flex flex-col gap-10">
        {post.paragraphs.map((p, i) => (
          <Reveal key={i} delay={0.05}>
            {p.title && (
              <h2 className="font-display text-2xl tracking-[-0.01em] text-neutral-50">
                {p.title}
              </h2>
            )}
            {p.image && (
              <div className="relative mx-auto mt-4 aspect-[16/9] w-[88%] overflow-hidden rounded-2xl">
                <Image
                  src={p.image}
                  alt={p.title || post.title}
                  fill
                  sizes="(max-width: 768px) 88vw, 676px"
                  className="object-cover"
                />
              </div>
            )}
            {p.body && (
              <p className="mt-3 text-base leading-relaxed text-neutral-300 sm:text-lg">
                {p.body}
              </p>
            )}
          </Reveal>
        ))}
      </div>
    </article>
  );
}
