'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ArrowRight, ArrowLeft, Check, Sparkles, MapPin, Wallet } from 'lucide-react'

export function NewTaskForm({ categories, userId }: { categories: any[], userId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    category_id: '',
    title: '',
    description: '',
    location_neighborhood: '',
    location_address: '',
    scheduled_date: '',
    scheduled_time_slot: 'flexible',
    urgency: 'normal',
    budget_type: 'fixed',
    budget_amount: ''
  })

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true); setError('');
    const payload = {
      ...formData,
      client_id: userId,
      budget_amount: formData.budget_amount ? parseInt(formData.budget_amount) : null,
      scheduled_date: formData.scheduled_date || null
    };

    const { error } = await supabase.from('tasks').insert([payload])
    
    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push(`/client?success=true`)
    }
  }

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Progress Bar */}
      <div className="flex bg-gray-50 border-b border-gray-100">
        {[1, 2, 3].map((s) => (
          <div key={s} className={`flex-1 text-center py-4 text-sm font-semibold transition-colors ${step >= s ? 'text-emerald-600 border-b-2 border-emerald-600 bg-white' : 'text-gray-400'}`}>
            Étape {s}
          </div>
        ))}
      </div>

      <div className="p-8">
        {step === 1 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Sparkles className="w-5 h-5 text-emerald-600"/> Que recherchez-vous ?</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie de service *</label>
                <select name="category_id" value={formData.category_id} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white">
                  <option value="">Sélectionnez une catégorie</option>
                  {categories.map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Titre de l'annonce *</label>
                <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Ex: Réparation fuite évier cuisine" className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description détaillée *</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={4} placeholder="Décrivez le problème ou le besoin avec le plus de détails possible..." className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"></textarea>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button onClick={() => setStep(2)} disabled={!formData.category_id || !formData.title || !formData.description} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-2">
                Suivant <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><MapPin className="w-5 h-5 text-emerald-600"/> Où et Quand ?</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quartier (Lomé) *</label>
                <input type="text" name="location_neighborhood" value={formData.location_neighborhood} onChange={handleChange} placeholder="Ex: Agoè, Adidogomé..." className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Adresse précise *</label>
                <input type="text" name="location_address" value={formData.location_address} onChange={handleChange} placeholder="Ex: Rue des fleurs, Maison 12" className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date souhaitée</label>
                <input type="date" name="scheduled_date" value={formData.scheduled_date} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Moment de la journée</label>
                <select name="scheduled_time_slot" value={formData.scheduled_time_slot} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white">
                  <option value="flexible">Flexible (À définir)</option>
                  <option value="matin">Matin (8h - 12h)</option>
                  <option value="après-midi">Après-midi (12h - 17h)</option>
                  <option value="soir">Soir (Après 17h)</option>
                </select>
              </div>
            </div>

            <div className="pt-4 flex justify-between">
              <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              <button onClick={() => setStep(3)} disabled={!formData.location_neighborhood || !formData.location_address} className="bg-gray-900 text-white px-8 py-3 rounded-xl font-medium hover:bg-gray-800 transition disabled:opacity-50 flex items-center gap-2">
                Suivant <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
            <h2 className="text-xl font-bold flex items-center gap-2"><Wallet className="w-5 h-5 text-emerald-600"/> Budget</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Type de budget</label>
                <div className="grid grid-cols-3 gap-4">
                  {['fixed', 'hourly', 'negotiable'].map(type => (
                    <button key={type} type="button" onClick={() => setFormData({...formData, budget_type: type})} className={`p-4 rounded-xl border text-sm font-medium transition-all ${formData.budget_type === type ? 'border-emerald-600 bg-emerald-50 text-emerald-700' : 'border-gray-200 text-gray-600 hover:border-emerald-200'}`}>
                      {type === 'fixed' ? 'Forfaitaire' : type === 'hourly' ? 'Taux horaire' : 'Négociable'}
                    </button>
                  ))}
                </div>
              </div>

              {formData.budget_type !== 'negotiable' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Montant estimé (FCFA) *</label>
                  <input type="number" name="budget_amount" value={formData.budget_amount} onChange={handleChange} placeholder="Ex: 5000" className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
                </div>
              )}
            </div>

            {error && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}

            <div className="pt-8 flex justify-between border-t border-gray-100 mt-8">
              <button onClick={() => setStep(2)} className="px-6 py-3 rounded-xl font-medium text-gray-600 hover:bg-gray-100 transition flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Retour
              </button>
              <button onClick={handleSubmit} disabled={loading || (formData.budget_type !== 'negotiable' && !formData.budget_amount)} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-500/30">
                {loading ? 'Publication...' : 'Publier ma demande'} <Check className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
