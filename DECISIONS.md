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

## Milestone 2 (mesin)
- **Tanda tangan:** `buatRencana(masukan, kartu, asesmen, config)`. Parameter keempat (`config.json`) ditambahkan karena `faseAwalBulan`, `maksMulaiDariSini`, dan rentang budget dibaca dari sana. Batas bulan kejadian (`kejadianBulanMaks`) diberikan pemanggil, diambil dari `onboarding.json`.
- **Protesis belum dijawab** dihitung sama seperti "belum tahu" (kebutuhan jangka panjang belum jelas), supaya aman.
- **Prioritas** dihitung dari aktivitas pertanyaan yang dijawab ya (bukan dari tag kartu). Kartu dengan prioritas pertama diurutkan lebih dulu; sisanya mengikuti urutan asesmen.
- **Kartu masuk `mulaiDariSini`** bila bukan kerangka dan tingkat pertama yang tampil tidak bertanda "tunggu dulu". Jadi kartu yang hanya punya renovasi tidak masuk di kontrakan/kos atau saat fase awal.
- **Kontrakan/kos:** tingkat permanen disembunyikan (`tampil: false`), bukan sekadar ditandai. Tingkat `alat_tanpa_bongkar` ditonjolkan; urutan tidak berubah.
- **Kartu kerangka** tampil di `daftar` (sebagai "isi menyusul") tetapi tidak di `mulaiDariSini`.
- **Catatan di atas budget:** hanya bila batas bawah kisaran lebih besar dari batas atas budget. Teks kisaran yang tidak terbaca dianggap tidak diketahui (tanpa catatan).
- **Total biaya:** menjumlah kisaran tingkat awal tiap kartu di `daftar` (tanpa kartu pendamping). Bila ada satu yang `null`, kerangka, atau tidak terbaca, hasilnya "tidak diketahui" (UI: "Biaya menyusul"). Dengan konten sekarang total hampir selalu "menyusul" karena kartu kerangka dan kisaran `null`.
- `statusAktivitas` diterima sebagai masukan tetapi belum memengaruhi urutan (tidak ada aturan untuk itu).

## Milestone 3 (beranda dan onboarding)
- **State** disimpan generik: `onboarding` = id pertanyaan -> daftar id pilihan, di kunci `transisi:v1`. Bagian baru (asesmen, checklist, check-in) akan ditambah dengan nilai bawaan, sehingga data lama tetap terbaca. Data rusak atau berbentuk lain diabaikan (kembali kosong), tidak membuat aplikasi error.
- **Langkah onboarding di URL** hanya nomor (`#/mulai/3`); jawaban tidak pernah masuk URL.
- Semua pertanyaan wajib dijawab sebelum "Lanjut" (tombol nonaktif). "Belum ada / belum tahu" untuk alat bantu tidak bisa digabung dengan alat lain.
- Setelah pertanyaan terakhir, pengguna dibawa ke penampung `/asesmen` (dibangun di milestone 4). Mulai ulang dari Beranda menampilkan jawaban sebelumnya.
- "Hapus data saya" memakai konfirmasi dua langkah di dalam halaman (bukan dialog browser).
- Halaman `/igd` sudah ada sebagai placeholder (konten tetap wajib diisi tim medis).
- Tailwind: area sentuh minimum dipasang lewat token `min-h-sentuh` (44px).

## Milestone 4 (asesmen)
- **Rute:** `/asesmen/aktivitas` → `/asesmen/prioritas` → `/asesmen/pertanyaan/N` → `/asesmen/foto` → `/rencana` (penampung sampai milestone 5). Pertanyaan ditampilkan satu per layar, seperti onboarding.
- **Tahap a:** tiap aktivitas (kecuali "umum") punya empat pilihan: "Tidak relevan", "Bisa sendiri", "Bisa, tapi sulit", "Ingin, tapi belum bisa". Minimal satu aktivitas harus dipilih.
- **Tahap b dilewati otomatis** bila kurang dari dua aktivitas yang sulit/ingin. Bila hanya satu, aktivitas itu otomatis menjadi prioritas. Bila tidak ada, hanya pertanyaan umum yang ditanyakan.
- **Konsistensi data:** bila status atau prioritas berubah, jawaban untuk pertanyaan yang tidak lagi ditanyakan dibuang, supaya jawaban "ya" lama tidak memengaruhi rencana.
- **Urutan pertanyaan:** aktivitas prioritas (sesuai urutan prioritas), lalu "umum" di akhir.
- **Foto:** dikecilkan di perangkat (sisi terpanjang 1024 px, JPEG kualitas 0,7; sekitar puluhan KB) dan disimpan di kunci terpisah `transisi:v1:foto`, supaya foto yang besar tidak menggagalkan penyimpanan jawaban. Ikut terhapus oleh "Hapus data saya". Tidak ada yang diunggah.
- Foto tidak ada di skema state; hanya `muatFoto`/`simpanFoto` di `storage.ts`.

