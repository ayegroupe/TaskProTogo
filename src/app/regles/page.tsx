export default function ReglesPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-24 px-4">
      <div className="max-w-3xl mx-auto bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-8">Règles de la communauté</h1>
        
        <div className="prose prose-emerald max-w-none text-gray-600">
          <p className="mb-6 text-lg">Pour garantir une expérience agréable et professionnelle pour tous sur ayeJOB, voici les règles fondamentales à respecter :</p>
          
          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Respect et Politesse</h3>
          <p>Toute communication entre clients et artisans doit rester courtoise. Les insultes, le harcèlement ou la discrimination entraîneront un bannissement immédiat.</p>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Fiabilité des horaires</h3>
          <p>Un artisan doit respecter les horaires convenus. Un retard de plus de 30 minutes sans prévention est passible de sanctions. Le client doit être présent à l'heure prévue pour accueillir l'artisan.</p>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Contournement de la plateforme</h3>
          <p>Il est strictement interdit de finaliser une transaction en espèces en dehors de l'application pour éviter les frais de service. Cela annule toute garantie de sécurité et de remboursement, et conduit à l'exclusion de la plateforme.</p>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Avis justifiés</h3>
          <p>Les avis doivent être basés sur des faits réels concernant la prestation. L'extorsion ("Si tu ne me fais pas de réduction, je te mets 1 étoile") est interdite.</p>
        </div>
      </div>
    </div>
  );
}