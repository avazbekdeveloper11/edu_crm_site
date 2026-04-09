"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Target, 
  Search, 
  Filter, 
  Plus, 
  UserPlus, 
  MoreVertical, 
  Phone, 
  Send, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  X,
  ChevronRight,
  TrendingUp,
  Hash,
  Trash2,
  Edit2,
  BookOpen
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Sidebar } from "@/components/Sidebar";
import { API_BASE_URL } from "@/app/constants";

type LeadStatus = 'New' | 'Contacted' | 'Trial' | 'Student' | 'Rejected';

interface Lead {
  id: number;
  name: string;
  phone: string;
  source?: string;
  status: LeadStatus;
  notes?: string;
  courseId?: number;
  course?: { name: string };
  createdAt: string;
}

export default function LeadsPage() {
  const router = useRouter();
  const [center, setCenter] = useState<any>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    source: "",
    courseId: "",
    notes: ""
  });

  const formatPhoneNumber = (value: string) => {
    if (!value) return value;
    const phoneNumber = value.replace(/[^\d]/g, '');
    const phoneNumberLength = phoneNumber.length;
    if (phoneNumberLength < 4) return `+${phoneNumber}`;
    if (phoneNumberLength < 6) {
      return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}`;
    }
    if (phoneNumberLength < 9) {
      return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}) ${phoneNumber.slice(5, 8)}`;
    }
    if (phoneNumberLength < 11) {
      return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}) ${phoneNumber.slice(5, 8)} ${phoneNumber.slice(8, 10)}`;
    }
    return `+${phoneNumber.slice(0, 3)} (${phoneNumber.slice(3, 5)}) ${phoneNumber.slice(5, 8)} ${phoneNumber.slice(8, 10)} ${phoneNumber.slice(10, 12)}`;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    setFormData({ ...formData, phone: formattedValue });
  };

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    try {
      const [lRes, cRes] = await Promise.all([
        fetch(`${API_BASE_URL}/leads`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/courses`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);
      if (lRes.ok) setLeads(await lRes.json());
      if (cRes.ok) setCourses(await cRes.json());
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("center_user");
    if (!userData) {
      router.push("/login");
    } else {
      setCenter(JSON.parse(userData));
      fetchData();
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    const method = editingLead ? "PATCH" : "POST";
    const url = editingLead ? `${API_BASE_URL}/leads/${editingLead.id}` : `${API_BASE_URL}/leads`;

    try {
      const res = await fetch(url, {
        method,
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({
          ...formData,
          courseId: formData.courseId ? Number(formData.courseId) : null
        })
      });

      if (res.ok) {
        setIsModalOpen(false);
        setEditingLead(null);
        setFormData({ name: "", phone: "", source: "", courseId: "", notes: "" });
        fetchData();
      }
    } catch (err) {
      console.error("Submission failed", err);
    }
  };

  const handleStatusChange = async (id: number, newStatus: LeadStatus) => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_BASE_URL}/leads/${id}`, {
        method: "PATCH",
        headers: { 
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Status update failed", err);
    }
  };

  const convertToStudent = async (lead: Lead) => {
    if (!confirm(`${lead.name} talabalikka qabul qilinsinmi?`)) return;
    
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_BASE_URL}/leads/${lead.id}/convert`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
          alert("Talaba muvaffaqiyatli qo'shildi!");
          fetchData();
      }
    } catch (err) {
      console.error("Conversion failed", err);
    }
  };

  const deleteLead = async (id: number) => {
    if (!confirm("Ushbu leadni o'chirishni xohlaysizmi?")) return;
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_BASE_URL}/leads/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchData();
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  const filteredLeads = leads.filter(l => {
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) || l.phone.includes(search);
    const matchesStatus = statusFilter === "All" || l.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: LeadStatus) => {
    switch (status) {
      case 'New': return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      case 'Contacted': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Trial': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'Student': return 'text-green-500 bg-green-500/10 border-green-500/20';
      case 'Rejected': return 'text-red-500 bg-red-500/10 border-red-500/20';
      default: return 'text-gray-500 bg-gray-500/10 border-gray-500/20';
    }
  };

  if (!center) return null;

  return (
    <div className="min-h-screen bg-[var(--crm-bg)] text-[var(--crm-text)] flex font-sans selection:bg-purple-500/30">
      <Sidebar centerName={center.centerName} role={center.role} />

      <main className="flex-1 min-w-0 pb-32 sm:pb-0 relative">
        <header className="min-h-[60px] sm:min-h-24 border-b border-[var(--crm-border)] flex items-center justify-between px-4 sm:px-10 bg-[var(--crm-sidebar)]/50 backdrop-blur-xl sticky top-0 z-40 py-2 sm:py-0 gap-3 sm:gap-6">
           <div className="flex items-center gap-3 sm:gap-4">
              <div className="p-2 sm:p-3 bg-purple-600/10 rounded-xl shrink-0">
                 <Target className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
              </div>
              <div>
                 <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic">Leadlar</h1>
                 <p className="hidden sm:block text-[10px] text-[var(--crm-text-muted)] font-bold uppercase tracking-widest opacity-60">Mijozlar oqimi boshqaruvi</p>
              </div>
           </div>

           <button 
             onClick={() => { setEditingLead(null); setFormData({ name: "", phone: "", source: "", courseId: "", notes: "" }); setIsModalOpen(true); }}
             className="h-10 sm:h-[52px] px-4 sm:px-8 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-[0.1em] sm:tracking-[0.2em] shadow-lg shadow-purple-600/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 sm:gap-3 shrink-0"
           >
              <Plus className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">Yangi Lead</span>
              <span className="sm:hidden">Lead</span>
           </button>
        </header>

        <div className="p-4 sm:p-10 max-w-7xl mx-auto space-y-10">
          
          {/* Stats Bar */}
          <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
             <LeadStatCard label="Jami" value={leads.length} icon={<Target className="w-5 h-5" />} color="text-purple-600" />
             <LeadStatCard label="Yangi" value={leads.filter(l => l.status === 'New').length} icon={<Clock className="w-5 h-5" />} color="text-indigo-600" />
             <LeadStatCard label="Sinovda" value={leads.filter(l => l.status === 'Trial').length} icon={<TrendingUp className="w-5 h-5" />} color="text-orange-600" />
             <LeadStatCard label="Talaba bo'ldi" value={leads.filter(l => l.status === 'Student').length} icon={<CheckCircle2 className="w-5 h-5" />} color="text-green-600" />
          </section>

          {/* Filters & Search */}
          <div className="flex flex-col md:flex-row gap-6 items-center">
             <div className="relative flex-1 w-full group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--crm-text-muted)] group-focus-within:text-purple-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Ism yoki telefon bo'yicha qidirish..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-2xl py-4.5 pl-14 pr-6 text-sm font-bold focus:border-purple-600 outline-none transition-all"
                />
             </div>
             <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
                {["All", "New", "Contacted", "Trial", "Rejected", "Student"].map((st) => (
                   <button 
                     key={st}
                     onClick={() => setStatusFilter(st)}
                     className={`px-6 py-3.5 rounded-2xl text-[9px] font-black uppercase tracking-widest whitespace-nowrap transition-all border
                       ${statusFilter === st 
                         ? "bg-purple-600 text-white border-transparent shadow-lg shadow-purple-600/20" 
                         : "bg-[var(--crm-card)] text-[var(--crm-text-muted)] border-[var(--crm-border)] hover:border-purple-600/30"}`}
                   >
                     {st === 'All' ? 'Barchas' : st === 'New' ? 'Yangi' : st === 'Contacted' ? 'Bog\'langan' : st === 'Trial' ? 'Sinov' : st === 'Student' ? 'Talaba' : 'Rad etilgan'}
                   </button>
                ))}
             </div>
          </div>

          {/* Leads Table/Grid */}
          {loading ? (
             <div className="py-32 flex flex-col items-center justify-center gap-4 opacity-30">
                <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">Leadlar yuklanmoqda...</p>
             </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
               <AnimatePresence mode="popLayout">
                  {filteredLeads.map((lead) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={lead.id}
                      className="bg-[var(--crm-card)] border border-[var(--crm-border)] p-6 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-2xl hover:border-purple-600/20 transition-all group"
                    >
                       <div className="flex items-center gap-6 flex-1 w-full">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 shadow-inner ${getStatusColor(lead.status)}`}>
                             <Target className="w-6 h-6" />
                          </div>
                          <div className="min-w-0">
                             <h3 className="text-sm font-black uppercase tracking-tight truncate">{lead.name}</h3>
                             <div className="flex items-center gap-4 mt-1 opacity-60">
                                <span className="text-[10px] font-bold text-[var(--crm-text-muted)] flex items-center gap-2">
                                   <Phone className="w-3 h-3" /> {lead.phone}
                                </span>
                                {lead.source && (
                                   <span className="text-[10px] font-bold text-[var(--crm-text-muted)] flex items-center gap-2">
                                      <Hash className="w-3 h-3" /> {lead.source}
                                   </span>
                                )}
                             </div>
                          </div>
                       </div>

                       <div className="flex items-center gap-8 w-full md:w-auto">
                          <div className="flex-1 md:flex-none text-center md:text-left">
                             <p className="text-[9px] font-black uppercase tracking-widest text-[var(--crm-text-muted)] mb-1 opacity-50">Qiziqqan kursi</p>
                             <p className="text-[11px] font-black uppercase tracking-tight flex items-center gap-2">
                                <BookOpen className="w-3 h-3 text-purple-600" />
                                {lead.course?.name || "Noma'lum"}
                             </p>
                          </div>
                          
                          <select 
                            value={lead.status}
                            onChange={(e) => handleStatusChange(lead.id, e.target.value as LeadStatus)}
                            className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border outline-none cursor-pointer transition-all ${getStatusColor(lead.status)}`}
                          >
                             <option value="New">Yangi</option>
                             <option value="Contacted">Bog'lanilgan</option>
                             <option value="Trial">Sinovda</option>
                             <option value="Student">Talaba bo'ldi</option>
                             <option value="Rejected">Rad etildi</option>
                          </select>
                       </div>

                       <div className="flex items-center gap-3 w-full md:w-auto">
                          {lead.status !== 'Student' && lead.status !== 'Rejected' && (
                             <button 
                               onClick={() => convertToStudent(lead)}
                               className="flex-1 md:flex-none h-12 px-6 bg-green-500 text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-green-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                             >
                               <UserPlus className="w-4 h-4" />
                               Qabul
                             </button>
                          )}
                          <button 
                            onClick={() => { setEditingLead(lead); setFormData({ name: lead.name, phone: lead.phone, source: lead.source || "", courseId: lead.courseId?.toString() || "", notes: lead.notes || "" }); setIsModalOpen(true); }}
                            className="w-12 h-12 bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] rounded-2xl flex items-center justify-center text-[var(--crm-text-muted)] hover:text-purple-600 hover:border-purple-600/30 transition-all"
                          >
                             <Edit2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => deleteLead(lead.id)}
                            className="w-12 h-12 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center justify-center text-red-500/40 hover:text-red-500 hover:bg-red-500/10 transition-all"
                          >
                             <Trash2 className="w-4 h-4" />
                          </button>
                       </div>
                    </motion.div>
                  ))}
               </AnimatePresence>
               {filteredLeads.length === 0 && (
                 <div className="py-20 text-center opacity-30">
                    <Target className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p className="text-xs font-black uppercase tracking-widest">Leadlar topilmadi</p>
                 </div>
               )}
            </div>
          )}
        </div>
      </main>

      {/* Modal */}
      <AnimatePresence>
         {isModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-10 backdrop-blur-xl bg-black/60">
               <motion.div 
                 initial={{ opacity: 0, scale: 0.9, y: 20 }}
                 animate={{ opacity: 1, scale: 1, y: 0 }}
                 exit={{ opacity: 0, scale: 0.9, y: 20 }}
                 className="bg-[var(--crm-card)] border border-[var(--crm-border)] w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden"
               >
                  <header className="p-8 border-b border-[var(--crm-border)] flex items-center justify-between">
                     <h2 className="text-xl font-black uppercase tracking-tight italic">{editingLead ? "Leadni Tahrirlash" : "Yangi Lead Qo'shish"}</h2>
                     <button onClick={() => setIsModalOpen(false)} className="p-3 bg-[var(--crm-bg)] rounded-full text-[var(--crm-text-muted)] hover:text-red-500 transition-all"><X className="w-5 h-5"/></button>
                  </header>
                  <form onSubmit={handleSubmit} className="p-8 space-y-6">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase text-[var(--crm-text-muted)] tracking-widest ml-1">F.I.SH</label>
                           <input required type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-2xl py-4 px-6 text-sm font-bold focus:border-purple-600 outline-none" placeholder="Masalan: Azizbek Karimov" />
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase text-[var(--crm-text-muted)] tracking-widest ml-1">Telefon Raqami</label>
                           <input 
                             required 
                             type="text" 
                             value={formData.phone} 
                             onChange={handlePhoneChange} 
                             className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-2xl py-4 px-6 text-sm font-bold focus:border-purple-600 outline-none" 
                             placeholder="+998 (90) 123 45 67" 
                           />
                        </div>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase text-[var(--crm-text-muted)] tracking-widest ml-1">Kutilayotgan Kurs</label>
                           <select value={formData.courseId} onChange={(e) => setFormData({...formData, courseId: e.target.value})} className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-2xl py-4 px-6 text-sm font-bold focus:border-purple-600 outline-none appearance-none">
                              <option value="">Tanlang...</option>
                              {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                           </select>
                        </div>
                        <div className="space-y-3">
                           <label className="text-[10px] font-black uppercase text-[var(--crm-text-muted)] tracking-widest ml-1">Manba (Source)</label>
                           <input type="text" value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})} className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-2xl py-4 px-6 text-sm font-bold focus:border-purple-600 outline-none" placeholder="Masalan: Instagram" />
                        </div>
                     </div>
                     <div className="space-y-3">
                        <label className="text-[10px] font-black uppercase text-[var(--crm-text-muted)] tracking-widest ml-1">Izohlar</label>
                        <textarea rows={3} value={formData.notes} onChange={(e) => setFormData({...formData, notes: e.target.value})} className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-2xl py-4 px-6 text-sm font-bold focus:border-purple-600 outline-none resize-none" placeholder="Qo'shimcha ma'lumotlar..." />
                     </div>
                     <button type="submit" className="w-full py-5 bg-purple-600 text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl shadow-purple-600/20 hover:scale-[1.02] active:scale-95 transition-all">
                        {editingLead ? "O'zgarishlarni Saqlash" : "Lead Yaratish"}
                     </button>
                  </form>
               </motion.div>
            </div>
         )}
      </AnimatePresence>
    </div>
  );
}

function LeadStatCard({ label, value, icon, color }: any) {
  return (
    <div className="bg-[var(--crm-card)] border border-[var(--crm-border)] p-8 rounded-[2rem] shadow-xl group hover:border-purple-600/20 transition-all">
       <div className="flex justify-between items-start mb-4">
          <div className={`p-4 bg-[var(--crm-bg)] rounded-xl ${color} shadow-inner`}>{icon}</div>
       </div>
       <p className="text-[9px] font-black uppercase tracking-widest text-[var(--crm-text-muted)] mb-1 opacity-60 italic">{label}</p>
       <p className="text-2xl font-black">{value}</p>
    </div>
  );
}