## Milestone 5 (Rencana dan Detail kartu)
- **Rute:** `/rencana` dan `/kartu/:id/:tingkat?`. Bila belum ada jawaban asesmen, Rencana mengarahkan ke tahap a.
- **Tombol utama tiap kartu:** satu tombol sesuai tingkat: "Lakukan sendiri" (tanpa biaya), "Lihat alat" (alat tanpa bongkar), "Cari tukang" (renovasi). Tingkat yang dipakai: yang ditonjolkan (kontrakan/kos) bila ada, kalau tidak tingkat pertama yang tampil. **Sementara tombol ini membuka Detail kartu** pada tingkat itu; di milestone 6 diarahkan ke aksi sebenarnya.
- **Rencana** menampilkan: satu hal hari ini, "Mulai dari sini" (maks 3), "Rekomendasi lainnya" (sisa daftar, tanpa duplikat), kartu pendamping, lalu check-in. Total biaya: "Biaya menyusul" bila tidak lengkap.
- **Detail kartu:** akordeon per tingkat (tingkat yang dibuka awal = tombol utama atau tingkat dari URL). Tingkat yang disembunyikan karena hunian tidak ditampilkan; diganti satu catatan "perlu izin pemilik".
- **Angka teknis (`ukuran`)** pada kartu draf diganti catatan "Angka teknis akan tampil setelah ditinjau ahli"; tampil bila flag dev `VITE_TAMPILKAN_ANGKA_DRAF=true` (hanya di mode dev).
- **Barang** di Detail hanya menampilkan nama, cek kecocokan (di atas), spesifikasi, harga/"menyusul", dan label afiliasi. Tombol "Lihat produk" dibuat di milestone 6.
- **Istilah teknis:** `ui.json` punya daftar `istilah` (grab bar, raised toilet seat, anti-slip). Bila teks kartu memuatnya, penjelasan satu kalimat tampil di bagian "Istilah". Kalimat penjelasan ditulis oleh saya dan perlu ditinjau. Daftar ini perlu dilengkapi bila kartu baru memakai istilah lain.
- **Penjelasan jenis bantuan** (tukang, okupasi terapis, dll.) satu kalimat per jenis di `ui.json`, juga usulan saya. "Direktori menyusul" ditampilkan.
- **Check-in** disimpan di state (`checkin` = id pilihan), bisa diganti. Balasan hangat + kalimat penutup dari `ui.json`.
- Data state lama tanpa `checkin` tetap terbaca (nilai bawaan `null`).

## Milestone 6 (aksi)
- **Rute aksi:** `/aksi/sendiri|beli|tukang/:id/:tingkat` dan `/aksi/ahli/:id`; cetak di `/cetak`. Id atau tingkat yang tidak valid mengarah ke Rencana.
- **Tombol utama di Rencana:** tanpa biaya → "Lakukan sendiri"; alat tanpa bongkar → "Lihat alat" (bila tingkat itu tidak punya barang, jatuh ke "Lakukan sendiri"); renovasi → "Cari tukang". Di Detail kartu, tiap tingkat menampilkan semua aksi yang masuk akal (sendiri, beli bila ada barang, tukang bila bukan tingkat tanpa biaya dan kartu menyebut tukang), plus "Tanya ahli" di bagian bantuan.
- **Checklist** disimpan di state (`checklist`, kunci `"<id kartu>:<tingkat>"` → nomor langkah). Nomor langkah dipakai (bukan teks), jadi bila isi langkah diubah tim konten, centang lama bisa bergeser; sengaja dipilih yang paling sederhana.
- **Beli:** cek kecocokan tampil di atas tombol; tombol "Lihat produk" nonaktif bila `link` null (diganti teks "Tautan produk menyusul"). Barang `afiliasi: true` diberi label dan penjelasan. Tautan produk dibuka di tab baru dengan `rel="noopener noreferrer"` (plus `sponsored` untuk afiliasi). **Skema sekarang hanya menerima tautan `http(s)`** (untuk `link` dan `sumber.url`), supaya tautan seperti `javascript:` tidak bisa masuk lewat file konten.
- **Brief tukang:** tersusun dari butir yang bisa dicentang dan disunting (sapaan, ruangan, masalah, yang diinginkan, hunian, budget, foto). Fungsi penyusunnya tidak menerima data medis atau tanggal kejadian, jadi tidak mungkin ikut. Isi "masalah" memakai judul kartu; isi "yang diinginkan" memakai ringkasan dan langkah tingkat terpilih. Catatan "Foto akan dikirim terpisah" hanya muncul bila foto ada. Budget kosong atau "belum tahu" ditulis "belum tahu". Suntingan tidak disimpan (hilang saat halaman ditutup).
- **WhatsApp:** `https://wa.me/?text=<teks ter-encode>` tanpa nomor. Teks di URL itu adalah isi brief yang Anda lihat dan sunting sendiri, bukan data pribadi dari state.
- **Tanya ahli:** menjelaskan jenis ahli dari `bantuan` kartu, "Direktori menyusul", dan pengingat bahwa nyeri, luka, dan protesis tidak dijawab platform.
- **Cetak:** halaman `/cetak` memuat seluruh kartu di rencana (termasuk pendamping), tingkat yang tampil dengan langkahnya (☑/☐ sesuai checklist), peringatan, dan foto. Aturan angka draf tetap berlaku. Tombol dan header disembunyikan lewat `print:hidden`; judul layar sekaligus judul kertas.
- **`track`:** `src/lib/events.ts`, tidak mengirim apa pun bawaannya; props dibersihkan (teks maks 64 huruf, angka, boolean). Dicatat: `rencana_dibuat`, `kartu_dibuka`, `aksi_klik`, `brief_dibuat`. Cara memasang analitik ada di README.

## Milestone 7 (pemolesan)
- **Bundel dikecilkan dari 99,6 KB menjadi 76,4 KB gzip** (JS 72,9 KB + CSS 3,2 KB + HTML 0,3 KB). Zod tidak lagi dimuat di peramban produksi: konten divalidasi saat build (`npm run validasi`) dan di tes; state dari localStorage diperiksa dengan validator tulisan tangan (`parseState`) yang diuji. Di mode dev validasi konten tetap jalan dan galatnya muncul di konsol. Nilai tetap (`TINGKAT`, `AKTIVITAS`, dll.) dipindah ke `src/domain/konstanta.ts` supaya tidak menarik zod. Bundel dipecah menjadi potongan react, router, dan aplikasi untuk cache.
- **Tes kontras** (`tests/kontras.test.ts`) memeriksa pasangan warna di `tailwind.config.ts` terhadap WCAG AA (teks 4,5:1; batas kontrol 3:1; cincin fokus 3:1). Token baru `garisKontrol` untuk batas kolom isian.
- **Tes bahasa** (`tests/bahasa.test.ts`): kata terlarang di `content/` dan larangan teks tertulis di komponen (`.tsx`).
- **Audit aksesibilitas** dijalankan otomatis di 20 rute pada lebar 360 px (tanpa gulir horizontal, area sentuh ≥ 44 px, nama tombol/tautan, label isian, alt gambar, urutan heading, id ganda, ukuran teks, atribut `lang`): semua lolos. Fokus keyboard terlihat (garis 3 px).
- Peringatan non-medis kini memuat tautan ke halaman "Kapan harus ke dokter atau IGD".
- `CLAUDE.md` bagian perintah diperbarui.
- **Tidak diverifikasi:** pembacaan dengan screen reader sungguhan (VoiceOver/TalkBack), perangkat ponsel nyata, cetak ke PDF, dan mode kontras tinggi/zoom 200% milik sistem.

