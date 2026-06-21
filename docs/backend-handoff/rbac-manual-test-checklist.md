# MaternityCare — RBAC Manual Test Checklist

Checklist ini digunakan untuk memastikan RBAC frontend tetap aman dan konsisten sebelum masuk ke Patient Domain.

Jalankan checklist ini pada mode mock:

```env
VITE_AUTH_MODE=mock
```

Ulangi lagi ketika backend Laravel sudah tersedia:

```env
VITE_AUTH_MODE=api
```

---

## 1. Guest Access

### Guest membuka `/dashboard`

Expected:

```text
Redirect ke /login
```

### Guest membuka `/patients`

Expected:

```text
Redirect ke /login
```

### Guest membuka `/admin/students`

Expected:

```text
Redirect ke /login
```

---

## 2. Login Page

### User belum login membuka `/login`

Expected:

```text
Halaman login tampil
Tab Nurse tersedia
Tab Admin tersedia
```

### User sudah login membuka `/login`

Expected:

```text
Redirect ke halaman pertama yang diizinkan
```

---

## 3. Nurse Login

Credential mock:

```text
NIM: 251FK05002
Password: password
```

Expected setelah login:

```text
Login berhasil
Redirect ke /dashboard
Avatar user tampil
Role tampil sebagai Nurse
```

Expected sidebar:

```text
Dashboard muncul
Pasien muncul
Skrining muncul
Riwayat muncul
Laporan muncul
Data Mahasiswa tidak muncul
```

---

## 4. Nurse Forbidden Route

Login sebagai Nurse, lalu buka manual:

```text
/admin/students
```

Expected:

```text
Redirect ke /unauthorized
Permission yang dibutuhkan: students.list
Session tetap aktif
User tidak logout
```

---

## 5. Nurse Profile

Login sebagai Nurse, lalu buka:

```text
/profile
```

Expected:

```text
Halaman profil tampil
Nama user tampil
Role Nurse tampil
NIM tampil
Email tampil jika tersedia
Permission aktif tampil
RBAC summary tampil
```

---

## 6. Nurse Change Password

Login sebagai Nurse, lalu buka:

```text
/profile/change-password
```

Input salah:

```text
Password saat ini: salah
Password baru: passwordbaru
Konfirmasi: passwordbaru
```

Expected:

```text
Error current_password tampil
```

Input benar pada mock mode:

```text
Password saat ini: password
Password baru: passwordbaru
Konfirmasi: passwordbaru
```

Expected:

```text
Password berhasil diperbarui
```

---

## 7. Admin Login

Credential mock:

```text
Email: admin@example.com
Password: password
```

Expected setelah login:

```text
Login berhasil
Redirect ke /dashboard
Avatar user tampil
Role tampil sebagai Admin
```

Expected sidebar:

```text
Dashboard muncul
Pasien muncul
Skrining muncul
Riwayat muncul
Laporan muncul
Data Mahasiswa muncul
```

---

## 8. Admin Student Route

Login sebagai Admin, lalu buka:

```text
/admin/students
```

Expected:

```text
Route dapat dibuka
Permission students.list terpenuhi
```

---

## 9. Logout

Klik avatar, lalu klik:

```text
Logout
```

Expected:

```text
Session dihapus
Redirect ke /login
Sidebar tidak tampil
Protected route tidak dapat dibuka tanpa login ulang
```

---

## 10. Invalid Credential

### Nurse login salah

Input:

```text
NIM: 251FK05002
Password: salah
```

Expected:

```text
Login gagal
Session tidak dibuat
Tetap di /login
```

### Admin login salah

Input:

```text
Email: admin@example.com
Password: salah
```

Expected:

```text
Login gagal
Session tidak dibuat
Tetap di /login
```

---

## 11. Invalid NIM Format

Input:

```text
NIM: abc
Password: password
```

Expected:

```text
Error format NIM tampil
Request login tidak dikirim
```

---

## 12. API Mode — Login Flow

Mode:

```env
VITE_AUTH_MODE=api
```

Nurse login expected network flow:

```text
POST /api/auth/login/nurse
GET /api/me
```

Admin login expected network flow:

```text
POST /api/auth/login/admin
GET /api/me
```

Expected:

```text
Permission final berasal dari GET /api/me
Sidebar mengikuti permission dari GET /api/me
```

---

## 13. API Mode — 401 Session Expired

Simulasi:

```text
Login
Hapus token dari backend
Refresh frontend
GET /api/me mengembalikan 401
```

Expected:

```text
Session frontend dihapus
User kembali ke /login
Pesan session expired tampil
```

---

## 14. API Mode — 403 Forbidden

Simulasi:

```text
Login dengan token valid
Buka route tanpa permission
```

Expected:

```text
User masuk /unauthorized
Session tetap aktif
Permission yang dibutuhkan tampil
```

Khusus jika:

```text
GET /api/me mengembalikan 403
```

Expected:

```text
Session dihapus
User kembali ke login
Pesan akses akun dicabut tampil
```

---

## 15. Permission Synchronization

Simulasi:

```text
Login sebagai Admin
Buka /admin/students
Cabut permission students.list dari backend
Kembali ke tab frontend
```

Expected:

```text
GET /api/me dipanggil
Menu Data Mahasiswa hilang
/admin/students tidak lagi dapat diakses
```

---

## 16. User Without Dashboard Permission

Simulasi backend:

```text
User tidak punya dashboard.view
User punya patients.list
```

Expected:

```text
Setelah login redirect ke /patients
Tidak dipaksa masuk /dashboard
```

---

## 17. User Without Any Permission

Simulasi backend:

```text
permissions: []
```

Expected:

```text
Login bisa diverifikasi jika backend mengizinkan
Default route menjadi /unauthorized
Tidak ada menu sidebar
```

---

## 18. Final RBAC Acceptance

RBAC frontend dianggap siap jika:

```text
Guest selalu diarahkan ke login
Authenticated user tidak bisa kembali ke login
Sidebar mengikuti permission
Route guard mengikuti permission
Action mengikuti permission
Nurse tidak melihat Data Mahasiswa
Nurse tidak bisa akses Data Mahasiswa
Admin bisa akses Data Mahasiswa
401 menghapus session
403 tidak menghapus session kecuali terjadi di /api/me
Validation error masuk ke field yang sesuai
Logout hanya tersedia dari profile dropdown
```
