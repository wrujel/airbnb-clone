import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Map from "@/app/components/Map";

vi.mock("react-leaflet", () => ({
  MapContainer: ({
    children,
    center,
    zoom,
  }: {
    children: React.ReactNode;
    center: number[];
    zoom: number;
  }) => (
    <div
      data-testid="map"
      data-center={JSON.stringify(center)}
      data-zoom={zoom}
    >
      {children}
    </div>
  ),
  TileLayer: ({ url }: { url: string }) => (
    <div data-testid="tiles" data-url={url} />
  ),
  Marker: ({ position }: { position: number[] }) => (
    <div data-testid="marker" data-position={JSON.stringify(position)} />
  ),
}));

describe("Map", () => {
  it("falls back to a world view when no centre is given", () => {
    render(<Map />);

    const map = screen.getByTestId("map");
    expect(map).toHaveAttribute("data-center", "[-12.04318,-77.02824]");
    expect(map).toHaveAttribute("data-zoom", "2");
    expect(screen.queryByTestId("marker")).not.toBeInTheDocument();
    expect(screen.getByTestId("tiles")).toHaveAttribute(
      "data-url",
      "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    );
  });

  it("zooms to and marks the given centre", () => {
    render(<Map center={[-10, -76]} />);

    const map = screen.getByTestId("map");
    expect(map).toHaveAttribute("data-center", "[-10,-76]");
    expect(map).toHaveAttribute("data-zoom", "4");
    expect(screen.getByTestId("marker")).toHaveAttribute(
      "data-position",
      "[-10,-76]",
    );
  });

  it("reads the URL off an asset object when the bundler builds one", async () => {
    // Turbopack hands back a StaticImageData object rather than a bare URL for
    // some assets; re-import the module with that shape to cover both.
    vi.resetModules();
    vi.doMock("leaflet/dist/images/marker-icon-2x.png", () => ({
      default: { src: "/marker-icon-2x.png" },
    }));
    vi.doMock("leaflet/dist/images/marker-icon.png", () => ({
      default: { src: "/marker-icon.png" },
    }));
    vi.doMock("leaflet/dist/images/marker-shadow.png", () => ({
      default: { src: "/marker-shadow.png" },
    }));

    await import("@/app/components/Map");
    const { Icon } = (await import("leaflet")).default;

    expect(Icon.Default.prototype.options.iconRetinaUrl).toBe(
      "/marker-icon-2x.png",
    );
    expect(Icon.Default.prototype.options.iconUrl).toBe("/marker-icon.png");
    expect(Icon.Default.prototype.options.shadowUrl).toBe(
      "/marker-shadow.png",
    );
  });
});
