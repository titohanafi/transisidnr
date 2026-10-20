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

## "Cari tukang" diganti "Pesan ke tukang"
- Fitur ini hanya membuat draf pesan WhatsApp, bukan daftar tukang, jadi namanya diganti agar tidak menjanjikan daftar. Berlaku di Beranda, saringan Panduan, tombol aksi, dan judul layar ("Pesan untuk tukang"). Bila nanti ada direktori tukang, nama lama bisa dipakai lagi untuk itu.

## Ikon aktivitas dari Lucide
- Ikon aktivitas (Mandi: kepala pancuran, Toilet: kloset, Wudhu: tetesan air, Merapikan diri: kilau, Umum: pintu terbuka) dan ikon pendamping (dua tangan berjabat dengan hati) kini dari `lucide-react`. Komponen `Ikon` tetap sama, sehingga semua layar ikut berganti.
- Pilihan "Merapikan diri" dan "Umum" adalah tafsiran saya karena Lucide tak punya ikon cermin-wastafel; bisa diganti di `src/components/Ikon.tsx`.
- Ikon buatan sendiri yang tersisa hanya kamera di layar foto. Ikon alat/tukang/ahli lama yang tak terpakai dibuang.
- JS gzip kini 34,4 kB (naik 0,5 kB dari penambahan ikon).

## Pesan ke tukang bukan menu utama Beranda
- Tombol cepat "Pesan ke tukang" dihapus dari Beranda karena tukang ada di ujung urutan (tanpa biaya -> alat -> renovasi/jasa) dan draf pesannya butuh konteks panduan. Beranda kini punya dua tombol cepat yang lebih besar: Cari alat dan Tanya ahli.
- Tetap ada: tombol aksi di panduan/Rencana (tingkat renovasi atau alat yang perlu dipasang) dan pilihan "Pesan ke tukang" di halaman Panduan (`/jelajah/tukang`).

- Ikon kamera di layar foto kini Lucide `Camera`. Tidak ada lagi ikon buatan sendiri di aplikasi; `IkonAksi` dihapus.

- Ikon bilah menu bawah kini Lucide: Beranda (rumah), Panduan (buku terbuka), Rencana (daftar centang), Darurat (perisai peringatan). Panah kembali di header juga Lucide (`ChevronLeft`).

## "Tanya ahli" diganti "Kenali peran ahli"
- Halaman ini hanya menjelaskan peran tiap jenis ahli, bukan daftar ahli yang tersedia (direktori menyusul), jadi "Tanya ahli" menjanjikan terlalu banyak. Nama baru berlaku di Beranda, saringan Panduan, tombol aksi di panduan, dan judul layar aksi.
- Tombolnya saya biarkan di Beranda karena sifatnya informasi ringan, bukan langkah yang mahal. Bila ingin disamakan dengan tukang (dihapus dari Beranda), Beranda hanya tersisa satu tombol cepat.

- "Kenali peran ahli" dihapus dari Beranda (halamannya tetap ada lewat Panduan). Beranda kini menonjolkan "Lihat semua panduan" sebagai baris besar berlatar hijau muda dengan ikon buku, diikuti baris "Cari alat". Keduanya baris lebar dengan panah, bukan ubin kecil.

## Tukang digabung ke "Kenali peran ahli"
- Di halaman `/aksi/ahli/<panduan>`, baris Tukang (yang memang sudah tercantum di bantuan panduan) kini punya tombol "Pesan ke tukang" ke draf WhatsApp, memakai tingkat paling ringan yang mendukungnya.
- Tombol "Pesan ke tukang" di tiap tingkat pada halaman detail panduan dihapus supaya tidak ada dua pintu ke hal yang sama. Yang tetap ada: tombol utama di kartu Rencana untuk tingkat renovasi (agar tidak menambah satu langkah), dan saringan `/jelajah/tukang`.
- Fungsi `aksiTersedia` tidak diubah; penyaringan hanya di tampilan detail panduan.

## Filter tukang digabung ke ahli di halaman Panduan
- Pil "Pesan ke tukang" di `/jelajah` dihapus. Tukang kini satu jenis di daftar "Kenali peran ahli" (tampil pertama), lengkap dengan arti dan panduan yang melibatkannya. Pesan WhatsApp-nya diakses dari halaman peran ahli tiap panduan.
- Alamat lama `/jelajah/tukang` diarahkan ke daftar ahli supaya tautan lama tidak patah.

- Tautan "Kapan harus ke dokter atau IGD" dihapus dari Beranda atas permintaan pemilik. Halamannya tetap bisa dibuka lewat tab Darurat dan lewat peringatan non-medis di panduan.

## "Hapus data saya" pindah ke ikon Data dan privasi di header
- Tautan teks di dasar Beranda diganti ikon perisai (Lucide `ShieldCheck`) di kanan header, tersedia di semua layar. Alasannya: tindakan yang jarang dipakai dan berisiko tidak perlu memakai ruang Beranda atau satu slot tab, tetapi tetap mudah ditemukan dan konsisten dengan pola aplikasi ponsel.
- Layar tujuannya (`/hapus`) diberi judul "Data dan privasi", menampilkan kalimat privasi (data hanya di perangkat) sebelum tombol hapus. Tombol dan konfirmasi hapus tidak berubah.
- Alternatif yang tidak dipilih: tab kelima "Pengaturan" (terlalu berat untuk satu fungsi).

## Tab "Saya"
- Tab kelima di navbar (ikon Lucide `UserRound`): "Saya", bukan "Profil", agar tidak terkesan akun. Tanpa nama atau data identitas; semuanya di perangkat.
- Isi: (1) Jawaban Anda: ruangan, status tiap aktivitas, prioritas, dan tombol "Ubah jawaban" (atau ajakan mulai bila belum ada jawaban); (2) Check-in 7 hari terakhir (deretan emoji, dipindah dari Beranda); (3) tautan Data dan privasi (halaman hapus data), menggantikan ikon perisai di header yang dihapus.
- Check-in di Beranda tetap, tetapi saat sudah diisi menjadi satu baris: emoji, "Hari ini: <perasaan>", tautan bantuan kecil, dan "Ubah". Kalimat balasan dan riwayat tidak lagi tampil di Beranda.
- Belum dibuat: checklist perkembangan pasien/caregiver. Butuh isi yang ditinjau ahli (aturan konten) dan sebaiknya tanpa skor. Layar `src/screens/Saya.tsx` disiapkan sebagai tempatnya.

- Navbar bawah: hanya menu yang sedang aktif yang menampilkan nama (pil hijau berisi ikon dan nama); menu lain hanya ikon. Nama menu lain tetap dibaca pembaca layar (teks tersembunyi). Area sentuh tiap menu minimal 48px.

- Koreksi: yang dimaksud pemilik adalah judul di header, bukan navbar. Navbar kembali menampilkan nama di semua menu (catatan "hanya menu aktif" di atas dibatalkan). Judul header kini mengikuti menu yang aktif: Panduan, Rencana, Darurat, Saya. Di Beranda header tetap "Transisi" (merek); layar dalam (detail panduan, aksi, dan sebagainya) juga tetap "Transisi" dengan tombol kembali.

## Penggabungan Rencana dan Panduan (hasil council UX)
- Dasar: council lima penasihat menilai struktur lama sulit dipahami pengguna baru karena Rencana dan Panduan adalah daftar yang sama dengan urutan berbeda. Yang dinilai adalah deskripsi struktur, bukan uji dengan pengguna; uji dengan 3 orang tetap disarankan.
- Navbar kini empat menu: Beranda, Rencana, Darurat, Saya. Tab Panduan dihapus.
- Tab Rencana: bila belum menjawab, menampilkan semua panduan (halaman yang sama dengan `/jelajah`) dengan kartu ajakan "Susun rencana saya" di atas, tanpa langsung melempar ke pertanyaan. Bila sudah menjawab, menampilkan rencana pribadi seperti biasa, dengan tombol "Lihat semua panduan" di bawah.
- `/jelajah` tetap ada (tautan lama tidak patah) dan juga menyorot tab Rencana. Judul header di sana "Rencana".
- Pil Semua / Cari alat / Kenali peran ahli dihapus karena mencampur jenis berbeda (topik, produk, orang). Diganti bagian "Lainnya" di dasar daftar dengan dua tombol: "Daftar alat" dan "Peran ahli dan tukang" (`/jelajah/alat`, `/jelajah/ahli`).
- Beranda: satu tindakan utama yang mengikuti keadaan: belum menjawab "Buat rencana untuk rumah Anda"; sudah menjawab "Lanjutkan rencana Anda" (ke Rencana). Satu tautan kecil "Lihat semua panduan" untuk yang ingin melihat-lihat dulu. Baris "Cari alat" dan "Lihat semua panduan" yang besar dihapus. Check-in tetap di bawahnya.
- Belum dikerjakan (usul council): ganti kata "panduan" dengan "topik"/"langkah" (perlu diuji kata mana yang dipahami), layar sambutan singkat untuk kunjungan pertama, mengurangi 6+4 pertanyaan awal, pengukuran drop-off tanpa server (acara lokal), dan titik masuk terpisah untuk penyandang disabilitas vs caregiver.

## Sapaan "Anda" dan siapa yang mengisi
- Aturan: "Anda" berarti orang yang sedang memegang ponsel. Hal tentang kemampuan fisik menyebut "pengguna kursi roda", dan hal tentang rumah memakai "rumah ini".
- Pertanyaan onboarding "Siapa yang mengisi?" dihapus karena jawabannya tidak dipakai di mana pun; onboarding kini lima pertanyaan. Data lama yang masih menyimpan jawabannya tetap terbaca dan diabaikan.
- Teks yang disesuaikan: penjelas pertanyaan menjangkau dan memanggil bantuan, bantuan pilihan aktivitas ("keseharian di rumah"), bantuan prioritas ("caregiver membantu"), dan catatan renovasi di kontrakan atau kos ("karena rumah ini kontrakan atau kos").
- Ide bila uji pengguna menunjukkan caregiver merasa tidak disapa: pilihan "mengisi untuk siapa" di tab Saya, bukan gerbang di Beranda.

## Orientasi kunjungan pertama di Beranda
- Tanpa layar sambutan terpisah (menambah satu langkah sebelum manfaat). Sebelum pengguna menjawab pertanyaan awal, Beranda menampilkan paragraf pengantar (apa ini, untuk siapa) menggantikan kalimat konteks lama, dan kalimat privasi kecil di bawah kartu utama. Setelah menjawab keduanya hilang otomatis dari keadaan data; tidak ada tombol tutup atau penanda baru di penyimpanan.
- Frasa yang dipilih pemilik: "setelah perubahan kondisi gerak" (lebih lembut daripada "setelah amputasi kaki").
- Lama pengisian sengaja tidak disebut karena belum pernah diukur.

- Pengantar kunjungan pertama diperpendek menjadi dua kalimat ("Menyiapkan rumah agar lebih mudah dipakai, mulai dari kamar mandi. Untuk penyandang disabilitas pengguna kursi roda dan caregiver.") karena versi empat baris terasa panjang. Frasa "perubahan kondisi gerak" ikut dibuang.

- Kalimat privasi dihapus dari Beranda atas permintaan pemilik. Kalimat itu tetap ada di tab Saya dan halaman Data dan privasi.

## Kolom cari panduan di Beranda
- Di bawah kartu utama (bukan di atas, agar aksi utama tetap "Buat rencana"): kolom cari tipis berlabel "Sudah tahu masalahnya?" dengan tombol kaca pembesar, dan tautan "Lihat semua panduan" di bawahnya. Menekan Enter atau tombol membuka daftar panduan dengan kata kunci sudah terisi; bila kosong, kolom cari di daftar langsung aktif.
- Kata kunci dikirim lewat state riwayat peramban, bukan alamat, supaya tidak ada teks pengguna di URL.
- Pencarian berjalan di perangkat (fungsi murni `cocokCari`, diuji): semua kata harus ada di judul atau situasi panduan, tanpa membedakan huruf besar/kecil. Belum mencari di isi langkah, alat, atau sinonim (mis. "grab bar" untuk pegangan); tambahkan bila uji pengguna menunjukkan orang memakai istilah lain.
- Hasil kosong menampilkan pesan yang mengarahkan ke "Susun rencana saya".

- Kolom cari dipindah ke atas kartu "Buat rencana" atas permintaan pemilik (menggantikan keputusan "di bawah kartu"). Tautan "Lihat semua panduan" tetap di bawah kartu. Catatan: dua pintu masuk kini bersaing di bagian atas Beranda; pantau pada uji pengguna apakah pengguna baru tetap menemukan "Buat rencana".

- Teks kartu "Buat rencana" kini: "Menyiapkan rumah agar lebih mudah dipakai, mulai dari kamar mandi. Untuk penyandang disabilitas pengguna kursi roda dan caregiver." (usul pemilik). Paragraf pengantar terpisah di atas dihapus karena duplikat. Kalimat "Jawab ya atau tidak, tanpa mengukur" tidak lagi tampil di Beranda; pertanyaannya sendiri sudah berbentuk ya/tidak.

- Tulisan kecil "Jawab ya atau tidak, tanpa mengukur." ditambahkan di bawah tombol Mulai (hanya sebelum menjawab).

- Catatan kecil di bawah Mulai dihapus (dianggap tidak penting). Label kolom cari di Beranda diganti "Cari masalah di rumah Anda" dengan contoh "Mis. lantai licin atau pintu sempit" supaya jelas apa yang bisa dicari tanpa istilah "panduan".

- Label kolom cari di Beranda diganti usul pemilik: "Temukan panduan agar tempat tinggal lebih ramah disabilitas" (menggantikan "Cari masalah di rumah Anda").

- Label kolom cari di Beranda dinaikkan menjadi teks 18px tebal berwarna tinta (gelap) agar menjadi kalimat pertama yang terbaca.

- Kolom cari di Beranda dinaikkan (jarak atas dikurangi) dan diberi jarak lebih longgar: label ke kolom 12px, kolom ke tombol cari 12px.

- Jarak kolom cari ke kartu hijau ditambah (16px menjadi 24px).

## "Rumah" atau "tempat tinggal"
- Hasil telusur: "rumah" dipakai di sekitar 12 tempat (judul kartu, asesmen, kartu panduan, kertas cetak); "tempat tinggal" hanya di pertanyaan jenis hunian (onboarding) dan label kolom cari yang baru. Opsi hunian: milik sendiri, kontrakan, kos, apartemen.
- Keputusan: "rumah" dipakai sebagai kata umum di seluruh antarmuka (pendek, hangat, dan lazim dipakai untuk kos/apartemen: "di rumah"). "Tempat tinggal" hanya dipertahankan pada pertanyaan jenis hunian karena di situ perbedaan kos/kontrakan/apartemen memang ditanyakan. Label kolom cari diubah ke "Temukan panduan agar rumah lebih ramah disabilitas".
- Risiko: penghuni kos mungkin terasa kurang disapa oleh kata "rumah". Periksa pada uji pengguna; alternatif yang lebih inklusif adalah "tempat tinggal" di semua tempat, dengan harga kata yang lebih formal.
- Teks kartu "Buat rencana" disesuaikan dengan perannya (panduan yang dipersonalisasi sesuai kondisi), sedangkan kolom cari untuk semua orang: "Dapatkan langkah yang sesuai dengan kondisi dan rumah Anda, mulai dari kamar mandi. Untuk penyandang disabilitas pengguna kursi roda dan caregiver."

## Cakupan layanan sebagai label kecil
- Layanan saat ini hanya kamar mandi dan pengguna kursi roda, dan nanti akan bertambah. Informasi ini dipisah dari narasi umum: kartu "Buat rencana" kini berisi narasi umum ("Dapatkan langkah yang sesuai dengan kondisi dan rumah Anda.") dan satu label kecil berbingkai di pojok kanan atas, "Tersedia untuk kamar mandi dan kursi roda". Tampil hanya sebelum pengguna menjawab.
- Teks label ada di `content/ui.json` (`beranda.pilih.susun.cakupan`) dan cukup diubah saat layanan bertambah. Pertimbangan lanjutan: menurunkan label dari `config.json` (ruangan dengan `tersedia: true`) supaya otomatis, tetapi alat bantu belum ada di config.

- Label cakupan dipindah ke baris tersendiri di bawah ikon (di atas judul kartu), memakai teks lengkap "Tersedia untuk kamar mandi dan kursi roda".

- Label cakupan dipindah dari dalam kartu hijau ke bawah kolom cari, karena cakupan (kamar mandi dan kursi roda) berlaku untuk seluruh layanan termasuk pencarian. Tampil selalu (sebelum dan sesudah menjawab). Kuncinya kini `beranda.pilih.cakupan` di `content/ui.json`.

- Label cakupan di bawah kolom cari kini dua pil: "Ruang: Kamar mandi" dan "Disabilitas: Pengguna kursi roda". Disimpan sebagai daftar `beranda.pilih.cakupan` ({label, nilai}) di `content/ui.json`, jadi menambah ruang atau jenis disabilitas cukup menambah satu butir atau mengubah nilainya. Pembaca layar mendengar daftar berjudul "Tersedia untuk".

- Di atas dua pil cakupan ada judul kecil "Ruang lingkup pengembangan saat ini" (`beranda.pilih.cakupanJudul`).

