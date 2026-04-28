import React, { useState, useEffect } from "react";
import { Book, BookFormData } from "@/lib/types";

interface BookModalProps {
  onClose: () => void;
  onSubmit: (book: BookFormData) => Promise<void>;
  initialData?: Book | null;
}

export default function BookModal({ onClose, onSubmit, initialData }: BookModalProps) {
  const [form, setForm] = useState<{ title: string; author: string; price: string; cover_image_url: string }>({
    title: "",
    author: "",
    price: "",
    cover_image_url: "",
  });

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title,
        author: initialData.author,
        price: initialData.price.toString(),
        cover_image_url: initialData.cover_image_url || "",
      });
    }
  }, [initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit({
      title: form.title,
      author: form.author,
      price: parseFloat(form.price) || 0,
      cover_image_url: form.cover_image_url,
    });
  };

  const set = (field: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-[#0a0a0a] border border-zinc-800 p-8 rounded-[20px] shadow-2xl w-full max-w-md"
      >
        <h2 className="text-2xl font-medium text-white mb-6">
          {initialData ? "Eseri Düzenle" : "Yeni Eser Kaydet"}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Kitap Adı</label>
            <input
              required
              type="text"
              value={form.title}
              onChange={set("title")}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Yazar</label>
            <input
              required
              type="text"
              value={form.author}
              onChange={set("author")}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-all"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Fiyat (₺)</label>
              <input
                required
                type="text"
                inputMode="decimal"
                placeholder="0.00"
                value={form.price}
                onChange={(e) => {
                  const val = e.target.value.replace(/[^0-9.]/g, "");
                  setForm((prev) => ({ ...prev, price: val }));
                }}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Kapak URL</label>
              <input
                type="text"
                value={form.cover_image_url}
                onChange={set("cover_image_url")}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-all"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-zinc-400 hover:text-white transition-colors text-sm font-medium"
          >
            İptal
          </button>
          <button
            type="submit"
            className="px-5 py-2.5 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition-colors text-sm"
          >
            {initialData ? "Kaydet" : "Kitabı Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
