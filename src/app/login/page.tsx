"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, User, Lock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { API_BASE_URL } from "@/app/constants";

export default function CenterLogin() {
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ login, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("access_token", data.access_token);
        localStorage.setItem("center_user", JSON.stringify(data.user));
        router.push("/dashboard"); // Redirect to center dashboard
      } else {
        setError(data.message || "Login yoki parol noto'g'ri!");
        setLoading(false);
      }
    } catch (err) {
      setError("Server bilan ulanishda xatolik");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#000000] flex items-center justify-center p-6 relative">
      {/* Static Background Decor */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <div className="absolute top-[-10%] left-[-10%] w-[60%] h-[60%] bg-purple-600/20 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-blue-600/20 rounded-full blur-[100px]" />
      </div>

      <div className="w-full max-w-md p-8 sm:p-10 rounded-[2.5rem] bg-[#111111] border border-white/20 shadow-[0_20px_100px_rgba(0,0,0,0.8)] relative z-10">
        <div className="flex flex-col items-center mb-10 text-center">
          <div className="w-16 h-16 bg-purple-600 rounded-2xl flex items-center justify-center mb-5 shadow-2xl shadow-purple-600/40">
            <LayoutDashboard className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white uppercase italic">EduMarkaz</h1>
          <p className="text-gray-400 text-[9px] uppercase font-black tracking-[0.3em] mt-3 opacity-80">Boshqaruv Tizimiga Kirish</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2.5">
            <label className="text-[10px] text-gray-300 uppercase tracking-[0.2em] font-black ml-2">Login</label>
            <div className="relative group">
              <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
              <input 
                type="text" 
                value={login}
                onChange={(e) => setLogin(e.target.value)}
                placeholder="LOGININGIZNI YOZING"
                className="w-full bg-white/10 border border-white/20 rounded-[1.5rem] py-5 pl-14 pr-6 focus:outline-none focus:border-purple-500 transition-all text-white font-bold placeholder:text-gray-600 uppercase text-xs"
                required
              />
            </div>
          </div>

          <div className="space-y-2.5">
            <label className="text-[10px] text-gray-300 uppercase tracking-[0.2em] font-black ml-2">Parol</label>
            <div className="relative group">
              <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
              <input 
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-white/10 border border-white/20 rounded-[1.5rem] py-5 pl-14 pr-6 focus:outline-none focus:border-purple-500 transition-all text-white font-bold text-lg"
                required
              />
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-600/20 border border-red-500/40 text-red-100 text-[10px] font-black uppercase tracking-widest rounded-xl text-center shadow-lg">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-white text-black font-black py-5 rounded-[1.5rem] flex items-center justify-center gap-3 hover:bg-gray-100 transition-all active:scale-[0.97] mt-10 uppercase text-xs tracking-[0.15em] shadow-2xl shadow-white/10"
          >
            {loading ? "Kirilmoqda..." : (
              <>
                Tizimga Kirish
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        <div className="mt-12 text-center text-[7px] font-black uppercase tracking-[0.4em] text-gray-600 opacity-50">
          Admin Panel / v1.0 / © 2026 
        </div>
      </div>
    </div>
  );
}
