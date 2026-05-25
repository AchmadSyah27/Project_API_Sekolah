# Project_API_Sekolah
Project API Sekolah ini dibangun sebagai sandbox (Playground) khusus untuk mensimulasikan skenario API Testing di dunia nyata. Didalamnya terdapat berbagai implementasi fitur seperti authentikasi JWT untuk security testing, validasi seperti fitur tambah, hapus dan menampilkan data siswa.

Project_API_Sekolah adalah layanan *backend* (RESTful API) yang dirancang untuk mendigitalisasi dan menyederhanakan manajemen data operasional sekolah. API ini mengelola data fundamental seperti siswa, guru, kelas, serta dilengkapi dengan sistem pengamanan data yang terintegrasi.

## Fitur Utama

- **Autentikasi & Keamanan (Auth):** Mengamankan *endpoint* sensitif menggunakan *middleware* autentikasi berbasis token (JWT/Session) untuk memastikan hanya pengguna sah yang dapat mengakses data.
- **Manajemen Data Siswa (CRUD):** Fitur lengkap untuk menambah, melihat, memperbarui, dan menghapus data siswa secara dinamis.
- **Pencarian & Validasi Pintar:** Fitur untuk menghapus data siswa secara spesifik berdasarkan parameter nama (`DELETE /students/name/:name`) dengan validasi *case-insensitive* (tidak sensitif huruf besar/kecil).

## Tech Stack

Proyek ini dibangun menggunakan ekosistem JavaScript modern pada sisi *backend*:

- **Runtime Environment:** Node.js
- **Backend Framework:** Express.js
- **Database lokal:** Lowdb / JSON-based Database (efisien untuk tahap pengembangan dan *prototyping*)
- **Environment Management:** Dotenv (`.env`) untuk mengamankan kredensial dan konfigurasi server.
- **Saat pembuatan repo ini, masih works pada npm versi 10.9.4 .**

## Cara Menjalankan Proyek di Lokal

### 1. Cloning Repository
git clone https://github.com/username-kamu/Project_API_Sekolah.git
cd Project_API_Sekolah https://github.com/AchmadSyah27/Project_API_Sekolah/edit/master/README.md

## 2. Install Dependencies
npm install

## 3. Jalankan server
node server.js

## 4. Jika sudah berhasil, akan jalan otomatis di port 3000. untuk URL-nya:
http://localhost:3000
Default login: admin / admin123

## 5. Jika terkendala pada uuid yang tidak kompatible ES Module. Bisa ganti ke versi sebelumnya dengan menjalankan:
npm install uuid@9
lalu run kembali node server.js

## 6. List endpoint:
Daftar user baru → POST → {{url}}auth/register 
Login, dapat JWT token → POST → {{url}}auth/login
Tambah siswa baru → POST → {{url}}students
Detail siswa → GET → {{url}}students/{id}
List semua siswa + filter + pagination → GET → {{url}}students
Update siswa → PUT → {{url}}students/{id}
Hapus siswa → Delete → {{url}}students/{id}
Hapus siswa via nama → Delete → {{url}}students/name/namaSiswa


Json untuk tambah siswa baru:
{
  "nis": "2024006",
  "name": "Testing",
  "kelas": "XII-A",
  "jurusan": "IPA",
  "email": "andrian@sekolah.id",
  "phone": "081234567895",
  "alamat": "Jl. Contoh No.6",
  "tanggal_lahir": "2007-01-15",
  "jenis_kelamin": "L"
}





## 7. Body JSON:
Tambah