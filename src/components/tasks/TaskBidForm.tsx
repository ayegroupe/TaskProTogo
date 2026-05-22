'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Send, CheckCircle2 } from 'lucide-react'

export function TaskBidForm({ taskId, taskerId, minBudget }: { taskId: string, taskerId: string, minBudget?: number }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    amount: minBudget || '',
    message: '',
    estimated_duration: ''
  })

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true); setError(''); setSuccess(false);
    
    if (!formData.amount || !formData.message) {
      setError('Le montant et le message sont obligatoires.');
      setLoading(false);
      return;
    }

    const payload = {
      task_id: taskId,
      tasker_id: taskerId,
      amount: parseInt(formData.amount.toString()),
      message: formData.message,
      estimated_duration: formData.estimated_duration
    };

    const { error } = await supabase.from('task_bids').insert([payload])
    
    if (error) {
      if (error.code === '23505') {
        setError("Vous avez déjà soumis une offre pour cette mission.");
      } else {
        setError(error.message);
      }
    } else {
      setSuccess(true)
      router.refresh()
    }
    setLoading(false)
  }

  if (success) {
    return (
      <div className="bg-emerald-50 border border-emerald-100 p-8 rounded-3xl text-center shadow-sm">
        <CheckCircle2 className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold text-emerald-900 mb-2">Offre envoyée !</h3>
        <p className="text-emerald-700">Le client a été notifié de votre proposition. S'il l'accepte, vous serez mis en relation.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-6 md:p-8">
      <h2 className="text-xl font-bold text-gray-900 mb-6">Proposer vos services</h2>
      
      {error && <p className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-100 mb-6 text-sm">{error}</p>}

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Votre offre de prix (FCFA) *</label>
          <input 
            type="number" 
            name="amount" 
            value={formData.amount} 
            onChange={handleChange} 
            placeholder="Ex: 5000" 
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Temps estimé (Optionnel)</label>
          <input 
            type="text" 
            name="estimated_duration" 
            value={formData.estimated_duration} 
            onChange={handleChange} 
            placeholder="Ex: 2 heures, 1/2 journée..." 
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Message au client *</label>
          <textarea 
            name="message" 
            value={formData.message} 
            onChange={handleChange} 
            rows={4} 
            placeholder="Expliquez pourquoi vous êtes la bonne personne pour ce travail. Mentionnez votre expérience..." 
            className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
          ></textarea>
        </div>

        <button 
          onClick={handleSubmit} 
          disabled={loading || !formData.amount || !formData.message} 
          className="w-full bg-blue-600 text-white px-8 py-4 rounded-xl font-bold hover:bg-blue-700 transition disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg shadow-blue-500/30"
        >
          {loading ? 'Envoi en cours...' : 'Envoyer mon offre'} <Send className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
