"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { API_BASE_URL } from "@/app/constants";
import { AlertTriangle, ChevronRight, Zap } from "lucide-react";
import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [fullCenter, setFullCenter] = useState<any>(null);

  useEffect(() => {
    const userData = localStorage.getItem("center_user");
    const token = localStorage.getItem("access_token");

    if (!token || !userData) {
      router.push("/login");
    } else {
      try {
        const parsed = JSON.parse(userData);
        setUser(parsed);
        fetch(`${API_BASE_URL}/centers/me/profile`, {
            headers: { "Authorization": `Bearer ${token}` }
        })
        .then(res => res.json())
        .then(data => setFullCenter(data))
        .catch(err => console.error("Alert fetch failed", err));
      } catch (e) {
        localStorage.clear();
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
  }, [router]);

  const getDaysRemaining = () => {
    if (!fullCenter?.tariffExpiresAt) return null;
    const expiry = new Date(fullCenter.tariffExpiresAt).getTime();
    const now = new Date().getTime();
    const diff = expiry - now;
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const daysRemaining = getDaysRemaining();
  const showWarning = daysRemaining !== null && daysRemaining <= 5;

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-[#000000] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white opacity-40">Tekshirilmoqda...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--crm-bg)] text-[var(--crm-text)] flex font-sans selection:bg-purple-500/30">
      <Sidebar centerName={user.centerName} role={user.role || "OWNER"} />
      <main className="flex-1 min-w-0 pb-32 sm:pb-0 relative flex flex-col">
        {showWarning && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-[100] w-max max-w-[90vw]">
                <div className="bg-black/80 backdrop-blur-xl border border-red-500/30 px-4 py-2 rounded-2xl flex items-center gap-3 shadow-2xl shadow-red-500/20 animate-bounce-subtle">
                    <div className="flex h-2 w-2 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                    </div>
                    <div className="flex flex-col">
                        <span className="text-[10px] font-black text-white/90 uppercase tracking-widest leading-none">
                            Obuna muddati {daysRemaining <= 0 ? "tugadi" : "yaqin"}
                        </span>
                        <span className="text-[8px] font-bold text-red-500 uppercase tracking-tighter mt-1 opacity-80">
                            {daysRemaining <= 0 ? "Darhol yangilang" : `${daysRemaining} kun qoldi`}
                        </span>
                    </div>
                    <Link 
                        href="/dashboard/settings" 
                        className="ml-2 px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-[9px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-lg shadow-red-600/20"
                    >
                        Yangilash
                    </Link>
                </div>
            </div>
        )}
        <div className="flex-1 overflow-y-auto no-scrollbar">
            {children}
        </div>
      </main>
    </div>
  );
}
