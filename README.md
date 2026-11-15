## Informasi Mahasiswa

- **Nama:** Thoriq Abdurrohman Taqy
- **NIM:** 103022430006
- **Kelas:** SE-48-04
- **Mata Kuliah:** Perancangan dan Pemrograman Web (CCK3DAB3)
- **Tugas:** Week 09 - NestJS Dasar + Struktur MVC (Fullstack Monorepo FE & BE)
- **Repositori GitHub:** https://github.com/Thbetyfu/PENGWEB-MULAI-WEEK-7-Bengkelin.git

---

# Bengkelin — Fullstack Monorepo Architecture (FE & BE)

Aplikasi web modern untuk manajemen booking jadwal dan riwayat servis sepeda motor (konvensional & motor listrik). Proyek ini merupakan kelanjutan aplikasi pribadi **Bengkelin** yang telah dibangun sejak Pekan 2, bertransformasi menjadi Single Page Application (SPA) berbasis **React** di Pekan 6 & 7, dan kini direfaktor secara rapi menjadi arsitektur **Fullstack Monorepo (Frontend & Backend Terpisah)** dengan fondasi **NestJS (Model-View-Controller)** pada **Tugas Perkuliahan week 9**.

---

## 🚀 Struktur Direktori Proyek (Refactored FE & BE)

```text
PENGWEB-MULAI-WEEK-7-Bengkelin/
│
├── frontend/                            # [FE] SISI KLIEN / VIEW (React Vite)
│   ├── public/
│   ├── src/
│   │   ├── components/                 # Komponen UI modular
│   │   │   ├── Header.jsx
│   │   │   ├── RingkasanStatistik.jsx
│   │   │   ├── FormTambahServis.jsx
│   │   │   ├── DaftarServis.jsx
│   │   │   ├── KartuServis.jsx
│   │   │   └── ReferensiMotor.jsx
│   │   ├── services/
│   │   │   └── api.js                  # Fetch API ke Backend (port 3001)
│   │   ├── data/
│   │   │   └── servisAwal.js
│   │   ├── App.jsx                     # State lifting & full CRUD handler
│   │   └── main.jsx
│   ├── package.json                    # Dependensi Frontend (React, Vite)
│   └── vite.config.js
│
├── backend/                             # [BE] SISI SERVER / MODEL & CONTROLLER (NestJS)
│   ├── src/
│   │   ├── main.ts                     # Entry point (ValidationPipe, CORS, Port 3001)
│   │   ├── app.module.ts               # Root module
│   │   └── servis/
│   │       ├── servis.module.ts        # Module Servis
│   │       ├── servis.controller.ts    # Controller (C) via Dependency Injection
│   │       ├── servis.service.ts       # Service CRUD In-Memory (M) + Exceptions
│   │       ├── dto/
│   │       │   ├── create-servis.dto.ts# Validasi skema class-validator (8 aturan)
│   │       │   └── update-servis.dto.ts# PartialType Update
│   │       └── entities/
│   │           └── servis.entity.ts    # Model Entitas Servis (9 field)
│   ├── servis.http                     # Pengujian REST Client (9 skenario)
│   ├── package.json                    # Dependensi Backend (NestJS, class-validator)
│   └── tsconfig.json
│
├── docs/
│   └── screenshots/                    # Bukti pengujian UI & REST Client
│       ├── 01_struktur_folder_nest_mvc.png
│       ├── ...
│       └── 19_frontend_alur_hapus_servis.png
│
├── README.md                           # Dokumentasi komprehensif sistem
├── package.json                        # Root runner scripts
└── .gitignore
```

---

## 🛠️ Fitur & Implementasi Arsitektur MVC (Pekan 9)