## Perbaikan setelah milestone 7
- **Arah pertanyaan panggil bantuan:** spesifikasi awal menulis "Apakah ada tombol atau cara memanggil bantuan dari kamar mandi?", padahal jawaban "ya" memicu kartu `bath-emergency-call`. Artinya terbalik: orang yang tidak punya tombol menjawab "tidak" dan tidak mendapat kartu. Diubah menjadi "Apakah **tidak ada** tombol atau cara memanggil bantuan dari kamar mandi?" (sejalan dengan pertanyaan pegangan). Ada tes yang menolak pertanyaan berawalan "Apakah ada ..." supaya kesalahan ini tidak terulang.
- Jawaban yang sudah tersimpan untuk `q-umum-panggil` di perangkat pengguna lama punya arti terbalik. Karena belum ada pengguna sungguhan, tidak ada migrasi; bila nanti sudah ada, versi kunci penyimpanan perlu dinaikkan.

## Perbaikan: budget satu sumber
- Sesuai PRD, pilihan budget di onboarding kini dibaca dari `content/config.json`. Sebelumnya label ditulis dua kali (di `onboarding.json` dan `config.json`) sehingga bisa tidak sinkron. Pertanyaan budget di `onboarding.json` memakai `"pilihanDari": "budget"` menggantikan daftar `pilihan`; skema mewajibkan tepat satu dari keduanya. Id pilihan tidak berubah, jadi jawaban yang sudah tersimpan tetap terbaca. Brief tukang juga mengambil label budget dari `config.json`.

## Jalur pintas "Sudah tahu apa yang dicari?" (di luar PRD awal)
- **Alasan:** pengguna yang sudah tahu maunya (cari tukang atau alat) tidak seharusnya dipaksa menjawab semua pertanyaan (prinsip 3, "tidak merepotkan"). PRD menyebut alur satu arah; jalur kedua ini ditambahkan tanpa mengubah alur utama.
- **Layar `/jelajah`** ("Semua kartu"): tautan dari Beranda, di bawah tombol "Mulai". Kartu dikelompokkan per aktivitas (urutan dari asesmen), kartu pendamping di akhir. Filter lewat kolom pilihan: Semua, Cari alat, Cari tukang, Tanya ahli. Filter selain "Semua" hanya menampilkan kartu yang benar-benar punya aksi itu.
- **Tombol aksi langsung** di tiap kartu (Lakukan sendiri, Lihat alat, Cari tukang, Tanya ahli), memakai tingkat paling ringan yang mendukungnya. Tingkat yang tersembunyi karena hunian (kontrakan/kos, bila pengguna sempat menjawab) tidak dipakai. Aksi tukang atau beli yang bertumpu pada tingkat permanen yang ditandai tetap diberi penanda "tunggu dulu".
- **Urutan kartu** dalam kelompok: kartu berisi dulu, baru kerangka, lalu urut id. Tidak bergantung pada tautan atau afiliasi (ada tesnya).
- **Tanpa jawaban onboarding:** brief tukang menghilangkan butir hunian dan menulis "Budget kasar: belum tahu"; kebutuhan jangka panjang dianggap belum jelas, sehingga solusi permanen bertanda "tunggu dulu" (default aman). Jawaban yang sudah ada tetap dihormati.
- **Ajakan** di atas daftar: bila belum ada jawaban asesmen, mengajak mengisi pertanyaan; bila sudah, mengarah ke Rencana. Tombol kembali di Detail kartu menuju Rencana (bila sudah ada jawaban) atau ke semua kartu.
- **Keterbatasan saat ini:** hanya `bath-transfer-toilet` dan kartu pendamping yang punya aksi; sembilan kartu lain tampil sebagai "Isi kartu ini sedang disusun".

## Ilustrasi
- **Bentuk:** SVG sebaris buatan sendiri (`src/components/Ikon.tsx`), bukan berkas gambar atau foto stok. Alasan: ringan untuk kuota rendah (nol permintaan jaringan tambahan, sekitar 4 KB sebelum gzip untuk semuanya), tidak ada isu hak cipta atau lisensi, dan warna mengikuti token di `tailwind.config`.
- **Isi:** hanya benda dan ruang (pancuran, kloset, keran, cermin di atas wastafel, pintu, hati untuk caregiver) plus satu ilustrasi kamar mandi di Beranda (ubin, batang pegangan, bangku mandi, pancuran). **Tanpa gambar orang** (prinsip 1: berdaya, bukan mengasihani; menghindari stereotip) dan **tanpa angka atau ukuran** (aturan: jangan mengarang ukuran).
- **Aksesibilitas:** semua dekoratif (`aria-hidden`), karena artinya sudah ada di teks di sebelahnya. Tes memastikan tidak ada teks, gambar eksternal, atau tautan di dalam SVG, dan ukurannya kecil.
- **Dipakai di:** Beranda (ilustrasi), layar aktivitas asesmen, judul kelompok di "Semua kartu", kartu di Rencana, kartu pendamping, dan Detail kartu. Ikon kartu mengikuti aktivitas pertama di `tag.aktivitas` (kartu pendamping memakai hati), jadi kartu baru otomatis dapat ikon tanpa langkah tambahan.
- **Belum ada:** ilustrasi per kartu (mis. gambar grab bar yang dipasang) dan foto produk. Itu butuh gambar asli yang diizinkan dan ditinjau ahli agar tidak menyesatkan; dibahas di bawah "Yang belum".

