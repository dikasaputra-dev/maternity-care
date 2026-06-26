# MaternityCare — Auth and RBAC Backend Contract

Dokumen ini menjelaskan kontrak integrasi antara frontend MaternityCare dan backend Laravel API.

Frontend menggunakan:

- React
- TypeScript
- Vite
- React Router
- Axios
- Tailwind CSS
- MUI Icons

Backend yang diharapkan:

- Laravel REST API
- PostgreSQL
- Laravel Sanctum Bearer Token
- spatie/laravel-permission
- Laravel Policy
- Laravel Form Request
- Laravel API Resource

Frontend hanya mengatur pengalaman pengguna seperti sidebar, route guard, dan tampilan tombol. Backend tetap menjadi lapisan keamanan utama.

Backend wajib memvalidasi:

- token;
- role;
- permission;
- status akun aktif;
- ownership data;
- policy resource;
- request payload.

---

## 1. Environment Frontend

Frontend membaca environment berikut:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_AUTH_MODE=mock
```

Mode yang tersedia:

```text
mock
api
```

Mode `mock` digunakan saat backend belum tersedia.

Mode `api` digunakan saat Laravel API sudah tersedia.

Contoh API mode:

```env
VITE_API_BASE_URL=http://localhost:8000/api
VITE_AUTH_MODE=api
```

Setelah mengubah `.env`, restart Vite:

```bash
npm run dev
```

---

## 2. Authentication Header

Setelah login, frontend mengirim token melalui header:

```http
Authorization: Bearer <token>
Accept: application/json
Content-Type: application/json
```

Backend wajib menerima Bearer Token.

---

## 3. Authentication Endpoints

### Nurse Login

```http
POST /api/auth/login/nurse
```

Payload:

```json
{
  "nim": "251FK05002",
  "password": "password"
}
```

Backend wajib:

- melakukan trim pada NIM;
- mengubah NIM menjadi uppercase;
- memvalidasi format NIM;
- menolak akun non-nurse pada endpoint nurse;
- menolak akun inactive;
- mengembalikan pesan login gagal yang umum.

Format NIM:

```text
3 angka + 2 huruf + 5 angka
```

Regex:

```regex
^\d{3}[A-Z]{2}\d{5}$
```

Contoh valid:

```text
251FK05002
```

---

### Admin Login

```http
POST /api/auth/login/admin
```

Payload:

```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

Backend wajib:

- melakukan trim pada email;
- mengubah email menjadi lowercase;
- menolak akun non-admin pada endpoint admin;
- menolak akun inactive;
- mengembalikan pesan login gagal yang umum.

---

### Logout

```http
POST /api/auth/logout
```

Wajib menggunakan Bearer Token.

Expected behavior:

- revoke token aktif;
- tidak perlu mengembalikan data user.

Response sukses:

```json
{
  "message": "Logout successful."
}
```

---

### Current User

```http
GET /api/me
```

Wajib menggunakan Bearer Token.

Endpoint ini menjadi sumber utama frontend untuk:

- memulihkan session;
- sinkronisasi role;
- sinkronisasi permission;
- menampilkan sidebar;
- mengecek protected route;
- mengecek action.

---

### Change Password

```http
PATCH /api/me/password
```

Payload:

```json
{
  "current_password": "old-password",
  "password": "new-password",
  "password_confirmation": "new-password"
}
```

Backend wajib:

- memvalidasi current password;
- memvalidasi password baru;
- melakukan hash password baru;
- tidak mengembalikan password;
- tidak logout otomatis, kecuali nanti diputuskan berbeda.

Response sukses:

```json
{
  "message": "Password updated successfully."
}
```

---

## 4. Login Response Contract

Frontend mengharapkan response login seperti berikut:

```json
{
  "message": "Login successful.",
  "data": {
    "token": "1|plain-text-sanctum-token",
    "token_type": "Bearer",
    "user": {
      "id": 1,
      "name": "Rina Nuraini",
      "nim": "251FK05002",
      "email": "rina.nuraini@example.com",
      "role": "nurse",
      "permissions": ["dashboard.view", "patients.list", "patients.view", "patients.create"]
    }
  }
}
```

Catatan:

- `token` wajib string.
- `token_type` wajib bernilai `Bearer`.
- `role` wajib string: `nurse` atau `admin`.
- `permissions` wajib array string.
- `permissions` sebaiknya unik.
- `nim` boleh `null` untuk admin.
- `email` boleh `null` untuk nurse jika tidak tersedia.
- password tidak boleh dikembalikan.
- token tidak boleh berada di dalam object user.

Setelah login berhasil, frontend tetap memanggil:

```http
GET /api/me
```

Tujuannya agar permission final selalu berasal dari current user endpoint.

