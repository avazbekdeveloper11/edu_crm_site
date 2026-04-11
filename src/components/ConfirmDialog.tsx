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
  const colors = {
    danger: "bg-red-500",
    warning: "bg-yellow-500",
    info: "bg-blue-500",
    success: "bg-green-500"
  };

  const shadowColors = {
    danger: "shadow-red-600/30",
    warning: "shadow-yellow-600/30",
    info: "shadow-blue-600/30",
    success: "shadow-green-600/30"
  };

  const iconColors = {
    danger: "text-red-500",
    warning: "text-yellow-500",
    info: "text-blue-500",
    success: "text-green-500"
  };

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
            className="w-full max-w-sm bg-[var(--crm-card)] border border-[var(--crm-border)] rounded-[2.5rem] p-8 sm:p-10 relative z-10 shadow-[0_30px_100px_rgba(0,0,0,0.5)] overflow-hidden text-center"
          >
            <div className={`absolute top-0 right-0 w-32 h-32 ${colors[type]} opacity-5 blur-3xl -mr-16 -mt-16 rounded-full`} />
            
            <div className={`w-16 h-16 ${colors[type]} bg-opacity-10 rounded-2xl flex items-center justify-center ${iconColors[type]} mx-auto mb-8 shadow-inner`}>
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
                className={`w-full py-4 ${colors[type]} text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl ${shadowColors[type]} hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-2`}
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
