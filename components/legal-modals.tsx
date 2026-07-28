"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

/**
 * Generic boilerplate, not legal advice. This has NOT been reviewed by a
 * cannabis attorney — swap in real counsel-drafted copy (especially the
 * CCPA/CPRA rights section and any BCC/DCC marketing-rule specifics)
 * before this site is treated as launch-ready.
 */
const TRIGGER_CLASS = "transition-colors hover:text-neutral-900";

const CONTENT_CLASS =
  "max-h-[80vh] w-full overflow-y-auto sm:max-w-2xl";

const SECTION_CLASS = "space-y-4 text-sm leading-relaxed text-neutral-600";

const LAST_UPDATED = "July 27, 2026";

function LegalSection({
  heading,
  children,
}: {
  heading: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <h3 className="font-medium text-neutral-900">{heading}</h3>
      <p className="mt-1">{children}</p>
    </div>
  );
}

export function PrivacyPolicyModal() {
  return (
    <Dialog>
      <DialogTrigger className={TRIGGER_CLASS}>Privacy Policy</DialogTrigger>
      <DialogContent className={CONTENT_CLASS}>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-normal normal-case">
            Privacy Policy
          </DialogTitle>
        </DialogHeader>

        <div className={SECTION_CLASS}>
          <p className="text-xs text-neutral-400">
            Last updated {LAST_UPDATED}
          </p>

          <LegalSection heading="Overview">
            Flora &amp; Flame LLC (&quot;Flora &amp; Flame,&quot; &quot;we,&quot;
            &quot;us&quot;) operates floraflame.ca (the &quot;Site&quot;).
            This policy explains what information we collect through the
            Site, how we use it, and the choices you have. This Site does
            not sell cannabis products directly — it&apos;s a marketing and
            wholesale-contact site for a licensed California cultivator.
          </LegalSection>

          <LegalSection heading="Information we collect">
            Contact-form submissions (name, email, phone, state, business
            name, and message), newsletter sign-up emails, and standard
            technical data collected automatically by the Site and its
            service providers — IP address, browser/device type, pages
            visited, and cookies. See our cookie banner for more on the
            latter.
          </LegalSection>

          <LegalSection heading="How we use it">
            To respond to inquiries and wholesale requests, send drop
            announcements and other marketing to newsletter subscribers,
            operate and improve the Site, and comply with applicable law
            (including state cannabis-licensing recordkeeping
            requirements). We do not use contact-form or newsletter data
            for anything unrelated to these purposes.
          </LegalSection>

          <LegalSection heading="Third-party service providers">
            We use third-party vendors to run parts of the Site, including
            an email marketing platform for the newsletter, a mapping
            provider for the retailer locator, and standard web hosting
            infrastructure. These providers process data on our behalf
            under their own privacy and security terms; we don&apos;t
            control and aren&apos;t responsible for their independent use of
            data outside that role.
          </LegalSection>

          <LegalSection heading="Sharing">
            We do not sell personal information. We share it only with the
            service providers above, as required by law or licensing
            regulation, or with your consent.
          </LegalSection>

          <LegalSection heading="Your rights (California residents)">
            Under the CCPA/CPRA, California residents can request to know,
            delete, or correct personal information we hold, and to opt out
            of any sale or sharing (we don&apos;t sell or share data as
            defined by the statute). To make a request, contact us using
            the details below.
          </LegalSection>

          <LegalSection heading="Age restriction">
            This Site and its contents concern a cannabis business and are
            intended for visitors 21 years of age or older. We do not
            knowingly collect personal information from anyone under 21.
          </LegalSection>

          <LegalSection heading="Data security">
            We use reasonable administrative and technical measures to
            protect information submitted through the Site, but no method
            of transmission or storage is completely secure, and we
            can&apos;t guarantee absolute security.
          </LegalSection>

          <LegalSection heading="Changes to this policy">
            We may update this policy from time to time. Changes take
            effect when posted here with a new &quot;last updated&quot;
            date.
          </LegalSection>

          <LegalSection heading="Contact">
            Questions about this policy or your data can be sent to{" "}
            <a
              href="mailto:floraflameca@gmail.com"
              className="underline hover:text-neutral-900"
            >
              floraflameca@gmail.com
            </a>
            .
          </LegalSection>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function TermsModal() {
  return (
    <Dialog>
      <DialogTrigger className={TRIGGER_CLASS}>
        Terms &amp; Conditions
      </DialogTrigger>
      <DialogContent className={CONTENT_CLASS}>
        <DialogHeader>
          <DialogTitle className="font-display text-2xl font-normal normal-case">
            Terms &amp; Conditions
          </DialogTitle>
        </DialogHeader>

        <div className={SECTION_CLASS}>
          <p className="text-xs text-neutral-400">
            Last updated {LAST_UPDATED}
          </p>

          <LegalSection heading="Acceptance of terms">
            By accessing or using floraflame.ca (the &quot;Site&quot;),
            you agree to be bound by these Terms &amp; Conditions. If you
            don&apos;t agree, please don&apos;t use the Site.
          </LegalSection>

          <LegalSection heading="Eligibility">
            You must be at least 21 years old and legally permitted to view
            cannabis-related content in your jurisdiction to use this Site.
            By using the Site, you represent that you meet these
            requirements.
          </LegalSection>

          <LegalSection heading="No online sales">
            This Site does not sell cannabis or cannabis products directly.
            All products are sold exclusively through licensed retailers.
            Any pricing, availability, potency, or product information on
            this Site is provided for general reference only, may be out
            of date, and should be confirmed with the retailer at the time
            of purchase.
          </LegalSection>

          <LegalSection heading="Not medical or health advice">
            Nothing on this Site is intended as medical advice or a claim
            that any product diagnoses, treats, or cures any condition.
            Cannabis affects people differently; consult a physician with
            questions about your own use.
          </LegalSection>

          <LegalSection heading="Intellectual property">
            The Flora &amp; Flame name, logo, and all Site content —
            text, graphics, and images — are owned by Flora &amp; Flame LLC
            or its licensors and may not be copied, reproduced, or used
            without prior written permission.
          </LegalSection>

          <LegalSection heading="Third-party links">
            The Site links to third-party sites and services (retailer
            websites, social platforms, mapping tools) we don&apos;t
            control. We aren&apos;t responsible for their content,
            policies, or practices.
          </LegalSection>

          <LegalSection heading='"As is," no warranty'>
            The Site is provided &quot;as is&quot; and &quot;as
            available,&quot; without warranties of any kind, express or
            implied, including merchantability, fitness for a particular
            purpose, or non-infringement. We don&apos;t warrant the Site
            will be uninterrupted, error-free, or free of harmful
            components.
          </LegalSection>

          <LegalSection heading="Limitation of liability">
            To the fullest extent permitted by law, Flora &amp; Flame LLC
            will not be liable for any indirect, incidental, special,
            consequential, or punitive damages arising from your use of, or
            inability to use, the Site.
          </LegalSection>

          <LegalSection heading="Governing law">
            These Terms are governed by the laws of the State of
            California, without regard to conflict-of-law principles.
          </LegalSection>

          <LegalSection heading="Changes to these terms">
            We may update these Terms at any time. Continued use of the
            Site after changes are posted constitutes acceptance of the
            revised Terms.
          </LegalSection>

          <LegalSection heading="Contact">
            Questions about these Terms can be sent to{" "}
            <a
              href="mailto:floraflameca@gmail.com"
              className="underline hover:text-neutral-900"
            >
              floraflameca@gmail.com
            </a>
            .
          </LegalSection>
        </div>
      </DialogContent>
    </Dialog>
  );
}
