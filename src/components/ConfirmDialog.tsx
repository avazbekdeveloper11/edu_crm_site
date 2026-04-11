"use client";

import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle, X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "warning" | "info" | "success";
  loading?: boolean;
  isAlert?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = "Ha, davom etish",
  cancelText = "Bekor qilish",
  type = "danger",
  loading = false,
  isAlert = false
}: ConfirmDialogProps) {
  const dialogColors = {
    danger: { bg: "bg-red-500/20", icon: "text-red-500", btn: "bg-red-600", shadow: "shadow-red-900/40" },
    warning: { bg: "bg-yellow-500/20", icon: "text-yellow-500", btn: "bg-yellow-600", shadow: "shadow-yellow-900/40" },
    info: { bg: "bg-blue-500/20", icon: "text-blue-500", btn: "bg-blue-600", shadow: "shadow-blue-900/40" },
    success: { bg: "bg-green-500/20", icon: "text-green-500", btn: "bg-green-600", shadow: "shadow-green-900/40" }
  };

  const current = dialogColors[type];

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-6 backdrop-blur-md">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/70"
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-sm bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[3.5rem] p-10 sm:p-12 relative z-10 shadow-[0_40px_120px_rgba(0,0,0,0.6)] overflow-hidden text-center"
          >
            <div className={`absolute top-0 right-0 w-40 h-40 ${current.bg} opacity-10 blur-3xl -mr-20 -mt-20 rounded-full`} />
            
            <div className={`w-16 h-16 ${current.bg} rounded-2xl flex items-center justify-center ${current.icon} mx-auto mb-8 shadow-inner`}>
              <AlertCircle className="w-8 h-8" />
            </div>
            
            <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-4 text-[var(--crm-text)]">{title}</h3>
            <p className="text-[var(--crm-text-muted)] text-[10px] font-black uppercase tracking-widest opacity-60 leading-relaxed mb-10 px-4 whitespace-pre-wrap">
              {message}
            </p>
            
            <div className="flex flex-col gap-3">
              <button 
                onClick={() => {
                  onConfirm();
                }}
                disabled={loading}
                className={`w-full py-4 ${current.btn} text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl ${current.shadow} hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2`}
              >
                {loading && <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />}
                {isAlert ? "Tushunarli" : confirmText}
              </button>
              
              {!isAlert && (
                <button 
                  onClick={onClose}
                  className="w-full py-4 bg-[var(--crm-bg)] text-[var(--crm-text-muted)] border border-[var(--crm-border)] rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-[var(--crm-border)] transition-all"
                >
                  {cancelText}
                </button>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
