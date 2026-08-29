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
});
