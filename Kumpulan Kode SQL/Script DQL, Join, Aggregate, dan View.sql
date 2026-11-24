-- VIEW 1: Laporan Peminjaman Lengkap dengan JOIN
CREATE OR REPLACE VIEW V_LAPORAN_PEMINJAMAN AS
SELECT 
    l.loan_id,
    m.name AS nama_anggota,
    b.title AS judul_buku,
    bc.barcode AS kode_eksemplar,
    s.name AS petugas,
    l.loan_date,
    l.due_date,
    l.return_date,
    l.status AS status_pinjam,
    NVL(f.amount, 0) AS nominal_denda
FROM LOANS l
JOIN MEMBERS m ON l.member_id = m.member_id
JOIN STAFF s ON l.staff_id = s.staff_id
JOIN BOOK_COPIES bc ON l.copy_id = bc.copy_id
JOIN BOOKS b ON bc.book_id = b.book_id
LEFT JOIN FINES f ON l.loan_id = f.loan_id;

-- VIEW 2: Statistik Buku Paling Sering Dipinjam dengan AGGREGATE
CREATE OR REPLACE VIEW V_BUKU_TERPOPULER AS
SELECT 
    b.book_id,
    b.title AS judul_buku,
    c.category_name AS kategori,
    COUNT(l.loan_id) AS total_dipinjam
FROM BOOKS b
JOIN CATEGORIES c ON b.category_id = c.category_id
LEFT JOIN BOOK_COPIES bc ON b.book_id = bc.book_id
LEFT JOIN LOANS l ON bc.copy_id = l.copy_id
GROUP BY b.book_id, b.title, c.category_name
ORDER BY total_dipinjam DESC;