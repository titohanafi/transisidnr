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
