"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";
import { API_BASE_URL } from "@/app/constants";
import { AlertTriangle, ChevronRight, Zap, X } from "lucide-react";
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
  const showWarning = daysRemaining !== null && daysRemaining <= 3; 
  const [isBannerVisible, setIsBannerVisible] = useState(true);

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
    <div className="min-h-screen bg-[var(--crm-bg)] text-[var(--crm-text)] flex font-sans selection:bg-purple-500/30 overflow-x-hidden">
      {/* GLOBAL RED BANNER - 30PX FIXED */}
      {showWarning && isBannerVisible && (
        <div className="fixed top-0 left-0 w-full h-[30px] bg-red-600 flex items-center justify-between px-6 z-[9999] shadow-2xl animate-in slide-in-from-top duration-700 border-b border-white/10">
            <div className="flex items-center gap-3">
               <AlertTriangle className="w-3.5 h-3.5 text-white animate-pulse" />
               <span className="text-[10px] font-black uppercase tracking-[0.1em] text-white">
                   DIQQAT! TO'LOVINGIZGA {daysRemaining <= 0 ? "BIR OZ" : `${daysRemaining} KUN`} QOLDI. ILTIMOS, TO'LOV QILING!
               </span>
            </div>
            <div className="flex items-center gap-2">
               <Link 
                    href="/dashboard/settings" 
                    className="px-3 py-0.5 bg-white text-red-600 rounded text-[9px] font-black uppercase tracking-widest hover:bg-gray-100 transition-all active:scale-95 shadow-lg"
                >
                    Yangilash
                </Link>
                <button 
                    onClick={() => setIsBannerVisible(false)}
                    className="p-1 hover:bg-black/20 rounded-full transition-colors text-white/80 hover:text-white"
                >
                    <X className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
      )}

      <Sidebar centerName={user.centerName} role={user.role || "OWNER"} />
      <main className={`flex-1 min-w-0 pb-32 sm:pb-0 relative flex flex-col ${showWarning && isBannerVisible ? 'mt-[30px]' : ''}`}>
        <div className="flex-1 overflow-y-auto no-scrollbar">
            {children}
        </div>
      </main>
    </div>
  );
}
