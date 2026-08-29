import type { Listing, Reservation, User } from "@prisma/client";

export function makeUser(overrides: Partial<User> = {}): User {
  return {
    id: "user-1",
    name: "Ada Lovelace",
    email: "ada@example.com",
    emailVerified: null,
    image: "https://example.com/ada.png",
    hashedPassword: "hashed",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    updatedAt: new Date("2024-01-01T00:00:00.000Z"),
    favoriteIds: [],
    ...overrides,
  };
}

export function makeListing(overrides: Partial<Listing> = {}): Listing {
  return {
    id: "listing-1",
    userId: "user-1",
    title: "Sunny loft",
    description: "A very sunny loft",
    imageSrc: "https://example.com/loft.png",
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    category: "Beach",
    roomCount: 2,
    bathroomCount: 1,
    guestCount: 4,
    locationValue: "PE",
    price: 120,
    ...overrides,
  };
}

export function makeReservation(
  overrides: Partial<Reservation> = {}
): Reservation {
  return {
    id: "reservation-1",
    userId: "user-1",
    listingId: "listing-1",
    // Local-time constructors keep the formatted output timezone independent.
    startDate: new Date(2024, 4, 1),
    endDate: new Date(2024, 4, 5),
    totalPrice: 480,
    createdAt: new Date("2024-01-01T00:00:00.000Z"),
    ...overrides,
  };
}
