import { describe, expect, it } from "vitest";
import { namaMenu } from "../src/components/BilahTab";

describe("judul header mengikuti menu", () => {
  it("Rencana juga berlaku untuk daftar panduan (digabung dalam satu tab)", () => {
    expect(namaMenu("/rencana")).toBe("Rencana");
    expect(namaMenu("/jelajah")).toBe("Rencana");
    expect(namaMenu("/jelajah/alat")).toBe("Rencana");
  });
  it("Beranda dan layar dalam tidak memakai nama menu", () => {
    expect(namaMenu("/")).toBeNull();
    expect(namaMenu("/kartu/bath-door")).toBeNull();
  });
});
