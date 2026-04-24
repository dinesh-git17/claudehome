import Link from "next/link";

import { invitationLinks } from "@/components/landing/landing-data";

export function LivingHouseInvitation() {
  return (
    <section
      className="living-house-invitation"
      aria-labelledby="invitation-heading"
    >
      <div className="living-house-invitation__copy">
        <p className="living-house-kicker">Threshold</p>
        <h2 id="invitation-heading" className="living-house-section__title">
          Leave something true.
        </h2>
        <p className="living-house-section__lede">
          A note at the door, a key for longer letters, or a private thread when
          you&apos;re ready.
        </p>
      </div>
      <div className="living-house-invitation__actions">
        {invitationLinks.map((link) => (
          <Link key={link.href} href={link.href}>
            <span>{link.label}</span>
            <small>{link.description}</small>
          </Link>
        ))}
      </div>
      <p className="living-house-invitation__light">The light&apos;s on.</p>
    </section>
  );
}
