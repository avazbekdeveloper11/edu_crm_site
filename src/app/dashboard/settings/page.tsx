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
  User
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeContext";
import { Sidebar } from "@/components/Sidebar";

export default function SettingsPage() {
  const router = useRouter();
  const [center, setCenter] = useState<any>(null);
  const [role, setRole] = useState("");
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
    botToken: ""
  });
  const [updatingProfile, setUpdatingProfile] = useState(false);
  const [showSystemModal, setShowSystemModal] = useState(false);
  const { theme, toggleTheme } = useTheme();

  const fetchUsers = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch("http://localhost:3001/users", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setUsers(await res.json());
    } catch (err) { console.error("Fetch users failed", err); }
  };

  const fetchGroups = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch("http://localhost:3001/groups", {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setGroups(await res.json());
    } catch (err) { console.error("Fetch groups failed", err); }
  };

  useEffect(() => {
    const userData = localStorage.getItem("center_user");
    if (!userData) {
      router.push("/login");
    } else {
      const parsed = JSON.parse(userData);
      setCenter(parsed);
      setRole(parsed.role || "OWNER");
      if (parsed.role === 'OWNER' || parsed.role === 'SUPER_ADMIN') {
          fetchUsers();
          fetchGroups();
      }
    }
  }, [router]);

  const handleUserSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userForm.password !== userForm.confirmPassword) {
        alert("Parollar mos kelmadi!");
        return;
    }
    const token = localStorage.getItem("access_token");
    const url = isEditingUser ? `http://localhost:3001/users/${editingUserId}` : "http://localhost:3001/users";
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
      const res = await fetch(`http://localhost:3001/users/${id}`, {
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
      const res = await fetch("http://localhost:3001/notifications/send", {
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
      const res = await fetch("http://localhost:3001/centers/me/credentials", {
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
      const res = await fetch("http://localhost:3001/centers/me/profile", {
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
            localStorage.setItem("center_user", JSON.stringify(parsed));
            setCenter({...center, centerName: profileForm.name});
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

  if (!center) return null;

  return (
    <div className="min-h-screen bg-[var(--crm-bg)] text-[var(--crm-text)] flex font-sans selection:bg-purple-500/30">
      <Sidebar centerName={center.centerName} role={role} />

      <main className="flex-1 min-w-0 pb-32 sm:pb-0">
        <header className="min-h-[60px] sm:min-h-24 border-b border-[var(--crm-border)] flex items-center justify-between px-4 sm:px-10 bg-[var(--crm-sidebar)]/50 backdrop-blur-xl sticky top-0 z-40 py-2 sm:py-0 gap-4">
          <div className="flex flex-col items-start">
              <h1 className="text-xl sm:text-5xl font-black tracking-tighter uppercase leading-none italic opacity-10">Sozlamalar</h1>
              <p className="hidden sm:block text-[var(--crm-text-muted)] text-[9px] font-black uppercase tracking-[0.25em] mt-1 opacity-60">Xavfsizlik va atributlar</p>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
              <div className="flex flex-col items-end">
                  <span className="text-[7px] sm:text-[9px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.2em] opacity-60 leading-none mb-0.5">Sessiya</span>
                  <span className="text-xs sm:text-xl font-black text-[var(--crm-accent)] tracking-tighter leading-none uppercase italic truncate max-w-[100px] sm:max-w-[150px]">{center.displayName || center.login}</span>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-[1.25rem] bg-[var(--crm-accent)]/10 border border-[var(--crm-accent)]/10 flex items-center justify-center text-[var(--crm-accent)] shadow-xl shrink-0">
                  <User className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
          </div>
        </header>

        <section className="p-4 sm:p-12 max-w-7xl mx-auto min-h-screen">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 mb-12 sm:mb-20 px-2 sm:px-0">
                <SettingsCard onClick={() => { setProfileForm({ name: center.centerName || center.name, botToken: center.botToken || "" }); setShowProfileModal(true); }} icon={<Building2 className="w-5 h-5 sm:w-6 sm:h-6" />} title="Markaz" desc="Profil va brend" />
                <SettingsCard onClick={() => { setCredentialsForm({...credentialsForm, login: center.login}); setShowCredentialsModal(true); }} icon={<ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />} title="Ximoya" desc="Login va parol" />
                <SettingsCard onClick={() => setShowNotificationModal(true)} icon={<Bell className="w-5 h-5 sm:w-6 sm:h-6" />} title="Xabar" desc="Xabarnomalar" />
                <SettingsCard onClick={() => setShowSystemModal(true)} icon={<Layers className="w-5 h-5 sm:w-6 sm:h-6" />} title="Tizim" desc="Sizual sozlamalar" />
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
                                    <div className="flex items-center gap-3 w-full sm:w-auto justify-end sm:translate-x-4 sm:opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
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
                                <input type="text" placeholder="MASALAN: AKMAL TOIROV" value={userForm.name} onChange={(e) => setUserForm({...userForm, name: e.target.value})} required className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner uppercase" />
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
                                    <input type="text" placeholder="MASALAN: INGLIZ TILI" value={userForm.specialization} onChange={(e) => setUserForm({...userForm, specialization: e.target.value})} className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner uppercase" />
                                </div>
                            )}
                            {(!isEditingUser || (isEditingUser && editingUserId !== center.id)) && (
                                <div className="space-y-2">
                                    <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Lavozim Huquqi</label>
                                    <div className="relative group">
                                        <select value={userForm.role} onChange={(e) => setUserForm({...userForm, role: e.target.value})} className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-[10px] font-black uppercase appearance-none cursor-pointer shadow-inner pr-16 translate-y-[-1px]">
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
                                    className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner uppercase"
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
      </main>
    </div>
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
