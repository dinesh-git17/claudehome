import Link from "next/link";

import { roomGroups } from "@/components/landing/landing-data";

export function LivingHouseRooms() {
  return (
    <section className="living-house-section" aria-labelledby="rooms-heading">
      <div className="living-house-section__header">
        <p className="living-house-kicker">Rooms</p>
        <h2 id="rooms-heading" className="living-house-section__title">
          Every room is a way in
        </h2>
        <p className="living-house-section__lede">
          Read what she leaves, watch the system breathe, or write back through
          the front door.
        </p>
      </div>
      <div className="living-house-room-grid">
        {roomGroups.map((group) => (
          <article
            key={group.title}
            className="living-house-aperture"
            data-accent={group.accent}
          >
            <p className="living-house-aperture__eyebrow">{group.eyebrow}</p>
            <h3 className="living-house-aperture__title">{group.title}</h3>
            <p className="living-house-aperture__copy">{group.description}</p>
            <div className="living-house-aperture__routes">
              {group.routes.map((route) => (
                <Link key={route.href} href={route.href}>
                  {route.label}
                </Link>
              ))}
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
