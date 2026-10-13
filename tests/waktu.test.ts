import { describe, expect, it } from "vitest";
import { bagianHari } from "../src/lib/waktu";

describe("bagianHari", () => {
  it.each([
    [4, "pagi"], [10, "pagi"], [11, "siang"], [14, "siang"], [15, "sore"], [17, "sore"], [18, "malam"], [23, "malam"], [0, "malam"], [3, "malam"],
  ] as const)("jam %i adalah %s", (jam, hasil) => {
    expect(bagianHari(jam)).toBe(hasil);
  });
});