- **Revisi ikon:** setelah masukan, ikon kloset tidak lagi memakai batang pegangan, ikon grooming diganti cermin persegi di atas wastafel berkeran (versi awal terbaca seperti perahu), dan ikon umum diganti pintu polos dengan gagang (versi awal dengan tanda panggilan tidak terbaca). Ikon dinilai lewat tampilan diperbesar di browser.

- **Revisi ilustrasi Beranda:** ilustrasi kamar mandi diganti ilustrasi umum disabilitas kaki: kursi roda, sepasang kruk, dan walker (sama dengan pilihan alat bantu di onboarding). Tetap hanya benda, tanpa gambar orang dan tanpa protesis (platform tidak menjawab soal protesis).

## Perbaikan UX Beranda dan istilah "kartu"
- **Beranda:** dua jalur kini setara dan sama-sama terlihat di layar ponsel tanpa menggulir: "Susun rencana untuk saya" (tombol Mulai) dan "Saya sudah tahu yang dicari" (tombol Cari alat, Cari tukang, Tanya ahli, plus "Lihat semua panduan"). Tiga langkah "cara kerja" dipindah ke bagian lipat "Cara kerja Transisi", dan ilustrasi dipindah ke bawah supaya kedua jalur tidak terdorong keluar layar.
- **Jalur langsung berfilter:** `/jelajah/alat`, `/jelajah/tukang`, `/jelajah/ahli` membuka daftar yang sudah disaring; `/jelajah` menampilkan semua. Alamat dengan filter yang tidak dikenal jatuh ke "semua".
- **Istilah:** di antarmuka, "kartu" diganti **"panduan"** (mis. "Semua panduan", "Buka panduan", "Isi panduan ini sedang disusun"). "Kartu" tetap dipakai secara internal (nama folder `content/kartu/`, kunci JSON, README untuk tim konten). Ada tes yang menolak kata "kartu" di teks `ui.json`.
- **Belum diuji dengan pengguna nyata:** apakah "panduan" paling mudah dipahami dan apakah dua jalur setara membingungkan pengguna baru. Perlu dicoba ke beberapa caregiver.

## Halaman IGD (setelah council)
- Halaman `/igd` sekarang digerakkan oleh konten: `igd.tandaBahaya` di `content/ui.json` (daftar teks). Selama daftar kosong, halaman menampilkan `igd.menyusul` (arahan umum: hubungi dokter atau IGD terdekat bila ragu). Begitu daftar diisi, halaman menampilkan daftar dengan lencana "Draf, belum ditinjau ahli".
- **Tidak ada tanda bahaya, nomor darurat, atau klaim medis yang saya tulis.** Semua wajib diisi dan ditinjau tenaga medis (dokter rehabilitasi medik / prostetis-ortotis).
- Belum dikerjakan: menampilkan peringatan darurat di semua layar (perlu keputusan desain dan isi dari tim medis).

## Jelajah: tombol aksi tidak lagi berulang (setelah council)
- Daftar `/jelajah` dengan saringan "Semua": kartu hanya punya "Buka panduan". Langkah, alat, tukang, dan bantuan sudah ada di panduan.
- Dengan saringan Cari alat / Cari tukang / Tanya ahli: kartu menampilkan satu tombol aksi sesuai saringan (jalur pintas) dan "Buka panduan" menjadi tombol kedua.
- "Lakukan sendiri" tidak ditampilkan di daftar karena itu isi panduan. Tombol "Tanya ahli" di panduan tetap satu kali, di bagian "Siapa yang bisa membantu".

## Poles tampilan (setelah council)
- **Panduan "isi menyusul"** tampil sebagai baris ringkas bergaris putus (`KartuKerangka`) di Rencana dan Jelajah, tanpa lencana draf berulang dan tanpa tombol besar. Seluruh baris adalah tautan ke panduan. Tujuannya: panduan yang sudah berisi tidak tenggelam oleh kerangka.
- **Bilah kemajuan** onboarding dan asesmen diganti segmen (`BilahKemajuan`) dengan token warna, bukan elemen `<progress>` bawaan peramban. Teks "Pertanyaan n dari N" tetap ada, jadi informasi tidak hanya lewat warna.
- **Catatan non-medis** diberi garis kiri dan latar teal muda supaya terbaca sebagai catatan, bukan kartu konten.
- Belum disentuh: Beranda, halaman Detail panduan, Rencana bagian atas. Perlu keputusan Anda (lihat ringkasan).

## Halaman panduan lebih ringan dibaca (setelah council)
- Komponen `Lipat` (details/summary asli): "Kenapa penting", "Istilah", dan "Sumber" tertutup secara bawaan. Isi tidak diubah.
- "Situasi" jadi kotak teal muda di atas. Catatan non-medis dipindah ke bawah halaman panduan (tetap ada, tetap menaut ke halaman IGD); di Rencana tetap di atas.
- Tiap tingkat solusi menampilkan ringkasan, biaya, dan waktu di kepala akordeon (terlihat tanpa dibuka). Langkah bernomor lingkaran. Baris "Usaha" menggantikan tabel biaya/waktu/kesulitan di dalam panel.

## Beranda visual-dulu (setelah council)
- Beranda dirombak agar muat satu layar ponsel dengan sedikit teks: kalimat pembuka dipersingkat, ilustrasi dipindah ke atas, jalur dipandu jadi kartu teal dengan satu tombol, jalur langsung jadi tiga ubin berikon (alat, tukang, ahli), cara kerja jadi tiga langkah satu baris (judul saja).
- Ikon `alat`, `tukang`, `ahli` ditambahkan ke `Ikon.tsx` (SVG sebaris, dekoratif, tanpa gambar orang). Ikon ini sketsa awal; desainer sebaiknya menggantinya.
- Kalimat deskripsi langkah "cara kerja" dan "Langsung ke yang Anda butuhkan" tidak lagi ditampilkan (tetap ada di `ui.json` karena skema masih mewajibkan).

