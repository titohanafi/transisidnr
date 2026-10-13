import type { Kartu } from "./schema";

/** Angka teknis (ukuran) hanya tampil bila kartu sudah ditinjau, atau flag dev menyala. */
export function bolehTampilkanUkuran(status: Kartu["status_validasi"], flagDraf: boolean): boolean {
  return status !== "draf" || flagDraf;
}
