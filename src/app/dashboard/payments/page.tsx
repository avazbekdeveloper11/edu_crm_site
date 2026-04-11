"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Users, 
  Search, 
  Trash2, 
  LogOut,
  Calendar,
  Wallet,
  Layers,
  Settings,
  TrendingUp,
  Plus,
  CheckCircle2,
  CalendarDays,
  LayoutDashboard,
  AlertCircle,
  ArrowRightLeft,
  Filter,
  Users2,
  ChevronDown,
  X
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeContext";
import { API_BASE_URL } from "@/app/constants";

const formatMoney = (val: any) => {
    if (!val && val !== 0) return "0";
    return Number(val).toLocaleString("ru-RU").replace(/,/g, " ");
};

export default function PaymentsPage() {
  const router = useRouter();
  const [center, setCenter] = useState<any>(null);
  const [role, setRole] = useState("");
  const [payments, setPayments] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [groups, setGroups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const { theme } = useTheme();
  
  // Filters
  const [filterMonth, setFilterMonth] = useState("");
  const [filterCourse, setFilterCourse] = useState("");
  const [filterGroup, setFilterGroup] = useState("");
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form state for new payment
  const [newPay, setNewPay] = useState({
    studentId: "",
    amount: "",
    type: "CASH",
    periodFrom: "",
    periodTo: "",
    notes: ""
  });

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const [payRes, stdRes, crsRes, grpRes] = await Promise.all([
        fetch(`${API_BASE_URL}/payments`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/students`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/courses`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/groups`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);
      if (payRes.ok) setPayments(await payRes.json());
      if (stdRes.ok) setStudents(await stdRes.json());
      if (crsRes.ok) setCourses(await crsRes.json());
      if (grpRes.ok) setGroups(await grpRes.json());
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
      setRole(parsed.role || "OWNER");
    }
    fetchData();
  }, []);

  useEffect(() => {
    if (showAddModal) {
        const now = new Date();
        const firstDay = new Date(now.getFullYear(), now.getMonth(), 1).toLocaleDateString('en-CA');
        const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0).toLocaleDateString('en-CA');
        setNewPay(prev => ({ ...prev, periodFrom: firstDay, periodTo: lastDay }));
    }
  }, [showAddModal]);

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPay.studentId || !newPay.amount || parseFloat(newPay.amount) <= 0) return;
    const token = localStorage.getItem("access_token");
    const selectedStd = students.find(s => s.id === parseInt(newPay.studentId));
    try {
      const res = await fetch(`${API_BASE_URL}/payments`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          studentId: parseInt(newPay.studentId),
          courseId: selectedStd?.courses?.[0]?.id || selectedStd?.groups?.[0]?.courseId,
          amount: parseFloat(newPay.amount),
          paymentType: newPay.type,
          periodFrom: newPay.periodFrom,
          periodTo: newPay.periodTo,
          notes: newPay.notes
        }),
      });
      if (res.ok) {
        fetchData();
        setShowAddModal(false);
        setNewPay({ studentId: "", amount: "", type: "CASH", notes: "", periodFrom: "", periodTo: "" });
      }
    } catch (err) {
      console.error("Payment failed", err);
    }
  };

  const filteredPayments = payments.filter(p => {
    const studentName = p.student?.name?.toLowerCase() || "";
    const courseName = p.course?.name?.toLowerCase() || "";
    const searchMatch = studentName.includes(search.toLowerCase()) || courseName.includes(search.toLowerCase());
    const pDate = new Date(p.paymentDate);
    const mStr = (pDate.getMonth() + 1).toString().padStart(2, '0');
    const monthMatch = filterMonth === "" || mStr === filterMonth;
    const courseMatch = filterCourse === "" || p.courseId?.toString() === filterCourse;
    const grpMatch = filterGroup === "" || (p.student?.groups || []).some((g: any) => g.id.toString() === filterGroup);
    return searchMatch && monthMatch && courseMatch && grpMatch;
  });

  const totalIncome = filteredPayments.reduce((acc, p) => acc + p.amount, 0);
  const selectedStudent = students.find(s => s.id === parseInt(newPay.studentId));

  const totalDebt = (student: any) => {
    if (!student) return 0;
    const totalCoursesPrice = (student.courses || []).reduce((acc: number, c: any) => acc + c.price, 0);
    const totalPayments = (student.payments || []).reduce((acc: number, p: any) => acc + p.amount, 0);
    return totalCoursesPrice - totalPayments;
  };

  const months = [
    { v: "01", l: "Yanvar" }, { v: "02", l: "Fevral" }, { v: "03", l: "Mart" },
    { v: "04", l: "Aprel" }, { v: "05", l: "May" }, { v: "06", l: "Iyun" },
    { v: "07", l: "Iyul" }, { v: "08", l: "Avgust" }, { v: "09", l: "Sentabr" },
    { v: "10", l: "Oktabr" }, { v: "11", l: "Noyabr" }, { v: "12", l: "Dekabr" }
  ];

  return (
    <>
        <header className="min-h-[60px] sm:min-h-24 border-b border-[var(--crm-border)] flex items-center justify-between px-4 sm:px-10 bg-[var(--crm-sidebar)]/50 backdrop-blur-xl sticky top-0 z-40 py-2 sm:py-0 gap-3 sm:gap-6">
          <div className="relative group flex-1 max-w-[140px] xs:max-w-[180px] sm:max-w-md">
            <Search className="absolute left-3.5 sm:left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-[var(--crm-text-muted)] group-focus-within:text-[var(--crm-accent)] transition-colors" />
            <input 
              type="text" 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
              placeholder="Qidiruv..." 
              className="w-full bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] rounded-xl sm:rounded-2xl py-2 sm:py-3.5 pl-10 sm:pl-14 pr-4 text-[10px] sm:text-sm font-bold focus:outline-none focus:border-[var(--crm-accent)] transition-all text-[var(--crm-text)] placeholder:text-[var(--crm-text-muted)]/40 shadow-inner" 
            />
          </div>
          <div className="flex items-center gap-2 sm:gap-10 shrink-0">
             <div className="flex flex-col items-end shrink-0 group relative">
                <span className="text-[9px] sm:text-[9px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.1em] sm:tracking-[0.2em] opacity-60">Tushum</span>
                <span className="text-sm sm:text-2xl font-black text-green-500 tracking-tighter leading-none italic">{formatMoney(totalIncome)}<span className="text-[8px] sm:text-[10px] opacity-40 uppercase ml-0.5 sm:ml-1 font-black">UZS</span></span>
                
                <div className="hidden xs:flex gap-1.5 sm:gap-4 mt-1">
                   {['CASH', 'CARD', 'TRANSFER'].map(type => {
                      const amount = filteredPayments.filter(p => p.paymentType === type).reduce((acc, p) => acc + p.amount, 0);
                      if (amount === 0) return null;
                      const labels: any = { CASH: 'Naqt', CARD: 'Karta', TRANSFER: 'Bank' };
                      const colors: any = { CASH: 'text-orange-500', CARD: 'text-blue-500', TRANSFER: 'text-purple-500' };
                      return (
                         <div key={type} className="flex flex-col items-end">
                            <span className="text-[7px] sm:text-[8px] font-black uppercase opacity-40 tracking-tighter">{labels[type]}</span>
                            <span className={`text-[9px] sm:text-xs font-black ${colors[type]} leading-tight tracking-tight`}>{formatMoney(amount)}</span>
                         </div>
                      );
                   })}
                </div>
             </div>
             <button onClick={() => setShowAddModal(true)} className="bg-green-600 hover:scale-105 transition-all text-white px-3 sm:px-10 h-10 sm:h-14 rounded-xl sm:rounded-[1.5rem] font-black text-[9px] sm:text-xs tracking-[0.1em] sm:tracking-[0.15em] flex items-center justify-center gap-1.5 sm:gap-3 shadow-2xl shadow-green-600/30 active:scale-95 uppercase whitespace-nowrap">
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 shadow-lg" />
                <span className="hidden sm:inline font-black">To'lov Qabul</span>
                <span className="sm:hidden font-black">Qabul</span>
             </button>
          </div>
        </header>

        <section className="p-4 sm:p-12 max-w-7xl mx-auto min-h-screen">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 sm:gap-8 mb-10 sm:mb-16 px-2 sm:px-0">
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-none italic opacity-20">Kassa</h1>
              <div className="flex items-center gap-3 sm:gap-4">
                  <p className="text-[var(--crm-text-muted)] font-black text-[8px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] opacity-60">Moliya va to'lovlar jurnali</p>
                  <span className="bg-[var(--crm-success-soft)] text-green-500 px-2 py-0.5 rounded-lg text-[8px] sm:text-[9px] font-black uppercase tracking-widest border border-[var(--crm-success-soft)]">{filteredPayments.length} ta</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 sm:gap-4 bg-[var(--crm-card)] p-2 sm:p-3 rounded-2xl sm:rounded-[2rem] border border-[var(--crm-border)] shadow-xl w-full lg:w-auto">
                <div className="relative group flex-1 md:flex-none md:min-w-[140px]">
                    <CalendarDays className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--crm-text-muted)] pointer-events-none" />
                    <select value={filterMonth} onChange={(e) => setFilterMonth(e.target.value)} className="w-full bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] rounded-xl py-2.5 pl-10 pr-8 outline-none focus:border-green-500/50 text-[9px] font-black uppercase tracking-widest text-[var(--crm-text)] appearance-none cursor-pointer transition-all">
                        <option value="" className="bg-[var(--crm-card)]">Barcha Oylar</option>
                        {months.map(m => <option key={m.v} value={m.v} className="bg-[var(--crm-card)]">{m.l}</option>)}
                    </select>
                </div>
                <div className="relative group flex-1 md:flex-none md:min-w-[140px]">
                    <Layers className="absolute left-4 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--crm-text-muted)] pointer-events-none" />
                    <select value={filterCourse} onChange={(e) => setFilterCourse(e.target.value)} className="w-full bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] rounded-xl py-2.5 pl-10 pr-8 outline-none focus:border-green-500/50 text-[9px] font-black uppercase tracking-widest text-[var(--crm-text)] appearance-none cursor-pointer transition-all">
                        <option value="" className="bg-[var(--crm-card)]">Barcha Kurslar</option>
                        {courses.map(c => <option key={c.id} value={c.id} className="bg-[var(--crm-card)]">{c.name}</option>)}
                    </select>
                </div>
                <button onClick={() => { setSearch(""); setFilterMonth(""); setFilterCourse(""); setFilterGroup(""); }} className="p-2 sm:p-2.5 text-[var(--crm-text-muted)] hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-16 h-16 border-[6px] border-green-600/10 border-t-green-600 rounded-full animate-spin" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-20 sm:p-32 text-center rounded-[3rem] sm:rounded-[4rem] bg-[var(--crm-card)] border border-[var(--crm-border)] relative overflow-hidden group shadow-2xl">
              <Wallet className="w-16 h-16 sm:w-24 sm:h-24 text-[var(--crm-text-muted)]/20 mx-auto mb-6 sm:mb-10" />
              <h3 className="text-2xl sm:text-3xl font-black mb-3 sm:mb-4 uppercase tracking-tighter">To'lovlar topilmadi</h3>
              <p className="text-[var(--crm-text-muted)] font-bold text-xs sm:text-sm max-w-sm mx-auto opacity-60 italic">Hali birorta ham to'lov amalga oshirilmagan yoki qidiruv natijasi mavjud emas.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Desktop Table View */}
              <div className="hidden sm:block bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.2)] relative overflow-x-auto no-scrollbar">
                <table className="w-full text-left min-w-[1000px]">
                  <thead>
                      <tr className="bg-[var(--crm-bg)]/30 border-b border-[var(--crm-border)] text-[var(--crm-text-muted)] text-[10px] font-black uppercase tracking-[0.2em]">
                          <th className="py-8 pl-12">Talaba / Guruh</th>
                          <th className="py-8">Muddat (Period)</th>
                          <th className="py-8">Miqdor / Turi</th>
                          <th className="py-8">Tranzaksiya Sanasi</th>
                          <th className="py-8 pr-12 text-right">Status</th>
                      </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--crm-border)] font-bold uppercase transition-colors">
                    {filteredPayments.map((p) => (
                      <tr key={p.id} className="group hover:bg-green-500/[0.02] transition-all">
                          <td className="py-8 pl-12">
                              <div className="flex items-center gap-5">
                                  <div className="w-12 h-12 rounded-[1.25rem] bg-[var(--crm-success-soft)] border border-[var(--crm-success-soft)] flex items-center justify-center font-black text-green-500 text-lg group-hover:bg-green-600 group-hover:text-white transition-all duration-500 shrink-0 shadow-lg capitalize">
                                      {p.student?.name[0]}
                                  </div>
                                  <div className="min-w-0">
                                      <div className="text-[var(--crm-text)] text-lg tracking-tighter leading-none mb-1 group-hover:text-green-500 transition-colors truncate">{p.student?.name}</div>
                                      <div className="flex items-center gap-2">
                                          <span className="text-[8px] text-[var(--crm-text-muted)] font-black tracking-widest opacity-60 line-clamp-1 italic">
                                              {p.course?.name} {p.student?.groups?.length > 0 && `• ${p.student.groups.map((g: any) => g.name).join(', ')}`}
                                          </span>
                                      </div>
                                  </div>
                              </div>
                          </td>
                          <td className="py-8 text-[var(--crm-text-muted)] font-mono text-xs tracking-tight opacity-60 lowercase">
                              {p.periodFrom ? `${new Date(p.periodFrom).toLocaleDateString()} — ${new Date(p.periodTo).toLocaleDateString()}` : "belgilanmagan"}
                          </td>
                          <td className="py-8">
                              <div className="text-xl font-black text-green-500 tracking-tighter leading-none mb-1">
                                  {formatMoney(p.amount)} <span className="text-[9px] font-bold opacity-40 italic">UZS</span>
                              </div>
                              <span className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500 opacity-40">
                                  {p.paymentType === 'CASH' ? 'Naqd To\'lov' : p.paymentType === 'CARD' ? 'Plastik Karta' : 'Bank O\'tkazmasi'}
                              </span>
                          </td>
                          <td className="py-8">
                               <div className="text-[var(--crm-text-muted)] text-[10px] font-mono opacity-50 uppercase mb-1">
                                  {new Date(p.paymentDate).toLocaleDateString("ru-RU")}
                               </div>
                               {p.user && (
                                  <div className="flex items-center gap-2 group-hover:opacity-100 transition-all">
                                     <div className="w-5 h-5 rounded-md bg-purple-500/10 border border-purple-500/10 flex items-center justify-center text-purple-600 text-[9px] font-black uppercase tracking-tighter shadow-sm">
                                        {p.user.name?.[0] || 'A'}
                                     </div>
                                     <span className="text-[9px] font-black uppercase tracking-widest text-[var(--crm-text-muted)] opacity-60 group-hover:opacity-100 group-hover:text-purple-600 transition-colors truncate max-w-[100px]">
                                        {p.user.name?.split(' ')[0] || 'Admin'}
                                     </span>
                                  </div>
                               )}
                          </td>
                          <td className="py-8 pr-12 text-right">
                             <div className="flex items-center justify-end gap-3 sm:translate-x-4 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 sm:group-hover:translate-x-0 transition-all duration-300">
                                  <div className="flex items-center gap-2 px-3 py-1.5 bg-[var(--crm-success-soft)] border border-[var(--crm-success-soft)] rounded-full text-green-500 text-[9px] font-black uppercase tracking-widest">
                                      <CheckCircle2 className="w-3.5 h-3.5" />
                                      Muvaffaqiyatli
                                  </div>
                             </div>
                          </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile Card List View */}
              <div className="sm:hidden space-y-3">
                {filteredPayments.map((p) => (
                  <div key={p.id} className="bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[2rem] p-5 shadow-xl relative overflow-hidden group active:scale-[0.98] transition-all">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-green-500 opacity-[0.03] blur-2xl -mr-12 -mt-12 rounded-full" />
                    
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[var(--crm-success-soft)] border border-[var(--crm-success-soft)] flex items-center justify-center font-black text-green-500 text-sm shadow-inner group-hover:bg-green-600 group-hover:text-white transition-all">
                          {p.student?.name[0]}
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-[var(--crm-text)] text-sm font-black truncate uppercase tracking-tight leading-none mb-1">{p.student?.name}</h4>
                          <p className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-widest opacity-60 italic truncate max-w-[150px]">
                             {p.course?.name}
                          </p>
                        </div>
                      </div>
                      <div className="px-2.5 py-1 bg-[var(--crm-success-soft)] border border-[var(--crm-success-soft)] rounded-full text-green-500 text-[8px] font-black uppercase tracking-widest whitespace-nowrap shadow-sm">
                        Muvaffaqiyatli
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-[var(--crm-border)]/50">
                      <div>
                        <span className="text-[9px] text-[var(--crm-text-muted)] font-black uppercase tracking-widest opacity-40 block mb-1">Summa & Turi</span>
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl font-black text-green-500 tracking-tighter leading-none">{formatMoney(p.amount)}</span>
                          <span className="text-[9px] font-black opacity-40 italic">UZS</span>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-tight text-[var(--crm-text-muted)] opacity-60 mt-1 block italic">
                          {p.paymentType === 'CASH' ? 'Naqd' : p.paymentType === 'CARD' ? 'Karta' : 'O\'tkazma'}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-[var(--crm-text-muted)] font-black uppercase tracking-widest opacity-40 block mb-1">Sana</span>
                        <div className="text-xs font-mono font-bold text-[var(--crm-text)] uppercase mb-2">
                           {new Date(p.paymentDate).toLocaleDateString("ru-RU")}
                        </div>
                        {p.user && (
                          <div className="flex items-center justify-end gap-1.5 mt-1">
                             <span className="text-[9px] font-black uppercase tracking-widest text-[var(--crm-text-muted)] opacity-50 truncate max-w-[80px]">
                                {p.user.name?.split(' ')[0] || 'Admin'}
                             </span>
                             <div className="w-5 h-5 rounded-md bg-purple-500/10 border border-purple-500/10 flex items-center justify-center text-purple-600 text-[8px] font-black uppercase shadow-sm">
                                {p.user.name?.[0] || 'A'}
                             </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {p.periodFrom && (
                      <div className="mt-4 pt-3 border-t border-[var(--crm-border)]/30">
                        <span className="text-[8px] text-[var(--crm-text-muted)] font-black uppercase tracking-widest opacity-40 block mb-1.5 text-center">To'lov muddati (Period)</span>
                        <div className="text-[10px] text-[var(--crm-text-muted)] font-mono text-center opacity-60 italic font-bold">
                          {new Date(p.periodFrom).toLocaleDateString()} — {new Date(p.periodTo).toLocaleDateString()}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>

      {/* Modern Add Payment Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-md">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAddModal(false)} className="absolute inset-0 bg-black/70" />
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="w-full max-w-lg bg-[var(--crm-card)] border-t sm:border border-[var(--crm-border)] rounded-t-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-10 relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[92vh]">
                <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-green-500 opacity-5 blur-[120px] -mr-48 -mt-48 rounded-full" />
                
                <header className="mb-8 relative flex items-center justify-between shrink-0">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-[1.25rem] sm:rounded-[1.5rem] bg-green-500/10 border border-green-500/10 flex items-center justify-center text-green-500 shadow-xl"><Wallet className="w-6 h-6 sm:w-8 sm:h-8" /></div>
                       <div>
                           <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-none italic">Kirim</h2>
                           <p className="text-[9px] sm:text-[9px] font-black uppercase tracking-[0.2em] mt-1.5 italic opacity-60">Yangi to'lov qabul qilish</p>
                       </div>
                    </div>
                    <button onClick={() => setShowAddModal(false)} className="p-3 bg-[var(--crm-bg)]/50 rounded-full hover:bg-white/5 text-[var(--crm-text-muted)] transition-all border border-[var(--crm-border)]">
                        <X className="w-5 h-5" />
                    </button>
                </header>

                <form onSubmit={handleAddSubmit} className="space-y-4 sm:space-y-6 relative overflow-y-auto no-scrollbar pb-10">
                    <div className="space-y-1.5 px-0.5">
                        <label className="text-[10px] sm:text-[9px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2 opacity-50 italic">Talabani Tanlang</label>
                        <div className="relative group">
                            <Users className="absolute left-6 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--crm-text-muted)] z-10" />
                            <select value={newPay.studentId} onChange={(e) => setNewPay({...newPay, studentId: e.target.value})} required className="w-full bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] rounded-2xl pl-14 pr-8 py-3.5 focus:border-green-500 outline-none text-[var(--crm-text)] text-xs font-bold shadow-inner appearance-none cursor-pointer transition-all">
                                <option value="" className={theme === 'dark' ? 'bg-black' : 'bg-white'}>TALABALAR RO'YHATI...</option>
                                {students.map(s => <option key={s.id} value={s.id} className={theme === 'dark' ? 'bg-black' : 'bg-white'}>{s.name} ({formatPhone(s.phone)})</option>)}
                            </select>
                            <ChevronDown className="absolute right-7 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--crm-text-muted)] pointer-events-none" />
                        </div>
                        {selectedStudent && (
                            <div className="flex items-center justify-between px-3 mt-2">
                                <div className="flex items-center gap-2">
                                    <span className="text-[9px] font-black text-red-500/50 uppercase tracking-widest">Qarzdorlik:</span>
                                    <button 
                                        type="button"
                                        onClick={() => setNewPay({ ...newPay, amount: totalDebt(selectedStudent).toString() })}
                                        className="px-2.5 py-1 bg-red-500/10 border border-red-500/20 rounded-full hover:bg-red-500 hover:text-white transition-all group/pill flex items-center gap-2"
                                    >
                                        <span className="text-[11px] font-black text-red-500 group-hover/pill:text-white tracking-tighter italic">{formatMoney(totalDebt(selectedStudent))}</span>
                                        <ArrowRightLeft className="w-2.5 h-2.5 text-red-500 group-hover/pill:text-white" />
                                    </button>
                                </div>
                                <span className="text-[9px] font-black text-[var(--crm-text-muted)] italic opacity-40 uppercase truncate max-w-[120px]">
                                    {(selectedStudent.courses || []).map((c: any) => c.name).join(', ')}
                                </span>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5 px-0.5">
                            <label className="text-[10px] sm:text-[9px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2 opacity-50 italic">To'lov Summasi</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={newPay.amount} 
                                    onChange={(e) => setNewPay({...newPay, amount: e.target.value})} 
                                    className="w-full bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] rounded-2xl px-6 py-3.5 focus:border-green-500 outline-none text-[var(--crm-text)] text-base font-black transition-all shadow-inner" 
                                    placeholder="0" 
                                    required 
                                />
                                <span className="absolute right-6 top-1/2 -translate-y-1/2 text-[9px] text-[var(--crm-text-muted)] font-black uppercase">UZS</span>
                            </div>
                        </div>
                        <div className="space-y-1.5 px-0.5">
                            <label className="text-[10px] sm:text-[9px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2 opacity-50 italic">Turi</label>
                            <div className="relative">
                              <select value={newPay.type} onChange={(e) => setNewPay({...newPay, type: e.target.value})} className="w-full bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] rounded-2xl px-6 py-3.5 focus:border-green-500 outline-none text-[var(--crm-text)] text-[11px] font-black appearance-none cursor-pointer shadow-inner uppercase tracking-wider">
                                  <option value="CASH" className={theme === 'dark' ? 'bg-black' : 'bg-white'}>NAQD</option>
                                  <option value="CARD" className={theme === 'dark' ? 'bg-black' : 'bg-white'}>PLASTIK</option>
                                  <option value="TRANSFER" className={theme === 'dark' ? 'bg-black' : 'bg-white'}>O'TKAZMA</option>
                              </select>
                              <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 w-3 h-3 text-[var(--crm-text-muted)] pointer-events-none" />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3 px-0.5">
                        <div className="space-y-1">
                            <label className="text-[9px] sm:text-[8px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.1em] ml-2 opacity-40 italic">Muddat Dan</label>
                            <input type="date" value={newPay.periodFrom} onChange={(e) => setNewPay({...newPay, periodFrom: e.target.value})} className="w-full bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] rounded-xl px-4 py-2.5 focus:border-green-500 outline-none text-[var(--crm-text)] text-[11px] font-bold" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-[9px] sm:text-[8px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.1em] ml-2 opacity-40 italic">Gacha</label>
                            <input type="date" value={newPay.periodTo} onChange={(e) => setNewPay({...newPay, periodTo: e.target.value})} className="w-full bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] rounded-xl px-4 py-2.5 focus:border-green-500 outline-none text-[var(--crm-text)] text-[11px] font-bold" />
                        </div>
                    </div>

                    <div className="space-y-1.5 px-0.5">
                        <label className="text-[9px] sm:text-[9px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2 opacity-50 italic">Izoh</label>
                        <textarea value={newPay.notes} onChange={(e) => setNewPay({...newPay, notes: e.target.value})} rows={2} className="w-full bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] rounded-2xl px-6 py-3.5 focus:border-green-600/30 outline-none text-[var(--crm-text)] text-[11px] font-bold transition-all resize-none shadow-inner leading-relaxed" placeholder="Batafsil..." />
                    </div>

                    <div className="flex gap-3 pt-4 shrink-0">
                        <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-4 bg-[var(--crm-bg)] border border-[var(--crm-border)] text-[var(--crm-text-muted)] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[var(--crm-border)] transition-all">Bekor</button>
                        <button type="submit" className="flex-[2] py-4 bg-green-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-green-600/30 hover:scale-[1.02] active:scale-95 transition-all">Qabul Qilish</button>
                    </div>
                </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

const formatPhone = (val: string) => {
    const raw = val.replace(/\D/g, "");
    if (!raw) return "";
    return "+" + raw;
};
