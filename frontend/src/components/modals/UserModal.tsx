import React, { useState } from "react";

interface UserModalProps {
  onClose: () => void;
  onSubmit: (user: any) => Promise<void>;
}

export default function UserModal({ onClose, onSubmit }: UserModalProps) {
  const [newUser, setNewUser] = useState({ username: "", password: "", role: "ADMIN" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onSubmit(newUser);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <form onSubmit={handleSubmit} className="bg-[#0a0a0a] border border-zinc-800 p-8 rounded-[20px] shadow-2xl w-full max-w-md">
        <h2 className="text-2xl font-medium text-white mb-6">Kullanıcı Yetkilendir</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Kullanıcı Adı</label>
            <input required type="text" value={newUser.username} onChange={e => setNewUser({...newUser, username: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-all font-mono" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Şifre</label>
            <input required type="password" value={newUser.password} onChange={e => setNewUser({...newUser, password: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-all font-mono tracking-widest text-xl" />
            <p className="text-[10px] text-zinc-500 mt-1">Boşluk karakterleri otomatik olarak silinecektir.</p>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1">Erişim Yetkisi</label>
            <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value})} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-zinc-500 transition-all font-sans">
              <option value="USER">Standart Kullanıcı (USER)</option>
              <option value="ADMIN">Sistem Yöneticisi (ADMIN)</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-8">
          <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-full text-zinc-400 hover:text-white transition-colors text-sm font-medium">İptal</button>
          <button type="submit" className="px-5 py-2.5 rounded-full bg-white text-black font-semibold hover:bg-zinc-200 transition-colors text-sm">Yetki Ver</button>
        </div>
      </form>
    </div>
  );
}
