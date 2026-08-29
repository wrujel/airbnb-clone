import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import CountrySelect from "@/app/components/Inputs/CountrySelect";

describe("CountrySelect", () => {
  it("lists the formatted countries and reports the picked one", async () => {
    const onChange = vi.fn();
    render(<CountrySelect onChange={onChange} />);

    const combobox = screen.getByRole("combobox");
    await userEvent.click(combobox);
    await userEvent.type(combobox, "Peru");

    // The custom formatOptionLabel renders flag + label + region.
    expect(await screen.findByText("Americas")).toBeInTheDocument();

    await userEvent.keyboard("{Enter}");

    expect(onChange).toHaveBeenCalledWith(
      expect.objectContaining({
        label: "Peru",
        value: "PE",
        region: "Americas",
      }),
    );
  });

  it("renders the currently selected country", () => {
    render(
      <CountrySelect
        onChange={vi.fn()}
        value={{
          label: "Peru",
          value: "PE",
          flag: "🇵🇪",
          latlng: [-10, -76],
          region: "Americas",
        }}
      />,
    );

    expect(screen.getByText("Americas")).toBeInTheDocument();
  });

  it("reports null when the value is cleared", async () => {
    const onChange = vi.fn();
    const { container } = render(
      <CountrySelect
        onChange={onChange}
        value={{
          label: "Peru",
          value: "PE",
          flag: "🇵🇪",
          latlng: [-10, -76],
          region: "Americas",
        }}
      />,
    );

    const clear = container.querySelector<HTMLElement>(
      "[class*='indicatorContainer']",
    );
    await userEvent.click(clear as HTMLElement);

    expect(onChange).toHaveBeenCalledWith(null);
  });
});
