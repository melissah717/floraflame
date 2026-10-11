import type { Metadata } from "next";
import Link from "next/link";
import { LegalEmail, LegalPage, LegalSection } from "@/components/legal/legal-page";

/*
 * Plain-language policy written to cover CalOPPA (Bus. & Prof. Code
 * §§ 22575–22579) and describe the CCPA/CPRA rights section. Not legal
 * advice: have counsel review before relying on it.
 */

const TITLE = "Privacy Policy";
const DESCRIPTION =
  "What information Flora & Flame collects through this site, how it's used, the service providers involved, and how to make a privacy request.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <LegalPage title={TITLE} effective="October 11, 2026">
      <LegalSection heading="Overview">
        <p>
          Flora &amp; Flame LLC (&quot;Flora &amp; Flame,&quot; &quot;we,&quot; &quot;us&quot;) operates
          floraandflame.co (the &quot;Site&quot;). This policy explains what information we collect
          through the Site, how we use it, and the choices you have. The Site does not sell cannabis.
          It&apos;s a brand, education and wholesale-contact site for a licensed California cultivator.
        </p>
      </LegalSection>

      <LegalSection heading="Information we collect">
        <p>
          <strong className="text-neutral-50">Newsletter.</strong> If you sign up, we collect your
          email address and your confirmation that you are 21 or older. It is stored by our email
          provider so we can send drop announcements.
        </p>
        <p>
          <strong className="text-neutral-50">Contact form.</strong> The form does not send anything
          to our servers. It opens your own email app with a pre-filled message, and we receive only
          what you choose to send by email (typically your name, email address, business name, the
          topic and your message).
        </p>
        <p>
          <strong className="text-neutral-50">Store locator.</strong> A city or zip code you type is
          sent to our mapping provider to find that location. &quot;Use my location&quot; asks your
          browser for your device location, which is used in your browser to sort nearby shops and is
          not sent to us.
        </p>
        <p>
          <strong className="text-neutral-50">Automatically.</strong> Our hosting provider records
          standard technical data (such as IP address, browser type and pages requested) to operate
          and secure the Site. We use cookieless analytics that measure page views and site
          performance in aggregate. We store your age confirmation and whether you&apos;ve seen our
          notices in your browser&apos;s local storage. We do not use advertising cookies.
        </p>
      </LegalSection>

      <LegalSection heading="How we use it">
        <p>
          To send newsletter emails you asked for, answer inquiries and wholesale requests, run and
          improve the Site, keep it secure, and meet legal and cannabis-licensing obligations. We
          don&apos;t use this information for anything unrelated to those purposes.
        </p>
      </LegalSection>

      <LegalSection heading="Service providers">
        <p>We use these companies to run parts of the Site. They process data on our behalf:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Vercel: website hosting, cookieless analytics and performance monitoring</li>
          <li>Kit: newsletter email delivery and subscriber list</li>
          <li>Mapbox: the retailer map and location search</li>
          <li>Cloudinary: image and video delivery</li>
          <li>Supabase: the database that stores Site content such as strain details</li>
        </ul>
      </LegalSection>

      <LegalSection heading="Sharing">
        <p>
          We do not sell your personal information or share it for cross-context behavioral
          advertising. We share it only with the service providers above, when required by law or
          cannabis regulators, or with your consent.
        </p>
      </LegalSection>

      <LegalSection heading="Tracking across websites, Do Not Track and Global Privacy Control">
        <p>
          We do not track you across other websites, and we do not allow third parties to collect
          personally identifiable information about your online activities over time and across
          different websites through our Site. Because we don&apos;t engage in that kind of tracking,
          the Site works the same whether or not your browser sends a Do Not Track signal. We treat a
          Global Privacy Control signal as a request to opt out of any sale or sharing of personal
          information, which we don&apos;t do in any case.
        </p>
      </LegalSection>

      <LegalSection heading="Reviewing, correcting or deleting your information">
        <p>
          Every newsletter email has an unsubscribe link. To see, correct or delete information we
          hold about you, email <LegalEmail /> with &quot;Privacy Request&quot; in the subject line. We
          will respond within 45 days.
        </p>
      </LegalSection>

      <LegalSection heading="Your rights (California residents)">
        <p>
          Under the California Consumer Privacy Act as amended by the CPRA, where it applies, California
          residents may request to know, delete or correct personal information we hold, and to opt out
          of any sale or sharing. We will not discriminate against you for using these rights. Make a
          request using the contact details below.
        </p>
      </LegalSection>

      <LegalSection heading="Age restriction">
        <p>
          The Site is intended only for adults 21 and older. We do not knowingly collect personal
          information from anyone under 21. If you believe we have, contact us and we will delete it.
        </p>
      </LegalSection>

      <LegalSection heading="Data security">
        <p>
          We use reasonable administrative and technical measures to protect information, but no
          method of transmission or storage is completely secure.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to this policy">
        <p>
          If we change this policy we will post the new version here with a new effective date.
          Significant changes will also be noted on the home page.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about this policy or your information: <LegalEmail />. See also our{" "}
          <Link href="/terms" className="underline underline-offset-4 hover:text-neutral-50">
            Terms &amp; Conditions
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
