# Worker Pindai ruangan

Proxy kecil agar kunci API Gemini tidak ada di aplikasi.

1. Buat kunci API gratis di Google AI Studio.
2. `cd worker && npx wrangler secret put GEMINI_API_KEY`
3. Isi `IZIN_ASAL` di `wrangler.toml` dengan alamat aplikasi, lalu `npx wrangler deploy`.
4. Di aplikasi, buat `.env.local`: `VITE_PINDAI_URL=https://<nama-worker>.<akun>.workers.dev`

Belum ada pembatas laju per pengguna. Tambahkan Rate Limiting di Cloudflare sebelum dipakai umum.
