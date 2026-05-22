'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check, UserCircle, MapPin, Loader2 } from 'lucide-react'

export function ClientProfileForm({ initialData }: { initialData: any }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    full_name: initialData?.full_name || '',
    city: initialData?.city || 'Lomé',
    neighborhood: initialData?.neighborhood || '',
    avatar_url: initialData?.avatar_url || '',
  })

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true); setError(''); setSuccess(false);
    
    const { error } = await supabase
      .from('profiles')
      .update(formData)
      .eq('id', initialData.id);
    
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {error && <p className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}
      {success && (
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-start gap-3">
          <Check className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div>
            <h3 className="font-bold text-emerald-800">Profil mis à jour !</h3>
            <p className="text-emerald-700 text-sm">Vos informations ont été enregistrées avec succès.</p>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-8">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><UserCircle className="w-6 h-6 text-emerald-600"/> Informations personnelles</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input type="text" name="full_name" value={formData.full_name} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone</label>
            <input type="text" value={initialData?.phone || ''} disabled className="w-full border rounded-xl px-4 py-3 bg-gray-50 text-gray-500 cursor-not-allowed" title="Le numéro de téléphone ne peut pas être modifié." />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-8">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><MapPin className="w-6 h-6 text-emerald-600"/> Localisation par défaut</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ville</label>
            <select name="city" value={formData.city} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500">
              <option value="Lomé">Lomé</option>
              <option value="Kara">Kara</option>
              <option value="Sokodé">Sokodé</option>
              <option value="Kpalimé">Kpalimé</option>
              <option value="Atakpamé">Atakpamé</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Quartier (ex: Agoè, Adidogomé...)</label>
            <input type="text" name="neighborhood" value={formData.neighborhood} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 pb-12">
        <button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-500/30">
          {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
          Enregistrer mon profil
        </button>
      </div>
    </div>
  )
}