- Info cakupan di bawah kolom cari diganti dari dua pil menjadi satu baris teks polos berikon info (Lucide `Info`): "Ruang lingkup pengembangan saat ini: kamar mandi, pengguna kursi roda." Pil dihindari karena terbaca sebagai riwayat pencarian atau filter yang bisa diketuk. Nilai diambil dari daftar `beranda.pilih.cakupan` (label tidak ditampilkan).

- Info cakupan dipindah ke atas judul kolom cari dan diringkas jadi satu baris: "Saat ini: kamar mandi, pengguna kursi roda." (judul `beranda.pilih.cakupanJudul` = "Saat ini").

- Info cakupan dipindah ke bawah judul kolom cari dan ditulis ulang: "Saat ini tersedia panduan untuk aktivitas di kamar mandi bagi pengguna kursi roda." Disimpan sebagai satu kalimat di `beranda.pilih.cakupan` (menggantikan daftar label/nilai), karena kalimat utuh lebih mudah dibaca dan diubah saat layanan bertambah.

- Judul kolom cari di Beranda dinaikkan dari 18px ke 24px (text-2xl), setara judul layar lain.

- Tautan "Lihat panduan yang tersedia" dipindah tepat setelah teks info cakupan (di atas kolom cari), menggantikan "Lihat semua panduan" di bawah kartu hijau. Jarak judul ke teks info dilonggarkan (12px).

- Info cakupan dan tautan "Lihat panduan yang tersedia" dijadikan banner informasi (latar hijau muda, ikon info) di paling atas Beranda, di atas judul kolom cari. Catatan: warnanya sama dengan kartu check-in; bila terasa mirip, ganti salah satunya.

- Banner informasi di Beranda diberi latar krem (token `aksen-muda`) dengan garis tepi tipis berwarna aksen, ikon info dalam lingkaran putih, teks tinta, dan tautan "Lihat panduan yang tersedia" berpanah berwarna aksen. Kombinasi warnanya sudah ada di tes kontras. Judul kolom cari dan teks lain tidak berubah.

- Banner: kalimat menjadi "Saat ini baru tersedia panduan untuk aktivitas di kamar mandi bagi pengguna kursi roda." dan tautannya diperpendek menjadi "Lihat panduan", disatukan dalam paragraf yang sama dengan kalimat (tautan sebaris, berwarna aksen dan bergaris bawah; ikon panah dihapus).

- Banner informasi kini selebar layar: menempel ke header di atas dan ke tepi kiri-kanan (tanpa sudut membulat, hanya garis bawah tipis). Letaknya di luar formulir cari.

