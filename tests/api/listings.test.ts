// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DELETE } from "@/app/api/listings/[listingId]/route";
import { POST } from "@/app/api/listings/route";
import { makeListing, makeUser } from "../helpers/factories";
import { prismaMock } from "../helpers/prisma";

const getCurrentUser = vi.hoisted(() => vi.fn());

vi.mock("@/app/actions/getCurrentUser", () => ({ default: getCurrentUser }));

vi.mock("@/app/libs/prismadb", async () => ({
  default: (await import("../helpers/prisma")).prismaMock,
}));

function postRequest(body: unknown) {
  return new Request("http://localhost/api/listings", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const listingBody = {
  title: "Sunny loft",
  description: "A very sunny loft",
  imageSrc: "https://example.com/loft.png",
  category: "Beach",
  roomCount: 2,
  bathroomCount: 1,
  guestCount: 4,
  location: { value: "PE" },
  price: "120",
};

beforeEach(() => {
  getCurrentUser.mockReset();
  prismaMock.listing.create.mockReset();
  prismaMock.listing.deleteMany.mockReset();
});

describe("POST /api/listings", () => {
  it("errors when signed out", async () => {
    getCurrentUser.mockResolvedValue(null);

    const response = await POST(postRequest(listingBody));

    expect(response.type).toBe("error");
    expect(prismaMock.listing.create).not.toHaveBeenCalled();
  });

  it("creates the listing for the signed-in user", async () => {
    const user = makeUser();
    const listing = makeListing();
    getCurrentUser.mockResolvedValue(user);
    prismaMock.listing.create.mockResolvedValue(listing);

    const response = await POST(postRequest(listingBody));

    expect(prismaMock.listing.create).toHaveBeenCalledWith({
      data: {
        title: "Sunny loft",
        description: "A very sunny loft",
        imageSrc: "https://example.com/loft.png",
        category: "Beach",
        roomCount: 2,
        bathroomCount: 1,
        guestCount: 4,
        locationValue: "PE",
        price: 120,
        userId: user.id,
      },
    });
    await expect(response.json()).resolves.toMatchObject({ id: listing.id });
  });
});

describe("DELETE /api/listings/[listingId]", () => {
  const request = new Request("http://localhost/api/listings/listing-1", {
    method: "DELETE",
  });

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
      DELETE(request, { params: Promise.resolve({}) }),
    ).rejects.toThrow("Invalid ID");
  });

  it("scopes the delete to the listing owner", async () => {
    const user = makeUser();
    getCurrentUser.mockResolvedValue(user);
    prismaMock.listing.deleteMany.mockResolvedValue({ count: 1 });

    const response = await DELETE(request, {
      params: Promise.resolve({ listingId: "listing-1" }),
    });

    expect(prismaMock.listing.deleteMany).toHaveBeenCalledWith({
      where: { id: "listing-1", userId: user.id },
    });
    await expect(response.json()).resolves.toEqual({ count: 1 });
  });
});
