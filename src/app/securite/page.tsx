import Link from 'next/link';
import { ShieldAlert, Lock, UserCheck, CreditCard } from 'lucide-react';

export default function SecuritePage() {
  return (
    <div className="bg-white min-h-screen py-24 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Votre sécurité avant tout</h1>
        <p className="text-xl text-gray-600 mb-16">
          Nous avons bâti ayeJOB pour éliminer les arnaques, les impayés et le travail bâclé. Découvrez comment nous vous protégeons.
        </p>

        <div className="space-y-12 text-left">
          <div className="flex gap-6 items-start">
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shrink-0">
              <UserCheck className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Vérification stricte des Artisans</h2>
              <p className="text-gray-600 leading-relaxed">
                Chaque artisan qui s'inscrit sur ayeJOB doit fournir une pièce d'identité valide et des preuves de ses compétences. Notre équipe valide manuellement chaque profil avant qu'il ne puisse accepter une mission.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center shrink-0">
              <Lock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Le système de paiement Séquestre</h2>
              <p className="text-gray-600 leading-relaxed">
                L'artisan ne se déplace jamais sans savoir que l'argent est disponible, et le client ne paie jamais directement sans voir le travail fini. L'argent est sécurisé sur un compte de transit ayeJOB et n'est libéré que lorsque les deux parties sont satisfaites.
              </p>
            </div>
          </div>

          <div className="flex gap-6 items-start">
            <div className="w-16 h-16 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center shrink-0">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Support et Litiges</h2>
              <p className="text-gray-600 leading-relaxed">
                En cas de désaccord sur la qualité du travail, l'argent reste bloqué. Notre équipe de médiation basée à Lomé intervient pour analyser la situation et procéder à un remboursement ou exiger la finition des travaux.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}