---

## 5. Current User Response Contract

```http
GET /api/me
```

Response:

```json
{
  "message": "Authenticated user retrieved successfully.",
  "data": {
    "id": 1,
    "name": "Rina Nuraini",
    "nim": "251FK05002",
    "email": "rina.nuraini@example.com",
    "role": "nurse",
    "permissions": [
      "dashboard.view",
      "patients.list",
      "patients.view",
      "patients.create",
      "profile.view",
      "profile.change-password"
    ]
  }
}
```

Frontend menggunakan response ini sebagai sumber final untuk RBAC.

Jika backend mencabut permission user, frontend akan mengikuti setelah:

- refresh halaman;
- tab kembali aktif;
- user menekan sinkronisasi ulang akses.

---

## 6. Standard Success Response

Success dengan data:

```json
{
  "message": "Resource retrieved successfully.",
  "data": {}
}
```

Success tanpa data:

```json
{
  "message": "Operation completed successfully."
}
```

Paginated response:

```json
{
  "message": "Resources retrieved successfully.",
  "data": [],
  "meta": {
    "current_page": 1,
    "per_page": 10,
    "total": 100,
    "last_page": 10
  },
  "links": {
    "first": "http://localhost:8000/api/resources?page=1",
    "last": "http://localhost:8000/api/resources?page=10",
    "previous": null,
    "next": "http://localhost:8000/api/resources?page=2"
  }
}
```

---

## 7. Standard Error Response

### Validation Error

HTTP status:

```http
422 Unprocessable Content
```

Response:

```json
{
  "message": "The given data was invalid.",
  "errors": {
    "nim": ["The NIM format is invalid."],
    "password": ["The password field is required."]
  }
}
```

Frontend membaca field:

- `nim`
- `email`
- `password`
- `current_password`
- `password_confirmation`

---

### Unauthenticated

HTTP status:

```http
401 Unauthorized
```

Response:

```json
{
  "message": "Unauthenticated."
}
```

Frontend behavior:

- hapus session lokal;
- hapus permission lama;
- tampilkan pesan session expired;
- redirect ke login.

---

### Forbidden

HTTP status:

```http
403 Forbidden
```

Response:

```json
{
  "message": "You do not have permission to perform this action."
}
```

Frontend behavior:

- session tetap aktif;
- user diarahkan ke halaman unauthorized;
- permission yang dibutuhkan ditampilkan jika tersedia.

Khusus jika `GET /api/me` mengembalikan `403`, frontend menganggap akses akun dicabut dan akan menghapus session.

---

### Not Found

HTTP status:

```http
404 Not Found
```

Response:

```json
{
  "message": "Resource not found."
}
```

---

### Conflict

HTTP status:

```http
409 Conflict
```

Response:

```json
{
  "message": "The resource cannot be changed in its current state."
}
```

---

## 8. Role

Role utama:

```text
nurse
admin
```

Frontend menampilkan role untuk informasi user.

Frontend tidak menggunakan role sebagai satu-satunya sumber authorization.

Gunakan:

```ts
user.permissions.includes('patients.create');
```

Jangan gunakan ini sebagai satu-satunya guard:

```ts
user.role === 'nurse';
```

---

## 9. Permission Catalog

Permission yang saat ini dikenali frontend:

```text
dashboard.view

profile.view
profile.change-password

patients.list
patients.view
patients.create
patients.update
patients.delete

screenings.list
screenings.view
screenings.create
screenings.update
screenings.delete

monitoring.list
monitoring.view
monitoring.create
monitoring.update
monitoring.delete

history.view-own
history.view-all

reports.view
reports.print
reports.export

students.list
students.view
students.create
students.update
students.change-status
students.reset-password
```

Jika backend mengirim permission baru yang belum dikenali frontend, permission tersebut akan diabaikan sampai ditambahkan ke catalog frontend.

---

## 10. Nurse Permission

Nurse memiliki permission:

```text
dashboard.view

profile.view
profile.change-password

patients.list
patients.view
patients.create

screenings.list
screenings.view
screenings.create

monitoring.list
monitoring.view
monitoring.create

history.view-own

reports.view
reports.print
reports.export
```

Nurse tidak memiliki permission:

```text
patients.update
patients.delete

screenings.update
screenings.delete

monitoring.update
monitoring.delete

history.view-all

students.list
students.view
students.create
students.update
students.change-status
students.reset-password
```

Aturan penting:

- Nurse dapat menambahkan data.
- Nurse dapat melihat data sesuai izin.
- Nurse tidak boleh mengedit data lama.
- Nurse tidak boleh menghapus data.
- Nurse tidak boleh melihat riwayat nurse lain.
- Nurse tidak boleh mengakses manajemen mahasiswa.
- Backend tetap wajib menolak request update/delete langsung dari Postman atau client lain.

