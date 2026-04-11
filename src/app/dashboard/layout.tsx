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
            <div className="w-full bg-gradient-to-r from-red-600/10 via-red-600/20 to-red-600/10 border-b border-red-500/20 px-4 py-3 flex items-center justify-center gap-3 sm:gap-6 relative overflow-hidden group">
                <div className="absolute inset-0 bg-red-600/5 animate-pulse" />
                <div className="flex items-center gap-2 relative z-10">
                    <div className="w-6 h-6 rounded-lg bg-red-500 flex items-center justify-center shadow-lg shadow-red-500/30">
                        <AlertTriangle className="w-3.5 h-3.5 text-white" />
                    </div>
                </div>
                <div className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-red-500 relative z-10 text-center">
                    DIQQAT! <span className="text-white mx-1">{fullCenter.tariff}</span> TARIFI MUDDATI <span className="bg-red-500 text-white px-2 py-0.5 rounded ml-1">{daysRemaining <= 0 ? "TUGADI" : `${daysRemaining} KUNDA TUGAYDI`}</span>
                </div>
                <Link 
                    href="/dashboard/settings" 
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-black rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-red-50 transition-all shadow-xl active:scale-95 relative z-10"
                >
                    <Zap className="w-3 h-3 text-red-600 fill-red-600" />
                    Yangilash
                    <ChevronRight className="w-3 h-3 opacity-40" />
                </Link>
            </div>
        )}
        <div className="flex-1 overflow-y-auto no-scrollbar">
            {children}
        </div>
      </main>
    </div>
  );
}
