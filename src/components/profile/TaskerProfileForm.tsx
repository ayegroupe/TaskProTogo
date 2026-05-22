'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Check, ShieldCheck, UserCircle, Briefcase } from 'lucide-react'

export function TaskerProfileForm({ initialData, userId }: { initialData: any, userId: string }) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const [formData, setFormData] = useState({
    bio: initialData?.bio || '',
    years_experience: initialData?.years_experience || 0,
    hourly_rate_min: initialData?.hourly_rate_min || 1000,
    hourly_rate_max: initialData?.hourly_rate_max || 5000,
    service_radius_km: initialData?.service_radius_km || 10,
  })

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setLoading(true); setError(''); setSuccess(false);
    
    // Upsert into tasker_profiles
    const payload = {
      user_id: userId,
      ...formData,
      // Forcer le passage "en révision" pour faciliter le test
      verification_status: initialData?.verification_status === 'verified' ? 'verified' : 'in_review',
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase.from('tasker_profiles').upsert(payload, { onConflict: 'user_id' })
    
    if (error) {
      setError(error.message)
    } else {
      setSuccess(true)
      router.refresh()
    }
    setLoading(false)
  }

  return (
    <div className="space-y-8">
      {error && <p className="text-red-500 bg-red-50 p-4 rounded-xl border border-red-100">{error}</p>}
      {success && (
        <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 flex items-start gap-3">
          <Check className="w-5 h-5 text-emerald-600 mt-0.5" />
          <div>
            <h3 className="font-bold text-emerald-800">Profil mis à jour !</h3>
            <p className="text-emerald-700 text-sm">Vos informations ont été enregistrées avec succès. Votre profil est maintenant en cours de révision.</p>
          </div>
        </div>
      )}
      
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-8">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><UserCircle className="w-6 h-6 text-emerald-600"/> Mon Profil Professionnel</h2>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Présentation (Bio)</label>
            <textarea name="bio" value={formData.bio} onChange={handleChange} rows={4} placeholder="Parlez de vous, de vos compétences et de votre expérience..." className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"></textarea>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Années d'expérience</label>
              <input type="number" name="years_experience" value={formData.years_experience} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Rayon de déplacement (km)</label>
              <input type="number" name="service_radius_km" value={formData.service_radius_km} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden p-8">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><Briefcase className="w-6 h-6 text-emerald-600"/> Tarification Horaire (FCFA)</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tarif minimum / heure</label>
            <input type="number" name="hourly_rate_min" value={formData.hourly_rate_min} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tarif maximum / heure</label>
            <input type="number" name="hourly_rate_max" value={formData.hourly_rate_max} onChange={handleChange} className="w-full border rounded-xl px-4 py-3 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500" />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 rounded-3xl border border-gray-200 p-8">
        <h2 className="text-xl font-bold flex items-center gap-2 mb-2"><ShieldCheck className="w-6 h-6 text-gray-700"/> Vérification d'identité</h2>
        <p className="text-gray-500 mb-6">Pour valider votre profil, vous devrez soumettre votre pièce d'identité au support. La fonctionnalité de téléchargement de documents sécurisés est en cours d'intégration.</p>
        
        <div className="p-4 bg-blue-50 border border-blue-200 text-blue-800 rounded-xl text-sm">
          ℹ️ <strong>Astuce de test :</strong> En cliquant sur "Enregistrer", votre profil passera automatiquement en statut <strong>"En révision"</strong>. Vous pourrez ensuite modifier manuellement ce statut en "verified" dans votre base de données Supabase pour débloquer le bouton "Faire une offre".
        </div>
      </div>

      <div className="flex justify-end pt-4 pb-12">
        <button onClick={handleSubmit} disabled={loading} className="bg-emerald-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2 shadow-lg shadow-emerald-500/30">
          {loading ? 'Enregistrement...' : 'Enregistrer mon profil'} <Check className="w-5 h-5" />
        </button>
      </div>
    </div>
  )
}
