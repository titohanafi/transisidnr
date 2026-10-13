# Keputusan

## Milestone 1
- **Tailwind v3** dipilih (bukan v4) karena token desain tetap ada di `tailwind.config.ts`, mudah diganti desainer.
- **Penanda kartu pendamping:** tag `peran: ["caregiver"]` (opsional) ditambahkan ke skema. Engine mengenali pendamping dari tag ini, bukan dari id.
- **Kartu kerangka** (`isi_menyusul: true`) boleh tanpa `kenapa_penting`, `solusi`, `bantuan`, `peran`, `sumber`. Kartu lain wajib punya semuanya. Tag `tingkat_biaya` kartu kerangka dikosongkan karena belum diketahui.
- **Field tambahan** di `asesmen.json`: `penjelasan` (kalimat awam untuk jawaban "ya") dan daftar `aktivitas` dengan `bisaDipilihPrioritas` (umum = false).
- **`onboarding.json`** menyimpan `bulanMaks` per pilihan kejadian (1, 3, 6, tanpa batas) untuk aturan fase awal.
- `ukuran`, `barang` di tingkat solusi opsional. `usaha.waktu` dan `usaha.kesulitan` boleh `null`.
- Kartu `care-assist-transfer`: `kisaran_rp` "Rp 0" (langkahnya tidak memerlukan pembelian), `waktu` null, `sumber` kosong.

## Konten yang wajib diisi ahli
- Halaman "Kapan harus ke dokter atau IGD": daftar tanda bahaya (sementara placeholder).
- Semua kartu masih `draf`; sembilan kartu hanya kerangka.
- Spesifikasi, harga, dan tautan barang di `bath-transfer-toilet`.
- Sumber untuk `care-assist-transfer`.
- Kalimat `penjelasan` di `asesmen.json` dan balasan check-in di `ui.json` ditulis oleh saya sebagai usulan; mohon ditinjau.
