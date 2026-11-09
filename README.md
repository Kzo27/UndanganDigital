# Pawiwahan — Undangan Digital Wayang Cinematic

Template undangan digital React + Vite dengan:
- Background foto berbeda untuk setiap section dan transisi crossfade saat scroll.
- Smooth scrolling menggunakan Lenis.
- Reveal animation dan parallax menggunakan GSAP + ScrollTrigger.
- Countdown acara.
- Galeri foto.
- Form RSVP yang mengirim pesan melalui WhatsApp.
- Layout responsif untuk HP dan desktop.

## Menjalankan project

Pastikan Node.js versi 20 atau lebih baru sudah terpasang.

```bash
npm install
npm run dev
```

Buka alamat lokal yang ditampilkan Vite (biasanya http://localhost:5173).

Untuk build production:

```bash
npm run build
npm run preview
```

## Mengubah data undangan

Edit `src/data.js`:
- `partnerOne`, `partnerTwo`: nama pasangan.
- `dateLabel`, `dateISO`: tanggal dan waktu acara.
- `venue`, `address`, `mapsUrl`: lokasi acara.
- `akadTime`, `receptionTime`: jadwal.
- `whatsappNumber`: nomor WhatsApp tujuan RSVP, format internasional tanpa `+`.
- `backgrounds`: foto background untuk tiap section.
- `gallery`: daftar foto galeri.

Gunakan URL foto milik sendiri untuk hasil final. Foto contoh pada template berasal dari URL Unsplash dan hanya sebagai placeholder.

## Catatan penting
- Musik hanya berjalan setelah pengunjung menekan tombol musik karena kebijakan autoplay browser.
- Nama keluarga, foto pasangan, tanggal, lokasi, nomor WhatsApp, dan tautan Maps pada template adalah data contoh. Ganti sebelum dipublikasikan.
- RSVP membuka WhatsApp dengan teks yang sudah disiapkan; belum menyimpan data ke database.
- Efek pergantian background dipicu oleh section yang sedang dominan terlihat di viewport.