### 1. Model (Entitas & DTO Validation)
- **Entitas Utama `Servis`** (`backend/src/servis/entities/servis.entity.ts`):
  Memuat 9 atribut representatif dengan variasi tipe data:
  - `id` (`string`): ID unik servis (`SRV-101`)
  - `kendaraan` (`string`): Model motor minimal 3 karakter
  - `platNomor` (`string`): Nomor polisi kendaraan
  - `jenisMotor` (`enum string`): `'Konvensional' | 'Listrik'`
  - `bengkel` (`string`): Mitra bengkel penanganan
  - `layanan` (`string`): Paket jenis perbaikan / servis
  - `biaya` (`number`): Tarif servis minimal Rp 10.000
  - `tanggal` (`string`): Format ISO `YYYY-MM-DD`
  - `status` (`enum string`): `'Dijadwalkan' | 'Selesai'`

- **Aturan class-validator pada DTO**:
  - `@IsString()` & `@IsNotEmpty()` untuk nama kendaraan, plat nomor, bengkel, layanan.
  - `@MinLength(3)` untuk memastikan nama kendaraan valid.
  - `@IsIn(['Konvensional', 'Listrik'])` & `@IsIn(['Dijadwalkan', 'Selesai'])` untuk membatasi opsi input.
  - `@IsNumber()` & `@Min(10000)` memvalidasi angka tarif.
  - `@IsDateString()` memvalidasi format penanggalan ISO.

- **Global ValidationPipe (`backend/src/main.ts`)**:
  - `whitelist: true`: Membuang otomatis atribut asing yang tidak dideklarasikan di DTO.
  - `forbidNonWhitelisted: true`: Menolak request dengan status HTTP 400 jika terdapat field liar.
  - `transform: true`: Mengubah payload menjadi instansiasi DTO.
  - `enableCors()`: Mengizinkan komunikasi aman dari frontend browser.

### 2. Service & Exception Handling
- `ServisService` (`backend/src/servis/servis.service.ts`) mengelola data di memori (in-memory array) dengan operasi CRUD lengkap:
  - `findAll(status?, jenisMotor?)`: Menampilkan semua riwayat antrean servis.
  - `findOne(id)`: Mengambil detail data berdasarkan ID.
  - `create(createServisDto)`: Menambah antrean dengan auto-increment ID (`SRV-xxx`).
  - `update(id, updateServisDto)`: Mengubah data servis parsial.
  - `remove(id)`: Menghapus data servis.
- **Dua Skenario Exception Bawaan NestJS**:
  - `NotFoundException` (404): Dilempar jika ID servis tidak ditemukan saat `findOne`, `update`, atau `remove`.
  - `ConflictException` (409): Dilempar saat menambahkan servis baru jika nomor plat dan tanggal servis sudah terdaftar dengan status 'Dijadwalkan'.

### 3. Controller & Dependency Injection
- `ServisController` (`backend/src/servis/servis.controller.ts`) mengimplementasikan seluruh method HTTP (`@Get()`, `@Get(':id')`, `@Post()`, `@Patch(':id')`, `@Delete(':id')`).
- Menerapkan prinsip **Inversion of Control (IoC)** di mana Service disuntikkan melalui konstruktor (`constructor(private readonly servisService: ServisService) {}`).

### 4. View (Integrasi Frontend React)
- Berkas `frontend/src/services/api.js` menghubungkan antarmuka React dengan backend NestJS (`http://localhost:3001/servis`).
- Alur penuh CRUD terintegrasi secara dinamis:
  - Membaca data secara otomatis saat mounting.
  - Menambah reservasi servis baru melalui form.
  - Mengubah status pengerjaan (PATCH) via kartu servis.
  - Menghapus data antrean (DELETE) dari server.

---

## 📡 Daftar Endpoint REST API

| Method | Endpoint | Status Sukses | Status Error | Deskripsi |
| :--- | :--- | :--- | :--- | :--- |
| **GET** | `/servis` | `200 OK` | - | Mengambil seluruh antrean servis |
| **GET** | `/servis/:id` | `200 OK` | `404 Not Found` | Mengambil detail servis berdasarkan ID |
| **POST** | `/servis` | `201 Created` | `400 Bad Request`, `409 Conflict` | Menambah antrean servis baru |
| **PATCH** | `/servis/:id` | `200 OK` | `404 Not Found`, `400 Bad Request` | Memperbarui data / status servis |
| **DELETE** | `/servis/:id` | `200 OK` | `404 Not Found` | Menghapus data servis |

