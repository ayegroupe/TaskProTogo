'use client'

import { useState } from 'react'
import { requestWithdrawalAction } from '@/app/actions/withdrawal'
import { Loader2, ArrowRight } from 'lucide-react'

export function WithdrawalForm({ taskerId, availableBalance }: { taskerId: string, availableBalance: number }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [amount, setAmount] = useState('')
  const [phone, setPhone] = useState('')
  const [operator, setOperator] = useState('TMoney')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(''); setSuccess(false);

    const numAmount = parseInt(amount, 10);
    if (isNaN(numAmount) || numAmount <= 0) {
      setError("Montant invalide."); return;
    }

    setLoading(true)
    const result = await requestWithdrawalAction(taskerId, numAmount, phone, operator);
    
    if (result.success) {
      setSuccess(true)
      setAmount('')
    } else {
      setError(result.error || "Erreur lors de la demande")
    }
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
      <h2 className="text-xl font-bold mb-6">Demander un retrait</h2>
      
      {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl border border-red-100">{error}</div>}
      {success && <div className="mb-6 p-4 bg-emerald-50 text-emerald-700 rounded-xl border border-emerald-100 font-medium">Demande envoyée ! Les fonds seront transférés sous 24h.</div>}

      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Montant à retirer (FCFA)</label>
          <input 
            type="number" 
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            placeholder="Ex: 5000"
            max={availableBalance}
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
            required 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Opérateur</label>
          <div className="grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setOperator('TMoney')} className={`p-3 rounded-xl border text-sm font-bold transition ${operator === 'TMoney' ? 'border-yellow-500 bg-yellow-50 text-yellow-700' : 'border-gray-200 text-gray-500'}`}>
              TMoney
            </button>
            <button type="button" onClick={() => setOperator('Flooz')} className={`p-3 rounded-xl border text-sm font-bold transition ${operator === 'Flooz' ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 text-gray-500'}`}>
              Moov Flooz
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone ({operator})</label>
          <div className="flex">
            <span className="bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl px-4 flex items-center text-gray-600 font-medium">+228</span>
            <input 
              type="tel" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)} 
              placeholder="90 00 00 00" 
              maxLength={8}
              className="flex-1 border rounded-r-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
              required 
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={loading || availableBalance < 1000}
          className="w-full mt-4 bg-emerald-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-emerald-700 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/30 disabled:opacity-50"
        >
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Confirmer le retrait <ArrowRight className="w-5 h-5" /></>}
        </button>
        {availableBalance < 1000 && (
          <p className="text-center text-xs text-gray-500 mt-2">Solde minimum requis : 1000 FCFA</p>
        )}
      </div>
    </form>
  )
}
