import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import FavoritesClient from "@/app/favorites/FavoritesClient";
import PropertiesClient from "@/app/properties/PropertiesClient";
import ReservationsClient from "@/app/reservations/ReservationsClient";
import TripsClient from "@/app/trips/TripsClient";
import { makeListing, makeReservation, makeUser } from "../helpers/factories";
import { routerMock } from "../helpers/mocks";

vi.mock("axios", () => ({ default: { delete: vi.fn(), post: vi.fn() } }));

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("react-hot-toast", () => ({ toast, default: toast }));

const mockedAxios = vi.mocked(axios);

const reservation = { ...makeReservation(), listing: makeListing() };

beforeEach(() => {
  mockedAxios.delete.mockReset();
});

describe("FavoritesClient", () => {
  it("renders a card per favorite", () => {
    render(
      <FavoritesClient
        currentUser={makeUser()}
        listings={[makeListing(), makeListing({ id: "listing-2" })]}
      />,
    );

    expect(screen.getByText("Favorites")).toBeInTheDocument();
    expect(screen.getAllByAltText("Listing")).toHaveLength(2);
  });
});

describe("PropertiesClient", () => {
  it("deletes a property", async () => {
    mockedAxios.delete.mockResolvedValue({ data: {} });
    render(
      <PropertiesClient currentUser={makeUser()} listings={[makeListing()]} />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Delete property" }),
    );

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        "/api/listings/listing-1",
      );
    });
    expect(toast.success).toHaveBeenCalledWith("Listing deleted successfully");
    expect(routerMock.refresh).toHaveBeenCalled();
  });

  it("surfaces the server's message when the delete fails", async () => {
    mockedAxios.delete.mockRejectedValue({
      response: { data: { message: "Listing is booked" } },
    });
    render(
      <PropertiesClient currentUser={makeUser()} listings={[makeListing()]} />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Delete property" }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Listing is booked");
    });
  });

  it("falls back to a generic message", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("network"));
    render(
      <PropertiesClient currentUser={makeUser()} listings={[makeListing()]} />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Delete property" }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });
});

describe("ReservationsClient", () => {
  it("cancels a guest reservation", async () => {
    mockedAxios.delete.mockResolvedValue({ data: {} });
    render(
      <ReservationsClient
        currentUser={makeUser()}
        reservations={[reservation]}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Cancel guest reservation" }),
    );

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        "/api/reservations/reservation-1",
      );
    });
    expect(toast.success).toHaveBeenCalledWith("Reservation cancelled");
  });

  it("reports a failed cancellation", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("network"));
    render(
      <ReservationsClient
        currentUser={makeUser()}
        reservations={[reservation]}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Cancel guest reservation" }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });
});

describe("TripsClient", () => {
  it("cancels a trip", async () => {
    mockedAxios.delete.mockResolvedValue({ data: {} });
    render(
      <TripsClient currentUser={makeUser()} reservations={[reservation]} />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Cancel Reservation" }),
    );

    await waitFor(() => {
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        "/api/reservations/reservation-1",
      );
    });
    expect(toast.success).toHaveBeenCalledWith(
      "Reservation cancelled successfully",
    );
  });

  it("surfaces the server's message when the cancel fails", async () => {
    mockedAxios.delete.mockRejectedValue({
      response: { data: { message: "Too late to cancel" } },
    });
    render(
      <TripsClient currentUser={makeUser()} reservations={[reservation]} />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Cancel Reservation" }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Too late to cancel");
    });
  });

  it("falls back to a generic message", async () => {
    mockedAxios.delete.mockRejectedValue(new Error("network"));
    render(
      <TripsClient currentUser={makeUser()} reservations={[reservation]} />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Cancel Reservation" }),
    );

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong");
    });
  });
});