## "Siapa yang bisa membantu" pindah ke halaman Tanya ahli
- Di panduan, bagian "Siapa yang bisa membantu" dihapus; diganti satu tombol "Tanya ahli" (hanya bila panduan punya saran bantuan). Daftar jenis ahli, artinya, dan "Direktori menyusul" hanya ada di halaman `/aksi/ahli/:id`, jadi tidak ada duplikasi dan panduan lebih pendek.
- Saringan "Tanya ahli" di Jelajah kembali menampilkan tombol "Tanya ahli" (kembali ke perilaku sebelumnya).

## Rencana lebih ringkas (setelah council)
- Prioritas tampil sebagai lencana (Wudhu, Grooming) sejajar dengan "Ubah jawaban", bukan kalimat.
- Catatan non-medis dipindah ke bawah halaman (konsisten dengan halaman panduan).
- "Biaya menyusul" tidak lagi ditampilkan sebagai baris sendiri; total biaya hanya tampil bila diketahui. Biaya per panduan tetap tampil di halaman panduan.
- Panduan kerangka dipisah ke lipatan "Sedang disusun (n)" supaya tidak menenggelamkan panduan berisi. Bila belum ada panduan berisi untuk prioritas Anda, ada catatan "Panduan untuk prioritas Anda belum siap" dan lipatan itu terbuka.
- Teks baru (`rencana.sedangDisusun`, `rencana.belumAdaSiap`) ditulis oleh saya sebagai usulan; mohon ditinjau.

## Isi konten PoC (atas permintaan pemilik, belum ditinjau ahli)
- Pemilik meminta semua konten diisi untuk PoC walau bukan ahli yang menulis. Sembilan kartu kerangka sekarang berisi: kenapa penting, tiga tingkat solusi (tanpa biaya, alat tanpa bongkar, renovasi) dengan langkah, bantuan, peran, dan peringatan. **Semua tetap `draf`** dan tampil dengan lencana "Draf, belum ditinjau ahli".
- **Tetap `null` / menyusul (tidak dikarang):** ukuran dan angka teknis, harga, waktu pengerjaan, spesifikasi barang ("Menyusul setelah survei."), tautan produk, dan sumber (daftar kosong). `biaya` hanya "Rp 0" untuk tingkat tanpa biaya.
- **Halaman IGD** berisi delapan tanda bahaya umum yang saya tulis sebagai draf. Tidak ada nomor telepon darurat. Wajib ditinjau dokter rehabilitasi medik atau prostetis-ortotis sebelum dirilis ke pengguna sungguhan.
- **Istilah** ditambah: papan pindah, roll-in shower, ramp (penjelasan ditulis saya, perlu ditinjau).
- Tes disesuaikan: tidak lagi bergantung pada kartu mana yang masih kerangka; memakai kartu kerangka sintetis. Total biaya langkah pertama kini "Rp 0" karena semua tingkat awal tanpa biaya.
- Karena tidak ada lagi kartu kerangka, lipatan "Sedang disusun" di Rencana tidak akan muncul untuk konten sekarang.

## Lencana "Draf, belum ditinjau ahli" disembunyikan (keputusan pemilik, PoC)
- `LencanaStatus` tidak menampilkan apa pun untuk status `draf` di semua layar (Rencana, Jelajah, Panduan, Cetak, IGD). Lencana "Ditinjau ahli" dan "Disetujui" tetap tampil bila statusnya berubah.
- Status `draf` tetap tersimpan di setiap kartu dan aturan angka teknis (`ukuran` hidden untuk draf) tetap berlaku.
- Ini menyimpang dari aturan di `CLAUDE.md` ("Kartu `draf` menampilkan lencana"). Sebelum dirilis ke pengguna sungguhan, kembalikan lencana ini atau tambahkan penanda draf yang lain.

## Nada lebih hangat (setelah umpan balik "kaku")
- Teks ditulis ulang agar terasa seperti didampingi, tanpa mengasihani dan tanpa mengambil keputusan dari pengguna: sapaan di Beranda ("Halo. Perubahan besar butuh waktu..."), "Mari susun rencananya" / "Mari mulai", kalimat pendek penenang di tiap pertanyaan onboarding, ucapan terima kasih di Rencana, catatan "Cukup ini dulu. Sisanya bisa menunggu." di bawah satu hal hari ini, dan judul caregiver "Untuk Anda yang mendampingi".
- Sudut kartu dan tombol dibulatkan sedikit (token `borderRadius` di `tailwind.config.ts`: kartu 16px, tombol 12px).
- Semua kalimat baru ditulis oleh saya sebagai usulan; mohon ditinjau, terutama oleh caregiver atau penyandang disabilitas sungguhan.

## Aplikasi yang menanggapi pengguna (bukan teks statis)
- **Salam dinamis di Beranda:** "Selamat pagi/siang/sore/malam" menurut jam di perangkat (`src/lib/waktu.ts`, diuji), diikuti kalimat yang menyesuaikan jawaban "Siapa yang mengisi?" (penyandang, caregiver, berdua, atau belum mengisi).
- **Balasan atas tiap jawaban onboarding:** opsi di `content/onboarding.json` boleh punya `respons`; muncul sebagai gelembung hangat dengan animasi halus saat dipilih (hanya bila perangkat tidak meminta gerakan dikurangi).
- **Checklist "Lakukan sendiri":** dorongan berubah menurut kemajuan (satu langkah, separuh jalan, selesai).
- **Rencana menanggapi check-in:** bila caregiver memilih capek fisik, capek emosi, atau butuh istirahat, Rencana menampilkan catatan dan hanya satu hal untuk hari ini; sisa rekomendasi masuk lipatan "Lihat yang lain nanti". Rencana juga menampilkan jumlah langkah yang sudah diselesaikan.
- Belum dikerjakan: nama panggilan opsional (perlu menambah kolom di state), dan ilustrasi yang berubah mengikuti jawaban.
- Semua kalimat baru adalah usulan saya dan perlu ditinjau.

