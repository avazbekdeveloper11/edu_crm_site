"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  Search, 
  Edit3, 
  Trash2, 
  LogOut,
  Layers,
  Settings,
  Plus,
  Check,
  X,
  Wallet,
  Calendar,
  Users2,
  Filter,
  GraduationCap
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeContext";
import { API_BASE_URL } from "@/app/constants";

const formatMoney = (val: any) => {
    if (!val && val !== 0) return "0";
    return Number(val).toLocaleString("ru-RU").replace(/,/g, " ");
};

const formatPhone = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    
    // Always keep +998 even if empty or just digits
    if (phoneNumberLength <= 3) return `+${phoneNumber}`;
    if (phoneNumberLength <= 5) {
        return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)})`;
    }
    if (phoneNumberLength <= 8) {
        return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}) ${phoneNumber.slice(5, 8)}`;
    }
    if (phoneNumberLength <= 10) {
        return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}) ${phoneNumber.slice(5, 8)} ${phoneNumber.slice(8, 10)}`;
    }
    return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}) ${phoneNumber.slice(5, 8)} ${phoneNumber.slice(8, 10)} ${phoneNumber.slice(10, 12)}`;
};

const formatDate = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    return date.toLocaleDateString("ru-RU", { day: "2-digit", month: "2-digit", year: "numeric" });
};

