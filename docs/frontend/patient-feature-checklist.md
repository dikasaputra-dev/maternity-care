# MaternityCare — Patient Feature Checklist

Checklist ini digunakan sebelum melanjutkan ke fitur Skrining Awal.

## 1. Patient Directory

Expected:

- `/patients` dapat dibuka oleh user dengan permission `patients.list`.
- Table pasien tampil.
- Search nama pasien berjalan.
- Search nomor rekam medis berjalan.
- Filter risiko berjalan.
- Tombol Detail tampil.
- Tidak ada tombol Edit.
- Tidak ada tombol Delete.
- Nurse tidak melihat action edit/delete.

## 2. Patient Create

Expected:

- `/patients/create` dapat dibuka oleh user dengan permission `patients.create`.
- Nomor rekam medis tampil otomatis.
- Nomor rekam medis tidak dapat diinput manual.
- Lokasi pasien menggunakan dropdown.
- Nama pasien wajib diisi.
- Usia ibu wajib diisi.
- Usia ibu harus angka.
- Usia ibu berada di rentang valid.
- Nomor telepon wajib diisi.
- Alamat wajib diisi.
- Setelah simpan, user diarahkan ke detail pasien baru.
- Pasien baru memiliki status `Belum Skrining`.

## 3. Patient Detail

Expected:

- `/patients/:patientId` dapat dibuka oleh user dengan permission `patients.view`.
- Nama pasien tampil.
- Nomor rekam medis tampil.
- Status risiko tampil.
- Lokasi pasien tampil sebagai label.
- Telepon, usia, alamat, dan tanggal terdaftar tampil.
- Ringkasan obstetri tampil.
- Data obstetri pasien baru tampil `-`.
- Patient Journey tampil.
- Tidak ada tombol Edit.
- Tidak ada tombol Delete.

## 4. RBAC

Expected:

- User tanpa `patients.list` tidak bisa membuka `/patients`.
- User tanpa `patients.view` tidak bisa membuka `/patients/:patientId`.
- User tanpa `patients.create` tidak bisa membuka `/patients/create`.
- Nurse dapat melihat dan menambah pasien.
- Nurse tidak dapat mengedit atau menghapus pasien.

## 5. Mock Storage

Expected:

- Pasien baru disimpan di `sessionStorage`.
- Pasien baru muncul di daftar pasien selama session aktif.
- Data mock siap diganti API repository saat backend tersedia.

## 6. Final Acceptance

Feature Patient dianggap siap jika:

- Directory stabil.
- Create flow stabil.
- Detail shell stabil.
- Permission guard berjalan.
- Tidak ada error TypeScript.
- Tidak ada error ESLint.
- Build berhasil.
