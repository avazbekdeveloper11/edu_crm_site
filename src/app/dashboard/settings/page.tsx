"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  Wallet,
  Calendar,
  Layers,
  Settings,
  LayoutDashboard,
  LogOut,
  Building2,
  ShieldCheck,
  Bell,
  UserPlus,
  Key,
  Trash2,
  Plus,
  CheckCircle2,
  Users2,
  X,
  ChevronDown,
  User,
  HelpCircle,
  Phone,
  MessageCircle,
  ExternalLink
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeContext";
import { API_BASE_URL } from "@/app/constants";

export default function SettingsPage() {
  const router = useRouter();
  const [center, setCenter] = useState<any>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("center_user");
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [role, setRole] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem("center_user");
      if (saved) return JSON.parse(saved).role || "OWNER";
    }
    return "";
  });
  const [users, setUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [showUserModal, setShowUserModal] = useState(false);
  const [isEditingUser, setIsEditingUser] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  const [userForm, setUserForm] = useState({
    name: "",
    login: "",
    password: "",
    confirmPassword: "",
    role: "CASHIER",
    specialization: ""
  });
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationForm, setNotificationForm] = useState({
    target: "STUDENTS",
    message: "",
    groupId: ""
  });
  const [sendingNotification, setSendingNotification] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [credentialsForm, setCredentialsForm] = useState({
    login: "",
    password: "",
    confirmPassword: ""
  });
  const [updatingCredentials, setUpdatingCredentials] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [profileForm, setProfileForm] = useState({
    name: "",
    botToken: "",
    eskizEmail: "",
    eskizPassword: "",
    smsEnabled: false
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [showSystemModal, setShowSystemModal] = useState(false);
  const [showTariffsModal, setShowTariffsModal] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState<"Monthly" | "Yearly">("Monthly");
  const [requestingUpgrade, setRequestingUpgrade] = useState(false);
  const [fullCenter, setFullCenter] = useState<any>(null);
  const { theme, toggleTheme } = useTheme();

  const fetchFullCenter = async () => {
    const token = localStorage.getItem("access_token");
    try {
        const res = await fetch(`${API_BASE_URL}/centers/me/profile`, {
            headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) setFullCenter(await res.json());
    } catch (err) { console.error("Fetch full center failed", err); }
  };

  useEffect(() => {
    fetchFullCenter();
  }, []);

  const handleRequestUpgrade = async (tariff: string) => {
    if (fullCenter?.tariff === tariff && fullCenter?.tariffType === billingCycle) {
        alert("Siz allaqachon ushbu tarif va muddatdasiz!");
        return;
    }
    setRequestingUpgrade(true);
    const token = localStorage.getItem("access_token");
    try {
        const res = await fetch(`${API_BASE_URL}/centers/request-upgrade`, {
            method: "POST",
            headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
            body: JSON.stringify({ tariff, billingCycle })
        });
        if (res.ok) {
            alert("So'rov yuborildi! Tez orada Super Admin siz bilan bog'lanadi.");
            setShowTariffsModal(false);
        }
    } catch (err) { console.error("Upgrade request failed", err); }
    finally { setRequestingUpgrade(false); }
  };

  const fetchUsers = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setUsers(await res.json());
    } catch (err) { console.error("Fetch users failed", err); }
  };

  const fetchGroups = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_BASE_URL}/groups`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setGroups(await res.json());
    } catch (err) { console.error("Fetch groups failed", err); }
  };

  useEffect(() => {
    const userData = localStorage.getItem("center_user");
    if (!userData) {
      router.push("/login");
      return;
    }
    fetchUsers();
    fetchGroups();
  }, []);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userForm.password !== userForm.confirmPassword) {
        alert("Parollar mos kelmadi!");
        return;
    }
    const token = localStorage.getItem("access_token");
    const url = isEditingUser ? `${API_BASE_URL}/users/${editingUserId}` : `${API_BASE_URL}/users`;
    const method = isEditingUser ? "PUT" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(userForm)
      });
      if (res.ok) {
        fetchUsers();
        setShowUserModal(false);
        setUserForm({ name: "", login: "", password: "", confirmPassword: "", role: "CASHIER", specialization: "" });
      }
    } catch (err) { console.error("User save failed", err); }
  };

  const deleteUser = async (id: number) => {
    if (!confirm("Ushbu xodimni o'chirishni xohlaysizmi?")) return;
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchUsers();
    } catch (err) { console.error("Delete user failed", err); }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingNotification(true);
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_BASE_URL}/notifications/send`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(notificationForm)
      });
      if (res.ok) {
        alert("Xabar yuborilmoqda!");
        setShowNotificationModal(false);
        setNotificationForm({ target: "STUDENTS", message: "", groupId: "" });
      } else {
        const error = await res.json();
        alert(`Xatolik: ${error.message || 'Xabar yuborib bo\'lmadi'}`);
      }
    } catch (err) { 
      console.error("Notification send failed", err); 
      alert("Xabar yuborishda xatolik yuz berdi");
    } finally {
      setSendingNotification(false);
    }
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (credentialsForm.password !== credentialsForm.confirmPassword) {
        alert("Parollar mos kelmadi!");
        return;
    }
    setUpdatingCredentials(true);
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_BASE_URL}/centers/me/credentials`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ login: credentialsForm.login, password: credentialsForm.password })
      });
      if (res.ok) {
        alert("Login va parol o'zgartirildi!");
        setShowCredentialsModal(false);
        setCredentialsForm({ login: "", password: "", confirmPassword: "" });
      } else {
        const error = await res.json();
        alert(`Xatolik: ${error.message || 'O\'zgartirishda xatolik'}`);
      }
    } catch (err) { 
      console.error("Credentials update failed", err); 
      alert("Xatolik yuz berdi");
    } finally {
      setUpdatingCredentials(false);
    }
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_BASE_URL}/centers/me/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(profileForm)
      });
      if (res.ok) {
        alert("Markaz ma'lumotlari yangilandi!");
        setShowProfileModal(false);
        // Update local storage if needed
        const userData = localStorage.getItem("center_user");
        if (userData) {
            const parsed = JSON.parse(userData);
            parsed.centerName = profileForm.name;
            parsed.botToken = profileForm.botToken;
            parsed.eskizEmail = profileForm.eskizEmail;
            parsed.eskizPassword = profileForm.eskizPassword;
            parsed.smsEnabled = profileForm.smsEnabled;
            localStorage.setItem("center_user", JSON.stringify(parsed));
            setCenter(parsed);
        }
      } else {
        const error = await res.json();
        alert(`Xatolik: ${error.message || 'Yangilashda xatolik'}`);
      }
    } catch (err) { 
      console.error("Profile update failed", err); 
      alert("Xatolik yuz berdi");
    } finally {
      setUpdatingProfile(false);
    }
  };
  
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !center) return (
    <div className="min-h-screen bg-[var(--crm-bg)] flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
    </div>
  );

  return (
    <>
        <header className="min-h-[60px] sm:min-h-24 border-b border-[var(--crm-border)] flex items-center justify-between px-4 sm:px-10 bg-[var(--crm-sidebar)]/50 backdrop-blur-xl sticky top-0 z-40 py-2 sm:py-0 gap-4">
          <div className="flex flex-col items-start">
              <h1 className="text-xl sm:text-5xl font-black tracking-tighter uppercase leading-none italic opacity-10">Sozlamalar</h1>
              <p className="hidden sm:block text-[var(--crm-text-muted)] text-[9px] font-black uppercase tracking-[0.25em] mt-1 opacity-60">Xavfsizlik va atributlar</p>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
              <div className="flex flex-col items-end">
                  <span className="text-[7px] sm:text-[9px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.2em] opacity-60 leading-none mb-0.5">Sessiya</span>
                  <span className="text-xs sm:text-xl font-black text-[var(--crm-accent)] tracking-tighter leading-none uppercase italic truncate max-w-[100px] sm:max-w-[150px]">{center?.displayName || center?.login}</span>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-[1.25rem] bg-[var(--crm-accent)]/10 border border-[var(--crm-accent)]/10 flex items-center justify-center text-[var(--crm-accent)] shadow-xl shrink-0">
                  <User className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
          </div>
        </header>

        <section className="p-4 sm:p-12 max-w-7xl mx-auto min-h-screen">
            <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 sm:gap-6 mb-12 sm:mb-20 px-2 sm:px-0">
                <SettingsCard onClick={() => { setProfileForm({ name: center?.centerName || center?.name || "", botToken: center?.botToken || "", eskizEmail: center?.eskizEmail || "", eskizPassword: center?.eskizPassword || "", smsEnabled: center?.smsEnabled || false }); setShowProfileModal(true); }} icon={<Building2 className="w-5 h-5 sm:w-6 sm:h-6" />} title="Markaz" desc="Profil va brend" />
                <SettingsCard onClick={() => { setCredentialsForm({...credentialsForm, login: center?.login}); setShowCredentialsModal(true); }} icon={<ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />} title="Ximoya" desc="Login va parol" />
                <SettingsCard onClick={() => setShowNotificationModal(true)} icon={<Bell className="w-5 h-5 sm:w-6 sm:h-6" />} title="Xabar" desc="Xabarnomalar" />
                <SettingsCard onClick={() => setShowTariffsModal(true)} icon={<Wallet className="w-5 h-5 sm:w-6 sm:h-6 text-orange-500" />} title="Tarif" desc="Subscription plan" />
                <SettingsCard onClick={() => setShowSystemModal(true)} icon={<Layers className="w-5 h-5 sm:w-6 sm:h-6" />} title="Tizim" desc="Vizual sozlamalar" />
                <SettingsCard onClick={() => setShowHelpModal(true)} icon={<HelpCircle className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />} title="Yordam" desc="Qo'llab-quvvatlash" />
            </div>

            <div className="bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[2.5rem] sm:rounded-[4rem] p-8 sm:p-12 relative overflow-hidden group shadow-[0_30px_100px_rgba(0,0,0,0.2)] mb-12 sm:mb-20">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--crm-accent)] opacity-5 blur-[120px] -mr-48 -mt-48 rounded-full" />
                <h3 className="text-3xl sm:text-4xl font-black mb-6 sm:mb-8 uppercase tracking-tighter leading-none">Profil Atributlari</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-12 relative z-10">
                    <div className="space-y-1">
                        <div className="text-[var(--crm-text-muted)] text-[10px] font-black uppercase tracking-[0.25em] opacity-50">Tizimdagi Login</div>
                        <div className="text-[var(--crm-text)] font-black text-2xl tracking-tighter uppercase">{center.login}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-[var(--crm-text-muted)] text-[10px] font-black uppercase tracking-[0.25em] opacity-50">Status / Rol</div>
                        <div className="text-[var(--crm-accent)] font-black text-2xl tracking-tighter uppercase leading-none flex items-center gap-2">
                            {role}
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        </div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-[var(--crm-text-muted)] text-[10px] font-black uppercase tracking-[0.25em] opacity-50">Sessiya Holati</div>
                        <div className="text-green-500 font-black text-2xl tracking-tighter uppercase">AKTIV</div>
                    </div>
                </div>
            </div>

            {(role === 'OWNER' || role === 'SUPER_ADMIN') && (
                <div className="space-y-10">
                    <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 sm:gap-8">
                        <div className="px-2 sm:px-0">
                            <h2 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-none grayscale opacity-30 italic">Xodimlar</h2>
                            <p className="text-[var(--crm-text-muted)] text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] mt-2 sm:mt-3 opacity-60">Jamoa boshqaruv paneli</p>
                        </div>
                        <button 
                            onClick={() => { setIsEditingUser(false); setUserForm({ name: "", login: "", password: "", confirmPassword: "", role: "CASHIER", specialization: "" }); setShowUserModal(true); }}
                            className="bg-[var(--crm-accent)] hover:scale-105 transition-all text-white px-8 sm:px-10 py-5 rounded-[1.5rem] sm:rounded-[1.8rem] font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-2xl shadow-purple-600/30 active:scale-95 flex items-center justify-center gap-4 w-full sm:w-auto"
                        >
                            <UserPlus className="w-5 h-5 shadow-lg" />
                            Xodim Qo'shish
                        </button>
                    </header>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {users.length === 0 ? (
                            <div className="col-span-full p-24 text-center rounded-[3.5rem] bg-[var(--crm-card)] border border-dashed border-[var(--crm-border)] opacity-30 shadow-inner">
                                <Users2 className="w-20 h-20 text-[var(--crm-text-muted)]/20 mx-auto mb-8" />
                                <h3 className="text-3xl font-black mb-3 uppercase tracking-tighter">Xodimlar mavjud emas</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest leading-relaxed">Markaz uchun professional jamoani shakllantirishni boshlang</p>
                            </div>
                        ) : (
                            users.map(u => (
                                <div key={u.id} className="bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-[var(--crm-accent)] transition-all shadow-[0_20px_60px_rgba(0,0,0,0.1)] relative overflow-hidden active:scale-[0.98]">
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--crm-accent)] opacity-[0.02] blur-[40px] -mr-16 -mt-16 rounded-full group-hover:opacity-[0.08] transition-all" />
                                    
                                    <div className="flex items-center gap-4 sm:gap-6 min-w-0 w-full">
                                        <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.2rem] sm:rounded-[1.5rem] bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] flex items-center justify-center font-black text-[var(--crm-text)] text-lg sm:text-xl group-hover:bg-[var(--crm-accent)] group-hover:text-white transition-all duration-500 shadow-lg capitalize shrink-0">
                                            {u.name[0]}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <h4 className="text-xl sm:text-2xl font-black tracking-tighter uppercase text-[var(--crm-text)] leading-none mb-2 group-hover:text-[var(--crm-accent)] transition-colors truncate">{u.name}</h4>
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                                                <span className="text-[8px] sm:text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-widest opacity-60 italic truncate max-w-[100px]">{u.login}</span>
                                                <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-[var(--crm-border)] opacity-30" />
                                                <span className="text-[8px] sm:text-[10px] text-[var(--crm-accent)] font-black uppercase tracking-widest opacity-80">{u.role}</span>
                                                {u.specialization && <div className="hidden sm:block w-1.5 h-1.5 rounded-full bg-[var(--crm-border)] opacity-30" />}
                                                {u.specialization && <span className="text-[8px] sm:text-[10px] text-green-500 font-black uppercase tracking-widest opacity-80">{u.specialization}</span>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end sm:translate-x-4 opacity-100 sm:opacity-0 group-hover:opacity-100 sm:group-hover:translate-x-0 transition-all duration-300">
                                        <button 
                                            onClick={() => { 
                                                setEditingUserId(u.id); 
                                                setUserForm({ name: u.name, login: u.login, password: u.password, confirmPassword: u.password, role: u.role, specialization: u.specialization || "" }); 
                                                setIsEditingUser(true); 
                                                setShowUserModal(true); 
                                            }}
                                            className="p-4 bg-[var(--crm-bg)] hover:bg-blue-600 hover:text-white rounded-[1.25rem] border border-[var(--crm-border)] text-blue-500 transition-all shadow-xl active:scale-90"
                                        >
                                            <Key className="w-5 h-5 shadow-lg" />
                                        </button>
                                        {u.login !== center.login && (
                                            <button onClick={() => deleteUser(u.id)} className="p-4 bg-[var(--crm-bg)] hover:bg-red-600 hover:text-white rounded-[1.25rem] border border-[var(--crm-border)] text-red-500 transition-all shadow-xl active:scale-90">
                                                <Trash2 className="w-5 h-5 shadow-lg" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            )}
        </section>

        {/* Premium Employee Modal */}
        <AnimatePresence>
            {showUserModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-md">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowUserModal(false)} className="absolute inset-0 bg-black/70" />
                    <motion.div initial={{ scale: 0.95, opacity: 0, y: 100 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 100 }} className="w-full max-w-lg bg-[var(--crm-card)] border-t sm:border border-[var(--crm-border)] rounded-t-[3rem] sm:rounded-[4rem] p-8 sm:p-12 relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--crm-accent)] opacity-5 blur-[120px] -mr-48 -mt-48 rounded-full" />
                        
                        <header className="mb-10 relative flex items-center justify-between">
                            <div>
                                <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">{isEditingUser ? "Xodimni Tahrirlash" : "Yangi Xodim"}</h2>
                                <p className="text-[var(--crm-text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic opacity-60">Sessiya va kirish huquqlari atributlari</p>
                            </div>
                            <button onClick={() => setShowUserModal(false)} className="p-4 bg-[var(--crm-bg)] rounded-full hover:bg-white/5 text-[var(--crm-text-muted)] transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </header>

                        <form onSubmit={handleUserSubmit} className="space-y-8 relative">
                            <div className="space-y-2">
                                <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Xodim FISH</label>
                                <input type="text" placeholder="Masalan: Akmal Toirov" value={userForm.name} onChange={(e) => setUserForm({...userForm, name: e.target.value})} required className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Xizmat Logini</label>
                                <input type="text" placeholder="LOG_HR_24" value={userForm.login} onChange={(e) => setUserForm({...userForm, login: e.target.value})} required className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Parol</label>
                                    <input type="password" autoComplete="new-password" placeholder="••••••" value={userForm.password} onChange={(e) => setUserForm({...userForm, password: e.target.value})} required className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.5rem] px-6 py-4 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Tasdiqlash</label>
                                    <input type="password" autoComplete="new-password" placeholder="••••••" value={userForm.confirmPassword} onChange={(e) => setUserForm({...userForm, confirmPassword: e.target.value})} required className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.5rem] px-6 py-4 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner" />
                                </div>
                            </div>
                            {userForm.role === 'TEACHER' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Mutaxassisligi (Fani)</label>
                                    <input type="text" placeholder="Masalan: Ingliz tili" value={userForm.specialization} onChange={(e) => setUserForm({...userForm, specialization: e.target.value})} className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner" />
                                </div>
                            )}
                            {(!isEditingUser || (isEditingUser && editingUserId !== center.id)) && (
                                <div className="space-y-2">
                                    <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Lavozim Huquqi</label>
                                    <div className="relative group">
                                        <select value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})} className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-[10px] font-black appearance-none cursor-pointer shadow-inner pr-16 translate-y-[-1px]">
                                            <option value="CASHIER" className={theme === "dark" ? "bg-black" : "bg-white"}>KASSIR (CHЕKLANGAN HUQUQLAR)</option>
                                            <option value="TEACHER" className={theme === "dark" ? "bg-black" : "bg-white"}>O'QITUVCHI (DAVOMAT VA GURUHLAR)</option>
                                            <option value="OWNER" className={theme === "dark" ? "bg-black" : "bg-white"}>ADMINISTRATOR (TО'LIQ BOSHQUV)</option>
                                        </select>
                                        <ChevronDown className="absolute right-7 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--crm-text-muted)] pointer-events-none" />
                                    </div>
                                </div>
                            )}
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowUserModal(false)} className="flex-1 py-5 bg-[var(--crm-bg)] border border-[var(--crm-border)] text-[var(--crm-text-muted)] rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--crm-border)] transition-all">Bekor</button>
                                <button type="submit" className="flex-[2] py-5 bg-[var(--crm-accent)] text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all">Saqlash</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* Mass Notification Modal */}
        <AnimatePresence>
            {showNotificationModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-md">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowNotificationModal(false)} className="absolute inset-0 bg-black/70" />
                    <motion.div initial={{ scale: 0.95, opacity: 0, y: 100 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 100 }} className="w-full max-w-lg bg-[var(--crm-card)] border-t sm:border border-[var(--crm-border)] rounded-t-[3rem] sm:rounded-[4rem] p-8 sm:p-12 relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--crm-accent)] opacity-5 blur-[120px] -mr-48 -mt-48 rounded-full" />
                        
                        <header className="mb-10 relative flex items-center justify-between">
                            <div>
                                <h2 className="text-4xl font-black tracking-tighter uppercase leading-none italic">Massiv Xabar</h2>
                                <p className="text-[var(--crm-text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic opacity-60">Mijozlarga Telegram xabarnoma yuborish</p>
                            </div>
                            <button onClick={() => setShowNotificationModal(false)} className="p-4 bg-[var(--crm-bg)] rounded-full hover:bg-white/5 text-[var(--crm-text-muted)] transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </header>
    
                        <form onSubmit={handleSendNotification} className="space-y-8 relative">
                            <div className="space-y-2">
                                <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Kimlarga yuborish?</label>
                                <div className="relative group">
                                    <select 
                                        value={notificationForm.target} 
                                        onChange={(e) => setNotificationForm({...notificationForm, target: e.target.value})}
                                        className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-[10px] font-black uppercase appearance-none cursor-pointer shadow-inner pr-16 translate-y-[-1px]"
                                    >
                                        <option value="STUDENTS" className={theme === "dark" ? "bg-black" : "bg-white"}>BARCHA TALABALARGA</option>
                                        <option value="PARENTS" className={theme === "dark" ? "bg-black" : "bg-white"}>BARCHA OTA-ONALARGA</option>
                                        <option value="GROUP" className={theme === "dark" ? "bg-black" : "bg-white"}>ALOHIDA GURUHGA</option>
                                        <option value="ALL" className={theme === "dark" ? "bg-black" : "bg-white"}>BARCHA KONTAKTLARGA</option>
                                    </select>
                                    <ChevronDown className="absolute right-7 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--crm-text-muted)] pointer-events-none" />
                                </div>
                            </div>

                            {notificationForm.target === 'GROUP' && (
                                <div className="space-y-2">
                                    <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Guruhni tanlang</label>
                                    <div className="relative group">
                                        <select 
                                            value={notificationForm.groupId} 
                                            onChange={(e) => setNotificationForm({...notificationForm, groupId: e.target.value})}
                                            required
                                            className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-[10px] font-black uppercase appearance-none cursor-pointer shadow-inner pr-16 translate-y-[-1px]"
                                        >
                                            <option value="">Guruhni tanlang...</option>
                                            {groups.map(g => (
                                                <option key={g.id} value={g.id} className={theme === "dark" ? "bg-black" : "bg-white"}>{g.name}</option>
                                            ))}
                                        </select>
                                        <ChevronDown className="absolute right-7 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--crm-text-muted)] pointer-events-none" />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-2">
                                <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Xabar matni</label>
                                <textarea 
                                    rows={6}
                                    placeholder="Masalan: Dars vaqti o'zgardi! Ertaga soat 14:00 da kutamiz." 
                                    value={notificationForm.message} 
                                    onChange={(e) => setNotificationForm({...notificationForm, message: e.target.value})} 
                                    required 
                                    className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-6 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner resize-none"
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowNotificationModal(false)} className="flex-1 py-5 bg-[var(--crm-bg)] border border-[var(--crm-border)] text-[var(--crm-text-muted)] rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--crm-border)] transition-all">Bekor</button>
                                <button 
                                    type="submit" 
                                    disabled={sendingNotification}
                                    className="flex-[2] py-5 bg-[var(--crm-accent)] text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:grayscale"
                                >
                                    {sendingNotification ? "Yuborilmoqda..." : "Hoziroq yuborish"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* Security / Credentials Modal */}
        <AnimatePresence>
            {showCredentialsModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-md">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowCredentialsModal(false)} className="absolute inset-0 bg-black/70" />
                    <motion.div initial={{ scale: 0.95, opacity: 0, y: 100 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 100 }} className="w-full max-w-lg bg-[var(--crm-card)] border-t sm:border border-[var(--crm-border)] rounded-t-[3rem] sm:rounded-[4rem] p-8 sm:p-12 relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--crm-accent)] opacity-5 blur-[120px] -mr-48 -mt-48 rounded-full" />
                        
                        <header className="mb-10 relative flex items-center justify-between">
                            <div>
                                <h2 className="text-4xl font-black tracking-tighter uppercase leading-none italic">Login va Parol</h2>
                                <p className="text-[var(--crm-text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic opacity-60">Asosiy kirish ma'lumotlarini tahrirlash</p>
                            </div>
                            <button onClick={() => setShowCredentialsModal(false)} className="p-4 bg-[var(--crm-bg)] rounded-full hover:bg-white/5 text-[var(--crm-text-muted)] transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </header>
    
                        <form onSubmit={handleUpdateCredentials} className="space-y-8 relative">
                            <div className="space-y-2">
                                <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Markaz Logini</label>
                                <input 
                                    type="text" 
                                    placeholder="demo" 
                                    value={credentialsForm.login} 
                                    onChange={(e) => setCredentialsForm({...credentialsForm, login: e.target.value})} 
                                    required 
                                    className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Yangi Parol</label>
                                    <input 
                                        type="password" 
                                        autoComplete="new-password"
                                        placeholder="••••••" 
                                        value={credentialsForm.password} 
                                        onChange={(e) => setCredentialsForm({...credentialsForm, password: e.target.value})} 
                                        required 
                                        className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.5rem] px-6 py-4 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Tasdiqlash</label>
                                    <input 
                                        type="password" 
                                        autoComplete="new-password"
                                        placeholder="••••••" 
                                        value={credentialsForm.confirmPassword} 
                                        onChange={(e) => setCredentialsForm({...credentialsForm, confirmPassword: e.target.value})} 
                                        required 
                                        className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.5rem] px-6 py-4 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowCredentialsModal(false)} className="flex-1 py-5 bg-[var(--crm-bg)] border border-[var(--crm-border)] text-[var(--crm-text-muted)] rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--crm-border)] transition-all">Bekor</button>
                                <button 
                                    type="submit" 
                                    disabled={updatingCredentials}
                                    className="flex-[2] py-5 bg-[var(--crm-accent)] text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {updatingCredentials ? "Saqlanmoqda..." : "Yangilash"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* Profile / Brand Modal */}
        <AnimatePresence>
            {showProfileModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-md">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowProfileModal(false)} className="absolute inset-0 bg-black/70" />
                    <motion.div initial={{ scale: 0.95, opacity: 0, y: 100 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 100 }} className="w-full max-w-lg bg-[var(--crm-card)] border-t sm:border border-[var(--crm-border)] rounded-t-[3rem] sm:rounded-[4rem] p-8 sm:p-12 relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--crm-accent)] opacity-5 blur-[120px] -mr-48 -mt-48 rounded-full" />
                        
                        <header className="mb-10 relative flex items-center justify-between">
                            <div>
                                <h2 className="text-4xl font-black tracking-tighter uppercase leading-none italic">Markaz Profili</h2>
                                <p className="text-[var(--crm-text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic opacity-60">Brend va tizim sozlamalari</p>
                            </div>
                            <button onClick={() => setShowProfileModal(false)} className="p-4 bg-[var(--crm-bg)] rounded-full hover:bg-white/5 text-[var(--crm-text-muted)] transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </header>
    
                        <form onSubmit={handleUpdateProfile} className="space-y-8 relative">
                            <div className="space-y-2">
                                <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Markaz Nomi</label>
                                <input 
                                    type="text" 
                                    placeholder="Demo O'quv Markazi" 
                                    value={profileForm.name} 
                                    onChange={(e) => setProfileForm({...profileForm, name: e.target.value})} 
                                    required 
                                    className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Telegram Bot Token</label>
                                <input 
                                    type="text" 
                                    placeholder="123456:ABC-DEF..." 
                                    value={profileForm.botToken} 
                                    onChange={(e) => setProfileForm({...profileForm, botToken: e.target.value})} 
                                    className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner"
                                />
                                <p className="px-4 text-[9px] text-[var(--crm-text-muted)] italic">Token xabarnomalar va davomat alertlari uchun zarur.</p>
                            </div>

                            <div className="space-y-6 pt-4 border-t border-[var(--crm-border)]">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="text-sm font-black uppercase tracking-tighter">SMS Xizmati</h4>
                                        <p className="text-[8px] text-[var(--crm-text-muted)] uppercase font-bold tracking-widest mt-1">Eskiz.uz orqali SMS yuborish</p>
                                    </div>
                                    <button 
                                        type="button"
                                        onClick={() => setProfileForm({...profileForm, smsEnabled: !profileForm.smsEnabled})}
                                        className={`w-12 h-6 rounded-full relative transition-all duration-300 ${profileForm.smsEnabled ? 'bg-green-500' : 'bg-[var(--crm-border)]'}`}
                                    >
                                        <motion.div 
                                            animate={{ x: profileForm.smsEnabled ? 26 : 4 }}
                                            className="absolute top-1 w-4 h-4 bg-white rounded-full shadow-md"
                                        />
                                    </button>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Eskiz.uz Email</label>
                                        <input 
                                            type="email" 
                                            placeholder="example@mail.uz" 
                                            value={profileForm.eskizEmail} 
                                            onChange={(e) => setProfileForm({...profileForm, eskizEmail: e.target.value})} 
                                            className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-4 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Eskiz.uz Parol</label>
                                        <input 
                                            type="password" 
                                            placeholder="••••••••" 
                                            value={profileForm.eskizPassword} 
                                            onChange={(e) => setProfileForm({...profileForm, eskizPassword: e.target.value})} 
                                            className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-4 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowProfileModal(false)} className="flex-1 py-5 bg-[var(--crm-bg)] border border-[var(--crm-border)] text-[var(--crm-text-muted)] rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--crm-border)] transition-all">Bekor</button>
                                <button 
                                    type="submit" 
                                    disabled={updatingProfile}
                                    className="flex-[2] py-5 bg-[var(--crm-accent)] text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                >
                                    {updatingProfile ? "Saqlanmoqda..." : "Saqlash"}
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
        
        {/* Tariffs / Subscription Modal */}
        <AnimatePresence>
            {showTariffsModal && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 backdrop-blur-2xl">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowTariffsModal(false)} className="absolute inset-0 bg-black/80" />
                    <motion.div initial={{ scale: 0.9, opacity: 0, y: 50 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 50 }} className="w-full max-w-6xl bg-[#0a0a0a]/90 border border-white/10 rounded-[3rem] sm:rounded-[4rem] p-8 sm:p-14 relative z-10 shadow-[0_0_150px_rgba(139,92,246,0.15)] overflow-y-auto max-h-[92vh] no-scrollbar">
                        <header className="mb-10 text-center">
                            <h2 className="text-4xl sm:text-6xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent mb-4">FAOL TARIFLAR</h2>
                            <p className="text-[var(--crm-text-muted)] text-[10px] sm:text-xs font-black uppercase tracking-[0.3em] opacity-60">Markazingiz uchun mukammal rejani tanlang</p>
                            
                            {/* Billing Cycle Toggle */}
                            <div className="mt-10 flex items-center justify-center gap-6">
                                <span className={`text-[10px] font-black uppercase tracking-widest transition-all ${billingCycle === 'Monthly' ? 'text-white' : 'text-gray-500'}`}>Oylik</span>
                                <button 
                                    onClick={() => setBillingCycle(billingCycle === 'Monthly' ? 'Yearly' : 'Monthly')}
                                    className="w-16 h-8 rounded-full bg-white/5 border border-white/10 relative p-1"
                                >
                                    <motion.div 
                                        animate={{ x: billingCycle === 'Monthly' ? 0 : 32 }}
                                        className="w-6 h-6 bg-purple-600 rounded-full shadow-lg shadow-purple-600/30"
                                    />
                                </button>
                                <div className="flex items-center gap-3">
                                    <span className={`text-[10px] font-black uppercase tracking-widest transition-all ${billingCycle === 'Yearly' ? 'text-purple-500' : 'text-gray-500'}`}>Yillik</span>
                                    <span className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-500 text-[8px] font-black rounded-full uppercase italic">-2 OY SOVG'A</span>
                                </div>
                            </div>

                            {fullCenter && (
                                <div className="mt-10 inline-flex items-center gap-4 px-6 py-2 bg-purple-600/10 border border-purple-500/20 rounded-full">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Hozirgi Tarif:</span>
                                    <span className="text-sm font-black text-purple-500 uppercase italic">
                                        {fullCenter.tariff} ({fullCenter.tariffType === 'Yearly' ? 'Yillik' : 'Oylik'})
                                    </span>
                                </div>
                            )}
                        </header>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            <TariffCard 
                                name="Standart"
                                price={billingCycle === 'Monthly' ? "299 000" : "249 166"}
                                yearlyTotal="2 990 000"
                                billingCycle={billingCycle}
                                students="100"
                                staff="5"
                                features={["CRM Lead boshqaruv", "To'lovlar va Kassa", "Telegram Bot xabarnomalari", "SMS xizmati (Eskiz)"]}
                                active={fullCenter?.tariff === "Standart" && fullCenter?.tariffType === billingCycle}
                                isCurrent={fullCenter?.tariff === "Standart" && fullCenter?.tariffType !== billingCycle}
                                themeColor="blue"
                                icon={<Plus className="w-8 h-8" />}
                                onSelect={() => handleRequestUpgrade("Standart")}
                            />
                            <TariffCard 
                                name="Premium"
                                price={billingCycle === 'Monthly' ? "499 000" : "415 833"}
                                yearlyTotal="4 990 000"
                                billingCycle={billingCycle}
                                students="400"
                                staff="25"
                                features={["Barcha Standart imkoniyatlar", "Kengaytirilgan Statistika", "Davomat va Jurnallar", "Prioritetli qo'llab-quvvatlash"]}
                                active={fullCenter?.tariff === "Premium" && fullCenter?.tariffType === billingCycle}
                                isCurrent={fullCenter?.tariff === "Premium" && fullCenter?.tariffType !== billingCycle}
                                themeColor="purple"
                                popular
                                icon={<CheckCircle2 className="w-8 h-8" />}
                                onSelect={() => handleRequestUpgrade("Premium")}
                            />
                            <TariffCard 
                                name="VIP"
                                price={billingCycle === 'Monthly' ? "999 000" : "832 500"}
                                yearlyTotal="9 990 000"
                                billingCycle={billingCycle}
                                students="CHEKSIZ"
                                staff="CHEKSIZ"
                                features={["Barcha Premium imkoniyatlar", "Shaxsiy menejer", "Brand xabarlar", "Maxsus funksiyalar (Custom)"]}
                                active={fullCenter?.tariff === "VIP" && fullCenter?.tariffType === billingCycle}
                                isCurrent={fullCenter?.tariff === "VIP" && fullCenter?.tariffType !== billingCycle}
                                themeColor="orange"
                                icon={<ShieldCheck className="w-8 h-8" />}
                                onSelect={() => handleRequestUpgrade("VIP")}
                            />
                        </div>

                        <div className="mt-16 text-center text-gray-500">
                             <p className="text-[10px] uppercase font-black tracking-[.2em] opacity-40 italic">
                                {billingCycle === 'Monthly' ? 'Barcha to\'lovlar oylik asosda amalga oshiriladi' : 'Yillik to\'lovda 2 oylik qiymat tejaladi'}
                             </p>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* System / Visual Modal */}
        <AnimatePresence>
            {showSystemModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-md">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowSystemModal(false)} className="absolute inset-0 bg-black/70" />
                    <motion.div initial={{ scale: 0.95, opacity: 0, y: 100 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 100 }} className="w-full max-w-lg bg-[var(--crm-card)] border-t sm:border border-[var(--crm-border)] rounded-t-[3rem] sm:rounded-[4rem] p-8 sm:p-12 relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--crm-accent)] opacity-5 blur-[120px] -mr-48 -mt-48 rounded-full" />
                        
                        <header className="mb-10 relative flex items-center justify-between">
                            <div>
                                <h2 className="text-4xl font-black tracking-tighter uppercase leading-none italic">Tizim Sozlamalari</h2>
                                <p className="text-[var(--crm-text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic opacity-60">Vizual va interfeys atributlari</p>
                            </div>
                            <button onClick={() => setShowSystemModal(false)} className="p-4 bg-[var(--crm-bg)] rounded-full hover:bg-white/5 text-[var(--crm-text-muted)] transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </header>
    
                        <div className="space-y-10 relative">
                            <div className="flex items-center justify-between p-6 bg-[var(--crm-bg)] rounded-[1.8rem] border border-[var(--crm-border)]">
                                <div>
                                    <h4 className="text-lg font-black uppercase tracking-tighter">Tungi Rejim</h4>
                                    <p className="text-[9px] text-[var(--crm-text-muted)] uppercase font-bold tracking-widest mt-1">Interfeys mavzusini o'zgartirish</p>
                                </div>
                                <button 
                                    onClick={toggleTheme}
                                    className={`w-14 h-8 rounded-full relative transition-all duration-500 ${theme === 'dark' ? 'bg-[var(--crm-accent)]' : 'bg-[var(--crm-border)]'}`}
                                >
                                    <motion.div 
                                        animate={{ x: theme === 'dark' ? 24 : 4 }}
                                        className="absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg"
                                    />
                                </button>
                            </div>

                            <div className="p-6 bg-[var(--crm-bg)] rounded-[1.8rem] border border-[var(--crm-border)] space-y-4">
                                <h4 className="text-lg font-black uppercase tracking-tighter">Tizim Ma'lumotlari</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="px-4 py-3 rounded-xl bg-black/20">
                                        <div className="text-[7px] text-[var(--crm-text-muted)] font-black uppercase tracking-widest mb-1">Versiya</div>
                                        <div className="text-xs font-black text-[var(--crm-accent)]">2.4.0-STABLE</div>
                                    </div>
                                    <div className="px-4 py-3 rounded-xl bg-black/20">
                                        <div className="text-[7px] text-[var(--crm-text-muted)] font-black uppercase tracking-widest mb-1">Platforma</div>
                                        <div className="text-xs font-black text-[var(--crm-accent)]">CRM CLOUD</div>
                                    </div>
                                </div>
                            </div>

                            <button onClick={() => setShowSystemModal(false)} className="w-full py-5 bg-[var(--crm-accent)] text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all">Yopish</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        {/* Help / Support Modal */}
        <AnimatePresence>
            {showHelpModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-md">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowHelpModal(false)} className="absolute inset-0 bg-black/70" />
                    <motion.div initial={{ scale: 0.95, opacity: 0, y: 100 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 100 }} className="w-full max-w-lg bg-[var(--crm-card)] border-t sm:border border-[var(--crm-border)] rounded-t-[3rem] sm:rounded-[4rem] p-8 sm:p-12 relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-green-500 opacity-5 blur-[120px] -mr-48 -mt-48 rounded-full" />
                        
                        <header className="mb-10 relative flex items-center justify-between">
                            <div>
                                <h2 className="text-4xl font-black tracking-tighter uppercase leading-none italic">Yordam</h2>
                                <p className="text-[var(--crm-text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic opacity-60">Qo'llab-quvvatlash markazi</p>
                            </div>
                            <button onClick={() => setShowHelpModal(false)} className="p-4 bg-[var(--crm-bg)] rounded-full hover:bg-white/5 text-[var(--crm-text-muted)] transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </header>

                        <div className="space-y-6 relative">
                            <div className="p-6 bg-[var(--crm-bg)] rounded-[1.8rem] border border-[var(--crm-border)] space-y-3">
                                <div className="flex items-center gap-3 mb-4">
                                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center">
                                        <HelpCircle className="w-6 h-6 text-green-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black uppercase tracking-tighter">Savol bormi?</h4>
                                        <p className="text-[9px] text-[var(--crm-text-muted)] uppercase font-bold tracking-widest">Biz sizga yordam berishga tayyormiz</p>
                                    </div>
                                </div>
                                <p className="text-sm text-[var(--crm-text-muted)] leading-relaxed">
                                    CRM tizimi bo'yicha har qanday savol, taklif yoki muammolar bo'lsa, 
                                    bizning qo'llab-quvvatlash xizmatiga murojaat qiling. Biz tez orada javob beramiz.
                                </p>
                            </div>

                            <a 
                                href="https://t.me/unex_admin" 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="flex items-center justify-between p-5 bg-[var(--crm-bg)] rounded-[1.5rem] border border-[var(--crm-border)] hover:border-blue-500/30 transition-all group active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center group-hover:bg-blue-500/20 transition-colors">
                                        <MessageCircle className="w-5 h-5 text-blue-500" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-widest opacity-50">Telegram</div>
                                        <div className="text-lg font-black tracking-tighter text-blue-500">@unex_admin</div>
                                    </div>
                                </div>
                                <ExternalLink className="w-4 h-4 text-[var(--crm-text-muted)] opacity-30 group-hover:opacity-60 transition-opacity" />
                            </a>

                            <a 
                                href="tel:+998934449963" 
                                className="flex items-center justify-between p-5 bg-[var(--crm-bg)] rounded-[1.5rem] border border-[var(--crm-border)] hover:border-green-500/30 transition-all group active:scale-[0.98]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-green-500/10 flex items-center justify-center group-hover:bg-green-500/20 transition-colors">
                                        <Phone className="w-5 h-5 text-green-500" />
                                    </div>
                                    <div>
                                        <div className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-widest opacity-50">Telefon raqam</div>
                                        <div className="text-lg font-black tracking-tighter text-green-500">+998 93 444 99 63</div>
                                    </div>
                                </div>
                                <ExternalLink className="w-4 h-4 text-[var(--crm-text-muted)] opacity-30 group-hover:opacity-60 transition-opacity" />
                            </a>

                            <div className="pt-2 text-center">
                                <p className="text-[9px] text-[var(--crm-text-muted)] font-bold uppercase tracking-widest opacity-40">
                                    Ish vaqti: Dushanba — Shanba, 09:00 — 18:00
                                </p>
                            </div>

                            <button onClick={() => setShowHelpModal(false)} className="w-full py-5 bg-[var(--crm-accent)] text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all">Yopish</button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    </>
  );
}

function SettingsCard({ icon, title, desc, onClick }: any) {
    return (
        <div onClick={onClick} className={`bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 hover:border-[var(--crm-accent)] transition-all group cursor-pointer active:scale-95 shadow-[0_20px_50px_rgba(0,0,0,0.1)] relative overflow-hidden min-h-[160px] sm:min-h-[220px] flex flex-col justify-between`}>
            <div className="absolute top-0 right-0 w-24 h-24 bg-[var(--crm-accent-soft)] blur-[30px] -mr-12 -mt-12 rounded-full group-hover:opacity-[0.08] transition-all" />
            <div className={`w-12 h-12 sm:w-16 sm:h-16 bg-[var(--crm-accent-soft)] rounded-xl sm:rounded-[1.5rem] flex items-center justify-center text-[var(--crm-accent)] group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                {icon}
            </div>
            <div>
                <h4 className="text-xl sm:text-2xl font-black uppercase tracking-tighter text-[var(--crm-text)] leading-none mb-2 sm:mb-3">{title}</h4>
                <p className="text-[10px] sm:text-[11px] font-bold uppercase tracking-widest leading-relaxed opacity-60 line-clamp-1 sm:line-clamp-2 italic">{desc}</p>
            </div>
        </div>
    );
}

