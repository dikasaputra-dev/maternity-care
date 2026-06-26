# Auth Production Readiness Checklist

Checklist ini digunakan sebelum aplikasi dipindahkan dari local development ke environment online/staging/production.

## 1. Environment

- [ ] `VITE_API_BASE_URL` sudah mengarah ke backend yang benar.
- [ ] `VITE_API_BASE_URL` tidak kosong.
- [ ] Endpoint login nurse aktif.
- [ ] Endpoint login admin aktif.
- [ ] Endpoint `/me` aktif.
- [ ] Endpoint logout aktif.
- [ ] CORS backend sudah mengizinkan domain frontend.
- [ ] Backend sudah menggunakan HTTPS di environment online.

## 2. Session Storage

- [ ] Token disimpan di `Session Storage`, bukan `Local Storage`.
- [ ] Key session: `maternity-care.auth-session`.
- [ ] Session berisi:
  - [ ] `accessToken`
  - [ ] `tokenType`
  - [ ] `expiresAt`
  - [ ] `idleTimeoutMinutes`
  - [ ] `user`
- [ ] Setelah tab/browser ditutup, session hilang.
- [ ] Setelah logout, session storage bersih.

## 3. Login Flow

- [ ] Nurse bisa login dengan NIM dan password.
- [ ] Admin bisa login dengan email dan password.
- [ ] Login sukses tidak melakukan request `/me` tambahan.
- [ ] Login sukses redirect ke halaman default sesuai permission.
- [ ] Login gagal menampilkan pesan error login.
- [ ] Login gagal tidak menampilkan pesan session expired.
- [ ] Password tidak pernah disimpan di storage.

## 4. Bootstrap Session

- [ ] Refresh halaman dengan token valid tetap mempertahankan login.
- [ ] Refresh halaman menjalankan sync `/me`.
- [ ] Permission tetap terbaca setelah refresh.
- [ ] Jika `expiresAt` sudah lewat, frontend tidak memanggil `/me`.
- [ ] Jika `expiresAt` sudah lewat, session langsung dihapus.
- [ ] Jika session expired, user diarahkan ke `/login`.

## 5. Single Session

- [ ] Login akun yang sama di browser A.
- [ ] Login akun yang sama di browser B.
- [ ] Browser A melakukan request API.
- [ ] Backend mengembalikan `401`.
- [ ] Browser A menghapus session.
- [ ] Browser A diarahkan ke `/login`.
- [ ] Pesan tampil:
      `Sesi Anda telah berakhir atau akun telah login di perangkat/browser lain. Silakan login kembali.`

## 6. Idle Timeout

- [ ] Backend idle timeout bisa diuji dengan durasi pendek.
- [ ] Setelah idle timeout lewat, request API mengembalikan `401`.
- [ ] Frontend menghapus session.
- [ ] User diarahkan ke login.
- [ ] Pesan tampil:
      `Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan login kembali.`

## 7. Normal Logout

- [ ] Klik logout memanggil endpoint logout.
- [ ] Session storage dihapus.
- [ ] User keluar dari protected page.
- [ ] Login page tidak menampilkan pesan session expired setelah logout normal.
- [ ] Jika logout API gagal karena token invalid, frontend tetap membersihkan session lokal.

## 8. Protected Route

- [ ] Akses `/dashboard` tanpa session redirect ke `/login`.
- [ ] Akses `/patients` tanpa session redirect ke `/login`.
- [ ] Akses route detail tanpa session redirect ke `/login`.
- [ ] Tidak ada infinite loading.
- [ ] Tidak ada protected page yang tampil sebelum auth loading selesai.

## 9. Permission Guard

- [ ] Nurse hanya melihat menu sesuai permission nurse.
- [ ] Nurse tidak melihat tombol edit/delete data klinis.
- [ ] Admin melihat menu sesuai permission admin.
- [ ] Route dengan permission tidak sesuai diarahkan ke halaman akses ditolak.
- [ ] Permission tetap benar setelah refresh.

## 10. Browser Compatibility

- [ ] Test di Chrome.
- [ ] Test di Firefox.
- [ ] Test di Microsoft Edge.
- [ ] Session behavior konsisten di semua browser.
- [ ] Multi-browser single session berjalan sesuai aturan backend.

## 11. Build Check

- [ ] `npm run typecheck` berhasil.
- [ ] `npm run lint` berhasil.
- [ ] `npm run build` berhasil.
- [ ] Tidak ada error console saat login.
- [ ] Tidak ada error console saat logout.
- [ ] Tidak ada error console saat session expired.
- [ ] Tidak ada error console saat refresh protected page.

## 12. Final Security Notes

- [ ] Jangan commit file `.env` asli.
- [ ] Jangan tampilkan token di UI.
- [ ] Jangan log token ke console.
- [ ] Jangan simpan password di state global/storage.
- [ ] Gunakan HTTPS saat online.
- [ ] Backend tetap menjadi source of truth untuk token validity.
