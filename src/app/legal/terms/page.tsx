import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Terms of Service - ${siteConfig.name}`
};

export default function TermsPage() {
  const effectiveDate = "18 March 2026";
  const name = siteConfig.name;
  const grievanceEmail = siteConfig.grievanceEmail;
  const contactEmail = siteConfig.contactEmail;

  return (
    <article className="legal-article">
      <h1>Terms of Service</h1>
      <p className="legal-effective">Effective date: {effectiveDate}</p>

      <p>
        Welcome to {name}. By creating an account or using the platform, you agree to these
        Terms of Service (&ldquo;Terms&rdquo;). If you do not agree, do not use {name}.
      </p>

      <h2>1. About the Platform</h2>
      <p>
        {name} is an <strong>opinion-based forecasting platform</strong> where users predict the
        outcomes of real-world events using virtual coins. {name} is designed for entertainment
        and educational purposes only.
      </p>
      <ul>
        <li>
          <strong>{name} does not involve real money, gambling, betting, or wagering of any kind.</strong>
        </li>
        <li>Virtual coins (&ldquo;Coins&rdquo;) have no monetary value whatsoever.</li>
        <li>Coins cannot be deposited, withdrawn, transferred, sold, exchanged, or redeemed for cash, cryptocurrency, goods, services, or anything of value.</li>
        <li>No user will ever be required to pay to use {name}.</li>
      </ul>

      <h2>2. Eligibility</h2>
      <p>
        You must be <strong>at least 18 years of age</strong> to use {name}. By creating an account,
        you represent and warrant that you are 18 years or older. We reserve the right to terminate
        accounts that we reasonably believe belong to underage users.
      </p>

      <h2>3. Account Registration</h2>
      <ul>
        <li>You must provide a valid email address and create a password.</li>
        <li>You are responsible for maintaining the confidentiality of your credentials.</li>
        <li>You agree to provide accurate information and to keep it up to date.</li>
        <li>One account per person. Duplicate or fraudulent accounts may be terminated.</li>
      </ul>

      <h2>4. How Forecasting Works</h2>
      <p>
        {name} hosts &ldquo;markets&rdquo; &mdash; questions about real-world events with binary
        (Yes/No) outcomes. Users express their opinion by placing a forecast using virtual Coins.
      </p>
      <ul>
        <li>Each user receives a starting balance of virtual Coins upon registration.</li>
        <li>Users stake Coins on an outcome. If the outcome matches their forecast, they receive a payout in virtual Coins. If not, the staked Coins are lost.</li>
        <li>Payouts are calculated using a transparent formula displayed on the platform.</li>
        <li>Calibration is scored using the Brier scoring system for leaderboard rankings.</li>
      </ul>

      <h2>5. Market Resolution</h2>
      <ul>
        <li>Markets are created and resolved by platform administrators.</li>
        <li>Resolution is based on publicly verifiable sources cited in each market description.</li>
        <li>Users may dispute a resolution through the dispute mechanism within the platform.</li>
        <li>{name} reserves the right to void, cancel, or re-resolve markets if the resolution source is ambiguous or if an error is discovered.</li>
      </ul>

      <h2>6. User Conduct</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Use the platform for any unlawful purpose.</li>
        <li>Attempt to manipulate markets through fraudulent accounts or coordinated activity.</li>
        <li>Interfere with the platform&apos;s operation, including automated scraping, denial-of-service attacks, or exploitation of bugs.</li>
        <li>Impersonate another person or entity.</li>
        <li>Post abusive, defamatory, or hateful content through any user-facing field.</li>
      </ul>

      <h2>7. Intellectual Property</h2>
      <p>
        All content, design, code, and branding on {name} are the property of the platform operator
        unless otherwise noted. You may not reproduce, distribute, or create derivative works without
        written permission.
      </p>

      <h2>8. Disclaimer of Warranties</h2>
      <p>
        {name} is provided <strong>&ldquo;as is&rdquo;</strong> and <strong>&ldquo;as available&rdquo;</strong> without
        warranties of any kind, express or implied. We do not warrant that the platform will be
        uninterrupted, error-free, or secure.
      </p>

      <h2>9. Limitation of Liability</h2>
      <p>
        To the maximum extent permitted by applicable law, {name} and its operators shall not be
        liable for any indirect, incidental, special, consequential, or punitive damages arising
        from your use of the platform.
      </p>
      <p>
        Since no real money is involved, the maximum aggregate liability of {name} to any user
        shall not exceed INR 0 (zero).
      </p>

      <h2>10. Termination</h2>
      <p>
        We may suspend or terminate your account at any time, with or without notice, for any
        reason, including violation of these Terms. Upon termination, your virtual Coin balance
        is forfeited (as it has no monetary value).
      </p>

      <h2>11. Changes to Terms</h2>
      <p>
        We may update these Terms from time to time. We will notify registered users of material
        changes via email or an in-platform notice. Continued use of {name} after changes take
        effect constitutes acceptance of the updated Terms.
      </p>

      <h2>12. Governing Law &amp; Dispute Resolution</h2>
      <p>
        These Terms are governed by the laws of the Republic of India. Any disputes shall be
        subject to the exclusive jurisdiction of courts in New Delhi, India.
      </p>
      <p>
        Before filing any legal action, both parties agree to attempt resolution through good-faith
        negotiation for a period of at least 30 days.
      </p>

      <h2>13. Grievance Officer</h2>
      <p>
        In accordance with the Information Technology Act, 2000 and the Information Technology
        (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, the designated
        Grievance Officer can be contacted at:{" "}
        <a href={`mailto:${grievanceEmail}`}>{grievanceEmail}</a>.
        Grievances will be acknowledged within 24 hours and resolved within 15 days.
      </p>

      <h2>14. Severability</h2>
      <p>
        If any provision of these Terms is found to be unenforceable, the remaining provisions
        shall continue in full force and effect.
      </p>

      <h2>15. Contact</h2>
      <p>
        For questions about these Terms, contact us at:{" "}
        <a href={`mailto:${contactEmail}`}>{contactEmail}</a>
      </p>
    </article>
  );
}
