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
import { Sidebar } from "@/components/Sidebar";
import { API_BASE_URL } from "@/app/constants";

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

    useEffect(() => {
        const userData = localStorage.getItem("center_user");
        if (!userData) {
            router.push("/login");
        } else {
            setCenterUser(JSON.parse(userData));
            fetchStudent();
        }
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
        <div className="min-h-screen bg-[var(--crm-bg)] text-[var(--crm-text)] flex font-sans selection:bg-purple-500/30">
            <Sidebar centerName={centerUser?.centerName} role={centerUser?.role} />

            <main className="flex-1 min-w-0 pb-32 sm:pb-0">
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
                                                        </td>
                                                        <td className="px-8 py-6">
                                                            <div className="text-[10px] font-black text-[var(--crm-text-muted)] uppercase tracking-widest truncate max-w-[150px]">{p.comment || "Xizmat uchun to'lov"}</div>
                                                        </td>
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
                </div>
            </main>
        </div>
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
