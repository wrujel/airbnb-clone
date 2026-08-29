import { render, screen } from "@testing-library/react";
import type { ReactElement } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { makeListing, makeReservation, makeUser } from "../helpers/factories";

const actions = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
  getListings: vi.fn(),
  getFavoriteListings: vi.fn(),
  getListingById: vi.fn(),
  getReservations: vi.fn(),
}));

vi.mock("@/app/actions/getCurrentUser", () => ({
  default: actions.getCurrentUser,
}));
vi.mock("@/app/actions/getListings", () => ({ default: actions.getListings }));
vi.mock("@/app/actions/getFavoriteListings", () => ({
  default: actions.getFavoriteListings,
}));
vi.mock("@/app/actions/getListingById", () => ({
  default: actions.getListingById,
}));
vi.mock("@/app/actions/getReservations", () => ({
  default: actions.getReservations,
}));

vi.mock("@/app/components/Map", () => ({
  default: () => <div data-testid="map" />,
}));

vi.mock("react-date-range", () => ({
  DateRange: () => <div data-testid="date-range" />,
}));

beforeEach(() => {
  Object.values(actions).forEach((action) => action.mockReset());
  actions.getCurrentUser.mockResolvedValue(makeUser());
});

describe("RootLayout", () => {
  it("wraps the app in the shared chrome", async () => {
    const RootLayout = (await import("@/app/layout")).default;

    const tree = (await RootLayout({
      children: <span>page body</span>,
    })) as ReactElement<{ lang: string; children: ReactElement }>;

    expect(tree.props.lang).toBe("en");

    const body = tree.props.children as ReactElement<{ className: string }>;
    expect(body.props.className).toBe("nunito-font");
    expect(actions.getCurrentUser).toHaveBeenCalledTimes(1);
  });

  it("exports the page metadata", async () => {
    const { metadata } = await import("@/app/layout");

    expect(metadata).toEqual({
      title: "Airbnb clone",
      description: "Airbnb app for vacation rentals",
    });
  });
});

describe("Home", () => {
  it("offers to clear the filters when nothing matches", async () => {
    const Home = (await import("@/app/page")).default;
    actions.getListings.mockResolvedValue([]);

    render(
      await Home({ searchParams: Promise.resolve({ category: "Beach" }) }),
    );

    expect(screen.getByText("No exact matches")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Remove all filters" }),
    ).toBeInTheDocument();
    expect(actions.getListings).toHaveBeenCalledWith({ category: "Beach" });
  });

  it("renders a card per listing", async () => {
    const Home = (await import("@/app/page")).default;
    actions.getListings.mockResolvedValue([
      makeListing(),
      makeListing({ id: "listing-2", title: "Cabin" }),
    ]);

    render(await Home({ searchParams: Promise.resolve({}) }));

    expect(screen.getAllByAltText("Listing")).toHaveLength(2);
  });
});

describe("Loading", () => {
  it("renders the spinner", async () => {
    const Loading = (await import("@/app/loading")).default;

    const { container } = render(<Loading />);

    expect(container.querySelector("span")).toBeInTheDocument();
  });
});

describe("ErrorState", () => {
  it("shows a friendly message and logs the error", async () => {
    const ErrorState = (await import("@/app/error")).default;
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const error = new Error("kaboom");

    render(<ErrorState error={error} />);

    expect(screen.getByText("Something went wrong")).toBeInTheDocument();
    expect(consoleError).toHaveBeenCalledWith(error);
    consoleError.mockRestore();
  });
});

describe("FavoritesPage", () => {
  it("nudges the visitor when there are no favorites", async () => {
    const FavoritesPage = (await import("@/app/favorites/page")).default;
    actions.getFavoriteListings.mockResolvedValue([]);

    render(await FavoritesPage());

    expect(screen.getByText("No Favorites found")).toBeInTheDocument();
  });

  it("lists the favorites", async () => {
    const FavoritesPage = (await import("@/app/favorites/page")).default;
    actions.getFavoriteListings.mockResolvedValue([makeListing()]);

    render(await FavoritesPage());

    expect(screen.getByText("Favorites")).toBeInTheDocument();
    expect(screen.getByAltText("Listing")).toBeInTheDocument();
  });
});