---

## 11. Admin Permission

Untuk tahap awal, admin memiliki seluruh permission yang dikenali frontend.

Admin dapat:

- melihat semua menu utama;
- mengakses data mahasiswa;
- mengelola akun mahasiswa atau nurse;
- melakukan reset password;
- mengubah status akun;
- melihat seluruh riwayat jika diberi permission;
- mengakses laporan.

Backend tetap harus memeriksa permission dan policy, bukan hanya role admin.

---

## 12. Frontend Route Permission Mapping

| Route                      | Permission                |
| -------------------------- | ------------------------- |
| `/dashboard`               | `dashboard.view`          |
| `/patients`                | `patients.list`           |
| `/screenings`              | `screenings.list`         |
| `/history`                 | `history.view-own`        |
| `/reports`                 | `reports.view`            |
| `/profile`                 | `profile.view`            |
| `/profile/change-password` | `profile.change-password` |
| `/admin/students`          | `students.list`           |

Route berikut tidak memakai permission khusus:

| Route           | Behavior                                   |
| --------------- | ------------------------------------------ |
| `/login`        | hanya untuk guest                          |
| `/`             | redirect ke halaman pertama yang diizinkan |
| `/unauthorized` | authenticated user                         |
| `*`             | not found                                  |

---

## 13. Sidebar Permission Mapping

| Menu           | Route             | Permission         |
| -------------- | ----------------- | ------------------ |
| Dashboard      | `/dashboard`      | `dashboard.view`   |
| Pasien         | `/patients`       | `patients.list`    |
| Skrining       | `/screenings`     | `screenings.list`  |
| Riwayat        | `/history`        | `history.view-own` |
| Laporan        | `/reports`        | `reports.view`     |
| Data Mahasiswa | `/admin/students` | `students.list`    |

---

## 14. Profile Dropdown Permission Mapping

| Action         | Route                      | Permission                |
| -------------- | -------------------------- | ------------------------- |
| Profil         | `/profile`                 | `profile.view`            |
| Ganti Password | `/profile/change-password` | `profile.change-password` |
| Logout         | `/login` setelah logout    | authenticated user        |

Logout tidak membutuhkan permission khusus.

Logout hanya tersedia melalui profile dropdown.

---

## 15. Frontend Session Behavior

Frontend menyimpan session sementara di `sessionStorage`.

Isi session frontend:

```json
{
  "accessToken": "1|plain-text-token",
  "tokenType": "Bearer",
  "user": {
    "id": 1,
    "name": "Rina Nuraini",
    "nim": "251FK05002",
    "email": "rina.nuraini@example.com",
    "role": "nurse",
    "permissions": []
  }
}
```

Catatan:

- `accessToken` adalah hasil mapping dari backend field `token`.
- `tokenType` adalah hasil mapping dari backend field `token_type`.
- Data user akan disinkronkan ulang melalui `/api/me`.

---

## 16. Required Backend Security Behavior

Backend wajib menerapkan:

- password hashing;
- Sanctum token;
- token revocation saat logout;
- active account check;
- generic login error;
- request validation;
- role-safe login endpoint;
- permission middleware;
- policy per resource;
- ownership filtering;
- append-only rule untuk nurse;
- `401` untuk unauthenticated;
- `403` untuk forbidden;
- `422` untuk validation error.

Backend tidak boleh:

- menerima role dari payload login;
- menerima permission dari payload client;
- mengandalkan frontend sebagai keamanan utama;
- mengembalikan password;
- mengembalikan stack trace pada production;
- membuat nurse bisa update/delete data klinis lama.

---

## 17. Minimum Backend Ready Criteria

Frontend siap diuji dengan backend ketika endpoint berikut tersedia:

```text
POST /api/auth/login/nurse
POST /api/auth/login/admin
POST /api/auth/logout
GET /api/me
PATCH /api/me/password
```

Minimal response yang harus sesuai:

- login response;
- `/api/me` response;
- `401` response;
- `403` response;
- `422` validation response.

Jika lima endpoint tersebut sudah stabil, frontend RBAC dapat masuk API mode.

---

## 18. Frontend API Mode Checklist

Sebelum memakai API mode:

```env
VITE_AUTH_MODE=api
VITE_API_BASE_URL=http://localhost:8000/api
```

Restart dev server:

```bash
npm run dev
```

Frontend harus dapat:

- login sebagai nurse;
- login sebagai admin;
- fetch `/api/me`;
- logout;
- ganti password;
- menangani `401`;
- menangani `403`;
- menangani `422`;
- menampilkan sidebar sesuai permission.
