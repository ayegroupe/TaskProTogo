'use client'

import { useState } from 'react'
import { markAsCompletedAction } from '@/app/actions/workspace'
import { Loader2, CheckCircle, ShieldAlert, BadgeCheck } from 'lucide-react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

export function TaskerWorkspaceActions({ booking, taskId }: { booking: any, taskId: string }) {
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)

  const handleComplete = async () => {
    setShowModal(false)
    setLoading(true)
    await markAsCompletedAction(booking.id, taskId)
    setLoading(false)
  }

  if (booking.status === 'pending_payment') {
    return (
      <div className="bg-red-50 p-8 rounded-3xl border border-red-100 mt-6 text-center">
        <ShieldAlert className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-red-900 mb-2">Ne commencez pas le travail !</h3>
        <p className="text-red-700">Le client n'a pas encore déposé les fonds sur la plateforme. Attendez le signal de sécurité avant de vous déplacer.</p>
      </div>
    )
  }

  if (booking.status === 'in_progress') {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-500 mt-6 ring-4 ring-emerald-50">
        <div className="flex items-center gap-2 text-emerald-700 font-bold mb-4 justify-center">
          <CheckCircle className="w-6 h-6" /> Fonds sécurisés
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2 text-center">Au travail !</h3>
        <p className="text-gray-600 mb-6 text-center">L'argent est bloqué par ayeJOB. Vous pouvez réaliser la mission en toute sécurité. Cliquez sur le bouton ci-dessous quand c'est fini.</p>
        <button 
          onClick={() => setShowModal(true)} 
          disabled={loading}
          className="w-full bg-emerald-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
          J'ai terminé le travail
        </button>

        <ConfirmModal
          isOpen={showModal}
          title="Confirmer la fin"
          icon={<BadgeCheck className="w-8 h-8" />}
          description={
            <>
              <p className="mb-2">Avez-vous <strong>totalement terminé</strong> la prestation chez le client ?</p>
              <p className="text-sm">Le client sera notifié pour vérifier et libérer votre paiement.</p>
            </>
          }
          onConfirm={handleComplete}
          onCancel={() => setShowModal(false)}
          confirmText="Oui, c'est fini"
        />
      </div>
    )
  }

  if (booking.status === 'completed') {
    return (
      <div className="bg-amber-50 p-8 rounded-3xl border border-amber-200 mt-6 text-center">
        <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-4" />
        <h3 className="text-xl font-bold text-amber-900 mb-2">En attente de confirmation</h3>
        <p className="text-amber-800">Le client doit vérifier le travail et libérer le paiement depuis son application. Veuillez patienter.</p>
      </div>
    )
  }

  if (booking.status === 'paid') {
    return (
      <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 mt-6 text-center">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-2xl font-black text-emerald-900 mb-2">Paiement reçu !</h3>
        <p className="text-emerald-700">Les fonds ont été ajoutés à votre portefeuille virtuel. Mission accomplie !</p>
      </div>
    )
  }

  return null;
}
