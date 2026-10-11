import type { Metadata } from "next";
import { LegalEmail, LegalPage, LegalSection } from "@/components/legal/legal-page";

const TITLE = "Accessibility";
const DESCRIPTION =
  "Flora & Flame's commitment to an accessible website, the standard we work toward, and how to report a barrier.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/accessibility" },
};

export default function AccessibilityPage() {
  return (
    <LegalPage title="Accessibility statement" effective="October 11, 2026">
      <LegalSection heading="Our commitment">
        <p>
          We want everyone who is 21 or older to be able to use this site, including people who use
          screen readers, keyboard navigation, magnification or other assistive technology.
        </p>
      </LegalSection>

      <LegalSection heading="Standard">
        <p>
          We aim to conform to the Web Content Accessibility Guidelines (WCAG) 2.1, Level AA. We test
          with keyboard-only navigation and automated checks, and fix issues as we find them.
        </p>
      </LegalSection>

      <LegalSection heading="Motion and video">
        <p>
          The site honors your device&apos;s &quot;Reduce motion&quot; setting: scroll animations and
          smooth scrolling are turned off and content is shown in its resting layout. Background
          videos and moving banners have pause controls.
        </p>
      </LegalSection>

      <LegalSection heading="Report a barrier">
        <p>
          If something on the site is hard to use, email <LegalEmail /> with the page address and a
          short description, and we&apos;ll get back to you within five business days and work on a
          fix. We can also send you any information from the site in another format.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