---

## 💻 Panduan Menjalankan Aplikasi

### Cara 1: Menjalankan dari Root Repository (Praktis)

- **Menjalankan Backend (Port 3001)**:
  ```bash
  npm run start:backend
  ```
- **Menjalankan Frontend (Port 5173)**:
  ```bash
  npm run dev:frontend
  ```

### Cara 2: Menjalankan Manual per Folder

- **Backend (BE)**:
  ```bash
  cd backend
  npm run build
  node dist/src/main.js
  ```
- **Frontend (FE)**:
  ```bash
  cd frontend
  npm run dev
  ```

---

## 📸 Dokumentasi Bukti Pengujian (Pekan 9)

### A. Arsitektur & Kode Sumber
- **Struktur Folder MVC**:  
  ![Struktur Folder](docs/screenshots/01_struktur_folder_nest_mvc.png)
- **Definisi Entitas Servis**:  
  ![Entity Servis](docs/screenshots/02_entity_servis.png)
- **DTO class-validator**:  
  ![DTO](docs/screenshots/03_dto_class_validator.png)
- **Service CRUD In-Memory & Exceptions**:  
  ![Service](docs/screenshots/04_service_crud_in_memory.png)
- **Controller & Dependency Injection**:  
  ![Controller](docs/screenshots/05_controller_dependency_injection.png)
- **Global ValidationPipe & CORS (main.ts)**:  
  ![Main](docs/screenshots/06_main_validation_pipe_cors.png)

### B. Pengujian REST Client
- **GET All Servis (200 OK)**:  
  ![GET All](docs/screenshots/07_rest_client_get_all.png)
- **GET Servis by ID Valid (200 OK)**:  
  ![GET One](docs/screenshots/08_rest_client_get_by_id_success.png)
- **GET Servis by ID 404 (NotFoundException)**:  
  ![GET 404](docs/screenshots/09_rest_client_get_by_id_404_not_found.png)
- **POST Create Servis Sukses (201 Created)**:  
  ![POST Success](docs/screenshots/10_rest_client_post_success.png)
- **POST Create Duplikat 409 (ConflictException)**:  
  ![POST 409](docs/screenshots/11_rest_client_post_409_conflict.png)
- **POST Create Validasi Gagal 400 (Bad Request)**:  
  ![POST 400](docs/screenshots/12_rest_client_post_400_validation_error.png)
- **PATCH Update Servis (200 OK)**:  
  ![PATCH](docs/screenshots/13_rest_client_patch_success.png)
- **DELETE Servis Sukses (200 OK)**:  
  ![DELETE](docs/screenshots/14_rest_client_delete_success.png)
- **DELETE Servis 404 (NotFoundException)**:  
  ![DELETE 404](docs/screenshots/15_rest_client_delete_404_not_found.png)

### C. Pengujian Integrasi Frontend React
- **Frontend Terhubung ke Backend NestJS**:  
  ![Frontend Terhubung](docs/screenshots/16_frontend_terhubung_backend.png)
- **Alur Tambah Data Servis**:  
  ![Tambah Servis](docs/screenshots/17_frontend_alur_tambah_servis.png)
- **Alur Update Status Servis (PATCH)**:  
  ![Update Status](docs/screenshots/18_frontend_alur_update_status.png)
- **Alur Hapus Servis (DELETE)**:  
  ![Hapus Servis](docs/screenshots/19_frontend_alur_hapus_servis.png)

### D. Bukti Pengujian Langsung di Browser (Live User Verification)
- **Respon JSON Endpoint Backend `/servis` di Browser**:  
  ![Respon JSON Backend](docs/screenshots/20_browser_json_endpoint_servis.png)
- **Tampilan Antarmuka Frontend dengan Banner Hijau Status Fullstack & Toast**:  
  ![Banner Status & Toast](docs/screenshots/21_frontend_terhubung_banner_dan_toast.png)
- **Tampilan Grid Antrean Kartu Servis dari Backend**:  
  ![Grid Kartu Servis](docs/screenshots/22_frontend_grid_kartu_servis.png)
