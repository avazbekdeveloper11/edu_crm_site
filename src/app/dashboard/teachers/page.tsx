"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Users2, 
  Search, 
  Plus, 
  ShieldCheck, 
  User, 
  Trash2, 
  Key,
  X,
  ChevronDown,
  Layers,
  Calendar,
  Copy,
  CheckCheck
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeContext";
import { API_BASE_URL } from "@/app/constants";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function TeachersPage() {
  const router = useRouter();
  const [center, setCenter] = useState<any>(null);
  const [role, setRole] = useState("");
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [form, setForm] = useState({
    name: "",
    login: "",
    password: "",
    confirmPassword: "",
    role: "TEACHER",
    specialization: ""
  });
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showCustomAlert, setShowCustomAlert] = useState(false);
  const [alertContent, setAlertContent] = useState({ title: "", message: "", type: "danger" as any });
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { theme } = useTheme();

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const [uRes, gRes] = await Promise.all([
        fetch(`${API_BASE_URL}/users`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/groups`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);
      if (uRes.ok) setAllUsers(await uRes.json());
      if (gRes.ok) setGroups(await gRes.json());
    } catch (err) { console.error("Fetch failed", err); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    const userData = localStorage.getItem("center_user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setCenter(parsed);
      setRole(parsed.role || "OWNER");
    }
    fetchData();
  }, []);

  const teachers = allUsers.filter(u => u.role === "TEACHER").filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.login?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing && form.password !== form.confirmPassword) {
      setAlertContent({ title: "Xatolik!", message: "Kiritilgan parollar bir-biriga mos kelmadi. Iltimos, qaytadan tekshirib ko'ring.", type: "warning" });
      setShowCustomAlert(true);
      return;
    }
    const token = localStorage.getItem("access_token");
    const url = isEditing ? `${API_BASE_URL}/users/${editingId}` : `${API_BASE_URL}/users`;
    const method = isEditing ? "PUT" : "POST";
    
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        fetchData();
        setShowModal(false);
        setForm({ name: "", login: "", password: "", confirmPassword: "", role: "TEACHER", specialization: "" });
      }
    } catch (err) { console.error("Save failed", err); }
  };

  const deleteTeacher = async (id: number) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_BASE_URL}/users/${itemToDelete}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        fetchData();
        setShowDeleteConfirm(false);
        setItemToDelete(null);
      }
    } catch (err) { 
        console.error("Delete failed", err); 
    } finally {
        setDeleting(false);
    }
  };

  const copyCredentials = (teacher: any) => {
    const passwordText = teacher.password || "******** (O'zgartirilmagan)";
    const text = `🎓 USTOZ MA'LUMOTLARI:
👤 Ism: ${teacher.name}
📚 Fan: ${teacher.specialization || "Belgilanmagan"}
🔑 Login: ${teacher.login}
🔒 Parol: ${passwordText}

🌐 Tizim: http://localhost:3000/login`;

    navigator.clipboard.writeText(text);
    setCopiedId(teacher.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <>
        <header className="min-h-[70px] sm:min-h-24 border-b border-[var(--crm-border)] flex flex-col md:flex-row items-center justify-between px-4 sm:px-10 bg-[var(--crm-sidebar)]/50 backdrop-blur-xl sticky top-0 z-40 py-4 md:py-0 gap-4 sm:gap-6">
          <div className="relative group w-full max-w-md">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--crm-text-muted)] group-focus-within:text-[var(--crm-accent)] transition-colors" />
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Ustozni qidirish..." 
              className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-2xl py-2.5 sm:py-3.5 pl-14 pr-6 focus:outline-none focus:border-[var(--crm-accent)] text-xs sm:text-sm font-bold transition-all text-[var(--crm-text)] placeholder:text-[var(--crm-text-muted)]/40 shadow-inner" 
            />
          </div>
          <button 
            onClick={() => { setIsEditing(false); setForm({ name: "", login: "", password: "", confirmPassword: "", role: "TEACHER", specialization: "" }); setShowModal(true); }} 
            className="w-full md:w-auto bg-[var(--crm-accent)] hover:scale-105 transition-all text-white px-6 sm:px-10 py-3 sm:py-4 rounded-[1rem] sm:rounded-[1.5rem] font-black text-[9px] sm:text-xs tracking-[0.15em] flex items-center justify-center gap-3 shadow-2xl shadow-purple-600/30 active:scale-95 uppercase whitespace-nowrap"
          >
            <Plus className="w-5 h-5 shadow-lg" />
            Yangi Ustoz
          </button>
        </header>

        <section className="p-4 sm:p-12 max-w-7xl mx-auto min-h-screen pb-40 sm:pb-12">
            <div className="flex flex-col sm:flex-row items-center justify-between mb-10 gap-4 px-2">
                <div>
                    <h2 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase leading-none grayscale opacity-30 italic">O'qituvchilar</h2>
                    <p className="text-[10px] sm:text-[9px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] mt-2 opacity-60 italic">Professor va o'qituvchilar tarkibi</p>
                </div>
                <div className="flex items-center gap-6 bg-[var(--crm-card)] px-6 py-4 rounded-2xl border border-[var(--crm-border)] shadow-sm shrink-0">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-black uppercase text-[var(--crm-text-muted)] shadow-sm">Umumiy</span>
                        <span className="text-2xl font-black text-[var(--crm-accent)] tracking-tight leading-none">{teachers.length} ta</span>
                    </div>
                    <Users2 className="w-6 h-6 text-[var(--crm-accent)] opacity-20" />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 pb-32 sm:pb-12">
                {loading ? (
                    Array(4).fill(0).map((_, i) => (
                        <div key={i} className="h-48 bg-[var(--crm-card)] rounded-[2.5rem] border border-[var(--crm-border)] animate-pulse" />
                    ))
                ) : teachers.length === 0 ? (
                    <div className="col-span-full py-32 text-center rounded-[4rem] bg-[var(--crm-card)] border border-dashed border-[var(--crm-border)] opacity-30 shadow-inner">
                        <ShieldCheck className="w-20 h-20 text-[var(--crm-text-muted)]/20 mx-auto mb-8" />
                        <h3 className="text-3xl font-black mb-3 uppercase tracking-tighter">Ustozlar mavjud emas</h3>
                        <p className="text-[10px] font-black uppercase tracking-widest italic leading-relaxed">Markaz uchun professional jamoani shakllantirishni boshlang</p>
                    </div>
                ) : (
                    teachers.map(teacher => {
                        const teacherGroups = groups.filter(g => g.teacher === teacher.name);
                        return (
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} key={teacher.id} className="bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[2.5rem] sm:rounded-[3rem] p-6 sm:p-10 flex flex-col sm:flex-row items-center justify-between gap-6 group hover:border-[var(--crm-accent)] transition-all shadow-[0_20px_60px_rgba(0,0,0,0.1)] relative overflow-hidden active:scale-[0.99] group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--crm-accent)] opacity-[0.02] blur-[40px] -mr-16 -mt-16 rounded-full group-hover:opacity-[0.08] transition-all" />
                                
                                <div className="flex items-center gap-6 min-w-0 w-full">
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-[1.2rem] sm:rounded-[1.5rem] bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] flex items-center justify-center font-black text-[var(--crm-text)] text-lg sm:text-xl group-hover:bg-[var(--crm-accent)] group-hover:text-white transition-all duration-500 shadow-lg capitalize shrink-0 relative">
                                        {teacher.name[0]}
                                        {teacher.specialization && (
                                            <div className="absolute -bottom-1 -right-1 bg-green-500 w-5 h-5 rounded-full border-2 border-[var(--crm-card)] flex items-center justify-center shadow-lg" title={teacher.specialization}>
                                                <Layers className="w-2.5 h-2.5 text-white" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                         <h4 className="text-2xl sm:text-2xl font-black tracking-tighter uppercase text-[var(--crm-text)] leading-none mb-2.5 group-hover:text-[var(--crm-accent)] transition-colors truncate">
                                            {teacher.name}
                                        </h4>
                                        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                                            {teacher.specialization && (
                                                <div className="flex items-center gap-2 text-[10px] sm:text-[10px] text-green-500 font-black uppercase tracking-widest shrink-0">
                                                    <Layers className="w-3.5 h-3.5" />
                                                    {teacher.specialization}
                                                </div>
                                            )}
                                            {teacher.specialization && <div className="hidden sm:block w-1 h-1 rounded-full bg-[var(--crm-border)] opacity-30" />}
                                            <div className="flex items-center gap-2 text-[10px] sm:text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-widest opacity-60 shrink-0 italic">
                                                <Key className="w-3.5 h-3.5" />
                                                {teacher.login}
                                            </div>
                                            <div className="hidden sm:block w-1 h-1 rounded-full bg-[var(--crm-border)] opacity-30" />
                                            <div className="flex items-center gap-2 text-[10px] sm:text-[10px] text-[var(--crm-accent)] font-black uppercase tracking-widest opacity-80 shrink-0">
                                                <Calendar className="w-3.5 h-3.5" />
                                                {teacherGroups.length} ta guruh
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-end sm:translate-x-4 sm:opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                                    <button 
                                        onClick={() => copyCredentials(teacher)}
                                        className={`p-3.5 sm:p-4 rounded-[1.25rem] border border-[var(--crm-border)] transition-all shadow-xl active:scale-90 flex items-center justify-center ${copiedId === teacher.id ? 'bg-green-500 text-white' : 'bg-[var(--crm-bg)] text-green-500 hover:bg-green-500/10'}`}
                                        title="Nusxalash"
                                    >
                                        {copiedId === teacher.id ? <CheckCheck className="w-4 h-4 sm:w-5 sm:h-5" /> : <Copy className="w-4 h-4 sm:w-5 sm:h-5" />}
                                    </button>
                                    <button 
                                        onClick={() => { 
                                            setEditingId(teacher.id); 
                                            setForm({ 
                                                ...form, 
                                                name: teacher.name, 
                                                login: teacher.login, 
                                                specialization: teacher.specialization || "",
                                                password: teacher.password || "",
                                                confirmPassword: teacher.password || ""
                                            }); 
                                            setIsEditing(true); 
                                            setShowModal(true); 
                                        }}
                                        className="p-3.5 sm:p-4 bg-[var(--crm-bg)] hover:bg-blue-600 hover:text-white rounded-[1.25rem] border border-[var(--crm-border)] text-blue-500 transition-all shadow-xl active:scale-90"
                                    >
                                        <Key className="w-4 h-4 sm:w-5 sm:h-5 shadow-lg" />
                                    </button>
                                    <button onClick={() => deleteTeacher(teacher.id)} className="p-3.5 sm:p-4 bg-[var(--crm-bg)] hover:bg-red-600 hover:text-white rounded-[1.25rem] border border-[var(--crm-border)] text-red-500 transition-all shadow-xl active:scale-90">
                                        <Trash2 className="w-4 h-4 sm:w-5 sm:h-5 shadow-lg" />
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })
                )}
            </div>
        </section>

        {/* Teacher Modal */}
        <AnimatePresence>
            {showModal && (
                <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-md">
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/70" />
                    <motion.div initial={{ scale: 0.95, opacity: 0, y: 100 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 100 }} className="w-full max-w-lg bg-[var(--crm-card)] border-t sm:border border-[var(--crm-border)] rounded-t-[3rem] sm:rounded-[4rem] p-8 sm:p-12 relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--crm-accent)] opacity-5 blur-[120px] -mr-48 -mt-48 rounded-full" />
                        
                        <header className="mb-10 relative flex items-center justify-between">
                            <div>
                                <h2 className="text-4xl font-black tracking-tighter uppercase leading-none">{isEditing ? "O'qituvchini Tahrirlash" : "Yangi O'qituvchi"}</h2>
                                <p className="text-[var(--crm-text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mt-3 italic opacity-60">Sessiya va kirish huquqlari atributlari</p>
                            </div>
                            <button onClick={() => setShowModal(false)} className="p-4 bg-[var(--crm-bg)] rounded-full hover:bg-white/5 text-[var(--crm-text-muted)] transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} className="space-y-8 relative">
                            <div className="space-y-2">
                                <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Ustoz FISH</label>
                                <input type="text" placeholder="Masalan: Jasur Hamidov" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} required className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Mutaxassisligi (Fani)</label>
                                <input type="text" placeholder="Masalan: Ingliz tili (IELTS)" value={form.specialization} onChange={(e) => setForm({...form, specialization: e.target.value})} className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Tizimdagi Logini</label>
                                <input type="text" placeholder="USTOZ_77" value={form.login} onChange={(e) => setForm({...form, login: e.target.value})} required className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner" />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">{isEditing ? "Yangi Parol" : "Parol"}</label>
                                    <input type="password" autoComplete="new-password" placeholder="••••••" value={form.password} onChange={(e) => setForm({...form, password: e.target.value})} required={!isEditing} className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.5rem] px-6 py-4 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Tasdiqlash</label>
                                    <input type="password" autoComplete="new-password" placeholder="••••••" value={form.confirmPassword} onChange={(e) => setForm({...form, confirmPassword: e.target.value})} required={!isEditing} className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.5rem] px-6 py-4 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner" />
                                </div>
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-5 bg-[var(--crm-bg)] border border-[var(--crm-border)] text-[var(--crm-text-muted)] rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--crm-border)] transition-all">Bekor</button>
                                <button type="submit" className="flex-[2] py-5 bg-[var(--crm-accent)] text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all">Saqlash</button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>

        <ConfirmDialog 
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={confirmDelete}
            loading={deleting}
            title="O'chirishni tasdiqlaysizmi?"
            message="Ushbu o'qituvchi tizimdan butunlay o'chiriladi. Ushbu amalni bekor qilib bo'lmaydi."
            confirmText="Ha, o'chirish"
            type="danger"
        />

        <ConfirmDialog 
            isOpen={showCustomAlert}
            onClose={() => setShowCustomAlert(false)}
            onConfirm={() => setShowCustomAlert(false)}
            title={alertContent.title}
            message={alertContent.message}
            type={alertContent.type}
            isAlert={true}
        />
    </>
  );
}
