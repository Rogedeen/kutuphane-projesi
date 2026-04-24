import React, { useState } from "react";

interface BookModalProps {
  onClose: () => void;
  onSubmit: (book: any) => Promise<void>;
}

export default function BookModal({ onClose, onSubmit }: BookModalProps) {
  const [newBook, setNewBook] = useState({ title: "", author: "", price: 0, cover_image_url: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(newBook);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-zinc-800 p-8 rounded-[20px] shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-medium text-white mb-6">Yeni Eser Kaydet</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Kitap Adı</label>
            <input required type="text" value={newBook.title} onChange={e => setNewBook({...newBook, title: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-all font-sans" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Yazar</label>
            <input required type="text" value={newBook.author} onChange={e => setNewBook({...newBook, author: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-all font-sans" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Fiyat (₺)</label>
              <input required type="number" step="0.01" value={newBook.price} onChange={e => setNewBook({...newBook, price: parseFloat(e.target.value)})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-all font-sans" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Kapak URL</label>
              <input type="text" value={newBook.cover_image_url} onChange={e => setNewBook({...newBook, cover_image_url: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-all font-sans" />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full text-zinc-400 hover:text-white transition-colors text-sm font-medium">İptal</button>
          <button type="submit" className="px-5 py-2.5 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition-colors text-sm">Kitabı Kaydet</button>
        </div>
      </form>
    </div>
  );
}