## Hasil per panduan: rencana yang berubah menurut apa yang benar-benar terjadi
- Menggantikan teks sapaan statis. Setelah semua langkah "Lakukan sendiri" dicentang, pengguna memilih "Sudah cukup" atau "Masih sulit".
  - **Sudah cukup:** panduan masuk lipatan "Sudah beres" di Rencana dan hilang dari "Mulai dari sini".
  - **Masih sulit:** "Satu hal untuk hari ini" dan tombol utama kartu pindah ke tingkat berikutnya (tanpa biaya, lalu alat, lalu renovasi; tingkat tersembunyi dilewati). Bila sudah tingkat terakhir, pengguna diarahkan ke Tanya ahli.
- Rencana menampilkan "n dari N panduan beres" dengan bilah kemajuan.
- Disimpan di state: `hasil[idPanduan] = { status, tingkat }`; `parseState` memvalidasi dan menolak bentuk yang salah. Logika ada di `src/domain/hasil.ts` (fungsi murni, ada tes). Mesin rekomendasi (`engine.ts`) tidak diubah.
- Sapaan statis dihapus (`rencana.sapaan`, `rencana.satuHalCatatan`, `beranda.sapaan`) beserta kalimat penenang tambahan di onboarding; yang dipertahankan hanya yang berubah menurut jawaban atau keadaan (salam menurut jam dan peran, balasan tiap jawaban, dorongan checklist, mode ringan saat lelah).
- Belum ada: hasil untuk aksi "beli" dan "tukang" (hanya "Lakukan sendiri" yang mencatat hasil).

## Beranda tanpa teks pembuka
- Salam dan kalimat pembuka di Beranda dihapus; layar langsung dimulai dari ilustrasi dan dua jalur. Fungsi `bagianHari` dan teks `salam`, `salamPeran`, `manfaat` ikut dihapus karena tidak dipakai lagi.

## Beranda: konteks singkat dan janji data
- Karena aplikasi tanpa login, Beranda kembali menjelaskan konteks dengan satu kalimat (untuk siapa dan untuk apa) dan tiga lencana janji: "Tanpa login", "Tersimpan di perangkat Anda", "Tidak dikirim ke mana pun". Menggantikan sapaan dan kalimat privasi yang sebelumnya di bagian bawah.
- Kalimat konteks adalah usulan saya; mohon ditinjau.

## Asesmen lebih ringkas dan jelas (setelah umpan balik)
- **Aktivitas:** tiap aktivitas jadi satu kartu dengan pil pilihan yang membungkus (bukan empat baris besar), sehingga layar jauh lebih pendek. "Tidak relevan" tetap ada sebagai pil terakhir. Memakai `role="radiogroup"` dan radio asli yang tersembunyi secara visual, jadi tetap bisa dipakai dengan keyboard dan pembaca layar.
- **Prioritas:** ada ikon aktivitas dan nomor urutan (1, 2) pada pilihan yang dipilih.
- **Pertanyaan:** penjelasan "Artinya" tampil sejak awal (bukan hanya setelah menjawab "Ya") supaya pengguna paham sebelum menjawab; Ya/Tidak berdampingan; ikon aktivitas di atas.
- **Foto:** keadaan kosong berupa kotak bergaris putus dengan ikon kamera sebagai tombol utama. Belum diperiksa secara visual saat belum ada foto.

## Lencana janji data dihapus dari Beranda
- Tiga lencana ("Tanpa login", "Tersimpan di perangkat Anda", "Tidak dikirim ke mana pun") dihapus atas permintaan pemilik. Kalimat konteks satu baris tetap ada. Janji data tetap tertulis di halaman "Hapus data saya".

## Teks tidak lagi terikat ke kamar mandi (arah: lebih dari satu ruangan)
- Teks antarmuka yang bersifat umum dibuat netral: konteks Beranda ("menyesuaikan rumah"), judul asesmen, foto ("Foto ruangan"), judul kertas cetak ("Rencana adaptasi rumah"), judul keadaan kosong Rencana.
- Nama ruangan di brief tukang kini dibaca dari tag `ruangan` tiap panduan lewat peta `ruangan` di `content/ui.json` (`kamar_mandi` → "Kamar mandi"); ruangan baru cukup menambah satu baris di peta itu.
- **Yang masih terikat ke kamar mandi (butuh keputusan sebelum menambah ruangan):** daftar aktivitas di asesmen (`AKTIVITAS` di `src/domain/konstanta.ts`: mandi, toilet, wudhu, grooming, umum), `content/asesmen.json` yang berupa satu asesmen, pengelompokan Jelajah per aktivitas, dan ikon aktivitas. Rancangan yang disarankan: langkah "pilih ruangan" sebelum asesmen, satu berkas asesmen per ruangan, dan aktivitas yang dimiliki tiap ruangan. Aturan di `CLAUDE.md` ("MVP hanya kamar mandi") belum diubah.

## Langkah memilih ruangan (selaras dengan arah "adaptasi rumah")
- Alur baru: Beranda → onboarding → **Pilih ruangan** (`/ruangan`) → asesmen → Rencana. Daftar ruangan ada di `content/config.json` (`ruangan: [{ id, nama, tersedia }]`); ruangan dengan `tersedia: false` tampil redup dengan tanda "Segera" dan tidak bisa dipilih.
- Ruangan terpilih disimpan di state (`ruangan`). Bila hanya satu ruangan yang tersedia, dipakai otomatis (`useRuangan`), jadi pengguna tetap mendapat satu layar pilihan tetapi tidak terjebak bila belum memilih.
- Asesmen dan Rencana menampilkan "Ruangan: Kamar mandi" dengan tautan "Ganti". Nama ruangan di brief tukang dibaca dari `config.json` (peta nama di `ui.json` dihapus).
- **Nama ruangan lain (Kamar tidur, Dapur, Akses masuk rumah) adalah usulan saya**; ganti sesuai rencana Anda di `config.json`.
- Belum dikerjakan: asesmen per ruangan (aktivitas masih tertanam untuk kamar mandi), Jelajah yang dikelompokkan per ruangan, ikon ruangan. `CLAUDE.md` ("MVP hanya kamar mandi") belum diubah.

