import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

beforeAll(() => {
  process.env.CLAUDE_API_URL = "http://localhost:8000";
  process.env.CLAUDE_API_KEY = "test-key";
});

import { postModerationLog } from "./client";

const fetchMock = vi.fn();

vi.stubGlobal("fetch", fetchMock);

afterEach(() => {
  fetchMock.mockReset();
});

describe("postModerationLog", () => {
  it("forwards a payload that does not include client_ip", async () => {
    fetchMock.mockResolvedValue(
      new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      })
    );

    await postModerationLog({
      name: "alice",
      message_preview: "hello",
      allowed: true,
      reason: "approved",
      sentiment: "neutral",
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [, init] = fetchMock.mock.calls[0] ?? [];
    const body =
      init && typeof init === "object" && "body" in init
        ? JSON.parse(String(init.body))
        : {};
    expect(body).not.toHaveProperty("client_ip");
    expect(body).toMatchObject({
      name: "alice",
      message_preview: "hello",
      allowed: true,
      reason: "approved",
      sentiment: "neutral",
    });
  });
});
