# Struktur Database LPK Merdeka

Dokumentasi ini menjelaskan struktur database lengkap untuk aplikasi LPK Merdeka.

## 📋 Daftar Isi

- [Overview](#overview)
- [Diagram ERD](#diagram-erd)
- [Tabel-tabel](#tabel-tabel)
  - [Core Tables](#core-tables)
  - [CMS Tables](#cms-tables)
- [Relasi Antar Tabel](#relasi-antar-tabel)
- [Indexes](#indexes)
- [Konvensi Penamaan](#konvensi-penamaan)

## Overview

Database LPK Merdeka menggunakan **MySQL** dengan **Prisma ORM**. Database ini terdiri dari 2 kategori utama:

1. **Core Tables**: Tabel untuk fitur inti aplikasi (users, attendance, sessions)
2. **CMS Tables**: Tabel untuk Content Management System

**Total Tabel**: 9 tabel aktif

## Diagram ERD

```
┌─────────────────┐
│     users       │
├─────────────────┤
│ id (PK)         │
│ name            │
│ email (UNIQUE)  │
│ password        │
│ role            │
│ created_at      │
│ updated_at      │
└────────┬────────┘
         │
         │ 1:N
         │
┌────────▼────────────────────┐
│   attendance_records        │
├─────────────────────────────┤
│ id (PK)                     │
│ user_id (FK)                │
│ attendance_session_id (FK)  │
│ check_in_time               │
│ created_at                  │
│ updated_at                  │
└────────┬────────────────────┘
         │
         │ N:1
         │
┌────────▼──────────────┐
│ attendance_sessions   │
├───────────────────────┤
│ id (PK)               │
│ title                 │
│ date                  │
│ start_time            │
│ end_time              │
│ is_active             │
│ created_at            │
│ updated_at            │
└───────────────────────┘

┌─────────────────┐
│   sessions      │
├─────────────────┤
│ id (PK)         │
│ user_id         │
│ ip_address      │
│ user_agent      │
│ payload         │
│ last_activity   │
└─────────────────┘

CMS Tables (Independent):
┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
│  cms_gallery     │  │  cms_faq         │  │ cms_testimonials │
├──────────────────┤  ├──────────────────┤  ├──────────────────┤
│ id (PK)          │  │ id (PK)          │  │ id (PK)          │
│ title            │  │ question         │  │ name             │
│ image_url        │  │ answer           │  │ role             │
│ type             │  │ category         │  │ content          │
│ category         │  │ order            │  │ avatar_url       │
│ created_at       │  │ created_at       │  │ rating           │
│ updated_at       │  │ updated_at       │  │ created_at       │
└──────────────────┘  └──────────────────┘  │ updated_at       │
                                             └──────────────────┘

┌──────────────────┐  ┌──────────────────┐
│  cms_settings    │  │  cms_articles    │
├──────────────────┤  ├──────────────────┤
│ key (PK)         │  │ id (PK)          │
│ value            │  │ title            │
│ created_at       │  │ slug (UNIQUE)    │
│ updated_at       │  │ content          │
└──────────────────┘  │ excerpt          │
                      │ thumbnail_url    │
                      │ author           │
                      │ is_published     │
                      │ published_at     │
                      │ created_at       │
                      │ updated_at       │
                      └──────────────────┘
```

## Tabel-tabel

### Core Tables

#### 1. `users`

Tabel untuk menyimpan data pengguna aplikasi.

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| `id` | BigInt | PK, Auto Increment | ID unik pengguna |
| `name` | VARCHAR(255) | NOT NULL | Nama lengkap pengguna |
| `email` | VARCHAR(255) | UNIQUE, NOT NULL | Email pengguna (untuk login) |
| `email_verified_at` | TIMESTAMP | NULL | Waktu verifikasi email |
| `role` | VARCHAR(255) | DEFAULT 'user' | Role pengguna (user/admin/superAdmin) |
| `password` | VARCHAR(255) | NOT NULL | Password terenkripsi |
| `remember_token` | VARCHAR(100) | NULL | Token untuk remember me |
| `created_at` | TIMESTAMP | NULL | Waktu pembuatan record |
| `updated_at` | TIMESTAMP | NULL | Waktu update terakhir |

**Indexes**:
- PRIMARY KEY: `id`
- UNIQUE: `email`

**Relasi**:
- Has Many: `attendance_records`

**Role Values**:
- `user`: Pengguna biasa
- `admin`: Administrator
- `superAdmin`: Super Administrator

---

#### 2. `sessions`

Tabel untuk menyimpan session pengguna (NextAuth.js).

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| `id` | VARCHAR(255) | PK | Session ID |
| `user_id` | BigInt | NULL | ID pengguna (jika login) |
| `ip_address` | VARCHAR(45) | NULL | IP address pengguna |
| `user_agent` | TEXT | NULL | User agent browser |
| `payload` | LONGTEXT | NOT NULL | Data session |
| `last_activity` | INT | NOT NULL | Timestamp aktivitas terakhir |

**Indexes**:
- PRIMARY KEY: `id`
- INDEX: `user_id`
- INDEX: `last_activity`

---

#### 3. `attendance_sessions`

Tabel untuk menyimpan sesi absensi.

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| `id` | BigInt | PK, Auto Increment | ID unik sesi |
| `title` | VARCHAR(255) | NOT NULL | Judul sesi absensi |
| `date` | DATE | NOT NULL | Tanggal sesi |
| `start_time` | TIME | NOT NULL | Waktu mulai |
| `end_time` | TIME | NOT NULL | Waktu selesai |
| `is_active` | BOOLEAN | DEFAULT true | Status aktif sesi |
| `created_at` | TIMESTAMP | NULL | Waktu pembuatan |
| `updated_at` | TIMESTAMP | NULL | Waktu update |

**Indexes**:
- PRIMARY KEY: `id`

**Relasi**:
- Has Many: `attendance_records`

---

#### 4. `attendance_records`

Tabel untuk menyimpan rekaman absensi pengguna.

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| `id` | BigInt | PK, Auto Increment | ID unik record |
| `user_id` | BigInt | FK, NOT NULL | ID pengguna yang absen |
| `attendance_session_id` | BigInt | FK, NOT NULL | ID sesi absensi |
| `check_in_time` | TIMESTAMP | NOT NULL | Waktu check-in |
| `created_at` | TIMESTAMP | NULL | Waktu pembuatan |
| `updated_at` | TIMESTAMP | NULL | Waktu update |

**Indexes**:
- PRIMARY KEY: `id`
- INDEX: `user_id`
- INDEX: `attendance_session_id`

**Foreign Keys**:
- `user_id` → `users.id` (ON DELETE CASCADE)
- `attendance_session_id` → `attendance_sessions.id` (ON DELETE CASCADE)

**Relasi**:
- Belongs To: `users`
- Belongs To: `attendance_sessions`

---

### CMS Tables

#### 5. `cms_gallery`

Tabel untuk menyimpan galeri foto dan video.

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| `id` | BigInt | PK, Auto Increment | ID unik galeri |
| `title` | VARCHAR(255) | NULL | Judul/caption |
| `image_url` | VARCHAR(255) | NOT NULL | URL gambar/video |
| `type` | VARCHAR(20) | DEFAULT 'image' | Tipe media (image/video) |
| `category` | VARCHAR(50) | NULL | Kategori galeri |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Waktu pembuatan |
| `updated_at` | TIMESTAMP | AUTO UPDATE | Waktu update |

**Indexes**:
- PRIMARY KEY: `id`

**Type Values**:
- `image`: Foto
- `video`: Video

---

#### 6. `cms_faq`

Tabel untuk menyimpan FAQ (Frequently Asked Questions).

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| `id` | BigInt | PK, Auto Increment | ID unik FAQ |
| `question` | TEXT | NOT NULL | Pertanyaan |
| `answer` | TEXT | NOT NULL | Jawaban |
| `category` | VARCHAR(50) | NULL | Kategori FAQ |
| `order` | INT | DEFAULT 0 | Urutan tampilan |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Waktu pembuatan |
| `updated_at` | TIMESTAMP | AUTO UPDATE | Waktu update |

**Indexes**:
- PRIMARY KEY: `id`

**Category Values**:
- `General`: Pertanyaan umum
- `Registration`: Pertanyaan tentang pendaftaran

---

#### 7. `cms_testimonials`

Tabel untuk menyimpan testimoni pengguna/alumni.

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| `id` | BigInt | PK, Auto Increment | ID unik testimoni |
| `name` | VARCHAR(100) | NOT NULL | Nama pemberi testimoni |
| `role` | VARCHAR(100) | NOT NULL | Jabatan/status |
| `content` | TEXT | NOT NULL | Isi testimoni |
| `avatar_url` | VARCHAR(255) | NULL | URL foto profil |
| `rating` | INT | DEFAULT 5 | Rating (1-5) |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Waktu pembuatan |
| `updated_at` | TIMESTAMP | AUTO UPDATE | Waktu update |

**Indexes**:
- PRIMARY KEY: `id`

**Rating Range**: 1-5 (bintang)

---

#### 8. `cms_settings`

Tabel untuk menyimpan pengaturan website (key-value store).

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| `key` | VARCHAR(50) | PK | Kunci pengaturan |
| `value` | TEXT | NOT NULL | Nilai pengaturan |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Waktu pembuatan |
| `updated_at` | TIMESTAMP | AUTO UPDATE | Waktu update |

**Indexes**:
- PRIMARY KEY: `key`

**Contoh Settings**:
- `site_name`: Nama website
- `contact_email`: Email kontak
- `contact_phone`: Nomor telepon
- `address`: Alamat
- `social_facebook`: URL Facebook
- `social_instagram`: URL Instagram

---

#### 9. `cms_articles`

Tabel untuk menyimpan artikel dan berita.

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|------------|-----------|
| `id` | BigInt | PK, Auto Increment | ID unik artikel |
| `title` | VARCHAR(255) | NOT NULL | Judul artikel |
| `slug` | VARCHAR(255) | UNIQUE, NOT NULL | URL-friendly slug |
| `content` | LONGTEXT | NOT NULL | Konten artikel (HTML) |
| `excerpt` | TEXT | NULL | Ringkasan artikel |
| `thumbnail_url` | VARCHAR(255) | NULL | URL gambar thumbnail |
| `author` | VARCHAR(100) | NULL | Nama penulis |
| `is_published` | BOOLEAN | DEFAULT false | Status publikasi |
| `published_at` | TIMESTAMP | NULL | Waktu publikasi |
| `created_at` | TIMESTAMP | DEFAULT NOW() | Waktu pembuatan |
| `updated_at` | TIMESTAMP | AUTO UPDATE | Waktu update |

**Indexes**:
- PRIMARY KEY: `id`
- UNIQUE: `slug`

---

## Relasi Antar Tabel

### One-to-Many Relationships

1. **users → attendance_records**
   - Satu user dapat memiliki banyak attendance records
   - Foreign Key: `attendance_records.user_id` → `users.id`
   - ON DELETE: CASCADE

2. **attendance_sessions → attendance_records**
   - Satu sesi absensi dapat memiliki banyak attendance records
   - Foreign Key: `attendance_records.attendance_session_id` → `attendance_sessions.id`
   - ON DELETE: CASCADE

### Independent Tables

Tabel-tabel CMS tidak memiliki relasi foreign key dengan tabel lain:
- `cms_gallery`
- `cms_faq`
- `cms_testimonials`
- `cms_settings`
- `cms_articles`

## Indexes

### Primary Keys
Semua tabel memiliki primary key pada kolom `id`, kecuali:
- `sessions`: PK pada `id` (VARCHAR)
- `cms_settings`: PK pada `key` (VARCHAR)

### Unique Indexes
- `users.email`: Memastikan email unik
- `cms_articles.slug`: Memastikan slug artikel unik

### Foreign Key Indexes
- `attendance_records.user_id`
- `attendance_records.attendance_session_id`

### Performance Indexes
- `sessions.user_id`: Untuk query session berdasarkan user
- `sessions.last_activity`: Untuk cleanup session lama

## Konvensi Penamaan

### Tabel
- Menggunakan **snake_case**
- Menggunakan **plural** untuk nama tabel (users, sessions)
- Prefix `cms_` untuk tabel Content Management System

### Kolom
- Menggunakan **snake_case**
- Timestamp: `created_at`, `updated_at`
- Foreign Key: `{table_singular}_id` (contoh: `user_id`)
- Boolean: prefix `is_` (contoh: `is_active`, `is_published`)

### Tipe Data
- ID: `BigInt` dengan `@db.UnsignedBigInt`
- String pendek: `VARCHAR(255)`
- String panjang: `TEXT` atau `LONGTEXT`
- Timestamp: `TIMESTAMP(0)`
- Boolean: `BOOLEAN` (TINYINT(1) di MySQL)

## Migrasi Database

Untuk informasi lengkap tentang migrasi database, lihat [DATABASE_MIGRATION.md](./DATABASE_MIGRATION.md).

### Quick Commands

```bash
# Lihat status migrasi
npx prisma migrate status

# Jalankan migrasi
npx prisma migrate dev

# Reset database (development only)
npx prisma migrate reset

# Generate Prisma Client
npx prisma generate

# Buka Prisma Studio (GUI)
npx prisma studio
```

## Prisma Studio

Untuk melihat dan mengelola data dengan GUI:

```bash
npx prisma studio
```

Akan membuka browser di `http://localhost:5555` dengan interface untuk:
- Browse semua tabel
- Create, Read, Update, Delete records
- Filter dan search data

## Backup Database

### Backup Manual

```bash
# Backup database
mysqldump -u username -p lpk_backpanel > backup_$(date +%Y%m%d).sql

# Restore database
mysql -u username -p lpk_backpanel < backup_20260109.sql
```

### Backup Otomatis

Disarankan untuk setup cron job atau scheduled task untuk backup otomatis database secara berkala.

## Referensi

- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [MySQL Data Types](https://dev.mysql.com/doc/refman/8.0/en/data-types.html)
- [Database Normalization](https://en.wikipedia.org/wiki/Database_normalization)

---

Untuk pertanyaan atau masalah terkait struktur database, hubungi Tim IT LPK Merdeka.
