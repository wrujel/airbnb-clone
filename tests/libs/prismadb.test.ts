// @vitest-environment node
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const constructed = vi.hoisted(() => ({ count: 0 }));

vi.mock("@prisma/client", () => ({
  PrismaClient: class {
    constructor() {
      constructed.count += 1;
    }
  },
}));

type PrismaGlobal = typeof globalThis & { prisma?: unknown };

async function importClient() {
  vi.resetModules();
  return (await import("@/app/libs/prismadb")).default;
}

beforeEach(() => {
  constructed.count = 0;
  delete (globalThis as PrismaGlobal).prisma;
});

afterEach(() => {
  delete (globalThis as PrismaGlobal).prisma;
});

describe("prisma singleton", () => {
  it("creates a client and caches it on globalThis outside production", async () => {
    vi.stubEnv("NODE_ENV", "development");

    const client = await importClient();

    expect(constructed.count).toBe(1);
    expect((globalThis as PrismaGlobal).prisma).toBe(client);
  });

  it("reuses an already cached client", async () => {
    const existing = { marker: "cached" } as unknown as PrismaGlobal["prisma"];
    (globalThis as PrismaGlobal).prisma = existing;

    const client = await importClient();

    expect(client).toBe(existing);
    expect(constructed.count).toBe(0);
  });

  it("does not cache on globalThis in production", async () => {
    vi.stubEnv("NODE_ENV", "production");

    const client = await importClient();

    expect(constructed.count).toBe(1);
    expect(client).toBeDefined();
    expect((globalThis as PrismaGlobal).prisma).toBeUndefined();
  });
});
