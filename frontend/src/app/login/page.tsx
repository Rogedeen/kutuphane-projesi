"use client";

import { useState } from "react";
import { login, setToken, setUserRole } from "@/lib/api";
import { toast } from "sonner";
import { BookOpen, User, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(username, password);
      await new Promise(r => setTimeout(r, 300));
      setToken(data.access_token);
      setUserRole(data.role);
      toast.success("Kimlik doğrulama başarılı");
      window.location.href = data.role === "ADMIN" ? "/dashboard" : "/store";
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.error(err.message || "Geçersiz bilgiler");
      } else {
        toast.error("Geçersiz bilgiler");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4">
        
        <div className="w-full max-w-sm bg-[#0a0a0a] p-8 sm:p-10 rounded-[24px] border border-zinc-800 shadow-2xl relative">
            <div className="flex flex-col items-center mb-8">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center border border-zinc-200 mb-6 shadow-sm">
                    <BookOpen className="w-6 h-6 text-black" />
                </div>
                <h1 className="text-2xl font-semibold text-white tracking-tight mb-1">Hoş Geldin</h1>
                <p className="text-zinc-500 text-sm font-medium">Kütüphane Yönetim Sistemine Giriş Yapın</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
                <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-1.5 font-medium ml-1">Kullanıcı Adı</label>
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input 
                            type="text" 
                            required 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)}
                            placeholder="kullanıcı adı"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-all font-mono text-sm"
                        />
                    </div>
                </div>
                
                <div>
                    <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-1.5 font-medium ml-1">Şifre</label>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input 
                            type="password" 
                            required 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••"
                            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl py-3 pl-11 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:border-zinc-500 transition-all font-mono tracking-widest"
                        />
                    </div>
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-white text-black font-semibold text-sm shadow-sm hover:bg-zinc-200 transition-all flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                      {loading ? "Doğrulanıyor..." : "Oturumu Başlat"}
                      {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
                  </button>
                </div>
            </form>

            <div className="mt-8 text-center pt-6 border-t border-zinc-800/80">
                <p className="text-[10px] text-zinc-600 font-mono uppercase tracking-widest">Golden State Güvencesinde</p>
            </div>
        </div>

        {/* Demo Credentials Hint outside the card */}
        <div className="mt-8 text-center text-xs text-zinc-600 flex flex-col gap-1 font-mono">
            <p>Admin: <span className="text-zinc-400">admin</span> / <span className="text-zinc-400">admin123</span></p>
            <p>User: <span className="text-zinc-400">user</span> / <span className="text-zinc-400">user123</span></p>
        </div>
    </div>
  );
}