## Banner biru
- Banner informasi di Beranda diganti biru dengan token baru `info` (#1D4E89) dan `info-muda` (#E6F0FA) di `tailwind.config.ts`, khusus untuk informasi netral. Kontrasnya diuji (info di info-muda, tinta di info-muda, info di putih). Perubahan token Tailwind memerlukan server dev dimulai ulang.

- Ikon info di banner tidak lagi berada di lingkaran putih; berdiri sendiri berwarna biru, sejajar baris pertama teks.

- Judul kartu utama diganti "Buat rencana pribadi" (sebelumnya "Buat rencana untuk rumah Anda") agar langsung ke inti dan tidak mengulang "rumah Anda" yang ada di deskripsinya ("Dapatkan langkah yang sesuai dengan kondisi dan rumah Anda.").

- Kartu utama: judul "Cek kebutuhan di rumah" dan deskripsi "Jawab beberapa pertanyaan, lalu dapatkan langkah yang sesuai dengan kondisi Anda." Kata "rencana" dihindari di judul kartu karena terdengar seperti rencana bepergian. Kata "rencana" masih dipakai di tab Rencana dan layar "Rencana Saya"; bila tidak pas juga, pertimbangkan "Langkah Saya".

## Tab Rencana menjadi Panduan
- Alasan: "rencana" terdengar seperti rencana bepergian, dan "langkah" sudah dipakai untuk isi di dalam panduan (bagian Langkah, "3 dari 5 langkah selesai"). Setelah Rencana dan Panduan digabung, tab itu berisi satu hal: panduan.
- Tab navbar: "Panduan" (ikon buku terbuka). Judul layar: "Semua panduan" sebelum menjawab dan "Panduan Saya" sesudahnya. Tombol di Beranda: "Cek kebutuhan di rumah", lalu "Lanjutkan panduan Anda" / "Buka Panduan Saya".
- Teks ikut diselaraskan: cetak ("Cetak panduan saya", kertas "Panduan adaptasi rumah"), kembali ("Kembali ke panduan saya"), ajakan di daftar, dan Saya. Nama internal (rute `/rencana`, fungsi `buatRencana`, kejadian `rencana_dibuat`) tidak diubah agar tautan lama tetap berlaku.
- Telusur halaman: tidak ada sisa kata "rencana" yang terlihat pengguna di Beranda, Panduan, Saya, Cetak, detail panduan, dan peran ahli. Label "Untuk Anda yang merawat" di check-in tidak lagi terbaca dua kali oleh pembaca layar.

## Check-in terisi dirancang ulang
- Kartu setelah memilih emoji kini memakai latar hijau muda yang sama dengan kartu pertanyaan (satu keluarga). Isi: emoji besar dalam lingkaran putih, keterangan kecil "Hari ini · Untuk Anda yang merawat", jawaban tebal besar, tombol "Ubah" berikon pensil di pojok kanan atas, dan satu tombol bantuan lebar berpanah (putih, tepi tipis) di bawahnya. Sebelumnya berupa baris putih datar dengan tautan yang terlihat menggantung.

- Placeholder kolom cari di Beranda: "Cari panduan, mis. lantai licin" (menyebut apa yang dicari, selaras dengan judul "Temukan panduan…", disusul satu contoh).

- Placeholder kolom cari diganti "Mis. cara mengatasi lantai licin" (kata "cara" selaras dengan judul "Temukan panduan…", karena panduan adalah cara menangani suatu masalah). Agar contoh itu benar-benar menemukan hasil, pencarian kini mengabaikan kata penghubung dan kata tanya umum (cara, mengatasi, bagaimana, untuk, agar, dan sebagainya; daftar `KATA_ABAI` di `src/domain/jelajah.ts`, diuji). Daftar ini perlu dilengkapi bila uji pengguna menunjukkan kata lain yang sering diketik.

## Saran pencarian di Beranda
- Di bawah kolom cari ada baris "Coba cari" berisi tiga saran yang bisa diketuk (Lantai licin, Pintu sempit, Pegangan kloset). Mengetuknya membuka daftar panduan yang sudah tersaring (sama seperti mengetik lalu Enter). Daftar saran ada di `content/ui.json` (`beranda.pilih.cari.saran`) dan diuji agar tiap saran selalu menemukan minimal satu panduan.
- Saran ini bukan riwayat pencarian pengguna: tidak ada riwayat yang disimpan. Tiga saja agar muat satu baris dan Beranda tidak makin padat.

- Judul kolom cari menjadi "Temukan panduan dan solusi agar rumah lebih ramah disabilitas": kata "solusi" memberi tahu bahwa mengetik masalah (mis. "lantai licin") juga tepat, dan sudah dikenal di aplikasi ("Pilihan solusi"). Kata "solusi" ikut diabaikan oleh pencarian ("solusi lantai licin" tetap menemukan panduan).

- Deskripsi kartu utama: "Jawab beberapa pertanyaan, lalu dapatkan solusi yang sesuai dengan kondisi Anda." (bukan "langkah", agar selaras dengan judul pencarian dan tidak bentrok dengan "langkah" di dalam panduan). Ajakan di halaman daftar ikut disamakan.

## Putaran penyempurnaan Beranda
- **Urutan mengikuti keadaan:** pengunjung baru melihat banner cakupan, sapaan, pencarian, kartu "Cek kebutuhan", lalu check-in. Setelah menjawab: sapaan, kartu "Lanjutkan panduan Anda", pencarian, check-in, lalu info cakupan sebagai catatan kecil di dasar (banner di atas hanya untuk kunjungan awal).
- **Sapaan** sesuai jam perangkat (pagi 04-10, siang 11-14, sore 15-17, malam lainnya), fungsi `bagianHari` diuji. Tidak ada data pribadi.
- **Check-in sebelum diisi** lebih tenang (kartu putih bergaris tipis; yang terpilih berlatar hijau muda dengan cincin). Setelah diisi tetap kartu hijau muda yang dirancang ulang sebelumnya.
- **Kolom cari** satu kolom setinggi 48px dengan ikon kaca pembesar di dalam; tombol terpisah dihapus (Enter mengirim, ada tombol kirim tersembunyi untuk pembaca layar).
- **Token desain** di `tailwind.config.ts`: skala tipografi (`text-judul`, `text-subjudul`, `text-isi`, `text-kecil`, `text-mikro`) dan ritme jarak (`bagian` = 24px antar bagian, `isi` = 12px di dalam bagian). Beranda memakainya; layar lain belum dimigrasi.
- **Merek:** wordmark "Transisi." (tebal, rapat, titik berwarna aksen) di header layar non-menu.
- **Umpan balik sentuhan:** kelas `.tekan` (mengecil sedikit saat ditekan, mati bila pengguna meminta gerak dikurangi) pada tombol, kartu baris, tab navbar, saran pencarian, dan ubin check-in.
- **Ukuran teks:** label ubin check-in dan tab navbar 13px (sebelumnya 12px). Diperiksa di lebar 360px: semua label muat (Bingung 52px, Istirahat 53px dalam ubin 55px). Karena ruangnya tipis, jangan menambah kata atau memperbesar font label tanpa memeriksa ulang.
- Perubahan token Tailwind memerlukan server dev dimulai ulang.

- Segmen pencarian di Beranda diberi latar tipis (token baru `permukaan` #F2F6F6, abu kehijauan sangat muda) dalam kartu membulat, supaya judul, kolom, dan saran terbaca sebagai satu kelompok. Kontras tinta dan redup di atasnya diuji. Padding saran dirapatkan agar tiga saran tetap satu baris. Token baru memerlukan server dev dimulai ulang.

- Segmen pencarian kini pita selebar layar (tepi ke tepi) berlatar `permukaan`. Bagi pengunjung baru, sapaan ikut masuk ke dalam pita dan kartu "Cek kebutuhan di rumah" menimpa tepi bawahnya sekitar 40px (kartu diberi bayangan tipis); pita langsung menyambung di bawah banner cakupan. Setelah menjawab, pita berada di bawah kartu "Lanjutkan panduan Anda" tanpa tumpang tindih.

- Jarak saran pencarian ke kartu "Cek kebutuhan di rumah" ditambah (24px menjadi sekitar 32px). Warna latar di luar area aplikasi (token `luar`) diganti dari abu kebiruan #DCE3E5 menjadi krem pasir hangat #E9E2D6 supaya jelas berbeda dari area aplikasi dan dari pita pencarian yang berwarna kehijauan. Token Tailwind berubah: server dev perlu dimulai ulang.

- Latar di luar area aplikasi (token `luar`) diganti hijau tua pekat #0A4549 (sama dengan `utama-gelap`, agar selaras dengan palet) menggantikan krem pasir. Hanya terlihat di layar lebar; di ponsel aplikasi memenuhi layar. Token berubah: server dev perlu dimulai ulang.

## Server dev membaca ulang Tailwind otomatis
- Masalah: perubahan `tailwind.config.ts` (token warna, jarak, tipografi) tidak terbaca server dev yang sedang berjalan; harus Ctrl+C lalu `npm run dev`. Diuji: bahkan restart dalam proses yang sama dan "menyentuh" berkas CSS tidak membantu, karena Tailwind menyimpan konfigurasi di memori.
- Perbaikan: konfigurasi Tailwind kini diberikan langsung dari `vite.config.ts` (`css.postcss.plugins`), sehingga Vite memantau `tailwind.config.ts` sebagai dependensi dan memulai ulang servernya sendiri bila berubah. Diuji dengan mengubah satu warna lalu mengembalikannya: CSS berubah tanpa Ctrl+C.
- Berkas `postcss.config.js` dihapus karena fungsinya pindah ke `vite.config.ts`. `tsconfig.json` mendapat `allowImportingTsExtensions` (aman karena `noEmit`) agar impor `./tailwind.config.ts` sah tanpa peringatan.
- Sekali ini server dev yang sedang berjalan tetap perlu dimulai ulang agar memakai pengaturan baru; sesudahnya tidak lagi.

- Latar di luar area aplikasi (token `luar`) diganti abu netral tipis #ECECEA (menggantikan hijau tua pekat), sesuai permintaan pemilik.

## Catatan cakupan kembali ke Beranda (kuning, bisa ditutup)
- Catatan "Saat ini baru tersedia panduan untuk aktivitas di kamar mandi bagi pengguna kursi roda" tampil lagi di Beranda, di atas sapaan "Selamat pagi", sebagai kartu kuning lembut selebar isi (bukan tepi ke tepi) dengan tombol tutup. Tetap ada juga di hasil pencarian dan pertanyaan pertama asesmen.
- Keputusan paling sederhana: status "ditutup" hanya disimpan di memori halaman, jadi catatan muncul lagi saat halaman dimuat ulang. Tidak ada data baru di localStorage. Bila ingin tetap tertutup, perlu satu bidang baru di `transisi:v1`.
- Token warna baru `catatan` (teks #5C3D00, latar #FFF3C4, garis #E8CF7A). Kontras teks di atas latar sekitar 8,9:1.

## Prettier dipasang
- Prettier ditambahkan sebagai dependensi dev dengan `.prettierrc.json` (`printWidth` 140 agar sesuai gaya kode yang sudah ada, `trailingComma: all`). Perintah: `npm run format` dan `npm run format:cek`.
- Diformat: `src/`, `tests/`, dan berkas konfigurasi di akar. Tidak diformat (lihat `.prettierignore`): `content/` (teks yang diedit tim non-teknis), berkas Markdown, dan `package-lock.json`.
- Seluruh kode diformat sekali dalam satu commit terpisah; tidak ada perubahan perilaku (lint, typecheck, tes, dan build lulus).

## "Situasi" dan "Kenapa penting" digabung di hero Detail Panduan
- Di hero Detail Panduan, judul dan "Situasi" sering nyaris sama, sedangkan "Kenapa ini penting" dulu berupa bagian lipat terpisah. Keduanya kini digabung: kotak kuning Situasi menampilkan `situasi`, lalu `kenapa_penting` di kalimat berikutnya bila isinya berbeda (tidak ditampilkan dua kali bila sama atau sudah terkandung). Tidak ada teks baru yang ditulis; seluruhnya dari bidang yang sudah ada di kartu.
- Daftar, Panduan Saya, Cetak, dan pencarian tidak berubah.

## Lencana "Sementara, bisa dibatalkan" dihapus
- Lencana ini dihapus di Detail Panduan dan di kartu Panduan Saya (permintaan pemilik). Hanya solusi permanen yang diberi lencana "Permanen", sehingga prinsip 5 ("solusi permanen ditandai") tetap terpenuhi: yang tidak bertanda adalah solusi yang bisa dibatalkan. Teks `umum.sementara` di `content/ui.json` kini tidak terpakai.

## Waktu pengerjaan diisi sementara (placeholder, belum ditinjau)
- Atas permintaan pemilik, kolom `usaha.waktu` yang masih kosong diisi: Tanpa biaya "15 menit", Alat tanpa bongkar "1-2 jam", Renovasi "1-3 hari". Nilai ini disalin dari satu-satunya panduan yang sudah punya data waktu (`bath-transfer-toilet`) dan diterapkan ke tingkat yang sama di panduan lain. Itu BUKAN estimasi per panduan; hanya pengisi sementara.
- Renovasi di `bath-space-turning`, `bath-shower-entry`, dan `bath-emergency-call` sengaja tetap kosong karena pekerjaannya (membongkar dinding, merencanakan, atau instalasi listrik) hampir pasti lebih lama dari "1-3 hari".
- Kisaran biaya (`biaya.kisaran_rp`) TIDAK diisi: mesin rekomendasi membacanya untuk menghitung total dan menandai "di atas anggaran", jadi angka karangan akan diam-diam mengubah rekomendasi. Menunggu angka dari tim konten.
- Semua kartu tetap berstatus `draf`; angka ini perlu ditinjau sebelum dianggap benar.

## Estimasi biaya (placeholder, hanya tampilan)
- Atas permintaan pemilik, pil biaya di Detail Panduan dan Cetak kini menampilkan "Rp x rb - y jt" (awalnya dengan kata "Estimasi", lalu kata itu diganti tanda "~" di depan angka atas permintaan pemilik; angka tetap perkiraan) untuk tingkat Alat tanpa bongkar dan Renovasi yang belum punya `kisaran_rp`. Angkanya disimpan di bidang BARU `biaya.estimasi_rp` (opsional, hanya tampilan). Mesin rekomendasi tetap hanya membaca `kisaran_rp`, jadi total biaya, "di atas anggaran", dan urutan rekomendasi TIDAK terpengaruh.
- Angka ini adalah perkiraan kasar saya dari pengetahuan umum tentang harga barang di Indonesia, bukan dari survei atau sumber. Kisarannya sengaja lebar. Semua kartu masih `draf`. Perlu diganti dengan angka dari survei sebelum dipakai pengguna sungguhan; bila `kisaran_rp` diisi, ia menggantikan estimasi.
- Tiga renovasi (`bath-space-turning`, `bath-shower-entry`, `bath-emergency-call`) dan kartu pendamping tidak diberi estimasi karena biayanya sangat bergantung pada kondisi rumah; pilnya tetap "Biaya menyusul".

## Detail Panduan: struktur disederhanakan (kurangi beban kognitif)
- Sebelumnya halaman memuat sekitar 12 blok terpisah (3 kartu solusi, 2 kartu peran, peringatan, 2 bagian lipat, catatan non-medis, dua tombol). Sekarang: hero, satu wadah solusi (3 baris berpemisah), tombol ahli, peringatan, satu wadah peran (2 baris), satu wadah "istilah dan sumber" (2 baris lipat), dan catatan non-medis sebagai teks kecil tanpa kotak.
- Hanya satu tingkat solusi terbuka pada satu waktu (membuka satu menutup yang lain). Tombol "Kembali ke ..." di dasar dihapus karena header sudah punya panah kembali.
- Peringatan keselamatan sengaja tetap terlihat (tidak dilipat) dan berwarna.

## Halaman "Ikuti langkahnya" digabung ke panel solusi
- Halaman terpisah `/aksi/sendiri/...` hanya mengubah daftar langkah menjadi kotak centang. Sekarang daftar langkah di panel solusi (Detail Panduan) langsung berupa kotak centang, dengan bilah kemajuan dan pertanyaan "Bagaimana hasilnya?" yang muncul setelah semua langkah tercentang. Data tetap sama (`state.checklist` dan `state.hasil`), jadi Panduan Saya (beres atau tingkat berikutnya) dan halaman Cetak tidak berubah.
- Tombol "Ikuti langkahnya" dihapus dari panel. Di Panduan Saya, tombol utama untuk tingkat tanpa barang kini berbunyi "Lihat langkahnya" dan menuju panel solusi tingkat itu. Alamat lama `/aksi/sendiri/...` diarahkan ke halaman panduan.

## Tombol "Kenali peran ahli" dan "Pesan ke tukang" diberi konteks
- Tombol "Kenali peran ahli" yang berdiri sendiri di bawah daftar solusi dihapus karena muncul tanpa alasan. Sekarang tombol itu muncul di dua tempat yang masuk akal: (1) di panel tingkat Renovasi, dengan kalimat pengantar "Renovasi sering perlu dibantu ahli dan tukang. Kenali siapa yang cocok untuk panduan ini.", dan (2) sebagai saran setelah pengguna menjawab "Masih sulit" di tingkat terakhir.
- Tombol "Pesan ke tukang" kini langsung di panel tingkat yang mendukungnya, dengan kalimat pengantar. Sebelumnya hanya bisa dicapai lewat halaman peran ahli.
- Kalimat pengantar baru (`kartu.jembatanTukang`, `kartu.jembatanAhli`) ditulis oleh asisten dan perlu ditinjau tim konten.

## Alat tanpa bongkar: beli dulu, tukang hanya untuk memasang
- Di tingkat "Alat tanpa bongkar", tombol utama (hijau penuh) adalah "Lihat alat". "Pesan ke tukang" tetap ada tetapi sekunder, dengan pengantar "Perlu dipasangkan, atau ingin alatnya dibuat khusus oleh tukang? ..." (`kartu.jembatanPasang`). Di tingkat Renovasi sebaliknya: "Pesan ke tukang" utama dengan pengantar "Ingin dikerjakan tukang? ..." dan "Lihat alat" (bila ada barang) sekunder. Kalimat pengantar baru ditulis asisten; perlu ditinjau.

## Butir pilihan "alat dibuat khusus" di pesan ke tukang
- Untuk tingkat "Alat tanpa bongkar", pesan ke tukang punya butir tambahan "Alat ingin dibuat khusus sesuai ukuran dan kondisi di rumah, bukan beli jadi." Butir ini TIDAK dicentang dari awal dan baru masuk pesan bila pengguna mencentangnya (teksnya bisa disunting). Tidak muncul di tingkat lain. Kalimatnya ditulis asisten (`aksi.brief.alatKhusus`); perlu ditinjau.

- Pembaruan: pengantar dan tombol "Pesan ke tukang" untuk tingkat Alat tanpa bongkar dipindah dari panel di Detail Panduan ke halaman "Lihat alat" (di bawah daftar barang), karena di sanalah orang memutuskan membeli, memasang, atau membuat khusus. Di panel Detail Panduan, tukang hanya tampil di tingkat Renovasi. Komponen `Jembatan` kini dipakai bersama.
- Daftar "Barang yang dibutuhkan" (nama, cek kecocokan, spesifikasi, harga) dihapus dari panel di Detail Panduan karena isinya sama dengan halaman "Lihat alat" yang dibuka tombolnya. Informasi barang kini hanya ada di satu tempat.
- Di tingkat Renovasi, "Pesan ke tukang" dan "Kenali peran ahli" digabung dalam satu blok dengan satu kalimat pengantar (`kartu.jembatanRenovasi`), karena halaman peran ahli sudah memuat tukang sebagai salah satu jenis bantuan. Dua kalimat pengantar terpisah sebelumnya (`jembatanTukang`, `jembatanAhli`) dihapus.

## Menu Darurat menjadi Kontak (seperti yellow pages)
- Tab "Darurat" diganti "Kontak" (alamat `/kontak`; `/igd` diarahkan ke sana). Halaman memuat: kartu darurat (tanda bahaya dari `ui.igd` dan nomor darurat dengan tombol telepon), penyaring jenis kontak, lalu satu kartu per jenis (nama, arti, kontak, dan "Dipakai di panduan" berisi tautan ke panduan terkait).
- Fitur "Kenali peran ahli" dipindah ke sini. Halaman `/aksi/ahli/:id` dan `/jelajah/ahli` kini mengarah ke Kontak; dari panduan, jenis ahli yang disarankan panduan itu tampil lebih dulu dengan keterangannya. Komponen `AksiAhli` dan `DaftarAhli` dihapus.
- Data kontak ada di berkas baru `content/kontak.json` dan divalidasi zod (nomor harus berbentuk nomor; kategori dan id harus sah). Delapan kategori: darurat, dokter rehabilitasi medik, prostetis-ortotis, okupasi terapis, fisioterapis, tukang, arsitek, komunitas.
- ISI KONTAK: hanya dua nomor yang diisi, yaitu 112 (nomor darurat nasional) dan 119 (layanan darurat kesehatan), berstatus draf dan perlu diverifikasi tim sebelum rilis. Semua kategori lain sengaja kosong dan tampil "sedang disiapkan"; tidak ada nama, nomor, atau alamat yang dikarang. Arti dua kategori baru (dokter rehabilitasi medik, prostetis-ortotis) ditulis asisten dan perlu ditinjau.
- Nomor di tautan `tel:` dan `wa.me` tidak dikirim ke server mana pun; tidak ada data pribadi di alamat halaman.

## Isi kontak diisi dari sumber resmi pemerintah
- Atas permintaan pemilik, `content/kontak.json` diisi hanya dari situs pemerintah yang diperiksa pada saat pengisian, dan setiap entri menyimpan `sumber` (alamat halaman resminya; ada tes yang menjaga semua sumber berakhiran `.go.id`). Isi: darurat (112, 119, 115 Basarnas, 110 polisi, 113 pemadam), layanan pemerintah (Halo Kemenkes 1500-567 dan WhatsApp, Kemensos 171, BPJS Kesehatan 165), dan RS Ortopedi Prof. Dr. R. Soeharso Surakarta (rumah sakit Kemenkes; rehabilitasi medik, ortotik-prostetik, okupasi terapi, fisioterapi) di empat kategori.
- Yang TIDAK diisi: tukang, arsitek, komunitas, dan kontak ahli lokal. Itu bukan layanan pemerintah, sehingga tetap "sedang disiapkan".
- Hal yang perlu diverifikasi manusia: (1) nomor BPJS 165 diambil dari ringkasan pencarian atas situs resmi BPJS karena halaman utamanya tidak bisa dibaca otomatis; (2) 110 dan 113 bersumber dari halaman Komdigi tentang 112 yang menyatakan nomor itu masih bisa dipakai; (3) layanan 112 berbeda antar daerah; (4) nomor rumah sakit bisa berubah. Semua entri berstatus `draf`.
- Nomor WhatsApp Kemensos yang tertaut di situs lama (628877171171) sengaja TIDAK dipakai karena ada peringatan resmi pemerintah daerah tentang nomor WhatsApp palsu atas nama Kemensos; hanya telepon 171 yang dipakai.

## Peran penyandang disabilitas dan caregiver pindah ke panel solusi
- Kartu "peran" yang berdiri sendiri dihapus. Dua kalimat peran (`peran.penyandang_disabilitas` dan `peran.caregiver`) kini tampil sebagai dua baris kecil berlabel di dalam panel solusi, tepat di atas daftar langkah. Label daftar langkah tetap "Langkah" (bukan "Peran caregiver") karena sebagian langkah dikerjakan sendiri oleh penyandang disabilitas, dan prinsip produk menempatkan penyandang disabilitas sebagai pemegang keputusan.

## Penanda peran di setiap langkah (checklist)
- Kartu atau kotak peran dihapus dari Detail Panduan. Sebagai gantinya, setiap langkah di checklist diberi penanda kecil siapa yang mengerjakannya: Penyandang disabilitas, Caregiver, Bersama, atau Tukang (tingkat Renovasi). Data disimpan di bidang baru `peran_langkah` (urutan sama dengan `langkah`; jumlahnya harus sama, dijaga skema dan tes). Bidang `peran` lama di kartu tidak lagi ditampilkan.
- Pembagian peran untuk 106 langkah DITENTUKAN ASISTEN dengan aturan sederhana dari kata kerja pertama dan sedikit penyesuaian manual: memutuskan, mencoba, dan memakai = penyandang disabilitas; menyiapkan, memasang, memindahkan, dan membeli = caregiver; melatih, menyepakati, dan menguji = bersama; pekerjaan bangunan di Renovasi = tukang; kartu pendamping semuanya caregiver. Ini penilaian, bukan fakta dari ahli. Semua kartu masih draf dan tim konten perlu meninjau penandanya.

- Baris "Kesulitan" (mis. "Mudah, bisa sendiri") dihapus dari panel solusi karena penanda peran di setiap langkah sudah menunjukkan siapa yang terlibat. Datanya (`usaha.kesulitan`) tetap ada di konten.

- Lencana "Permanen" dan "Tunggu dulu, kebutuhan Anda mungkin berubah" dihapus dari panel solusi di Detail Panduan (permintaan pemilik): nama tingkat "Renovasi" dan urutan dari yang paling ringan sudah menyiratkannya. Lencana yang sama masih tampil di kartu rencana pada Panduan Saya.

- Tombol "Lihat kontak ahli" dihapus dari panel tingkat Renovasi karena sudah ada menu Kontak; yang tersisa hanya "Pesan ke tukang" dengan pengantar `kartu.jembatanRenovasi`. Tombol ke Kontak tetap muncul setelah pengguna menjawab "Masih sulit" di tingkat terakhir.

- Tombol ke halaman Kontak setelah menjawab "Masih sulit" di tingkat terakhir dihapus (permintaan pemilik). Tersisa kalimat saja: "Ini sudah pilihan terakhir di panduan ini. Pertimbangkan bertanya ke ahli lewat menu Kontak." Satu-satunya jalan ke Kontak dari panduan kini lewat tab Kontak di bilah bawah.
- Urutan isi panel solusi sekarang: ringkasan dan pil, langkah bercentang, ukuran (bila ada), ajakan bertindak ("Lihat alat" dan, di Renovasi, "Pesan ke tukang"), lalu pertanyaan "Bagaimana hasilnya?" di paling bawah (hanya muncul setelah semua langkah tercentang). Komponen dipecah menjadi `LangkahChecklist` dan `HasilLangkah`.

## Penanda hasil di daftar Panduan
- Jawaban "Bagaimana hasilnya?" (Sudah cukup / Masih sulit) kini juga tampil sebagai penanda di baris panduan pada halaman Panduan: "Beres" (ikon centang) atau "Masih sulit" (ikon peringatan). Panduan yang belum dicatat tidak diberi penanda. Datanya sama dengan yang dipakai Panduan Saya (`state.hasil`), tersimpan di perangkat. Teks penanda ada di `jelajah.status`.

- Tombol "Kembali ke panduan saya" setelah menjawab "Sudah cukup" dihapus (permintaan pemilik); pesan "Kabar baik. Panduan ini ditandai beres di Panduan Saya." tetap tampil. Teks `keRencana` dihapus dari konten.

- Urutan panel solusi diperbarui lagi: ringkasan dan pil, ajakan bertindak ("Lihat alat" dan, di Renovasi, "Pesan ke tukang") DI ATAS langkah, lalu langkah bercentang, ukuran, dan "Bagaimana hasilnya?" di paling bawah.
- Biaya dipindah dari kartu tab solusi ke dalam panel solusi, sejajar dengan pil waktu. Kartu tab kini hanya berisi nama tingkat (lebih pendek). Konsekuensinya biaya tiga tingkat tidak lagi bisa dibandingkan sekilas tanpa berpindah tab.
- Nama tingkat "Alat tanpa bongkar" di antarmuka diganti "Pakai alat" supaya sejajar dengan "Tanpa biaya" dan "Renovasi" (dua kata, pola sama). Kunci data `alat_tanpa_bongkar` dan prinsip "tanpa bongkar" tidak berubah. Maksud "tanpa bongkar" tetap dijelaskan di ringkasan tiap solusi ("alat yang bisa dilepas").

- Kalimat pengantar di atas "Pesan ke tukang" pada tingkat Renovasi dihapus (permintaan pemilik); tombolnya berdiri sendiri. Teks `jembatanRenovasi` dihapus dari konten. Pengantar "Perlu dipasangkan, atau ingin alatnya dibuat khusus..." di halaman Lihat alat tidak berubah.

- Bagian "Perhatian" (peringatan keselamatan panduan) dipindah dari bawah solusi ke hero Detail Panduan, di bawah kotak Situasi, supaya terbaca sebelum pengguna mengikuti langkah. Tampil di semua panduan yang punya peringatan, termasuk kartu yang isinya masih menyusul.

## Penyempurnaan tampilan setelah melihat hasil render (Chrome headless)
- Detail Panduan: hero diberi label kelompok (mis. "MANDI") di sebelah ikon; checklist memakai kotak centang kustom (garis tipis, terisi teal dengan tanda centang), pemisah tipis antarlangkah tanpa blok abu, bilah kemajuan tipis dengan hitungan n/N.
- Kontak: nomor darurat kini di paling atas sebagai kisi tombol telepon dua kolom (nomor besar + nama), karena sebelumnya daftar tanda bahaya yang panjang mendorong nomor ke bawah. Tanda bahaya dan keterangan/sumber nomor dilipat. Dalam keadaan darurat orang perlu menelepon dulu, membaca kemudian.

- Saat semua langkah tercentang, pesan "Semua langkah selesai..." diberi emoji 🎉 di depannya (hiasan; disembunyikan dari pembaca layar karena kalimatnya sudah jelas).

- Hero Detail Panduan: "Perhatian" kini berwarna kuning lembut (token `catatan`), "Situasi" berganti hijau muda, dan label "Situasi" serta nama kelompok tidak lagi huruf kapital semua.

- "Perhatian" dipindah dari hero ke tepat di atas bagian "Pilihan solusi" (permintaan pemilik), tetap kuning. Tampil di semua panduan yang punya peringatan, termasuk yang isinya menyusul.

## Ilustrasi sederhana di hero Detail Panduan
- Hero kini punya ilustrasi kecil di sisi kanan judul, satu per kelompok (mandi, toilet, wudhu, grooming, umum, caregiver), menggantikan petak ikon. Berupa SVG inline (tanpa berkas unduhan, kurang dari 5 KB untuk semuanya), warna mengikuti token `utama` dan `daun`, dekoratif (`aria-hidden`). Ilustrasi sengaja hanya menggambarkan benda (pancuran, kloset, keran, cermin, pintu, hati), tanpa orang, ukuran, atau cara pasang, supaya tidak menyiratkan klaim teknis atau menempatkan penyandang disabilitas sebagai objek gambar.
- Ilustrasi digambar asisten dan sengaja sederhana; desainer bisa mengganti isi `src/components/Ilustrasi.tsx` dengan karya sendiri tanpa mengubah tata letak.

## Ilustrasi selebar panel untuk pilihan solusi (bertahap)
- Dibuat bertahap, mulai dari panduan "Lantai licin saat basah" (`bath-floor-slip`) saja. Tiap pilihan solusinya punya ilustrasi selebar panel di atas deskripsi: tanpa biaya (pel, genangan, ember), pakai alat (keset anti-slip dan stiker), renovasi (lantai berubin dengan saluran dan palu). Panduan lain belum punya, sehingga panelnya tidak berubah. Daftar ada di `src/components/IlustrasiSolusi.tsx` dengan kunci `idKartu:tingkat`; menambah panduan baru tinggal menambah satu entri.
- SVG inline dan dekoratif; hanya benda dan situasinya, tanpa orang, ukuran, atau cara pasang.
- Gaya ilustrasi diubah dari bentuk padat berwarna cerah (terkesan seperti gambar anak-anak) menjadi gambar garis tipis ala gambar teknik: dinding berubin tipis, lantai berperspektif, benda berkontur teal, isian tonal lembut, dan satu aksen hijau kecil. Tanpa kilau, tanda centang, atau bentuk bulat tebal.
- Ilustrasi "Tanpa biaya" untuk lantai licin diubah: lantai kini bersih dan kosong (tanpa genangan, ember, atau pel), dengan elemen kamar mandi tetap terlihat (pancuran yang mati, saluran lantai, kloset) dan kilau tipis sebagai tanda kering. Ini sesuai maksud langkahnya, yaitu hasil akhirnya lantai kering dan bebas benda.
- Ilustrasi solusi tidak lagi memakai isian padat berwarna hijau atau teal (keset, waterpas, dan lantai kini putih atau abu muda dengan garis), supaya tidak bersaing dengan tombol hijau di bawahnya. Jarak di panel diatur ulang: ilustrasi ke deskripsi 20px, deskripsi ke pil biaya dan waktu 16px.
- Jarak panel solusi dinaikkan 4px: ilustrasi ke deskripsi 24px, deskripsi ke pil 20px, pil ke tombol atau garis pemisah 24px.

## Halaman "Alat yang dibutuhkan" (Lihat alat) didesain ulang
- Latar putih (pengaturan `latarPutih` di `AksiHalaman`, hanya dipakai halaman ini). Tiap alat berupa kartu bergaris tipis tanpa bayangan: nama dan label afiliasi di atas, kotak hijau muda "Cek kecocokan dulu" berikon, daftar Spesifikasi dan Harga sebagai baris berpemisah (label di kiri, nilai di kanan), lalu tombol "Lihat produk" berikon tautan luar. Bila tautan belum ada, bagian itu berupa kotak abu "Tautan produk menyusul", bukan tombol nonaktif yang pucat. Ajakan "Pesan ke tukang" berada di kotak abu muda dengan ikon palu.

- Tombol "Kembali ke panduan" di dasar halaman "Alat yang dibutuhkan" dihapus (permintaan pemilik); panah kembali di header tetap ada. Halaman aksi lain (Pesan ke tukang) masih memilikinya.

- Kalimat "Baca cara cek kecocokan dulu sebelum membeli." dihapus dari halaman "Alat yang dibutuhkan" (permintaan pemilik); kotak "Cek kecocokan dulu" pada tiap alat sudah menyampaikannya. Teksnya dihapus dari konten.

- Tombol "Lihat alat" diganti "Lihat Spesifikasi dan Panduan" (`aksi.tombol.beli`; sempat lebih panjang, dipersingkat atas permintaan pemilik; kapitalisasi mengikuti permintaan pemilik). Teks ini satu sumber, jadi berlaku di panel solusi dan tombol utama kartu rencana di Panduan Saya.

- Header Detail Panduan (`/kartu/...`) dan halaman aksinya (`/aksi/...`) kini bertuliskan "Panduan" (dengan panah kembali) menggantikan logo "Transisi.", seperti halaman menu Panduan.
- Header halaman "Alat yang dibutuhkan" (`/aksi/beli/...`) bertuliskan "Pakai Alat" (`umum.headerPakaiAlat`), mengikuti nama tingkat solusinya; halaman aksi lain tetap "Panduan".

- Kepala halaman "Pakai Alat" diganti: label kecil "Alat yang dipakai ketika..." (`aksi.beli.label`) di atas, lalu judulnya adalah nama masalah panduan (mis. "Lantai licin saat basah") sehingga terbaca satu kalimat. Judul lama "Alat yang dibutuhkan" dan baris konteks "panduan · tingkat" dihapus. Saya menafsirkan "Masalahnya" sebagai judul masalah pada panduan; bila yang dimaksud teks harfiah "Masalahnya", cukup ubah `judul` di `AksiBeli.tsx`.

- Kepala halaman "Pakai Alat" kini berwarna hijau muda (`utama-muda`) dan memakai ilustrasi kelompok panduan di sisi kanan judul, seperti hero Detail Panduan. Pengaturan `kepalaPita` di kerangka halaman kini menerima `"hijau"` selain `true` (abu kehijauan).

- Hero halaman "Pakai Alat": ilustrasi dihapus; kartu alat pertama kini sedikit menimpa tepi bawah hero (pengaturan `kepalaTumpang` di kerangka halaman: hero diberi ruang bawah ekstra, isi naik 32px).

- Kotak "Cek kecocokan dulu" di halaman "Pakai Alat" berwarna kuning lembut (token `catatan`), sama dengan kotak peringatan di Detail Panduan, supaya terpisah dari hero hijau muda.

- Judul "Cek kecocokan dulu" dihapus dari kotak kuning di halaman "Pakai Alat"; kotak hanya berisi ikon papan centang dan teks pemeriksaannya.

## Data contoh (dummy) untuk alat di "Lantai licin saat basah"
- Atas permintaan pemilik, barang "Keset atau stiker anti-slip" di tingkat Pakai alat pada `bath-floor-slip` diisi data CONTOH supaya desain halaman bisa dinilai: spesifikasi umum (ditandai "(Data contoh)" di teksnya), harga "Rp 30.000 - Rp 150.000" (ditampilkan "Rp 30 rb - 150 rb"), dan tautan `https://example.com/contoh-keset-anti-slip` (alamat contoh yang memang tidak mengarah ke toko). Afiliasi tetap `false`. Semuanya WAJIB diganti dengan data asli dari survei sebelum dipakai pengguna sungguhan. Harga alat tidak memengaruhi mesin rekomendasi (hanya tampilan).
- Harga alat di halaman "Pakai Alat" kini memakai format singkat rb/jt seperti pil biaya.
- Di halaman "Pakai Alat", spesifikasi alat kini berlabel di atas dan nilai di bawahnya (rata kiri) karena teks spesifikasi bisa panjang; harga tetap satu baris dengan nilai di kanan.

## Foto produk di bawah judul
- Kolom opsional `gambar` pada `barang[]`: `{ "url": "https://...", "alt": "..." }` atau `null` (bawaan bila kolom tidak ditulis). Teks `alt` wajib mengisi bila ada `url`.
- Tampil di bawah judul produk di "Daftar alat" dan di layar Beli, lewat `src/components/GambarProduk.tsx`. Bingkai tinggi tetap (h-40), `object-contain`, `loading="lazy"`, `referrerPolicy="no-referrer"`.
- Tanpa foto: kotak polos dengan ikon kotak dan teks "Foto produk menyusul" (`aksi.beli.fotoMenyusul` di `content/ui.json`).
- Tidak ada foto yang diisi: tautan gambar tidak boleh dikarang. Semua produk contoh masih `null`.
- Foto dimuat dari alamat luar saat dilihat, jadi peramban pengguna menghubungi situs itu (alamat IP terlihat). Tanpa cookie atau data aplikasi, tetapi ini beda dari prinsip "tidak ada data keluar perangkat"; perlu keputusan tim bila foto mulai diisi (alternatif: simpan berkas kecil di `public/`).

## Menu Kontak menjadi Dukungan, tampilan dirapikan
- Nama menu dan header: "Kontak" menjadi "Dukungan" (`umum.tabDarurat`, `kontak.judul` di `content/ui.json`). Alamat tetap `/kontak` agar tautan lama tidak putus. Kalimat "lewat menu Dukungan" di panduan ikut diganti.
- Latar halaman putih (`latarPutih`), sesuai latar bawaan.
- Setiap jenis kontak punya ikon dalam kotak hijau muda (`IKON_KATEGORI` di `src/screens/Kontak.tsx`, dari lucide-react, dekoratif). Jenis kontak baru di `KategoriKontak` wajib diberi ikon, kalau tidak typecheck gagal.
- Alamat/kota memakai ikon pin dan baris sendiri, catatan di bawahnya. Tombol telepon dan WhatsApp selebar kartu, bertumpuk, supaya mudah ditekan satu tangan.
- **Dukungan tanpa merah:** nomor darurat kini dalam panel teal muda dengan ubin putih bernomor teal; "Kapan harus ke dokter atau IGD" memakai warna hangat `aksen` (terakota), bukan `bahaya`. Pesan tetap jelas lewat ikon (sirene, segitiga peringatan) dan teks, bukan warna saja. Token `bahaya` hanya dipakai untuk hapus data dan galat.
- **Revisi:** "Kapan harus ke dokter atau IGD" kembali memakai warna merah `bahaya` (permintaan pemilik). Nomor darurat tetap teal. Token `bahaya` dipakai untuk hapus data, galat, dan tanda bahaya medis.
- **Revisi warna Dukungan (permintaan pemilik):** panel "Nomor Kontak Darurat" merah (`bahaya`), kotak "Kapan harus ke dokter atau IGD" kuning lembut (token `catatan`, sama dengan catatan lain). Tetap ada ikon dan teks, jadi arti tidak bergantung pada warna.

## Menu Saya menjadi Profil
- Nama menu dan header: "Saya" menjadi "Profil" (`umum.tabSaya`, `saya.judul`). Alamat tetap `/saya`. Judul besar dan kalimat pengantar dihapus (judul tetap ada untuk pembaca layar); latar halaman putih.
- Kartu jawaban memakai baris berikon (ruangan, aktivitas, prioritas) dan status aktivitas berbentuk pil abu muda, supaya terbaca sekilas.

## Panduan Saya (setelah asesmen) dirapikan
- Kepala memakai pita hijau muda dan kartu pertama menimpa tepinya (seperti halaman Pakai Alat). Ikon bendera di depan penanda prioritas.
- Kartu kemajuan dan perkiraan biaya mendapat ikon dalam kotak hijau muda. Judul "Mulai dari sini" dan "Rekomendasi lainnya" menampilkan jumlah panduan dalam pil kecil.
- Kartu panduan (`KartuRingkas`): ikon dalam kotak hijau muda, tingkat solusi jadi baris bernomor 1-2-3 (urutan dari yang paling ringan), dan garis pemisah di atas tombol.
- **Revisi Panduan Saya:** latar halaman putih (`latarPutih`); pita kepala hijau muda dan kartu hero teal tetap.
- **Kepala Panduan Saya berlabel:** ruangan dan prioritas kini dua baris di kotak putih, masing-masing dengan ikon, label kecil ("Ruangan", "Prioritas"), nilai tebal, dan tautan ubah ("Ganti", "Ubah jawaban") di kanan. Sebelumnya teksnya lepas tanpa label. Label memakai teks yang sudah ada di `content/ui.json` (`saya.ruangan`, `saya.prioritas`).
- **"Beres" diganti "Teratasi"** di semua teks yang terlihat pengguna (kartu kemajuan, lipatan "Sudah teratasi", penanda di Jelajah, balasan setelah menandai "Sudah cukup"). Alasannya: tiap panduan membahas satu masalah, dan "Sudah cukup" berarti masalahnya teratasi, bukan panduannya selesai dibaca. Nama kunci di kode (`beres`) tidak diubah supaya tes dan struktur tetap sama. Kata "dibereskan" (ruangan yang dibereskan) tidak diubah.
- **Rincian kemajuan:** kartu kemajuan punya lipatan "Lihat rincian" berisi semua panduan, masing-masing dengan status teks (Teratasi, Masih sulit, Belum dicoba) dan tautan ke panduannya.
- **Status di rincian kemajuan jadi empat:** Teratasi (ditandai "Sudah cukup"), Masih sulit (ditandai "Masih sulit"), **Sedang dikerjakan** (belum ada hasil, tetapi sudah ada langkah checklist yang dicentang di tingkat mana pun), dan Belum dicoba. Urutan prioritas: hasil yang dicatat menang atas centang. Hanya "Teratasi" yang menambah hitungan "n dari total".
- **Status rincian berbentuk pil** di bawah judul panduan, dengan ikon kecil dan teks: Teratasi (teal muda), Masih sulit (terakota muda), Sedang dikerjakan (biru muda, token `info`), Belum dicoba (abu). Panah di kanan menandakan baris bisa diketuk.
- Pil status di rincian dipindah ke sisi kanan baris (sejajar dengan judul panduan); panah dihapus untuk menghemat lebar.
- Rincian kemajuan memakai grid dua kolom bersama (`grid-cols-subgrid`): kolom pil selebar pil terpanjang, kolom judul panduan sama lebar di setiap baris, pil rata kanan.
- **Kartu "Perkiraan biaya langkah pertama" dihapus dari Panduan Saya** (permintaan pemilik): karena langkah pertama tiap panduan selalu "Tanpa biaya", angkanya selalu Rp 0. Kalimat "Kebutuhan setelah amputasi sering berubah…" ikut hilang dari halaman itu; tanda "tunggu dulu" pada solusi permanen di kartu panduan tetap ada. Hitungan `total` di `src/domain/engine.ts` dan `formatRentang` dibiarkan (ada tesnya) bila nanti diperlukan lagi.
- **Panduan Saya: dua bagian dihapus (permintaan pemilik).** (1) Tombol lipat "Lihat yang lain nanti": saat caregiver check-in lelah, daftar panduan kini tetap tampil penuh (tidak dilipat); "Satu hal untuk hari ini" tetap menyesuaikan. (2) Kartu "Untuk Anda yang mendampingi" (kartu pendamping) tidak lagi tampil di halaman ini. Kartu pendamping masih bisa dibuka dari tombol di check-in ("Baca: mendampingi tanpa mengambil alih") dan dari daftar semua panduan. Perlu dicatat: prinsip produk 6 menyebut satu kartu pendamping; kini jalurnya lewat check-in Beranda, bukan Panduan Saya.
- **Daftar kartu panduan dihapus dari Panduan Saya** (permintaan pemilik), karena sudah digantikan "Lihat rincian" di kartu kemajuan: bagian "Mulai dari sini", "Rekomendasi lainnya", "Sudah teratasi" dan "Sedang disusun" beserta isinya, dan lipatan "Lihat yang lain nanti". Halaman kini berisi: kepala (ruangan dan prioritas), kartu kemajuan dengan rincian, "Satu hal untuk hari ini", tautan cetak dan semua panduan. Panduan yang isinya masih "sedang disusun" tidak tampil di rincian (hanya panduan yang sudah ada isinya). Komponen `KartuRingkas` tidak lagi dipakai di layar ini; berkasnya dibiarkan karena `tingkatUtama` dipakai di Detail kartu.
- Peringatan non-medis di Panduan Saya memakai gaya `polos` (teks kecil abu dengan ikon, tanpa kotak berwarna), sama dengan Detail panduan. Layar Cetak tetap memakai kotak berwarna.
- **Profil memakai pita hijau muda** (konsisten dengan Panduan Saya dan Produk Disabilitas), berisi lingkaran avatar ikon orang di tengah; kartu pertama menimpa tepi bawah pita. Tanpa judul atau teks di pita (judul tetap ada untuk pembaca layar). Latar halaman tetap putih.
- **Beranda: kartu "Lanjutkan panduan Anda" di bawah segmen pencarian** (permintaan pemilik). Urutannya kini sama untuk pengunjung baru dan yang sudah menjawab: segmen pencarian (berisi catatan cakupan dan sapaan), lalu kartu utama, lalu check-in. Bagi yang sudah menjawab, kartu tidak menimpa pita pencarian (jarak biasa).
- Beranda: tinggi pita pencarian dan tumpang tindih kartu utama kini sama sebelum dan sesudah asesmen diisi (pita dengan ruang bawah 72px, kartu menimpa sekitar 40px, bayangan `shadow-angkat`).
- Panduan Saya: urutan kartu ditukar (permintaan pemilik): "Satu hal untuk hari ini" (hero teal) di atas, lalu kartu kemajuan "n dari total masalah teratasi" dengan rincian, lalu tautan cetak dan semua panduan. Hero kini yang menimpa tepi bawah pita kepala.
- "Lihat rincian" di kartu kemajuan Panduan Saya terbuka secara bawaan (permintaan pemilik); pengguna tetap bisa menutupnya.
- Profil: judul kartu "Kebutuhan Anda" diperkecil sebesar label baris (teks kecil, tebal), ikon di sampingnya dan garis pemisah di bawahnya dihapus. Kartu "Check-in 7 hari terakhir" belum diubah.
- Revisi: "Lihat rincian" di Panduan Saya kembali tertutup secara bawaan (permintaan pemilik).
- **Dukungan: pita hijau muda di belakang bagian atas** (konsisten dengan hero halaman lain). Pita tanpa isi; panel "Nomor Kontak Darurat" menimpa sebagian tepi bawahnya, sehingga pita terlihat "setengah" di belakang panel.
- Nomor darurat di Dukungan kini berbentuk daftar baris (ikon telepon, nama, nomor tebal di kanan) dalam satu kotak putih, bukan ubin dua kolom.
- Panel "Nomor Kontak Darurat" di Dukungan berlatar putih (garis merah tipis tetap); baris nomor langsung di dalam panel tanpa kotak tambahan.
- Judul "Nomor Kontak Darurat" di Dukungan dipindah ke luar kartu: kini berada di pita hijau muda di atas kartu putih berisi daftar nomor.
- Dukungan: kartu nomor darurat menimpa pita hijau lebih dalam (sekitar 56px, sebelumnya 32px); pita diberi ruang tambahan di bawah judul supaya judul tidak tertutup.
- Revisi warna Dukungan (permintaan pemilik): elemen nomor kontak darurat (ikon sirene, garis kartu, pemisah, ikon telepon, nomor) berwarna kuning tua (token `catatan`), bukan merah. Kotak "Kapan harus ke dokter atau IGD" tetap kuning lembut, jadi kini tidak ada merah di halaman Dukungan.
- **Pita kepala gelap untuk Dukungan dan Profil** (permintaan pemilik): `Halaman` kini menerima `kepalaPita="gelap"` (latar teal `utama`, teks putih, dengan lingkaran hiasan seperti kartu hero). Judul "Nomor Kontak Darurat" putih dengan ikon sirene kuning muda (token `catatan-muda`) di atasnya. Halaman lain tetap memakai pita hijau muda.
- Revisi warna (permintaan pemilik): elemen nomor kontak darurat di Dukungan memakai warna brand teal (ikon telepon, nomor, garis kartu dan pemisah) dan ikon sirene hijau daun di pita gelap, bukan kuning. Kotak "Kapan harus ke dokter atau IGD" tetap kuning lembut.
- Pita kepala gelap (Dukungan, Profil) dibuat lebih panjang: ruang atas 32px (sebelumnya 24px) dan ruang bawah 80px (sebelumnya 48px), jadi sekitar 40px lebih tinggi. Pita hijau muda di halaman lain tidak berubah.
- Jarak di pita gelap dirapikan: ruang di atas judul/avatar dan jarak judul/avatar ke kartu sama-sama 24px, di Dukungan dan Profil (sebelumnya judul sekitar 48px dari kartu).
- Jarak judul/avatar ke kartu di pita gelap dinaikkan menjadi 32px (ruang di atas tetap 24px).
- Pita gelap: ruang di atas judul/avatar disamakan dengan jaraknya ke kartu, sama-sama 32px.
- Kartu nomor darurat: padding atas dan bawah kartu dikurangi (16px menjadi 4px); jarak ke baris pertama dan terakhir kini ditentukan tinggi baris (minimal 56px).
- **Panduan umum (sebelum asesmen, daftar semua panduan) memakai pita kepala gelap** seperti Dukungan dan Profil. Kolom pencarian dipindah ke dalam pita; kartu kelompok pertama menimpa tepi bawahnya, jarak kolom cari ke kartu 32px sama dengan jarak ke tepi atas pita. Halaman Produk Disabilitas (filter alat) tidak berubah.
- Panduan umum: jarak kolom cari ke kartu pertama diperkecil menjadi 16px (sebelumnya 32px).
- Panduan umum: ruang di atas dan di bawah kolom cari di dalam pita disamakan, 12px (sebelumnya 32px atas dan 16px bawah).
- **Perbaikan jarak panduan umum:** kartu kelompok pertama ternyata membawa margin atas 24px (aturan `first:mt-0` tidak berlaku karena ada elemen kosong `aria-live` di depannya), sehingga jarak kolom cari ke kartu sebenarnya 36px, bukan 12px. Diganti `first-of-type:mt-0`; catatan kuning cakupan diberi jarak bawah supaya tidak menempel ke kartu. Kini ruang atas dan bawah kolom cari sama-sama 12px.
- Panduan umum: ruang atas dan bawah kolom cari dinaikkan menjadi 20px (sama).
- **Bilah atas (title bar) ikut warna pita gelap** di Panduan, Dukungan, dan Profil: latar teal `utama`, teks putih, tanpa garis bawah, supaya menyatu dengan pita di bawahnya. Cincin fokus di bilah itu diputihkan (cincin teal tidak terlihat di atas teal). Titik di logo memakai hijau daun. Halaman lain tetap berbilah putih.
- Bilah atas di halaman berpita gelap berubah putih (dengan garis bawah) begitu halaman digulir lebih dari 8px, dan teal lagi bila kembali ke paling atas. Perubahan warna beranimasi singkat (150 ms), dimatikan bila pengguna meminta gerak dikurangi.
- **Lingkaran hiasan pita gelap diganti versi kecil (`HiasanPita`)**: lingkaran besar milik kartu hero terpotong garis lurus tepi atas pita dan tertutup kartu yang menimpa tepi bawahnya, jadi tampak terpotong. Versi baru lebih kecil dan berada di bagian atas pita, hanya tepi layar yang memotongnya. Kartu hero tetap memakai lingkaran besar (`HiasanLingkaran`).
- **Revisi lingkaran hiasan pita gelap (permintaan pemilik):** kembali ke ukuran besar seperti kartu hero (bukan versi kecil), tetapi ditempelkan ke bawah pita (`HiasanPita`), supaya tidak terpotong garis lurus di bawah bilah atas. Sisi bawahnya tertutup kartu yang menimpa pita.
- Lingkaran hiasan pita gelap: dua lingkaran di kanan kembali saling menimpa (pada versi rata bawah sebelumnya tumpang tindihnya tersembunyi di balik kartu). Ukuran diperkecil menjadi 128/96/112px agar tidak lebih tinggi dari pita terpendek (sekitar 140px), dan lingkaran kecil di kanan diangkat 24px dari dasar.
- Lingkaran sedang di kanan pita gelap digeser sedikit ke kiri bawah (20px ke kiri, 12px ke bawah).
- **Menu Pindai (antara Panduan dan Dukungan): pengecualian sadar atas "tanpa server / tidak ada data keluar perangkat" (permintaan pemilik).** Foto kamar mandi dikecilkan di perangkat lalu dikirim sekali ke fungsi Vercel `api/pindai.ts` (alamat yang sama dengan aplikasi), yang meneruskannya ke Google Gemini (tingkat gratis). Foto tidak disimpan oleh aplikasi dan hanya ada di memori layar. Pengecualian ini hanya untuk fitur ini; fitur lain tetap tanpa server. Bila fungsi tidak tersedia (404 atau `GEMINI_API_KEY` belum diatur) atau layanan gagal, pengguna diarahkan ke ceklis "nilai sendiri dari foto".
- Pindai: model hanya mengamati per hal (`ramah` / `perhatian` / `tidak_jelas`); skor dihitung aplikasi (`src/domain/pindai.ts`). Ambang (`MIN_JELAS=4`, 80% dan 50%) adalah heuristik awal buatan saya, bukan angka klinis, dan perlu ditinjau ahli. Hasil tidak disimpan di localStorage (pilihan paling sederhana), jadi tidak ada yang perlu dihapus oleh "Hapus data saya". Lencana "Draf" tidak ditampilkan (sesuai keputusan PoC sebelumnya); catatan "perkiraan awal, bukan penilaian ahli" selalu tampil.
- **Gaya ilustrasi solusi diganti (permintaan pemilik): petunjuk perabot hitam-putih** (garis tinta tegas, isian putih, panah, garis ukur), dikerjakan satu kartu demi satu kartu. Mulai dari `bath-door`; `bath-floor-slip` sudah disamakan ke gaya baru (gaya lama berwarna dihapus). Bahan gambar ada di `src/components/GambarTeknis.tsx`.
- **Pengecualian atas "tanpa gambar orang":** boleh menggambar pengguna kursi roda yang aktif dan mandiri (tampak samping, tanpa wajah). Tampak atas memakai ikon kursi roda saja.
- **Pengecualian atas "jangan mengarang angka" untuk ilustrasi:** angka di gambar diambil dari acuan umum standar ADA 2010 (bukaan pintu bebas 81 cm; tinggi gagang 86-122 cm; lingkaran putar kursi roda 152 cm), disimpan di `content/ui.json` (`ilustrasi.angka`), dan selalu disertai catatan "acuan umum, bukan penilaian ahli". Angka ini belum ditinjau ahli dan saya tidak bisa memverifikasinya terhadap dokumen resmi di sini. Gambar berangka tidak dikunci flag `TAMPILKAN_ANGKA_DRAF`, sesuai permintaan pemilik.
- Ilustrasi `bath-transfer-toilet`: angka di gambar (ruang samping kloset ≈ 90 cm, tinggi kloset 45–50 cm) diambil dari field `ukuran` di kartu itu sendiri, bukan dari ADA, jadi catatan di bawah gambarnya berbeda ("mengikuti isi panduan ini dan belum ditinjau ahli"). Daftar `BERANGKA` di `IlustrasiSolusi.tsx` menandai sumber angka tiap gambar (`ada` atau `kartu`).
- Ilustrasi `care-assist-transfer`: satu-satunya gambar dengan dua orang (pengguna kursi roda dan caregiver, komponen `Pendamping`). Caregiver berdiri tegak dengan tangan terbuka dan tidak menyentuh pengguna; balon tanya "?" menggambarkan "tanyakan dulu". Teknik pindah yang spesifik sengaja tidak digambar karena harus berasal dari terapis (aturan kartu).
- **Catatan di bawah ilustrasi solusi diganti penjelasan gambar (permintaan pemilik).** Catatan seragam "Angka di gambar adalah acuan umum..." dihapus (kunci `catatanAngka` dan `catatanAngkaKartu`). Kini tiap gambar punya penjelasan sendiri di `content/ui.json` (`ilustrasi.gambar`, kunci `idKartu:tingkat`), yang juga dibaca pembaca layar karena gambarnya sendiri disembunyikan. Pada gambar berangka, sumber angka disebut di dalam penjelasan ("acuan umum (ADA 2010)" atau "mengikuti isi panduan ini dan belum ditinjau ahli"). Tes `tests/ilustrasi.test.ts` memastikan tiap gambar punya penjelasan dan tiap pilihan solusi punya gambar.
- **Fitur Pindai dipindah dari Cloudflare Worker ke fungsi Vercel** (pemilik sudah memakai Vercel): `api/pindai.ts`, kunci di variabel lingkungan `GEMINI_API_KEY` (Vercel: Settings > Environment Variables; lokal: `.env.local`). Folder `worker/` dihapus. Fungsi menolak panggilan dari asal lain (cek header Origin vs Host), mencoba ulang dan beralih model cadangan saat Gemini sibuk (503/429), dan hanya menerima gambar sampai sekitar 1,5 MB. `npm run dev` menjalankan fungsi itu langsung lewat plugin `apiLokal` di `vite.config.ts`. Belum ada pembatas laju per pengguna; sebaiknya tambahkan aturan rate limit di Vercel Firewall sebelum dipakai umum.

## Ilustrasi perbaikan AI dari foto asli — dicoba, lalu dibatalkan (kuota 0 di tier gratis)
- Sempat dibuat tombol opsional yang menyunting foto asli pengguna dengan Gemini image generation (`api/pindai-gambar.ts`, `src/lib/pindaiGambar.ts`). Dicoba dengan kunci API sungguhan: Gemini membalas 429 dengan `limit: 0` untuk `generate_content_free_tier_requests` pada model gambar — artinya tier gratis **tidak menyertakan model image generation sama sekali** (bukan soal "kebanyakan coba", kuotanya nol secara permanen untuk akun gratis).
- **Dicek juga apakah ada jalan gratis lewat Claude atau ChatGPT:** Claude tidak punya kemampuan image generation/editing di API-nya (hanya bisa membaca gambar, tidak menghasilkannya). ChatGPT/OpenAI API bisa, tapi tetap berbayar (perlu billing terdaftar, tidak ada tier gratis yang stabil). Jadi tidak ada penyedia API yang benar-benar gratis untuk fitur ini; satu-satunya yang "gratis" adalah kuota bawaan aplikasi chat konsumen (ChatGPT/Gemini app), yang terpisah dari API developer yang dipakai aplikasi ini.
- **Fitur ini dihapus** (`api/pindai-gambar.ts`, `src/lib/pindaiGambar.ts`, teks `ilustrasiPerbaikan` di `ui.json`/`schema.ts`), diganti pendekatan di bawah yang tidak butuh model berbayar sama sekali.

## Denah kamar mandi mengikuti tata letak foto (pengganti ilustrasi AI di atas)
- **Pendekatan:** daripada menyunting foto asli (butuh model image generation berbayar) atau menampilkan skema generik yang sama untuk semua orang (`IlustrasiKamarMandiIdeal`, dihapus sebelumnya), model **teks** Gemini yang sudah dipakai gratis untuk fitur Pindai (`gemini-3.1-flash-lite`, tanpa biaya tambahan sama sekali karena satu panggilan yang sama) sekarang juga diminta menebak **zona kasar** empat benda: pintu, kloset, wastafel, area mandi.
- **Zona, bukan ukuran:** hanya grid 3×3 (kiri/tengah/kanan × depan/tengah/belakang, dari sudut pandang orang berdiri di pintu) ditambah "tidak_terlihat". Sengaja tidak berupa koordinat/jarak supaya tidak melanggar aturan "jangan mengarang ukuran" — ini cuma perkiraan arah untuk sketsa, bukan ukuran sebenarnya, dan `ilustrasiCatatan`/`denahCatatan` selalu menyebut ini.
- **Skema baru** (`api/pindai.ts`): field `objek` ditambah ke skema respons Gemini yang sudah ada (bukan panggilan baru). `src/domain/pindai.ts` menyimpan tipe/konstanta murni (`POSISI_DENAH`, `OBJEK_DENAH`, `posisiPersenDenah`, `POSISI_BAWAAN`), dipakai bersama oleh `api/pindai.ts` dan `src/lib/pindai.ts`/komponen (bukti bahwa impor lintas folder `api/` → `src/` sudah berjalan sejak `api/pindai.ts` lama mengimpor `content/ui.json`).
- **Jalur "nilai sendiri dari foto" (ceklis manual, tanpa panggilan Gemini) dan jalur AI yang tidak melihat suatu benda** sama-sama memakai `POSISI_BAWAAN`.
- **Belum diverifikasi:** seberapa akurat Gemini menebak zona benda dari foto sungguhan (belum dicoba dengan foto asli, baru lewat `VITE_PINDAI_MOCK`). Bila sering salah besar, pertimbangkan menyembunyikan denah saat semua `objek` bernilai "tidak_terlihat" alih-alih selalu jatuh ke tata letak bawaan.

## Denah digambar menempel dinding (bukan lagi ikon bulat di grid)
- **Masukan pemilik:** denah versi ikon-bulat-di-grid "sangat tidak mirip" dengan foto. Diganti komponen `src/components/DenahKamarMandi.tsx` (dipisah dari `PindaiFoto.tsx` karena sudah cukup besar) yang menggambar bentuk benda tampak atas, bukan sekadar badge bulat:
  - **Kloset:** mangkuk oval + tangki persegi menempel ke dinding terdekat (sisi tangki mengikuti dinding: kiri/kanan/depan/belakang), garis pegangan (status `pegangan`) digambar di sisi mangkuk yang menghadap ruangan.
  - **Wastafel:** konter persegi + titik keran menempel dinding terdekat.
  - **Area mandi:** bukan satu titik, tapi **zona memanjang sepanjang dinding** (diarsir diagonal) dengan tanda shower di tengahnya; badge "jangkauan" (keran/shower mudah dijangkau) ditempel di tengah zona itu, bukan digeser sembarangan dari suatu titik.
  - **Pintu:** celah di garis dinding + daun pintu terbuka + lintasan ayun putus-putus, menempel ke dinding terdekat dari posisi yang ditebak (bukan selalu di kiri seperti versi lama).
  - **Fungsi `dindingDari`/`titikDinding`:** posisi grid 3×3 (`PosisiDenah`) diterjemahkan ke "dinding terdekat" (kiri/kanan/depan/belakang) + koordinat sepanjang dinding itu, supaya semua benda tergambar menempel dinding seperti denah arsitektur sungguhan, bukan melayang di titik grid. `tengah_tengah` dianggap menempel dinding belakang (umum untuk kloset yang berdiri agak ke tengah ruangan).
  - **Viewbox dibuat memanjang** (`200×300`, bukan persegi) meniru proporsi kamar mandi sempit-memanjang seperti pada foto contoh.
- **`POSISI_BAWAAN`** (dipakai juga oleh `hasilTiruan` mock, lihat bagian "Satu foto contoh untuk VITE_PINDAI_MOCK" di bawah) disamakan nilainya dengan tata letak foto `dev/mock-foto.jpg` (pintu kiri-depan, kloset tengah-tengah, wastafel kiri-tengah, area mandi kanan-belakang) supaya mode mock langsung menampilkan denah yang representatif, tidak perlu konstanta terpisah.
- **Masih perkiraan, bukan jiplakan foto:** karena posisi dari Gemini tetap hanya grid 3×3 kasar (lihat alasan "jangan mengarang ukuran" di atas), gambar ini tidak akan pernah 100% identik dengan denah ruangan asli — tapi sekarang setidaknya terlihat seperti denah kamar mandi sungguhan (benda menempel dinding, berbentuk sesuai jenisnya), bukan titik-titik mengambang. Belum dicoba dengan tebakan AI sungguhan dari foto asli.

## Satu foto contoh untuk VITE_PINDAI_MOCK
- **Permintaan pemilik:** mode mock selalu memakai satu foto kamar mandi contoh (diunggah pemilik), supaya hasil ujicoba (termasuk perkiraan posisi denah) bisa dibandingkan dari foto yang sama setiap kali, bukan foto acak yang dipilih.
- **Berkas foto (`dev/mock-foto.jpg`) sengaja tidak di-commit** (ditambahkan ke `.gitignore`, folder `dev/`): foto itu berwatermark akun Instagram lain (`@qeelacasa`), kemungkinan bukan milik proyek ini, jadi berisiko soal hak cipta bila ikut masuk riwayat git/dibagikan. Bila pemilik ingin dev lain bisa memakai mode mock, perlu foto pengganti yang hak pakainya jelas, diletakkan manual di `dev/mock-foto.jpg`.
- **Middleware dev baru** (`fotoMockPindai` di `vite.config.ts`, `apply: "serve"` seperti `apiLokal`): menyajikan berkas itu di `/__mock/foto-pindai.jpg` hanya saat `npm run dev`, tidak pernah ikut ke `vite build`/`dist/` karena bukan di `public/`.
- **`pilih()` di `PindaiFoto.tsx`:** saat `VITE_PINDAI_MOCK=true`, berkas yang sungguhan dipilih pengguna (lewat tombol Ambil foto/Pilih dari galeri) diabaikan dan diganti blob dari middleware itu sebelum dikecilkan (`kecilkanFoto`). Tombol tetap harus ditekan (supaya alur dan animasi pindai tetap bisa diuji), hanya isinya yang diganti.
- **`kecilkanFoto`** (`src/lib/foto.ts`) parameternya dilonggarkan dari `File` ke `Blob` (`File` adalah `Blob`) supaya blob hasil `fetch` bisa langsung dipakai tanpa konversi tambahan.

## Posisi area mandi: bias "tinggi pemasangan" dikira "jauh dari pintu"
- **Dibandingkan ke hasil claude.ai chat untuk foto yang sama** (diminta pemilik): posisi pintu/wastafel/kloset sudah cocok, tapi area mandi meleset — saya (dan kemungkinan juga AI Gemini nantinya) cenderung menilai area mandi "di belakang" karena kepala shower dipasang tinggi dekat langit-langit, padahal tingginya di dinding tidak berarti jauh dari pintu. Lantai/area basahnya sendiri biasanya lebih ke tengah ruangan.
- **Perbaikan generik** (bukan ditempel ke satu foto): instruksi di `PROMPT` (`api/pindai.ts`) ditambah kalimat eksplisit supaya Gemini menilai posisi dari **tapak lantai** benda, bukan dari ketinggian di dinding. `POSISI_BAWAAN.area_mandi` (tata letak cadangan, dipakai juga di mode mock) diubah dari `kanan_belakang` ke `kanan_tengah` supaya zona shower (yang memang digambar memanjang, bukan satu titik) mencakup area tengah-ke-belakang, bukan mepet pojok belakang saja.
- **Diputuskan untuk TIDAK meniru** angka-angka di hasil claude.ai chat pembanding itu (±1,6×2,2 m, Ø150 cm, tinggi grab bar 70-80 cm, dudukan 45-50 cm, dengan keterangan "posisi perabot mengikuti fotomu"): itu melanggar aturan "jangan mengarang ukuran" di `CLAUDE.md` — ukuran ruangan sungguhan tidak mungkin diketahui dari satu foto tanpa alat ukur, dan menyajikannya seolah "sesuai fotomu" menyesatkan, apalagi untuk konteks keselamatan disabilitas. Pengecualian yang sudah ada di proyek ini (`ilustrasi.angka`, acuan ADA 2010, lihat bagian "Gaya ilustrasi solusi diganti") hanya untuk angka acuan umum berlabel jelas "acuan umum, bukan penilaian ahli", bukan untuk angka spesifik per-ruangan yang diklaim mengikuti foto. Belum ditambahkan ke denah ini; bila pemilik ingin angka acuan umum (mis. diameter putar kursi roda) ditambahkan, perlu keputusan eksplisit dan disclaimer yang sama seperti `ilustrasi.angka`.
- **Revisi posisi kloset:** pemilik membandingkan lagi ke denah acuan tadi dan minta kloset di sudut kanan (bukan tengah) dengan wastafel di sebelahnya (kiri). `POSISI_BAWAAN.kloset` diubah dari `tengah_belakang` ke `kanan_belakang`; `area_mandi` tetap `kanan_tengah` (dinding yang sama dengan kloset, kedalaman di bawahnya, menyambung seperti di denah acuan).
- **Dites dengan Gemini asli** (bukan dari sandbox saya — `fetch failed` ternyata juga terjadi sementara di komputer pemilik, lalu berhasil saat dicoba ulang; kemungkinan gangguan jaringan sesaat, bukan bug kode): hasil tebakan AI menaruh wastafel di `kiri_tengah` dan kloset di `tengah_belakang` — beda baris (kedalaman), padahal menurut pemilik keduanya **sejajar** (sama-sama di dinding belakang, cuma beda kolom; dikonfirmasi lewat gambar isometrik pembanding dari claude.ai chat yang menyebut eksplisit "ruang di kiri toilet sempit karena ada wastafel di situ" — artinya bersebelahan, bukan berbeda kedalaman).
- **Perbaikan generik lagi** (bukan ditempel ke satu foto): instruksi di `PROMPT` ditambah — bila dua benda jelas menempel **dinding yang sama**, beri nilai depan/tengah/belakang yang **sama** kecuali ada jarak nyata di antaranya; jangan biarkan bentuk salah satu benda (mis. tangki kloset yang menjorok) membuatnya tampak lebih jauh dari tetangganya di dinding yang sama. Alasan: tangki kloset yang menjorok kemungkinan membuat AI mengira kloset "lebih ke belakang" dibanding wastafel padahal keduanya di dinding yang sama.
- **Belum diverifikasi ulang** setelah perbaikan prompt ini (butuh kunci Gemini sungguhan dan jaringan yang hidup saat dicoba, yang tidak selalu tersedia di sandbox pengembangan). Pemilik perlu mencoba lagi dan melaporkan hasilnya.
- **Hasil tes ulang:** instruksi "dinding yang sama → kedalaman sama" berhasil di sisi Gemini (wastafel dan kloset sama-sama dapat baris "belakang"), TAPI tetap tidak sejajar di gambar. Ternyata bukan AI-nya yang salah, melainkan **bug di kode render** (`dindingDari` di `DenahKamarMandi.tsx`): fungsi itu mengecek kolom (kiri/kanan) **sebelum** baris (depan/belakang), jadi benda dengan kolom "kiri" selalu ditarik ke dinding kiri walau barisnya sama dengan benda lain yang kolomnya "kanan"/"tengah" (yang ditarik ke dinding belakang) — dua benda dengan baris sama berakhir di DINDING YANG BERBEDA, makanya tidak pernah sejajar betapa pun tepatnya tebakan AI.
- **Perbaikan:** prioritas dibalik — **baris menang lebih dulu** (depan/belakang → dinding itu), kolom cuma dipakai kalau baris "tengah" (ambigu, dianggap dinding samping). Ini perbaikan kode, bukan prompt, jadi hasilnya deterministik: dua benda dengan baris sama **sekarang pasti** digambar sejajar di dinding yang sama, tidak bergantung tebakan AI lagi. Diverifikasi lewat mode mock (render langsung, tanpa panggilan AI): wastafel dan kloset kini sejajar persis di dinding belakang, kloset di pojok kanan, area mandi di dinding kanan pada kedalaman berbeda (tidak menumpuk).
- **Belum tentu konsisten tiap panggilan Gemini:** posisi kloset-di-pojok-kanan vs area-mandi tetap bergantung tebakan AI untuk foto itu; foto yang sama bisa dapat pembacaan baris/kolom sedikit berbeda tiap dipanggil (ini bukan bug, melainkan sifat tugas visual berbasis AI — tidak bisa dijamin identik 100% tiap kali, hanya bisa dikurangi biasnya).
- **Dicoba lagi, masih tidak sejajar** (wastafel dibaca "tengah" sementara kloset "belakang"), padahal `temperature: 0` sudah dipasang sejak awal (permintaan paling tegas ke Gemini supaya tidak "mengarang kreatif") dan prompt instruksinya tidak berubah sejak percobaan sebelumnya. Ini menandakan posisi wastafel memang berada di titik yang ambigu bagi model untuk foto ini — `temperature: 0` mengurangi variasi tapi tidak menjaminnya nol, terutama untuk penilaian yang pas di perbatasan.
- **Perbaikan tambahan (atas permintaan pemilik, "coba sekali lagi"):** instruksi prompt ditambah supaya Gemini membayangkan **satu denah ruangan utuh** dan menentukan dinding tiap benda dulu secara bersamaan, baru mengisi keempat posisi sekaligus secara konsisten dengan denah itu — bukan menilai tiap benda satu per satu secara terpisah (yang diduga jadi sumber inkonsistensi antar panggilan). **Tidak ada jaminan ini menghilangkan variasi sepenuhnya**; ini percobaan mitigasi lanjutan, bukan perbaikan pasti. Belum diverifikasi hasilnya (perlu dicoba ulang oleh pemilik).
- **Efek samping dari instruksi "dinding sama = kedalaman sama":** dicoba lagi, kloset dan area mandi malah dapat posisi grid yang **persis identik** (`kanan_belakang` untuk keduanya) sehingga tergambar numpuk sempurna. Instruksinya "berhasil" terlalu jauh — AI menyamakan keduanya bukan cuma sebaris, tapi satu kotak persis.
- **Keputusan: pindah dari "tambal lewat prompt" ke jaring pengaman di kode.** Prompt sudah berkali-kali diubah dan tiap perbaikan menimbulkan efek samping baru (bias ketinggian → bias "dinding sama" → tabrakan posisi); menambal terus lewat kata-kata tidak akan pernah menjamin hasil. Ditambahkan `selesaikanTabrakanDenah` (fungsi murni, `src/domain/pindai.ts`, ada tesnya) yang dipanggil di `bacaRespons`: bila dua benda kebetulan dapat kotak grid yang persis sama, yang berprioritas lebih rendah digeser satu baris ke arah depan (kolom tetap). Urutan prioritas (siapa yang tidak digeser): pintu, kloset, wastafel, area mandi — area mandi paling fleksibel digeser karena sudah digambar sebagai zona memanjang, bukan satu titik, jadi pergeseran kecil tidak terlihat aneh. Ini **menjamin tidak pernah numpuk** apa pun jawaban AI-nya, tidak bergantung ketepatan prompt lagi.
- Jalur `POSISI_BAWAAN` (ceklis manual, mode mock) tidak perlu fungsi ini karena empat nilainya sudah dijamin berbeda secara statis.
- **Dicoba lagi, kloset dan area mandi tetap numpuk** — ternyata bukan soal "tabrakan kotak grid yang persis sama" (yang sudah dijamin tidak terjadi), tapi sumber masalah yang lebih dalam: `dindingDari` (fungsi render yang menebak dinding dari grid kiri/tengah/kanan × depan/tengah/belakang) **tidak bisa membedakan** "pojok kanan-belakang milik dinding kanan" dari "pojok kanan-belakang milik dinding belakang". Setelah baris diprioritaskan (perbaikan sebelumnya), SEMUA benda dengan baris "belakang" otomatis ditarik ke dinding belakang yang sama — termasuk area mandi yang sebenarnya ada di dinding KANAN, bukan dinding belakang. Akibatnya kloset (benar-benar di dinding belakang) dan area mandi (seharusnya di dinding kanan, tapi ikut ditarik ke dinding belakang) sama-sama digambar menempel dinding belakang, dengan rentang X yang tumpang tindih → numpuk. Prioritas kolom-dulu (versi sebelum itu) punya masalah simetris yang sama untuk kasus lain (lihat kasus wastafel-kloset). **Kesimpulan: grid 3×3 kiri/tengah/kanan × depan/tengah/belakang secara struktural ambigu untuk posisi pojok — tidak ada urutan prioritas (baris dulu atau kolom dulu) yang benar untuk semua kasus,** karena kode harus MENEBAK dindingnya dari zona, dan tebakan itu konsisten salah untuk kombinasi benda tertentu.
- **Perombakan arsitektur (bukan tambal lagi):** sistem grid kiri/tengah/kanan × depan/tengah/belakang **dihapus total**, diganti model yang secara eksplisit memisahkan dua hal yang sebelumnya digabung jadi satu zona: `dinding` (`kiri`/`kanan`/`depan`/`belakang`/`tidak_terlihat`, dinding mana yang ditempel — **diminta langsung dari AI**, bukan ditebak) dan `posisi` (lokasi di sepanjang dinding itu: `depan`/`tengah`/`belakang` untuk dinding kiri/kanan, atau `kiri`/`tengah`/`kanan` untuk dinding depan/belakang). Ini menghilangkan sumber bug-nya di akar: kode tidak lagi menebak dinding sama sekali, jadi tidak ada lagi kombinasi yang bisa salah ditebak.
  - `src/domain/pindai.ts`: `DINDING_DENAH`, `DINDING_OBJEK`, `POSISI_DI_DINDING`, interface `PosisiObjek` (`{dinding, posisi}`, dinding bisa "tidak_terlihat") dan `LetakDenah` (sama tapi dinding dijamin bukan "tidak_terlihat", dipakai untuk `POSISI_BAWAAN`). `posisiPersenDenah` dan `selesaikanTabrakanDenah` ditulis ulang untuk bentuk baru ini (tes diperbarui).
  - `api/pindai.ts`: prompt poin 3 ditulis ulang total — minta Gemini menentukan dinding tiap benda dulu (bukan zona 3×3), baru posisi di sepanjang dinding itu; skema JSON `objek` sekarang berisi objek bersarang `{dinding, posisi}` per benda, bukan satu string zona.
  - `src/components/DenahKamarMandi.tsx`: `dindingDari`/`titikDinding` yang dulu MENEBAK dinding dari grid dihapus; `titikDinding` sekarang langsung menerima `{dinding, posisi}` dari AI, tidak ada lagi logika tebak-menebak.
  - **Diverifikasi lewat mode mock** (render murni di browser, screenshot): wastafel-kloset sejajar di dinding belakang, kloset di pojok kanan, area mandi benar-benar di dinding kanan (bukan ikut ke dinding belakang), tidak ada yang numpuk.
  - **Belum diverifikasi dengan Gemini sungguhan** setelah perombakan ini (field skema berubah bentuk, jadi respons API juga berubah bentuk) — perlu dicoba ulang oleh pemilik dengan foto asli sebelum dianggap final.
- **Dikonfirmasi dengan Gemini sungguhan: posisi dinding sudah benar** (wastafel-kloset sejajar di dinding belakang, area mandi terpisah di dinding kanan). Perombakan arsitektur di atas berhasil.
- **Perbesar proporsi benda** (permintaan pemilik: "area kamar mandinya terlihat luas sekali"): benda digambar terlalu kecil relatif ke ukuran ruangan, bukan soal posisi. Diperbesar murni untuk proporsi visual (bukan ukuran sebenarnya — tetap tidak ada angka dicantumkan, konsisten dengan aturan "jangan mengarang ukuran"): jarak benda dari dinding (22→26), panjang ayunan pintu (42→56), mangkuk kloset (rx/ry 13/16→17/21) dan tangkinya, konter wastafel (22×32→28×40), zona shower (110×46→140×58), lingkaran putar kursi roda (r 44→56). Diverifikasi lewat mode mock (screenshot): ruangan terasa lebih "terisi", tidak lagi terasa kosong/luas.
- **Rapatkan jarak antar benda sejajar** (permintaan pemilik: "kloset dan wastafel masih terlihat jauh" walau sudah sejajar dinding): posisi "kiri" dan "kanan" di sepanjang dinding (dipakai PERSEN_KIRI_KANAN/PERSEN_DEPAN_BELAKANG) sebelumnya mepet ke pojok (18%/82% dari lebar dinding), jadi dua benda yang sama-sama "kiri" vs "kanan" di dinding yang sama kelihatan terpisah hampir selebar penuh dinding. Dirapatkan ke 28%/72% supaya jaraknya lebih wajar (benda berdampingan, bukan di dua ujung ruangan) sambil tetap jelas beda posisi kiri-kanannya. Tidak memengaruhi jarak benda dari dinding itu sendiri (konstanta terpisah, `JARAK_DINDING`, tidak diubah).
- **Perbesar lagi** (permintaan pemilik, "masih cukup lapang" setelah pembesaran pertama): seluruh ukuran dinaikkan lagi ~25-30% — `JARAK_DINDING` 26→35, ayunan pintu 56→68, mangkuk kloset rx/ry 17/21→22/27 dan tangkinya 16×28→20×34, konter wastafel 28×40→36×50, zona shower 140×58→170×72, lingkaran putar 56→68. Diverifikasi lewat mode mock (screenshot zoom): tidak ada benda yang keluar garis dinding, ruangan terasa jauh lebih "terisi" seperti kamar mandi kecil sungguhan (zona shower bahkan kini tumpang tindih sebagian dengan lingkaran putar — wajar untuk kamar mandi sempit, bukan bug).
- **Efek samping pembesaran di atas: zona shower (panjang 170) jadi cukup panjang untuk menabrak pojok dinding belakang**, tempat kloset/wastafel biasa digambar (dikonfirmasi lewat screenshot pemilik: mangkuk kloset sedikit tumpang tindih dengan sudut zona shower). Perbaikan: panjang zona dikecilkan sedikit (170→150) dan ditambah jarak aman dari kedua ujung dinding (`JARAK_POJOK_BELAKANG=65`, `JARAK_POJOK_DEPAN=35`, total+panjang zona pas 280 = tinggi ruangan interior, jadi tidak mungkin lagi menabrak pojok belakang/depan). Ini hanya berlaku untuk zona di dinding kiri/kanan (kasus yang dilaporkan); zona di dinding depan/belakang belum diberi jarak aman serupa karena belum ada laporan tabrakan di situ.

## Denah dan "Rincian per hal" diberi nomor yang cocok
- **Permintaan pemilik:** hubungkan denah dengan daftar "Rincian per hal" lewat nomor, supaya terlihat korelasinya. Diputuskan hanya 5 dari 7 hal yang diberi nomor (pegangan, area mandi, pintu, wastafel, jangkauan) — "lantai" dan "ruang" tidak diberi nomor karena mewakili seluruh ruangan (tekstur lantai, lingkaran putar), bukan satu titik di denah; warnanya saja sudah cukup jelas.
- **`nomorItemDenah`** (fungsi murni, `src/domain/pindai.ts`, ada tesnya): memberi nomor urut 1..n mengikuti urutan `t.item` di konten, melewati "lantai"/"ruang". Dihitung sekali sebagai `NOMOR_ITEM` (diekspor dari `DenahKamarMandi.tsx`) dan dipakai ulang oleh `PindaiFoto.tsx` untuk baris "Rincian per hal", supaya satu sumber angka (tidak mungkin dua tempat beda nomor).
- **`NomorBadge`** (lingkaran putih bernomor, warna border/teks ikut status) ditambahkan di titik masing-masing benda di denah: pintu (ujung ayunan pintu), pegangan (digeser ke arah ruangan dari mangkuk kloset lewat `dorongKeDalam`), wastafel (di luar tepi konter), area mandi dan jangkauan (dua titik berbeda di dalam zona shower, supaya tidak dikira satu hal).
- **Efek samping awal:** badge pegangan dan badge area mandi sempat **saling menumpuk** di pojok dinding belakang-kanan (keduanya secara independen diletakkan dekat pojok itu). Diperbaiki dengan memindah badge area mandi ke ujung zona yang dekat **depan** (bukan dekat belakang) — pegangan biasanya dekat ujung belakang zona, jangkauan di tengah, area mandi di ujung depan, jadi ketiganya tersebar sepanjang zona alih-alih menumpuk di satu sudut. Diverifikasi lewat mode mock (screenshot zoom): keenam badge (1-6) terpisah jelas, tidak ada yang tumpang tindih.
- Teks `denahCatatan` di `ui.json` diperbarui, menambahkan kalimat "nomornya cocok dengan nomor di 'Rincian per hal' di bawah".
- Badge nomor di "Rincian per hal" ditandai `aria-hidden` (dekoratif, murni korelasi visual untuk pengguna yang bisa melihat kedua elemen sekaligus; pembaca layar tetap membaca nama hal seperti biasa tanpa angka yang tidak berkonteks, karena denahnya sendiri juga `aria-hidden`).
- **Dua badge terlihat "lebih besar dan dobel" (pemilik):**
  - **Pintu (nomor 3):** badge-nya ditaruh persis di ujung ayunan pintu — titik yang sama di mana garis daun pintu DAN garis lintasan ayun putus-putus bertemu. Dua garis bertemu persis di belakang satu lingkaran membuatnya terlihat "lebih ramai"/besar. Diperbaiki: badge digeser lebih jauh ke ruangan (fungsi `dorongKeDalam`, jarak 46) dari titik tempel dinding, bukan dari ujung ayunan — sudah pasti bersih dari kedua garis itu (diverifikasi lewat perhitungan koordinat: posisi baru selalu melewati ujung ayunan, tidak collinear dengan daun pintu).
  - **Wastafel (nomor 4):** ada titik kecil (keran) yang digambar **warna status yang sama** dengan badge nomor, hanya ~16 satuan darinya — dari jauh terlihat seperti dua lingkaran sewarna yang saling menempel ("dobel"). Diperbaiki: titik keran diberi warna netral (`text-garisKontrol`, bukan ikut status) dan jarak badge dari titik itu diperbesar (16→24), supaya jelas dua elemen berbeda, bukan satu bentuk.
  - Diverifikasi lewat mode mock (screenshot zoom): kedua badge sekarang bersih, satu lingkaran bernomor saja, konsisten dengan badge lain.
- **Nomor "3" (pintu) masih sulit dibaca setelah perbaikan di atas** (pemilik). Penyebabnya baru: `NomorBadge` sendiri (radius 9, teks 10px) tidak ikut membesar waktu seluruh benda lain di denah diperbesar ~60-70% sebelumnya (lihat "Perbesar lagi") — jadi badge jadi relatif lebih kecil dibanding benda di sekitarnya, dan angka berkelok seperti "3" kehilangan keterbacaan duluan dibanding angka sederhana (1,2,4,5). Diperbaiki: `NomorBadge` diperbesar (radius 9→12, teks 10→13px, border 1.5→2), beberapa jarak dorong (`dorongKeDalam` pada pegangan: 38→43; badge jangkauan: +20→+27) ikut dilonggarkan supaya badge yang lebih besar tidak jadi mepet lagi. Diverifikasi lewat mode mock (screenshot zoom): semua nomor 1-6 kini terbaca jelas.
- **Terlalu besar, dan "3" sekarang malah seperti bentuk solid** (pemilik). Dua masalah terpisah: (1) ukuran badge (r=12, font 13) dinilai kebesaran — diturunkan ke r=10/font10, lalu font 11 (beberapa percobaan). (2) "3" tetap terlihat seperti blob solid walau ukuran dikecilkan.
- **Beberapa kali coba turunkan `fontWeight` (700→600→500→400→300) tidak menyelesaikannya** — saya salah menduga ini soal ketebalan font. Verifikasi visual saya sendiri lewat screenshot juga sempat salah (bilang "sudah beres" padahal pemilik masih melihat tebal) — kemungkinan font merender beda antara lingkungan automasi saya dan browser pemilik, jadi untuk masalah ini screenshot saya tidak bisa dipakai sebagai bukti sampai ketemu akar masalah sesungguhnya.
- **Akar masalah sesungguhnya (atas saran pemilik "hapus lalu buat ulang"):** `Pintu` membungkus semua elemennya (termasuk `NomorBadge`) dalam satu `<g stroke="currentColor" strokeWidth={2}>`. `<text>` di `NomorBadge` tidak pernah menyetel `stroke` sendiri, jadi ikut **mewarisi** stroke+strokeWidth dari `<g>` pembungkus itu — angkanya digambar dengan garis tepi tambahan di atas isiannya, membuatnya tampak jauh lebih tebal. Badge nomor lain (Kloset/Wastafel/AreaMandi) tidak dibungkus `<g>` semacam itu, jadi tidak kena masalah yang sama — itu sebabnya hanya "3" (badge pintu) yang beda sendiri, dan kenapa mengubah `fontWeight` sama sekali tidak membantu (bukan itu akar masalahnya).
- **Perbaikan:** `NomorBadge` sekarang menyetel `stroke="none"` eksplisit di `<g>` pembungkusnya sendiri dan di `<text>`-nya, supaya badge ini aman dipakai di dalam `<g>` manapun yang sudah punya `stroke`/`strokeWidth` sendiri (tidak bergantung pada tempat ia dipasang). `fontWeight` dikembalikan ke 400 (normal) karena ketebalan memang tidak pernah jadi masalahnya. Diverifikasi lewat mode mock (screenshot zoom pada badge "3" khusus): lengkungannya tipis dan terbuka, konsisten dengan badge lain.
- **Badge diperkecil lagi** (permintaan pemilik setelah bug stroke di atas selesai): radius 11→9, font 12→10, sekarang pas (tidak terlalu besar seperti percobaan r=12 sebelumnya, tidak terlalu kecil seperti r=9 yang pertama sebelum "3" tidak terbaca — bedanya sekarang bug stroke-nya sudah hilang jadi ukuran kecil tidak lagi membuat lengkungan menyatu).
- **"Kenapa jumlah nomor (5) tidak sesuai jumlah baris daftar (7)?"** — pemilik menunjukkan ketidakkonsistenan: "pegangan" sendiri bukan benda fisik tersendiri (cuma penanda status kloset), tapi tetap diberi badge; kalau begitu "lantai" dan "ruang" seharusnya juga bisa. **Keputusan: semua 7 hal diberi nomor**, bukan cuma 5. `nomorItemDenah` disederhanakan (tidak ada lagi pengecualian lantai/ruang, cuma nomor urut 1..n polos). `DenahKamarMandi.tsx` menambah badge nomor untuk "ruang" (di tengah lingkaran putar) dan "lantai" (di titik tetap, sedikit di bawah tengah lingkaran, area yang biasanya lapang) — keduanya tetap mewakili seluruh ruangan secara warna (tekstur titik dan garis lingkaran), badge nomornya cuma penanda korelasi ke daftar, bukan menunjukkan "lokasi pasti". Diverifikasi lewat mode mock: ketujuh baris di "Rincian per hal" sekarang bernomor 1-7 berurutan, dan ketujuh badge muncul di denah.

## Denah difilter per status (bukan lagi "before/after")
- **Usulan pemilik:** buat tampilan "sebelum/sesudah" dalam bentuk tab — foto asli vs denah, dengan nomor dibagi antar tab sesuai status (mis. "pegangan" cuma muncul di tab "sesudah" karena itu perbaikan). Pemilik sendiri menyadari ini ambigu untuk 3 kategori status yang sudah ada, dan menawarkan alternatif 3 tab (mendukung/perlu perhatian/tidak jelas) sebagai pertanyaan terbuka ("bagaimana?").
- **Rekomendasi yang diambil: 3 tab sesuai status, bukan 2 tab "sebelum/sesudah".** Alasan: framing "sebelum/sesudah" menyiratkan simulasi perbaikan yang sebenarnya tidak terjadi (kita cuma memfilter status yang sudah ada dari hasil pindai, bukan membuat versi "setelah diperbaiki"); 3 kategori ini pun sudah persis sama dengan legenda warna yang sudah ada, jadi lebih jujur dan konsisten.
- **Pola UI:** dicek dulu lewat subagent — proyek ini tidak punya komponen tab literal (`role="tablist"`), tapi punya pola pil radio (`PilihanPil` + `role="radiogroup"`, dipakai di `Kontak.tsx`/`AsesmenAktivitas.tsx`) untuk "pilih satu dari beberapa status". Itu yang dipakai, bukan bikin pola baru.
- **`PilihanPil`** (`src/components/Pilihan.tsx`) diperluas: `label` yang tadinya `string` diubah ke `ReactNode`, supaya bisa menyisipkan titik warna (pakai `GAYA_BADGE`, gaya yang sama dengan legenda lama) di depan teks label — jadi korelasi warna pil ↔ warna badge di denah tetap kebaca, bukan cuma teks.
- **`DenahKamarMandi`** sekarang punya state lokal (`useState<StatusItem>`, default `"perhatian"` karena itu yang paling actionable) dan tiga fungsi turunan: `cocok(id)` (apakah status hal itu == filter aktif), `warna(id)` (warna status asli kalau cocok, abu-abu redup `text-garis/50` kalau tidak), `nomor(id)` (nomor asli kalau cocok, `undefined` kalau tidak — badge otomatis tidak digambar lewat pengecekan `!== undefined` yang sudah ada di tiap sub-komponen). Legenda statis lama (`<ul>` warna+label) dihapus karena fungsinya sekarang diambil alih radiogroup filter (sekalian interaktif, bukan cuma penjelasan).
- Diverifikasi lewat mode mock (klik antar pil, screenshot): berpindah dari "Perlu perhatian" (default, badge 2 & 5 saja) ke "Tampak mendukung" (badge 1, 4, 7) — benda yang tidak cocok otomatis redup tanpa nomor, posisi benda tetap konsisten (cuma warna+badge yang berubah), sesuai rencana.

## "Rincian per hal" dikelompokkan per status + deskripsi
- **Permintaan pemilik:** kelompokkan "Rincian per hal" seperti denahnya (per status), tambah deskripsi yang menjelaskan kenapa hal itu dapat status tersebut, baru tombol "Lihat panduan" di bawahnya.
- **Batasan yang saya tandai dulu:** tidak bisa mengarang "alasan spesifik" per hasil pemindaian (mis. "lantainya kasar karena terlihat bertekstur") — Gemini tidak pernah diminta memberi alasan, cuma status, jadi alasan semacam itu akan jadi karangan, melanggar aturan keras "jangan mengarang" di `CLAUDE.md`. Yang dipakai sebagai "deskripsi relevan" adalah pertanyaan ceklis yang SUDAH ADA di konten (`it.cek`, sama persis dengan yang ditampilkan di layar "nilai sendiri") — menjelaskan APA yang dinilai, bukan mengarang KENAPA hasilnya begitu untuk foto spesifik itu.
- **Implementasi** (`PindaiFoto.tsx`): daftar dikelompokkan jadi 3 `<section>` berurutan **perhatian → tidak_jelas → ramah** (paling actionable duluan, bukan urutan konten/status asli), masing-masing diberi judul kelompok berupa pil berwarna (`{status} ({jumlah})`) memakai gaya yang sama dengan `GAYA_STATUS`. Kelompok yang kosong (mis. tidak ada "tidak jelas") dilewati, tidak menampilkan judul kosong. Pil status individual per item dihapus (sudah terwakili oleh judul kelompok); nomor badge tetap ada. Urutan tiap kartu: nomor+nama → deskripsi (`it.cek`) → tombol "Lihat panduan" (cuma di kelompok "perhatian").
- Diverifikasi lewat mode mock (screenshot, scroll penuh): tiga kelompok muncul berurutan dengan jumlah yang benar, deskripsi ceklis tampil di tiap kartu, tombol panduan cuma di kelompok "Perlu perhatian".

## Nomor berurut mengikuti urutan tampil + badge bisa diketuk untuk lihat nama
- **Permintaan pemilik:** "nomor nya buat berurut dan nomor di gambarnya bisa di tap dan memunculkan pop over nama objeknya".
- **Masalah nomor lama:** `nomorItemDenah` (fungsi lama, nomor 1..n mengikuti urutan konten `t.item`) tidak lagi berurut 1..n DI LAYAR setelah "Rincian per hal" dikelompokkan per status (fitur sebelumnya) — nomor badge di kelompok "Perlu perhatian" bisa jadi 2 dan 5, bukan 1 dan 2, karena hal lain dengan nomor lebih kecil ada di kelompok lain yang sekarang tampil di bawahnya.
- **Perbaikan:** `nomorItemDenah(idItem)` diganti `nomorItemHasil(idItem, temuan)` (fungsi murni, `src/domain/pindai.ts`) — menerima `temuan` dan mengurutkan dulu berdasarkan `URUTAN_STATUS_HASIL = ["perhatian", "tidak_jelas", "ramah"]` (sama dengan urutan kelompok di "Rincian per hal") sebelum memberi nomor 1..n, jadi nomor di badge denah dan di daftar selalu cocok dan selalu berurut mengikuti urutan baca di layar. Fungsi ini tidak lagi konstanta level-modul (nomornya bergantung hasil pindai yang baru diketahui saat runtime) — dipanggil ulang di dalam `DenahKamarMandi` dan `PindaiFoto.tsx` (`Hasil`), masing-masing dengan `temuan`-nya sendiri.
- **Tap-untuk-popover:** `NomorBadge` sekarang punya state lokal (`useState`, toggle buka/tutup) dan menerima prop `id` (dipetakan ke nama lewat `NAMA_ITEM`, dibangun dari `t.item` di konten). Diketuk → muncul kotak kecil berisi nama bendanya langsung di denah (murni kemudahan visual; denah tetap `aria-hidden`, nama+status tetap tertulis lengkap di "Rincian per hal" untuk pembaca layar).
- **Bug hit-testing SVG ditemukan saat verifikasi di browser:** badge "pegangan" (kloset) tidak merespons tap sama sekali walau koordinat klik sudah tepat di atasnya. Akar masalah: zona `AreaMandi` (persegi panjang shower) digambar SETELAH `Kloset` dalam urutan anak SVG dan tumpang tindih area dengan badge pegangan; rect arsirnya pakai `fill` pola (bukan `"none"`), dan pada SVG, bentuk apa pun dengan fill bukan `"none"` dianggap "padat" untuk hit-testing di SELURUH luas bentuknya — terlepas dari transparansi visualnya (opacity 0.5 + motif arsir). Klik di titik itu selalu tertangkap duluan oleh rect ini, tidak pernah sampai ke badge di bawahnya.
- **Perbaikan:** `pointerEvents="none"` ditambahkan ke semua `<g>` dekoratif (non-badge) yang berpotensi tumpang tindih dengan badge benda lain — bowl/tangki `Kloset`, kotak+titik keran `Wastafel`, zona+titik `AreaMandi`, lingkaran jangkauan `AreaMandi` — supaya elemen-elemen ini "transparan" terhadap klik. Sebagai pasangannya, `NomorBadge` sendiri diberi `pointerEvents="auto"` eksplisit di `<g>` pembungkus klik-nya, supaya badge tetap bisa diketuk terlepas dari `pointer-events` apa pun yang diwarisi dari pembungkus di sekitarnya (termasuk `Pintu`, yang membungkus badge miliknya sendiri di dalam `<g stroke=...>` yang sama — sempat salah coba taruh `pointerEvents="none"` di situ, langsung ketahuan akan mematikan badge Pintu sendiri lewat pewarisan, dibatalkan sebelum diuji).
- Diverifikasi lewat mode mock (browser, tap sungguhan): badge "1" (pegangan, tadinya gagal 3x percobaan) dan badge "2" (ruang gerak) masing-masing bisa dibuka-tutup popovernya secara independen walau saling berdekatan dan tumpang tindih dengan zona shower.

## Objek di denah selalu terlihat di semua tab; popover pintu diperbaiki
- **Masalah 1 (pemilik):** "pintu hanya terlihat di status tampak mendukung, wastafel hanya terlihat di tidak jelas di foto" — kelihatannya seperti objek hilang per tab, padahal objeknya SELALU digambar (cuma warnanya berubah ikut filter). Akar masalah: objek yang tidak cocok filter diberi warna `text-garis/50` (`#DCE2E7` 50% opacity) — nyaris menyatu sempurna dengan latar denah (`permukaan`, `#F2F6F6`), jadi secara visual nyaris tidak terlihat walau DOM-nya tetap ada.
- **Perbaikan:** warna "tidak cocok filter" diganti ke `text-garisKontrol` (abu gelap netral, kontras ≥3:1 — token yang sama dipakai outline dekoratif kloset/pintu), supaya bentuk objek selalu terlihat jelas di semua tab; hanya warna status (sorot) dan nomor badge yang berubah ikut filter yang aktif. Diverifikasi lewat mode mock (screenshot): di tab "Perlu perhatian", pintu/wastafel/zona mandi semua tetap tergambar jelas (abu netral) walau tidak disorot; di tab "Tampak mendukung" pintu+zona mandi tersorot warna dan bernomor, lainnya tetap terlihat netral.
- **Masalah 2 (pemilik): popover nomor 6 (pintu) tidak terbaca.** Bug sama persis dengan bug angka badge yang pernah diperbaiki sebelumnya (lihat di atas), tapi kena bagian popovernya: `Pintu` membungkus seluruh isinya (termasuk `NomorBadge`) dalam `<g stroke="currentColor" strokeWidth={2}>`. Popover (`<rect>`+`<text>` di `NomorBadge`) tidak menyetel `stroke="none"` sendiri saat ditambahkan, jadi ikut mewarisi garis tebal itu — teks "Pintu" jadi tertutup garis tebal, tidak terbaca.
- **Perbaikan:** `stroke="none"` ditambahkan eksplisit di `<g>` pembungkus popover, konsisten dengan badge nomornya sendiri yang sudah diberi perlindungan yang sama. Diverifikasi lewat mode mock (browser, tap badge 6 di tab "Tampak mendukung", screenshot zoom): popover "Pintu" terbaca jelas tanpa garis tebal menutupinya.

## Kontras badge "tampak mendukung" diperkuat; toggle tampilkan-semua-label; segitiga penunjuk popover
- **Masalah (pemilik):** warna hijau (teal) di lingkaran nomor saat filter "Tampak mendukung" tidak cukup beda dari abu-abu netral di tab lain — cuma dibedakan lewat warna garis tipis (`WARNA_GARIS.ramah = text-utama-gelap`, `#0A4549`), yang di lingkaran kecil bisa kelihatan segelap abu-abu biasa.
- **Perbaikan:** `NomorBadge` sekarang punya latar lingkaran berwarna (`LATAR_BADGE`, prop baru `latar`), bukan cuma putih polos — khusus "ramah" pakai `utama-redup` (`#C2DCDC`, token yang sudah ada, lebih pekat dari `utama-muda` yang dicoba pertama tapi ternyata nyaris tak terlihat). "Perhatian" pakai `aksen-muda` (oranye, sudah cukup beda huenya dari abu). Badge yang tidak cocok filter tetap latar putih polos seperti sebelumnya. Diverifikasi lewat mode mock (screenshot zoom, bandingkan tab "Tidak jelas di foto" vs "Tampak mendukung"): badge yang disorot kini jelas berlatar teal pudar, beda dari badge netral berlatar putih.
- **Permintaan pemilik: toggle untuk tampilkan/sembunyikan label popover, diletakkan sebelum teks `denahCatatan`.** Ditambahkan tombol `role="switch"` ("Tampilkan nama benda", teks di `ui.json` → `denahLabelToggle`) di `DenahKamarMandi`. Saat aktif, semua `NomorBadge` yang sedang digambar (sesuai filter) langsung menampilkan popover tanpa perlu diketuk satu-satu (`paksaTampil`, diteruskan sebagai prop baru ke semua sub-komponen dan `NomorBadge`); tap individual tetap berfungsi seperti biasa untuk toggle di luar status global ini. Berguna untuk pengguna yang belum sadar badge bisa diketuk, atau yang ingin lihat semua nama sekaligus.
- **Permintaan pemilik: tambah segitiga penunjuk di popover ke arah nomornya.** `NomorBadge` menambahkan `<polygon>` kecil (ekor bicara khas balon percakapan) di antara kotak popover dan lingkaran nomor, basisnya dijepit ke dalam lebar kotak popover supaya tetap menunjuk ke x badge yang benar walau kotaknya sendiri bergeser karena mepet tepi denah.
- Diverifikasi lewat mode mock (browser): toggle berpindah dari off→on membuat kedua popover ("Pegangan", "Ruang gerak") muncul serentak tanpa tap; segitiga penunjuk terlihat jelas menempel ke lingkaran nomornya di kedua kasus (popover di atas maupun di bawah badge).

## Overlay non-fisik (pegangan, zona shower, ruang gerak) cuma tampil saat pil statusnya diklik
- **Permintaan pemilik:** hal yang tidak benar-benar ada wujudnya di foto asli (pegangan, area mandi, ruang gerak) seharusnya cuma tampil kalau pil status yang cocok diklik — bukan selalu digambar netral seperti perbaikan sebelumnya.
- **Perbaikan:** dibedakan dua kelompok di denah. Benda fisik yang memang kelihatan wujudnya di foto (pintu, badan kloset/wastafel, tekstur lantai) tetap SELALU digambar (keputusan sebelumnya, tidak berubah). Overlay yang murni penilaian/ilustrasi (garis pegangan di kloset, kotak zona shower + arsirnya, lingkaran+ikon tangan jangkauan di dalam zona shower, lingkaran putar kursi roda "ruang gerak") dikembalikan ke render kondisional — cuma digambar kalau `nomor...(id) !== undefined` (status-nya cocok filter yang sedang aktif), persis seperti kondisi badge nomornya sendiri, jadi satu sumber kebenaran untuk kapan elemen itu "ada" di denah.
- **Catatan tak terverifikasi eksplisit oleh pemilik:** "jangkauan" (lingkaran+ikon tangan di dalam zona shower) tidak disebut namanya oleh pemilik, tapi diberi perlakuan sama dengan "area mandi" karena satu kesatuan ilustrasi zona shower yang sama-sama bukan wujud nyata di foto — perlu dikonfirmasi kalau ternyata dimaksud tetap selalu tampil.
- Diverifikasi lewat mode mock (browser): di tab "Perlu perhatian", pegangan+ruang gerak muncul (status keduanya "perhatian"), zona shower tidak; di tab "Tidak jelas di foto", zona shower muncul (badge 3), pegangan+ruang gerak hilang; pintu/kloset/wastafel/lantai tetap selalu terlihat di kedua tab.

## Keran dan shower digambar tampak-atas (bukan ikon)
- **Permintaan pemilik (dua tahap):** mula-mula "gambar keran dan shower tidak representatif (gambar tangan?)" — ikon tangan (lucide `Hand`) dipakai untuk badge "jangkauan" ("Keran dan shower" di konten), padahal tidak menggambarkan bendanya. Percobaan pertama: ganti ke ikon lucide `ShowerHead`/`Faucet`. Pemilik lalu menegaskan: "kenapa harus gambar icon? harusnya seperti gambar kloset atau wastafel, dibuat gambar shower tampak dari atas" — minta bentuk SVG tampak atas yang konsisten dengan gaya gambar benda lain di denah (garis+isian, bukan ikon generik dari pustaka).
- **Perbaikan final:** dependensi `lucide-react` untuk kedua ikon ini dihapus dari komponen.
  - **Keran wastafel**: diganti dari titik polos menjadi bentuk tampak atas (badan kecil berbentuk kapsul + ujung bulat), digambar dengan garis+isian seperti kloset/wastafel, bukan ikon.
  - **Keran dan shower (badge "jangkauan") di zona shower**: diganti dari ikon tangan/ikon shower generik menjadi kepala shower tampak atas (lingkaran + pola lima lubang semprot kecil di dalamnya), warnanya tetap ikut status (`warnaJangkauan`) sama seperti sebelumnya.
- Diverifikasi lewat mode mock (browser, screenshot zoom): keran wastafel dan kepala shower kini tampak sebagai bentuk digambar (bukan ikon), sejalan dengan gaya visual kloset/wastafel/pintu di denah yang sama.

## Gambar shower diperbesar, ditambah pipa, dan posisi tertukar dengan badge nomornya
- **Masalah (pemilik):** gambar kepala shower (lingkaran + pola lubang) yang baru dibuat malah terlihat seperti lubang pembuangan lantai — perlu diperbesar sedikit dan ditambah elemen lain supaya beda, dan posisinya ditukar dengan badge nomornya (badge dulu ada di tepi, gambarnya di tengah zona — pemilik minta kebalikannya).
- **Perbaikan:**
  - **Ukuran**: radius lingkaran 7→10, jumlah titik lubang semprot 5→7 (ditambah 2 di atas-bawah), jaraknya direnggangkan supaya pola lebih jelas sebagai kepala shower, bukan titik rapat yang mirip lubang pembuangan.
  - **Elemen pembeda dari lubang pembuangan**: ditambahkan lengan pipa pendek (garis tebal) dari lingkaran ke arah dinding tempat zona shower menempel (`KE_DINDING`, fungsi arah baru — kebalikan `dorongKeDalam`) — lubang pembuangan lantai tidak punya pipa, jadi ini jadi pembeda visual utama.
  - **Tukar posisi**: gambar kepala shower dipindah ke titik yang dulu dipakai badge nomor "jangkauan" (tepi zona, `tengahZona.x + 27`), dan badge nomornya sendiri dipindah ke tengah zona (`tengahZona`, titik yang dulu dipakai gambar) — badge tetap di titik paling lapang di dalam zona, gambar shower-nya yang digeser dekat dinding (lebih masuk akal secara posisi, shower memang menempel dinding).
- Diverifikasi lewat mode mock (browser, screenshot zoom): kepala shower kini jelas berbeda dari lubang pembuangan (ada pipa ke dinding, pola lubang lebih renggang), badge nomor "7" ada di tengah zona, gambar shower di tepi dekat dinding kanan.

## Pipa shower dirapikan ke garis dinding; area lantai ditandai garis putus-putus
- **Masalah 1 (pemilik): pipa shower sedikit keluar garis dinding.** Sebelumnya ujung pipa dihitung dari jarak tetap (+15) dari pusat lingkaran shower, tanpa memperhitungkan posisi dinding yang sebenarnya — untuk dinding "kanan" ini membuat ujung pipa (dan sedikit tepi lingkarannya) melewati garis dinding kamar mandi.
- **Perbaikan:** ujung pipa sekarang dihitung PERSIS dari sisi zona yang menempel dinding sungguhan (`sisiDinding`, diturunkan dari `zona.x`/`zona.y` + lebar/tinggi zona, bukan dari `PAD`/`W`/`H` langsung), dan posisi pusat lingkaran shower (`letakShower`) diturunkan mundur dari situ sejauh radius+panjang pipa (`JARAK_PUSAT_SHOWER = JARI_SHOWER + PANJANG_PIPA`) — supaya pipa berapa pun ukurannya selalu berhenti tepat di garis dinding, tidak pernah lebih. Konstanta arah generik `KE_DINDING` (dx/dy) yang dipakai percobaan sebelumnya dihapus, diganti perhitungan langsung per dinding (pola yang sama dengan `titikDinding`/`posisiPersenDenah` di file yang sama).
- **Masalah 2 (pemilik): lantai seharusnya ditandai area dengan garis putus-putus, mirip "ruang gerak".** Sebelumnya lantai cuma punya tekstur titik-titik tersebar tanpa batas area yang jelas (beda dari "ruang gerak" yang punya lingkaran putus-putus sebagai penanda areanya).
- **Perbaikan:** ditambahkan persegi panjang bersudut tumpul dengan `strokeDasharray="5 5"` mengelilingi seluruh area lantai (gaya sama persis dengan lingkaran "ruang gerak": `strokeWidth=1.5`, `opacity=0.6`), diwarnai sesuai status "lantai" — konsisten dengan keputusan "lantai selalu tampil" (bukan kondisional seperti ruang gerak), jadi area ini SELALU digambar, warnanya saja yang berubah ikut status/filter.
- Diverifikasi lewat mode mock (browser, screenshot zoom): pipa shower kini berhenti tepat di garis dinding kanan tanpa keluar; area lantai bergaris putus-putus terlihat jelas mengelilingi seluruh ruangan di semua tab filter.

## Garis area lantai juga dibuat kondisional (menyusul keputusan sebelumnya)
- **Permintaan pemilik:** garis putus-putus area lantai yang baru ditambahkan seharusnya juga cuma muncul saat pil status "Lantai" aktif diklik — sama seperti ruang gerak dan area mandi — bukan selalu tampil.
- **Ini membalik bagian dari keputusan sebelumnya** ("lantai selalu tampil karena benda fisik") KHUSUS untuk garis batas areanya saja: tekstur titik-titik lantai tetap selalu digambar (representasi lantai itu sendiri, benda fisik), tapi garis batas putus-putusnya sekarang dibungkus `{nomorLantai !== undefined && (...)}`, sama seperti pola overlay non-fisik lainnya.
- Diverifikasi lewat mode mock (browser): garis area lantai hilang di tab "Perlu perhatian" (status lantai "ramah", tidak cocok), muncul di tab "Tampak mendukung" (status lantai "ramah", cocok) — tekstur titik tetap selalu ada di kedua tab.

## Posisi badge nomor "Lantai" digeser lebih ke tengah
- **Pertanyaan pemilik:** posisi badge nomor lantai yang lama (`W/2, H/2+90`, dekat sudut bawah dekat lintasan ayun pintu) terasa kurang pas — diusulkan coba di tengah.
- **Keputusan:** tidak dipindah PERSIS ke tengah (`W/2,H/2`) karena titik itu sudah dipakai badge "ruang gerak" — kalau status keduanya kebetulan sama (misalnya sama-sama "ramah"), kedua badge akan tampil bersamaan di titik yang sama dan saling menumpuk. Dipilih `W/2, H/2-45`: dekat tengah ruangan (sesuai usulan), tapi berjarak aman dari badge "ruang" (jarak 45, lebih dari jumlah radius kedua badge) dan sudah tidak lagi berdekatan dengan garis lintasan ayun pintu di posisi lama.
- Diverifikasi lewat mode mock (browser, tab "Tampak mendukung" dengan toggle "Tampilkan nama benda" aktif): badge "Lantai" kini di area lapang dekat tengah ruangan, terpisah jelas dari badge pintu dan keran/shower di bawahnya.

## Jarak badge nomor pintu & shower diperbaiki
- **Masalah (pemilik):** badge nomor pintu terlalu jauh dari gambar pintunya; badge nomor shower (jangkauan) malah mepet dengan gambar kepala showernya.
- **Perbaikan pintu:** jarak dorong badge dari titik tempel dinding (`dorongKeDalam(x, y, dinding, ...)`) diturunkan dari 46 ke 28. Angka 46 sebelumnya dihitung tanpa memperhitungkan bahwa titik tempel (`x,y`) sendiri sudah berjarak `JARAK_DINDING=35` dari dinding sungguhan — jadi badge total ada ~81 satuan dari dinding sungguhan, padahal ujung ayunan pintu (bagian pintu paling jauh yang tergambar) cuma ~54 satuan. 28 dipilih supaya badge mendarat tepat di luar ujung ayunan, bukan jauh melewatinya.
- **Perbaikan shower:** badge "jangkauan" (sebelumnya persis di `tengahZona`, berjarak cuma ~18 satuan dari pusat gambar shower — nyaris bersentuhan karena radius keduanya berjumlah 19) digeser lebih jauh ke ruangan (menjauhi dinding) sejauh 16 satuan tambahan lewat `dorongKeDalam`, menjadikan jaraknya ~34 satuan — lebih dari jumlah kedua radius, jadi selalu terpisah jelas.
- Diverifikasi lewat mode mock (browser, tab "Tampak mendukung", screenshot zoom): badge pintu kini menempel dekat ujung daun pintu; badge shower terpisah jelas dari gambar kepala shower-nya.

## Penyesuaian halus jarak badge pintu & shower (lanjutan)
- **Masukan pemilik:** setelah perbaikan sebelumnya, badge pintu jadi terlalu mepet, dan badge shower malah jadi terlalu renggang.
- **Penyesuaian:** jarak dorong badge pintu dinaikkan sedikit (28→34); jarak dorong tambahan badge shower diturunkan cukup banyak (16→9).
- Diverifikasi lewat mode mock (browser, tab "Tampak mendukung", screenshot zoom): keduanya kini punya jarak yang terasa wajar — tidak menumpuk gambar bendanya, tidak juga terasa terlalu jauh terpisah.
