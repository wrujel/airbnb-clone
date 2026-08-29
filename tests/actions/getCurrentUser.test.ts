// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import getCurrentUser, { getSession } from "@/app/actions/getCurrentUser";
import { makeUser } from "../helpers/factories";
import { prismaMock } from "../helpers/prisma";

const getServerSession = vi.hoisted(() => vi.fn());

vi.mock("next-auth/next", () => ({
  default: vi.fn(() => vi.fn()),
  getServerSession,
}));

vi.mock("bcrypt", () => ({ default: { hash: vi.fn(), compare: vi.fn() } }));

vi.mock("@/app/libs/prismadb", async () => ({
  default: (await import("../helpers/prisma")).prismaMock,
}));

beforeEach(() => {
  getServerSession.mockReset();
  prismaMock.user.findUnique.mockReset();
});

describe("getSession", () => {
  it("delegates to next-auth", async () => {
    getServerSession.mockResolvedValue({ user: { email: "ada@example.com" } });

    await expect(getSession()).resolves.toEqual({
      user: { email: "ada@example.com" },
    });
    expect(getServerSession).toHaveBeenCalledTimes(1);
  });
});

describe("getCurrentUser", () => {
  it("returns null when there is no session", async () => {
    getServerSession.mockResolvedValue(null);

    await expect(getCurrentUser()).resolves.toBeNull();
    expect(prismaMock.user.findUnique).not.toHaveBeenCalled();
  });

  it("returns null when the session carries no email", async () => {
    getServerSession.mockResolvedValue({ user: {} });

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("returns null when the session user is missing from the database", async () => {
    getServerSession.mockResolvedValue({ user: { email: "ada@example.com" } });
    prismaMock.user.findUnique.mockResolvedValue(null);

    await expect(getCurrentUser()).resolves.toBeNull();
  });

  it("returns the matching user", async () => {
    const user = makeUser();
    getServerSession.mockResolvedValue({ user: { email: user.email } });
    prismaMock.user.findUnique.mockResolvedValue(user);

    await expect(getCurrentUser()).resolves.toEqual(user);
    expect(prismaMock.user.findUnique).toHaveBeenCalledWith({
      where: { email: user.email },
    });
  });

  it("swallows errors and returns null", async () => {
    getServerSession.mockRejectedValue(new Error("session blew up"));

    await expect(getCurrentUser()).resolves.toBeNull();
  });
});
