import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: `Disclaimer - ${siteConfig.name}`
};

export default function DisclaimerPage() {
  const effectiveDate = "18 March 2026";
  const name = siteConfig.name;
  const contactEmail = siteConfig.contactEmail;

  return (
    <article className="legal-article">
      <h1>Disclaimer &mdash; No Gambling, No Real Money</h1>
      <p className="legal-effective">Effective date: {effectiveDate}</p>

      <div className="legal-callout">
        <p>
          <strong>{name} is NOT a gambling, betting, or wagering platform.</strong> It is an
          opinion-based forecasting game that uses virtual coins with absolutely no monetary value.
        </p>
      </div>

      <h2>1. Virtual Coins Are Not Money</h2>
      <p>
        The virtual coins (&ldquo;Coins&rdquo;) used on {name} are a game mechanic for tracking
        forecasting accuracy. They are not a currency, a digital asset, a cryptocurrency, a
        security, or a financial instrument of any kind.
      </p>
      <ul>
        <li>Coins have <strong>no monetary value</strong> &mdash; zero rupees, zero dollars, zero anything.</li>
        <li>Coins <strong>cannot be purchased</strong> with real money.</li>
        <li>Coins <strong>cannot be withdrawn, cashed out, or redeemed</strong> for money, goods, services, gift cards, or anything of value.</li>
        <li>Coins <strong>cannot be transferred</strong> between users or to external wallets.</li>
        <li>Coins <strong>cannot be sold</strong> on any marketplace.</li>
        <li>Your Coin balance may be reset, adjusted, or forfeited at any time by platform administrators.</li>
      </ul>

      <h2>2. This Is Not Gambling Under Indian Law</h2>
      <p>
        Under the Public Gambling Act, 1867, and applicable state gambling legislation, &ldquo;gambling&rdquo;
        requires the wagering of money or something of value on an event of chance. {name} does not
        meet this definition because:
      </p>
      <ol>
        <li><strong>No money or value is staked.</strong> Users stake virtual Coins that have no real-world value and were given to them for free.</li>
        <li><strong>No money or value is won.</strong> Successful forecasts earn additional virtual Coins that also have no real-world value.</li>
        <li><strong>No deposits or payments exist.</strong> There is no mechanism to add real money to the platform.</li>
        <li><strong>No withdrawals or payouts exist.</strong> There is no mechanism to extract real money from the platform.</li>
        <li><strong>Skill-based activity.</strong> Forecasting outcomes requires research, analysis, and calibration &mdash; it is a game of skill, not chance.</li>
      </ol>

      <h2>3. Applicable Legal Framework</h2>
      <p>{name} operates in compliance with the following Indian laws:</p>

      <h3>Public Gambling Act, 1867</h3>
      <p>
        This Act prohibits operating or visiting &ldquo;common gaming houses&rdquo; where gambling
        for money occurs. Since {name} involves no money, it does not constitute a gaming house
        under this Act.
      </p>

      <h3>State Gambling Laws</h3>
      <p>
        Various states have their own gambling regulations. All state gambling laws in India define
        gambling in terms of wagering money or valuables. Since {name} uses only virtual coins with
        no value, it falls outside the scope of every state gambling statute.
      </p>

      <h3>Information Technology Act, 2000</h3>
      <p>
        {name} complies with the IT Act and intermediary guidelines, including providing a
        Privacy Policy, Terms of Service, grievance redressal mechanism, and age verification.
      </p>

      <h3>Foreign Exchange Management Act (FEMA), 1999</h3>
      <p>
        Since no real currency, foreign exchange, or financial transactions are involved, FEMA
        is not applicable to {name}.
      </p>

      <h3>Prevention of Money Laundering Act (PMLA), 2002</h3>
      <p>
        Since {name} does not handle money, digital currency, or financial instruments of any
        kind, PMLA obligations do not apply.
      </p>

      <h2>4. Not Financial or Investment Advice</h2>
      <p>
        Nothing on {name} constitutes financial advice, investment advice, legal advice, or a
        recommendation to buy, sell, or hold any financial instrument. Market prices on {name}
        reflect aggregated user opinions, not professional forecasts.
      </p>
      <ul>
        <li>Do not make real-world financial decisions based on {name} market data.</li>
        <li>{name} is not affiliated with any stock exchange, commodity market, or regulated financial institution.</li>
        <li>{name} is not a SEBI-registered entity and does not provide any services regulated by SEBI.</li>
      </ul>

      <h2>5. No Guarantee of Accuracy</h2>
      <p>
        Market outcomes on {name} are resolved based on publicly available information. We strive
        for accuracy, but:
      </p>
      <ul>
        <li>We make no guarantee that market resolutions are error-free.</li>
        <li>Users may dispute resolutions through the platform&apos;s dispute mechanism.</li>
        <li>Resolution sources are cited in each market for transparency.</li>
      </ul>

      <h2>6. Platform Availability</h2>
      <p>
        {name} is provided &ldquo;as is&rdquo; without guarantees of uptime or availability. We
        may suspend, modify, or discontinue the platform at any time without liability, since no
        real money or value is at stake.
      </p>

      <h2>7. Age Restriction</h2>
      <p>
        {name} is restricted to users aged <strong>18 and above</strong>. This age restriction
        is a best practice for platforms involving predictive decision-making, not an acknowledgment
        that the platform constitutes gambling (it does not).
      </p>

      <h2>8. Regulatory Compliance Statement</h2>
      <p>
        If any regulatory authority in India determines that any feature of {name} requires
        a license, registration, or modification, we will promptly comply, including modifying
        or suspending affected features. We are committed to operating within the bounds of
        Indian law at all times.
      </p>

      <h2>9. Summary</h2>
      <div className="legal-callout">
        <ul>
          <li>No real money is involved &mdash; ever.</li>
          <li>No deposits. No withdrawals. No payments.</li>
          <li>Virtual coins are free, have zero value, and cannot be converted to anything of value.</li>
          <li>This is a skill-based opinion game, not gambling.</li>
          <li>{name} complies with all applicable Indian laws.</li>
          <li>Users must be 18+ to use the platform.</li>
        </ul>
      </div>

      <h2>10. Contact</h2>
      <p>
        If you have questions or concerns about this disclaimer, or if you believe any aspect
        of {name} may conflict with applicable laws, please contact us through the administrator
        email at: <a href={`mailto:${contactEmail}`}>{contactEmail}</a>. We take legal compliance seriously.
      </p>
    </article>
  );
}