describe("PropertiesPage", () => {
  it("asks an anonymous visitor to sign in", async () => {
    const PropertiesPage = (await import("@/app/properties/page")).default;
    actions.getCurrentUser.mockResolvedValue(null);
    actions.getListings.mockResolvedValue([]);

    render(await PropertiesPage());

    expect(screen.getByText("Unauthenticated User")).toBeInTheDocument();
  });

  it("nudges a host with no properties", async () => {
    const PropertiesPage = (await import("@/app/properties/page")).default;
    actions.getListings.mockResolvedValue([]);

    render(await PropertiesPage());

    expect(screen.getByText("No Properties found")).toBeInTheDocument();
  });

  it("lists the properties", async () => {
    const PropertiesPage = (await import("@/app/properties/page")).default;
    actions.getListings.mockResolvedValue([makeListing()]);

    render(await PropertiesPage());

    expect(screen.getByText("Properties")).toBeInTheDocument();
    expect(actions.getListings).toHaveBeenCalledWith({ userId: "user-1" });
  });
});

describe("ReservationsPage", () => {
  it("asks an anonymous visitor to sign in", async () => {
    const ReservationsPage = (await import("@/app/reservations/page")).default;
    actions.getCurrentUser.mockResolvedValue(null);
    actions.getReservations.mockResolvedValue([]);

    render(await ReservationsPage());

    expect(screen.getByText("You must be signed in")).toBeInTheDocument();
  });

  it("nudges a host with no reservations", async () => {
    const ReservationsPage = (await import("@/app/reservations/page")).default;
    actions.getReservations.mockResolvedValue([]);

    render(await ReservationsPage());

    expect(screen.getByText("No reservations found")).toBeInTheDocument();
  });

  it("lists the reservations", async () => {
    const ReservationsPage = (await import("@/app/reservations/page")).default;
    actions.getReservations.mockResolvedValue([
      { ...makeReservation(), listing: makeListing() },
    ]);

    render(await ReservationsPage());

    expect(screen.getByText("Reservations")).toBeInTheDocument();
    expect(actions.getReservations).toHaveBeenCalledWith({
      authorId: "user-1",
    });
  });
});

describe("TripsPage", () => {
  it("asks an anonymous visitor to sign in", async () => {
    const TripsPage = (await import("@/app/trips/page")).default;
    actions.getCurrentUser.mockResolvedValue(null);
    actions.getReservations.mockResolvedValue([]);

    render(await TripsPage());

    expect(screen.getByText("Unauthenticated User")).toBeInTheDocument();
  });

  it("nudges a guest with no trips", async () => {
    const TripsPage = (await import("@/app/trips/page")).default;
    actions.getReservations.mockResolvedValue([]);

    render(await TripsPage());

    expect(screen.getByText("No Trips found")).toBeInTheDocument();
  });

  it("lists the trips", async () => {
    const TripsPage = (await import("@/app/trips/page")).default;
    actions.getReservations.mockResolvedValue([
      { ...makeReservation(), listing: makeListing() },
    ]);

    render(await TripsPage());

    expect(screen.getByText("Trips")).toBeInTheDocument();
    expect(actions.getReservations).toHaveBeenCalledWith({ userId: "user-1" });
  });
});

describe("ListingPage", () => {
  it("falls back to the empty state for an unknown listing", async () => {
    const ListingPage = (await import("@/app/listings/[listingId]/page"))
      .default;
    actions.getListingById.mockResolvedValue(null);
    actions.getReservations.mockResolvedValue([]);

    render(await ListingPage({ params: Promise.resolve({ listingId: "x" }) }));

    expect(screen.getByText("No exact matches")).toBeInTheDocument();
  });

  it("renders the listing", async () => {
    const ListingPage = (await import("@/app/listings/[listingId]/page"))
      .default;
    actions.getListingById.mockResolvedValue({
      ...makeListing(),
      user: makeUser(),
    });
    actions.getReservations.mockResolvedValue([]);

    render(
      await ListingPage({
        params: Promise.resolve({ listingId: "listing-1" }),
      }),
    );

    expect(screen.getByText("Sunny loft")).toBeInTheDocument();
    expect(actions.getListingById).toHaveBeenCalledWith({
      listingId: "listing-1",
    });
    expect(actions.getReservations).toHaveBeenCalledWith({
      listingId: "listing-1",
    });
  });
});
