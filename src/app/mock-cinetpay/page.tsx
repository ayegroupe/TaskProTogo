'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, ShieldCheck, Lock } from 'lucide-react'

function MockCinetPayContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const transactionId = searchParams.get('transaction_id')
  const amount = searchParams.get('amount')
  const taskId = searchParams.get('task_id')

  const [loading, setLoading] = useState(false)

  const handleSimulatePayment = async () => {
    setLoading(true)

    // Simuler l'appel que CinetPay ferait à notre webhook
    try {
      await fetch('/api/webhooks/cinetpay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cpm_site_id: "sandbox_site",
          cpm_trans_id: transactionId,
          cpm_amount: amount,
          status: "ACCEPTED"
        })
      });

      // Rediriger le client vers l'espace de travail avec un message de succès
      router.push(`/client/tasks/${taskId}/workspace?payment=success`)
    } catch (error) {
      console.error("Mock payment failed", error)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-3xl shadow-xl overflow-hidden border border-gray-100">
        
        {/* Fake CinetPay Header */}
        <div className="bg-gray-900 text-white p-6 text-center">
          <div className="flex justify-center mb-4">
            <div className="bg-white/10 p-3 rounded-2xl backdrop-blur-md">
              <ShieldCheck className="w-10 h-10 text-emerald-400" />
            </div>
          </div>
          <h1 className="text-xl font-bold">CinetPay Sandbox</h1>
          <p className="text-gray-400 text-sm mt-1">Plateforme de paiement sécurisée</p>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <p className="text-sm text-gray-500 font-medium mb-1">Montant à payer</p>
            <p className="text-4xl font-black text-gray-900">{amount} <span className="text-lg text-gray-500">FCFA</span></p>
            <p className="text-xs text-gray-400 mt-2">Ref: {transactionId}</p>
          </div>

          <div className="space-y-4 mb-8">
            <div className="p-4 border-2 border-yellow-400 bg-yellow-50 rounded-2xl flex items-center justify-between cursor-pointer">
              <span className="font-bold text-yellow-800">TMoney Togo</span>
              <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/c2/Togo_Cellulaire_logo.svg/1200px-Togo_Cellulaire_logo.svg.png" alt="TMoney" className="h-6" onError={(e) => e.currentTarget.style.display = 'none'} />
            </div>
            <div className="p-4 border border-gray-200 hover:border-blue-400 hover:bg-blue-50 rounded-2xl flex items-center justify-between cursor-pointer transition">
              <span className="font-bold text-gray-700">Moov Flooz</span>
            </div>
            <div className="p-4 border border-gray-200 hover:border-purple-400 hover:bg-purple-50 rounded-2xl flex items-center justify-between cursor-pointer transition">
              <span className="font-bold text-gray-700">Carte Bancaire</span>
            </div>
          </div>

          <button 
            onClick={handleSimulatePayment} 
            disabled={loading}
            className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Lock className="w-5 h-5" />}
            Payer {amount} FCFA (Sandbox)
          </button>
          
          <p className="text-center text-xs text-gray-400 mt-6 px-4">
            Ceci est une page de simulation intégrée par votre développeur. Aucun montant réel ne sera débité.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function MockCinetPayPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-emerald-500" /></div>}>
      <MockCinetPayContent />
    </Suspense>
  )
}
