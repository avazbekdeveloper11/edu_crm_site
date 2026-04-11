"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Users,
  GraduationCap,
  Wallet,
  Calendar,
  Layers,
  Settings,
  LayoutDashboard,
  LogOut,
  Sun,
  Moon,
  Users2,
  Building2,
  BarChart3,
  Target,
  X,
  AlertTriangle,
  Zap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "./ThemeContext";

export function Sidebar({ centerName, role }: { centerName: string; role: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const { theme, toggleTheme } = useTheme();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const isOwner = role === 'OWNER' || role === 'SUPER_ADMIN';
  const isTeacher = role === 'TEACHER';
  const isAdminOrTeacher = isOwner || isTeacher;

  useEffect(() => {
    if (scrollRef.current) {
      const activeItem = scrollRef.current.querySelector('[data-active="true"]');
      if (activeItem) {
        activeItem.scrollIntoView({ behavior: 'auto', block: 'nearest', inline: 'center' });
      }
    }
  }, [pathname]);

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <>
      <aside className="hidden md:flex w-20 lg:w-72 border-r border-[var(--crm-border)] bg-[var(--crm-sidebar)] flex-col p-6 sticky top-0 h-screen z-20 shadow-2xl">
        <div className="flex items-center gap-4 mb-12 px-2">
          <div className="w-12 h-12 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center shadow-lg text-[var(--crm-accent)] group-hover:scale-110 transition-transform">
            <Building2 className="w-6 h-6" />
          </div>
          <span className="hidden lg:block text-[15px] font-black uppercase leading-[1.1] text-[var(--crm-text)] line-clamp-2 max-w-[180px] break-words">{centerName}</span>
        </div>

        <nav className="flex-1 w-full space-y-2 overflow-y-auto no-scrollbar py-4">
          {isOwner && <NavItem icon={<LayoutDashboard className="w-5 h-5" />} label="Boshqaruv" href="/dashboard" active={pathname === "/dashboard"} />}
          {isOwner && <NavItem icon={<Target className="w-5 h-5" />} label="Leadlar" href="/dashboard/leads" active={pathname === "/dashboard/leads"} />}
          <NavItem icon={<Users className="w-5 h-5" />} label="Talabalar" href="/dashboard/students" active={pathname === "/dashboard/students"} />
          {isOwner && <NavItem icon={<Users2 className="w-5 h-5" />} label="O'qituvchilar" href="/dashboard/teachers" active={pathname === "/dashboard/teachers"} />}
          {isOwner && <NavItem icon={<Layers className="w-5 h-5" />} label="Kurslar" href="/dashboard/courses" active={pathname === "/dashboard/courses"} />}
          {isAdminOrTeacher && <NavItem icon={<Calendar className="w-5 h-5" />} label="Guruhlar" href="/dashboard/groups" active={pathname === "/dashboard/groups"} />}
          {isOwner && <NavItem icon={<Wallet className="w-5 h-5" />} label="To'lovlar" href="/dashboard/payments" active={pathname === "/dashboard/payments"} />}
          {isOwner && <NavItem icon={<BarChart3 className="w-5 h-5" />} label="Hisobotlar" href="/dashboard/reports" active={pathname === "/dashboard/reports"} />}
          {isOwner && <NavItem icon={<Settings className="w-5 h-5" />} label="Sozlamalar" href="/dashboard/settings" active={pathname === "/dashboard/settings"} />}
          {isOwner && <NavItem icon={<Zap className="w-5 h-5" />} label="Tariflar" href="/dashboard/billing" active={pathname === "/dashboard/billing"} />}
        </nav>

        <div className="mt-auto pt-8 space-y-4 shrink-0">
          {/* Compact Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full h-14 rounded-2xl bg-[var(--crm-bg)] border border-[var(--crm-border)] text-[var(--crm-text-muted)] hover:text-[var(--crm-accent)] transition-all flex items-center justify-center lg:justify-start lg:px-5 gap-4 group relative overflow-hidden shadow-inner shrink-0"
          >
            <div className="relative w-6 h-6 flex items-center justify-center">
              {theme === "dark"
                ? <Sun className="w-5 h-5 transition-all group-hover:rotate-90 group-hover:scale-125" />
                : <Moon className="w-5 h-5 transition-all group-hover:-rotate-12 group-hover:scale-125" />
              }
            </div>
            <span className="hidden lg:block font-black text-[9px] uppercase tracking-[0.15em] opacity-80 group-hover:opacity-100 whitespace-nowrap">
              {theme === "dark" ? "KUNDUZGI MODE" : "TUNGI MODE"}
            </span>
            <div className="absolute inset-0 bg-[var(--crm-accent)] opacity-0 group-hover:opacity-[0.03] transition-opacity" />
          </button>

          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="w-full h-14 rounded-2xl hover:bg-red-500/10 text-[var(--crm-text-muted)] hover:text-red-500 transition-all flex items-center justify-center lg:justify-start lg:px-5 gap-4 group shrink-0"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="hidden lg:block font-black text-[9px] uppercase tracking-[0.15em] whitespace-nowrap">Chiqish</span>
          </button>
        </div>
      </aside>

      {/* Mobile Bottom Nav */}
      <div ref={scrollRef} className="md:hidden fixed bottom-10 left-4 right-4 h-20 bg-[var(--crm-sidebar)]/80 backdrop-blur-3xl border border-[var(--crm-border)] rounded-[2.5rem] z-50 flex items-center px-4 shadow-[0_20px_60px_rgba(0,0,0,0.4)] overflow-x-auto no-scrollbar gap-2 scroll-smooth">
        <div className="flex items-center justify-around w-full min-w-max gap-4 px-4 pr-10">
          {isOwner && <MobileNavItem icon={<LayoutDashboard className="w-5 h-5" />} href="/dashboard" active={pathname === "/dashboard"} label="Asosiy" />}
          {isOwner && <MobileNavItem icon={<Target className="w-5 h-5" />} href="/dashboard/leads" active={pathname === "/dashboard/leads"} label="Leadlar" />}
          <MobileNavItem icon={<Users className="w-5 h-5" />} href="/dashboard/students" active={pathname === "/dashboard/students"} label="Talabalar" />
          {isOwner && <MobileNavItem icon={<Users2 className="w-5 h-5" />} href="/dashboard/teachers" active={pathname === "/dashboard/teachers"} label="Ustozlar" />}
          {isOwner && <MobileNavItem icon={<Layers className="w-5 h-5" />} href="/dashboard/courses" active={pathname === "/dashboard/courses"} label="Kurslar" />}
          {isAdminOrTeacher && <MobileNavItem icon={<Calendar className="w-5 h-5" />} href="/dashboard/groups" active={pathname === "/dashboard/groups"} label="Guruhlar" />}
          {isOwner && <MobileNavItem icon={<Wallet className="w-5 h-5" />} href="/dashboard/payments" active={pathname === "/dashboard/payments"} label="Kassa" />}
          {isOwner && <MobileNavItem icon={<BarChart3 className="w-5 h-5" />} href="/dashboard/reports" active={pathname === "/dashboard/reports"} label="Hisobotlar" />}
          {isOwner && <MobileNavItem icon={<Settings className="w-5 h-5" />} href="/dashboard/settings" active={pathname === "/dashboard/settings"} label="Sozlamalar" />}
          {isOwner && <MobileNavItem icon={<Zap className="w-5 h-5" />} href="/dashboard/billing" active={pathname === "/dashboard/billing"} label="Tariflar" />}

          <button onClick={toggleTheme} className="w-11 h-11 rounded-2xl flex items-center justify-center text-[var(--crm-text-muted)] bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] shrink-0">
            {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
          <button 
            onClick={() => setShowLogoutConfirm(true)} 
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-red-500 bg-red-500/10 border border-red-500/20 shrink-0 active:scale-90 transition-all"
            title="Tizimdan chiqish"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setShowLogoutConfirm(false)} 
              className="absolute inset-0 bg-black/70" 
            />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }} 
              className="w-full max-w-sm bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[3rem] p-8 sm:p-10 relative z-10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden text-center"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-red-500 opacity-5 blur-3xl -mr-16 -mt-16 rounded-full" />
              
              <div className="w-20 h-20 bg-red-500/10 border border-red-500/10 rounded-3xl flex items-center justify-center text-red-500 mx-auto mb-8 shadow-inner">
                <LogOut className="w-10 h-10" />
              </div>
              
              <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-4">Tizimdan chiqish?</h3>
              <p className="text-[var(--crm-text-muted)] text-[10px] font-black uppercase tracking-widest opacity-60 leading-relaxed mb-10 px-4">
                Haqiqatan ham o'z hisobingizdan chiqmoqchimisiz? Barcha ochilgan seanslar tozalanishi mumkin.
              </p>
              
              <div className="flex flex-col gap-3">
                <button 
                  onClick={handleLogout}
                  className="w-full py-5 bg-red-500 text-white rounded-2xl font-black text-[11px] uppercase tracking-widest shadow-xl shadow-red-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                >
                  Ha, chiqish
                </button>
                <button 
                  onClick={() => setShowLogoutConfirm(false)}
                  className="w-full py-5 bg-[var(--crm-bg)] text-[var(--crm-text-muted)] border border-[var(--crm-border)] rounded-2xl font-black text-[11px] uppercase tracking-widest hover:bg-[var(--crm-border)] transition-all"
                >
                  Bekor qilish
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