function TariffCard({ name, price, yearlyTotal, billingCycle, students, staff, features, active, isCurrent, themeColor, popular, icon, onSelect }: any) {
    const colors: any = {
        blue: "text-blue-500 bg-blue-500 border-blue-500/20",
        purple: "text-purple-500 bg-purple-500 border-purple-500/20",
        orange: "text-orange-500 bg-orange-500 border-orange-500/20"
    };

    return (
        <div className={`relative group p-8 sm:p-10 rounded-[3rem] bg-white/5 border ${active ? 'border-purple-500 shadow-[0_0_80px_rgba(139,92,246,0.1)]' : 'border-white/5'} hover:border-white/20 transition-all duration-500 active:scale-[0.98]`}>
            {popular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600 px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-[.25em] shadow-xl">
                    Ommabop
                </div>
            )}
            
            <div className="flex justify-between items-start mb-10">
                <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center bg-white/5 ${colors[themeColor].split(' ')[0]} shadow-inner`}>
                    {icon}
                </div>
                <div className="text-right">
                    <p className="text-[8px] font-black uppercase tracking-[.3em] opacity-40 mb-1 leading-none">{billingCycle === 'Monthly' ? 'Oylik To\'lov' : 'Oylik To\'lov (Yillik)'}</p>
                    <div className="text-2xl sm:text-3xl font-black italic tracking-tighter leading-none">{price} <span className="text-xs uppercase ml-1 opacity-40 italic">UZS</span></div>
                    {billingCycle === 'Yearly' && (
                        <p className="text-[8px] font-bold text-green-500/60 uppercase tracking-widest mt-2 italic">
                           Jami: {yearlyTotal} UZS
                        </p>
                    )}
                </div>
            </div>

            <h3 className="text-3xl sm:text-4xl font-black uppercase tracking-tighter italic mb-8 bg-gradient-to-br from-white to-gray-400 bg-clip-text text-transparent">{name}</h3>
            
            <div className="flex flex-wrap gap-2 mb-10">
                <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 flex items-center gap-2">
                    <Users className="w-3 h-3 opacity-40" />
                    <span className="text-[10px] font-black uppercase italic">{students} O'QUVCHI</span>
                </div>
                <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/5 flex items-center gap-2">
                    <Building2 className="w-3 h-3 opacity-40" />
                    <span className="text-[10px] font-black uppercase italic">{staff} XODIM</span>
                </div>
            </div>

            <ul className="space-y-4 mb-12">
                {features.map((f: string, i: number) => (
                    <li key={i} className="flex items-center gap-3 group/item">
                        <CheckCircle2 className={`w-4 h-4 ${active ? 'text-purple-500' : 'text-green-500'} opacity-60 group-hover/item:opacity-100 transition-opacity`} />
                        <span className="text-xs font-bold text-gray-400 group-hover/item:text-white transition-colors">{f}</span>
                    </li>
                ))}
            </ul>

            {active && (
                <div className="w-full py-3 rounded-2xl font-black text-[10px] uppercase tracking-[.2em] bg-green-500/10 text-green-500 border border-green-500/20 text-center mb-3">
                    ✓ HOZIRGI TARIF
                </div>
            )}
            {isCurrent && (
                <div className="w-full py-3 rounded-2xl font-black text-[10px] uppercase tracking-[.2em] bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-center mb-3">
                    Hozirgi tarifingiz ({billingCycle === 'Yearly' ? 'Oylik' : 'Yillik'} rejada)
                </div>
            )}
            <button 
                onClick={onSelect}
                disabled={active}
                className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[.2em] transition-all duration-300 shadow-xl ${active ? 'bg-white/5 text-gray-500 border border-white/10 cursor-not-allowed' : 'bg-white hover:bg-white/90 text-black active:scale-95'}`}
            >
                {active ? "FAOL TARIF" : "SO'ROV YUBORISH"}
            </button>
        </div>
    );
}
