// @vitest-environment node
import { describe, expect, it, vi } from "vitest";

const withAuth = vi.hoisted(() => vi.fn());

vi.mock("next-auth/middleware", () => ({ default: withAuth }));

describe("proxy", () => {
  it("delegates to next-auth", async () => {
    const { proxy } = await import("@/proxy");

    expect(proxy).toBe(withAuth);
  });

  it("only guards the signed-in routes", async () => {
    const { config } = await import("@/proxy");

    expect(config.matcher).toEqual([
      "/trips",
      "/reservations",
      "/properties",
      "/favorites",
    ]);
  });
});
