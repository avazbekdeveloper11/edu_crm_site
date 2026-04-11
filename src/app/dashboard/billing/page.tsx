"use client";

import { useState, useEffect } from "react";
import { Check, Shield, Zap, Crown, CreditCard, Calendar, Users, Briefcase } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeContext";

export default function BillingPage() {
  const [billingCycle, setBillingCycle] = useState<"Monthly" | "Yearly">("Monthly");
  const { theme } = useTheme();

  const tariffs = [
    {
      id: "Standart",
      name: "Standart",
      icon: <Zap className="w-8 h-8 text-blue-500" />,
      monthly: 299000,
      yearly: 2999000,
      limits: {
        students: 100,
        staff: 5
      },
      features: [
        "100 ta o'quvchi limiti",
        "5 ta xodim (o'qituvchi) limiti",
        "CRM Lead boshqaruv",
        "To'lovlar va Kassa",
        "Telegram Bot xabarnomalari",
        "SMS xizmati (Eskiz)",
      ],
      color: "blue"
    },
    {
      id: "Premium",
      name: "Premium",
      icon: <Crown className="w-8 h-8 text-purple-500" />,
      monthly: 499000,
      yearly: 5499000,
      limits: {
        students: 400,
        staff: 25
      },
      features: [
        "400 ta o'quvchi limiti",
        "25 ta xodim (o'qituvchi) limiti",
        "Barcha Standart imkoniyatlar",
        "Kengaytirilgan Statistika",
        "Davomat va Jurnallar",
        "Prioritetli qo'llab-quvvatlash",
      ],
      color: "purple",
      popular: true
    },
    {
      id: "VIP",
      name: "VIP",
      icon: <Shield className="w-8 h-8 text-orange-500" />,
      monthly: 999000,
      yearly: 9599000,
      limits: {
        students: Infinity,
        staff: Infinity
      },
      features: [
        "Cheksiz o'quvchilar soni",
        "Cheksiz xodimlar soni",
        "Barcha Premium imkoniyatlar",
        "Shaxsiy menejer",
        "Brand xabarlar",
        "Maxsus funksiyalar (Custom)",
      ],
      color: "orange"
    }
  ];

  const formatMoney = (val: number) => val.toLocaleString("ru-RU").replace(/,/g, " ");

  return (
    <section className="p-6 sm:p-12 max-w-7xl mx-auto min-h-screen">
      <header className="text-center space-y-4 mb-16">
        <motion.h1 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-5xl sm:text-7xl font-black tracking-tighter uppercase italic bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent"
        >
          Tariflar
        </motion.h1>
        <p className="text-[var(--crm-text-muted)] font-bold text-sm sm:text-lg max-w-2xl mx-auto opacity-60">
          O'quv markazingiz hajmigiga mos keluvchi tarifni tanlang va tizim imkoniyatlaridan to'liq foydalaning.
        </p>

        {/* Toggle Billing Cycle */}
        <div className="flex justify-center mt-10">
          <div className="bg-[var(--crm-card)] p-1.5 rounded-2xl border border-[var(--crm-border)] flex items-center shadow-xl">
            <button 
              onClick={() => setBillingCycle("Monthly")}
              className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${billingCycle === "Monthly" ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'}`}
            >
              Oylik
            </button>
            <button 
              onClick={() => setBillingCycle("Yearly")}
              className={`px-8 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2 ${billingCycle === "Yearly" ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/20' : 'text-[var(--crm-text-muted)] hover:text-[var(--crm-text)]'}`}
            >
              Yillik
              <span className="bg-green-500/20 text-green-500 text-[8px] px-1.5 py-0.5 rounded-md">-20%</span>
            </button>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {tariffs.map((t, idx) => (
          <motion.div
            key={t.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className={`relative bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[3rem] p-10 overflow-hidden group hover:scale-[1.02] transition-all duration-500 shadow-2xl ${t.popular ? 'border-purple-500/50 scale-[1.05] z-10' : ''}`}
          >
            {t.popular && (
              <div className="absolute top-0 right-10 transform -translate-y-1/2 bg-purple-600 text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-2 rounded-full shadow-xl">
                Ommabop
              </div>
            )}

            <div className="mb-10 flex items-center justify-between">
              <div className={`p-5 rounded-[2rem] bg-${t.color}-500/10 border border-${t.color}-500/20`}>
                {t.icon}
              </div>
              <div className="text-right">
                <p className="text-[10px] font-black uppercase text-[var(--crm-text-muted)] tracking-widest opacity-60">
                   {billingCycle === "Monthly" ? "Oylik to'lov" : "Yillik to'lov"}
                </p>
                <div className="flex items-end justify-end gap-1">
                  <span className="text-3xl font-black tracking-tighter italic">
                    {formatMoney(billingCycle === "Monthly" ? t.monthly : t.yearly)}
                  </span>
                  <span className="text-[10px] font-bold opacity-40 uppercase mb-1">UZS</span>
                </div>
              </div>
            </div>

            <div className="space-y-4 mb-10">
              <h3 className="text-2xl font-black uppercase tracking-tight">{t.name}</h3>
              <div className="flex flex-wrap gap-2">
                 <div className="flex items-center gap-1.5 bg-[var(--crm-bg)] px-3 py-1.5 rounded-full border border-[var(--crm-border)]">
                    <Users className="w-3 h-3 text-[var(--crm-text-muted)]" />
                    <span className="text-[10px] font-black uppercase tracking-wider">{t.limits.students === Infinity ? 'Cheksiz' : t.limits.students} o'quvchi</span>
                 </div>
                 <div className="flex items-center gap-1.5 bg-[var(--crm-bg)] px-3 py-1.5 rounded-full border border-[var(--crm-border)]">
                    <Briefcase className="w-3 h-3 text-[var(--crm-text-muted)]" />
                    <span className="text-[10px] font-black uppercase tracking-wider">{t.limits.staff === Infinity ? 'Cheksiz' : t.limits.staff} xodim</span>
                 </div>
              </div>
            </div>

            <ul className="space-y-5 mb-12 min-h-[280px]">
              {t.features.map((f, i) => (
                <li key={i} className="flex items-start gap-4">
                  <div className={`mt-0.5 p-1 rounded-full bg-green-500/10 text-green-500`}>
                    <Check className="w-3 h-3" />
                  </div>
                  <span className="text-sm font-bold opacity-70 leading-snug">{f}</span>
                </li>
              ))}
            </ul>

            <button className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] transition-all duration-300 shadow-xl ${t.popular ? 'bg-purple-600 text-white shadow-purple-600/30 hover:bg-purple-700' : 'bg-[var(--crm-bg)] border border-[var(--crm-border)] text-[var(--crm-text)] hover:border-purple-600 hover:text-purple-600'}`}>
              Tarifni Tanlash
            </button>
          </motion.div>
        ))}
      </div>

      <footer className="mt-20 text-center">
        <div className="inline-flex items-center gap-3 px-8 py-4 bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-full shadow-inner opacity-60">
           <Calendar className="w-5 h-5 text-purple-500" />
           <p className="text-sm font-bold">Sinov muddati: Yangi markazlar uchun 7 kun bepul demo rejim mavjud.</p>
        </div>
      </footer>
    </section>
  );
}
