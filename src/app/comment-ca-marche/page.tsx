import Link from 'next/link';
import { Search, Shield, BadgeCheck, Wallet, ArrowRight } from 'lucide-react';

export default function CommentCaMarchePage() {
  return (
    <div className="bg-white min-h-screen">
      {/* Hero */}
      <div className="bg-emerald-900 text-white py-24 px-4 text-center">
        <h1 className="text-4xl md:text-6xl font-black mb-6">Comment ça marche ?</h1>
        <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
          ayeJOB simplifie la mise en relation entre particuliers et artisans au Togo. Tout est sécurisé du début à la fin.
        </p>
      </div>

      {/* Steps */}
      <div className="container mx-auto px-4 py-20 max-w-5xl">
        <div className="space-y-24">
          
          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mb-6 text-2xl font-black">1</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Postez votre demande</h2>
              <p className="text-lg text-gray-600">Décrivez votre besoin (plomberie, nettoyage, etc.), indiquez votre budget et votre localisation. Votre demande est immédiatement visible par les artisans qualifiés de votre zone.</p>
            </div>
            <div className="md:w-1/2 bg-gray-50 rounded-3xl p-12 flex items-center justify-center">
              <Search className="w-32 h-32 text-emerald-500 opacity-80" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
            <div className="md:w-1/2">
              <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center mb-6 text-2xl font-black">2</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Choisissez le meilleur artisan</h2>
              <p className="text-lg text-gray-600">Les artisans intéressés vous envoient leurs offres. Comparez leurs profils, lisez les avis des anciens clients et sélectionnez l'artisan qui vous convient le mieux.</p>
            </div>
            <div className="md:w-1/2 bg-gray-50 rounded-3xl p-12 flex items-center justify-center">
              <BadgeCheck className="w-32 h-32 text-blue-500 opacity-80" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-12 items-center">
            <div className="md:w-1/2">
              <div className="w-16 h-16 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6 text-2xl font-black">3</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Paiement sécurisé</h2>
              <p className="text-lg text-gray-600">Vous payez à l'avance via TMoney ou Flooz. L'argent est bloqué (séquestre) par ayeJOB. L'artisan sait que l'argent est disponible, et vient faire le travail en toute sérénité.</p>
            </div>
            <div className="md:w-1/2 bg-gray-50 rounded-3xl p-12 flex items-center justify-center">
              <Shield className="w-32 h-32 text-amber-500 opacity-80" />
            </div>
          </div>

          <div className="flex flex-col md:flex-row-reverse gap-12 items-center">
            <div className="md:w-1/2">
              <div className="w-16 h-16 bg-purple-100 text-purple-600 rounded-2xl flex items-center justify-center mb-6 text-2xl font-black">4</div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Validation et paiement</h2>
              <p className="text-lg text-gray-600">Une fois le travail terminé et vérifié par vous, vous validez sur l'application. L'argent est alors immédiatement transféré dans le portefeuille de l'artisan !</p>
            </div>
            <div className="md:w-1/2 bg-gray-50 rounded-3xl p-12 flex items-center justify-center">
              <Wallet className="w-32 h-32 text-purple-500 opacity-80" />
            </div>
          </div>

        </div>

        <div className="mt-24 text-center">
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-xl font-bold text-lg hover:bg-emerald-700 transition shadow-xl shadow-emerald-500/30">
            Commencer maintenant <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  );
}