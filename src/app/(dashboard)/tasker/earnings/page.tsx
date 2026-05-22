import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { Wallet, ArrowDownLeft, Clock, CheckCircle, XCircle } from 'lucide-react'
import { WithdrawalForm } from '@/components/wallet/WithdrawalForm'

export const dynamic = 'force-dynamic';

export default async function TaskerEarningsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // 1. Calculer le total gagné
  const { data: bookings } = await supabase
    .from('bookings')
    .select('tasker_payout')
    .eq('tasker_id', user.id)
    .eq('status', 'paid');
    
  const totalEarned = bookings?.reduce((sum, b) => sum + (b.tasker_payout || 0), 0) || 0;

  // 2. Récupérer l'historique des retraits
  const { data: withdrawals } = await supabaseAdmin
    .from('withdrawals')
    .select('*')
    .eq('tasker_id', user.id)
    .order('created_at', { ascending: false });

  // 3. Calculer le solde disponible (Gagné - Retraits "pending", "processing", "completed")
  const totalWithdrawn = withdrawals?.filter(w => ['pending', 'processing', 'completed'].includes(w.status || ''))
                                     .reduce((sum, w) => sum + (w.amount || 0), 0) || 0;
  
  const availableBalance = totalEarned - totalWithdrawn;

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Wallet className="w-8 h-8 text-emerald-600" />
          Portefeuille et Retraits
        </h1>
        <p className="text-gray-600 mt-2">Gérez vos revenus et demandez des virements vers votre compte mobile money.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Colonne Principale : Solde et Historique */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-emerald-900 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <Wallet className="w-32 h-32" />
            </div>
            <p className="text-emerald-100 font-medium mb-2">Solde disponible</p>
            <h2 className="text-5xl font-black mb-8">{availableBalance} <span className="text-2xl font-bold">FCFA</span></h2>
            
            <div className="flex gap-8 border-t border-emerald-800 pt-6">
              <div>
                <p className="text-emerald-400 text-sm font-medium">Gains totaux (à vie)</p>
                <p className="text-xl font-bold">{totalEarned} FCFA</p>
              </div>
              <div>
                <p className="text-emerald-400 text-sm font-medium">Retiré</p>
                <p className="text-xl font-bold">{totalWithdrawn} FCFA</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex items-center justify-between">
              <h3 className="font-bold text-gray-900 text-lg">Historique des retraits</h3>
            </div>
            <div className="divide-y divide-gray-100">
              {(!withdrawals || withdrawals.length === 0) ? (
                <div className="p-8 text-center text-gray-500">
                  Aucun retrait pour le moment.
                </div>
              ) : (
                withdrawals.map((w) => (
                  <div key={w.id} className="p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        w.status === 'completed' ? 'bg-emerald-100 text-emerald-600' :
                        w.status === 'failed' ? 'bg-red-100 text-red-600' : 'bg-amber-100 text-amber-600'
                      }`}>
                        {w.status === 'completed' ? <CheckCircle className="w-5 h-5" /> :
                         w.status === 'failed' ? <XCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900">{w.amount} FCFA</p>
                        <p className="text-sm text-gray-500">
                          {w.operator} • {w.phone_number}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide ${
                        w.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                        w.status === 'failed' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {w.status === 'pending' ? 'En attente' : 
                         w.status === 'processing' ? 'En cours' : 
                         w.status === 'completed' ? 'Terminé' : 'Échoué'}
                      </span>
                      <p className="text-xs text-gray-400 mt-2">{new Date(w.created_at).toLocaleDateString('fr-FR')}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Colonne Secondaire : Formulaire */}
        <div>
          <WithdrawalForm taskerId={user.id} availableBalance={availableBalance} />
          
          <div className="mt-6 p-6 bg-gray-50 rounded-3xl border border-gray-100">
            <h4 className="font-bold text-gray-900 mb-2">Comment ça marche ?</h4>
            <ul className="text-sm text-gray-600 space-y-3">
              <li className="flex gap-2">
                <span className="text-emerald-500 font-bold">1.</span>
                Demandez un retrait vers votre numéro TMoney ou Flooz.
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500 font-bold">2.</span>
                Notre équipe vérifie et valide la transaction sous 24h ouvrées.
              </li>
              <li className="flex gap-2">
                <span className="text-emerald-500 font-bold">3.</span>
                Vous recevez l'argent directement sur votre téléphone.
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
