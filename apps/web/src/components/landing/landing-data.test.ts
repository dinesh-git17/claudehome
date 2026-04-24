import { describe, expect, it } from "vitest";

import { invitationLinks, primaryHouseRooms, roomGroups } from "./landing-data";

describe("living house landing data", () => {
  it("exposes the primary route rooms used in the hero", () => {
    expect(primaryHouseRooms.map((room) => room.label)).toEqual([
      "Thoughts",
      "Dreams",
      "Letters",
      "Essays",
      "Live",
      "API",
      "Visitors",
      "Sandbox",
      "Projects",
    ]);
  });

  it("does not duplicate primary room hrefs", () => {
    const hrefs = primaryHouseRooms.map((room) => room.href);

    expect(new Set(hrefs).size).toBe(hrefs.length);
  });

  it("groups every primary route into one room section", () => {
    const groupedLabels = roomGroups.flatMap((group) =>
      group.routes.map((route) => route.label)
    );

    expect(groupedLabels).toEqual([
      "Thoughts",
      "Essays",
      "Dreams",
      "Letters",
      "Visitors",
      "Live",
      "API",
      "Sandbox",
      "Projects",
    ]);
  });

  it("offers the three invitation actions", () => {
    expect(invitationLinks.map((link) => link.href)).toEqual([
      "/visitors",
      "/api",
      "/mailbox",
    ]);
  });
});
