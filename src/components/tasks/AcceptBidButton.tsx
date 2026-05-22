'use client'

import { useState } from 'react'
import { acceptBidAction } from '@/app/actions/acceptBid'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

interface AcceptBidButtonProps {
  bidId: string
  taskId: string
  taskerId: string
  clientId: string
  amount: number
}

export function AcceptBidButton({ bidId, taskId, taskerId, clientId, amount }: AcceptBidButtonProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showModal, setShowModal] = useState(false)

  const handleConfirm = async () => {
    setShowModal(false)
    setLoading(true)
    setError('')

    const res = await acceptBidAction(bidId, taskId, taskerId, clientId, amount)
    
    if (!res.success) {
      setError(res.error || "Une erreur est survenue")
      setLoading(false)
    }
    // Si c'est un succès, la Server Action fait un revalidatePath qui rafraîchit la page !
  }

  return (
    <div>
      {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
      <button 
        onClick={() => setShowModal(true)}
        disabled={loading}
        className="w-full bg-emerald-600 text-white px-4 py-3 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
      >
        {loading ? (
          <Loader2 className="w-5 h-5 animate-spin" />
        ) : (
          <>
            <CheckCircle2 className="w-5 h-5" /> Accepter l'offre
          </>
        )}
      </button>

      <ConfirmModal
        isOpen={showModal}
        title="Confirmer le choix"
        icon={<AlertCircle className="w-8 h-8" />}
        description={
          <>
            <p className="mb-2">Êtes-vous sûr de vouloir confier cette mission à cet artisan pour le montant convenu de <strong className="text-gray-900">{amount} FCFA</strong> ?</p>
            <p className="text-sm mt-4">Cette action est définitive. L'artisan sera notifié immédiatement pour planifier l'intervention.</p>
          </>
        }
        onConfirm={handleConfirm}
        onCancel={() => setShowModal(false)}
        confirmText="Confirmer"
      />
    </div>
  )
}