function MobileNavItem({ icon, href, active, label }: { icon: any; href: string; active: boolean; label: string }) {
  return (
    <Link href={href} data-active={active} className="flex flex-col items-center gap-1 shrink-0">
      <div className={`w-11 h-11 flex items-center justify-center rounded-2xl transition-all ${active ? "bg-[var(--crm-accent)] text-white shadow-lg shadow-purple-600/30 scale-110" : "text-[var(--crm-text-muted)] bg-[var(--crm-bg)]/30 border border-transparent"}`}>
        {icon}
      </div>
      {active && <span className="text-[7px] font-black uppercase tracking-widest text-[var(--crm-accent)]">{label}</span>}
    </Link>
  );
}

function NavItem({ icon, label, href, active }: { icon: any; label: string; href: string; active: boolean }) {
  return (
    <Link href={href} className={`
      flex items-center gap-4 px-5 py-4 rounded-2xl cursor-pointer transition-all duration-400
      ${active
        ? "bg-[var(--crm-accent)] text-white shadow-lg shadow-purple-600/20"
        : "text-[var(--crm-text-muted)] hover:text-[var(--crm-text)] hover:bg-[var(--crm-border)]"}
    `}>
      <div className={`${active ? "scale-110" : "group-hover:scale-110"} transition-transform`}>
        {icon}
      </div>
      <span className="hidden lg:block font-black text-[10px] uppercase tracking-[0.1em]">{label}</span>
    </Link>
  );
}



