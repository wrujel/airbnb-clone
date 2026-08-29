import { act, renderHook } from "@testing-library/react";
import axios from "axios";
import { beforeEach, describe, expect, it, vi } from "vitest";

import useFavorite from "@/app/hooks/useFavorite";
import useLoginModal from "@/app/hooks/useLoginModal";
import { makeUser } from "../helpers/factories";
import { routerMock } from "../helpers/mocks";

vi.mock("axios", () => ({
  default: { post: vi.fn(), delete: vi.fn() },
}));

const toast = vi.hoisted(() => ({ success: vi.fn(), error: vi.fn() }));
vi.mock("react-hot-toast", () => ({ toast, default: toast }));

const mockedAxios = vi.mocked(axios);

beforeEach(() => {
  useLoginModal.setState({ isOpen: false });
  mockedAxios.post.mockResolvedValue({ data: {} });
  mockedAxios.delete.mockResolvedValue({ data: {} });
});

function clickEvent() {
  return { stopPropagation: vi.fn() } as unknown as React.MouseEvent<HTMLDivElement>;
}

describe("useFavorite", () => {
  it("reports the listing as favorited when it is in the user's list", () => {
    const { result } = renderHook(() =>
      useFavorite({
        listingId: "listing-1",
        currentUser: makeUser({ favoriteIds: ["listing-1"] }),
      })
    );

    expect(result.current.hasFavorited).toBe(true);
  });

  it("treats a user without favorites as not favorited", () => {
    const { result } = renderHook(() =>
      useFavorite({
        listingId: "listing-1",
        currentUser: makeUser({
          favoriteIds: undefined as unknown as string[],
        }),
      })
    );

    expect(result.current.hasFavorited).toBe(false);
  });

  it("opens the login modal when there is no user", async () => {
    const { result } = renderHook(() =>
      useFavorite({ listingId: "listing-1" })
    );

    const event = clickEvent();
    await act(async () => {
      await result.current.toggleFavorite(event);
    });

    expect(event.stopPropagation).toHaveBeenCalled();
    expect(useLoginModal.getState().isOpen).toBe(true);
    expect(mockedAxios.post).not.toHaveBeenCalled();
  });

  it("adds a favorite", async () => {
    const { result } = renderHook(() =>
      useFavorite({ listingId: "listing-1", currentUser: makeUser() })
    );

    await act(async () => {
      await result.current.toggleFavorite(clickEvent());
    });

    expect(mockedAxios.post).toHaveBeenCalledWith("/api/favorites/listing-1");
    expect(toast.success).toHaveBeenCalledWith("Added to favorites.");
    expect(routerMock.refresh).toHaveBeenCalled();
  });

  it("removes a favorite", async () => {
    const { result } = renderHook(() =>
      useFavorite({
        listingId: "listing-1",
        currentUser: makeUser({ favoriteIds: ["listing-1"] }),
      })
    );

    await act(async () => {
      await result.current.toggleFavorite(clickEvent());
    });

    expect(mockedAxios.delete).toHaveBeenCalledWith("/api/favorites/listing-1");
    expect(toast.success).toHaveBeenCalledWith("Removed from favorites.");
  });

  it("surfaces a failure as a toast", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("boom"));

    const { result } = renderHook(() =>
      useFavorite({ listingId: "listing-1", currentUser: makeUser() })
    );

    await act(async () => {
      await result.current.toggleFavorite(clickEvent());
    });

    expect(toast.error).toHaveBeenCalledWith("Something went wrong.");
    expect(routerMock.refresh).not.toHaveBeenCalled();
  });
});
