-- 1. FUNCTION: Menghitung denda keterlambatan (Rp 2.000 per hari)
CREATE OR REPLACE FUNCTION FN_HITUNG_DENDA (
    p_due_date    IN DATE,
    p_return_date IN DATE
) RETURN NUMBER IS
    v_hari_telat NUMBER;
BEGIN
    v_hari_telat := TRUNC(p_return_date) - TRUNC(p_due_date);
    IF v_hari_telat > 0 THEN
        RETURN v_hari_telat * 2000;
    ELSE
        RETURN 0;
    END IF;
END;
/

-- 2. TRIGGER: Ubah status fisik buku otomatis saat dipinjam atau dikembalikan
CREATE OR REPLACE TRIGGER TRG_UPDATE_STATUS_BUKU
AFTER INSERT OR UPDATE OF status ON LOANS
FOR EACH ROW
BEGIN
    IF INSERTING THEN
        UPDATE BOOK_COPIES
        SET availability_status = 'BORROWED'
        WHERE copy_id = :NEW.copy_id;
    ELSIF UPDATING AND :NEW.status = 'RETURNED' THEN
        UPDATE BOOK_COPIES
        SET availability_status = 'AVAILABLE'
        WHERE copy_id = :NEW.copy_id;
    END IF;
END;
/

-- 3. PROCEDURE: Memproses pengembalian buku dan mencatat denda otomatis jika telat
CREATE OR REPLACE PROCEDURE SP_KEMBALIKAN_BUKU (
    p_loan_id     IN NUMBER,
    p_return_date IN DATE DEFAULT SYSDATE
) IS
    v_due_date DATE;
    v_denda    NUMBER;
BEGIN
    SELECT due_date INTO v_due_date FROM LOANS WHERE loan_id = p_loan_id;
    v_denda := FN_HITUNG_DENDA(v_due_date, p_return_date);

    UPDATE LOANS
    SET return_date = p_return_date,
        status = 'RETURNED'
    WHERE loan_id = p_loan_id;

    IF v_denda > 0 THEN
        INSERT INTO FINES (loan_id, amount, payment_status)
        VALUES (p_loan_id, v_denda, 'UNPAID');
    END IF;
    COMMIT;
END;
/