## "Cari alat" dan "Tanya ahli" menampilkan daftarnya langsung
- `/jelajah/alat` menampilkan **daftar alat** dari semua panduan (digabung menurut nama; tiap alat memuat cara cek kecocokan, spesifikasi, harga, tombol produk, tanda afiliasi, dan tautan ke panduan tempat alat itu dipakai). Hanya tingkat yang tampil yang dipakai, dan urutan tidak dipengaruhi tautan atau afiliasi (diuji).
- `/jelajah/ahli` menampilkan **jenis ahli** (okupasi terapis, fisioterapis, arsitek, komunitas) dengan penjelasan satu kalimat dan daftar panduan yang mereka bantu. Tukang tidak dihitung di sini (jalurnya sendiri). "Direktori menyusul" dan catatan nyeri/luka/protesis tampil di bawah.
- `/jelajah/tukang` tetap berupa daftar panduan yang melibatkan tukang.
- Fungsi murni `kumpulkanAlat` dan `kumpulkanAhli` di `src/domain/jelajah.ts`, diuji.
- Hero Beranda dipendekkan: "Panduan dan rencana menyesuaikan rumah untuk pengguna kursi roda."

## Ilustrasi Beranda dihapus
- Ilustrasi kursi roda, kruk, dan walker di hero dihapus atas permintaan pemilik (komponen `IlustrasiBeranda` dan tesnya ikut dibuang). Ikon aktivitas dan ikon aksi tetap dipakai di layar lain.

## Jelajah lebih ringkas
- Dropdown "Tampilkan" diganti pil pilihan (Semua, Cari alat, Cari tukang, Tanya ahli) yang langsung terlihat.
- Di "Semua" dan "Tanya ahli", panduan tampil sebagai baris ringkas yang seluruhnya bisa disentuh (`KartuBaris`), bukan kartu dengan tombol besar. Di "Cari tukang" kartu tetap membawa tombol "Cari tukang".
- Ajakan "Lihat Rencana Saya / Mulai pertanyaan" dipindah ke bawah daftar supaya daftar muncul lebih dulu.
- Daftar alat: bila spesifikasi dan harga sama-sama belum ada, cukup satu baris "Spesifikasi dan harga menyusul."; tombol "Lihat produk" yang nonaktif tidak ditampilkan, hanya catatan "Tautan produk menyusul."
- Beranda: teks "Atau lewati pertanyaan, langsung cari:" tidak lagi tampil (tetap ada untuk pembaca layar sebagai judul tersembunyi).

## Ajakan survei dan seminar pilot di Beranda
- Di bawah judul "Buat rencana untuk rumah Anda" kini ada kalimat: "Isi beberapa pertanyaan survei ini dan dapatkan kesempatan mengikuti seminar pilot kami." Nama dan tanggal acara tidak disebut karena belum diberikan.
- **Belum ada mekanisme untuk menepati janji itu.** Aplikasi tidak mengirim apa pun keluar perangkat, jadi tidak ada cara mendaftarkan atau mengenali orang yang sudah mengisi. Perlu diputuskan: tautan formulir pendaftaran terpisah (dibuka di tab baru, tidak membawa data aplikasi), kode atau layar penutup yang bisa ditunjukkan, atau hal lain. Sampai itu ada, kalimat ini menjanjikan sesuatu yang tidak bisa diverifikasi.

## Tampilan seperti aplikasi ponsel
- Header menempel di atas. Di layar dalam (kartu, aksi, dan sebagainya) ada tombol panah kembali ke halaman sebelumnya.
- Bilah tab menempel di bawah dengan empat menu: Beranda, Panduan (`/jelajah`), Rencana, Darurat (`/igd`). Teksnya ada di `content/ui.json` (`umum.tab*`). "Hapus data saya" tetap di Beranda.
- Bilah tab disembunyikan di alur pertanyaan (`/mulai`, `/ruangan`, `/asesmen`) dan cetak, karena alur itu punya tombol Kembali/Lanjut sendiri di bawah.
- Komponen `BilahTab` (menu utama) berbeda dari `NavBawah` (tombol Kembali/Lanjut alur pertanyaan).

