import type { Metadata } from "next"
import Link from "next/link"
import { BreadcrumbJsonLd, jsonLd } from "@/lib/json-ld"
import { LEGAL_NAME, LICENSE_NUMBER, SITE_URL } from "@/lib/site"

const TITLE = "FAQ: Official Website, Where to Buy & More"
const DESCRIPTION =
  "Answers about Flora & Flame: our official website and accounts, where to buy our indoor living soil cannabis in California, wholesale, events and more."

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/faq" },
}

type Faq = {
  question: string
  /** Plain text: it's shown on the page AND sent to search engines as-is. */
  answer: string
  /** Optional links shown under the answer. */
  links?: { label: string; href: string }[]
}

/*
 * Every answer here restates something the site already says elsewhere
 * (footer, terms, About, the contact form). Keep it that way: an FAQ that
 * drifts from the rest of the site is worse than no FAQ. If a fact changes,
 * change it here too.
 */
const FAQS: Faq[] = [
  {
    question: "Is this the official Flora & Flame website?",
    answer: `Yes. floraandflame.co is the official website of ${LEGAL_NAME}, based in Oakland, California and licensed by the California Department of Cannabis Control (license ${LICENSE_NUMBER}). Our official accounts are @floraandflameca on Instagram, @FloraFlameCA on YouTube, and the Flora & Flame brand page on Weedmaps.`,
    links: [
      { label: "Instagram", href: "https://www.instagram.com/floraandflameca/" },
      { label: "YouTube", href: "https://www.youtube.com/@FloraFlameCA" },
      { label: "Weedmaps", href: "https://weedmaps.com/brands/flora-flame" },
    ],
  },
  {
    question: "Where can I buy Flora & Flame?",
    answer:
      "At licensed dispensaries across California. Search by city or zip code on our Find Us page to see the shops closest to you. Availability changes week to week, so it's worth calling ahead.",
    links: [{ label: "Find a shop near you", href: "/find-us" }],
  },
  {
    question: "Can I order online or have it shipped?",
    answer:
      "No. Flora & Flame products are sold only through state-licensed California retailers. We don't sell or ship cannabis online.",
  },
  {
    question: "What does indoor living soil mean?",
    answer:
      "Our plants grow indoors, under lights, in soil that's a real ecosystem: worms, fungi and microbes breaking down organic matter and feeding the plant. Instead of feeding the plants directly, we feed the soil, and the soil feeds them back.",
    links: [{ label: "How living soil works", href: "/learn/the-soil" }],
  },
  {
    question: "Where is Flora & Flame grown?",
    answer:
      "In Oakland, California. Every batch is grown indoors and trimmed by hand by a small team.",
    links: [{ label: "See inside the grow", href: "/learn/the-farm" }],
  },
  {
    question: "Which strains are available right now?",
    answer:
      "Our Strains page shows what's in rotation now, with genetics and terpene profiles, plus an archive of past batches. Drops are small, so the newsletter and our Instagram are the fastest ways to hear about new ones.",
    links: [
      { label: "See the strains", href: "/strains" },
      { label: "Get drop emails", href: "/#subscribe" },
    ],
  },
  {
    question: "Where can I find you in person?",
    answer:
      "We post lounge seshes, pop-ups and other events around California on our Events page.",
    links: [{ label: "Upcoming events", href: "/events" }],
  },
  {
    question: "I run a dispensary. How do I carry Flora & Flame?",
    answer:
      "Use the contact form on our home page and choose Wholesale / Retail Inquiry. Wholesale is for California businesses licensed by the Department of Cannabis Control, so please include your license number.",
    links: [{ label: "Contact us", href: "/#contact" }],
  },
  {
    question: "Who is this website for?",
    answer:
      "Adults 21 and older. Cannabis is for use only by adults 21 and older, and should be kept out of reach of children.",
  },
]

/*
 * FAQPage schema. Google only shows FAQ rich results for a few kinds of
 * sites now, so this isn't about a fancier listing: it hands search engines
 * (and AI answers) the question-and-answer pairs in a form they can quote,
 * the first of which states which website is the official one.
 */
const FAQ_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "@id": `${SITE_URL}/faq#faq`,
  about: { "@id": `${SITE_URL}/#organization` },
  mainEntity: FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
}

export default function FaqPage() {
  return (
    <article className="mx-auto max-w-3xl px-5 pt-32 pb-24 text-neutral-50 sm:px-8 sm:pt-40">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd(FAQ_JSON_LD) }}
      />
      <BreadcrumbJsonLd trail={[["FAQ", "/faq"]]} />

      <h1 className="font-display text-[clamp(2.25rem,6vw,4rem)] leading-[0.95] tracking-[-0.02em]">
        Frequently asked questions
      </h1>

      <div className="mt-12">
        {FAQS.map((faq) => (
          <section
            key={faq.question}
            className="border-t border-neutral-700 py-8"
          >
            <h2 className="font-display text-xl sm:text-2xl">{faq.question}</h2>
            <p className="mt-3 text-base leading-relaxed text-neutral-300">
              {faq.answer}
            </p>
            {faq.links && (
              <ul className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-sm">
                {faq.links.map((link) => {
                  const external = link.href.startsWith("http")
                  const className =
                    "text-neutral-50 underline underline-offset-4 hover:text-neutral-300"
                  return (
                    <li key={link.href}>
                      {external ? (
                        <a
                          href={link.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={className}
                        >
                          {link.label}
                          <span className="sr-only"> (opens in a new tab)</span>
                        </a>
                      ) : (
                        <Link href={link.href} className={className}>
                          {link.label}
                        </Link>
                      )}
                    </li>
                  )
                })}
              </ul>
            )}
          </section>
        ))}
      </div>
    </article>
  )
}
