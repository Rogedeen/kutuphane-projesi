"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { getBooks, createSale, getToken, getUserRole, removeToken, removeUserRole } from "@/lib/api";
import { Book, CartItem } from "@/lib/types";
import { BookOpen, ShoppingCart, LogOut, Plus, Minus, Trash2, ShoppingBag } from "lucide-react";
import { toast } from "sonner";

// ─── Sorumluluklar ───────────────────────────────────────────────────────────
// Bu sayfa yalnızca: kitap gösterme + sepet yönetimi + satın alma
// Satış istatistikleri admin dashboard'una aittir (SRP)
// ─────────────────────────────────────────────────────────────────────────────

export default function StorePage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const fetchBooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getBooks() as Book[];
      setBooks(data);
    } catch {
      toast.error("Kitaplar yüklenemedi");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const token = getToken();
    const role = getUserRole();
    if (!token) { window.location.href = "/login"; return; }
    if (role === "ADMIN") { window.location.href = "/dashboard"; return; }
    fetchBooks();
  }, [fetchBooks]);

  // ─── Cart işlemleri ───────────────────────────────────────────────────────

  const addToCart = (book: Book) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.book.id === book.id);
      if (existing) {
        return prev.map((item) =>
          item.book.id === book.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { book, quantity: 1 }];
    });
    toast.success(`"${book.title}" sepete eklendi`);
  };

  const updateCartQty = (bookId: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => item.book.id === bookId ? { ...item, quantity: item.quantity + delta } : item)
        .filter((item) => item.quantity > 0)
    );
  };

  const removeFromCart = (bookId: number) => {
    setCart((prev) => prev.filter((item) => item.book.id !== bookId));
  };

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsCheckingOut(true);
    try {
      await Promise.all(cart.map((item) => createSale(item.book.id, item.quantity)));
      toast.success("Satın alma tamamlandı! 🎉");
      setCart([]);
    } catch {
      toast.error("Satın alma sırasında hata oluştu");
    } finally {
      setIsCheckingOut(false);
    }
  };

  const cartTotal = useMemo(
    () => cart.reduce((acc, item) => acc + item.book.price * item.quantity, 0),
    [cart]
  );

  const cartCount = useMemo(
    () => cart.reduce((acc, item) => acc + item.quantity, 0),
    [cart]
  );

  const handleLogout = () => {
    removeToken();
    removeUserRole();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-zinc-100 font-sans flex">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0a0a0a] border-r border-zinc-800/60 flex flex-col items-center py-10 hidden md:flex z-10">
        <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center mb-10 shadow-sm border border-zinc-200">
          <BookOpen className="w-5 h-5 text-black" />
        </div>
        <nav className="w-full flex flex-col gap-1 px-3">
          <div className="flex items-center gap-3 w-full px-4 py-2 rounded-md bg-zinc-900 text-zinc-100 text-sm font-medium">
            <BookOpen className="w-4 h-4" /> Kitap Mağazası
          </div>
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

        <div className="max-w-[1200px] mx-auto relative">

          {/* Header */}
          <div className="mb-12 border-b border-zinc-800 pb-8">
            <p className="text-zinc-500 tracking-wider text-[11px] font-semibold uppercase mb-1 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" /> KÜTÜPHANe
            </p>
            <h1 className="text-3xl font-semibold text-white tracking-tight">Kitap Mağazası</h1>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Kitap Grid */}
            <div className="lg:col-span-2">
              {isLoading ? (
                <div className="text-center py-20 text-zinc-500">Kitaplar yükleniyor...</div>
              ) : books.length === 0 ? (
                <div className="text-center py-20 text-zinc-500">Kitap bulunamadı.</div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {books.map((book) => (
                    <div
                      key={`book-${book.id}`}
                      className="bg-zinc-900/40 border border-zinc-800 rounded-xl p-5 flex gap-4 hover:bg-zinc-900/70 transition-colors"
                    >
                      {book.cover_image_url ? (
                        <img
                          src={book.cover_image_url}
                          alt={book.title}
                          className="w-14 h-20 object-cover rounded-lg shadow border border-zinc-700/50 shrink-0"
                        />
                      ) : (
                        <div className="w-14 h-20 bg-zinc-800 flex items-center justify-center rounded-lg border border-zinc-700 shrink-0">
                          <BookOpen className="w-6 h-6 text-zinc-600" />
                        </div>
                      )}
                      <div className="flex flex-col justify-between min-w-0 flex-1">
                        <div>
                          <p className="font-semibold text-zinc-100 truncate" title={book.title}>{book.title}</p>
                          <p className="text-xs text-zinc-500 truncate mt-0.5">{book.author}</p>
                        </div>
                        <div className="flex items-center justify-between mt-3">
                          <span className="font-mono text-sm font-semibold text-white">₺{book.price.toFixed(2)}</span>
                          <button
                            onClick={() => addToCart(book)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white text-black text-xs font-semibold hover:bg-zinc-200 transition-colors"
                          >
                            <Plus className="w-3 h-3" /> Sepete Ekle
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Sepet */}
            <div className="bg-[#0a0a0a] rounded-xl border border-zinc-800 shadow-sm flex flex-col h-fit sticky top-8">
              <div className="px-6 py-4 border-b border-zinc-800 bg-zinc-900/30 flex items-center justify-between">
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <ShoppingCart className="w-4 h-4" /> Sepet
                </h2>
                {cartCount > 0 && (
                  <span className="text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-full">
                    {cartCount} ürün
                  </span>
                )}
              </div>

              {cart.length === 0 ? (
                <div className="px-6 py-12 text-center text-zinc-500 text-sm">
                  Sepetiniz boş.<br />
                  <span className="text-xs text-zinc-600">Kitap ekleyerek başlayın</span>
                </div>
              ) : (
                <>
                  <div className="divide-y divide-zinc-800/50 max-h-80 overflow-y-auto">
                    {cart.map((item) => (
                      <div key={`cart-${item.book.id}`} className="px-6 py-4 flex items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-200 truncate">{item.book.title}</p>
                          <p className="text-xs text-zinc-500 font-mono">₺{item.book.price.toFixed(2)} × {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => updateCartQty(item.book.id, -1)}
                            className="w-6 h-6 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-6 text-center text-sm font-mono text-zinc-200">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQty(item.book.id, 1)}
                            className="w-6 h-6 flex items-center justify-center rounded bg-zinc-800 hover:bg-zinc-700 transition-colors text-zinc-300"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.book.id)}
                            className="w-6 h-6 flex items-center justify-center rounded hover:bg-zinc-800 transition-colors text-zinc-600 hover:text-red-400 ml-1"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="px-6 py-4 border-t border-zinc-800 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-zinc-400">Toplam</span>
                      <span className="font-mono font-semibold text-white">₺{cartTotal.toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleCheckout}
                      disabled={isCheckingOut}
                      className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm hover:bg-zinc-200 transition-all disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isCheckingOut ? "İşleniyor..." : <><ShoppingBag className="w-4 h-4" /> Satın Al</>}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
