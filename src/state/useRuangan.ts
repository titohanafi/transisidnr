import { konten } from "../domain/content";
import { useStore } from "./store";

/**
 * Ruangan yang sedang dibereskan. Bila belum dipilih dan hanya ada satu ruangan yang tersedia,
 * ruangan itu dipakai otomatis supaya pengguna tidak diminta memilih satu-satunya pilihan.
 */
export function useRuangan() {
  const { state } = useStore();
  const tersedia = konten.config.ruangan.filter((r) => r.tersedia);
  const id = state.ruangan ?? (tersedia.length === 1 ? tersedia[0].id : null);
  const ruangan = konten.config.ruangan.find((r) => r.id === id) ?? null;
  return { ruangan, tersedia };
}
