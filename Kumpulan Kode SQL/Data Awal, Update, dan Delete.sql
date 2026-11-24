-- Mengisi data master
INSERT INTO CATEGORIES (category_name) VALUES ('Teknologi Informasi');
INSERT INTO CATEGORIES (category_name) VALUES ('Basis Data');
INSERT INTO CATEGORIES (category_name) VALUES ('Fiksi Sains');

INSERT INTO PUBLISHERS (publisher_name) VALUES ('Informatika Bandung');
INSERT INTO PUBLISHERS (publisher_name) VALUES ('Andi Publisher');
INSERT INTO PUBLISHERS (publisher_name) VALUES ('Gramedia Pustaka');

INSERT INTO AUTHORS (author_name) VALUES ('Abdul Kadir');
INSERT INTO AUTHORS (author_name) VALUES ('Ramez Elmasri');
INSERT INTO AUTHORS (author_name) VALUES ('Tere Liye');

INSERT INTO BOOKS (category_id, publisher_id, title, isbn, publication_year)
VALUES (1, 1, 'Pemrograman Python Dasar', '978-602-1514-01', 2023);

INSERT INTO BOOKS (category_id, publisher_id, title, isbn, publication_year)
VALUES (2, 2, 'Sistem Basis Data Relasional', '978-979-29-5501', 2022);

INSERT INTO BOOKS (category_id, publisher_id, title, isbn, publication_year)
VALUES (3, 3, 'Bumi', '978-602-03-0112', 2020);

-- Menghubungkan buku dan penulis
INSERT INTO BOOK_AUTHORS (book_id, author_id) VALUES (1, 1);
INSERT INTO BOOK_AUTHORS (book_id, author_id) VALUES (2, 2);
INSERT INTO BOOK_AUTHORS (book_id, author_id) VALUES (3, 3);

-- Mengisi eksemplar fisik buku
INSERT INTO BOOK_COPIES (book_id, barcode, availability_status) VALUES (1, 'LIB-PY-001', 'AVAILABLE');
INSERT INTO BOOK_COPIES (book_id, barcode, availability_status) VALUES (1, 'LIB-PY-002', 'AVAILABLE');
INSERT INTO BOOK_COPIES (book_id, barcode, availability_status) VALUES (2, 'LIB-DB-001', 'AVAILABLE');
INSERT INTO BOOK_COPIES (book_id, barcode, availability_status) VALUES (3, 'LIB-BM-001', 'AVAILABLE');

-- Mengisi data anggota dan petugas
INSERT INTO MEMBERS (name, email, phone, status)
VALUES ('Ahmad Fauzan', 'fauzan@mhs.uinjkt.ac.id', '081234567890', 'ACTIVE');

INSERT INTO MEMBERS (name, email, phone, status)
VALUES ('Siti Nurhaliza', 'siti@mhs.uinjkt.ac.id', '081298765432', 'ACTIVE');

INSERT INTO STAFF (name, email, username)
VALUES ('Budi Santoso', 'budi.staff@library.ac.id', 'admin_budi');

-- Contoh simulasi UPDATE dan DELETE
UPDATE MEMBERS SET phone = '081211112222' WHERE member_id = 1;
DELETE FROM BOOK_COPIES WHERE barcode = 'LIB-PY-002';
COMMIT;