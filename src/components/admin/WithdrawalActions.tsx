'use client'

import { useState } from 'react'
import { approveWithdrawalAction, rejectWithdrawalAction } from '@/app/actions/admin'
import { CheckCircle, XCircle, Loader2, Send } from 'lucide-react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

export function WithdrawalActions({ withdrawalId, taskerId }: { withdrawalId: string, taskerId: string }) {
  const [loading, setLoading] = useState(false)
  const [modalState, setModalState] = useState<{isOpen: boolean, type: 'approve' | 'reject' | null}>({ isOpen: false, type: null })

  const handleApprove = async () => {
    setModalState({ isOpen: false, type: null })
    setLoading(true)
    await approveWithdrawalAction(withdrawalId, taskerId)
    setLoading(false)
  }

  const handleReject = async () => {
    setModalState({ isOpen: false, type: null })
    setLoading(true)
    await rejectWithdrawalAction(withdrawalId, taskerId)
    setLoading(false)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button 
          onClick={() => setModalState({ isOpen: true, type: 'reject' })}
          disabled={loading}
          className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition disabled:opacity-50"
          title="Refuser le retrait"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
        </button>
        <button 
          onClick={() => setModalState({ isOpen: true, type: 'approve' })}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 transition flex items-center gap-2 shadow-sm disabled:opacity-50"
          title="Marquer comme payé"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
          Argent envoyé
        </button>
      </div>

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'approve'}
        title="Confirmer l'envoi"
        description="Avez-vous bien transféré l'argent à l'artisan via TMoney ou Flooz ? Cette action est irréversible et clôturera la demande."
        confirmText="Oui, argent envoyé"
        cancelText="Annuler"
        onConfirm={handleApprove}
        onCancel={() => setModalState({ isOpen: false, type: null })}
        icon={<Send className="w-8 h-8" />}
      />

      <ConfirmModal
        isOpen={modalState.isOpen && modalState.type === 'reject'}
        title="Refuser le retrait"
        description="Êtes-vous sûr de vouloir refuser cette demande de retrait ? L'artisan en sera notifié."
        confirmText="Oui, refuser"
        cancelText="Annuler"
        onConfirm={handleReject}
        onCancel={() => setModalState({ isOpen: false, type: null })}
        icon={<XCircle className="w-8 h-8" />}
      />
    </>
  )
}
