import Link from 'next/link';
import { Check, ShieldCheck, DollarSign } from 'lucide-react';

export default function TarifsPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Transparence totale sur les prix</h1>
          <p className="text-xl text-gray-600">Sur ayeJOB, pas de frais cachés. Tout le monde s'y retrouve.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm group hover:shadow-xl hover:-translate-y-2 transition-all duration-300 hover:border-emerald-200">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300 rounded-2xl flex items-center justify-center mb-6">
              <DollarSign className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Pour les Clients</h2>
            <div className="mb-6">
              <span className="text-4xl font-black text-gray-900">500 FCFA</span>
              <span className="text-gray-500"> / par prestation</span>
            </div>
            <p className="text-gray-600 mb-6">Vous ne payez que le prix convenu avec l'artisan, plus des frais fixes de 500 FCFA. Ces frais couvrent :</p>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-500" /> La sécurisation de l'argent par séquestre</li>
              <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-500" /> La vérification du profil de l'artisan</li>
              <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-500" /> Le support client en cas de litige</li>
            </ul>
          </div>

          <div className="bg-gray-900 text-white p-8 rounded-3xl shadow-lg relative overflow-hidden group hover:shadow-2xl hover:shadow-emerald-900/50 hover:-translate-y-2 transition-all duration-300 border border-transparent hover:border-emerald-500/50">
            <div className="absolute top-0 right-0 -mt-8 -mr-8 w-32 h-32 bg-emerald-500/20 rounded-full blur-2xl group-hover:bg-emerald-500/40 transition-colors duration-500"></div>
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300 rounded-2xl flex items-center justify-center mb-6 relative z-10">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold mb-4 relative z-10">Pour les Artisans</h2>
            <div className="mb-6 relative z-10">
              <span className="text-4xl font-black text-emerald-400">12%</span>
              <span className="text-gray-400"> de commission</span>
            </div>
            <p className="text-gray-300 mb-6 relative z-10">La plateforme est gratuite. Nous ne nous rémunérons qu'en cas de succès, via une commission sur le paiement du client. Cela inclut :</p>
            <ul className="space-y-3 text-gray-300 relative z-10">
              <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> La garantie de paiement (zéro impayé)</li>
              <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> La mise en relation avec des clients</li>
              <li className="flex items-center gap-2"><Check className="w-5 h-5 text-emerald-400" /> Les frais de transfert TMoney / Flooz</li>
            </ul>
          </div>
        </div>

        <div className="text-center">
          <Link href="/register" className="inline-flex items-center px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition">
            Créer un compte gratuit
          </Link>
        </div>
      </div>
    </div>
  );
}