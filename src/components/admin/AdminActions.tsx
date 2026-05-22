'use client'

import { useState } from 'react'
import { approveTaskerAction, rejectTaskerAction } from '@/app/actions/admin'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

export function AdminActions({ taskerId }: { taskerId: string }) {
  const [loading, setLoading] = useState(false)
  const [modalState, setModalState] = useState<{isOpen: boolean, type: 'approve' | 'reject' | null}>({ isOpen: false, type: null })

  const handleApprove = async () => {
    setModalState({ isOpen: false, type: null })
    setLoading(true)
    await approveTaskerAction(taskerId)
    setLoading(false)
  }

  const handleReject = async () => {
    setModalState({ isOpen: false, type: null })
    setLoading(true)
    await rejectTaskerAction(taskerId)
    setLoading(false)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setModalState({ isOpen: true, type: 'reject' })}
          disabled={loading}
          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
          title="Refuser"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
        </button>
        <button 
          onClick={() => setModalState({ isOpen: true, type: 'approve' })}
          disabled={loading}
          className="px-4 py-2 bg-emerald-600 text-white font-bold rounded-lg hover:bg-emerald-700 transition flex items-center gap-2 shadow-sm disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
          Approuver
        </button>
      </div>

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'approve'}
        title="Approuver cet artisan"
        description="Êtes-vous sûr de vouloir approuver ce profil ? Il pourra immédiatement accepter des missions sur la plateforme."
        confirmText="Oui, approuver"
        cancelText="Annuler"
        onConfirm={handleApprove}
        onCancel={() => setModalState({ isOpen: false, type: null })}
        icon={<CheckCircle className="w-8 h-8" />}
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'reject'}
        title="Refuser cet artisan"
        description="Êtes-vous sûr de vouloir refuser ce profil ? Cette action changera son statut en non vérifié."
        confirmText="Oui, refuser"
        cancelText="Annuler"
        onConfirm={handleReject}
        onCancel={() => setModalState({ isOpen: false, type: null })}
        icon={<XCircle className="w-8 h-8" />}
      />
    </>
  )
}
