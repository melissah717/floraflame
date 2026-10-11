import type { Metadata } from "next";
import Link from "next/link";
import { LegalEmail, LegalPage, LegalSection } from "@/components/legal/legal-page";

/* Not legal advice: have counsel review before relying on it. */

const TITLE = "Terms & Conditions";
const DESCRIPTION =
  "Terms for using the Flora & Flame website: 21+ only, no online sales, products sold only through licensed California retailers.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <LegalPage title={TITLE} effective="October 11, 2026">
      <LegalSection heading="Acceptance of terms">
        <p>
          By using floraandflame.co (the &quot;Site&quot;) you agree to these Terms &amp; Conditions.
          If you don&apos;t agree, please don&apos;t use the Site.
        </p>
      </LegalSection>

      <LegalSection heading="Eligibility">
        <p>
          You must be at least 21 years old and legally permitted to view cannabis-related content
          where you are. By using the Site you confirm that you are.
        </p>
      </LegalSection>

      <LegalSection heading="No online sales; California only">
        <p>
          The Site does not sell cannabis or cannabis products. Flora &amp; Flame products are sold
          only in California, only to adults 21 and older, and only through state-licensed retailers.
          Strain, potency, availability and other product information on the Site is for general
          reference, may be out of date, and should be confirmed with the retailer at purchase.
        </p>
      </LegalSection>

      <LegalSection heading="Federal law">
        <p>
          Cannabis is legal for adults 21 and older under California law but remains illegal under
          federal law. Nothing on the Site is an offer to sell or ship cannabis anywhere. Void where
          prohibited.
        </p>
      </LegalSection>

      <LegalSection heading="Not medical or health advice">
        <p>
          Nothing on the Site is medical advice or a claim that any product diagnoses, treats, cures
          or prevents any condition. Cannabis affects people differently. Talk to a physician about
          your own use.
        </p>
      </LegalSection>

      <LegalSection heading="Intellectual property">
        <p>
          The Flora &amp; Flame name, logo and all Site content, including text, graphics and images,
          belong to Flora &amp; Flame LLC or its licensors and may not be copied or reused without
          written permission.
        </p>
      </LegalSection>

      <LegalSection heading="Third-party links">
        <p>
          The Site links to sites and services we don&apos;t control, such as retailer websites,
          social platforms and maps. We aren&apos;t responsible for their content, policies or
          practices.
        </p>
      </LegalSection>

      <LegalSection heading='"As is," no warranty'>
        <p>
          The Site is provided &quot;as is&quot; and &quot;as available,&quot; without warranties of
          any kind, express or implied, including merchantability, fitness for a particular purpose
          or non-infringement.
        </p>
      </LegalSection>

      <LegalSection heading="Limitation of liability">
        <p>
          To the fullest extent permitted by law, Flora &amp; Flame LLC is not liable for indirect,
          incidental, special, consequential or punitive damages arising from your use of, or
          inability to use, the Site.
        </p>
      </LegalSection>

      <LegalSection heading="Governing law">
        <p>
          These Terms are governed by the laws of the State of California, without regard to
          conflict-of-law principles.
        </p>
      </LegalSection>

      <LegalSection heading="Changes to these terms">
        <p>
          We may update these Terms. The new version takes effect when posted here with a new
          effective date.
        </p>
      </LegalSection>

      <LegalSection heading="Contact">
        <p>
          Questions about these Terms: <LegalEmail />. See also our{" "}
          <Link href="/privacy" className="underline underline-offset-4 hover:text-neutral-50">
            Privacy Policy
          </Link>
          .
        </p>
      </LegalSection>
    </LegalPage>
  );
}
