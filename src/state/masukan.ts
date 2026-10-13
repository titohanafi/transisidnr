import type { Masukan } from "../domain/engine";
import type { Onboarding } from "../domain/schema";
import type { State } from "./storage";

const PROTESIS = new Set(["ya", "belum_tahu", "tidak"]);

/** Mengubah jawaban tersimpan menjadi masukan mesin rekomendasi. Jawaban yang belum ada menjadi null. */
export function keMasukan(state: State, onboarding: Onboarding): Masukan {
  const satu = (id: string): string | null => state.onboarding[id]?.[0] ?? null;
  const kejadian = onboarding.pertanyaan
    .find((q) => q.id === "kejadian")
    ?.pilihan.find((p) => p.id === satu("kejadian"));
  const protesis = satu("protesis");
  return {
    hunian: satu("hunian"),
    protesis: protesis && PROTESIS.has(protesis) ? (protesis as Masukan["protesis"]) : null,
    kejadianBulanMaks: kejadian?.bulanMaks ?? null,
    budget: satu("budget"),
    statusAktivitas: state.asesmen.status,
    prioritas: state.asesmen.prioritas,
    jawaban: state.asesmen.jawaban,
  };
}
