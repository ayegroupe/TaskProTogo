import Link from 'next/link';
import { ArrowRight, Briefcase, TrendingUp, ShieldCheck, Clock } from 'lucide-react';

export default function DevenirArtisanPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="bg-gray-900 text-white py-24 px-4 text-center relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-emerald-500/20 rounded-full blur-[120px] pointer-events-none"></div>
        <div className="relative z-10 max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-6xl font-black mb-6">Devenez votre propre patron.</h1>
          <p className="text-xl text-gray-300 mb-10">
            Rejoignez des centaines d'artisans togolais qui utilisent ayeJOB pour trouver de nouveaux clients, sécuriser leurs paiements et développer leur activité.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-500 text-white rounded-xl font-bold text-lg hover:bg-emerald-400 transition shadow-lg shadow-emerald-500/30 text-gray-900">
            Créer mon profil Artisan <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-24 max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-gray-900">Pourquoi rejoindre ayeJOB ?</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-gray-50 p-8 rounded-3xl text-center group hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-transparent hover:border-blue-100">
            <div className="w-16 h-16 bg-blue-100 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors duration-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <TrendingUp className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Plus de revenus</h3>
            <p className="text-gray-600">Accédez à des centaines de demandes de clients chaque semaine dans votre ville.</p>
          </div>
          
          <div className="bg-gray-50 p-8 rounded-3xl text-center group hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-transparent hover:border-emerald-100">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors duration-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Zéro impayé</h3>
            <p className="text-gray-600">Le client paie d'avance. Nous sécurisons l'argent et vous garantissons le paiement à la fin.</p>
          </div>

          <div className="bg-gray-50 p-8 rounded-3xl text-center group hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-transparent hover:border-purple-100">
            <div className="w-16 h-16 bg-purple-100 text-purple-600 group-hover:bg-purple-600 group-hover:text-white transition-colors duration-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Clock className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Flexibilité totale</h3>
            <p className="text-gray-600">Vous décidez quand vous travaillez, où vous travaillez, et à quel prix.</p>
          </div>

          <div className="bg-gray-50 p-8 rounded-3xl text-center group hover:bg-white hover:shadow-xl hover:-translate-y-2 transition-all duration-300 border border-transparent hover:border-amber-100">
            <div className="w-16 h-16 bg-amber-100 text-amber-600 group-hover:bg-amber-600 group-hover:text-white transition-colors duration-300 rounded-full flex items-center justify-center mx-auto mb-6">
              <Briefcase className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">Outils pros</h3>
            <p className="text-gray-600">Gérez vos missions, devis et paiements directement depuis l'application.</p>
          </div>
        </div>
      </div>
    </div>
  );
}