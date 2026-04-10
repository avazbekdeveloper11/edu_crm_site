"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sidebar } from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const userData = localStorage.getItem("center_user");
    const token = localStorage.getItem("access_token");

    if (!token || !userData) {
      router.push("/login");
    } else {
      try {
        setUser(JSON.parse(userData));
      } catch (e) {
        localStorage.clear();
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }
  }, [router]);

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
      <main className="flex-1 min-w-0 pb-32 sm:pb-0 relative">
        {children}
      </main>
    </div>
  );
}
