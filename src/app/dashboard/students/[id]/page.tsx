"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { 
  User, 
  Phone, 
  MapPin, 
  Calendar, 
  BookOpen, 
  CreditCard, 
  ChevronLeft,
  Clock,
  TrendingUp,
  TrendingDown,
  ShieldCheck,
  Zap,
  PhoneCall
} from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeContext";
import { API_BASE_URL } from "@/app/constants";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { Edit2, Trash2, X } from "lucide-react";

const formatMoney = (val: any) => {
    if (!val && val !== 0) return "0";
    return Number(val).toLocaleString("ru-RU").replace(/,/g, " ");
};

const formatPhone = (val: string) => {
    const raw = (val || "").replace(/\D/g, "");
    if (!raw) return "";
    if (raw.startsWith("998") && raw.length >= 12) {
        return `+998 ${raw.slice(3, 5)} ${raw.slice(5, 8)} ${raw.slice(8, 10)} ${raw.slice(10, 12)}`;
    }
    if (raw.length === 9) {
        return `+998 ${raw.slice(0, 2)} ${raw.slice(2, 5)} ${raw.slice(5, 7)} ${raw.slice(7, 9)}`;
    }
    return "+" + raw;
};

const formatDateUz = (dateStr: string) => {
    if (!dateStr) return "";
    const date = new Date(dateStr);
    const months = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];
    return `${date.getDate()}-${months[date.getMonth()]}, ${date.getFullYear()}`;
};

