// Tanggal lokal perangkat sebagai kunci "YYYY-MM-DD" (bukan UTC, supaya "hari ini" sesuai jam pengguna).
export function kunciHari(d: Date = new Date()): string {
  const dua = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${dua(d.getMonth() + 1)}-${dua(d.getDate())}`;
}

/** Tujuh hari terakhir berakhir di `sampai`, yang terbaru dulu. */
export function hariTerakhir(jumlah: number, sampai: Date = new Date()): string[] {
  return Array.from({ length: jumlah }, (_, i) => {
    const d = new Date(sampai.getFullYear(), sampai.getMonth(), sampai.getDate() - i);
    return kunciHari(d);
  });
}

export function labelHari(kunci: string): string {
  const [y, m, d] = kunci.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", { weekday: "short", day: "numeric", month: "short" });
}

/** Menyimpan paling banyak `maks` hari terbaru. */
export function pangkasRiwayat(r: Record<string, string>, maks = 90): Record<string, string> {
  return Object.fromEntries(Object.entries(r).sort(([a], [b]) => (a < b ? 1 : -1)).slice(0, maks));
}

/** Nama hari singkat, mis. "Sel". */
export function namaHariSingkat(kunci: string): string {
  const [y, m, d] = kunci.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("id-ID", { weekday: "short" });
}

/** Tanggal dalam bulan, mis. "13". */
export function tanggalDalamBulan(kunci: string): string {
  return String(Number(kunci.slice(8, 10)));
}
