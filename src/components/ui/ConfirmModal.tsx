'use client'

import React from 'react'
import { AlertCircle } from 'lucide-react'

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: React.ReactNode;
}

export function ConfirmModal({
  isOpen,
  title,
  description,
  confirmText = "Confirmer",
  cancelText = "Annuler",
  onConfirm,
  onCancel,
  icon
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="bg-emerald-50 p-6 flex flex-col items-center text-center border-b border-emerald-100">
          <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            {icon || <AlertCircle className="w-8 h-8" />}
          </div>
          <h3 className="text-2xl font-black text-emerald-900 mb-1">{title}</h3>
        </div>
        
        <div className="p-6 text-center text-gray-600 text-lg">
          {description}
        </div>
        
        <div className="p-6 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center gap-4">
          <button 
            onClick={onCancel}
            className="w-full sm:flex-1 px-4 py-3.5 rounded-xl font-bold text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 hover:text-gray-900 transition focus:ring-2 focus:ring-emerald-500/20"
          >
            {cancelText}
          </button>
          <button 
            onClick={onConfirm}
            className="w-full sm:flex-1 px-4 py-3.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 transition shadow-lg shadow-emerald-500/30 flex justify-center items-center gap-2 focus:ring-2 focus:ring-emerald-500/50"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}
