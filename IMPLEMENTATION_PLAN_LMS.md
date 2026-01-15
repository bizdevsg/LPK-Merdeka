# Implementation Plan: Learning Management System & E-Library Expansion

Implementasi sistem manajemen pembelajaran (LMS), perpustakaan digital, dan modul kuis terpisah untuk LPK Merdeka.

## Phase 1: Database Schema & Backend Foundation
Mempersiapkan database untuk menampung struktur kurikulum yang kompleks dan tracking progress.

### 1. Update `schema.prisma`
Menambahkan model baru:
- `Program`: Tabel utama program (relasi ke `ProgramCategory`).
- `Module`: Bab/Section dalam program.
- `Lesson`: Unit terkecil (Content: Article, Video, Quiz).
- `Enrollment`: Mencatat user yang sudah membeli program.
- `UserProgress`: Mencatat materi mana yang sudah diselesaikan.
- `QuizAttempt`: Mencatat skor kuis.
- `Ebook`: Tabel manajemen buku digital.
- `WeeklyQuiz`: Tabel kuis mingguan standalone.
- `Certificate`: Metadata sertifikat yang diterbitkan.

### 2. Update API Routes
- Endpoint CRUD untuk CMS (Admin).
- Endpoint Learning untuk User (Fetch materi, Submit quiz, Update progress).

## Phase 2: Admin CMS (Content Management)
Halaman admin untuk menyusun kurikulum.

### 1. Program Manager (`/admin/cms/programs`)
- Create/Edit Program (Thumbnail, Price, Description - connect ke Pricing).
- **Curriculum Builder**: Interface untuk menambah Modul dan Lesson.
  - Text Editor (Rich Text) untuk materi bacaan.
  - Video Embed (YouTube/Files).
  - Quiz Builder (Question & Answer logic).

### 2. E-book Manager (`/admin/cms/ebooks`)
- Upload Cover & File PDF atau konten teks.

### 3. Weekly Quiz Manager (`/admin/cms/quizzes`)
- Membuat kuis standalone dengan setting passing grade.

## Phase 3: User Learning Experience (LMS Frontend)
Tampilan "Dicoding-style" yang clean dan fokus pada konten.

### 1. Classroom Layout
- **Sidebar**: Daftar Modul & Lesson (Accordions). Indikator centang hijau untuk materi selesai.
- **Main Area**: Render konten (Article Reader / Video Player / Quiz Interface).
- **Navigation**: Tombol Prev/Next.

### 2. Logic Progress
- Auto-mark as complete ketika video selesai ditonton atau artikel di-scroll habis.
- Quiz grading logic.
- Progress bar persentase penyelesaian program.

### 3. Certificate System
- Logic generate PDF/Image dinamis dengan Nama User & Program.
- Tombol "Claim Certificate" muncul hanya jika progress 100%.

## Phase 4: Public Catalog & Add-ons
Halaman akses untuk user biasa.

### 1. Program Catalog (`/programs`)
- Listing card program (Premium/Free).
- Halaman detail program (Silabus preview, Mentor info).
- Flow pembelian (Enrollment check).

### 2. E-Library (`/ebooks`)
- Grid cover buku.
- Reader mode nyaman (fokus baca).

### 3. Quiz Corner (`/quizzes`)
- Daftar kuis mingguan.
- Halaman pengerjaan time-bound (opsional).
- Instant Certificate download jika lulus passing grade.

## Phase 5: Technical Details & Libraries

### Libraries
- `react-markdown` atau `tiptap`: Untuk rendering materi bacaan.
- `jspdf` atau `html2canvas`: Untuk generate sertifikat client-side atau server-side.
- `react-player`: Untuk handling video.
- `lucide-react`: Icon set konsisten.

### Styling
- Menggunakan **Glassmorphism** dan **Vibrant Colors** sesuai `design-system`.
- Sidebar collapsible untuk mobile.
- Dark mode support full.
