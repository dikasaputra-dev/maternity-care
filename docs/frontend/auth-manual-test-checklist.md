# Auth Manual Test Checklist

Checklist ini digunakan untuk memastikan login, single session, session expiration, dan idle timeout berjalan aman sebelum aplikasi online.

## 1. Login Nurse

- [ ] Buka halaman `/login`.
- [ ] Pilih tab `Nurse`.
- [ ] Masukkan NIM valid.
- [ ] Masukkan password valid.
- [ ] Klik `Masuk`.
- [ ] User berhasil masuk ke halaman dashboard/default route sesuai permission.
- [ ] Session tersimpan di `Session Storage`, bukan `Local Storage`.
- [ ] Key session yang tersimpan: `maternity-care.auth-session`.
- [ ] Session berisi:
  - [ ] `accessToken`
  - [ ] `tokenType`
  - [ ] `expiresAt`
  - [ ] `idleTimeoutMinutes`
  - [ ] `user`

## 2. Login Admin

- [ ] Buka halaman `/login`.
- [ ] Pilih tab `Admin`.
- [ ] Masukkan email admin valid.
- [ ] Masukkan password valid.
- [ ] Klik `Masuk`.
- [ ] Admin berhasil masuk ke halaman dashboard/default route sesuai permission.
- [ ] Admin dapat melihat menu sesuai permission admin.
- [ ] Admin tidak melihat pesan session expired setelah login sukses.

## 3. Login Gagal

- [ ] Buka halaman `/login`.
- [ ] Masukkan kredensial salah.
- [ ] Klik `Masuk`.
- [ ] Pesan error login tampil.
- [ ] Frontend tidak menampilkan pesan session expired.
- [ ] Session storage tetap kosong.

## 4. Refresh Session

- [ ] Login sebagai nurse/admin.
- [ ] Refresh browser.
- [ ] Frontend menjalankan bootstrap session.
- [ ] Jika token masih valid, user tetap berada di protected page.
- [ ] User data tetap terbaca.
- [ ] Permission tetap berjalan.

## 5. Expired Token dari Client

- [ ] Login sebagai nurse/admin.
- [ ] Buka DevTools.
- [ ] Masuk ke Application → Session Storage.
- [ ] Ubah `expiresAt` menjadi waktu lampau, contoh `2020-01-01T00:00:00+07:00`.
- [ ] Refresh browser.
- [ ] Frontend tidak melakukan request `/me`.
- [ ] Session dihapus.
- [ ] User diarahkan ke `/login`.
- [ ] Pesan tampil: `Sesi Anda telah berakhir. Silakan login kembali.`

## 6. Single Session Multi Browser

- [ ] Login akun yang sama di Firefox.
- [ ] Login akun yang sama di Chrome.
- [ ] Kembali ke Firefox.
- [ ] Klik menu yang melakukan request API, misalnya Dashboard atau Pasien.
- [ ] Backend mengembalikan `401`.
- [ ] Frontend menghapus session Firefox.
- [ ] Firefox diarahkan ke `/login`.
- [ ] Pesan tampil: `Sesi Anda telah berakhir atau akun telah login di perangkat/browser lain. Silakan login kembali.`

## 7. Idle Timeout

- [ ] Backend set idle timeout menjadi 1 menit untuk testing.
- [ ] Login di frontend.
- [ ] Diamkan aplikasi lebih dari 1 menit.
- [ ] Klik menu yang melakukan request API.
- [ ] Backend mengembalikan `401` dengan reason `idle_timeout`.
- [ ] Frontend menghapus session.
- [ ] User diarahkan ke `/login`.
- [ ] Pesan tampil: `Sesi Anda telah berakhir karena tidak ada aktivitas. Silakan login kembali.`
- [ ] Setelah test selesai, backend dikembalikan ke idle timeout normal.

## 8. Logout Normal

- [ ] Login sebagai nurse/admin.
- [ ] Klik logout.
- [ ] Frontend memanggil endpoint logout.
- [ ] Session storage dihapus.
- [ ] User diarahkan ke login atau public route.
- [ ] Protected route tidak bisa diakses tanpa login.

## 9. Protected Route

- [ ] Hapus session storage manual.
- [ ] Akses `/dashboard`.
- [ ] User diarahkan ke `/login`.
- [ ] Tidak ada crash.
- [ ] Tidak ada infinite loading.

## 10. Permission Guard

- [ ] Login sebagai nurse.
- [ ] Akses route admin-only secara manual dari URL.
- [ ] User diarahkan ke halaman akses ditolak.
- [ ] Login sebagai admin.
- [ ] Akses route admin-only.
- [ ] Route dapat dibuka jika permission sesuai.
