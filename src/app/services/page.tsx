import Link from 'next/link';
import { Sparkles, Zap, Wrench, Flower2, Truck, Paintbrush, Hammer, Monitor, Plus, Package, ArrowRight } from 'lucide-react';

const CATEGORIES = [
  { name: 'Nettoyage', icon: Sparkles, slug: 'nettoyage', desc: "Ménage à domicile, bureaux, et nettoyage après travaux." },
  { name: 'Électricité', icon: Zap, slug: 'electricite', desc: "Dépannage, installation et maintenance électrique." },
  { name: 'Plomberie', icon: Wrench, slug: 'plomberie', desc: "Réparation de fuites, débouchage et installations." },
  { name: 'Jardinage', icon: Flower2, slug: 'jardinage', desc: "Entretien d'espaces verts, tonte et taille." },
  { name: 'Déménagement', icon: Truck, slug: 'demenagement', desc: "Aide au déménagement et transport de meubles." },
  { name: 'Peinture', icon: Paintbrush, slug: 'peinture', desc: "Peinture intérieure et extérieure, finitions." },
  { name: 'Maçonnerie', icon: Hammer, slug: 'maconnerie', desc: "Petits travaux de construction et réparations." },
  { name: 'Informatique', icon: Monitor, slug: 'informatique', desc: "Dépannage PC, installation de réseaux." },
  { name: 'Autres', icon: Plus, slug: 'autres', desc: "Besoin d'un autre service ? Décrivez-le nous." },
  { name: 'Livraison', icon: Package, slug: 'livraison', desc: "Courses et coursiers express à Lomé." },
];

export default function ServicesPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">
            Tous nos services à portée de main
          </h1>
          <p className="text-xl text-gray-600">
            Trouvez l'artisan qualifié qu'il vous faut parmi nos différentes catégories. Tous nos professionnels sont vérifiés pour votre sécurité.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {CATEGORIES.map((category) => {
            const Icon = category.icon;
            return (
              <Link key={category.slug} href={`/client/tasks/new?category=${category.slug}`} className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-200 transition-all group flex flex-col items-start text-left">
                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 mb-6 group-hover:scale-110 transition-transform">
                  <Icon className="w-7 h-7" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3">{category.name}</h3>
                <p className="text-gray-500 mb-6 flex-1">{category.desc}</p>
                <div className="flex items-center text-emerald-600 font-bold gap-2 group-hover:translate-x-2 transition-transform">
                  Publier une demande <ArrowRight className="w-4 h-4" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}