import "@testing-library/jest-dom/vitest";

import { createElement } from "react";
import { afterEach, beforeEach, vi } from "vitest";

import { navigationState, resetNavigation, routerMock } from "./helpers/mocks";

// --- Next.js primitives ----------------------------------------------------

vi.mock("next/navigation", () => ({
  useRouter: () => routerMock,
  useSearchParams: () => navigationState.searchParams,
  usePathname: () => navigationState.pathname,
}));

vi.mock("next/font/google", () => ({
  Nunito: () => ({ className: "nunito-font" }),
}));

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    className,
    onClick,
    style,
  }: {
    src: string | { src: string };
    alt: string;
    className?: string;
    onClick?: () => void;
    style?: Record<string, string>;
  }) =>
    createElement("img", {
      src: typeof src === "string" ? src : src?.src,
      alt,
      className,
      onClick,
      style,
    }),
}));

// --- jsdom gaps ------------------------------------------------------------
// Server-side suites opt into `@vitest-environment node`, so everything below
// is guarded on a DOM actually being present.

const hasDom = typeof window !== "undefined";

if (hasDom) {
  // react-select, react-date-range and leaflet all touch these on mount.
  if (!window.matchMedia) {
    window.matchMedia = ((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })) as unknown as typeof window.matchMedia;
  }

  if (!globalThis.ResizeObserver) {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as unknown as typeof ResizeObserver;
  }
}

beforeEach(() => {
  resetNavigation();
});

afterEach(async () => {
  if (hasDom) {
    const { cleanup } = await import("@testing-library/react");
    cleanup();
  }
});
