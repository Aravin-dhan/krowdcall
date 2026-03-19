import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Privacy Policy - ${siteConfig.name}`
};

export default function PrivacyPage() {
  const effectiveDate = "18 March 2026";
  const name = siteConfig.name;
  const grievanceEmail = siteConfig.grievanceEmail;
  const contactEmail = siteConfig.contactEmail;

  return (
    <article className="legal-article">
      <h1>Privacy Policy</h1>
      <p className="legal-effective">Effective date: {effectiveDate}</p>

      <p>
        This Privacy Policy explains how {name} (&ldquo;we,&rdquo; &ldquo;us,&rdquo;
        &ldquo;our&rdquo;) collects, uses, stores, and protects your personal data. This
        policy is drafted in compliance with the Information Technology Act, 2000; the
        Information Technology (Reasonable Security Practices and Procedures and Sensitive
        Personal Data or Information) Rules, 2011; the Information Technology (Intermediary
        Guidelines and Digital Media Ethics Code) Rules, 2021; and the Digital Personal Data
        Protection Act, 2023 (&ldquo;DPDP Act&rdquo;).
      </p>

      <h2>1. Data We Collect</h2>

      <h3>1.1 Information You Provide</h3>
      <ul>
        <li><strong>Account data:</strong> email address, display name, and password (stored as a one-way hash; we never store your plain-text password).</li>
        <li><strong>Forecast data:</strong> your predictions, positions, and market activity within the platform.</li>
      </ul>

      <h3>1.2 Information Collected Automatically</h3>
      <ul>
        <li><strong>IP address:</strong> collected for rate limiting and abuse prevention only. We do not use IP addresses for tracking or profiling.</li>
        <li><strong>Session tokens:</strong> stored as HTTP-only cookies for authentication. Tokens are hashed with SHA-256 before storage.</li>
        <li><strong>Usage data:</strong> pages visited, actions taken within the platform (forecasts placed, markets viewed). This data is aggregated and not linked to external identifiers.</li>
      </ul>

      <h3>1.3 Data We Do NOT Collect</h3>
      <ul>
        <li>We do not collect financial information, bank details, or payment data of any kind.</li>
        <li>We do not collect Aadhaar numbers, PAN numbers, or government-issued IDs.</li>
        <li>We do not use third-party trackers, advertising pixels, or analytics services that share data with third parties.</li>
      </ul>

      <h2>2. Purpose of Data Collection</h2>
      <p>We collect and process your data for the following lawful purposes:</p>
      <table className="legal-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Purpose</th>
            <th>Legal basis (DPDP Act)</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Email, display name</td>
            <td>Account creation, authentication, communication</td>
            <td>Consent (at registration)</td>
          </tr>
          <tr>
            <td>Password hash</td>
            <td>Secure authentication</td>
            <td>Consent (at registration)</td>
          </tr>
          <tr>
            <td>IP address</td>
            <td>Rate limiting, abuse prevention</td>
            <td>Legitimate use (platform security)</td>
          </tr>
          <tr>
            <td>Forecast activity</td>
            <td>Platform functionality, leaderboards</td>
            <td>Consent (by using the service)</td>
          </tr>
        </tbody>
      </table>

      <h2>3. Data Storage &amp; Security</h2>
      <ul>
        <li>Data is stored in encrypted databases hosted on secure cloud infrastructure.</li>
        <li>Passwords are hashed using bcrypt with a cost factor of 10.</li>
        <li>Session tokens are hashed with SHA-256 before storage; raw tokens are never persisted.</li>
        <li>All communication between your browser and our servers uses HTTPS/TLS encryption.</li>
        <li>We implement rate limiting on authentication endpoints to prevent brute-force attacks.</li>
        <li>Access to the database is restricted to authorized administrators only.</li>
      </ul>

      <h2>4. Data Retention</h2>
      <ul>
        <li><strong>Account data:</strong> retained as long as your account is active. Deleted within 30 days of account deletion request.</li>
        <li><strong>Session tokens:</strong> automatically expire after 30 days and are purged from the database.</li>
        <li><strong>Email verification tokens:</strong> expire after 24 hours.</li>
        <li><strong>Password reset tokens:</strong> expire after 2 hours.</li>
        <li><strong>Rate limit records:</strong> stale records are automatically cleaned up.</li>
      </ul>

      <h2>5. Your Rights Under the DPDP Act, 2023</h2>
      <p>As a Data Principal, you have the following rights:</p>
      <ul>
        <li><strong>Right to Access:</strong> You may request a summary of the personal data we hold about you.</li>
        <li><strong>Right to Correction:</strong> You may request correction of inaccurate or incomplete personal data.</li>
        <li><strong>Right to Erasure:</strong> You may request deletion of your account and all associated personal data.</li>
        <li><strong>Right to Withdraw Consent:</strong> You may withdraw consent at any time by deleting your account. Note that withdrawing consent may prevent you from using the platform.</li>
        <li><strong>Right to Grievance Redressal:</strong> You may raise a complaint with our Grievance Officer (see Section 9).</li>
        <li><strong>Right to Nominate:</strong> You may nominate another person to exercise your data rights in case of death or incapacity, as provided under the DPDP Act.</li>
      </ul>

      <h2>6. Data Sharing</h2>
      <p>We do not sell, rent, or share your personal data with any third party, except:</p>
      <ul>
        <li><strong>Email delivery:</strong> We use a transactional email service to send verification and password reset emails. Only your email address is shared with the email provider for this purpose.</li>
        <li><strong>Legal obligations:</strong> We may disclose data if required by law, court order, or government authority.</li>
      </ul>

      <h2>7. Cookies &amp; Local Storage</h2>
      <ul>
        <li><strong>Session cookie:</strong> An HTTP-only, secure cookie is used for authentication. It contains a random token (not your personal data) and expires after 30 days.</li>
        <li><strong>Theme preference:</strong> Your light/dark mode choice is stored in browser localStorage. This is not transmitted to our servers.</li>
        <li>We do not use advertising cookies, analytics cookies, or third-party cookies.</li>
      </ul>

      <h2>8. Children&apos;s Privacy</h2>
      <p>
        {name} is intended for users aged 18 and above. We do not knowingly collect personal
        data from anyone under the age of 18. If we become aware that a user is under 18, we
        will delete their account and associated data promptly.
      </p>

      <h2>9. Grievance Officer</h2>
      <p>
        In compliance with Rule 3(11) of the Information Technology (Intermediary Guidelines
        and Digital Media Ethics Code) Rules, 2021, and Section 8(10) of the DPDP Act, 2023,
        the designated Grievance Officer / Data Protection Officer can be contacted at:{" "}
        <a href={`mailto:${grievanceEmail}`}>{grievanceEmail}</a>.
      </p>
      <ul>
        <li>Grievances will be acknowledged within 24 hours of receipt.</li>
        <li>Resolution will be provided within 15 days of acknowledgment.</li>
        <li>If unsatisfied with the resolution, you may approach the Data Protection Board of India as established under the DPDP Act.</li>
      </ul>

      <h2>10. Cross-Border Data Transfer</h2>
      <p>
        Our servers may be located outside India. By using {name}, you consent to the transfer
        of your data to servers in jurisdictions permitted under the DPDP Act. We ensure that
        adequate security measures are maintained regardless of server location.
      </p>

      <h2>11. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. Material changes will be communicated
        via email or in-platform notice. Continued use of {name} after changes take effect
        constitutes acceptance of the updated policy.
      </p>

      <h2>12. Contact</h2>
      <p>
        For privacy-related inquiries, data access requests, or to exercise any of your rights,
        contact us at: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.
      </p>
    </article>
  );
}
