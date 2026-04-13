"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, User, CheckCircle, AlertCircle } from "lucide-react";
import { getApiBaseUrl } from "@/app/constants";

export default function SetupLogin() {
  const [login, setLogin] = useState("admin");
  const [password, setPassword] = useState("avazbekdeveloper");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("user", JSON.stringify(data.user));
        router.push("/setup");
      } else {
        setError(data.message || "Xatolik yuz berdi");
        setLoading(false);
      }
    } catch (err) {
      setError("Serverga ulanib bo'lmadi");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 relative">
      <div className="w-full max-w-md p-8 sm:p-10 rounded-[2rem] bg-[#111111] border border-white/20 shadow-2xl relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-600/20 border border-purple-500/20 mb-5">
            <Lock className="w-8 h-8 text-purple-500" />
          </div>
          <h1 className="text-3xl font-black uppercase italic tracking-tighter text-white">System Setup</h1>
          <p className="text-gray-500 mt-2 text-[8px] uppercase tracking-[0.3em] font-black opacity-60">Xavfsiz Kirish Tizimi</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Login</label>
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-purple-500 transition-colors" />
              <input
                type="text"
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="ADMIN LOGIN"
                className="w-full bg-white/5 border border-white/20 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-purple-500 transition-all text-white font-bold uppercase text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 ml-1">Parol</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-600 group-focus-within:text-purple-500 transition-colors" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/5 border border-white/20 rounded-2xl py-5 pl-14 pr-6 focus:outline-none focus:border-purple-500 transition-all text-white font-bold text-lg"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-red-600/20 border border-red-500/30 text-red-100 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest shadow-lg">
              <AlertCircle className="w-4 h-4 text-red-400" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-100 transition-all active:scale-[0.98] disabled:opacity-50 mt-8 shadow-2xl shadow-white/5"
          >
            {loading ? "Kirilmoqda..." : "Kirish"}
          </button>
        </form>

        <div className="mt-12 text-center text-[7px] font-black text-gray-700 uppercase tracking-[0.4em]">
          v2.0 / secure setup portal
        </div>
      </div>
    </div>
  );
}
