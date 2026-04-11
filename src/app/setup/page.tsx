"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Settings,
  Terminal,
  Database,
  MessageSquare,
  AlertCircle,
  CheckCircle2,
  Activity,
  HardDrive,
  Cpu,
  LayoutDashboard,
  ShieldCheck,
  Users,
  PlusCircle,
  Trash2,
  Edit3
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getApiBaseUrl } from "@/app/constants";

export default function SetupDashboard() {
  const router = useRouter();
  const [isAuth, setIsAuth] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [centers, setCenters] = useState<any[]>([]);
  const [newCenter, setNewCenter] = useState({ 
    name: "", 
    login: "", 
    pass: "", 
    botToken: "",
    tariff: "Standart",
    tariffType: "Monthly",
    tariffStartedAt: "",
    tariffExpiresAt: ""
  });
  const [config, setConfig] = useState({
    botToken: "**********",
    dbUrl: "postgresql://localhost:5432/edu_crm",
    port: "3001"
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [apiUrl, setApiUrl] = useState("");

  useEffect(() => {
    setApiUrl(getApiBaseUrl());
  }, []);

  const fetchCenters = async () => {
    const token = localStorage.getItem("access_token");
    const currentApiUrl = getApiBaseUrl();
    try {
      const response = await fetch(`${currentApiUrl}/centers`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setCenters(data);
      }
    } catch (err) {
      console.error("Failed to fetch centers", err);
    }
  };

  const handleCreateOrUpdate = async () => {
    if (!newCenter.name || !newCenter.login || !newCenter.pass) return;
    const token = localStorage.getItem("access_token");
    const currentApiUrl = getApiBaseUrl();
    const url = isEditing
      ? `${currentApiUrl}/centers/${editingId}`
      : `${currentApiUrl}/centers`;

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
           ...newCenter,
           tariffStartedAt: newCenter.tariffStartedAt || new Date().toISOString(),
           tariffExpiresAt: newCenter.tariffExpiresAt || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
        }),
      });

      if (response.ok) {
        fetchCenters();
        closeModal();
      }
    } catch (err) {
      console.error("Failed to save center", err);
    }
  };

  const openEdit = (center: any) => {
    setNewCenter({
      name: center.name,
      login: center.login,
      pass: center.password || center.pass,
      botToken: center.botToken || "",
      tariff: center.tariff || "Standart",
      tariffType: center.tariffType || "Monthly",
      tariffStartedAt: center.tariffStartedAt ? new Date(center.tariffStartedAt).toISOString().split('T')[0] : "",
      tariffExpiresAt: center.tariffExpiresAt ? new Date(center.tariffExpiresAt).toISOString().split('T')[0] : ""
    });
    setEditingId(center.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setIsEditing(false);
    setNewCenter({ name: "", login: "", pass: "", botToken: "", tariff: "Standart", tariffType: "Monthly", tariffStartedAt: "", tariffExpiresAt: "" });
    setEditingId(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    const userData = localStorage.getItem("user");
    const user = userData ? JSON.parse(userData) : null;

    if (!token || user?.role !== "SUPER_ADMIN") {
      router.push("/setup/login");
    } else {
      setIsAuth(true);
      fetchCenters();
    }
  }, [router]);

  if (!isAuth) return null;

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 flex font-sans relative">
      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="w-full max-w-md bg-[#0a0a0a] border border-white/10 p-8 rounded-3xl shadow-2xl relative max-h-[90vh] overflow-y-auto no-scrollbar"
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">
                  {isEditing ? "Markazni Tahrirlash" : "Yangi Markaz Qo'shish"}
                </h2>
                {!isEditing && (
                  <button 
                    onClick={() => {
                        const now = new Date();
                        const nextWeek = new Date();
                        nextWeek.setDate(now.getDate() + 7);
                        setNewCenter({
                          ...newCenter,
                          tariff: "Standart",
                          tariffType: "Monthly",
                          tariffStartedAt: now.toISOString().split('T')[0],
                          tariffExpiresAt: nextWeek.toISOString().split('T')[0]
                        });
                    }}
                    className="text-[10px] bg-purple-600/20 text-purple-500 border border-purple-500/20 px-3 py-1.5 rounded-lg font-black uppercase tracking-widest hover:bg-purple-600 hover:text-white transition-all"
                  >
                    7 Kunlik Demo
                  </button>
                )}
              </div>
              <div className="space-y-4">
                <InputField
                  label="Markaz Nomi"
                  value={newCenter.name}
                  onChange={(e: any) => setNewCenter({ ...newCenter, name: e.target.value })}
                />
                <InputField
                  label="Login"
                  value={newCenter.login}
                  onChange={(e: any) => setNewCenter({ ...newCenter, login: e.target.value })}
                />
                <InputField
                  label="Parol"
                  value={newCenter.pass}
                  onChange={(e: any) => setNewCenter({ ...newCenter, pass: e.target.value })}
                />
                <InputField
                  label="Telegram Bot Token"
                  value={newCenter.botToken}
                  onChange={(e: any) => setNewCenter({ ...newCenter, botToken: e.target.value })}
                  placeholder="7483...:AAH... (optional)"
                />
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1.5">
                      <label className="text-xs text-gray-500 uppercase tracking-widest font-bold ml-1">Tarif</label>
                      <select 
                        value={newCenter.tariff}
                        onChange={(e) => setNewCenter({ ...newCenter, tariff: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-all text-sm appearance-none"
                      >
                         <option value="Standart" className="bg-[#0a0a0a]">Standart</option>
                         <option value="Premium" className="bg-[#0a0a0a]">Premium</option>
                         <option value="VIP" className="bg-[#0a0a0a]">VIP</option>
                      </select>
                   </div>
                   <div className="space-y-1.5">
                      <label className="text-xs text-gray-500 uppercase tracking-widest font-bold ml-1">Turi</label>
                      <select 
                        value={newCenter.tariffType}
                        onChange={(e) => setNewCenter({ ...newCenter, tariffType: e.target.value })}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-all text-sm appearance-none"
                      >
                         <option value="Monthly" className="bg-[#0a0a0a]">Oylik</option>
                         <option value="Yearly" className="bg-[#0a0a0a]">Yillik</option>
                      </select>
                   </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                   <InputField 
                    label="Boshlanish sanasi" 
                    type="date" 
                    value={newCenter.tariffStartedAt} 
                    onChange={(e: any) => setNewCenter({ ...newCenter, tariffStartedAt: e.target.value })} 
                   />
                   <InputField 
                    label="Tugash sanasi" 
                    type="date" 
                    value={newCenter.tariffExpiresAt} 
                    onChange={(e: any) => setNewCenter({ ...newCenter, tariffExpiresAt: e.target.value })} 
                   />
                </div>
              </div>
              <div className="flex gap-3 mt-8">
                <button
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 bg-white/5 hover:bg-white/10 rounded-xl font-bold transition-all text-gray-300"
                >
                  Bekor qilish
                </button>
                <button
                  onClick={handleCreateOrUpdate}
                  className="flex-1 px-4 py-3 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold transition-all text-white"
                >
                  {isEditing ? "Saqlash" : "Qo'shish"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Sidebar */}
      <aside className="w-72 bg-[#0a0a0a] border-r border-white/5 p-6 flex flex-col gap-10">
        <div className="flex items-center gap-3 px-2">
          <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30">
            <LayoutDashboard className="w-6 h-6 text-white" />
          </div>
          <span className="text-xl font-bold tracking-tight">EDU<span className="text-purple-500">MARKAZ</span></span>
        </div>

        <nav className="flex flex-col gap-2">
          <NavItem icon={<Settings className="w-5 h-5" />} label="General Settings" active />
          <NavItem icon={<MessageSquare className="w-5 h-5" />} label="Telegram Bot" />
          <NavItem icon={<Database className="w-5 h-5" />} label="Database" />
          <NavItem icon={<Terminal className="w-5 h-5" />} label="Logs" />
        </nav>

        <div className="mt-auto">
          <button
            onClick={() => { localStorage.clear(); router.push("/setup/login"); }}
            className="w-full p-4 rounded-xl border border-red-500/20 bg-red-500/5 text-red-500 text-sm font-bold hover:bg-red-500/10 transition-all flex items-center justify-center gap-2"
          >
            Chiqish
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-10 overflow-y-auto">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-2">Tizim Sozlamalari</h1>
            <p className="text-gray-500">Loyiha infratuzilmasini bu yerda boshqarishingiz mumkin.</p>
          </div>
          <div className="flex items-center gap-4">
            <StatusBadge icon={<Activity className="w-3 h-3 text-green-500" />} text="System Running" />
          </div>
        </header>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <StatCard title="CPU Usage" value="12%" icon={<Cpu className="text-blue-500" />} />
          <StatCard title="Memory" value="2.4 GB" icon={<HardDrive className="text-purple-500" />} />
          <StatCard title="Connected DB" value="Postgres" icon={<Database className="text-yellow-500" />} />
          <StatCard title="Active Centers" value={centers.length} icon={<ShieldCheck className="text-green-500" />} />
        </div>

        {/* Centers Management Section */}
        <section className="mb-10 p-8 rounded-3xl bg-[#0a0a0a] border border-white/5 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Users className="w-6 h-6 text-purple-500" />
              <div>
                <h2 className="text-xl font-bold">Markazlar Boshqaruvi</h2>
                <p className="text-sm text-gray-500">Yangi o'quv markazlari qo'shish va ularga kirish huquqini berish.</p>
              </div>
            </div>
            <button
              onClick={() => setShowModal(true)}
              className="px-5 py-2 bg-purple-600 rounded-xl font-bold text-sm tracking-tight hover:bg-purple-500 transition-all flex items-center gap-2"
            >
              <PlusCircle className="w-4 h-4" />
              Yangi Markaz Qo'shish
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-gray-500 text-xs font-bold uppercase tracking-widest">
                  <th className="pb-4 pl-4">Markaz Nomi</th>
                  <th className="pb-4">Admin Login</th>
                  <th className="pb-4">Tarif</th>
                  <th className="pb-4">Muddat</th>
                  <th className="pb-4">Status</th>
                  <th className="pb-4 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="text-sm font-medium">
                {centers.map(center => (
                  <CenterRow
                    key={center.id}
                    {...center}
                    onEdit={() => openEdit(center)}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Configuration Section */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="p-8 rounded-3xl bg-[#0a0a0a] border border-white/5 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <MessageSquare className="w-6 h-6 text-purple-500" />
              <h2 className="text-xl font-bold">Bot Sozlamalari</h2>
            </div>
            <div className="space-y-4">
              <InputField label="Bot Token (Telegram)" value={config.botToken} disabled />
              <InputField label="Webhook URL" value={`${apiUrl}/bot`} disabled />
            </div>
            <button className="px-6 py-3 bg-purple-600 rounded-xl font-bold hover:bg-purple-500 transition-all opacity-50 cursor-not-allowed">
              Update Bot Token (Coming Soon)
            </button>
          </div>

          <div className="p-8 rounded-3xl bg-[#0a0a0a] border border-white/5 space-y-6">
            <div className="flex items-center gap-3 mb-4">
              <Database className="w-6 h-6 text-blue-500" />
              <h2 className="text-xl font-bold">Database & Backend</h2>
            </div>
            <div className="space-y-4">
              <InputField label="Backend URL" value={apiUrl} disabled />
              <div className="grid grid-cols-2 gap-4">
                <InputField label="Port" value={config.port} disabled />
                <InputField label="Environment" value="Production" disabled />
              </div>
            </div>
            <button className="px-6 py-3 bg-blue-600 rounded-xl font-bold hover:bg-blue-500 transition-all opacity-50 cursor-not-allowed">
              Save Changes (Coming Soon)
            </button>
          </div>
        </section>

        {/* Health Check */}
        <div className="mt-10 p-6 rounded-2xl bg-green-500/5 border border-green-500/20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-bold">Hozirgi Holat: Mukammal</p>
              <p className="text-sm text-gray-500 text-xs mt-0.5">Barcha servislar (Backend, Frontend, Bot) faol va bog'langan.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function CenterRow({ name, login, tariff, tariffType, tariffExpiresAt, onEdit }: any) {
  const getStatus = () => {
    if (!tariffExpiresAt) return { label: "Noma'lum", color: "bg-gray-500/10 text-gray-500" };
    const expiry = new Date(tariffExpiresAt);
    const now = new Date();
    const diffDays = Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return { label: "Muddati o'tgan", color: "bg-red-500/10 text-red-500" };
    if (diffDays <= 3) return { label: "Tugash arafasida", color: "bg-orange-500/10 text-orange-500 animate-pulse" };
    return { label: "Faol", color: "bg-green-500/10 text-green-500" };
  };

  const status = getStatus();

  return (
    <tr className="group border-b border-white/5 last:border-0 hover:bg-white/5 transition-colors">
      <td className="py-4 pl-4 font-bold">{name}</td>
      <td className="py-4 text-gray-400 font-mono text-xs">{login}</td>
      <td className="py-4">
        <span className={`px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider ${
          tariff === "VIP" ? "bg-orange-500/10 text-orange-500" : 
          tariff === "Premium" ? "bg-purple-500/10 text-purple-500" : 
          "bg-blue-500/10 text-blue-500"
        }`}>
          {tariff || "Standart"} <span className="opacity-40 ml-1 text-[8px] italic">({tariffType === 'Monthly' ? 'M' : 'Y'})</span>
        </span>
      </td>
      <td className="py-4">
         <div className="text-[10px] font-bold text-gray-400">
            {tariffExpiresAt ? new Date(tariffExpiresAt).toLocaleDateString() : "Sana yo'q"}
         </div>
         <div className="text-[8px] opacity-40 uppercase tracking-tighter">
            {tariffExpiresAt && Math.ceil((new Date(tariffExpiresAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} kun qoldi
         </div>
      </td>
      <td className="py-4">
        <span className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest border border-current opacity-80 ${status.color}`}>
          {status.label}
        </span>
      </td>
      <td className="py-4 pr-4 transition-all lg:opacity-0 group-hover:opacity-100">
        <div className="flex justify-end gap-2">
          <button
            onClick={onEdit}
            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg transition-all text-gray-400 hover:text-white"
          >
            <Edit3 className="w-4 h-4" />
          </button>
          <button className="p-2 bg-red-500/10 hover:bg-red-500/20 rounded-lg transition-all text-red-500">
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
}

function NavItem({ icon, label, active = false }: { icon: any, label: string, active?: boolean }) {
  return (
    <div className={`
      flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all
      ${active ? "bg-purple-600/10 text-purple-500" : "text-gray-500 hover:text-white hover:bg-white/5"}
    `}>
      {icon}
      <span className="font-medium">{label}</span>
    </div>
  );
}

function StatCard({ title, value, icon }: any) {
  return (
    <div className="p-6 rounded-3xl bg-[#0a0a0a] border border-white/5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-gray-500 text-sm">{title}</span>
        {icon}
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}

function StatusBadge({ icon, text }: any) {
  return (
    <div className="flex items-center gap-2 px-4 py-2 rounded-full border border-green-500/20 bg-green-500/5 text-green-500 text-xs font-bold uppercase tracking-wider">
      <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
      {text}
    </div>
  );
}

function InputField({ label, value, type = "text", disabled = false, onChange }: any) {
  return (
    <div className="space-y-1.5">
      <label className="text-xs text-gray-500 uppercase tracking-widest font-bold ml-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500 transition-all text-sm disabled:opacity-50"
      />
    </div>
  );
}
