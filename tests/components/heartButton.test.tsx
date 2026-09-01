import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import HeartButton from "@/app/components/HeartButton";
import useLoginModal from "@/app/hooks/useLoginModal";
import { makeUser } from "../helpers/factories";

vi.mock("axios", () => ({
  default: { post: vi.fn(), delete: vi.fn() },
}));

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("react-hot-toast", () => ({ toast, default: toast }));

const mockedAxios = vi.mocked(axios);

beforeEach(() => {
  useLoginModal.setState({ isOpen: false });
  mockedAxios.post.mockResolvedValue({ data: {} });
});

describe("HeartButton", () => {
  it("renders unfilled for a listing that is not a favorite", () => {
    const { container } = render(
      <HeartButton listingId="listing-1" currentUser={makeUser()} />,
    );

    expect(container.querySelectorAll("svg")).toHaveLength(2);
    expect(
      container.querySelector("svg.fill-neutral-500\\/70"),
    ).toBeInTheDocument();
  });

  it("renders filled for a favorited listing", () => {
    const { container } = render(
      <HeartButton
        listingId="listing-1"
        currentUser={makeUser({ favoriteIds: ["listing-1"] })}
      />,
    );

    expect(container.querySelector("svg.fill-rose-500")).toBeInTheDocument();
  });

  it("toggles the favorite on click", async () => {
    const { container } = render(
      <HeartButton listingId="listing-1" currentUser={makeUser()} />,
    );

    await userEvent.click(container.firstChild as HTMLElement);

    expect(mockedAxios.post).toHaveBeenCalledWith("/api/favorites/listing-1");
  });

  it("asks an anonymous visitor to log in", async () => {
    const { container } = render(<HeartButton listingId="listing-1" />);

    await userEvent.click(container.firstChild as HTMLElement);

    expect(useLoginModal.getState().isOpen).toBe(true);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("fills the heart before the save comes back", async () => {
    const { container } = render(
      <HeartButton listingId="listing-1" currentUser={makeUser()} />,
    );

    await userEvent.click(container.firstChild as HTMLElement);

    // `currentUser` still lists no favorites: this is the optimistic render.
    expect(container.querySelector("svg.fill-rose-500")).toBeInTheDocument();
  });

  it("puts the heart back when the save fails", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("boom"));

    const { container } = render(
      <HeartButton listingId="listing-1" currentUser={makeUser()} />,
    );

    await userEvent.click(container.firstChild as HTMLElement);

    expect(
      container.querySelector("svg.fill-neutral-500\\/70"),
    ).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith("Something went wrong.");
  });
});
