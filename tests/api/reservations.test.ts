// @vitest-environment node
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DELETE } from "@/app/api/reservations/[reservationId]/route";
import { POST } from "@/app/api/reservations/route";
import { makeListing, makeUser } from "../helpers/factories";
import { prismaMock } from "../helpers/prisma";

const getCurrentUser = vi.hoisted(() => vi.fn());

vi.mock("@/app/actions/getCurrentUser", () => ({ default: getCurrentUser }));

vi.mock("@/app/libs/prismadb", async () => ({
  default: (await import("../helpers/prisma")).prismaMock,
}));

function postRequest(body: unknown) {
  return new Request("http://localhost/api/reservations", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

const reservationBody = {
  listingId: "listing-1",
  startDate: "2024-05-01T00:00:00.000Z",
  endDate: "2024-05-05T00:00:00.000Z",
  totalPrice: 480,
};

beforeEach(() => {
  getCurrentUser.mockReset();
  prismaMock.listing.update.mockReset();
  prismaMock.reservation.deleteMany.mockReset();
});

describe("POST /api/reservations", () => {
  it("errors when signed out", async () => {
    getCurrentUser.mockResolvedValue(null);

    const response = await POST(postRequest(reservationBody));

    expect(response.type).toBe("error");
    expect(prismaMock.listing.update).not.toHaveBeenCalled();
  });

  it.each([
    ["listingId", { ...reservationBody, listingId: "" }],
    ["startDate", { ...reservationBody, startDate: "" }],
    ["endDate", { ...reservationBody, endDate: "" }],
    ["totalPrice", { ...reservationBody, totalPrice: 0 }],
  ])("errors when %s is missing", async (_field, body) => {
    getCurrentUser.mockResolvedValue(makeUser());

    const response = await POST(postRequest(body));

    expect(response.type).toBe("error");
    expect(prismaMock.listing.update).not.toHaveBeenCalled();
  });

  it("nests the reservation under the listing", async () => {
    const user = makeUser();
    const listing = makeListing();
    getCurrentUser.mockResolvedValue(user);
    prismaMock.listing.update.mockResolvedValue(listing);

    const response = await POST(postRequest(reservationBody));

    expect(prismaMock.listing.update).toHaveBeenCalledWith({
      where: { id: "listing-1" },
      data: {
        reservations: {
          create: {
            userId: user.id,
            startDate: reservationBody.startDate,
            endDate: reservationBody.endDate,
            totalPrice: reservationBody.totalPrice,
          },
        },
      },
    });
    await expect(response.json()).resolves.toMatchObject({ id: listing.id });
  });
});

describe("DELETE /api/reservations/[reservationId]", () => {
  const request = new Request("http://localhost/api/reservations/r-1", {
    method: "DELETE",
  });

  it("errors when signed out", async () => {
    getCurrentUser.mockResolvedValue(null);

    const response = await DELETE(request, {
      params: Promise.resolve({ reservationId: "r-1" }),
    });

    expect(response.type).toBe("error");
  });

  it("rejects a missing id", async () => {
    getCurrentUser.mockResolvedValue(makeUser());

    await expect(
      DELETE(request, { params: Promise.resolve({}) }),
    ).rejects.toThrow("Invalid ID");
  });

  it("lets either the guest or the host cancel", async () => {
    const user = makeUser();
    getCurrentUser.mockResolvedValue(user);
    prismaMock.reservation.deleteMany.mockResolvedValue({ count: 1 });

    const response = await DELETE(request, {
      params: Promise.resolve({ reservationId: "r-1" }),
    });

    expect(prismaMock.reservation.deleteMany).toHaveBeenCalledWith({
      where: {
        id: "r-1",
        OR: [{ userId: user.id }, { listing: { userId: user.id } }],
      },
    });
    await expect(response.json()).resolves.toEqual({ count: 1 });
  });
});
