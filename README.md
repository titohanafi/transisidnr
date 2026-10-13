# Transisi

Platform web mobile-first untuk caregiver dan penyandang disabilitas yang baru mengalami amputasi kaki. Lihat `CLAUDE.md` untuk aturan produk.

## Perintah
- `npm run dev`: jalankan lokal
- `npm run build`: validasi konten, typecheck, lalu build
- `npm test`, `npm run lint`, `npm run typecheck`
- `npm run validasi`: periksa semua file di `content/`

## Isi konten
Semua isi ada di `content/` dan dipisah dari kode:
- `kartu/<id>.json`: satu kartu per file; nama file harus sama dengan `id`
- `asesmen.json`: pertanyaan ya/tidak dan kartu yang dipicunya
- `onboarding.json`, `config.json`, `ui.json`: pertanyaan awal, angka konfigurasi, dan teks antarmuka

Bila ada kesalahan (misalnya `memicu_kartu` menunjuk id yang tidak ada), `npm run validasi`, `npm test`, dan `npm run build` gagal dengan pesan yang menyebut letak masalahnya.

Angka teknis (`ukuran`) di kartu berstatus `draf` tidak tampil. Untuk melihatnya saat pengembangan, jalankan `VITE_TAMPILKAN_ANGKA_DRAF=true npm run dev`.

## Analitik (opsional, ramah privasi)
Bawaannya **tidak ada yang dikirim keluar perangkat**. `src/lib/events.ts` menyediakan `track(nama, props)`; di mode dev hanya mencetak ke `console.debug`.

Kejadian yang dicatat: `rencana_dibuat` (jumlah kartu), `kartu_dibuka` (id kartu), `aksi_klik` (jenis aksi dan id kartu), `brief_dibuat` (id kartu). Tidak ada jawaban, hunian, budget, foto, atau isi brief di dalamnya. Props dibersihkan: hanya teks pendek (maks 64 huruf), angka, dan boolean.

Untuk memasang analitik nanti, pilih layanan tanpa cookie dan tanpa profil pengguna (misalnya Plausible atau Umami milik sendiri), lalu daftarkan pengirimnya sekali di `src/main.tsx`:

```ts
import { setPengirim } from "./lib/events";
setPengirim((nama, props) => {
  window.plausible?.(nama, { props }); // contoh; sesuaikan dengan layanan yang dipilih
});
```
Sebelum memasang: perbarui catatan privasi di Beranda, karena kalimat "tidak dikirim ke mana pun" tidak lagi benar bila ada pengirim.
