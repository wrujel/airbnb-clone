import { vi } from "vitest";

/**
 * Shared state behind the global `next/navigation` mock installed in
 * `tests/setup.ts`. Tests mutate `navigationState` to steer what the app's
 * `useSearchParams()` / `usePathname()` calls return.
 */
export const routerMock = {
  push: vi.fn(),
  replace: vi.fn(),
  refresh: vi.fn(),
  back: vi.fn(),
  forward: vi.fn(),
  prefetch: vi.fn(),
};

export const navigationState: {
  searchParams: URLSearchParams | null;
  pathname: string | null;
} = {
  searchParams: new URLSearchParams(),
  pathname: "/",
};

export function resetNavigation() {
  navigationState.searchParams = new URLSearchParams();
  navigationState.pathname = "/";
}

export function setSearchParams(init: string | Record<string, string>) {
  navigationState.searchParams = new URLSearchParams(init);
}
