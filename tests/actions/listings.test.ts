// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import getFavoriteListings from "@/app/actions/getFavoriteListings";
import getListingById from "@/app/actions/getListingById";
import getListings from "@/app/actions/getListings";
import getReservations from "@/app/actions/getReservations";
import { makeListing, makeReservation, makeUser } from "../helpers/factories";
import { prismaMock } from "../helpers/prisma";

const getCurrentUser = vi.hoisted(() => vi.fn());

vi.mock("@/app/actions/getCurrentUser", () => ({ default: getCurrentUser }));

vi.mock("@/app/libs/prismadb", async () => ({
  default: (await import("../helpers/prisma")).prismaMock,
}));

beforeEach(() => {
  getCurrentUser.mockReset();
  prismaMock.listing.findMany.mockReset();
  prismaMock.listing.findUnique.mockReset();
  prismaMock.reservation.findMany.mockReset();
});

describe("getListings", () => {
  it("queries with no filters", async () => {
    const listings = [makeListing()];
    prismaMock.listing.findMany.mockResolvedValue(listings);

    await expect(getListings({})).resolves.toEqual(listings);
    expect(prismaMock.listing.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: "asc" },
    });
  });

  it("builds a query from every supported filter", async () => {
    prismaMock.listing.findMany.mockResolvedValue([]);

    await getListings({
      userId: "user-1",
      category: "Beach",
      locationValue: "PE",
      guestCount: 2,
      roomCount: 3,
      bathroomCount: 1,
      startDate: "2024-05-01",
      endDate: "2024-05-05",
    });

    expect(prismaMock.listing.findMany).toHaveBeenCalledWith({
      where: {
        userId: "user-1",
        category: "Beach",
        locationValue: "PE",
        guestCount: { gte: 2 },
        roomCount: { gte: 3 },
        bathroomCount: { gte: 1 },
        NOT: {
          reservations: {
            some: {
              OR: [
                {
                  endDate: { gte: "2024-05-01" },
                  startDate: { lte: "2024-05-01" },
                },
                {
                  startDate: { lte: "2024-05-05" },
                  endDate: { gte: "2024-05-05" },
                },
              ],
            },
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });
  });

  it("ignores a half-specified date range", async () => {
    prismaMock.listing.findMany.mockResolvedValue([]);

    await getListings({ startDate: "2024-05-01" });

    expect(prismaMock.listing.findMany).toHaveBeenCalledWith({
      where: {},
      orderBy: { createdAt: "asc" },
    });
  });

  it("propagates database failures", async () => {
    prismaMock.listing.findMany.mockRejectedValue(new Error("db down"));

    await expect(getListings({})).rejects.toThrow("db down");
  });
});

describe("getFavoriteListings", () => {
  it("returns an empty list when signed out", async () => {
    getCurrentUser.mockResolvedValue(null);

    await expect(getFavoriteListings()).resolves.toEqual([]);
    expect(prismaMock.listing.findMany).not.toHaveBeenCalled();
  });

  it("looks the favorites up by id", async () => {
    const listings = [makeListing()];
    getCurrentUser.mockResolvedValue(makeUser({ favoriteIds: ["listing-1"] }));
    prismaMock.listing.findMany.mockResolvedValue(listings);

    await expect(getFavoriteListings()).resolves.toEqual(listings);
    expect(prismaMock.listing.findMany).toHaveBeenCalledWith({
      where: { id: { in: ["listing-1"] } },
      orderBy: { createdAt: "asc" },
    });
  });

  it("copes with a user that has no favorites array", async () => {
    getCurrentUser.mockResolvedValue(
      makeUser({ favoriteIds: undefined as unknown as string[] })
    );
    prismaMock.listing.findMany.mockResolvedValue([]);

    await expect(getFavoriteListings()).resolves.toEqual([]);
    expect(prismaMock.listing.findMany).toHaveBeenCalledWith({
      where: { id: { in: [] } },
      orderBy: { createdAt: "asc" },
    });
  });
});

describe("getListingById", () => {
  it("returns null when the listing does not exist", async () => {
    prismaMock.listing.findUnique.mockResolvedValue(null);

    await expect(getListingById({ listingId: "nope" })).resolves.toBeNull();
  });

  it("returns the listing with its owner", async () => {
    const user = makeUser();
    const listing = { ...makeListing(), user };
    prismaMock.listing.findUnique.mockResolvedValue(listing);

    await expect(getListingById({ listingId: "listing-1" })).resolves.toEqual(
      listing
    );
    expect(prismaMock.listing.findUnique).toHaveBeenCalledWith({
      where: { id: "listing-1" },
      include: { user: true },
    });
  });
});

describe("getReservations", () => {
  it("queries without filters", async () => {
    prismaMock.reservation.findMany.mockResolvedValue([]);

    await expect(getReservations({})).resolves.toEqual([]);
    expect(prismaMock.reservation.findMany).toHaveBeenCalledWith({
      where: {},
      include: { listing: true },
      orderBy: { createdAt: "asc" },
    });
  });

  it("filters by listing, guest and author", async () => {
    const reservation = { ...makeReservation(), listing: makeListing() };
    prismaMock.reservation.findMany.mockResolvedValue([reservation]);

    await expect(
      getReservations({
        listingId: "listing-1",
        userId: "user-1",
        authorId: "author-1",
      })
    ).resolves.toEqual([reservation]);

    expect(prismaMock.reservation.findMany).toHaveBeenCalledWith({
      where: {
        listingId: "listing-1",
        userId: "user-1",
        listing: { userId: "author-1" },
      },
      include: { listing: true },
      orderBy: { createdAt: "asc" },
    });
  });
});
