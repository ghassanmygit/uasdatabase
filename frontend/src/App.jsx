import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Home,
  Grid,
  ArrowLeftRight,
  FileText,
  Search,
  PlusCircle,
  CheckCircle,
  AlertCircle,
  X,
  Calendar,
  User,
  Sparkles,
  ChevronDown,
} from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL;

const COVER_STYLES = [
  "from-[#2F5D50] to-[#1D3B32] text-white",
  "from-amber-700 to-yellow-900 text-amber-50",
  "from-teal-700 to-emerald-900 text-white",
  "from-slate-700 to-slate-900 text-white",
  "from-stone-600 to-stone-800 text-stone-100",
  "from-[#4A6B5D] to-[#2F5D50] text-white",
];

export default function App() {
  const [activeTab, setActiveTab] = useState("home");
  const [books, setBooks] = useState([]);
  const [availableCopies, setAvailableCopies] = useState([]);
  const [members, setMembers] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [activeLoans, setActiveLoans] = useState([]);
  const [loanReports, setLoanReports] = useState([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [selectedBook, setSelectedBook] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState(null);

  const defaultDue = new Date(Date.now() + 7 * 86400000)
    .toISOString()
    .split("T")[0];
  const [loanForm, setLoanForm] = useState({
    member_id: "",
    staff_id: "",
    copy_id: "",
    due_date: defaultDue,
  });

  const showNotif = (type, message) => {
    setNotif({ type, message });
    setTimeout(() => setNotif(null), 4000);
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [resBooks, resCopies, resMembers, resStaff, resActive, resReports] =
        await Promise.all([
          fetch(`${API_BASE}/books/`).then((r) => r.json()),
          fetch(`${API_BASE}/copies/available/`).then((r) => r.json()),
          fetch(`${API_BASE}/members/`).then((r) => r.json()),
          fetch(`${API_BASE}/staff/`).then((r) => r.json()),
          fetch(`${API_BASE}/loans/active/`).then((r) => r.json()),
          fetch(`${API_BASE}/reports/loans/`).then((r) => r.json()),
        ]);

      setBooks(resBooks.items || []);
      setAvailableCopies(resCopies.items || []);
      setMembers(resMembers.items || []);
      setStaffList(resStaff.items || []);
      setActiveLoans(resActive.items || []);
      setLoanReports(resReports.items || []);
    } catch (err) {
      console.error(err);
      showNotif(
        "error",
        "Gagal terhubung ke Oracle ORDS API. Cek URL .env atau CORS.",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  const categories = [
    "ALL",
    ...new Set(books.map((b) => b.category_name).filter(Boolean)),
  ];

  const filteredBooks = books.filter((b) => {
    const matchSearch =
      b.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.isbn?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat =
      selectedCategory === "ALL" || b.category_name === selectedCategory;
    return matchSearch && matchCat;
  });

  const handleCreateLoan = async (e) => {
    e.preventDefault();
    if (!loanForm.member_id || !loanForm.staff_id || !loanForm.copy_id) {
      showNotif(
        "error",
        "Pilih anggota, petugas, dan eksemplar buku terlebih dahulu.",
      );
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/loans/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          member_id: Number(loanForm.member_id),
          staff_id: Number(loanForm.staff_id),
          copy_id: Number(loanForm.copy_id),
          due_date: loanForm.due_date,
        }),
      });

      if (!res.ok) throw new Error("Gagal mencatat peminjaman");
      const data = await res.json();
      showNotif(
        "success",
        `${data.message || "Peminjaman berhasil"} (ID: #${data.loan_id})`,
      );
      setLoanForm({ ...loanForm, copy_id: "" });
      fetchAllData();
      setActiveTab("circulation");
    } catch (err) {
      showNotif("error", "Terjadi kesalahan saat memproses peminjaman.");
    }
  };

  const handleReturnBook = async (loanId) => {
    try {
      const res = await fetch(`${API_BASE}/loans/${loanId}/return/`, {
        method: "POST",
      });
      if (!res.ok) throw new Error("Gagal mengembalikan buku");
      showNotif(
        "success",
        `Buku pada transaksi #${loanId} berhasil dikembalikan!`,
      );
      fetchAllData();
    } catch (err) {
      showNotif("error", "Gagal memproses pengembalian buku.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F6F7F4]">
      {/* Sidebar Navigasi */}
      <aside className="w-full md:w-64 bg-white border-b md:border-r border-[#E2E8E4] p-5 flex flex-col justify-between shadow-xs">
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-2xl bg-[#2F5D50] flex items-center justify-center text-white shadow-md shadow-[#2F5D50]/20">
              <BookOpen size={22} />
            </div>
            <div>
              <h1 className="font-bold text-gray-800 text-lg leading-tight">
                Smart Library
              </h1>
              <span className="text-xs text-[#2F5D50] font-medium">
                Oracle ORDS Cloud
              </span>
            </div>
          </div>

          <nav className="flex md:flex-col gap-2 overflow-x-auto">
            {[
              { id: "home", label: "Explore Books", icon: Home },
              { id: "categories", label: "Categories", icon: Grid },
              {
                id: "circulation",
                label: "Pinjam & Kembali",
                icon: ArrowLeftRight,
              },
              { id: "reports", label: "Laporan & Denda", icon: FileText },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[#2F5D50] text-white shadow-md shadow-[#2F5D50]/20"
                      : "text-gray-500 hover:bg-[#EFF4F1] hover:text-[#2F5D50]"
                  }`}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="hidden md:block bg-[#EFF4F1] rounded-2xl p-4 border border-[#DCE5DF] mt-6">
          <p className="text-xs font-semibold text-[#2F5D50] mb-1">
            Status Koneksi Cloud
          </p>
          <p className="text-[11px] text-gray-600">
            {loading
              ? "Menyinkronkan data..."
              : `${books.length} Judul • ${availableCopies.length} Stok Siap`}
          </p>
        </div>
      </aside>

      {/* Area Konten Utama */}
      <main className="flex-1 p-5 md:p-8 max-w-6xl mx-auto w-full">
        {/* Notifikasi Toast */}
        {notif && (
          <div
            className={`mb-5 p-4 rounded-2xl flex items-center justify-between text-sm font-medium shadow-xs ${
              notif.type === "success"
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {notif.type === "success" ? (
                <CheckCircle size={18} />
              ) : (
                <AlertCircle size={18} />
              )}
              <span>{notif.message}</span>
            </div>
            <button onClick={() => setNotif(null)}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* TAB 1: HOME / EXPLORE BOOKS */}
        {activeTab === "home" && (
          <div className="space-y-6">
            {/* Hero Banner */}
            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xs border border-[#E2E8E4] flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="space-y-2 max-w-lg">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#2F5D50] bg-[#EFF4F1] px-3 py-1 rounded-full">
                  <Sparkles size={14} /> Digital Library Portal
                </span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Discover New World of Knowledge
                </h2>
                <p className="text-sm text-gray-500">
                  Cek ketersediaan stok eksemplar real-time, lakukan peminjaman,
                  dan kelola pengembalian buku terintegrasi Oracle Database.
                </p>
                <div className="pt-2 flex gap-3">
                  <button
                    onClick={() => setActiveTab("circulation")}
                    className="bg-[#2F5D50] hover:bg-[#24493F] text-white text-sm font-semibold px-5 py-2.5 rounded-full shadow-md shadow-[#2F5D50]/20 transition"
                  >
                    Pinjam Buku Sekarang
                  </button>
                </div>
              </div>

              {/* Ringkasan Statistik Cepat */}
              <div className="grid grid-cols-2 gap-3 w-full md:w-auto">
                <div className="bg-[#F6F7F4] border border-[#E2E8E4] p-4 rounded-2xl text-center min-w-30">
                  <p className="text-2xl font-bold text-[#2F5D50]">
                    {books.length}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    Total Judul
                  </p>
                </div>
                <div className="bg-[#F6F7F4] border border-[#E2E8E4] p-4 rounded-2xl text-center min-w-30">
                  <p className="text-2xl font-bold text-emerald-700">
                    {availableCopies.length}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    Stok Tersedia
                  </p>
                </div>
                <div className="bg-[#F6F7F4] border border-[#E2E8E4] p-4 rounded-2xl text-center min-w-30">
                  <p className="text-2xl font-bold text-amber-600">
                    {activeLoans.length}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    Sedang Dipinjam
                  </p>
                </div>
                <div className="bg-[#F6F7F4] border border-[#E2E8E4] p-4 rounded-2xl text-center min-w-30">
                  <p className="text-2xl font-bold text-slate-700">
                    {members.length}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">
                    Anggota Aktif
                  </p>
                </div>
              </div>
            </div>

            {/* Search Bar & Filter Pills */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
              <div className="relative w-full sm:w-80">
                <Search
                  className="absolute left-3.5 top-3 text-gray-400"
                  size={18}
                />
                <input
                  type="text"
                  placeholder="Cari judul buku atau ISBN..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white rounded-2xl border border-[#E2E8E4] text-sm focus:outline-none focus:ring-2 focus:ring-[#2F5D50]"
                />
              </div>

              <div className="flex gap-2 overflow-x-auto w-full sm:w-auto pb-1">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-4 py-2 rounded-full text-xs font-semibold transition whitespace-nowrap ${
                      selectedCategory === cat
                        ? "bg-[#2F5D50] text-white"
                        : "bg-white text-gray-600 border border-[#E2E8E4] hover:bg-[#EFF4F1]"
                    }`}
                  >
                    {cat === "ALL" ? "Semua Kategori" : cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Grid Kartu Buku */}
            <div>
              <h3 className="font-bold text-gray-800 text-lg mb-4">
                Katalog Koleksi Buku
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {filteredBooks.map((book, idx) => {
                  const copiesCount = availableCopies.filter(
                    (c) => c.book_id === book.book_id,
                  ).length;
                  const coverStyle = COVER_STYLES[idx % COVER_STYLES.length];
                  return (
                    <div
                      key={book.book_id}
                      onClick={() => setSelectedBook(book)}
                      className="bg-white rounded-3xl p-4 shadow-xs hover:shadow-md transition cursor-pointer border border-[#E2E8E4] flex flex-col justify-between"
                    >
                      <div>
                        <div
                          className={`h-44 rounded-2xl bg-linear-to-br ${coverStyle} p-4 flex flex-col justify-between mb-3 shadow-inner`}
                        >
                          <span className="text-[10px] uppercase tracking-wider font-bold opacity-90 bg-black/20 self-start px-2 py-0.5 rounded-md">
                            {book.category_name || "Umum"}
                          </span>
                          <p className="font-bold text-base line-clamp-3 leading-snug">
                            {book.title}
                          </p>
                          <span className="text-[11px] opacity-85">
                            {book.publication_year}
                          </span>
                        </div>

                        <h4 className="font-bold text-gray-800 text-sm line-clamp-1">
                          {book.title}
                        </h4>
                        <p className="text-xs text-gray-400 mt-0.5">
                          {book.publisher_name || "Penerbit Umum"}
                        </p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
                        <span
                          className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                            copiesCount > 0
                              ? "bg-[#EFF4F1] text-[#2F5D50]"
                              : "bg-red-50 text-red-600"
                          }`}
                        >
                          {copiesCount > 0
                            ? `${copiesCount} Eksemplar Siap`
                            : "Stok Habis"}
                        </span>
                        <span className="text-xs font-semibold text-[#2F5D50]">
                          Detail →
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: CATEGORIES */}
        {activeTab === "categories" && (
          <div className="space-y-5">
            <h2 className="text-2xl font-bold text-gray-800">
              Books Categories
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              {categories
                .filter((c) => c !== "ALL")
                .map((cat, idx) => {
                  const count = books.filter(
                    (b) => b.category_name === cat,
                  ).length;
                  const coverStyle = COVER_STYLES[idx % COVER_STYLES.length];
                  return (
                    <div
                      key={cat}
                      onClick={() => {
                        setSelectedCategory(cat);
                        setActiveTab("home");
                      }}
                      className="bg-white rounded-3xl p-5 shadow-xs border border-[#E2E8E4] cursor-pointer hover:scale-[1.01] transition flex items-center gap-4"
                    >
                      <div
                        className={`w-16 h-20 rounded-2xl bg-linear-to-br ${coverStyle} flex items-center justify-center font-bold text-xl shrink-0`}
                      >
                        {cat.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-bold text-gray-800 text-base">
                          {cat}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          {count} Judul Buku Tersedia
                        </p>
                        <span className="inline-block mt-2 text-xs font-semibold text-[#2F5D50]">
                          Lihat Koleksi →
                        </span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* TAB 3: CIRCULATION (FORM PINJAM & PENGEMBALIAN + DENDA) */}
        {activeTab === "circulation" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form Peminjaman Baru */}
            <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#E2E8E4] h-fit">
              <div className="flex items-center gap-2 mb-4">
                <PlusCircle className="text-[#2F5D50]" size={20} />
                <h3 className="font-bold text-gray-800 text-lg">
                  Form Peminjaman
                </h3>
              </div>

              <form onSubmit={handleCreateLoan} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Anggota Peminjam
                  </label>
                  <div className="relative">
                    <select
                      value={loanForm.member_id}
                      onChange={(e) =>
                        setLoanForm({ ...loanForm, member_id: e.target.value })
                      }
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm bg-[#F6F7F4] focus:bg-white focus:ring-2 focus:ring-[#2F5D50] outline-none"
                      required
                    >
                      <option value="">-- Pilih Anggota Aktif --</option>
                      {members.map((m) => (
                        <option key={m.member_id} value={m.member_id}>
                          {m.name} ({m.email})
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Eksemplar Buku (AVAILABLE)
                  </label>
                  <div className="relative">
                    <select
                      value={loanForm.copy_id}
                      onChange={(e) =>
                        setLoanForm({ ...loanForm, copy_id: e.target.value })
                      }
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm bg-[#F6F7F4] focus:bg-white focus:ring-2 focus:ring-[#2F5D50] outline-none"
                      required
                    >
                      <option value="">-- Pilih Barcode & Judul --</option>
                      {availableCopies.map((c) => (
                        <option key={c.copy_id} value={c.copy_id}>
                          [{c.barcode}] {c.book_title}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Petugas Bertugas
                  </label>
                  <div className="relative">
                    <select
                      value={loanForm.staff_id}
                      onChange={(e) =>
                        setLoanForm({ ...loanForm, staff_id: e.target.value })
                      }
                      className="w-full appearance-none pl-3.5 pr-10 py-2.5 rounded-xl border border-gray-200 text-sm bg-[#F6F7F4] focus:bg-white focus:ring-2 focus:ring-[#2F5D50] outline-none"
                      required
                    >
                      <option value="">-- Pilih Staff --</option>
                      {staffList.map((s) => (
                        <option key={s.staff_id} value={s.staff_id}>
                          {s.name}
                        </option>
                      ))}
                    </select>
                    <ChevronDown
                      size={16}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">
                    Tanggal Jatuh Tempo
                  </label>
                  <input
                    type="date"
                    value={loanForm.due_date}
                    onChange={(e) =>
                      setLoanForm({ ...loanForm, due_date: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 text-sm bg-[#F6F7F4] focus:bg-white focus:ring-2 focus:ring-[#2F5D50] outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#2F5D50] hover:bg-[#24493F] text-white font-semibold py-3 rounded-2xl shadow-md shadow-[#2F5D50]/20 transition text-sm"
                >
                  Simpan Transaksi Pinjam
                </button>
              </form>
            </div>

            {/* Daftar Peminjaman Aktif + Tombol Pengembalian */}
            <div className="lg:col-span-2 bg-white rounded-3xl p-6 shadow-xs border border-[#E2E8E4]">
              <h3 className="font-bold text-gray-800 text-lg mb-1">
                Transaksi Peminjaman Aktif
              </h3>
              <p className="text-xs text-gray-500 mb-4">
                Klik tombol kembalikan untuk menjalankan{" "}
                <code className="text-[#2F5D50] font-semibold">
                  sp_return_book
                </code>{" "}
                & kalkulasi denda otomatis.
              </p>

              {activeLoans.length === 0 ? (
                <div className="text-center py-12 text-gray-400 text-sm">
                  Tidak ada transaksi peminjaman yang sedang aktif.
                </div>
              ) : (
                <div className="space-y-3">
                  {activeLoans.map((loan) => (
                    <div
                      key={loan.loan_id}
                      className="p-4 rounded-2xl border border-[#DCE5DF] bg-[#F6F7F4] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold bg-white px-2.5 py-0.5 rounded-full text-gray-700 border border-[#DCE5DF]">
                            #{loan.loan_id} • {loan.barcode}
                          </span>
                          {loan.late_days > 0 ? (
                            <span className="text-xs font-bold bg-red-100 text-red-700 px-2.5 py-0.5 rounded-full">
                              Telat {loan.late_days} hari • Denda Rp{" "}
                              {loan.estimated_fine?.toLocaleString("id-ID")}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold bg-[#EFF4F1] text-[#2F5D50] px-2.5 py-0.5 rounded-full">
                              Tepat Waktu
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-gray-800 text-sm">
                          {loan.book_title}
                        </h4>
                        <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <User size={13} /> {loan.member_name}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar size={13} /> Tenggat:{" "}
                            {loan.due_date?.split("T")[0]}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleReturnBook(loan.loan_id)}
                        className="bg-[#2F5D50] hover:bg-[#24493F] text-white text-xs font-semibold px-4 py-2.5 rounded-xl transition shrink-0"
                      >
                        Kembalikan Buku
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: REPORTS & FINES */}
        {activeTab === "reports" && (
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-[#E2E8E4]">
            <h3 className="font-bold text-gray-800 text-lg mb-1">
              Laporan Riwayat Peminjaman & Denda
            </h3>
            <p className="text-xs text-gray-500 mb-5">
              Data gabungan (JOIN) dari tabel Loans, Members, Book Copies,
              Books, dan Fines.
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#E2E8E4] text-xs text-gray-500 uppercase">
                    <th className="py-3 px-3">ID</th>
                    <th className="py-3 px-3">Peminjam</th>
                    <th className="py-3 px-3">Buku & Barcode</th>
                    <th className="py-3 px-3">Tgl Pinjam</th>
                    <th className="py-3 px-3">Tenggat</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3">Denda</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-sm">
                  {loanReports.map((r) => (
                    <tr key={r.loan_id} className="hover:bg-[#F6F7F4]">
                      <td className="py-3 px-3 font-semibold text-gray-700">
                        #{r.loan_id}
                      </td>
                      <td className="py-3 px-3 font-medium text-gray-800">
                        {r.member_name}
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-medium text-gray-800">
                          {r.book_title}
                        </p>
                        <span className="text-xs text-gray-400">
                          {r.barcode}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-600">
                        {r.loan_date?.split("T")[0]}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-600">
                        {r.due_date?.split("T")[0]}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                            r.loan_status === "RETURNED"
                              ? "bg-[#EFF4F1] text-[#2F5D50]"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {r.loan_status}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-gray-800">
                        {r.fine_amount > 0 ? (
                          <span className="text-red-600">
                            Rp {r.fine_amount.toLocaleString("id-ID")} (
                            {r.payment_status})
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* Modal Book Details */}
      {selectedBook && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-xl relative">
            <button
              onClick={() => setSelectedBook(null)}
              className="absolute right-5 top-5 text-gray-400 hover:text-gray-700"
            >
              <X size={20} />
            </button>

            <div className="w-28 h-36 mx-auto rounded-2xl bg-linear-to-br from-[#2F5D50] to-[#1D3B32] text-white p-4 flex flex-col justify-between shadow-lg mb-4">
              <span className="text-[10px] uppercase opacity-80">
                {selectedBook.category_name}
              </span>
              <p className="font-bold text-sm line-clamp-3">
                {selectedBook.title}
              </p>
            </div>

            <div className="text-center space-y-1 mb-5">
              <h3 className="text-xl font-bold text-gray-800">
                {selectedBook.title}
              </h3>
              <p className="text-xs text-gray-500">
                Penerbit: {selectedBook.publisher_name} • Tahun{" "}
                {selectedBook.publication_year}
              </p>
              <p className="text-xs font-mono text-gray-400">
                ISBN: {selectedBook.isbn}
              </p>
            </div>

            <div className="bg-[#F6F7F4] border border-[#E2E8E4] rounded-2xl p-4 mb-5">
              <p className="text-xs font-semibold text-gray-700 mb-2">
                Eksemplar Tersedia (AVAILABLE):
              </p>
              <div className="flex flex-wrap gap-2">
                {availableCopies
                  .filter((c) => c.book_id === selectedBook.book_id)
                  .map((copy) => (
                    <span
                      key={copy.copy_id}
                      className="text-xs bg-white border border-[#DCE5DF] text-[#2F5D50] px-3 py-1 rounded-full font-medium"
                    >
                      {copy.barcode}
                    </span>
                  ))}
                {availableCopies.filter(
                  (c) => c.book_id === selectedBook.book_id,
                ).length === 0 && (
                  <span className="text-xs text-red-600">
                    Semua eksemplar sedang dipinjam.
                  </span>
                )}
              </div>
            </div>

            <button
              onClick={() => {
                const firstCopy = availableCopies.find(
                  (c) => c.book_id === selectedBook.book_id,
                );
                if (firstCopy) {
                  setLoanForm({
                    ...loanForm,
                    copy_id: String(firstCopy.copy_id),
                  });
                }
                setSelectedBook(null);
                setActiveTab("circulation");
              }}
              className="w-full bg-[#2F5D50] hover:bg-[#24493F] text-white font-semibold py-3 rounded-2xl shadow-md shadow-[#2F5D50]/20 transition text-sm"
            >
              Pinjam Buku Ini
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