export default function StudentProfilePage() {
    const { id } = useParams();
    const router = useRouter();
    const [student, setStudent] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [centerUser, setCenterUser] = useState<any>(null);
    const { theme } = useTheme();

    // Edit Payment State
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingPayment, setEditingPayment] = useState<any>(null);
    const [editForm, setEditForm] = useState({
        amount: "",
        paymentType: "CASH",
        notes: "",
        periodFrom: "",
        periodTo: ""
    });
    const [updating, setUpdating] = useState(false);

    // Delete Payment State
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [itemToDelete, setItemToDelete] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);

    // Toast/Status State
    const [showStatus, setShowStatus] = useState(false);
    const [statusTitle, setStatusTitle] = useState("");
    const [statusMessage, setStatusMessage] = useState("");
    const [statusType, setStatusType] = useState<"success" | "danger" | "warning" | "info">("info");

    const isAuthorized = centerUser?.role === 'OWNER' || centerUser?.role === 'SUPER_ADMIN';

    const fetchStudent = async () => {
        const token = localStorage.getItem("access_token");
        try {
            const res = await fetch(`${API_BASE_URL}/students/${id}`, {
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStudent(data);
            } else {
                router.push("/dashboard/students");
            }
        } catch (err) {
            console.error("Fetch student failed", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditClick = (p: any) => {
        setEditingPayment(p);
        setEditForm({
            amount: p.amount.toString(),
            paymentType: p.paymentType || "CASH",
            notes: p.notes || "",
            periodFrom: p.periodFrom ? new Date(p.periodFrom).toISOString().split('T')[0] : "",
            periodTo: p.periodTo ? new Date(p.periodTo).toISOString().split('T')[0] : ""
        });
        setShowEditModal(true);
    };

    const handleUpdatePayment = async (e: React.FormEvent) => {
        e.preventDefault();
        setUpdating(true);
        const token = localStorage.getItem("access_token");
        try {
            const res = await fetch(`${API_BASE_URL}/payments/${editingPayment.id}`, {
                method: "PUT",
                headers: { 
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}` 
                },
                body: JSON.stringify(editForm)
            });
            if (res.ok) {
                fetchStudent();
                setShowEditModal(false);
                setStatusTitle("Muvaffaqiyat!");
                setStatusMessage("To'lov ma'lumotlari yangilandi");
                setStatusType("success");
                setShowStatus(true);
            } else {
                const err = await res.json();
                setStatusTitle("Xatolik!");
                setStatusMessage(err.message || "Tahrirlashda xato yuz berdi");
                setStatusType("danger");
                setShowStatus(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setUpdating(false);
        }
    };

    const handleDeleteClick = (pid: number) => {
        setItemToDelete(pid);
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        if (!itemToDelete) return;
        setDeleting(true);
        const token = localStorage.getItem("access_token");
        try {
            const res = await fetch(`${API_BASE_URL}/payments/${itemToDelete}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            if (res.ok) {
                fetchStudent();
                setShowDeleteConfirm(false);
                setStatusTitle("O'chirildi");
                setStatusMessage("To'lov o'chirib tashlandi");
                setStatusType("success");
                setShowStatus(true);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setDeleting(false);
        }
    };

    useEffect(() => {
        const userData = localStorage.getItem("center_user");
        if (userData) setCenterUser(JSON.parse(userData));
        fetchStudent();
    }, [id]);

    if (loading) return (
        <div className="min-h-screen bg-[var(--crm-bg)] flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin" />
        </div>
    );

    if (!student) return null;

    const totalPaid = student.payments?.reduce((acc: number, p: any) => acc + p.amount, 0) || 0;
    const balance = 0; // Simplified for now

    return (
        <>
                <header className="min-h-[60px] sm:min-h-24 border-b border-[var(--crm-border)] flex items-center px-4 sm:px-10 bg-[var(--crm-sidebar)]/50 backdrop-blur-xl sticky top-0 z-40 gap-4 sm:gap-6 py-2 sm:py-0">
                    <button onClick={() => router.back()} className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-[var(--crm-bg)] border border-[var(--crm-border)] flex items-center justify-center hover:bg-[var(--crm-accent)] hover:text-white transition-all shadow-lg active:scale-95 group shrink-0">
                        <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="flex flex-col items-start mr-auto">
                        <h1 className="text-xl sm:text-4xl font-black tracking-tighter uppercase leading-none italic opacity-10">Profil</h1>
                        <p className="hidden sm:block text-[9px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.25em] mt-1 opacity-60">Talaba Shaxsiy Kartochkasi</p>
                    </div>
                </header>

                <div className="p-4 sm:p-12 max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
                        
                        {/* Left Column: Essential Info */}
                        <div className="space-y-8 sm:space-y-12">
                            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[3rem] p-8 sm:p-12 relative overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.1)] group">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--crm-accent)] opacity-5 blur-[40px] -mr-16 -mt-16 rounded-full" />
                                
                                <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-[var(--crm-accent)] to-indigo-600 rounded-[2.5rem] flex items-center justify-center text-4xl sm:text-5xl font-black text-white shadow-2xl shadow-purple-600/30 mb-8 mx-auto relative group-hover:scale-105 transition-transform duration-500">
                                    {student.name[0]}
                                    <div className="absolute -bottom-2 -right-2 w-8 h-8 sm:w-10 sm:h-10 bg-green-500 border-4 border-[var(--crm-card)] rounded-full shadow-lg" />
                                </div>

                                <div className="text-center space-y-2 mb-10">
                                    <h2 className="text-3xl sm:text-4xl font-black tracking-tighter uppercase italic leading-none">{student.name}</h2>
                                    <p className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-widest opacity-60">{student.status === 'Active' ? 'Faol Talaba' : 'Arxivda'}</p>
                                </div>

                                <div className="space-y-6">
                                    <InfoItem icon={<Phone className="w-4 h-4" />} label="Telefon" value={formatPhone(student.phone)} link={`tel:${student.phone}`} />
                                    <InfoItem icon={<User className="w-4 h-4 ml-0.5" />} label="Ota-Onasi (Raqam)" value={formatPhone(student.parentPhone)} link={`tel:${student.parentPhone}`} />
                                    <InfoItem icon={<Calendar className="w-4 h-4" />} label="Tug'ilgan sana" value={student.dob ? formatDateUz(student.dob) : "Ko'rsatilmagan"} />
                                    <InfoItem icon={<MapPin className="w-4 h-4" />} label="Manzil" value={student.address || "Manzil yo'q"} />
                                    <InfoItem 
                                        icon={<PhoneCall className="w-4 h-4" />} 
                                        label="Telegram" 
                                        value={student.telegramId ? `@${student.telegramId}` : "Ulanmagan"} 
                                        link={student.telegramId ? (isNaN(student.telegramId) ? `https://t.me/${student.telegramId.replace('@', '')}` : `tg://user?id=${student.telegramId}`) : undefined}
                                    />
                                </div>
                            </motion.div>

                            <div className="grid grid-cols-2 gap-4">
                                <QuickStat icon={<TrendingUp className="w-4 h-4" />} label="To'langan" value={formatMoney(totalPaid)} color="green-500" />
                                <QuickStat icon={<CreditCard className="w-4 h-4" />} label="Balans" value={formatMoney(balance)} color="purple-500" />
                            </div>
                        </div>

                        {/* Right Column: Dynamic Data */}
                        <div className="lg:col-span-2 space-y-8 sm:space-y-12">
                            
                            {/* Courses and Groups */}
                            <section>
                                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic opacity-80 flex items-center gap-3 mb-6 sm:mb-8">
                                    <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-[var(--crm-accent)]" />
                                    O'quv Faoliyati
                                </h3>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                    {student.groups?.map((g: any) => (
                                        <div key={g.id} className="bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[2rem] p-6 sm:p-8 hover:border-[var(--crm-accent)]/50 transition-all group active:scale-[0.98] shadow-[0_15px_40px_rgba(0,0,0,0.05)]">
                                            <div className="flex items-center justify-between mb-6">
                                                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-[var(--crm-accent-soft)] flex items-center justify-center text-[var(--crm-accent)] shadow-inner">
                                                    <BookOpen className="w-5 h-5" />
                                                </div>
                                                <span className="text-[8px] font-black uppercase text-green-500 bg-green-500/10 px-3 py-1 rounded-full">{g.course?.name || "Kurs"}</span>
                                            </div>
                                            <h4 className="text-xl sm:text-2xl font-black uppercase tracking-tighter leading-none mb-1">{g.name}</h4>
                                            <p className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-widest opacity-60">Dushanba - Chorshanba - Juma</p>
                                        </div>
                                    ))}
                                    {(!student.groups || student.groups.length === 0) && (
                                        <div className="col-span-2 p-12 text-center rounded-[2.5rem] bg-[var(--crm-card)] border border-dashed border-[var(--crm-border)] opacity-30 italic font-black uppercase text-[10px] tracking-widest">
                                            Guruhlarga biriktirilmagan
                                        </div>
                                    )}
                                </div>
                            </section>

                            {/* Payments History */}
                            <section>
                                <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic opacity-80 flex items-center gap-3 mb-6 sm:mb-8">
                                    <TrendingUp className="w-5 h-5 sm:w-6 sm:h-6 text-green-500" />
                                    To'lovlar Tarixi
                                </h3>
                                <div className="bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[2.5rem] sm:rounded-[3.5rem] overflow-hidden shadow-[0_30px_100px_rgba(0,0,0,0.1)]">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-[var(--crm-bg)]/50 border-b border-[var(--crm-border)]">
                                                    <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest opacity-50">Sana</th>
                                                    <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest opacity-50">Summa</th>
                                                    <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest opacity-50">Izoh</th>
                                                    {isAuthorized && <th className="px-8 py-6 text-[9px] font-black uppercase tracking-widest opacity-50 text-right">Amallar</th>}
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-[var(--crm-border)]">
                                                {student.payments?.map((p: any) => (
                                                    <tr key={p.id} className="hover:bg-white/5 transition-colors group">
                                                        <td className="px-8 py-6 whitespace-nowrap">
                                                            <div className="text-xs font-black tracking-tight">{formatDateUz(p.createdAt)}</div>
                                                            <div className="text-[9px] text-[var(--crm-text-muted)] font-black uppercase opacity-40 italic">{new Date(p.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="text-sm font-black text-green-500 tracking-tighter italic">+ {formatMoney(p.amount)} sum</div>
                                                            <div className="text-[7px] font-black uppercase tracking-widest opacity-40">{p.paymentType}</div>
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="text-[10px] font-black text-[var(--crm-text-muted)] uppercase tracking-widest truncate max-w-[150px]">{p.notes || "Xizmat uchun to'lov"}</div>
                                                        </td>
                                                        {isAuthorized && (
                                                            <td className="px-8 py-6 text-right">
                                                                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                    <button onClick={() => handleEditClick(p)} className="p-2 rounded-lg bg-blue-500/10 text-blue-500 hover:bg-blue-500 hover:text-white transition-all">
                                                                        <Edit2 className="w-3 h-3" />
                                                                    </button>
                                                                    <button onClick={() => handleDeleteClick(p.id)} className="p-2 rounded-lg bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white transition-all">
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                </div>
                                                            </td>
                                                        )}
                                                    </tr>
                                                ))}
                                                {(!student.payments || student.payments.length === 0) && (
                                                    <tr>
                                                        <td colSpan={3} className="px-8 py-16 text-center text-[10px] font-black uppercase tracking-widest opacity-30 italic">Hali to'lovlar amalga oshirilmagan</td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </section>

                        </div>
                                </div>
                            </section>

                        </div>

                    </div>
                </div>

                {/* Edit Payment Modal */}
                {showEditModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-md">
                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-black/70" onClick={() => setShowEditModal(false)} />
                        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-md bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[3rem] p-10 relative z-10 shadow-[0_30px_100px_rgba(0,0,0,0.5)]">
                            <h3 className="text-3xl font-black uppercase tracking-tighter italic mb-8">To&apos;lovni tahrirlash</h3>
                            
                            <form onSubmit={handleUpdatePayment} className="space-y-6">
                                <div>
                                    <label className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 ml-4 mb-2 block">Summa (UZS)</label>
                                    <input 
                                        type="number" 
                                        value={editForm.amount} 
                                        onChange={e => setEditForm({...editForm, amount: e.target.value})}
                                        className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-2xl px-6 py-4 font-black text-sm outline-none focus:border-[var(--crm-accent)] transition-all"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 ml-4 mb-2 block">To&apos;lov turi</label>
                                    <select 
                                        value={editForm.paymentType}
                                        onChange={e => setEditForm({...editForm, paymentType: e.target.value})}
                                        className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-2xl px-6 py-4 font-black text-sm outline-none focus:border-[var(--crm-accent)] transition-all"
                                    >
                                        <option value="CASH">NAQD</option>
                                        <option value="CARD">PLASTIK (CARD)</option>
                                        <option value="TRANSFER">PERECHISLENIYE</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-[8px] font-black uppercase tracking-[0.2em] opacity-40 ml-4 mb-2 block">Izoh</label>
                                    <input 
                                        type="text" 
                                        value={editForm.notes} 
                                        onChange={e => setEditForm({...editForm, notes: e.target.value})}
                                        className="w-full bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-2xl px-6 py-4 font-black text-sm outline-none focus:border-[var(--crm-accent)] transition-all"
                                        placeholder="To'lov haqida qo'shimcha ma'lumot..."
                                    />
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" onClick={() => setShowEditModal(false)} className="flex-1 py-4 bg-[var(--crm-bg)] text-[var(--crm-text-muted)] rounded-2xl font-black text-[10px] uppercase tracking-widest border border-[var(--crm-border)] hover:bg-[var(--crm-border)] transition-all">Bekor qilish</button>
                                    <button type="submit" disabled={updating} className="flex-1 py-4 bg-[var(--crm-accent)] text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-purple-600/30 hover:scale-[1.02] active:scale-95 transition-all">
                                        {updating ? "Saqlanmoqda..." : "Saqlash"}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}

                <ConfirmDialog 
                    isOpen={showDeleteConfirm}
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={confirmDelete}
                    loading={deleting}
                    title="To'lovni o'chirish?"
                    message="Ushbu to'lov ma'lumotlari butunlay o'chiriladi. Balansga ta'sir qilishi mumkin."
                />

                <ConfirmDialog 
                    isOpen={showStatus}
                    onClose={() => setShowStatus(false)}
                    onConfirm={() => setShowStatus(false)}
                    title={statusTitle}
                    message={statusMessage}
                    type={statusType}
                    isAlert={true}
                />
        </>
    );
}

function InfoItem({ icon, label, value, link }: any) {
    const content = (
        <div>
            <div className="text-[8px] text-[var(--crm-text-muted)] font-black uppercase tracking-widest opacity-40 mb-1">{label}</div>
            <div className={`text-sm font-black tracking-tight ${link ? 'text-[var(--crm-accent)] hover:underline' : ''}`}>{value}</div>
        </div>
    );

    return (
        <div className="flex items-center gap-6 p-1 group/item">
            <div className="w-10 h-10 rounded-xl bg-[var(--crm-bg)] border border-[var(--crm-border)] flex items-center justify-center text-[var(--crm-text-muted)] group-hover/item:text-[var(--crm-accent)] group-hover/item:border-[var(--crm-accent)]/50 transition-all shadow-inner shrink-0">
                {icon}
            </div>
            {link ? (
                <a href={link} target={link.startsWith('http') ? '_blank' : undefined} rel="noreferrer">
                    {content}
                </a>
            ) : content}
        </div>
    );
}

function QuickStat({ icon, label, value, color }: any) {
    return (
        <div className={`p-6 bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[2rem] shadow-xl hover:border-${color}/30 transition-all group`}>
            <div className={`w-10 h-10 rounded-xl bg-[var(--crm-bg)] flex items-center justify-center text-${color} mb-4 shadow-inner group-hover:scale-110 transition-transform`}>
                {icon}
            </div>
            <div className="text-[8px] text-[var(--crm-text-muted)] font-black uppercase tracking-widest opacity-40 mb-1">{label}</div>
            <div className={`text-xl font-black tracking-tighter truncate text-${color} italic`}>{value}</div>
        </div>
    );
}
