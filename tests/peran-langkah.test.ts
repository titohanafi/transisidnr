import { describe, expect, it } from "vitest";
import { konten } from "../src/domain/content";
import { PERAN_LANGKAH } from "../src/domain/konstanta";
import { tingkatSolusiSchema } from "../src/domain/schema";

const semuaTingkat = konten.kartu.flatMap((k) =>
  Object.entries(k.solusi ?? {}).map(([tingkat, s]) => ({ id: `${k.id}:${tingkat}`, s: s! })),
);

describe("peran tiap langkah", () => {
  it("setiap tingkat solusi menandai peran untuk setiap langkahnya", () => {
    for (const { id, s } of semuaTingkat) {
      expect(s.peran_langkah, id).toBeDefined();
      expect(s.peran_langkah, id).toHaveLength(s.langkah.length);
      for (const p of s.peran_langkah!) expect(PERAN_LANGKAH, id).toContain(p);
    }
  });

  it("jumlah peran yang tidak sama dengan jumlah langkah ditolak skema", () => {
    const contoh = semuaTingkat[0].s;
    const salah = { ...contoh, peran_langkah: [...contoh.peran_langkah!, "caregiver"] };
    expect(tingkatSolusiSchema.safeParse(salah).success).toBe(false);
  });

  it("peran di luar daftar ditolak skema", () => {
    const contoh = semuaTingkat[0].s;
    const salah = { ...contoh, peran_langkah: contoh.peran_langkah!.map(() => "dukun") };
    expect(tingkatSolusiSchema.safeParse(salah).success).toBe(false);
  });

  it("tukang hanya muncul di tingkat renovasi (tingkat lain dikerjakan sendiri atau bersama caregiver)", () => {
    for (const { id, s } of semuaTingkat.filter((x) => !x.id.endsWith(":renovasi"))) {
      expect(s.peran_langkah, id).not.toContain("tukang");
    }
  });

  it("kartu pendamping semuanya peran caregiver", () => {
    const k = konten.kartu.find((x) => x.id === "care-assist-transfer")!;
    for (const s of Object.values(k.solusi ?? {})) expect(new Set(s!.peran_langkah)).toEqual(new Set(["caregiver"]));
  });
});
