"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Users,
  PlusCircle,
  Search,
  Edit3,
  Trash2,
  Calendar,
  Layers,
  Clock,
  Briefcase,
  Plus,
  Users2,
  X,
  ChevronDown,
  Check,
  ClipboardList,
  History
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeContext";
import { API_BASE_URL } from "@/app/constants";
import { ConfirmDialog } from "@/components/ConfirmDialog";

export default function GroupsPage() {
  const router = useRouter();
  const [center, setCenter] = useState<any>(null);
  const [role, setRole] = useState("");
  const [groups, setGroups] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [teachers, setTeachers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [showAttendanceModal, setShowAttendanceModal] = useState(false);
  const [currentGroup, setCurrentGroup] = useState<any>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<any[]>([]);
  const [attendanceHistory, setAttendanceHistory] = useState<any[]>([]);
  const [attendanceDate, setAttendanceDate] = useState(new Date().toLocaleDateString('en-CA'));
  const [showHistory, setShowHistory] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);
  const { theme } = useTheme();

  const [formData, setFormData] = useState({
    name: "",
    teacher: "",
    days: "Du-Chor-Ju",
    time: "",
    courseId: ""
  });
  const isOwner = role === 'OWNER' || role === 'SUPER_ADMIN';

  const fetchData = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const [grpRes, crsRes, usrRes] = await Promise.all([
        fetch(`${API_BASE_URL}/groups`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/courses`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/users`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);
      if (grpRes.ok) setGroups(await grpRes.json());
      if (crsRes.ok) setCourses(await crsRes.json());
      if (usrRes.ok) {
        const allUsrs = await usrRes.json();
        setTeachers(allUsrs.filter((u: any) => u.role === 'TEACHER'));
      }
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
    const method = isEditing ? "PUT" : "POST";
    const url = isEditing ? `${API_BASE_URL}/groups/${editingId}` : `${API_BASE_URL}/groups`;

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });
      if (res.ok) {
        fetchData();
        closeModal();
      }
    } catch (err) {
      console.error("Save failed", err);
    }
  };

  const openEdit = (group: any) => {
    setFormData({
      name: group.name,
      teacher: group.teacher || "",
      days: group.days || "Du-Chor-Ju",
      time: group.time || "",
      courseId: group.courseId.toString()
    });
    setEditingId(group.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const deleteGroup = async (id: number) => {
    setItemToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDelete = async () => {
    if (!itemToDelete) return;
    setDeleting(true);
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_BASE_URL}/groups/${itemToDelete}`, {
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

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: "", teacher: "", days: "Du-Chor-Ju", time: "", courseId: "" });
  };

  const openAttendance = async (group: any) => {
    setCurrentGroup(group);
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_BASE_URL}/groups/${group.id}?date=${attendanceDate}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const fullGroup = await res.json();
        const records = (fullGroup.students || []).map((s: any) => {
          const hasAbsence = s.absenceRequests && s.absenceRequests.length > 0;
          const savedRecord = s.attendance && s.attendance.length > 0 ? s.attendance[0] : null;
          return { 
            studentId: s.id, 
            name: s.name, 
            status: savedRecord ? savedRecord.status : (hasAbsence ? "EXCUSED" : "PRESENT"),
            reason: hasAbsence ? s.absenceRequests[0].reason : null
          };
        });
        records.sort((a: any, b: any) => {
          if (a.status === "EXCUSED" && b.status !== "EXCUSED") return -1;
          if (a.status !== "EXCUSED" && b.status === "EXCUSED") return 1;
          return 0;
        });
        setAttendanceRecords(records);
        fetchAttendanceHistory(group.id);
        setShowAttendanceModal(true);
        setShowHistory(false);
      }
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    if (showAttendanceModal && currentGroup) openAttendance(currentGroup);
  }, [attendanceDate]);

  const fetchAttendanceHistory = async (groupId: number) => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_BASE_URL}/attendance/group/${groupId}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) setAttendanceHistory(await res.json());
    } catch (err) { console.error("Fetch attendance history failed", err); }
  };

  const saveAttendance = async () => {
    const token = localStorage.getItem("access_token");
    try {
      const res = await fetch(`${API_BASE_URL}/attendance`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({
          groupId: currentGroup.id,
          date: attendanceDate,
          records: attendanceRecords.map(r => ({ studentId: r.studentId, status: r.status }))
        })
      });
      if (res.ok) {
        setShowAttendanceModal(false);
        fetchAttendanceHistory(currentGroup.id);
      }
    } catch (err) { console.error("Save attendance failed", err); }
  };

  const getTimeForDay = (timeStr: string, day: string) => {
    if (!timeStr) return "";
    if (!timeStr.includes(": ")) return timeStr;
    const parts = timeStr.split(", ");
    const part = parts.find(p => p.startsWith(`${day}: `));
    return part ? part.split(": ")[1] : "";
  };

  const updateTimeForDay = (day: string, newTime: string) => {
    const DAYS_ORDER = ["Du", "Se", "Chor", "Pay", "Ju", "Sha", "Yak"];
    const days = formData.days.split("-").filter(Boolean);
    let timeMap: any = {};
    
    if (formData.time && formData.time.includes(": ")) {
      formData.time.split(", ").forEach(p => {
        const [d, t] = p.split(": ");
        if (d && t) timeMap[d] = t;
      });
    }

    const firstDay = days[0];
    const isFirstDay = day === firstDay;
    const currentValAtDay = timeMap[day] || "---";
    
    // Auto-populate: if we're changing the first day AND either:
    // 1. All others are still '---' (fresh state)
    // 2. All others currently match the OLD value of the first day (sync state)
    const othersEmptyOrSame = days.slice(1).every(d => {
      const val = timeMap[d] || "---";
      return val === "---" || val === (timeMap[firstDay] || "---");
    });

    if (isFirstDay && othersEmptyOrSame) {
       days.forEach(d => { timeMap[d] = newTime; });
    } else {
       timeMap[day] = newTime;
    }

    const sortedDays = days.slice().sort((a, b) => DAYS_ORDER.indexOf(a) - DAYS_ORDER.indexOf(b));
    const newTimeStr = sortedDays.map(d => `${d}: ${timeMap[d] || "---"}`).join(", ");
    setFormData({ ...formData, time: newTimeStr });
  };

  const toggleStatus = (studentId: number) => {
    setAttendanceRecords(prev => prev.map(r => {
      if (r.studentId === studentId) {
        let nextStatus = "PRESENT";
        if (r.status === "PRESENT") nextStatus = "ABSENT";
        else if (r.status === "ABSENT") nextStatus = "EXCUSED";
        else nextStatus = "PRESENT";
        return { ...r, status: nextStatus };
      }
      return r;
    }));
  };

  const filteredGroups = groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()) || (g.course?.name || "").toLowerCase().includes(search.toLowerCase()));

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
          {isOwner && (
            <button
              onClick={() => { setIsEditing(false); setShowModal(true); }}
              className="bg-[var(--crm-accent)] hover:scale-105 transition-all text-white px-4 sm:px-10 h-10 sm:h-14 rounded-xl sm:rounded-[1.5rem] font-black text-[9px] sm:text-xs tracking-[0.1em] sm:tracking-[0.15em] flex items-center justify-center gap-1.5 sm:gap-3 shadow-2xl shadow-purple-600/30 active:scale-95 uppercase whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4 sm:w-5 sm:h-5 shadow-lg" />
              <span className="hidden xs:inline">Yangi Guruh</span>
              <span className="xs:hidden">Guruh</span>
            </button>
          )}
        </header>

        <section className="p-4 sm:p-12 max-w-7xl mx-auto min-h-screen pb-40 sm:pb-12">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 sm:gap-8 mb-10 sm:mb-16 px-2 sm:px-0">
            <div className="space-y-1">
              <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase leading-none italic opacity-20">Guruhlar</h1>
              <div className="flex items-center gap-3 sm:gap-4">
                <p className="text-[var(--crm-text-muted)] font-black text-[10px] sm:text-[10px] uppercase tracking-[0.2em] sm:tracking-[0.25em] opacity-60">Dars jadvali va nazorat</p>
                <span className="bg-[var(--crm-accent-soft)] text-[var(--crm-accent)] px-2.5 py-1 rounded-lg text-[10px] sm:text-[9px] font-black uppercase tracking-widest border border-[var(--crm-accent-soft)] shadow-sm">{filteredGroups.length} ta</span>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="w-16 h-16 border-[6px] border-[var(--crm-accent)]/10 border-t-[var(--crm-accent)] rounded-full animate-spin" />
            </div>
          ) : filteredGroups.length === 0 ? (
            <div className="p-32 text-center rounded-[4rem] bg-[var(--crm-card)] border border-[var(--crm-border)] relative overflow-hidden group shadow-2xl">
              <Users2 className="w-24 h-24 text-[var(--crm-text-muted)]/20 mx-auto mb-10" />
              <h3 className="text-3xl font-black mb-4 uppercase tracking-tighter">Guruhlar topilmadi</h3>
              <p className="text-[var(--crm-text-muted)] font-bold text-sm max-w-sm mx-auto opacity-60 italic">Hali birorta ham guruh ochilmagan yoki qidiruv natijasi mavjud emas.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
              {filteredGroups.map(group => (
                <motion.div
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={group.id}
                  className="bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[2.5rem] sm:rounded-[3.5rem] p-6 sm:p-10 hover:border-[var(--crm-accent)] transition-all shadow-[0_20px_60px_rgba(0,0,0,0.1)] group relative flex flex-col justify-between overflow-hidden active:scale-[0.98]"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--crm-accent)] opacity-[0.02] blur-[40px] -mr-16 -mt-16 rounded-full group-hover:opacity-[0.08] transition-all" />

                  <div>
                    <header className="flex items-center justify-between mb-6 sm:mb-8">
                      <div className="px-5 py-1.5 rounded-full bg-[var(--crm-accent-soft)] border border-[var(--crm-accent-soft)] text-[var(--crm-accent)] text-[10px] sm:text-[9px] font-black uppercase tracking-widest shadow-sm">
                        {group.course?.name || "YO'Q"}
                      </div>
                      <div className="flex items-center gap-2 text-[var(--crm-text-muted)] text-[11px] sm:text-[10px] font-black uppercase tracking-widest opacity-60">
                        <Users className="w-4 h-4 sm:w-4 h-4 text-[var(--crm-accent)]" />
                        {group._count?.students || 0}
                      </div>
                    </header>

                    <h3 className="text-2xl font-black mb-10 uppercase tracking-tighter leading-none group-hover:translate-x-2 transition-transform duration-500 line-clamp-2">
                      {group.name}
                    </h3>

                    <div className="space-y-4 mb-12">
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-xl bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] flex items-center justify-center text-[var(--crm-accent)]/60 shadow-inner">
                          <Briefcase className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[var(--crm-text-muted)] text-[10px] font-black uppercase tracking-[0.2em] block leading-none mb-1.5 opacity-50 italic">O'qituvchi</span>
                          <span className="text-[var(--crm-text)] text-sm font-bold truncate block">{group.teacher || "TAYINLANMAGAN"}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="w-10 h-10 rounded-xl bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] flex items-center justify-center text-[var(--crm-accent)]/60 shadow-inner">
                          <Clock className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <span className="text-[var(--crm-text-muted)] text-[10px] font-black uppercase tracking-[0.2em] block leading-none mb-1.5 opacity-50 italic">Dars Vaqti</span>
                          <span className="text-[var(--crm-text)] text-[11px] font-bold truncate block uppercase tracking-tighter">
                            {group.time && group.time.includes(": ") ? group.time : `${group.days} | ${group.time || "--:--"}`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 pt-6 border-t border-[var(--crm-border)] relative z-10 sm:translate-y-2 opacity-100 sm:opacity-0 sm:group-hover:translate-y-0 sm:group-hover:opacity-100 transition-all duration-300">
                    <button onClick={() => openAttendance(group)} className="flex-1 py-4 bg-[var(--crm-accent)] text-white rounded-2xl font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-all shadow-xl flex items-center justify-center gap-2">
                      <ClipboardList className="w-4 h-4" />
                      DAVOMAT
                    </button>
                    <div className="flex gap-2">
                      {isOwner && <button onClick={() => openEdit(group)} className="p-4 bg-[var(--crm-bg)] border border-[var(--crm-border)] text-blue-500 rounded-2xl flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all shadow-xl active:scale-95"><Edit3 className="w-5 h-5" /></button>}
                      {isOwner && <button onClick={() => deleteGroup(group.id)} className="p-4 bg-[var(--crm-bg)] border border-[var(--crm-border)] text-red-500 rounded-2xl flex items-center justify-center hover:bg-red-600 hover:text-white transition-all shadow-xl active:scale-95"><Trash2 className="w-5 h-5" /></button>}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </section>

      {/* Premium Group Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-md">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeModal} className="absolute inset-0 bg-black/70" />
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="w-full max-w-lg bg-[var(--crm-card)] border-t sm:border border-[var(--crm-border)] rounded-t-[2.5rem] sm:rounded-[4rem] p-6 sm:p-10 relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[92vh]">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--crm-accent)] opacity-5 blur-[120px] -mr-48 -mt-48 rounded-full" />

              <header className="mb-6 sm:mb-8 relative flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black tracking-tighter uppercase leading-none">{isEditing ? "Tahrirlash" : "Yangi Guruh"}</h2>
                  <p className="text-[7px] sm:text-[8px] font-black uppercase tracking-[0.2em] mt-1 italic opacity-60">Reja va jadval</p>
                </div>
                <button onClick={closeModal} className="p-3 bg-[var(--crm-bg)]/50 rounded-full hover:bg-white/10 text-[var(--crm-text-muted)] transition-all border border-[var(--crm-border)]">
                  <X className="w-5 h-5" />
                </button>
              </header>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 relative overflow-y-auto no-scrollbar pb-10">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[8px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2 opacity-50">Guruh Nomi</label>
                    <input type="text" placeholder="Matematika 1" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required className="w-full bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] rounded-2xl px-6 py-3.5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-xs font-bold shadow-inner transition-all" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2 opacity-50">O'qituvchi</label>
                    <div className="relative group">
                      <Users2 className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--crm-text-muted)] z-10" />
                      <select value={formData.teacher} onChange={(e) => setFormData({ ...formData, teacher: e.target.value })} className="w-full bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] rounded-2xl pl-12 pr-6 py-3.5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-[10px] font-bold shadow-inner appearance-none cursor-pointer transition-all">
                        <option value="" className={theme === 'dark' ? 'bg-black' : 'bg-white'}>USTOZNI TANLANG...</option>
                        {teachers.map(t => (
                          <option key={t.id} value={t.name} className={theme === 'dark' ? 'bg-black' : 'bg-white'}>
                            {t.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--crm-text-muted)] pointer-events-none" />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] ml-2 opacity-50">Kurs Tanlang</label>
                  <div className="relative group">
                    <Layers className="absolute left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--crm-text-muted)] z-10" />
                    <select value={formData.courseId} onChange={(e) => setFormData({ ...formData, courseId: e.target.value })} required className="w-full bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] rounded-2xl pl-12 pr-6 py-3.5 focus:border-[var(--crm-accent)] outline-none text-[var(--crm-text)] text-xs font-bold shadow-inner appearance-none cursor-pointer transition-all">
                      <option value="" className={theme === 'dark' ? 'bg-black' : 'bg-white'}>O'QUV YO'NALISHI...</option>
                      {courses.map(c => <option key={c.id} value={c.id} className={theme === 'dark' ? 'bg-black' : 'bg-white'}>{c.name}</option>)}
                    </select>
                    <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[var(--crm-text-muted)] pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between px-2">
                    <label className="text-[8px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.2em] opacity-50">Dars Kunlari</label>
                    <button type="button" onClick={() => setFormData({ ...formData, days: "" })} className="text-[7px] font-black uppercase text-red-500 hover:opacity-100 opacity-40 transition-opacity">Tozalash</button>
                  </div>
                  <div className="flex flex-wrap gap-1.5 p-3.5 bg-[var(--crm-bg)]/20 border border-[var(--crm-border)] rounded-xl shadow-inner backdrop-blur-md">
                    {["Du", "Se", "Chor", "Pay", "Ju", "Sha", "Yak"].map(day => {
                      const isActive = formData.days.split("-").includes(day);
                      return (
                        <button
                          key={day}
                          type="button"
                          onClick={() => {
                            const current = formData.days ? formData.days.split("-").filter(d => d !== "") : [];
                            let next;
                            if (isActive) {
                              next = current.filter(d => d !== day);
                            } else {
                              next = [...current, day];
                            }
                            setFormData({ ...formData, days: next.join("-") });
                          }}
                          className={`px-3 py-1.5 rounded-lg text-[8px] font-black uppercase tracking-widest transition-all duration-300 ${isActive ? 'bg-[var(--crm-accent)] text-white shadow-lg' : 'bg-[var(--crm-card)]/50 text-[var(--crm-text-muted)] border border-[var(--crm-border)] hover:border-[var(--crm-accent)]/30'}`}
                        >
                          {day}
                        </button>
                      );
                    })}
                  </div>
                </div>

                  <div className="flex items-center justify-between px-2">
                    <label className="text-[8px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] opacity-50 block">Dars Vaqtlari</label>
                    <button 
                      type="button" 
                      onClick={() => {
                        const days = formData.days.split("-").filter(Boolean);
                        if (days.length > 0) {
                          const firstTime = getTimeForDay(formData.time, days[0]);
                          if (firstTime && firstTime !== "---") {
                            const newTimeStr = days.map(d => `${d}: ${firstTime}`).join(", ");
                            setFormData({ ...formData, time: newTimeStr });
                          }
                        }
                      }}
                      className="text-[7px] font-black uppercase text-[var(--crm-accent)] hover:opacity-100 opacity-40 transition-opacity"
                    >
                      Barchaga
                    </button>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                    {formData.days.split("-").filter(Boolean).map(day => (
                      <div key={day} className="flex flex-col gap-0.5 p-2 bg-[var(--crm-bg)]/30 border border-[var(--crm-border)] rounded-lg shadow-inner backdrop-blur-sm focus-within:border-[var(--crm-accent)]/40 transition-all">
                        <span className="text-[6px] font-black uppercase text-[var(--crm-accent)] opacity-50 ml-1 tracking-widest">{day}</span>
                        <input 
                          type="time" 
                          value={getTimeForDay(formData.time, day) === "---" ? "" : getTimeForDay(formData.time, day)} 
                          onChange={(e) => updateTimeForDay(day, e.target.value)}
                          className="bg-transparent border-none outline-none text-[10px] font-bold text-[var(--crm-text)] w-full px-1 cursor-pointer" 
                        />
                      </div>
                    ))}
                    {formData.days === "" && (
                      <div className="col-span-full py-4 text-center border border-[var(--crm-border)] border-dashed rounded-xl italic text-[7px] text-[var(--crm-text-muted)] opacity-30 uppercase font-black">Kunlarni tanlang...</div>
                    )}
                  </div>

                <div className="flex gap-3 pt-4 shrink-0">
                  <button type="button" onClick={closeModal} className="flex-1 py-4 bg-[var(--crm-bg)]/50 border border-[var(--crm-border)] text-[var(--crm-text-muted)] rounded-2xl font-black text-[9px] uppercase tracking-widest hover:bg-[var(--crm-border)] transition-all">Bekor</button>
                  <button type="submit" className="flex-[2] py-4 bg-[var(--crm-accent)] text-white rounded-2xl font-black text-[9px] uppercase tracking-widest shadow-xl shadow-purple-600/20 hover:scale-[1.02] active:scale-95 transition-all">Saqlash</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAttendanceModal && (
          <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-6 backdrop-blur-md">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowAttendanceModal(false)} className="absolute inset-0 bg-black/70" />
            <motion.div initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }} className="w-full max-w-2xl bg-[var(--crm-card)] border-t sm:border border-[var(--crm-border)] rounded-t-[2.5rem] sm:rounded-[4rem] p-6 sm:p-12 relative z-10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col h-[92vh] sm:h-auto max-h-[92vh]">
              <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-[var(--crm-accent)] opacity-5 blur-[120px] -mr-48 -mt-48 rounded-full" />

              <header className="mb-6 sm:mb-8 relative flex items-center justify-between shrink-0">
                <div>
                  <h2 className="text-xl sm:text-3xl font-black tracking-tighter uppercase leading-none italic">{currentGroup?.name}</h2>
                  <p className="text-[var(--crm-text-muted)] text-[8px] sm:text-[9px] font-black uppercase tracking-[0.2em] mt-2 italic opacity-60">Davomat va jurnal</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setShowHistory(!showHistory)} className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl border transition-all ${showHistory ? 'bg-[var(--crm-accent)] text-white border-[var(--crm-accent)]' : 'bg-[var(--crm-bg)] text-[var(--crm-text-muted)] border-[var(--crm-border)]'}`}>
                    <History className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                  <button onClick={() => setShowAttendanceModal(false)} className="p-3 sm:p-4 bg-[var(--crm-bg)] rounded-full hover:bg-white/5 text-[var(--crm-text-muted)] border border-[var(--crm-border)]">
                    <X className="w-5 h-5 sm:w-6 sm:h-6" />
                  </button>
                </div>
              </header>

              <div className="flex-1 overflow-y-auto no-scrollbar py-2">
                {showHistory ? (
                  <div className="space-y-6">
                    <h3 className="text-sm font-black uppercase tracking-widest text-[var(--crm-accent)] mb-6 opacity-80">Oxirgi darslar</h3>
                    {attendanceHistory.length === 0 ? (
                      <div className="py-20 text-center opacity-30 italic font-bold">Tarix mavjud emas</div>
                    ) : (
                      Object.entries(attendanceHistory.reduce((acc: any, curr: any) => {
                        const d = new Date(curr.date).toLocaleDateString();
                        if (!acc[d]) acc[d] = [];
                        acc[d].push(curr);
                        return acc;
                      }, {})).map(([date, records]: [string, any]) => (
                        <div key={date} className="bg-[var(--crm-bg)]/50 rounded-3xl p-6 border border-[var(--crm-border)]">
                          <div className="flex items-center justify-between mb-4 pb-4 border-b border-[var(--crm-border)]/50">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--crm-text-muted)]">{date}</span>
                            <span className="text-[10px] font-black text-green-500 uppercase tracking-widest">Dars o'tilgan</span>
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            {records.map((r: any) => (
                              <div key={r.id} className="flex items-center gap-3">
                                                                <div className={`w-2 h-2 rounded-full ${
                                  r.status === 'PRESENT' ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 
                                  r.status === 'EXCUSED' ? 'bg-yellow-400 shadow-[0_0_8px_rgba(250,204,21,0.5)]' :
                                  'bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]'
                                }`} />
                                <span className="text-[10px] font-bold uppercase tracking-tight truncate">{r.student.name}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                ) : (
                  <div className="space-y-8">
                    <div className="flex items-center gap-4 bg-[var(--crm-bg)] p-6 rounded-3xl border border-[var(--crm-border)] shadow-inner">
                      <Calendar className="w-5 h-5 text-[var(--crm-accent)]" />
                      <div className="flex-1">
                        <span className="text-[8px] font-black uppercase tracking-widest text-[var(--crm-text-muted)] block mb-1">Dars sanasi</span>
                        <input type="date" value={attendanceDate} onChange={(e) => setAttendanceDate(e.target.value)} className="bg-transparent border-none outline-none font-black text-sm text-[var(--crm-text)] w-full" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[var(--crm-text-muted)] ml-2">Talabalar ro'yxati</h3>
                      {attendanceRecords.map(record => (
                        <div key={record.studentId} onClick={() => toggleStatus(record.studentId)} className={`flex items-center justify-between p-5 rounded-[1.5rem] border transition-all cursor-pointer group active:scale-[0.98] ${
                                                    record.status === 'PRESENT' ? 'bg-green-500/5 border-green-500/20' : 
                          record.status === 'EXCUSED' ? 'bg-yellow-400/5 border-yellow-400/20' :
                          'bg-red-500/5 border-red-500/20'
                        }`}>
                          <div className="flex items-center gap-4">
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs transition-all ${
                                                            record.status === 'PRESENT' ? 'bg-green-500 text-white shadow-lg shadow-green-500/20' : 
                              record.status === 'EXCUSED' ? 'bg-yellow-400 text-white shadow-lg shadow-yellow-400/20' :
                              'bg-red-500 text-white shadow-lg shadow-red-500/20'
                            }`}>
                              {record.name[0]}
                            </div>
                            <div className="flex flex-col">
                              <span className="text-xs font-black uppercase tracking-tighter truncate max-w-[150px]">{record.name}</span>
                              {record.status === "EXCUSED" && record.reason && (
                                                                <span className="text-[7px] font-black text-yellow-400/60 uppercase tracking-widest mt-1 italic">{record.reason}</span>
                              )}
                            </div>
                          </div>
                          <div className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${
                                                        record.status === 'PRESENT' ? 'bg-green-500/10 text-green-500' : 
                            record.status === 'EXCUSED' ? 'bg-yellow-400/10 text-yellow-400' :
                            'bg-red-500/10 text-red-500'
                          }`}>
                            {record.status === 'PRESENT' ? 'KELDI' : record.status === 'EXCUSED' ? 'SABABLI' : 'KELMADI'}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-8 pt-8 border-t border-[var(--crm-border)] shrink-0">
                {!showHistory && (
                  <button onClick={saveAttendance} className="w-full py-5 bg-[var(--crm-accent)] text-white rounded-[1.8rem] font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-purple-600/30 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-4">
                    <Check className="w-5 h-5" />
                    DAVOMATNI SAQLASH
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

        <ConfirmDialog 
            isOpen={showDeleteConfirm}
            onClose={() => setShowDeleteConfirm(false)}
            onConfirm={confirmDelete}
            loading={deleting}
            title="Guruhni o'chirish?"
            message="Ushbu guruh va uning barcha davomat ma'lumotlari butunlay o'chiriladi."
            confirmText="Ha, o'chirish"
            type="danger"
        />
    </>
  );
}
