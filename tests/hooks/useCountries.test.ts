import { describe, expect, it } from "vitest";

import useCountries from "@/app/hooks/useCountries";

describe("useCountries", () => {
  const { getAll, getByValue } = useCountries();

  it("formats every country", () => {
    const all = getAll();

    expect(all.length).toBeGreaterThan(200);
    expect(all[0]).toEqual(
      expect.objectContaining({
        label: expect.any(String),
        value: expect.any(String),
        flag: expect.any(String),
        region: expect.any(String),
      })
    );
  });

  it("finds a country by its cca2 code", () => {
    expect(getByValue("PE")).toEqual(
      expect.objectContaining({ label: "Peru", value: "PE" })
    );
  });

  it("returns undefined for an unknown code", () => {
    expect(getByValue("ZZ")).toBeUndefined();
  });
});
