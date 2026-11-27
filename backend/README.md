# Backend REST API (Oracle ORDS)

Backend aplikasi **Smart Library Management System** dibangun menggunakan pendekatan _low-code_ melalui **Oracle REST Data Services (ORDS)** di Oracle APEX dengan modul `smart_library.api` (`/ords/id_b633_sql_s35/api/`).

## Daftar Endpoint API

| Method | Endpoint                  | Sumber / Logika Database                                   | Fungsi                                                  |
| :----- | :------------------------ | :--------------------------------------------------------- | :------------------------------------------------------ |
| `GET`  | `/books/`                 | `JOIN` `BOOKS`, `CATEGORIES`, `PUBLISHERS`                 | Menampilkan katalog semua buku                          |
| `GET`  | `/copies/available/`      | `JOIN` `BOOK_COPIES`, `BOOKS` (`AVAILABLE`)                | Menampilkan eksemplar buku yang siap dipinjam           |
| `GET`  | `/members/`               | `SELECT` dari `MEMBERS` (`ACTIVE`)                         | Menampilkan daftar anggota aktif                        |
| `GET`  | `/staff/`                 | `SELECT` dari `STAFF`                                      | Menampilkan daftar petugas perpustakaan                 |
| `POST` | `/loans/`                 | Memanggil prosedur `sp_borrow_book`                        | Mencatat peminjaman baru & memicu _trigger_ status buku |
| `GET`  | `/loans/active/`          | Query perhitungan keterlambatan & estimasi denda           | Menampilkan daftar buku yang sedang dipinjam            |
| `POST` | `/loans/:loan_id/return/` | Memanggil prosedur `sp_return_book`                        | Memproses pengembalian & kalkulasi denda otomatis       |
| `GET`  | `/reports/loans/`         | `JOIN` `LOANS`, `MEMBERS`, `BOOK_COPIES`, `BOOKS`, `FINES` | Laporan riwayat peminjaman dan status denda             |

## Cara Restore / Import di Oracle APEX

1. Buka **SQL Workshop** > **RESTful Services** di Oracle APEX.
2. Klik tombol **Import** di bagian kanan atas.
3. Unggah file `ORDS_REST_ID_B633_SQL_S35_smart_library.api_2026_11_27.sql` lalu jalankan.
4. Pastikan pengaturan **Origins Allowed** pada modul `smart_library.api` diisi `http://localhost:5173` (atau `*` untuk _deployment_ publik).
