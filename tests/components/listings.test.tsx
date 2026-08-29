import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ListingCard from "@/app/components/listings/ListingCard";
import ListingCategory from "@/app/components/listings/ListingCategory";
import ListingHead from "@/app/components/listings/ListingHead";
import ListingInfo from "@/app/components/listings/ListingInfo";
import ListingReservation from "@/app/components/listings/ListingReservation";
import { makeListing, makeReservation, makeUser } from "../helpers/factories";
import { routerMock } from "../helpers/mocks";

vi.mock("@/app/components/Map", () => ({
  default: ({ center }: { center?: number[] }) => (
    <div data-testid="map" data-center={JSON.stringify(center ?? null)} />
  ),
}));

vi.mock("react-date-range", () => ({
  DateRange: ({
    onChange,
    disabledDates,
  }: {
    onChange: (value: { selection: { key: string } }) => void;
    disabledDates: Date[];
  }) => (
    <button
      data-testid="date-range"
      data-disabled-count={disabledDates.length}
      onClick={() => onChange({ selection: { key: "selection" } })}
    >
      pick dates
    </button>
  ),
}));

describe("ListingCategory", () => {
  it("renders the icon, label and description", () => {
    const Icon = () => <span data-testid="icon" />;
    render(
      <ListingCategory icon={Icon} label="Beach" description="By the sea" />,
    );

    expect(screen.getByTestId("icon")).toBeInTheDocument();
    expect(screen.getByText("Beach")).toBeInTheDocument();
    expect(screen.getByText("By the sea")).toBeInTheDocument();
  });
});

describe("ListingCard", () => {
  it("shows the nightly price and opens the listing", async () => {
    render(<ListingCard data={makeListing()} />);

    expect(screen.getByText("$ 120")).toBeInTheDocument();
    expect(screen.getByText("night")).toBeInTheDocument();
    expect(screen.getByText("Beach")).toBeInTheDocument();
    expect(screen.getByText("Americas, Peru")).toBeInTheDocument();

    await userEvent.click(screen.getByAltText("Listing"));

    expect(routerMock.push).toHaveBeenCalledWith("/listings/listing-1");
  });

  it("falls back to a placeholder image", () => {
    render(<ListingCard data={makeListing({ imageSrc: "" })} />);

    expect(screen.getByAltText("Listing")).toHaveAttribute(
      "src",
      "/placeholder-image.jpg",
    );
  });

  it("shows the reservation total and dates instead of the nightly price", () => {
    render(
      <ListingCard data={makeListing()} reservation={makeReservation()} />,
    );

    expect(screen.getByText("$ 480")).toBeInTheDocument();
    expect(screen.queryByText("night")).not.toBeInTheDocument();
    expect(screen.getByText(/May 1, 2024 - May 5, 2024/)).toBeInTheDocument();
  });

  it("runs the action with the action id", async () => {
    const onAction = vi.fn();
    render(
      <ListingCard
        data={makeListing()}
        onAction={onAction}
        actionLabel="Delete property"
        actionId="listing-1"
        currentUser={makeUser()}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Delete property" }),
    );

    expect(onAction).toHaveBeenCalledWith("listing-1");
    expect(routerMock.push).not.toHaveBeenCalled();
  });

  it("swallows the action while disabled", async () => {
    const onAction = vi.fn();
    render(
      <ListingCard
        data={makeListing()}
        onAction={onAction}
        actionLabel="Delete property"
        disabled
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Delete property" }),
    );

    expect(onAction).not.toHaveBeenCalled();
  });
});

describe("ListingHead", () => {
  it("renders the title, location and hero image", () => {
    render(
      <ListingHead
        title="Sunny loft"
        locationValue="PE"
        imageSrc="https://example.com/loft.png"
        id="listing-1"
        currentUser={makeUser()}
      />,
    );

    expect(screen.getByText("Sunny loft")).toBeInTheDocument();
    expect(screen.getByText("Americas, Peru")).toBeInTheDocument();
    expect(screen.getByAltText("Image")).toHaveAttribute(
      "src",
      "https://example.com/loft.png",
    );
  });
});

describe("ListingInfo", () => {
  const baseProps = {
    user: makeUser(),
    description: "A very sunny loft",
    guestCount: 4,
    roomCount: 2,
    bathroomCount: 1,
    locationValue: "PE",
  };

  it("renders the host, the counts and the map", async () => {
    render(<ListingInfo {...baseProps} category={undefined} />);

    expect(screen.getByText("Hosted by Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("4 guests")).toBeInTheDocument();
    expect(screen.getByText("2 rooms")).toBeInTheDocument();
    expect(screen.getByText("1 bathrooms")).toBeInTheDocument();
    expect(await screen.findByTestId("map")).toHaveAttribute(
      "data-center",
      "[-10,-76]",
    );
  });

  it("renders the category when the listing has one", () => {
    const Icon = () => <span data-testid="category-icon" />;
    render(
      <ListingInfo
        {...baseProps}
        category={{
          label: "Beach",
          icon: Icon,
          description: "Close to the beach",
        }}
      />,
    );

    expect(screen.getByText("Close to the beach")).toBeInTheDocument();
  });

  it("leaves the map uncentred for an unknown location", async () => {
    render(
      <ListingInfo {...baseProps} locationValue="ZZ" category={undefined} />,
    );

    expect(await screen.findByTestId("map")).toHaveAttribute("data-center", "null");
  });
});

describe("ListingReservation", () => {
  const dateRange = {
    startDate: new Date("2024-05-01T00:00:00.000Z"),
    endDate: new Date("2024-05-05T00:00:00.000Z"),
    key: "selection",
  };

  it("renders the prices and submits", async () => {
    const onSubmit = vi.fn();
    render(
      <ListingReservation
        price={120}
        totalPrice={480}
        dateRange={dateRange}
        onChangeDate={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    expect(screen.getByText("$ 120")).toBeInTheDocument();
    expect(screen.getByText("$ 480")).toBeInTheDocument();
    expect(screen.getByTestId("date-range")).toHaveAttribute(
      "data-disabled-count",
      "0",
    );

    await userEvent.click(screen.getByRole("button", { name: "Reserve" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
  });

  it("forwards the selected range and its disabled dates", async () => {
    const onChangeDate = vi.fn();
    render(
      <ListingReservation
        price={120}
        totalPrice={480}
        dateRange={dateRange}
        onChangeDate={onChangeDate}
        onSubmit={vi.fn()}
        disabled
        disabledDates={[new Date("2024-05-03T00:00:00.000Z")]}
      />,
    );

    expect(screen.getByTestId("date-range")).toHaveAttribute(
      "data-disabled-count",
      "1",
    );

    await userEvent.click(screen.getByTestId("date-range"));

    expect(onChangeDate).toHaveBeenCalledWith({ key: "selection" });
    expect(screen.getByRole("button", { name: "Reserve" })).toBeDisabled();
  });
});
