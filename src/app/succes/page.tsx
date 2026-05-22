import { Star } from 'lucide-react';

export default function SuccesPage() {
  return (
    <div className="bg-white min-h-screen py-24 px-4">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Histoires de succès</h1>
        <p className="text-xl text-gray-600 mb-16">Ils ont transformé leur quotidien avec ayeJOB.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-gray-50 p-8 rounded-3xl text-left border border-gray-100">
            <div className="flex gap-1 mb-4 text-amber-400"><Star className="fill-current w-5 h-5"/><Star className="fill-current w-5 h-5"/><Star className="fill-current w-5 h-5"/><Star className="fill-current w-5 h-5"/><Star className="fill-current w-5 h-5"/></div>
            <p className="text-gray-700 italic mb-6">"Avant ayeJOB, je galérais à trouver des chantiers et les clients refusaient de me payer une fois le travail fini. Aujourd'hui, je gagne 3 fois plus, l'argent est sécurisé et je suis respecté."</p>
            <div className="font-bold text-gray-900">Komi D.</div>
            <div className="text-sm text-gray-500">Plombier à Lomé</div>
          </div>

          <div className="bg-gray-50 p-8 rounded-3xl text-left border border-gray-100">
            <div className="flex gap-1 mb-4 text-amber-400"><Star className="fill-current w-5 h-5"/><Star className="fill-current w-5 h-5"/><Star className="fill-current w-5 h-5"/><Star className="fill-current w-5 h-5"/><Star className="fill-current w-5 h-5"/></div>
            <p className="text-gray-700 italic mb-6">"J'ai pu faire repeindre tout mon salon un dimanche en moins de 3 heures. J'ai choisi l'artisan via ses notes, payé par TMoney depuis mon canapé, aucun stress !"</p>
            <div className="font-bold text-gray-900">Sarah B.</div>
            <div className="text-sm text-gray-500">Cliente (Agoè)</div>
          </div>

          <div className="bg-gray-50 p-8 rounded-3xl text-left border border-gray-100">
            <div className="flex gap-1 mb-4 text-amber-400"><Star className="fill-current w-5 h-5"/><Star className="fill-current w-5 h-5"/><Star className="fill-current w-5 h-5"/><Star className="fill-current w-5 h-5"/><Star className="fill-current w-5 h-5"/></div>
            <p className="text-gray-700 italic mb-6">"Le système de paiement est incroyable. Le client sait que l'argent ne m'est pas donné si le travail n'est pas fait, donc il a confiance. Et moi je sais que l'argent est là."</p>
            <div className="font-bold text-gray-900">Kodjo E.</div>
            <div className="text-sm text-gray-500">Électricien</div>
          </div>
        </div>
      </div>
    </div>
  );
}