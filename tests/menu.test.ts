import { describe, expect, it } from "vitest";
import { namaMenu } from "../src/components/BilahTab";

describe("judul header mengikuti menu", () => {
  it("Panduan Saya dan daftar semua panduan berada dalam satu tab", () => {
    expect(namaMenu("/rencana")).toBe("Panduan");
    expect(namaMenu("/jelajah")).toBe("Panduan");
    expect(namaMenu("/jelajah/alat")).toBe("Panduan");
  });
  it("Beranda dan layar dalam tidak memakai nama menu", () => {
    expect(namaMenu("/")).toBeNull();
    expect(namaMenu("/kartu/bath-door")).toBeNull();
  });
});
