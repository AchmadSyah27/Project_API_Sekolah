# 🏫 School API — Playground

API playground untuk manajemen data sekolah dengan fitur CRUD siswa, autentikasi JWT, dan local database (JSON file).

---

## 🚀 Cara Menjalankan

### 1. Install Node.js
Download dari https://nodejs.org (versi 14+)

### 2. Install Dependencies
```bash
npm install
```

### 3. Jalankan Server
```bash
node server.js
```

Server berjalan di: **http://localhost:3000**

### 4. Default Login
```
Username : admin
Password : admin123
```

---

## 📁 Struktur Project

```
school-api/
├── server.js      → Main server & semua endpoint
├── db.json        → Local database (auto-generated)
├── package.json   → Dependencies
└── README.md      → Dokumentasi ini
```

---

## 🔗 Endpoint API

### AUTH

#### POST /auth/register — Daftar User Baru
```json
Request Body:
{
  "username": "guru1",
  "password": "password123",
  "role": "user"
}

Response 201:
{
  "success": true,
  "message": "Registrasi berhasil",
  "data": {
    "id": "uuid",
    "username": "guru1",
    "role": "user",
    "created_at": "2026-01-01T00:00:00.000Z"
  }
}
```

#### POST /auth/login — Login
```json
Request Body:
{
  "username": "admin",
  "password": "admin123"
}

Response 200:
{
  "success": true,
  "message": "Login berhasil",
  "data": {
    "token": "eyJhbGci...",
    "expires_in": "24h",
    "user": {
      "id": "uuid",
      "username": "admin",
      "role": "admin"
    }
  }
}
```

---

### STUDENTS (Butuh Token Authorization)

> Semua endpoint siswa butuh header:
> `Authorization: Bearer <token>`

#### GET /students — Ambil Semua Siswa
```
Query params (opsional):
- name   : filter by nama (contains)
- kelas  : filter by kelas (exact)
- page   : halaman (default: 1)
- limit  : jumlah data per halaman (default: 10)

Contoh: GET /students?kelas=X-A&page=1&limit=5

Response 200:
{
  "success": true,
  "message": "Data siswa berhasil diambil",
  "data": [...],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 10,
    "total_pages": 1
  }
}
```

#### GET /students/:id — Ambil Siswa by ID
```
Response 200:
{
  "success": true,
  "message": "Data siswa ditemukan",
  "data": {
    "id": "uuid",
    "nis": "2024001",
    "name": "Budi Santoso",
    "kelas": "X-A",
    "jurusan": "IPA",
    "email": "budi@sekolah.id",
    "phone": "081234567890",
    "alamat": "Jl. Merdeka No.1",
    "tanggal_lahir": "2008-03-15",
    "jenis_kelamin": "L",
    "created_at": "...",
    "updated_at": "..."
  }
}
```

#### POST /students — Tambah Siswa Baru
```json
Request Body:
{
  "nis": "2024006",
  "name": "Nama Siswa",
  "kelas": "X-A",
  "jurusan": "IPA",
  "email": "siswa@sekolah.id",
  "phone": "081234567895",
  "alamat": "Jl. Contoh No.6",
  "tanggal_lahir": "2008-01-01",
  "jenis_kelamin": "L"
}

Wajib diisi: nis, name, kelas
```

#### PUT /students/:id — Update Data Siswa
```json
Request Body (semua field opsional):
{
  "name": "Nama Baru",
  "kelas": "XI-A",
  "email": "baru@sekolah.id"
}
```

#### DELETE /students/:id — Hapus Siswa
```
Response 200:
{
  "success": true,
  "message": "Data siswa berhasil dihapus",
  "data": {
    "id": "uuid",
    "name": "Budi Santoso"
  }
}
```

---

## 🔥 Contoh Testing di JMeter

### Flow Testing:
1. **POST /auth/login** → Extract token
2. **GET /students** → List semua siswa
3. **POST /students** → Tambah siswa baru
4. **GET /students/:id** → Cek siswa yang baru dibuat
5. **PUT /students/:id** → Update data siswa
6. **DELETE /students/:id** → Hapus siswa

### HTTP Header Manager (untuk semua endpoint siswa):
```
Authorization : Bearer ${token}
Content-Type  : application/json
```

---

## 📊 Response Code

| Code | Artinya |
|------|---------|
| 200  | Success |
| 201  | Created |
| 400  | Bad Request (field kurang) |
| 401  | Unauthorized (token salah/expired) |
| 404  | Data tidak ditemukan |
| 409  | Conflict (NIS/username sudah ada) |

---

## 🗄️ Database

Data disimpan di file `db.json` secara lokal. File ini otomatis dibuat saat server pertama kali dijalankan.

Sample data siswa sudah di-seed otomatis:
- 5 siswa dari kelas X-A, X-B, XI-A, XI-B
- 1 user admin (admin/admin123)
