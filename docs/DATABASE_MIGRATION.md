# Panduan Migrasi Database

Dokumen ini menjelaskan cara melakukan migrasi database untuk project LPK Merdeka menggunakan Prisma.

## 📋 Daftar Isi

- [Pengenalan](#pengenalan)
- [Setup Awal](#setup-awal)
- [Membuat Migrasi Baru](#membuat-migrasi-baru)
- [Menjalankan Migrasi](#menjalankan-migrasi)
- [Rollback Migrasi](#rollback-migrasi)
- [Reset Database](#reset-database)
- [Troubleshooting](#troubleshooting)
- [Riwayat Migrasi](#riwayat-migrasi)

## Pengenalan

Project ini menggunakan **Prisma** sebagai ORM (Object-Relational Mapping) untuk mengelola database MySQL. Prisma menyediakan sistem migrasi yang powerful untuk mengelola perubahan schema database dengan aman.

### Apa itu Migrasi?

Migrasi adalah cara untuk melacak dan menerapkan perubahan pada struktur database Anda. Setiap migrasi merepresentasikan satu set perubahan yang dapat diterapkan atau dibatalkan.

## Setup Awal

### 1. Konfigurasi Database

Pastikan file `.env` sudah dikonfigurasi dengan benar:

```env
DATABASE_URL="mysql://username:password@localhost:3306/lpk_backpanel"
```

Ganti `username`, `password`, dan nama database sesuai dengan konfigurasi MySQL Anda.

### 2. Verifikasi Koneksi Database

Cek apakah Prisma dapat terhubung ke database:

```bash
npx prisma db pull
```

Jika berhasil, Prisma akan mengambil schema dari database yang ada.

### 3. Generate Prisma Client

Setelah schema siap, generate Prisma Client:

```bash
npx prisma generate
```

## Membuat Migrasi Baru

### Langkah-langkah Membuat Migrasi

1. **Edit Schema Prisma**
   
   Buka file `prisma/schema.prisma` dan lakukan perubahan yang diinginkan. Contoh:
   
   ```prisma
   model cms_events {
     id          BigInt    @id @default(autoincrement()) @db.UnsignedBigInt
     title       String    @db.VarChar(255)
     description String    @db.Text
     event_date  DateTime  @db.Date
     created_at  DateTime? @db.Timestamp(0) @default(now())
     updated_at  DateTime? @db.Timestamp(0) @updatedAt
   }
   ```

2. **Buat Migrasi**
   
   Jalankan command berikut untuk membuat migrasi baru:
   
   ```bash
   npx prisma migrate dev --name nama_migrasi
   ```
   
   Contoh:
   ```bash
   npx prisma migrate dev --name add_events_table
   ```

3. **Review Migrasi**
   
   Prisma akan membuat file SQL di folder `prisma/migrations/`. Review file tersebut untuk memastikan perubahan sudah sesuai.

### Contoh Perubahan Schema

#### Menambah Kolom Baru

```prisma
model users {
  id         BigInt    @id @default(autoincrement())
  name       String    @db.VarChar(255)
  email      String    @unique @db.VarChar(255)
  phone      String?   @db.VarChar(20)  // Kolom baru
  created_at DateTime? @db.Timestamp(0)
}
```

```bash
npx prisma migrate dev --name add_phone_to_users
```

#### Menghapus Tabel

```prisma
// Hapus model yang tidak digunakan
// model old_table { ... }
```

```bash
npx prisma migrate dev --name remove_old_table
```

#### Mengubah Tipe Data

```prisma
model cms_articles {
  id      BigInt @id @default(autoincrement())
  content String @db.LongText  // Diubah dari Text ke LongText
}
```

```bash
npx prisma migrate dev --name change_article_content_type
```

## Menjalankan Migrasi

### Development Environment

Untuk menjalankan migrasi di development:

```bash
npx prisma migrate dev
```

Command ini akan:
1. Menerapkan semua migrasi yang belum diterapkan
2. Generate Prisma Client
3. Menjalankan seed (jika ada)

### Production Environment

Untuk production, gunakan:

```bash
npx prisma migrate deploy
```

Command ini hanya menerapkan migrasi tanpa membuat yang baru atau reset database.

### Melihat Status Migrasi

Untuk melihat migrasi mana yang sudah diterapkan:

```bash
npx prisma migrate status
```

## Rollback Migrasi

Prisma tidak memiliki command rollback otomatis. Untuk rollback:

### Metode 1: Reset dan Migrate Ulang

```bash
# Backup data terlebih dahulu!
npx prisma migrate reset
```

Ini akan:
1. Drop semua tabel
2. Jalankan ulang semua migrasi
3. Jalankan seed (jika ada)

⚠️ **WARNING**: Ini akan menghapus semua data!

### Metode 2: Manual Rollback

1. Identifikasi migrasi yang ingin di-rollback
2. Buat migrasi baru yang membalikkan perubahan
3. Terapkan migrasi baru tersebut

Contoh:
```bash
# Jika sebelumnya menambah kolom phone
# Buat migrasi untuk menghapusnya
npx prisma migrate dev --name remove_phone_from_users
```

## Reset Database

### Reset Lengkap

Untuk reset database ke state awal:

```bash
npx prisma migrate reset
```

Ini berguna saat:
- Development dan ingin mulai dari awal
- Migrasi bermasalah dan perlu di-reset
- Testing dengan data bersih

### Reset dengan Konfirmasi

```bash
npx prisma migrate reset --force
```

Skip konfirmasi (hati-hati di production!)

## Troubleshooting

### Error: "Migration failed to apply"

**Penyebab**: Perubahan schema konflik dengan data yang ada.

**Solusi**:
1. Backup data
2. Review file migrasi SQL
3. Edit manual jika perlu
4. Atau reset database: `npx prisma migrate reset`

### Error: "Database is out of sync"

**Penyebab**: Database tidak sesuai dengan schema Prisma.

**Solusi**:
```bash
npx prisma db push --force-reset
```

Atau:
```bash
npx prisma migrate reset
```

### Error: "EPERM: operation not permitted"

**Penyebab**: File Prisma Client terkunci (biasanya saat dev server berjalan).

**Solusi**:
1. Stop dev server (`Ctrl+C`)
2. Jalankan migrasi
3. Start ulang dev server

### Error: "P3009: Failed to create database"

**Penyebab**: Database belum dibuat atau koneksi gagal.

**Solusi**:
1. Buat database manual:
   ```sql
   CREATE DATABASE lpk_backpanel CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```
2. Cek kredensial di `.env`
3. Pastikan MySQL server berjalan

## Riwayat Migrasi

### Migrasi Terbaru (2026-01-09)

#### `remove_unused_tables`

**Tanggal**: 2026-01-09

**Deskripsi**: Menghapus tabel-tabel yang tidak digunakan dari database

**Tabel yang Dihapus**:
- `cache` - Tabel Laravel cache (tidak digunakan di Next.js)
- `cache_locks` - Tabel Laravel cache locks
- `failed_jobs` - Tabel Laravel queue system
- `jobs` - Tabel Laravel jobs
- `job_batches` - Tabel Laravel job batches
- `migrations` - Tabel Laravel migrations (tidak diperlukan untuk Prisma)
- `password_reset_tokens` - Tidak digunakan di aplikasi
- `personal_access_tokens` - Tidak digunakan (untuk Laravel Sanctum)
- `cms_hero` - Halaman beranda sudah dihapus dari CMS
- `cms_programs` - Halaman program sudah dihapus dari CMS

**Alasan**: 
- Tabel-tabel Laravel tidak relevan untuk Next.js
- Halaman CMS Hero dan Programs sudah dihapus dari aplikasi
- Membersihkan database dari tabel yang tidak terpakai

**Cara Menerapkan**:
```bash
npx prisma migrate dev --name remove_unused_tables
```

---

### Migrasi Sebelumnya

Dokumentasikan migrasi-migrasi sebelumnya di sini untuk referensi tim.

## Best Practices

### ✅ DO

- **Selalu backup data** sebelum migrasi di production
- **Test migrasi** di development terlebih dahulu
- **Gunakan nama migrasi yang deskriptif**: `add_user_phone`, bukan `update1`
- **Review file SQL** yang dihasilkan sebelum apply
- **Commit file migrasi** ke version control
- **Dokumentasikan perubahan** yang signifikan

### ❌ DON'T

- **Jangan edit file migrasi** yang sudah diterapkan
- **Jangan skip migrasi** di production
- **Jangan reset database** di production tanpa backup
- **Jangan ubah schema** langsung di database tanpa migrasi
- **Jangan commit file `.env`** ke version control

## Referensi

- [Prisma Migrate Documentation](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Schema Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)
- [Prisma CLI Reference](https://www.prisma.io/docs/reference/api-reference/command-reference)

---

Untuk pertanyaan atau masalah terkait migrasi database, hubungi Tim IT LPK Merdeka.
