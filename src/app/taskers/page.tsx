import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Search, MapPin, Star, ShieldCheck, Briefcase } from 'lucide-react'

export const dynamic = 'force-dynamic';

export default async function PublicTaskersDirectory({
  searchParams
}: {
  searchParams: { q?: string; category?: string }
}) {
  const supabase = await createClient()

  // 1. Récupérer les catégories pour le filtre
  const { data: categories } = await supabase
    .from('service_categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('sort_order');

  // 2. Construire la requête pour récupérer les artisans vérifiés
  let query = supabase
    .from('tasker_profiles')
    .select('*, profiles!inner(full_name, city, neighborhood, avatar_url, phone)')
    .eq('verification_status', 'verified')
    .eq('is_available', true);

  // Note: On MVP on fait un filtrage basique côté JS si besoin, 
  // mais ici on prend tous les vérifiés pour l'affichage.
  const { data: taskers } = await query;

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* HEADER DE RECHERCHE */}
      <div className="bg-emerald-900 text-white py-16 px-4">
        <div className="container mx-auto max-w-5xl text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-6">Trouvez l'artisan parfait.</h1>
          <p className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto">
            Plombiers, électriciens, femmes de ménage... Tous vérifiés et prêts à intervenir chez vous à Lomé et partout au Togo.
          </p>
          
          <div className="bg-white p-2 rounded-2xl flex flex-col md:flex-row gap-2 max-w-3xl mx-auto shadow-2xl">
            <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-3">
              <Search className="w-5 h-5 text-gray-400 mr-3" />
              <input 
                type="text" 
                placeholder="Quel service recherchez-vous ?" 
                className="bg-transparent border-none outline-none w-full text-gray-900"
              />
            </div>
            <div className="flex-1 flex items-center bg-gray-50 rounded-xl px-4 py-3">
              <MapPin className="w-5 h-5 text-gray-400 mr-3" />
              <input 
                type="text" 
                placeholder="Lieu (ex: Agoè, Adidogomé...)" 
                className="bg-transparent border-none outline-none w-full text-gray-900"
              />
            </div>
            <button className="bg-emerald-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-emerald-700 transition">
              Rechercher
            </button>
          </div>
        </div>
      </div>

      {/* RÉSULTATS */}
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Nos Meilleurs Profils</h2>
          <span className="text-gray-500 font-medium">{taskers?.length || 0} artisans disponibles</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(!taskers || taskers.length === 0) ? (
            <div className="col-span-full py-20 text-center">
              <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">Aucun artisan disponible</h3>
              <p className="text-gray-500">Revenez plus tard ou modifiez vos critères de recherche.</p>
            </div>
          ) : (
            taskers.map((tasker) => (
              <div key={tasker.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow overflow-hidden group">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-16 h-16 bg-gray-100 rounded-full overflow-hidden shrink-0">
                      {tasker.profiles?.avatar_url ? (
                        <img src={tasker.profiles.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-400 font-bold text-2xl">
                          {tasker.profiles?.full_name?.charAt(0) || '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-3 py-1 rounded-full text-sm font-bold border border-amber-200">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      {tasker.rating_avg > 0 ? tasker.rating_avg : 'Nouv.'}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                      {tasker.profiles?.full_name}
                      <span title="Profil vérifié"><ShieldCheck className="w-5 h-5 text-emerald-500" /></span>
                    </h3>
                    <p className="text-gray-500 flex items-center gap-1 text-sm mt-1">
                      <MapPin className="w-4 h-4" /> {tasker.profiles?.city}{tasker.profiles?.neighborhood ? `, ${tasker.profiles.neighborhood}` : ''}
                    </p>
                  </div>

                  <p className="text-sm text-gray-600 line-clamp-2 mb-6 h-10">
                    {tasker.bio || "Ce professionnel est prêt à intervenir."}
                  </p>

                  <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                    <div>
                      <p className="text-xs text-gray-500 font-medium">À partir de</p>
                      <p className="font-black text-gray-900">{tasker.hourly_rate_min} FCFA / hr</p>
                    </div>
                    <Link 
                      href="/client/tasks/new" 
                      className="bg-emerald-50 text-emerald-700 px-4 py-2 rounded-xl font-bold text-sm hover:bg-emerald-600 hover:text-white transition group-hover:bg-emerald-600 group-hover:text-white"
                    >
                      Embaucher
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