## Latar di luar area aplikasi
- Di layar lebar, area aplikasi (lebar maksimal 28rem) memakai warna `kertas`, sedangkan latar di sekelilingnya memakai token baru `luar` (#DCE3E5, abu kebiruan lembut) dengan garis tepi dan bayangan tipis. Warna bisa diganti di `tailwind.config.ts`.

- Warna latar area aplikasi (`kertas`) diubah dari krem #FAF8F5 menjadi putih #FFFFFF atas permintaan pemilik.

## Check-in caregiver pindah ke Beranda
- Pertanyaan "Apa yang paling berat minggu ini?" kini ada di Beranda (di bawah dua jalur, di atas tautan kecil), bukan di Rencana, karena caregiver adalah tujuan utama. Jawabannya tetap tersimpan di state yang sama, jadi Rencana tetap menyesuaikan diri (misalnya menampilkan satu hal saja bila caregiver lelah). Kartu pendamping tetap di Rencana.

## Check-in di paling atas Beranda, bahasa lebih hangat
- Check-in kini di paling atas Beranda, dalam kartu hangat (latar `aksen-muda`). Pertanyaan: "Bagaimana perasaan Anda hari ini?", dengan sapaan singkat di bawahnya ("Merawat itu pekerjaan yang besar. Anda juga penting.").
- Pilihan ditulis sebagai perasaan: Tubuh terasa lelah, Hati terasa penuh, Bingung harus mulai dari mana, Khawatir soal biaya, Ingin istirahat sebentar. Kunci (`id`) tidak berubah, jadi jawaban lama dan logika Rencana tetap jalan.
- Tetap memakai sapaan "Anda" (bukan "kamu") sesuai pedoman bahasa proyek.

## Check-in harian lebih ringan, dengan riwayat
- Tampilan check-in dikecilkan: kartu putih bergaris tipis, label kecil, satu pertanyaan, pilihan berbentuk pil. Balasan tampil sebagai teks kecil. Sapaan tambahan dihapus.
- Jawaban kini dicatat per hari (tanggal lokal perangkat) di `riwayatCheckin` (`YYYY-MM-DD` -> id). Bagian "Riwayat 7 hari terakhir" dilipat dan baru muncul setelah ada satu jawaban; hari tanpa jawaban tertulis "Belum diisi". Disimpan paling banyak 90 hari. Data lama tetap sah (bidang baru opsional, tetap `transisi:v1`).
- Rencana kini hanya melihat jawaban **hari ini** untuk mode "satu hal saja". Sebelumnya jawaban terakhir berlaku selamanya. Bidang `checkin` (jawaban terakhir) masih disimpan tetapi tidak dipakai layar.
- Riwayat berupa daftar teks, belum grafik: sederhana, ringan, dan bisa dibaca pembaca layar. Tidak ada skor atau tren, sesuai aturan platform.

## Riwayat check-in berbentuk ikon per hari
- Riwayat 7 hari kini berupa deretan tujuh lingkaran (lama ke baru, kiri ke kanan) dengan nama hari di atas dan tanggal di bawah. Hari ini diberi cincin dan nama tebal. Hari tanpa jawaban berupa lingkaran putus-putus.
- Satu ikon garis per jawaban, bentuknya berbeda (bukan hanya warna): baterai (tubuh lelah), hati (hati penuh), tanda tanya (bingung), koin (biaya), bulan (istirahat). Sengaja bukan wajah dan bukan skor. Di bawah deretan ada legenda "Arti ikon".
- Pembaca layar membaca teks per hari (mis. "Hari ini: Hati terasa penuh"); ikon disembunyikan dari pembaca layar.
- Ikon dibuat sendiri sebagai SVG sederhana; desainer bisa menggantinya di `src/components/IkonCheckin.tsx`.

## Riwayat check-in memakai emoji
- Ikon gambar sendiri diganti emoji (tanpa berkas gambar, nol beban kuota). Emoji ada di `content/ui.json` (`checkin.pilihan[].emoji`) sehingga tim non-teknis bisa menggantinya: 🥱 tubuh lelah, 😔 hati penuh, 😕 bingung, 😟 khawatir biaya, 😴 istirahat. Komponen `IkonCheckin` dihapus.
- Emoji juga tampil di pil pilihan. Di riwayat, emoji disembunyikan dari pembaca layar dan diganti teks per hari.
- Catatan: tampilan emoji berbeda antar perangkat dan versi Android. Emoji dipilih yang lama dan luas didukung. Wajah tetap dipakai atas permintaan pemilik, tanpa skor atau tren.

## Check-in dua keadaan
- **Belum diisi hari ini:** kartu hijau muda dengan pertanyaan dan lima ubin emoji (emoji besar + satu kata: Lelah, Penuh, Bingung, Biaya, Istirahat). Label panjang tetap dibaca pembaca layar. Ubin berupa tombol dengan `aria-pressed`.
- **Sudah diisi hari ini:** mengecil jadi satu baris putih: emoji, "Hari ini: <jawaban>", satu kalimat balasan, dan tombol "Ubah". Riwayat 7 hari dilipat di bawahnya. Kalimat penutup ("Bila terasa berat terus...") ikut dilipat di dalam riwayat, tidak lagi tampil langsung.
- Kata singkat ada di `content/ui.json` (`checkin.pilihan[].singkat`).

## Check-in: kartu lebih lega, setiap perasaan punya bantuan
- Setelah diisi, kartu dirapikan: tombol "Ubah" jadi tautan teks, dan ada satu tombol bantuan lebar sesuai perasaan. Garis pemisah riwayat dihapus supaya tidak terasa penuh.
- Bantuan per perasaan (semua ke halaman yang sudah ada, tidak ada konten baru): Tubuh lelah -> Rencana ("satu hal untuk hari ini"); Hati penuh -> panduan pendamping `care-assist-transfer`; Bingung -> `/mulai/1`; Biaya -> `/jelajah` (tanpa biaya didahulukan di tiap panduan); Istirahat -> `/jelajah/ahli`.
- **Perlu ditinjau:** panduan pendamping membahas mendampingi saat pindah, bukan dukungan emosi. Untuk "Hati terasa penuh" belum ada panduan yang pas; ganti `bantuan` di `content/ui.json` bila tim konten menambah satu.

- Check-in dipindah lagi ke bawah tombol "Lihat semua panduan" (di atas tautan kecil) atas permintaan pemilik; menggantikan keputusan "paling atas" sebelumnya.

- Kartu "Buat rencana untuk rumah Anda" di Beranda kini punya ikon papan catatan (dalam lingkaran putih) dan deskripsi singkat: "Jawab ya atau tidak, tanpa mengukur. Anda akan mendapat langkah yang sesuai dengan rumah Anda." Isinya mengikuti prinsip produk (ya/tidak, tanpa pengukuran), tanpa klaim baru. Sebelumnya deskripsi sempat dihapus atas permintaan pemilik; ini menggantikannya.

## Ikon Beranda dari pustaka Lucide
- Atas permintaan pemilik, ikon di Beranda tidak lagi digambar sendiri: Papan catatan (Buat rencana), Kunci pas (Cari alat), Palu (Cari tukang), Gelembung percakapan (Tanya ahli), semuanya dari `lucide-react` (lisensi ISC), diimpor satu per satu. Pembungkusnya `src/components/IkonBeranda.tsx`.
- Dampak ukuran: JS naik sekitar 3,5 kB gzip (30,5 -> 33,9 kB). Ini menambah satu dependensi di luar daftar teknis awal; bila dianggap berat, ikon bisa diganti emoji atau disalin sebagai SVG sebaris.
- Ikon di layar lain (aktivitas, foto) masih buatan sendiri; belum diganti karena yang diminta hanya Beranda.
- Ikon di kartu Buat rencana dipindah ke atas judul.
