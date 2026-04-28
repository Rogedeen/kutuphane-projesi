import React, { useState } from "react";
import { UserFormData } from "@/lib/types";

interface UserModalProps {
  onClose: () => void;
  onSubmit: (user: { username: string; password: string; role: string }) => Promise<void>;
}

export default function UserModal({ onClose, onSubmit }: UserModalProps) {
  const [form, setForm] = useState<UserFormData>({ username: "", password: "", role: "USER" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanPassword = form.password.replace(/ /g, "");
    await onSubmit({ ...form, password: cleanPassword });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <form
        onSubmit={handleSubmit}
        className="bg-[#0a0a0a] border border-zinc-800 p-8 rounded-[20px] shadow-2xl w-full max-w-md"
      >
        <h2 className="text-2xl font-medium text-white mb-6">Kullanıcı Yetkilendir</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Kullanıcı Adı</label>
            <input
              required
              type="text"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-all font-mono"
            />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Şifre</label>
            <input
              required
              type="password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-all font-mono tracking-widest text-xl"
            />
            <p className="text-[10px] text-zinc-500 mt-1">Boşluk karakterleri otomatik olarak silinecektir.</p>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Erişim Yetkisi</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as "ADMIN" | "USER" })}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-all"
            >
              <option value="USER">Standart Kullanıcı (USER)</option>
              <option value="ADMIN">Sistem Yöneticisi (ADMIN)</option>
            </select>
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
            Yetki Ver
          </button>
        </div>
      </form>
    </div>
  );
}
