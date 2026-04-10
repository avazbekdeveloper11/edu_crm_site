"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { 
  Users, 
  TrendingUp, 
  TrendingDown, 
  AlertCircle,
  Calendar,
  Wallet,
  ArrowUpRight,
  Plus,
  LayoutDashboard,
  ShieldCheck,
  Zap,
  ArrowRight
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "@/components/ThemeContext";
import { API_BASE_URL } from "@/app/constants";

const formatMoney = (val: any) => {
    if (!val && val !== 0) return "";
    return Number(val).toLocaleString("ru-RU").replace(/,/g, " ");
};

export default function CenterDashboard() {
  const router = useRouter();
  const [center, setCenter] = useState<any>(null);
  const [stats, setStats] = useState({
    students: 0,
    courses: 0,
    groups: 0,
    totalIncome: 0,
    todayIncome: 0,
    totalDebt: 0,
    debtors: [] as any[],
    allPayments: [] as any[]
  });
  const [viewPeriod, setViewPeriod] = useState<"DAY" | "MONTH" | "YEAR">("MONTH");
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("");
  const { theme } = useTheme();

  const chartData = useMemo(() => {
    const pays = stats.allPayments || [];
    const monthsLabels = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    const daysLabels = ["YAK", "DUSH", "SESH", "CHORS", "PAY", "JUM", "SHAN"];

    if (viewPeriod === "DAY") {
        return Array(7).fill(0).map((_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - (6 - i));
            const dateStr = d.toDateString();
            const sum = pays.filter((p: any) => new Date(p.createdAt).toDateString() === dateStr)
                            .reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
            return { month: daysLabels[d.getDay()], amount: sum };
        });
    }

    if (viewPeriod === "MONTH") {
        return Array(6).fill(0).map((_, i) => {
            const d = new Date();
            d.setMonth(d.getMonth() - (5 - i));
            const mIdx = d.getMonth();
            const year = d.getFullYear();
            const sum = pays.filter((p: any) => {
                const pd = new Date(p.createdAt);
                return pd.getMonth() === mIdx && pd.getFullYear() === year;
            }).reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
            return { month: monthsLabels[mIdx], amount: sum };
        });
    }

    return Array(12).fill(0).map((_, i) => {
        const d = new Date();
        d.setMonth(d.getMonth() - (11 - i));
        const mIdx = d.getMonth();
        const year = d.getFullYear();
        const sum = pays.filter((p: any) => {
            const pd = new Date(p.createdAt);
            return pd.getMonth() === mIdx && pd.getFullYear() === year;
        }).reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
        return { month: monthsLabels[mIdx], amount: sum };
    });
  }, [stats.allPayments, viewPeriod]);

  const monthlyIncomeTotal = useMemo(() => {
    return stats.allPayments.filter((p: any) => {
        const d = new Date(p.createdAt);
        return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    }).reduce((acc: number, p: any) => acc + (p.amount || 0), 0);
  }, [stats.allPayments, selectedMonth, selectedYear]);

  const monthsUZ = ["Yanvar", "Fevral", "Mart", "Aprel", "May", "Iyun", "Iyul", "Avgust", "Sentabr", "Oktabr", "Noyabr", "Dekabr"];

  const changeMonth = (dir: number) => {
    let newMonth = selectedMonth + dir;
    let newYear = selectedYear;
    if (newMonth > 11) { newMonth = 0; newYear++; }
    if (newMonth < 0) { newMonth = 11; newYear--; }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const fetchStats = async () => {
    const token = localStorage.getItem("access_token");
    try {
       const [stdRes, crsRes, grpRes, payRes] = await Promise.all([
        fetch(`${API_BASE_URL}/students`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/courses`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/groups`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/payments`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);

      const rawStds = await stdRes.json();
      const rawCrss = await crsRes.json();
      const rawGrps = await grpRes.json();
      const rawPays = await payRes.json();

      const stds = Array.isArray(rawStds) ? rawStds : [];
      const crss = Array.isArray(rawCrss) ? rawCrss : [];
      const grps = Array.isArray(rawGrps) ? rawGrps : [];
      const pays = Array.isArray(rawPays) ? rawPays : [];

      const calculateDebt = (s: any) => {
        if (!s || (s.courses || []).length === 0) return 0;
        const joinDate = new Date(s.createdAt);
        const currentDate = new Date();
        const monthsDiff = (currentDate.getFullYear() - joinDate.getFullYear()) * 12 + (currentDate.getMonth() - joinDate.getMonth()) + 1;
        
        let totalCost = 0;
        (s.courses || []).forEach((c: any) => {
            totalCost += (c.price || 0) * monthsDiff;
        });

        const totalPaid = s.payments?.reduce((accValue: number, p: any) => accValue + (p.amount || 0), 0) || 0;
        return Math.max(0, totalCost - totalPaid);
      };

      const totalDebt = stds.reduce((accValue: number, s: any) => accValue + calculateDebt(s), 0);
      const totalIncome = pays.reduce((accValue: number, p: any) => accValue + (p.amount || 0), 0);
      const tomorrow = new Date();
      tomorrow.setHours(0,0,0,0);
      const todayIncome = pays.filter((p: any) => {
          const pd = new Date(p.createdAt);
          return pd.toDateString() === new Date().toDateString();
      }).reduce((accValue: number, p: any) => accValue + (p.amount || 0), 0);

      const debtors = stds.filter((s: any) => calculateDebt(s) > 0);

      setStats({
        students: stds.length,
        courses: rawCrss.length,
        groups: grps.length,
        totalIncome: totalIncome,
        todayIncome: todayIncome,
        totalDebt: totalDebt,
        debtors: debtors,
        allPayments: pays
      });
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
    fetchStats();
  }, []);

  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return (
    <div className="min-h-screen bg-[var(--crm-bg)] flex items-center justify-center">
      <div className="w-12 h-12 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <>
        <header className="min-h-[60px] sm:min-h-24 border-b border-[var(--crm-border)] flex items-center justify-between px-4 sm:px-10 bg-[var(--crm-sidebar)]/50 backdrop-blur-xl sticky top-0 z-40 py-2 sm:py-0 gap-4">
          <div className="flex flex-col items-start">
              <h1 className="text-xl sm:text-5xl font-black tracking-tighter uppercase leading-none italic opacity-10">Boshqaruv</h1>
              <p className="hidden sm:block text-[var(--crm-text-muted)] text-[9px] font-black uppercase tracking-[0.25em] mt-1 opacity-60">Monitoring va KPI</p>
          </div>
          <div className="flex items-center gap-3 sm:gap-6">
              <div className="flex flex-col items-end">
                  <span className="text-[7px] sm:text-[9px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.2em] opacity-60 leading-none mb-0.5">Holat</span>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] sm:text-xs font-black text-green-500 tracking-tighter uppercase italic">ONLINE</span>
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_rgba(34,197,94,0.5)]" />
                  </div>
              </div>
              <div className="w-8 h-8 sm:w-12 sm:h-12 rounded-lg sm:rounded-[1.25rem] bg-[var(--crm-accent-soft)] border border-[var(--crm-accent-soft)] flex items-center justify-center text-[var(--crm-accent)] shadow-xl shrink-0">
                  <LayoutDashboard className="w-4 h-4 sm:w-6 sm:h-6" />
              </div>
          </div>
        </header>

        <section className="p-4 sm:p-12 max-w-7xl mx-auto min-h-screen">
          {/* KPI Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12 sm:mb-16">
            <StatCard 
                icon={<TrendingUp className="w-5 h-5 sm:w-6 h-6" />} 
                label={`Oylik Tushum`} 
                value={`${formatMoney(monthlyIncomeTotal)}`} 
                unit="UZS" 
                color="green-500" 
                trend="+12.5%"
                onClick={() => router.push("/dashboard/payments")}
                action={(
                    <div className="flex items-center gap-1">
                        <button onClick={(e) => { e.stopPropagation(); changeMonth(-1); }} className="w-6 h-6 rounded-lg bg-[var(--crm-bg)] flex items-center justify-center hover:bg-[var(--crm-accent)] hover:text-white transition-all text-[8px] text-[var(--crm-text-muted)]">{"<"}</button>
                        <button onClick={(e) => { e.stopPropagation(); changeMonth(1); }} className="w-6 h-6 rounded-lg bg-[var(--crm-bg)] flex items-center justify-center hover:bg-[var(--crm-accent)] hover:text-white transition-all text-[8px] text-[var(--crm-text-muted)]">{">"}</button>
                    </div>
                )}
            />
            <StatCard 
                icon={<Zap className="w-5 h-5 sm:w-6 h-6" />} 
                label="Bugungi Tushum" 
                value={`${formatMoney(stats.todayIncome)}`} 
                unit="UZS" 
                color="blue-500" 
                trend="+5.2%" 
                onClick={() => router.push("/dashboard/payments")}
            />
            <StatCard 
                icon={<Users className="w-5 h-5 sm:w-6 h-6" />} 
                label="Jami Talabalar" 
                value={stats.students} 
                color="purple-600" 
                trend="+24 ta" 
                onClick={() => router.push("/dashboard/students")}
            />
            <StatCard 
                icon={<Calendar className="w-5 h-5 sm:w-6 h-6" />} 
                label="Faol Guruhlar" 
                value={stats.groups} 
                color="orange-500" 
                trend="0" 
                onClick={() => router.push("/dashboard/groups")}
            />
          </div>

          <div className="space-y-6 sm:space-y-8 mb-12 sm:mb-16">
            <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic opacity-80 flex items-center gap-3">
                <Zap className="w-5 h-5 sm:w-6 h-6 text-yellow-500" />
                Tezkor Amallar
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <QuickAction icon={<Plus className="w-5 h-5" />} label="Yangi Talaba" href="/dashboard/students" />
                <QuickAction icon={<Wallet className="w-5 h-5" />} label="To'lov Qabul" href="/dashboard/payments" />
                <QuickAction icon={<LayoutDashboard className="w-5 h-5" />} label="Guruh Boshqaruvi" href="/dashboard/groups" />
            </div>
          </div>


          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 sm:gap-12">
            {/* Debtors List */}
            <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                <header className="flex items-center justify-between px-2 sm:px-0">
                    <h2 className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic opacity-80 flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 sm:w-6 h-6 text-red-500" />
                        Muhim Ogohlantirishlar
                    </h2>
                    <span className="text-[7px] sm:text-[9px] font-black text-red-500 bg-red-500/10 border border-red-500/10 px-3 sm:px-4 py-1 sm:py-1.5 rounded-full uppercase tracking-widest">{stats.debtors.length} ta</span>
                </header>

                <div className="space-y-4">
                  {loading ? (
                    <div className="py-20 flex justify-center">
                        <div className="w-10 h-10 border-4 border-[var(--crm-accent)]/10 border-t-[var(--crm-accent)] rounded-full animate-spin" />
                    </div>
                  ) : stats.debtors.length > 0 ? (
                    stats.debtors.slice(0, 6).map((debtor: any) => {
                        const debt = (debtor.courses || []).reduce((acc: number, c: any) => {
                            const joinDate = new Date(debtor.createdAt);
                            const currentDate = new Date();
                            const monthsDiff = (currentDate.getFullYear() - joinDate.getFullYear()) * 12 + (currentDate.getMonth() - joinDate.getMonth()) + 1;
                            return acc + ((c.price || 0) * monthsDiff);
                        }, 0) - (debtor.payments?.reduce((acc: any, p: any) => acc + p.amount, 0) || 0);

                        return (
                            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} key={debtor.id} className="bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[2rem] sm:rounded-[2.5rem] p-4 sm:p-8 flex flex-col sm:flex-row sm:items-center justify-between group hover:border-red-500/30 shadow-[0_15px_40px_rgba(0,0,0,0.05)] active:scale-[0.99] relative overflow-hidden gap-4 sm:gap-0">
                                <div className="absolute top-0 right-0 w-24 h-24 bg-red-500 opacity-0 blur-[30px] -mr-12 -mt-12 rounded-full group-hover:opacity-[0.05]" />
                                <div className="flex items-center gap-4 sm:gap-6">
                                    <div className="w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-[1.25rem] bg-[var(--crm-error-soft)] border border-[var(--crm-error-soft)] flex items-center justify-center font-black text-red-500 group-hover:bg-red-500 group-hover:text-white shadow-lg capitalize text-sm sm:text-base">
                                        {debtor.name[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="text-lg sm:text-xl font-black text-[var(--crm-text)] tracking-tighter leading-none mb-1 group-hover:text-red-500 truncate">{debtor.name}</div>
                                        <div className="text-[8px] sm:text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-widest opacity-60 flex items-center gap-1 sm:gap-2">
                                            {debtor.phone}
                                            <div className="w-0.5 h-0.5 sm:w-1 sm:h-1 rounded-full bg-[var(--crm-border)]" />
                                            {(debtor.courses || []).length} ta kurs
                                        </div>
                                    </div>
                                </div>
                                <div className="text-left sm:text-right flex flex-col sm:items-end">
                                    <div className="text-xl sm:text-2xl font-black text-red-500 tracking-tighter leading-none mb-1 flex items-center gap-2">
                                       <span className="text-[10px] opacity-40">-</span>
                                       {formatMoney(Math.abs(debt))}
                                       <span className="text-[8px] sm:text-[9px] font-bold opacity-30 text-[var(--crm-text)] uppercase">UZS</span>
                                    </div>
                                    <Link href="/dashboard/students" className="text-[7px] sm:text-[8px] font-black uppercase text-[var(--crm-text-muted)] hover:text-red-500 transition-all tracking-widest flex items-center gap-2 group/link">
                                       TO'LOVGA O'TISH 
                                       <ArrowRight className="w-3 h-3 group-hover/link:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </motion.div>
                        );
                    })
                  ) : (
                    <div className="p-20 text-center rounded-[3.5rem] bg-[var(--crm-card)] border border-dashed border-[var(--crm-border)] opacity-30 shadow-inner">
                        <ShieldCheck className="w-16 h-16 text-green-500 mx-auto mb-8 animate-bounce" />
                        <h3 className="text-2xl font-black mb-2 uppercase tracking-tighter">Barchasi joyida</h3>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-60 italic">Hali birorta ham qarzdorlik aniqlanmagan</p>
                    </div>
                  )}
                </div>
            </div>

            {/* Quick Actions & Center Info */}
            <div className="space-y-12">

                <div 
                    onClick={() => router.push("/dashboard/settings")}
                    className={`p-10 ${center?.smsEnabled ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-[var(--crm-accent)] to-indigo-600'} rounded-[3.5rem] shadow-[0_30px_70px_rgba(0,0,0,0.2)] relative overflow-hidden group hover:scale-[1.02] transition-all duration-500 cursor-pointer`}
                >
                    <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 blur-[50px] -mr-24 -mt-24 rounded-full group-hover:scale-110 transition-transform" />
                    <div className="w-14 h-14 rounded-2xl bg-white/10 flex items-center justify-center text-white mb-10 shadow-inner"><TrendingUp className="w-7 h-7" /></div>
                    <h3 className="text-3xl font-black text-white mb-3 leading-tight tracking-tighter uppercase">SMS Xizmati</h3>
                    <p className="text-purple-100/60 text-[10px] font-black uppercase tracking-[0.2em] mb-8 leading-relaxed">
                        {center?.smsEnabled 
                          ? "To'lovlar haqida SMS xabarnomalar tizimi faol. Eskiz.uz balansini tekshirishni unutmang." 
                          : "To'lovlar haqida avtomatik xabarnomalar tizimi. Sozlash uchun bosing."}
                    </p>
                    <div className="flex items-center gap-3 text-white/50 group-hover:text-white transition-colors">
                        <span className="text-[9px] font-black tracking-widest uppercase">
                            {center?.smsEnabled ? "XIZMAT FAOL" : "SOZLANMAGAN"}
                        </span>
                        <ArrowUpRight className="w-4 h-4 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
                    </div>
                </div>
            </div>
          </div>

          <div className="mt-20">
            <PaymentTrendChart data={chartData} viewPeriod={viewPeriod} setViewPeriod={setViewPeriod} />
          </div>
        </section>
    </>
  );
}

function StatCard({ icon, label, value, unit = "", highlight = false, action, trend, onClick }: any) {
  return (
    <div onClick={onClick} className={`p-6 sm:p-10 bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[2.8rem] sm:rounded-[3.8rem] flex flex-col gap-6 sm:gap-10 relative group overflow-hidden ${highlight ? 'hover:border-red-500/30' : 'hover:border-[var(--crm-accent)]/50'} transition-all shadow-[0_30px_60px_rgba(0,0,0,0.1)] active:scale-[0.98] cursor-pointer`}>
      <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--crm-accent-soft)] blur-[40px] -mr-16 -mt-16 rounded-full group-hover:opacity-[0.12] transition-all" />
      
      <div className="flex items-center justify-between relative z-10">
          <div className={`w-14 h-14 sm:w-16 sm:h-16 bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-2xl sm:rounded-[1.5rem] flex items-center justify-center text-[var(--crm-accent)] group-hover:scale-110 transition-transform duration-500 shadow-xl`}>
            {icon}
          </div>
          <div className="flex flex-col items-end gap-1">
              {trend && (
                <div className="px-3 py-1.5 bg-emerald-500/[0.08] dark:bg-emerald-500/10 border border-emerald-500/10 dark:border-emerald-500/20 rounded-full flex items-center gap-1.5 shadow-[0_2px_8px_rgba(16,185,129,0.05)] backdrop-blur-md">
                   <TrendingUp className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                   <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-tighter">{trend}</span>
                </div>
              )}
             {action}
          </div>
      </div>

      <div className="relative z-10">
        <div className="text-[8px] sm:text-[9px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.25em] mb-2 sm:mb-4 opacity-50 italic group-hover:opacity-100 transition-opacity">{label}</div>
        <div className="flex flex-col leading-none gap-2">
            <span className={`text-3xl sm:text-4xl font-black tracking-tighter ${highlight ? 'text-red-500' : 'text-[var(--crm-text)]'} transition-colors italic drop-shadow-sm`}>
                {value}
            </span>
            {unit && <span className="text-[10px] sm:text-xs font-black text-[var(--crm-text)] uppercase tracking-[0.2em] opacity-40 italic">{unit}</span>}
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon, label, href }: any) {
    return (
        <Link href={href} className="flex items-center gap-6 p-6 bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[2rem] hover:bg-[var(--crm-accent)] hover:text-white transition-all group active:scale-95 shadow-[0_10px_30px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_rgba(139,92,246,0.2)]">
           <div className={`w-12 h-12 rounded-[1.25rem] bg-[var(--crm-accent-soft)] flex items-center justify-center text-[var(--crm-accent)] group-hover:bg-white/10 group-hover:text-white transition-all shadow-inner`}>
             {icon}
           </div>
           <span className="font-black text-xs uppercase tracking-widest group-hover:translate-x-2 transition-transform">{label}</span>
        </Link>
    );
}

function PaymentTrendChart({ data, viewPeriod, setViewPeriod }: { data: { month: string, amount: number }[], viewPeriod: "DAY" | "MONTH" | "YEAR", setViewPeriod: (v: "DAY" | "MONTH" | "YEAR") => void }) {
    if (!data || data.length === 0) return null;
    
    const maxVal = Math.max(...data.map(d => d.amount), 1000000);
    const height = 240;
    const width = 600;
    const padding = 40;
    
    const points = data.map((d, i) => {
        const x = padding + (i * ((width - padding * 2) / (data.length - 1)));
        const y = height - padding - (d.amount / maxVal * (height - padding * 1.5));
        return { x, y };
    });
    
    const curvePath = points.length > 0 ? points.reduce((acc, p, i, a) => {
        if (i === 0) return `M ${p.x},${p.y}`;
        const prev = a[i - 1];
        const cp1x = prev.x + (p.x - prev.x) / 3;
        const cp2x = prev.x + (2 * (p.x - prev.x)) / 3;
        return `${acc} C ${cp1x},${prev.y} ${cp2x},${p.y} ${p.x},${p.y}`;
    }, "") : "";
    
    const fillPath = `${curvePath} L ${points[points.length - 1].x},${height - padding} L ${points[0].x},${height - padding} Z`;

    return (
        <div className="bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[2.5rem] sm:rounded-[4rem] p-6 sm:p-12 shadow-[0_30px_100px_rgba(0,0,0,0.2)] relative overflow-hidden group min-h-[350px] sm:min-h-[400px] flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[var(--crm-accent)] opacity-[0.03] blur-[120px] -mr-48 -mt-48 rounded-full" />
            <header className="flex flex-col lg:flex-row lg:items-center justify-between relative z-10 gap-6">
                <div>
                   <h2 className="text-2xl sm:text-4xl font-black uppercase tracking-tighter italic opacity-20 flex items-center gap-3 sm:gap-4">
                       <TrendingUp className="w-6 h-6 sm:w-10 h-10 text-[var(--crm-accent)]" />
                       Daromad Dinamikasi
                   </h2>
                   <p className="text-[8px] sm:text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.2em] sm:tracking-[0.25em] mt-2 sm:mt-3 opacity-60 italic">Tushumlar oqimi va moliya tahlili</p>
                </div>

                <div className="flex items-center gap-1 sm:gap-2 bg-[var(--crm-bg)]/50 p-1.5 sm:p-2 rounded-2xl sm:rounded-[1.5rem] border border-[var(--crm-border)] shadow-inner overflow-x-auto no-scrollbar">
                    {[
                        { id: 'DAY', label: 'Kunlik' },
                        { id: 'MONTH', label: 'Oylik' },
                        { id: 'YEAR', label: 'Yillik' }
                    ].map((p) => (
                        <button
                            key={p.id}
                            onClick={() => setViewPeriod(p.id as any)}
                            className={`px-3 sm:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl text-[7px] sm:text-[9px] font-black uppercase tracking-widest transition-all relative flex-shrink-0 ${viewPeriod === p.id ? 'text-white' : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'}`}
                        >
                            {viewPeriod === p.id && (
                                <motion.div layoutId="periodBg" className="absolute inset-0 bg-[var(--crm-accent)] rounded-lg sm:rounded-xl shadow-lg shadow-purple-600/20" />
                            )}
                            <span className="relative z-10">{p.label}</span>
                        </button>
                    ))}
                </div>
            </header>
            
            <div className="relative flex-1 flex items-center justify-center py-10 mt-6">
                <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none" className="overflow-visible">
                    <defs>
                        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="var(--crm-accent)" stopOpacity="0.3" />
                            <stop offset="100%" stopColor="var(--crm-accent)" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    
                    {/* Grid lines */}
                    {[0, 0.33, 0.66, 1].map(p => {
                        const y = padding + p * (height - padding * 2);
                        return <line key={p} x1={padding} y1={y} x2={width - padding} y2={y} stroke="var(--crm-border)" strokeWidth="1" strokeDasharray="6 6" opacity="0.3" />;
                    })}
                    
                    {/* Area fill */}
                    <motion.path 
                        key={`${viewPeriod}-fill`}
                        initial={{ opacity: 0 }} 
                        animate={{ opacity: 1 }} 
                        transition={{ duration: 0.8 }}
                        d={fillPath} 
                        fill="url(#chartGradient)" 
                    />
                    
                    {/* Line path */}
                    <motion.path 
                        key={`${viewPeriod}-line`}
                        initial={{ pathLength: 0, opacity: 0 }} 
                        animate={{ pathLength: 1, opacity: 1 }} 
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        d={curvePath} 
                        fill="none" 
                        stroke="var(--crm-accent)" 
                        strokeWidth="5" 
                        strokeLinecap="round" 
                    />
                    
                    {/* Data points */}
                    {points.map((p, i) => (
                        <g key={`${viewPeriod}-${i}`} className="group/dot outline-none">
                            <circle cx={p.x} cy={p.y} r="25" fill="transparent" className="cursor-pointer" />
                            <motion.circle 
                                initial={{ r: 0 }}
                                animate={{ r: 6 }}
                                transition={{ delay: 0.2 + i * 0.05 }}
                                whileHover={{ scale: 1.5, strokeWidth: 6 }}
                                cx={p.x} 
                                cy={p.y} 
                                r="6" 
                                fill="var(--crm-card)" 
                                stroke="var(--crm-accent)" 
                                strokeWidth="4" 
                                className="pointer-events-none shadow-lg" 
                            />
                            <text x={p.x} y={height - padding + 35} textAnchor="middle" className="text-[11px] font-black fill-[var(--crm-text-muted)] opacity-40 italic uppercase tracking-tighter pointer-events-none lowercase first-letter:uppercase">{data[i].month}</text>
                            
                            <g className="opacity-0 group-hover/dot:opacity-100 transition-opacity pointer-events-none">
                                <rect x={p.x - 60} y={p.y - 70} width="120" height="40" rx="20" fill="var(--crm-accent)" className="shadow-2xl" />
                                <text x={p.x} y={p.y - 45} textAnchor="middle" className="text-[11px] font-black fill-white italic tracking-tighter">{Number(data[i].amount).toLocaleString("ru-RU")} UZS</text>
                            </g>
                        </g>
                    ))}
                </svg>
            </div>
        </div>
    );
}
