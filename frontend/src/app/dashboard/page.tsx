"use client";

import { useEffect, useState, useCallback } from "react";
import {
  getBooks, getSales, getUsers,
  adminReset, adminAddJunk,
  getToken, getUserRole,
  createBook, updateBook, deleteBook,
  createUser, deleteUser,
  removeToken, removeUserRole,
} from "@/lib/api";
import { Book, Sale, User } from "@/lib/types";
import { LogOut, RefreshCw, BookOpen, Trash2, Edit, Book as BookIcon, Users, Home } from "lucide-react";
import { toast } from "sonner";
import dynamic from "next/dynamic";
import BookModal from "@/components/modals/BookModal";
import UserModal from "@/components/modals/UserModal";

const RevenueChart = dynamic(() => import("@/components/dashboard/RevenueChart"), { ssr: false });

export default function AdminDashboard() {
  const [books, setBooks] = useState<Book[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "users">("overview");

  const [showBookModal, setShowBookModal] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [bData, sData, uData] = await Promise.all([
        getBooks() as Promise<Book[]>,
        getSales() as Promise<Sale[]>,
        getUsers() as Promise<User[]>,
      ]);
      setBooks(bData);
      setSales(sData);
      setUsers(uData);
    } catch {
      toast.error("Veriler alınamadı");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    const role = getUserRole();
    if (!token || role !== "ADMIN") {
      window.location.href = "/login";
      return;
    }
    fetchData();

    const handleKeyDown = async (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.code === "KeyR") await handleReset();
      else if (e.ctrlKey && e.shiftKey && e.code === "KeyJ") await handleAddJunk();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [fetchData]);

  const handleReset = async () => {
    try {
      toast.info("Sistem sıfırlanıyor...");
      await adminReset();
      await fetchData();
      toast.success("Veritabanı başlangıç durumuna döndürüldü!");
    } catch {
      toast.error("Sıfırlama yetkiniz yok");
    }
  };

  const handleAddJunk = async () => {
    try {
      await adminAddJunk();
      await fetchData();
    } catch {
      toast.error("Yetkisiz işlem");
    }
  };

  const handleDeleteBook = async (id: number) => {
    try {
      await deleteBook(id);
      toast.success("Kitap silindi");
      fetchData();
    } catch {
      toast.error("Kitap silinirken hata oluştu");
    }
  };

  const handleSaveBook = async (bookData: Omit<Book, "id">) => {
    try {
      if (editingBook) {
        await updateBook(editingBook.id, bookData);
        toast.success("Kitap güncellendi");
      } else {
        await createBook(bookData);
        toast.success("Kitap eklendi");
      }
      setShowBookModal(false);
      setEditingBook(null);
      fetchData();
    } catch {
      toast.error(editingBook ? "Güncelleme başarısız" : "Kitap eklenemedi");
    }
  };

  const handleCreateUser = async (userData: { username: string; password: string; role: string }) => {
    try {
      await createUser({ username: userData.username, password: userData.password, role: userData.role as "ADMIN" | "USER" });
      toast.success(`Kullanıcı (${userData.username}) oluşturuldu`);
      setShowUserModal(false);
      fetchData();
    } catch {
      toast.error("Kullanıcı oluşturulamadı. Bu isim kullanılıyor olabilir.");
    }
  };

  const handleDeleteUser = async (id: number, username: string) => {
    try {
      await deleteUser(id);
      toast.success(`${username} silindi`);
      fetchData();
    } catch {
      toast.error("Kullanıcı silinemedi");
    }
  };

  const handleLogout = () => {
    removeToken();
    removeUserRole();
    window.location.href = "/login";
  };

  const totalRevenue = sales.reduce((acc, s) => acc + s.quantity * (s.book?.price || 0), 0);
  const totalSales = sales.reduce((acc, s) => acc + s.quantity, 0);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-zinc-800/60 flex flex-col items-center py-10 hidden md:flex z-10">
        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-10 shadow-sm border border-zinc-200">
          <BookOpen className="w-5 h-5 text-black" />
        </div>
        <nav className="w-full flex flex-col gap-1 px-3">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "overview" ? "bg-zinc-900 text-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50"}`}
          >
            <Home className="w-4 h-4" /> Genel Bakış
          </button>
          <button
            onClick={() => { setEditingBook(null); setShowBookModal(true); }}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-md text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50 text-sm font-medium transition-all"
          >
            <BookIcon className="w-4 h-4" /> Kitap Ekle
          </button>
          <button
            onClick={() => setActiveTab("users")}
            className={`flex items-center gap-3 w-full px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === "users" ? "bg-zinc-900 text-zinc-100" : "text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/50"}`}
          >
            <Users className="w-4 h-4" /> Kullanıcılar
          </button>
        </nav>

        <div className="mt-auto px-4 w-full">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-2 rounded-md text-zinc-400 hover:text-zinc-100 transition-all text-sm font-medium border border-transparent hover:border-zinc-800"
          >
            <LogOut className="w-4 h-4" /> Çıkış Yap
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-8 md:p-12 overflow-y-auto w-full relative">
        <div className="absolute top-0 right-0 w-full h-[300px] bg-gradient-to-b from-zinc-900/40 to-transparent pointer-events-none" />

        <div className="max-w-[1200px] mx-auto space-y-8 relative">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-6 mb-12 border-b border-zinc-800 pb-8">
            <div>
              <p className="text-zinc-500 tracking-wider text-[11px] font-semibold uppercase mb-1 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" /> YÖNETİCİ PANELİ
              </p>
              <h1 className="text-3xl font-semibold text-white tracking-tight truncate">
                {activeTab === "overview" ? "Genel Bakış" : "Kullanıcı Yönetimi"}
              </h1>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReset}
                className="px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-medium border border-zinc-700 bg-zinc-900 text-zinc-300 hover:bg-zinc-800 hover:text-white transition-all shadow-sm shrink-0"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Sistemi Sıfırla
              </button>
              {activeTab === "users" && (
                <button
                  onClick={() => setShowUserModal(true)}
                  className="px-4 py-2 rounded-lg flex items-center gap-2 text-xs font-medium bg-white text-black hover:bg-zinc-200 transition-all shadow-sm shrink-0"
                >
                  <Users className="w-3.5 h-3.5" /> Kullanıcı Ekle
                </button>
              )}
            </div>
          </div>

          {activeTab === "overview" && (
            <>
              {/* Stats */}
              <div className="grid gap-6 md:grid-cols-3">
                <div className="bg-[#0a0a0a] rounded-xl p-6 border border-zinc-800 shadow-sm flex flex-col justify-between overflow-hidden">
                  <div className="min-w-0">
                    <p className="text-zinc-400 text-xs font-medium mb-1 truncate">Toplam Gelir</p>
                    <h3 className="text-3xl font-semibold text-white tracking-tight truncate">
                      ₺{totalRevenue.toLocaleString("tr-TR", { minimumFractionDigits: 2 })}
                    </h3>
                  </div>
                  <p className="text-emerald-500 text-xs mt-4 font-medium truncate">Geçen aya göre +%12</p>
                </div>

                <div className="bg-[#0a0a0a] rounded-xl p-6 border border-zinc-800 shadow-sm flex flex-col justify-between overflow-hidden">
                  <div className="min-w-0">
                    <p className="text-zinc-400 text-xs font-medium mb-1 truncate">Toplam Satış</p>
                    <h3 className="text-3xl font-semibold text-white tracking-tight truncate">
                      {totalSales.toLocaleString("tr-TR")}
                    </h3>
                  </div>
                  <p className="text-zinc-500 text-xs mt-4 truncate">Son 30 günlük veriler</p>
                </div>

                <div
                  className="bg-zinc-900/50 rounded-xl p-6 border border-zinc-800 border-dashed shadow-sm flex flex-col justify-center items-center cursor-pointer hover:bg-zinc-800/50 transition-colors group overflow-hidden"
                  onClick={() => { setEditingBook(null); setShowBookModal(true); }}
                >
                  <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform shrink-0">
                    <BookIcon className="w-4 h-4 text-zinc-300" />
                  </div>
                  <p className="text-sm font-medium text-white truncate">Yeni Kitap Ekle</p>
                  <p className="text-xs text-zinc-500 mt-1 text-center truncate">Sisteme manuel kitap girişi yap</p>
                </div>
              </div>

              {/* Books + Chart */}
              <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 bg-[#0a0a0a] rounded-xl border border-zinc-800 shadow-sm overflow-hidden flex flex-col min-w-0">
                  <div className="px-6 py-4 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/30">
                    <h2 className="text-sm font-semibold text-white truncate">Kitap Envanteri</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead>
                        <tr className="text-zinc-500 border-b border-zinc-800">
                          <th className="py-3 px-6 font-mono text-[10px] uppercase tracking-wider">Kapak</th>
                          <th className="py-3 px-6 font-mono text-[10px] uppercase tracking-wider">Kitap</th>
                          <th className="py-3 px-6 font-mono text-[10px] uppercase tracking-wider text-right">Fiyat</th>
                          <th className="py-3 px-6 font-mono text-[10px] uppercase tracking-wider text-right">İşlem</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-800/50">
                        {isLoading ? (
                          <tr><td colSpan={4} className="text-center py-12 text-zinc-500">Yükleniyor...</td></tr>
                        ) : books.length === 0 ? (
                          <tr><td colSpan={4} className="text-center py-12 text-red-400">Veri bulunamadı. Sistemi sıfırlayın.</td></tr>
                        ) : (
                          books.map((book) => (
                            <tr key={`book-${book.id}`} className="hover:bg-zinc-900/40 transition-colors group">
                              <td className="py-3 px-6">
                                {book.cover_image_url
                                  ? <img src={book.cover_image_url} alt={book.title} className="w-8 h-10 object-cover rounded shadow-sm border border-zinc-700/50" />
                                  : <div className="w-8 h-10 bg-zinc-900 flex items-center justify-center rounded border border-zinc-800 text-[10px] text-zinc-600 font-mono">—</div>
                                }
                              </td>
                              <td className="py-3 px-6 max-w-[200px]">
                                <p className="font-medium text-zinc-200 truncate" title={book.title}>{book.title}</p>
                                <p className="text-xs text-zinc-500 truncate" title={book.author}>{book.author}</p>
                              </td>
                              <td className="py-3 px-6 text-right">
                                <span className="text-zinc-300 font-mono text-xs">₺{book.price.toFixed(2)}</span>
                              </td>
                              <td className="py-3 px-6 text-right">
                                <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <button
                                    onClick={() => { setEditingBook(book); setShowBookModal(true); }}
                                    className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded transition-colors"
                                    title="Düzenle"
                                  >
                                    <Edit className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteBook(book.id)}
                                    className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors"
                                    title="Sil"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-[#0a0a0a] rounded-xl border border-zinc-800 shadow-sm flex flex-col min-w-0">
                  <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/30">
                    <h2 className="text-sm font-semibold text-white truncate">Gelir Grafiği</h2>
                  </div>
                  <div className="p-6 flex-1 flex flex-col justify-end w-full overflow-hidden">
                    <RevenueChart sales={sales} />
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "users" && (
            <div className="bg-[#0a0a0a] rounded-xl border border-zinc-800 shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm whitespace-nowrap">
                  <thead>
                    <tr className="text-zinc-500 border-b border-zinc-800">
                      <th className="py-3 px-6 font-mono text-[10px] uppercase tracking-wider">ID</th>
                      <th className="py-3 px-6 font-mono text-[10px] uppercase tracking-wider">Kullanıcı Adı</th>
                      <th className="py-3 px-6 font-mono text-[10px] uppercase tracking-wider">Rol</th>
                      <th className="py-3 px-6 font-mono text-[10px] uppercase tracking-wider text-right">İşlem</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/50">
                    {isLoading ? (
                      <tr><td colSpan={4} className="text-center py-12 text-zinc-500">Yükleniyor...</td></tr>
                    ) : users.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-12 text-zinc-500">Kullanıcı bulunamadı</td></tr>
                    ) : (
                      users.map((u) => (
                        <tr key={`user-${u.id}`} className="hover:bg-zinc-900/40 transition-colors group">
                          <td className="py-3 px-6 text-zinc-500 font-mono text-xs">#{u.id}</td>
                          <td className="py-3 px-6 font-medium text-zinc-200">{u.username}</td>
                          <td className="py-3 px-6">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium font-mono uppercase ${u.role === "ADMIN" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" : "bg-zinc-800 text-zinc-400 border border-zinc-700"}`}>
                              {u.role === "ADMIN" ? "Yönetici" : "Kullanıcı"}
                            </span>
                          </td>
                          <td className="py-3 px-6 text-right">
                            {u.username !== "admin" && (
                              <button
                                onClick={() => handleDeleteUser(u.id, u.username)}
                                className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 rounded transition-colors opacity-0 group-hover:opacity-100"
                                title="Sil"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>

      {showBookModal && (
        <BookModal
          onClose={() => { setShowBookModal(false); setEditingBook(null); }}
          onSubmit={handleSaveBook}
          initialData={editingBook}
        />
      )}
      {showUserModal && (
        <UserModal
          onClose={() => setShowUserModal(false)}
          onSubmit={handleCreateUser}
        />
      )}
    </div>
  );
}
