import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import ListingCard from "@/app/components/listings/ListingCard";
import Modal from "@/app/components/modals/Modal";
import { makeListing } from "../helpers/factories";
import { routerMock } from "../helpers/mocks";

/**
 * `Button` refuses the click itself when it is disabled, which hides the
 * guards the handlers keep behind it. Swapping it for a plain, always-clickable
 * button lets those guards be exercised directly.
 */
vi.mock("@/app/components/Button", () => ({
  default: ({
    label,
    onClick,
  }: {
    label: string;
    onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
  }) => (
    <button type="button" onClick={onClick}>
      {label}
    </button>
  ),
}));

describe("Modal guards", () => {
  it("refuses to submit or run the secondary action while disabled", async () => {
    const onSubmit = vi.fn();
    const secondaryAction = vi.fn();

    render(
      <Modal
        isOpen
        disabled
        title="Airbnb your home"
        actionLabel="Continue"
        secondaryActionLabel="Back"
        secondaryAction={secondaryAction}
        onClose={vi.fn()}
        onSubmit={onSubmit}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Continue" }));
    await userEvent.click(screen.getByRole("button", { name: "Back" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(secondaryAction).not.toHaveBeenCalled();
  });
});

describe("ListingCard guards", () => {
  it("refuses to run its action while disabled", async () => {
    const onAction = vi.fn();

    render(
      <ListingCard
        data={makeListing()}
        onAction={onAction}
        actionLabel="Delete property"
        actionId="listing-1"
        disabled
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Delete property" }),
    );

    expect(onAction).not.toHaveBeenCalled();
    // The click still stops short of opening the listing.
    expect(routerMock.push).not.toHaveBeenCalled();
  });
});
