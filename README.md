# Smart Library Management System

Aplikasi web manajemen perpustakaan digital berbasis arsitektur _decoupled_ yang mengintegrasikan **Oracle Database (PL/SQL)**, **Oracle REST Data Services (ORDS)** sebagai _low-code backend_, serta **React + Vite** pada sisi _frontend_.

---

## Anggota Kelompok

| No  | Nama Lengkap                     | NIM          | Peran / Pembagian Tugas                                  |
| :-- | :------------------------------- | :----------- | :------------------------------------------------------- |
| 1   | **Muhammad Ghassan Dzul Hannan** | `1251420089` | Frontend Development & Integrasi REST API (React + Vite) |
| 2   | **Shafwan Anwar**                | `1251420096` | Database Design (DDL/DML), PL/SQL, & Oracle ORDS API     |
| 3   | **Daniyal Haritz**               | `1251420093` | Dokumentasi, Pengujian Sistem, & Laporan                 |

---

## Arsitektur & Teknologi

- **Database:** Oracle Database (10 tabel relasional, _Trigger_, _Stored Procedure_, dan kalkulasi denda otomatis).
- **Backend API (Low-Code):** Oracle APEX & Oracle REST Data Services (ORDS) — modul `smart_library.api`.
- **Frontend:** React 19, Vite, Tailwind CSS v4, dan Lucide Icons.

---

## Struktur Direktori Repositori

```text
uasdatabase-main/
├── database/       # Skrip DDL (skema 10 tabel), DML (data uji), serta PL/SQL (Trigger & Procedure)
├── backend/        # Skrip export konfigurasi ORDS REST API, payload uji, dan dokumentasi endpoint
├── frontend/       # Aplikasi web antarmuka pengguna berbasis React + Vite + Tailwind CSS
└── README.md       # Dokumentasi utama proyek
```
