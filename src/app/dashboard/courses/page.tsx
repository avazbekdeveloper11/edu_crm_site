"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  GraduationCap, 
  Search, 
  Edit3, 
  Trash2, 
  LogOut,
  Calendar,
  Wallet,
  Layers,
  Settings,
  Plus,
  LayoutDashboard,
  CheckCircle2,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/app/constants";

const formatMoney = (val: any) => {
    if (!val && val !== 0) return "0";
    return Number(val).toLocaleString("ru-RU").replace(/,/g, " ");
};

export default function CoursesPage() {
  const router = useRouter();
  const [center, setCenter] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteData, setDeleteData] = useState<{ id: number, name: string } | null>(null);
  const [search, setSearch] = useState("");
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    duration: ""
  });
  const [role, setRole] = useState("");

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_BASE_URL}/courses`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setCourses(await res.json());
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("center_user");
    if (userData) {
      const parsed = JSON.parse(userData);
      setCenter(parsed);
      const userRole = parsed.role || "OWNER";
      setRole(userRole);
      
      if (userRole === 'TEACHER') {
        router.push('/dashboard');
        return;
      }
    }
    fetchData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    const url = isEditing 
      ? `${API_BASE_URL}/courses/${editingId}` 
      : `${API_BASE_URL}/courses`;
    const method = isEditing ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
            ...formData, 
            price: parseFloat(formData.price.replace(/\s/g, "")),
            duration: parseInt(formData.duration)
        }),
      });

      if (response.ok) {
        fetchData();
        closeModal();
      }
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const openEdit = (course: any) => {
    setFormData({ 
        name: course.name, 
        description: course.description || "",
        price: course.price.toString(),
        duration: course.duration.toString()
    });
    setEditingId(course.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const confirmDelete = async () => {
    if (!deleteData) return;
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(`${API_BASE_URL}/courses/${deleteData.id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        fetchData();
        setShowDeleteModal(false);
        setDeleteData(null);
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setFormData({ name: "", description: "", price: "", duration: "" });
    setEditingId(null);
  };

  const filteredCourses = courses.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  const handlePriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\s/g, "");
      if (/^\d*$/.test(rawValue)) {
          setFormData({ ...formData, price: rawValue });
      }
  };

  return (
    <>
        <header className="min-h-[60px] sm:min-h-24 border-b border-[var(--crm-border)] flex items-center justify-between px-4 sm:px-10 bg-[var(--crm-sidebar)]/50 backdrop-blur-xl sticky top-0 z-40 py-2 sm:py-0 gap-3 sm:gap-6">
          <div className="relative group flex-1 max-w-[200px] sm:max-w-md">
            <Search className="absolute left-3.5 sm:left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--crm-text-muted)] group-focus-within:text-[var(--crm-accent)] transition-colors" />
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Qidiruv..." 
              className="w-full bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] rounded-xl sm:rounded-2xl py-2 sm:py-3.5 pl-9 sm:pl-14 pr-4 text-[10px] sm:text-sm font-bold focus:outline-none focus:border-[var(--crm-accent)] transition-all text-[var(--crm-text)] placeholder:text-[var(--crm-text-muted)]/40 shadow-inner" 
            />
          </div>
          <button 
            onClick={() => { setIsEditing(false); setFormData({ name: "", description: "", price: "", duration: "" }); setShowModal(true); }} 
            className="bg-[var(--crm-accent)] hover:scale-105 transition-all text-white px-4 sm:px-10 h-10 sm:h-14 rounded-xl sm:rounded-[1.5rem] font-black text-[9px] sm:text-xs tracking-[0.1em] sm:tracking-[0.15em] flex items-center justify-center gap-1.5 sm:gap-3 shadow-2xl shadow-purple-600/30 active:scale-95 uppercase whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 shadow-lg" />
            <span className="hidden xs:inline">Yangi Kurs</span>
            <span className="xs:hidden">Yangi</span>
          </button>
        </header>

        <section className="p-4 sm:p-12 max-w-7xl mx-auto min-h-screen pb-40 sm:pb-12">
          <div className="flex items-center justify-between mb-8 sm:mb-16 px-1 sm:px-0">
            <div className="space-y-1">
              <h1 className="text-3xl sm:text-5xl font-black tracking-tighter uppercase leading-none italic opacity-20">Kurslar</h1>
              <div className="flex items-center gap-3 sm:gap-4">
                  <p className="text-[var(--crm-text-muted)] font-black text-[10px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] opacity-60">Yo'nalishlar</p>
                  <span className="bg-[var(--crm-accent-soft)] text-[var(--crm-accent)] px-2.5 py-1 rounded-lg text-[10px] sm:text-[9px] font-black uppercase tracking-widest border border-[var(--crm-accent-soft)] shadow-sm">{filteredCourses.length} ta</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-16 h-16 border-[6px] border-[var(--crm-accent)]/10 border-t-[var(--crm-accent)] rounded-full animate-spin" />
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="p-32 text-center rounded-[4rem] bg-[var(--crm-card)] border border-[var(--crm-border)] relative overflow-hidden group shadow-2xl">
              <div className="absolute top-0 right-0 w-96 h-96 bg-[var(--crm-accent)] opacity-5 blur-[120px] -mr-48 -mt-48 rounded-full" />
              <Layers className="w-24 h-24 text-[var(--crm-text-muted)]/20 mx-auto mb-10" />
              <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">Kurslar topilmadi</h3>
              <p className="text-[var(--crm-text-muted)] font-bold text-sm max-w-sm mx-auto opacity-60 italic">Hali birorta ham ta'lim yo'nalishi qo'shilmagan yoki qidiruv natijasi mavjud emas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-10 pb-24">
              {filteredCourses.map((crs) => (
                <div key={crs.id} className="bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[2rem] sm:rounded-[3rem] p-5 sm:p-10 hover:border-[var(--crm-accent)] transition-all group relative overflow-hidden shadow-2xl active:scale-[0.98] cursor-default">
                  <div className="absolute top-0 right-0 w-32 h-32 sm:w-40 sm:h-40 bg-[var(--crm-accent)] opacity-[0.03] blur-[40px] sm:blur-[50px] -mr-16 -mt-16 sm:-mr-20 sm:-mt-20 rounded-full group-hover:bg-[var(--crm-accent)] group-hover:opacity-[0.08] transition-all" />
                  
                  <div className="flex items-start justify-between mb-6 sm:mb-10">
                    <div className="flex flex-col gap-2">
                        <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-xl sm:rounded-[1.5rem] bg-[var(--crm-accent-soft)] border border-[var(--crm-accent-soft)] flex items-center justify-center group-hover:scale-110 transition-transform duration-500 shadow-inner">
                          <Layers className="w-6 h-6 sm:w-8 sm:h-8 text-[var(--crm-accent)]" />
                        </div>
                        <span className="bg-[var(--crm-success-soft)] text-green-500 text-[9px] sm:text-[9px] font-black uppercase tracking-[0.2em] px-3 sm:px-3 py-1 sm:py-1 rounded-full border border-[var(--crm-success-soft)] w-fit mt-2 shadow-sm">
                            {crs.duration} Oylik
                        </span>
                    </div>
                    <div className="flex gap-2">
                       <button onClick={() => openEdit(crs)} className="p-3 sm:p-4 bg-[var(--crm-bg)]/80 rounded-xl sm:rounded-2xl hover:bg-blue-600/10 hover:text-blue-500 transition-all text-[var(--crm-text-muted)] shadow-xl border border-[var(--crm-border)]"><Edit3 className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                       <button onClick={() => { setDeleteData({ id: crs.id, name: crs.name }); setShowDeleteModal(true); }} className="p-3 sm:p-4 bg-[var(--crm-bg)]/80 rounded-xl sm:rounded-2xl hover:bg-red-600/10 hover:text-red-500 transition-all text-[var(--crm-text-muted)] shadow-xl border border-[var(--crm-border)]"><Trash2 className="w-4 h-4 sm:w-5 sm:h-5" /></button>
                    </div>
                  </div>

                  <h3 className="text-xl sm:text-3xl font-black mb-3 sm:mb-4 tracking-tighter group-hover:text-[var(--crm-accent)] transition-colors uppercase leading-none">{crs.name}</h3>
                  <p className="text-[var(--crm-text-muted)] text-[10px] sm:text-[10px] uppercase font-black tracking-widest leading-relaxed mb-6 sm:mb-6 line-clamp-2 opacity-60 italic">
                    {crs.description || "Ma'lumot kiritilmagan."}
                  </p>

                  <div className="pt-4 sm:pt-6 border-t border-[var(--crm-border)] flex items-end justify-between">
                    <div className="flex flex-col">
                        <span className="text-[9px] sm:text-[8px] font-black uppercase tracking-[0.2em] text-[var(--crm-text-muted)] mb-1 sm:mb-1">Kurs Narxi:</span>
                        <div className="flex items-end gap-1.5 sm:gap-2">
                            <span className="text-2xl sm:text-3xl font-black text-[var(--crm-text)] tracking-tighter">{formatMoney(crs.price)}</span>
                            <span className="text-[10px] sm:text-[10px] font-black text-[var(--crm-text-muted)] mb-1 sm:mb-1.5 uppercase tracking-widest opacity-40">UZS</span>
                        </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

      {/* Modern Detailed Course Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-md">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/70" />
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="w-full max-w-lg bg-[var(--crm-card)] border-t sm:border border-[var(--crm-border)] rounded-t-[2.5rem] sm:rounded-[4rem] p-6 sm:p-12 relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden group flex flex-col max-h-[92vh]">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--crm-accent)] opacity-5 blur-[120px] -mr-48 -mt-48 rounded-full" />
              
              <header className="mb-8 sm:mb-12 relative flex items-center justify-between shrink-0">
                <div>
                    <h2 className="text-2xl sm:text-4xl font-black tracking-tighter uppercase leading-none">{isEditing ? "Tahrirlash" : "Yangi Kurs"}</h2>
                    <p className="text-[var(--crm-text-muted)] text-[8px] sm:text-[10px] font-black uppercase tracking-[0.2em] mt-2 italic opacity-60">kurs parametrlarini sozlash</p>
                </div>
                <button onClick={closeModal} className="p-3 sm:p-4 bg-[var(--crm-bg)] rounded-full hover:bg-white/5 text-[var(--crm-text-muted)] transition-all">
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </header>

              <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8 relative overflow-y-auto no-scrollbar pb-10">
                <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Kurs Nomi</label>
                    <input 
                        type="text" 
                        value={formData.name} 
                        onChange={(e) => setFormData({...formData, name: e.target.value})} 
                        className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-2xl sm:rounded-[1.8rem] px-6 sm:px-8 py-3.5 sm:py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold transition-all shadow-inner" 
                        placeholder="Masalan: Web Dasturlash" 
                        required 
                    />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
                    <div className="space-y-2">
                        <label className="text-[9px] sm:text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Narxi (UZS)</label>
                        <div className="relative">
                            <input 
                                type="text" 
                                value={formatMoney(formData.price)} 
                                onChange={handlePriceInput} 
                                className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-2xl sm:rounded-[1.8rem] px-6 sm:px-8 py-3.5 sm:py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-base sm:text-lg font-black transition-all shadow-inner" 
                                placeholder="0" 
                                required 
                            />
                            <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[8px] text-[var(--crm-text-muted)] font-black uppercase">UZS</span>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[9px] sm:text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Davom-i (oy)</label>
                        <input 
                            type="number" 
                            value={formData.duration} 
                            onChange={(e) => setFormData({...formData, duration: e.target.value})} 
                            className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-2xl sm:rounded-[1.8rem] px-6 sm:px-8 py-3.5 sm:py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-base sm:text-lg font-black transition-all shadow-inner" 
                            placeholder="0" 
                            required 
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-[9px] sm:text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Qisqacha Tavsif</label>
                    <textarea 
                        value={formData.description} 
                        onChange={(e) => setFormData({...formData, description: e.target.value})} 
                        rows={2} 
                        className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-2xl sm:rounded-[2rem] px-6 sm:px-8 py-3.5 sm:py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-xs font-bold transition-all resize-none shadow-inner leading-relaxed" 
                        placeholder="Kurs haqida umumiy tushuncha..." 
                    />
                </div>

                <div className="flex gap-4 pt-4 sm:pt-6 shrink-0">
                  <button type="button" onClick={closeModal} className="flex-1 py-4 sm:py-5 bg-[var(--crm-bg)] border border-[var(--crm-border)] text-[var(--crm-text-muted)] rounded-2xl sm:rounded-[1.8rem] font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-[var(--crm-border)] transition-all">Bekor</button>
                  <button type="submit" className="flex-[2] py-4 sm:py-5 bg-[var(--crm-accent)] text-white rounded-2xl sm:rounded-[1.8rem] font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-2xl shadow-purple-600/30 hover:scale-[1.02] active:scale-95 transition-all">Saqlash</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirmation */}
      <AnimatePresence>
        {showDeleteModal && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-sm">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowDeleteModal(false)} className="absolute inset-0 bg-black/80" />
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="w-full max-w-sm bg-[var(--crm-card)] border-t sm:border border-[var(--crm-border)] rounded-t-[2.5rem] sm:rounded-[3.5rem] p-12 shadow-2xl relative z-10 text-center">
              <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-10 border border-red-500/5">
                 <Trash2 className="w-10 h-10 text-red-500" />
              </div>
              <h2 className="text-3xl font-black mb-4 tracking-tighter uppercase">Diqqat!</h2>
              <p className="text-[var(--crm-text-muted)] mb-10 text-xs font-bold leading-relaxed italic opacity-70 px-4">
                Haqiqatan ham <span className="text-[var(--crm-text)] font-black uppercase text-sm underline decoration-red-500/30">{deleteData?.name}</span> kursini o'chirmoqchimisiz?
              </p>
              <div className="flex gap-4">
                 <button onClick={() => setShowDeleteModal(false)} className="flex-1 py-5 bg-[var(--crm-bg)]/50 rounded-[1.5rem] font-black text-[9px] tracking-widest uppercase hover:bg-[var(--crm-border)] transition-all text-[var(--crm-text-muted)] border border-[var(--crm-border)]">Yo'q, bekor</button>
                 <button onClick={confirmDelete} className="flex-1 py-5 bg-red-600 rounded-[1.5rem] font-black text-[9px] tracking-widest uppercase hover:bg-red-500 transition-all shadow-2xl shadow-red-600/30 text-white">Ha, o'chirilsin</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
