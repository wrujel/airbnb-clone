// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DELETE, POST } from "@/app/api/favorites/[listingId]/route";
import { makeUser } from "../helpers/factories";
import { prismaMock } from "../helpers/prisma";

const getCurrentUser = vi.hoisted(() => vi.fn());

vi.mock("@/app/actions/getCurrentUser", () => ({ default: getCurrentUser }));

vi.mock("@/app/libs/prismadb", async () => ({
  default: (await import("../helpers/prisma")).prismaMock,
}));

const request = new Request("http://localhost/api/favorites/listing-1");

beforeEach(() => {
  getCurrentUser.mockReset();
  prismaMock.user.update.mockReset();
});

describe("POST /api/favorites/[listingId]", () => {
  it("errors when signed out", async () => {
    getCurrentUser.mockResolvedValue(null);

    const response = await POST(request, {
      params: Promise.resolve({ listingId: "listing-1" }),
    });

    expect(response.type).toBe("error");
    expect(prismaMock.user.update).not.toHaveBeenCalled();
  });

  it("rejects a missing id", async () => {
    getCurrentUser.mockResolvedValue(makeUser());

    await expect(
      POST(request, { params: Promise.resolve({}) })
    ).rejects.toThrow("Invalid ID");
  });

  it("appends the listing to the user's favorites", async () => {
    const user = makeUser({ favoriteIds: ["listing-0"] });
    getCurrentUser.mockResolvedValue(user);
    prismaMock.user.update.mockResolvedValue(user);

    const response = await POST(request, {
      params: Promise.resolve({ listingId: "listing-1" }),
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { favoriteIds: ["listing-0", "listing-1"] },
    });
    await expect(response.json()).resolves.toMatchObject({ id: user.id });
  });

  it("starts a favorites list when the user has none", async () => {
    const user = makeUser({ favoriteIds: undefined as unknown as string[] });
    getCurrentUser.mockResolvedValue(user);
    prismaMock.user.update.mockResolvedValue(user);

    await POST(request, {
      params: Promise.resolve({ listingId: "listing-1" }),
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { favoriteIds: ["listing-1"] },
    });
  });
});

describe("DELETE /api/favorites/[listingId]", () => {
  it("errors when signed out", async () => {
    getCurrentUser.mockResolvedValue(null);

    const response = await DELETE(request, {
      params: Promise.resolve({ listingId: "listing-1" }),
    });

    expect(response.type).toBe("error");
  });

  it("rejects a missing id", async () => {
    getCurrentUser.mockResolvedValue(makeUser());

    await expect(
      DELETE(request, { params: Promise.resolve({}) })
    ).rejects.toThrow("Invalid ID");
  });

  it("drops the listing from the user's favorites", async () => {
    const user = makeUser({ favoriteIds: ["listing-0", "listing-1"] });
    getCurrentUser.mockResolvedValue(user);
    prismaMock.user.update.mockResolvedValue(user);

    await DELETE(request, {
      params: Promise.resolve({ listingId: "listing-1" }),
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { favoriteIds: ["listing-0"] },
    });
  });

  it("copes with a user that has no favorites array", async () => {
    const user = makeUser({ favoriteIds: undefined as unknown as string[] });
    getCurrentUser.mockResolvedValue(user);
    prismaMock.user.update.mockResolvedValue(user);

    await DELETE(request, {
      params: Promise.resolve({ listingId: "listing-1" }),
    });

    expect(prismaMock.user.update).toHaveBeenCalledWith({
      where: { id: user.id },
      data: { favoriteIds: [] },
    });
  });
});
