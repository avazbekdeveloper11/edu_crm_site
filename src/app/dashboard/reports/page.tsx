"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Wallet, 
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  Download,
  CheckCircle2,
  Clock,
  ChevronRight,
  X,
  PieChart,
  BookOpen,
  CalendarDays,
  RefreshCcw,
  Sparkles
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { API_BASE_URL } from "@/app/constants";

export default function ReportsPage() {
  const router = useRouter();
  const [center, setCenter] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [finance, setFinance] = useState<any>(null);
  const [studentsReport, setStudentsReport] = useState<any>(null);
  const [courseStats, setCourseStats] = useState<any[]>([]);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  
  // Filter state
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [activeBar, setActiveBar] = useState<number | null>(null);

  const fetchData = async () => {
    setLoading(true);
    const token = localStorage.getItem("access_token");
    const query = (startDate || endDate) ? `?startDate=${startDate}&endDate=${endDate}` : "";
    
    try {
      const [sRes, fRes, stRes, cRes] = await Promise.all([
        fetch(`${API_BASE_URL}/reports/dashboard${query}`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/reports/finance${query}`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/reports/students${query}`, { headers: { "Authorization": `Bearer ${token}` } }),
        fetch(`${API_BASE_URL}/reports/courses`, { headers: { "Authorization": `Bearer ${token}` } })
      ]);
      
      if (sRes.ok) setStats(await sRes.json());
      if (fRes.ok) setFinance(await fRes.json());
      if (stRes.ok) setStudentsReport(await stRes.json());
      if (cRes.ok) setCourseStats(await cRes.json());
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const userData = localStorage.getItem("center_user");
    if (userData) {
      setCenter(JSON.parse(userData));
    }
    fetchData();
  }, []);

  const exportToExcel = async () => {
    if (!finance || !studentsReport || !center) return;

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Moliya Hisoboti');

    const accentColor = 'FF7C3AED';
    const darkBg = 'FF1F2937';
    const lightBg = 'FFF9FAFB';

    sheet.mergeCells('A1:E1');
    const titleCell = sheet.getCell('A1');
    titleCell.value = `${center.centerName.toUpperCase()} - MOLIYAVIY HISOBOT`;
    titleCell.font = { name: 'Arial Black', size: 16, color: { argb: 'FFFFFFFF' } };
    titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
    titleCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: accentColor } };

    sheet.mergeCells('A2:E2');
    const dateCell = sheet.getCell('A2');
    dateCell.value = `Yaratilgan vaqt: ${new Date().toLocaleString()} ${startDate ? `[${startDate} - ${endDate}]` : ""}`;
    dateCell.font = { name: 'Arial', size: 10, italic: true, color: { argb: 'FF6B7280' } };
    dateCell.alignment = { horizontal: 'center' };

    sheet.addRow([]);

    const summaryLabel = startDate ? 'TANLANGAN DAVR TUSHUMI:' : 'OYLIK TUSHUM:';
    const summaryRow = sheet.addRow([summaryLabel, `${(stats?.periodRevenue || stats?.monthlyRevenue)?.toLocaleString()} UZS`, '', 'BUGUN:', `${stats?.todayRevenue?.toLocaleString()} UZS`]);
    summaryRow.font = { bold: true };

    sheet.addRow([]);

    const headerRow = sheet.addRow(['SANA', 'TALABA ISMI', 'KURS NOMI', 'TO\'LOV SUMMASI', 'STATUS']);
    headerRow.height = 25;
    headerRow.eachCell((cell) => {
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' }, size: 11 };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: darkBg } };
      cell.alignment = { vertical: 'middle', horizontal: 'center' };
      cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thick' }, right: { style: 'thin' } };
    });

    let total = 0;
    finance.recentPayments.forEach((p: any, index: number) => {
      total += p.amount;
      const row = sheet.addRow([
        new Date(p.createdAt).toLocaleDateString(),
        p.student?.name?.toUpperCase(),
        p.course?.name?.toUpperCase(),
        p.amount,
        'MUVAFFAQIYATLI'
      ]);
      
      row.height = 20;
      row.getCell(4).numFmt = '#,##0 "UZS"';
      row.getCell(5).font = { color: { argb: 'FF059669' }, bold: true };
      
      if (index % 2 === 0) {
        row.eachCell(c => { c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: lightBg } }; });
      }

      row.eachCell((cell, colNumber) => {
        cell.border = { top: { style: 'thin', color: { argb: 'FFE5E7EB' } }, left: { style: 'thin', color: { argb: 'FFE5E7EB' } }, bottom: { style: 'thin', color: { argb: 'FFE5E7EB' } }, right: { style: 'thin', color: { argb: 'FFE5E7EB' } } };
        cell.alignment = { vertical: 'middle', horizontal: colNumber === 4 ? 'right' : 'center' };
      });
    });

    const totalRow = sheet.addRow(['', '', 'JAMI TUSHUM:', total, '']);
    totalRow.height = 30;
    totalRow.getCell(3).font = { bold: true, size: 12 };
    totalRow.getCell(4).font = { bold: true, size: 12, color: { argb: 'FF059669' } };
    totalRow.getCell(4).numFmt = '#,##0 "UZS"';
    totalRow.getCell(3).alignment = { horizontal: 'right', vertical: 'middle' };
    totalRow.getCell(4).alignment = { horizontal: 'right', vertical: 'middle' };

    sheet.columns.forEach((column) => {
      column.width = 25;
    });
    sheet.getColumn(1).width = 15;
    sheet.getColumn(4).width = 20;

    const studentSheet = workbook.addWorksheet('Talabalar Statistikasi');
    studentSheet.addRow([`${(center?.centerName || "MARKAZ").toUpperCase()} - TALABALAR TAHLILI`]).font = { bold: true, size: 14 };
    studentSheet.addRow([]);
    const sHeader = studentSheet.addRow(['STATUS', 'TALABALAR SONI', 'ULUSHI (%)']);
    sHeader.eachCell(c => {
        c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: darkBg } };
    });

    studentsReport.totalByStatus.forEach((s: any) => {
      const percentage = ((s._count / stats.totalStudents) * 100).toFixed(1) + '%';
      studentSheet.addRow([s.status === 'Active' ? 'FAOL' : 'ARXIVLANGAN', s._count, percentage]);
    });
    studentSheet.columns = [{ width: 20 }, { width: 20 }, { width: 15 }];

    const buffer = await workbook.xlsx.writeBuffer();
    saveAs(new Blob([buffer]), `${center.centerName}_Hisobot_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const clearFilters = () => {
      setStartDate("");
      setEndDate("");
      setShowFilter(false);
      fetchData();
  };

  return (
    <>
        <header className="min-h-[60px] sm:min-h-24 border-b border-[var(--crm-border)] flex items-center justify-between px-4 sm:px-10 bg-[var(--crm-sidebar)]/50 backdrop-blur-xl sticky top-0 z-40 py-2 sm:py-0">
          <div className="flex items-center gap-3 sm:gap-4 flex-1">
            <div className="p-2 sm:p-3 bg-purple-600/10 rounded-xl shrink-0">
              <BarChart3 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl sm:text-2xl font-black uppercase tracking-tighter italic truncate">Hisobotlar</h1>
              <p className="hidden sm:block text-[10px] text-[var(--crm-text-muted)] font-bold uppercase tracking-widest opacity-60">Markaz tahliliy ko'rsatkichlari</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={exportToExcel}
              className="w-10 h-10 sm:w-[52px] sm:h-[52px] flex items-center justify-center bg-[var(--crm-card)]/80 backdrop-blur-md border border-[var(--crm-border)] rounded-xl sm:rounded-2xl text-[var(--crm-text-muted)] hover:text-[var(--crm-accent)] hover:border-[var(--crm-accent)]/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all shadow-md active:scale-95 shrink-0"
              title="Excel formatida yuklab olish"
            >
              <Download className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button 
                onClick={() => setShowFilter(!showFilter)}
                className={`flex items-center justify-center gap-2.5 sm:gap-3 px-3 sm:px-8 h-10 sm:h-[52px] rounded-xl sm:rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] transition-all active:scale-95
                    ${startDate || endDate 
                        ? 'bg-gradient-to-r from-purple-500 to-indigo-600 text-white shadow-lg shadow-purple-600/30 ring-2 ring-purple-500/20' 
                        : 'bg-[var(--crm-card)]/80 backdrop-blur-md text-[var(--crm-text)] border border-[var(--crm-border)] hover:border-[var(--crm-accent)] shadow-md'
                    }`}
            >
              <Filter className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${startDate || endDate ? 'animate-pulse' : ''}`} />
              <span className="hidden sm:inline">{startDate || endDate ? "Saralangan" : "Filterlash"}</span>
            </button>
          </div>
        </header>

        {/* Filter Panel */}
        <AnimatePresence>
            {showFilter && (
                <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="bg-[var(--crm-sidebar)]/80 backdrop-blur-xl border-b border-[var(--crm-border)] overflow-hidden"
                >
                    <div className="p-5 sm:p-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8 items-end">
                        <div className="space-y-2 sm:space-y-3">
                            <label className="text-[9px] font-black uppercase text-[var(--crm-text-muted)] tracking-[0.2em] ml-1 opacity-60">Boshlanish sanasi</label>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-purple-600/5 rounded-xl sm:rounded-2xl blur-xl sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />
                                <CalendarDays className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
                                <input 
                                  type="date" 
                                  value={startDate} 
                                  onChange={(e) => setStartDate(e.target.value)} 
                                  className="w-full relative bg-[var(--crm-card)]/50 border border-[var(--crm-border)] rounded-xl sm:rounded-2xl py-3 sm:py-4.5 pl-11 sm:pl-14 pr-4 sm:pr-6 text-xs sm:text-sm font-bold focus:border-purple-500 focus:bg-[var(--crm-card)] outline-none transition-all" 
                                />
                            </div>
                        </div>
                        <div className="space-y-2 sm:space-y-3">
                            <label className="text-[9px] font-black uppercase text-[var(--crm-text-muted)] tracking-[0.2em] ml-1 opacity-60">Tugash sanasi</label>
                            <div className="relative group">
                                <div className="absolute inset-0 bg-purple-600/5 rounded-xl sm:rounded-2xl blur-xl sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />
                                <CalendarDays className="absolute left-4 sm:left-5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-500" />
                                <input 
                                  type="date" 
                                  value={endDate} 
                                  onChange={(e) => setEndDate(e.target.value)} 
                                  className="w-full relative bg-[var(--crm-card)]/50 border border-[var(--crm-border)] rounded-xl sm:rounded-2xl py-3 sm:py-4.5 pl-11 sm:pl-14 pr-4 sm:pr-6 text-xs sm:text-sm font-bold focus:border-purple-500 focus:bg-[var(--crm-card)] outline-none transition-all" 
                                />
                            </div>
                        </div>
                        <div className="flex gap-3 sm:gap-4">
                            <button 
                              onClick={fetchData} 
                              className="flex-1 h-12 sm:h-[60px] bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl sm:rounded-2xl font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] shadow-lg hover:shadow-purple-600/30 active:scale-95 transition-all flex items-center justify-center gap-2 sm:gap-3"
                            >
                                <RefreshCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                                Qo'llash
                            </button>
                            <button 
                              onClick={clearFilters} 
                              className="w-12 h-12 sm:w-[60px] sm:h-[60px] bg-red-500/10 text-red-500 border border-red-500/20 rounded-xl sm:rounded-2xl hover:bg-red-500 hover:text-white transition-all flex items-center justify-center group active:scale-90 shrink-0"
                            >
                                <X className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform" />
                            </button>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>

        <div className="p-4 sm:p-10 pb-40 sm:pb-10 max-w-7xl mx-auto space-y-10">
          
          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              label={startDate ? "Davr Tushumi" : "Oylik Tushum"} 
              value={`${(stats?.periodRevenue ?? stats?.monthlyRevenue)?.toLocaleString()} UZS`} 
              icon={<Wallet className="w-6 h-6" />}
              trend="+12.5%"
              positive={true}
              color="text-green-500"
              bg="bg-green-500/10"
            />
            <StatCard 
              label="Bugungi Tushum" 
              value={`${stats?.todayRevenue?.toLocaleString()} UZS`} 
              icon={<TrendingUp className="w-6 h-6" />}
              trend="+5.2%"
              positive={true}
              color="text-blue-500"
              bg="bg-blue-500/10"
            />
            <StatCard 
              label="Jami Talabalar" 
              value={stats?.totalStudents} 
              icon={<Users className="w-6 h-6" />}
              trend="+24 ta"
              positive={true}
              color="text-purple-500"
              bg="bg-purple-500/10"
            />
            <StatCard 
              label="Faol Guruhlar" 
              value={stats?.totalGroups} 
              icon={<Calendar className="w-6 h-6" />}
              trend="0"
              positive={true}
              color="text-orange-500"
              bg="bg-orange-500/10"
            />
          </section>

          {loading ? (
              <div className="py-32 flex flex-col items-center justify-center gap-8 opacity-30">
                  <div className="relative">
                      <div className="w-16 h-16 border-4 border-purple-600/10 rounded-full" />
                      <div className="absolute inset-0 w-16 h-16 border-4 border-purple-600 border-t-transparent rounded-full animate-spin" />
                      <div className="absolute inset-0 w-16 h-16 bg-purple-600/5 blur-xl animate-pulse rounded-full" />
                  </div>
                  <p className="text-[11px] font-black uppercase tracking-[0.4em] text-purple-400">Ma'lumotlar yuklanmoqda...</p>
              </div>
          ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <section className="lg:col-span-2 space-y-6">
               <div className="flex items-center justify-between px-2">
                 <h2 className="text-2xl font-black uppercase tracking-tighter italic opacity-40">Moliyaviy Faollik</h2>
                 <Link href="/dashboard/payments" className="text-[10px] font-black uppercase tracking-widest text-[var(--crm-accent)] flex items-center gap-2 hover:translate-x-2 transition-transform py-2">
                   Barchasi <ChevronRight className="w-4 h-4" />
                 </Link>
               </div>
               
               <div className="bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[2.5rem] p-10 space-y-10 shadow-2xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-purple-600/5 blur-[100px] -mr-64 -mt-64 rounded-full pointer-events-none" />
                  
                  <div className="h-64 flex items-end justify-between gap-3 px-4 border-b border-[var(--crm-border)]/50 pb-6 relative z-10" onClick={() => setActiveBar(null)}>
                    {(finance?.dailyStats?.length > 0 ? finance.dailyStats : Array(7).fill({_sum:{amount:0}})).slice(-7).map((day: any, i: number) => {
                      const maxVal = Math.max(...(finance?.dailyStats?.map((d:any) => d._sum.amount) || [1]));
                      const currentVal = day._sum.amount || 0;
                      const heightPercent = Math.min((currentVal / maxVal) * 100, 100);

                      return (
                        <div key={i} className="flex-1 flex flex-col items-center gap-4 group/bar">
                          <div className="w-full relative h-full flex items-end">
                             <motion.div 
                               initial={{ height: 0 }}
                               animate={{ height: `${heightPercent}%` }}
                               transition={{ type: "spring", stiffness: 100, damping: 15 }}
                               onClick={(e) => { e.stopPropagation(); setActiveBar(activeBar === i ? null : i); }}
                               className={`w-full bg-gradient-to-t ${activeBar === i ? 'from-purple-400 to-indigo-300' : 'from-purple-600 to-indigo-500'} rounded-t-2xl group-hover/bar:from-purple-400 group-hover/bar:to-indigo-300 transition-all cursor-pointer min-h-[4px] relative shadow-[0_5px_15px_rgba(124,58,237,0.2)]`} 
                             >
                                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover/bar:opacity-30 transition-opacity rounded-t-2xl" />
                             </motion.div>
                             {currentVal > 0 && (
                               <div className={`absolute -top-12 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-white text-[10px] font-black px-3 py-1.5 rounded-xl transition-all whitespace-nowrap z-20 border border-white/10 shadow-2xl ${activeBar === i ? 'opacity-100 translate-y-0' : 'opacity-0 group-hover/bar:opacity-100 -translate-y-2 group-hover/bar:translate-y-0'}`}>
                                 {currentVal.toLocaleString()}
                               </div>
                             )}
                          </div>
                          <span className={`text-[10px] font-black uppercase transition-colors text-center leading-tight whitespace-nowrap ${activeBar === i ? 'text-[var(--crm-accent)] opacity-100' : 'text-[var(--crm-text-muted)] opacity-50'}`}>
                            {day.paymentDate ? new Date(day.paymentDate).toLocaleDateString(undefined, {day:'2-digit', month:'short'}) : `KUN ${i+1}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-4">
                        <div className="h-0.5 flex-1 bg-gradient-to-r from-transparent via-[var(--crm-border)] to-transparent opacity-50" />
                        <h3 className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--crm-text-muted)] opacity-60">To'lovlar Ro'yxati</h3>
                        <div className="h-0.5 flex-1 bg-gradient-to-r from-[var(--crm-border)] via-[var(--crm-border)] to-transparent opacity-50" />
                    </div>
                    <div className="space-y-3">
                      {finance?.recentPayments?.slice(0, 5).map((payment: any) => (
                        <div key={payment.id} className="flex items-center justify-between p-5 bg-[var(--crm-bg)]/40 border border-[var(--crm-border)] rounded-[1.5rem] hover:border-[var(--crm-accent)]/40 hover:bg-[var(--crm-card)]/50 hover:shadow-xl transition-all duration-300 group/item">
                           <div className="flex items-center gap-5">
                             <div className="w-12 h-12 rounded-2xl bg-purple-600/10 flex items-center justify-center text-purple-600 group-hover/item:scale-110 transition-transform shadow-inner">
                               <Wallet className="w-5 h-5" />
                             </div>
                             <div>
                               <p className="text-[14px] font-black uppercase tracking-tight group-hover/item:text-[var(--crm-accent)] transition-colors">{payment.student?.name}</p>
                               <p className="text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.1em] opacity-60 italic">{payment.course?.name}</p>
                             </div>
                           </div>
                           <div className="text-right">
                             <p className="text-base font-black text-green-500 tracking-tight">+{payment.amount.toLocaleString()}</p>
                             <p className="text-[9px] text-[var(--crm-text-muted)] font-black uppercase tracking-[0.15em] opacity-40">{new Date(payment.createdAt).toLocaleDateString()}</p>
                           </div>
                        </div>
                      ))}
                      {finance?.recentPayments?.length === 0 && (
                        <div className="p-16 border-2 border-dashed border-[var(--crm-border)] rounded-3xl text-center opacity-30 scale-95">
                            <Sparkles className="w-10 h-10 mx-auto mb-4" />
                            <p className="text-xs font-black uppercase tracking-[0.2em]">Ma'lumotlar mavjud emas</p>
                        </div>
                      )}
                    </div>
                  </div>
               </div>
            </section>

            <section className="space-y-6">
               <h2 className="text-2xl font-black uppercase tracking-tighter italic opacity-40 px-2">Talabalar Tarkibi</h2>
               <div className="bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[2.5rem] p-8 space-y-7 shadow-2xl relative overflow-hidden h-fit">
                  <div className="absolute -top-24 -right-24 w-64 h-64 bg-purple-600/5 blur-3xl rounded-full" />
                  
                  <div className="space-y-6 relative z-10">
                    {studentsReport?.totalByStatus?.map((status: any, i: number) => (
                      <div key={i} className="space-y-3">
                        <div className="flex justify-between items-end">
                           <div className="flex items-center gap-2">
                             <div className={`w-1.5 h-1.5 rounded-full ${status.status === 'Active' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
                             <span className="text-[10px] font-black uppercase tracking-[0.15em] opacity-60">{status.status === 'Active' ? 'FAOL' : 'ARXIVLANGAN'}</span>
                           </div>
                           <span className="text-xl font-black text-[var(--crm-accent)] tracking-tighter">{status._count}<span className="text-[9px] text-[var(--crm-text-muted)] ml-1">TA</span></span>
                        </div>
                        <div className="h-2 bg-[var(--crm-bg)]/50 rounded-full overflow-hidden border border-[var(--crm-border)]">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${(status._count / (stats?.totalStudents || 1)) * 100}%` }}
                            transition={{ duration: 1 }}
                            className={`h-full ${status.status === 'Active' ? 'bg-gradient-to-r from-green-500 to-emerald-400' : 'bg-gradient-to-r from-red-500 to-rose-400'} rounded-full`}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="p-6 bg-gradient-to-br from-purple-600/5 to-indigo-600/5 border border-purple-500/10 rounded-2xl space-y-3 relative z-10">
                     <div className="flex items-center gap-2 text-purple-500">
                       <Clock className="w-4 h-4" />
                       <span className="text-[9px] font-black uppercase tracking-[0.2em]">Dinamik O'sish</span>
                     </div>
                     <p className="text-[10px] font-bold text-[var(--crm-text-muted)] leading-relaxed italic opacity-80">
                       Talabalar oqimi barqaror davom etmoqda.
                     </p>
                  </div>

                  <button 
                    onClick={() => setShowAnalysis(true)}
                    className="w-full relative z-10 h-[60px] bg-[var(--crm-bg)] border border-[var(--crm-border)] rounded-2xl flex items-center justify-center gap-3 group hover:bg-[var(--crm-accent)] hover:border-transparent transition-all duration-300 active:scale-95"
                  >
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] text-[var(--crm-text-muted)] group-hover:text-white transition-colors">Batafsil tahlil</span>
                     <ArrowUpRight className="w-4 h-4 text-[var(--crm-text-muted)] group-hover:text-white transition-all" />
                  </button>
               </div>
            </section>
          </div>
          )}

        </div>

      {/* Analysis Modal */}
      <AnimatePresence>
        {showAnalysis && (
            <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center p-0 sm:p-8 backdrop-blur-2xl bg-black/60">
                <motion.div 
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    className="w-full max-w-5xl bg-[var(--crm-card)] border-t sm:border border-[var(--crm-border)] rounded-t-[2.5rem] sm:rounded-[3.5rem] shadow-[0_0_150px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col max-h-[95vh] sm:max-h-[92vh] relative"
                >
                    <div className="absolute -top-48 -left-48 w-96 h-96 bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />
                    <div className="absolute -bottom-48 -right-48 w-96 h-96 bg-indigo-600/10 blur-[100px] rounded-full pointer-events-none" />

                    {/* Mobile drag indicator */}
                    <div className="sm:hidden flex justify-center pt-3 pb-1 shrink-0">
                      <div className="w-10 h-1 rounded-full bg-[var(--crm-border)]" />
                    </div>

                    <header className="relative z-10 px-5 sm:px-10 py-4 sm:py-8 border-b border-[var(--crm-border)] flex items-center justify-between bg-black/10 shrink-0 gap-3">
                        <div className="flex items-center gap-3 sm:gap-6 min-w-0">
                            <div className="p-3 sm:p-5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl sm:rounded-2xl text-white shadow-lg shadow-purple-600/20 shrink-0">
                                <PieChart className="w-5 h-5 sm:w-7 sm:h-7" />
                            </div>
                            <div className="min-w-0">
                                <h2 className="text-base sm:text-3xl font-black uppercase tracking-tighter leading-none mb-1 truncate">Talabalar Statistikasi</h2>
                                <p className="text-[9px] sm:text-[10px] text-[var(--crm-text-muted)] font-black uppercase tracking-widest opacity-60 flex items-center gap-2 flex-wrap">
                                    <span>Yo'nalishlar va kurslar</span>
                                    <span className="hidden sm:inline">· {new Date().toLocaleDateString()}</span>
                                </p>
                            </div>
                        </div>
                        <button onClick={() => setShowAnalysis(false)} className="w-10 h-10 sm:w-[60px] sm:h-[60px] bg-[var(--crm-bg)]/80 hover:bg-red-500/10 hover:text-red-500 rounded-full text-[var(--crm-text-muted)] transition-all flex items-center justify-center group active:scale-90 shrink-0">
                            <X className="w-5 h-5 sm:w-7 sm:h-7 group-hover:rotate-90 transition-transform" />
                        </button>
                    </header>

                    <div className="relative z-10 flex-1 overflow-y-auto p-5 sm:p-10 lg:p-14 space-y-8 sm:space-y-14 custom-scrollbar">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-16">
                            {/* Course Distribution List */}
                            <div className="space-y-6 sm:space-y-10">
                                <h3 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] text-[var(--crm-text-muted)] opacity-60 flex items-center gap-3 sm:gap-4">
                                    <BookOpen className="w-4 h-4 sm:w-5 sm:h-5 text-purple-500" />
                                    Kurslar Bo'yicha Ma'lumot
                                </h3>
                                <div className="space-y-3 sm:space-y-5">
                                    {courseStats.length === 0 ? (
                                        <div className="p-12 sm:p-20 border-2 border-dashed border-[var(--crm-border)] rounded-[2rem] text-center space-y-4 opacity-30">
                                            <Calendar className="w-10 h-10 sm:w-12 sm:h-12 mx-auto" />
                                            <p className="text-xs sm:text-sm font-black uppercase tracking-widest">Hozircha ma'lumot yo'q</p>
                                        </div>
                                    ) : (
                                        courseStats.sort((a,b) => b.studentCount - a.studentCount).map((course, i) => (
                                            <motion.div 
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: i * 0.05 }}
                                                key={i} 
                                                className="p-5 sm:p-8 bg-[var(--crm-bg)]/40 border border-[var(--crm-border)] rounded-[1.8rem] sm:rounded-[2.5rem] space-y-4 sm:space-y-6 hover:border-[var(--crm-accent)]/30 hover:bg-[var(--crm-card)] group transition-all duration-300"
                                            >
                                                <div className="flex justify-between items-center gap-3">
                                                    <div className="min-w-0">
                                                        <span className="text-sm sm:text-lg font-black uppercase tracking-tight group-hover:text-[var(--crm-accent)] transition-colors truncate block">{course.name}</span>
                                                        <p className="text-[9px] font-black text-[var(--crm-text-muted)] uppercase tracking-widest opacity-60">Asosiy yo'nalish</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <span className="text-xl sm:text-2xl font-black text-[var(--crm-accent)]">{course.studentCount}</span>
                                                        <span className="text-[10px] font-black ml-1 text-[var(--crm-text-muted)] uppercase">ta</span>
                                                    </div>
                                                </div>
                                                <div className="h-2 sm:h-2.5 bg-black/20 rounded-full overflow-hidden p-[2px]">
                                                    <motion.div 
                                                        initial={{ width: 0 }}
                                                        animate={{ width: `${(course.studentCount / (stats?.totalStudents || 1)) * 100}%` }}
                                                        className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full shadow-[0_0_10px_rgba(124,58,237,0.3)]" 
                                                    />
                                                </div>
                                                <div className="flex justify-between items-center text-[9px] sm:text-[10px] font-black uppercase tracking-widest">
                                                    <div className="flex items-center gap-1.5 sm:gap-2 text-green-500 bg-green-500/10 px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full">
                                                        <ArrowUpRight className="w-3 h-3" />
                                                        {((course.studentCount / (stats?.totalStudents || 1)) * 100).toFixed(1)}% ulush
                                                    </div>
                                                    <div className="text-[var(--crm-text-muted)] opacity-60">
                                                        {course.price.toLocaleString()} UZS
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Detailed Cards */}
                            <div className="space-y-5 sm:space-y-10">
                                <div className="p-6 sm:p-10 bg-gradient-to-br from-purple-600 to-indigo-700 rounded-[2rem] sm:rounded-[3rem] text-white shadow-2xl relative overflow-hidden group">
                                     <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-700" />
                                     <div className="relative z-10">
                                         <h4 className="text-[10px] sm:text-[11px] font-black uppercase tracking-[0.3em] mb-3 sm:mb-6 opacity-60">O'rtacha Foyda Koeffitsienti</h4>
                                         <div className="flex items-baseline gap-2 mb-3 sm:mb-6 flex-wrap">
                                            <span className="text-2xl sm:text-5xl font-black tracking-tighter italic leading-none">
                                                {Math.round((stats?.periodRevenue ?? stats?.monthlyRevenue ?? 0) / (stats?.totalStudents || 1)).toLocaleString()}
                                            </span>
                                            <span className="text-[9px] sm:text-[10px] font-black opacity-40 uppercase tracking-widest">UZS / TALABA</span>
                                         </div>
                                         <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-[0.2em] opacity-60 leading-loose">
                                             Har bir talaba markaz umumiy daromadiga o'rtacha shuncha hissa qo'shmoqda.
                                         </p>
                                     </div>
                                     <Wallet className="absolute -bottom-8 -right-8 w-32 h-32 sm:w-48 sm:h-48 opacity-10 -rotate-12" />
                                </div>

                                <div className="grid grid-cols-2 gap-4 sm:gap-8">
                                    <div className="p-5 sm:p-10 bg-[var(--crm-bg)]/40 border border-[var(--crm-border)] rounded-[1.8rem] sm:rounded-[2.5rem] flex flex-col justify-center gap-1.5 sm:gap-2 group hover:border-[var(--crm-accent)]/30 transition-all">
                                        <div className="text-[9px] sm:text-[10px] font-black text-[var(--crm-text-muted)] uppercase tracking-[0.2em] sm:tracking-[0.25em] opacity-60">Kurslar Jami</div>
                                        <div className="text-3xl sm:text-5xl font-black text-[var(--crm-text)] group-hover:text-[var(--crm-accent)] transition-colors italic">{courseStats.length}</div>
                                    </div>
                                    <div className="p-5 sm:p-10 bg-[var(--crm-bg)]/40 border border-[var(--crm-border)] rounded-[1.8rem] sm:rounded-[2.5rem] flex flex-col justify-center gap-1.5 sm:gap-2 group hover:border-[var(--crm-accent)]/30 transition-all">
                                        <div className="text-[9px] sm:text-[10px] font-black text-[var(--crm-text-muted)] uppercase tracking-[0.2em] sm:tracking-[0.25em] opacity-60">O'rtacha Narx</div>
                                        <div className="text-lg sm:text-2xl font-black text-[var(--crm-text)] group-hover:text-[var(--crm-accent)] transition-colors">
                                            {Math.round(courseStats.reduce((acc,c) => acc + (c.price || 0), 0) / (courseStats.length || 1)).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 sm:p-10 bg-black/20 border border-dashed border-[var(--crm-border)] rounded-[2rem] sm:rounded-[3rem] text-center space-y-4 sm:space-y-6 relative overflow-hidden group">
                                     <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-purple-600 to-transparent sm:opacity-0 sm:group-hover:opacity-100 transition-opacity" />
                                     <TrendingUp className="w-10 h-10 sm:w-14 sm:h-14 text-purple-500 mx-auto opacity-30 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" />
                                     <p className="text-[10px] sm:text-[11px] font-black text-[var(--crm-text-muted)] italic leading-relaxed uppercase tracking-[0.2em] sm:tracking-[0.25em] px-4 sm:px-10">
                                         Tahlillar natijasiga ko'ra markaz o'sish dinamikasi <span className="text-green-500">IJOBIY</span> darajadadir.
                                     </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <footer className="relative z-10 px-5 sm:px-10 py-4 sm:py-8 border-t border-[var(--crm-border)] bg-black/10 flex items-center justify-center shrink-0">
                         <button 
                            onClick={() => setShowAnalysis(false)} 
                            className="w-full sm:w-auto px-10 sm:px-20 h-14 sm:h-[65px] bg-gradient-to-r from-purple-600 to-indigo-700 text-white rounded-[1.5rem] sm:rounded-[1.8rem] font-black text-[10px] sm:text-[11px] uppercase tracking-[0.2em] sm:tracking-[0.3em] shadow-lg hover:shadow-[0_20px_60px_rgba(124,58,237,0.6)] active:scale-95 transition-all"
                         >
                            Tahlilni yopish
                         </button>
                    </footer>
                </motion.div>
            </div>
        )}
      </AnimatePresence>
    </>
  );
}

function StatCard({ label, value, icon, trend, positive, color, bg }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      className="bg-[var(--crm-card)] border border-[var(--crm-border)] p-10 rounded-[3rem] shadow-xl hover:border-[var(--crm-accent)]/30 hover:shadow-2xl transition-all group overflow-hidden relative"
    >
      <div className={`absolute top-0 right-0 w-32 h-32 ${bg} opacity-10 blur-[40px] -mr-12 -mt-12 rounded-full group-hover:opacity-30 transition-opacity`} />
      
      <div className="flex justify-between items-start mb-8">
        <div className={`p-5 rounded-3xl ${bg} ${color} shadow-inner group-hover:scale-110 transition-transform duration-500`}>
          {icon}
        </div>
        <div className={`flex items-center gap-1.5 text-[9px] font-black ${positive ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'} bg-black/[0.05] dark:bg-black/20 px-4 py-1.5 rounded-full shadow-sm backdrop-blur-sm`}>
          {positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
          {trend}
        </div>
      </div>
      <div>
        <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[var(--crm-text-muted)] mb-4 opacity-60 italic">{label}</p>
        <p className="text-3xl sm:text-4xl font-black tracking-tighter text-[var(--crm-text)] group-hover:text-[var(--crm-accent)] transition-colors duration-500">{value}</p>
      </div>
    </motion.div>
  );
}