export default function StudentsPage() {
  const router = useRouter();
  const [center, setCenter] = useState<any>(null);
  const [role, setRole] = useState("");
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentData, setPaymentData] = useState<any>(null);
  const [search, setSearch] = useState("");
  const { theme } = useTheme();

  const [filterCourse, setFilterCourse] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  
  const [courseAmounts, setCourseAmounts] = useState<Record<number, string>>({});
  const [coursePeriods, setCoursePeriods] = useState<Record<number, { from: string; to: string }>>({});
  const [payType, setPayType] = useState("CASH");
  const [payNotes, setPayNotes] = useState("");
  
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "998",
    address: "",
    dob: "",
    status: "Active",
    courseIds: [] as string[],
    groupIds: [] as string[],
    parentPhone: "998"
  });

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const [stdRes, crsRes, grpRes] = await Promise.all([
        fetch(`${API_BASE_URL}/students`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/courses`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/groups`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);
      if (stdRes.ok) setStudents(await stdRes.json());
      if (crsRes.ok) setCourses(await crsRes.json());
      if (grpRes.ok) setGroups(await grpRes.json());
    } catch (err) {
      console.error("Data fetch failed", err);
    } finally {
      setLoading(false);
    }
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

  const toggleCourse = (id: string) => {
    setFormData(prev => ({
        ...prev,
        courseIds: prev.courseIds.includes(id) ? prev.courseIds.filter(cid => cid !== id) : [...prev.courseIds, id]
    }));
  };

  const toggleGroup = (id: string) => {
    setFormData(prev => ({
        ...prev,
        groupIds: prev.groupIds.includes(id) ? prev.groupIds.filter(gid => gid !== id) : [...prev.groupIds, id]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    const url = isEditing ? `${API_BASE_URL}/students/${editingId}` : `${API_BASE_URL}/students`;
    const method = isEditing ? "PUT" : "POST";
    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ 
            ...formData, 
            courseIds: formData.courseIds.join(','),
            groupIds: formData.groupIds.join(',') 
        }),
      });
      if (response.ok) { fetchData(); closeModal(); }
    } catch (err) { console.error("Save failed", err); }
  };

  const openEdit = (student: any) => {
    setFormData({
      name: student.name,
      phone: student.phone,
      address: student.address || "",
      dob: student.dob || "",
      status: student.status,
      courseIds: (student.courses || []).map((c: any) => c.id.toString()),
      groupIds: (student.groups || []).map((g: any) => g.id.toString()),
      parentPhone: student.parentPhone || "998"
    });
    setEditingId(student.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setFormData({ name: "", phone: "998", address: "", dob: "", status: "Active", courseIds: [], groupIds: [], parentPhone: "998" });
    setEditingId(null);
  };

  const openPayment = (student: any) => {
    setPaymentData(student);
    const initialAmounts: Record<number, string> = {};
    const initialPeriods: Record<number, { from: string; to: string }> = {};
    (student.courses || []).forEach((c: any) => { initialAmounts[c.id] = ""; initialPeriods[c.id] = { from: "", to: "" }; });
    setCourseAmounts(initialAmounts);
    setCoursePeriods(initialPeriods);
    setPayNotes("");
    setPayType("CASH");
    setShowPaymentModal(true);
  };

  const handleMultiPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentData) return;
    const token = localStorage.getItem("access_token");
    const paidEnries = Object.entries(courseAmounts).filter(([_, amt]) => amt.replace(/\s/g, "") && parseFloat(amt.replace(/\s/g, "")) > 0);
    if (paidEnries.length === 0) return;
    const paymentPromises = paidEnries.map(([idStr, amt]) => {
            const courseId = parseInt(idStr);
            const period = coursePeriods[courseId];
            return fetch(`${API_BASE_URL}/payments`, {
                method: "POST",
                headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
                body: JSON.stringify({
                    studentId: paymentData.id,
                    courseId: courseId,
                    amount: parseFloat(amt.replace(/\s/g, "")),
                    paymentType: payType,
                    periodFrom: period?.from || new Date().toISOString().split('T')[0],
                    periodTo: period?.to || new Date().toISOString().split('T')[0],
                    notes: payNotes
                }),
            });
        });
    try {
      await Promise.all(paymentPromises);
      setShowPaymentModal(false);
      fetchData();
    } catch (err) { console.error("Multi-payment failed", err); }
  };

  const calculateDebtForCourse = (std: any, course: any) => {
    if (!course) return 0;
    const joinDate = new Date(std.createdAt);
    const currentDate = new Date();
    const monthsDiff = (currentDate.getFullYear() - joinDate.getFullYear()) * 12 + (currentDate.getMonth() - joinDate.getMonth()) + 1;
    const totalCost = (course.price || 0) * monthsDiff;
    const totalPaid = std.payments?.filter((p: any) => p.courseId === course.id).reduce((acc: number, p: any) => acc + p.amount, 0) || 0;
    return Math.max(0, totalCost - totalPaid);
  };

  const totalDebt = (std: any) => (std.courses || []).reduce((acc: number, c: any) => acc + calculateDebtForCourse(std, c), 0);

  const filteredStudents = students.filter(s => {
    const nameMatch = s.name.toLowerCase().includes(search.toLowerCase()) || s.phone.includes(search);
    const courseMatch = filterCourse === "" || (s.courses || []).some((c: any) => c.id.toString() === filterCourse);
    const groupMatch = filterGroup === "" ? true : filterGroup === "none" ? (s.groups || []).length === 0 : (s.groups || []).some((g: any) => g.id.toString() === filterGroup);
    return nameMatch && courseMatch && groupMatch;
  });

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
              className="w-full bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] rounded-xl sm:rounded-2xl py-2 sm:py-3.5 pl-10 sm:pl-14 pr-4 text-[10px] sm:text-sm font-bold focus:outline-none focus:border-[var(--crm-accent)] transition-all text-[var(--crm-text)] placeholder:text-[var(--crm-text-muted)]/40 shadow-inner" 
            />
          </div>
          <button 
            onClick={() => { setIsEditing(false); setFormData({ name: "", phone: "998", address: "", dob: "", status: "Active", courseIds: [], groupIds: [], parentPhone: "998" }); setShowModal(true); }} 
            className="bg-[var(--crm-accent)] hover:scale-105 transition-all text-white px-4 sm:px-10 h-10 sm:h-14 rounded-xl sm:rounded-[1.5rem] font-black text-[9px] sm:text-xs tracking-[0.1em] sm:tracking-[0.15em] flex items-center justify-center gap-1.5 sm:gap-3 shadow-2xl shadow-purple-600/30 active:scale-95 uppercase whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 sm:w-5 sm:h-5 shadow-lg" />
            <span className="hidden xs:inline">Yangi Talaba</span>
            <span className="xs:hidden">Talaba</span>
          </button>
        </header>

        <section className="p-4 sm:p-12 max-w-7xl mx-auto min-h-screen">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 mb-10 sm:mb-16 px-2 sm:px-0">
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-none italic opacity-20">Talabalar</h1>
              <div className="flex items-center gap-3 sm:gap-4">
                  <p className="text-[var(--crm-text-muted)] font-black text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] opacity-60">Bazadagi talabalar</p>
                  <span className="bg-[var(--crm-accent-soft)] text-[var(--crm-accent)] px-2 py-0.5 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest border border-[var(--crm-accent-soft)]">{filteredStudents.length} ta topildi</span>
              </div>
            </div>
            
            <div className="flex flex-wrap items-center gap-2 sm:gap-4 bg-[var(--crm-card)] p-2 sm:p-3 rounded-2xl sm:rounded-[2rem] border border-[var(--crm-border)] shadow-xl w-full lg:w-auto">
                <div className="relative group flex-1 sm:flex-none min-w-[140px]">
                    <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--crm-text-muted)] pointer-events-none" />
                    <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="w-full bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] rounded-xl py-2.5 pl-10 pr-8 outline-none focus:border-[var(--crm-accent)] text-[9px] font-black uppercase tracking-widest text-[var(--crm-text)] appearance-none cursor-pointer transition-all">
                        <option value="" className="bg-[var(--crm-card)]">Barcha Kurslar</option>
                        {courses.map(c => <option key={c.id} value={c.id} className="bg-[var(--crm-card)]">{c.name}</option>)}
                    </select>
                </div>
                <div className="relative group flex-1 sm:flex-none min-w-[140px]">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--crm-text-muted)] pointer-events-none" />
                    <select value={filterGroup} onChange={(e) => setFilterGroup(e.target.value)} className="w-full bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] rounded-xl py-2.5 pl-10 pr-8 outline-none focus:border-[var(--crm-accent)]/50 text-[9px] font-black uppercase tracking-widest text-[var(--crm-text)] appearance-none cursor-pointer transition-all">
                        <option value="" className="bg-[var(--crm-card)]">Barcha Guruhlar</option>
                        <option value="none" className="bg-[var(--crm-card)] text-blue-500 text-[8px]">Guruhsizlar</option>
                        {groups.map(g => <option key={g.id} value={g.id} className="bg-[var(--crm-card)]">{g.name}</option>)}
                    </select>
                </div>
                <button onClick={() => { setSearch(""); setFilterCourse(""); setFilterGroup(""); }} className="p-2 sm:p-2.5 text-[var(--crm-text-muted)] hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-16 h-16 border-[6px] border-[var(--crm-accent)]/10 border-t-[var(--crm-accent)] rounded-full animate-spin" />
            </div>
          ) : (
            <div className="bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.2)] relative overflow-x-auto no-scrollbar">
              <table className="w-full text-left min-w-[800px] sm:min-w-[1000px]">
                <thead>
                    <tr className="bg-[var(--crm-bg)]/30 border-b border-[var(--crm-border)] text-[var(--crm-text-muted)] text-[10px] font-black uppercase tracking-[0.2em]">
                        <th className="py-8 pl-12">Ism Familiya</th>
                        <th className="py-8">Telefon</th>
                        <th className="py-8">Kurs / Guruh</th>
                        <th className="py-8 text-center px-4">Qabul</th>
                        <th className="py-8">Qarz</th>
                        <th className="py-8 pr-12 text-right">Amallar</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--crm-border)] font-bold uppercase transition-colors">
                  {filteredStudents.map((std) => {
                    const debt = totalDebt(std);
                    return (
                        <tr key={std.id} className="group hover:bg-[var(--crm-accent)]/[0.02] transition-all">
                            <td className="py-8 pl-12">
                                <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-[1.25rem] bg-[var(--crm-accent-soft)] border border-[var(--crm-accent-soft)] flex items-center justify-center font-black text-[var(--crm-accent)] text-lg group-hover:bg-[var(--crm-accent)] group-hover:text-white transition-all duration-500 shrink-0 uppercase shadow-lg">
                                        {std.name[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <Link href={`/dashboard/students/${std.id}`} className="text-[var(--crm-text)] text-lg tracking-tighter leading-none mb-1 group-hover:text-[var(--crm-accent)] transition-colors truncate block hover:underline">
                                            {std.name}
                                        </Link>
                                        <span className={`text-[8px] font-black tracking-widest px-2 py-0.5 rounded-md border ${std.status === 'Active' ? 'bg-[var(--crm-success-soft)] text-green-500 border-[var(--crm-success-soft)]' : 'bg-[var(--crm-error-soft)] text-red-500 border-[var(--crm-error-soft)]'}`}>
                                            {std.status === 'Active' ? 'FAOL' : 'ARKHIVED'}
                                        </span>
                                    </div>
                                </div>
                            </td>
                            <td className="py-8 text-[var(--crm-text-muted)] font-mono text-sm tracking-tight">{formatPhone(std.phone)}</td>
                            <td className="py-8 px-4">
                                <div className="flex flex-wrap gap-2 max-w-[240px]">
                                    {(std.courses || []).map((c: any) => {
                                        const grp = (std.groups || []).find((g: any) => g.courseId === c.id);
                                        return (
                                            <div 
                                                key={c.id} 
                                                title={grp ? `Guruh: ${grp.name}\nUstoz: ${grp.teacher || 'Belgilanmagan'}` : "Guruhsiz"}
                                                className="flex flex-col bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] rounded-xl p-2 min-w-[100px] hover:border-[var(--crm-accent)] hover:bg-[var(--crm-accent-soft)] transition-all cursor-help group/badge"
                                            >
                                                <span className="text-[9px] text-[var(--crm-text)] font-black truncate group-hover/badge:text-[var(--crm-accent)]">{c.name}</span>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] text-[var(--crm-text-muted)] font-bold italic truncate opacity-60">{grp ? grp.name : 'Guruhsiz'}</span>
                                                    {grp && <span className="text-[7px] text-[var(--crm-accent)] font-black uppercase tracking-tighter sm:opacity-0 sm:group-hover/badge:opacity-100 transition-opacity leading-none mt-0.5">{grp.teacher || 'Ustozsiz'}</span>}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </td>
                            <td className="py-8 text-center px-4">
                                <div className="text-[10px] font-black text-[var(--crm-text-muted)] opacity-60 tracking-widest">
                                    {formatDate(std.createdAt)}
                                </div>
                            </td>
                            <td className="py-8">
                                <div className={`text-xl font-black tracking-tighter ${debt > 0 ? 'text-red-500' : 'text-green-500'}`}>
                                    {formatMoney(debt)} <span className="text-[9px] font-bold opacity-40">UZS</span>
                                </div>
                            </td>
                            <td className="py-8 pr-12 text-right">
                                <div className="flex justify-end gap-3 sm:translate-x-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-hover:translate-x-0 transition-all duration-300">
                                    {debt > 0 && (
                                        <button onClick={() => openPayment(std)} className="p-4 bg-green-600/10 border border-green-500/10 text-green-500 hover:bg-green-600 hover:text-white rounded-2xl transition-all shadow-xl active:scale-90">
                                            <Wallet className="w-5 h-5 shadow-lg" />
                                        </button>
                                    )}
                                    <button onClick={() => openEdit(std)} className="p-4 bg-blue-600/10 border border-blue-500/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-2xl transition-all shadow-xl active:scale-90">
                                        <Edit3 className="w-5 h-5 shadow-lg" />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

      {/* Premium Student Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-md">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/70" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 100 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 100 }} className="w-full max-w-2xl bg-[var(--crm-card)] border-t sm:border border-[var(--crm-border)] rounded-t-[3rem] sm:rounded-[4rem] p-8 sm:p-12 relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] max-h-[92vh] overflow-y-auto custom-modal-scroll">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--crm-accent)] opacity-5 blur-[120px] -mr-48 -mt-48 rounded-full" />
                
                <header className="mb-12 relative flex items-center justify-between">
                    <div>
                        <h2 className="text-4xl font-black tracking-tighter leading-none">{isEditing ? "Tahrirlash" : "Yangi Talaba"}</h2>
                        <p className="text-[var(--crm-text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mt-2 italic opacity-60">Ma'lumotlar va yo'nalishlar sozlamasi</p>
                    </div>
                    <button onClick={closeModal} className="p-4 bg-[var(--crm-bg)] rounded-full hover:bg-white/5 text-[var(--crm-text-muted)] transition-all">
                        <X className="w-6 h-6" />
                    </button>
                </header>

                <form onSubmit={handleSubmit} className="space-y-8 relative">
                    <div className="space-y-2">
                        <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Ism Familiya</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner" placeholder="F.I.SH" required />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Talaba Telefoni</label>
                            <input type="text" value={formatPhone(formData.phone)} onChange={(e) => {
                                const raw = e.target.value.replace(/[^\d]/g, "");
                                if (raw.length <= 12) setFormData({...formData, phone: raw});
                            }} className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner" placeholder="+998" required />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Ota-Onasi Telefoni</label>
                            <input type="text" value={formatPhone(formData.parentPhone)} onChange={(e) => {
                                const raw = e.target.value.replace(/[^\d]/g, "");
                                if (raw.length <= 12) setFormData({...formData, parentPhone: raw});
                            }} className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner" placeholder="+998" />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                            <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Sana (Tug'ilgan)</label>
                            <input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} className={theme === 'dark' ? 'w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner invert-0' : 'w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner'} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Manzil (Ixtiyoriy)</label>
                            <input type="text" value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-sm font-bold shadow-inner" placeholder="Masalan: Toshkent" />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Yo'nalish / Kurslar</label>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            {courses.map(c => {
                                const active = formData.courseIds.includes(c.id.toString());
                                return (
                                    <button key={c.id} type="button" onClick={() => toggleCourse(c.id.toString())} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${active ? 'bg-[var(--crm-accent)] border-[var(--crm-accent)] text-white shadow-xl translate-y-[-2px]' : 'bg-[var(--crm-bg)] border-[var(--crm-border)] text-[var(--crm-text-muted)] hover:border-[var(--crm-accent)]/50'}`}>
                                        <span className="text-[10px] font-black uppercase truncate">{c.name}</span>
                                        {active && <Check className="w-3 h-3 shrink-0" />}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">Guruh Biriktirish</label>
                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
                            {courses.filter(c => formData.courseIds.includes(c.id.toString())).length === 0 ? (
                                <div className="col-span-full py-8 bg-[var(--crm-bg)]/30 border border-dashed border-[var(--crm-border)] rounded-3xl flex flex-col items-center justify-center opacity-40">
                                    <Search className="w-6 h-6 mb-2" />
                                    <p className="text-[9px] font-black uppercase tracking-widest">Kurs tanlang...</p>
                                </div>
                            ) : (
                                groups.filter(g => formData.courseIds.includes(g.courseId.toString())).map(g => {
                                    const active = formData.groupIds.includes(g.id.toString());
                                    return (
                                        <button key={g.id} type="button" onClick={() => toggleGroup(g.id.toString())} className={`p-4 rounded-2xl border flex items-center justify-between transition-all ${active ? 'bg-[var(--crm-accent)] border-[var(--crm-accent)] text-white shadow-xl translate-y-[-2px]' : 'bg-[var(--crm-bg)] border-[var(--crm-border)] text-[var(--crm-text-muted)] hover:border-[var(--crm-accent)]/50'}`}>
                                            <span className="text-[10px] font-black uppercase truncate">{g.name}</span>
                                            {active && <Check className="w-3 h-3 shrink-0" />}
                                        </button>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    {isEditing && (
                        <div className="space-y-2">
                             <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2">O'quvchi Holati</label>
                             <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.8rem] px-8 py-5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-[10px] font-black appearance-none cursor-pointer">
                                <option value="Active" className="bg-[var(--crm-card)]">AKTIV O'QUVCHI (O'QIYAPTI)</option>
                                <option value="Passive" className="bg-[var(--crm-card)]">KETGAN O'QUVCHI (ARKHIVED)</option>
                             </select>
                        </div>
                    )}

                    <div className="flex gap-4 pt-8">
                        <button type="button" onClick={closeModal} className="flex-1 py-5 bg-[var(--crm-bg)] border border-[var(--crm-border)] text-[var(--crm-text-muted)] rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest hover:bg-[var(--crm-border)] transition-all">Bekor</button>
                        <button type="submit" className="flex-[2] py-5 bg-[var(--crm-accent)] text-white rounded-[1.8rem] font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all">Ma'lumotlarni Saqlash</button>
                    </div>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Multipayment Modal Alignment */}
      <AnimatePresence>
        {showPaymentModal && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-md">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPaymentModal(false)} className="absolute inset-0 bg-black/80" />
            <motion.div initial={{ scale: 0.95, opacity: 0, y: 100 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0, y: 100 }} className="w-full max-w-2xl bg-[var(--crm-card)] border-t sm:border border-[var(--crm-border)] rounded-t-[3rem] sm:rounded-[4rem] p-8 sm:p-12 relative z-10 shadow-2xl max-h-[95vh] overflow-y-auto custom-modal-scroll">
                <header className="mb-10 relative flex items-center justify-between">
                   <div className="flex items-center gap-5">
                      <div className="w-16 h-16 rounded-[1.5rem] bg-green-500/10 border border-green-500/10 flex items-center justify-center text-green-500 shadow-xl"><Wallet className="w-8 h-8 shrink-0" /></div>
                      <div>
                          <h2 className="text-3xl font-black tracking-tighter leading-none">To'lov Qabul Qilish</h2>
                          <p className="text-[var(--crm-text-muted)] text-[10px] font-black uppercase tracking-[0.2em] mt-2 italic opacity-60">{paymentData?.name}</p>
                      </div>
                   </div>
                   <button onClick={() => setShowPaymentModal(false)} className="p-4 bg-[var(--crm-bg)] rounded-full hover:bg-white/5 text-[var(--crm-text-muted)] transition-all">
                       <X className="w-6 h-6" />
                   </button>
                </header>

                <form onSubmit={handleMultiPaymentSubmit} className="space-y-10 relative">
                    <div className="space-y-6">
                        <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.25em] ml-2 opacity-50">Kurslar bo'yicha taqsimot</label>
                        <div className="grid gap-4">
                            {(paymentData?.courses || [])
                                .filter((c: any) => calculateDebtForCourse(paymentData, c) > 0)
                                .map((c: any) => {
                                    const debt = calculateDebtForCourse(paymentData, c);
                                    const period = coursePeriods[c.id] || { from: "", to: "" };
                                    return (
                                        <div key={c.id} className="bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[2.5rem] p-8 group hover:border-green-500/30 transition-all shadow-inner">
                                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                                                <div className="min-w-0">
                                                    <div className="text-xl font-black text-[var(--crm-text)] tracking-tight uppercase leading-none mb-2">{c.name}</div>
                                                    <div className="flex items-center gap-4">
                                                        <div className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-widest opacity-60">Qarz: <span className="text-red-500">{formatMoney(debt)} UZS</span></div>
                                                        <button 
                                                            type="button" 
                                                            onClick={() => setCourseAmounts(prev => ({ ...prev, [c.id]: debt.toString() }))}
                                                            className="text-[9px] text-green-500 font-black uppercase underline decoration-green-500/30 hover:decoration-green-500 transition-all translate-y-[1px]"
                                                        >HAMMASINI TO'LASH</button>
                                                    </div>
                                                </div>
                                                <div className="relative">
                                                    <input 
                                                        type="text" 
                                                        value={formatMoney(courseAmounts[c.id] || "")} 
                                                        onChange={(e) => {
                                                            const rawValue = e.target.value.replace(/\s/g, "");
                                                            if (/^\d*$/.test(rawValue)) setCourseAmounts(prev => ({ ...prev, [c.id]: rawValue }));
                                                        }} 
                                                        placeholder="0" 
                                                        className="bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-2xl px-6 py-4 w-48 text-right font-black text-2xl text-[var(--crm-text)] focus:border-green-500 transition-all placeholder:text-[var(--crm-text-muted)]/20 shadow-xl" 
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="grid grid-cols-2 gap-6 mt-8 pt-8 border-t border-[var(--crm-border)]">
                                                <div className="space-y-2">
                                                    <label className="text-[9px] text-[var(--crm-text-muted)] font-black uppercase tracking-widest ml-1 opacity-50">Dan (Muddat)</label>
                                                    <input type="date" value={period.from} onChange={(e) => setCoursePeriods(prev => ({ ...prev, [c.id]: { ...prev[c.id], from: e.target.value } }))} className="w-full bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[1.25rem] px-6 py-3.5 outline-none text-xs font-black text-[var(--crm-text)] uppercase focus:border-[var(--crm-accent)] shadow-xl" />
                                                </div>
                                                <div className="space-y-2">
                                                    <label className="text-[9px] text-[var(--crm-text-muted)] font-black uppercase tracking-widest ml-1 opacity-50">Gacha</label>
                                                    <input type="date" value={period.to} onChange={(e) => setCoursePeriods(prev => ({ ...prev, [c.id]: { ...prev[c.id], to: e.target.value } }))} className="w-full bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[1.25rem] px-6 py-3.5 outline-none text-xs font-black text-[var(--crm-text)] uppercase focus:border-[var(--crm-accent)] shadow-xl" />
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            {paymentData?.courses?.filter((c: any) => calculateDebtForCourse(paymentData, c) > 0).length === 0 && (
                                <div className="p-12 text-center rounded-[3rem] bg-[var(--crm-bg)] border border-dashed border-[var(--crm-border)] opacity-30">
                                    <Check className="w-12 h-12 text-green-500 mx-auto mb-4" />
                                    <p className="text-[10px] font-black uppercase tracking-widest">Hamma kurslar uchun to'lov qilingan!</p>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-widest ml-1 opacity-50">To'lov Turi</label>
                            <div className="grid grid-cols-3 gap-3">
                                {['CASH', 'CARD', 'TRANSFER'].map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        onClick={() => setPayType(t)}
                                        className={`h-[60px] rounded-[1.25rem] border text-[9px] font-black transition-all ${payType === t ? 'bg-green-600 border-green-600 text-white shadow-xl scale-[1.02]' : 'bg-[var(--crm-bg)] border-[var(--crm-border)] text-[var(--crm-text-muted)] hover:border-[var(--crm-accent)]/50'}`}
                                    >
                                        {t === 'CASH' ? 'NAQD' : t === 'CARD' ? 'KARTA' : 'O\'TKAZMA'}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-widest ml-1 opacity-50">Izoh (Ixtiyoriy)</label>
                            <textarea value={payNotes} onChange={(e) => setPayNotes(e.target.value)} className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-[1.25rem] px-6 py-5 outline-none text-[10px] font-black h-[60px] resize-none text-[var(--crm-text)] transition-all focus:border-[var(--crm-accent)] shadow-inner" placeholder="PUL KIMMASH KELDI..." />
                        </div>
                    </div>

                    <div className="bg-green-500/5 border border-green-500/10 rounded-[3rem] p-10 flex flex-col md:flex-row items-center justify-between gap-10 shadow-inner">
                        <div className="text-center md:text-left">
                            <div className="text-[10px] text-green-500 font-black uppercase tracking-[0.4em] mb-2 opacity-60 italic">KASSA JAMI</div>
                            <div className="flex items-end gap-3 leading-none">
                                <span className="text-5xl font-black text-[var(--crm-text)] tracking-tighter leading-none italic">{formatMoney(Object.values(courseAmounts).reduce((acc, amt) => acc + (parseFloat(amt.replace(/\s/g, "")) || 0), 0))}</span>
                                <span className="text-xs font-black text-green-500 uppercase tracking-widest mb-1.5 opacity-80">UZS</span>
                            </div>
                        </div>
                        <div className="flex gap-4 w-full md:w-auto">
                            <button type="submit" className="flex-1 md:flex-none px-12 py-6 bg-green-600 rounded-[2rem] font-black text-[11px] uppercase tracking-widest text-white shadow-2xl shadow-green-500/40 hover:bg-green-500 hover:scale-105 active:scale-95 transition-all">To'lovni Tasdiqlash</button>
                        </div>
                    </div>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
