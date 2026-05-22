'use client'

import { useState } from 'react'
import { confirmAndReleaseFundsAction } from '@/app/actions/workspace'
import { initiatePaymentAction } from '@/app/actions/payment'
import { submitReviewAction } from '@/app/actions/review'
import { CreditCard, CheckCircle, Loader2, BadgeDollarSign, Star, Send } from 'lucide-react'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

export function ClientWorkspaceActions({ booking, taskId, existingReview }: { booking: any, taskId: string, existingReview?: any }) {
  const [loading, setLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  
  // Review state
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const handlePayment = async () => {
    setLoading(true)
    const res = await initiatePaymentAction(booking.id)
    if (res.success && res.payment_url) {
      // Redirection vers CinetPay ou le Sandbox
      window.location.href = res.payment_url;
    } else {
      alert("Erreur: " + res.error);
      setLoading(false)
    }
  }

  const handleConfirm = async () => {
    setShowModal(false)
    setLoading(true)
    await confirmAndReleaseFundsAction(booking.id, taskId)
    setLoading(false)
  }

  const handleReview = async () => {
    if (!comment) return;
    setLoading(true);
    await submitReviewAction(booking.id, taskId, booking.client_id, booking.tasker_id, rating, comment);
    setLoading(false);
  }

  if (booking.status === 'pending_payment') {
    return (
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-emerald-100 mt-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Étape 1 : Sécuriser les fonds</h3>
        <p className="text-gray-600 mb-6">Pour que l'artisan commence le travail, vous devez déposer les <strong>{booking.total_client_amount || booking.agreed_amount} FCFA</strong> sur le compte séquestre de ayeJOB via Flooz ou TMoney (ce montant inclut 500 FCFA de frais d'assurance prestation).</p>
        <button 
          onClick={handlePayment} 
          disabled={loading}
          className="w-full bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
          Payer avec Flooz / TMoney (Simulation)
        </button>
      </div>
    )
  }

  if (booking.status === 'in_progress') {
    return (
      <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 mt-6 text-center">
        <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
        <h3 className="text-xl font-bold text-blue-900 mb-2">Travail en cours</h3>
        <p className="text-blue-700">L'argent est sécurisé. L'artisan est informé qu'il peut réaliser la mission. Attendez qu'il déclare avoir terminé.</p>
      </div>
    )
  }

  if (booking.status === 'completed') {
    return (
      <div className="bg-amber-50 p-8 rounded-3xl border border-amber-200 mt-6">
        <h3 className="text-xl font-bold text-amber-900 mb-2 text-center">L'artisan a terminé le travail !</h3>
        <p className="text-amber-800 text-center mb-6">Veuillez vérifier que la prestation correspond à vos attentes, puis validez pour libérer le paiement.</p>
        <button 
          onClick={() => setShowModal(true)} 
          disabled={loading}
          className="w-full bg-amber-500 text-white px-6 py-4 rounded-xl font-bold hover:bg-amber-600 transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/30"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle className="w-5 h-5" />}
          Le travail est parfait, libérer l'argent
        </button>

        <ConfirmModal
          isOpen={showModal}
          title="Libérer les fonds"
          icon={<BadgeDollarSign className="w-8 h-8" />}
          description={
            <>
              <p className="mb-2">Confirmez-vous que le travail a été <strong>parfaitement réalisé</strong> ?</p>
              <p className="text-sm">Les fonds seront immédiatement transférés sur le compte de l'artisan.</p>
            </>
          }
          onConfirm={handleConfirm}
          onCancel={() => setShowModal(false)}
          confirmText="Oui, payer l'artisan"
        />
      </div>
    )
  }

  if (booking.status === 'paid') {
    return (
      <div className="space-y-6 mt-6">
        <div className="bg-emerald-50 p-8 rounded-3xl border border-emerald-100 text-center">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-2xl font-black text-emerald-900 mb-2">Mission clôturée !</h3>
          <p className="text-emerald-700">L'argent a été transféré à l'artisan. Merci d'avoir utilisé ayeJOB !</p>
        </div>

        {/* Section Évaluation */}
        {existingReview ? (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm text-center">
            <h4 className="font-bold text-gray-900 mb-2">Votre avis a été publié</h4>
            <div className="flex justify-center gap-1 mb-3">
              {[1,2,3,4,5].map(i => (
                <Star key={i} className={`w-6 h-6 ${i <= existingReview.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200'}`} />
              ))}
            </div>
            <p className="text-gray-600 text-sm italic">"{existingReview.comment}"</p>
          </div>
        ) : (
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
            <h4 className="font-bold text-gray-900 mb-4 text-center">Évaluer l'artisan</h4>
            <div className="flex justify-center gap-2 mb-6">
              {[1,2,3,4,5].map(i => (
                <button 
                  key={i} 
                  onClick={() => setRating(i)}
                  className={`p-2 rounded-full transition ${rating >= i ? 'text-amber-400 hover:text-amber-500' : 'text-gray-300 hover:text-amber-200'}`}
                >
                  <Star className={`w-10 h-10 ${rating >= i ? 'fill-current' : ''}`} />
                </button>
              ))}
            </div>
            <textarea 
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Un petit mot sur la qualité de son travail..."
              className="w-full border border-gray-200 rounded-xl p-4 mb-4 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
              rows={3}
            />
            <button 
              onClick={handleReview}
              disabled={loading || !comment}
              className="w-full bg-gray-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-black transition flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              Publier mon avis
            </button>
          </div>
        )}
      </div>
    )
  }

  return null;
}
