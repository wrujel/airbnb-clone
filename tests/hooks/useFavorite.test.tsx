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

// Lets a test hold a request open and inspect the UI while it is in flight.
function deferred() {
  let resolve!: (value: { data: unknown }) => void;
  const promise = new Promise<{ data: unknown }>((res) => {
    resolve = res;
  });

  return { promise, resolve };
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

  it("shows the new state before the request settles", async () => {
    const write = deferred();
    mockedAxios.post.mockReturnValueOnce(write.promise);

    const { result } = renderHook(() =>
      useFavorite({ listingId: "listing-1", currentUser: makeUser() })
    );

    let toggling!: Promise<void>;
    act(() => {
      toggling = result.current.toggleFavorite(clickEvent());
    });

    // `currentUser` still lists no favorites; this is the optimistic override.
    expect(result.current.hasFavorited).toBe(true);

    await act(async () => {
      write.resolve({ data: {} });
      await toggling;
    });

    expect(result.current.hasFavorited).toBe(true);
    expect(routerMock.refresh).toHaveBeenCalled();
  });

  it("ignores a second toggle while the write is in flight", async () => {
    const write = deferred();
    mockedAxios.post.mockReturnValueOnce(write.promise);

    const { result } = renderHook(() =>
      useFavorite({ listingId: "listing-1", currentUser: makeUser() })
    );

    let toggling!: Promise<void>;
    act(() => {
      toggling = result.current.toggleFavorite(clickEvent());
    });

    await act(async () => {
      await result.current.toggleFavorite(clickEvent());
    });

    expect(mockedAxios.post).toHaveBeenCalledTimes(1);
    expect(mockedAxios.delete).not.toHaveBeenCalled();

    await act(async () => {
      write.resolve({ data: {} });
      await toggling;
    });
  });

  it("reverts the heart when the write fails", async () => {
    mockedAxios.post.mockRejectedValueOnce(new Error("boom"));

    const { result } = renderHook(() =>
      useFavorite({ listingId: "listing-1", currentUser: makeUser() })
    );

    await act(async () => {
      await result.current.toggleFavorite(clickEvent());
    });

    expect(result.current.hasFavorited).toBe(false);
    expect(toast.error).toHaveBeenCalledWith("Something went wrong.");
    expect(routerMock.refresh).not.toHaveBeenCalled();
  });
});
