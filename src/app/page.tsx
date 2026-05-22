import Image from 'next/image';
import Link from 'next/link';
import { Search, ArrowRight, Shield, Clock, Star, Sparkles, Zap, Wrench, Flower2, Truck, Paintbrush, Hammer, Monitor, Baby, Package } from 'lucide-react';

const CATEGORIES = [
  { name: 'Nettoyage', icon: Sparkles, slug: 'nettoyage' },
  { name: 'Électricité', icon: Zap, slug: 'electricite' },
  { name: 'Plomberie', icon: Wrench, slug: 'plomberie' },
  { name: 'Jardinage', icon: Flower2, slug: 'jardinage' },
  { name: 'Déménagement', icon: Truck, slug: 'demenagement' },
  { name: 'Peinture', icon: Paintbrush, slug: 'peinture' },
  { name: 'Maçonnerie', icon: Hammer, slug: 'maconnerie' },
  { name: 'Informatique', icon: Monitor, slug: 'informatique' },
  { name: 'Garde enfants', icon: Baby, slug: 'garde-enfants' },
  { name: 'Livraison', icon: Package, slug: 'livraison' },
];

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative w-full pt-16 pb-24 md:pt-24 md:pb-32 overflow-hidden">
        <div className="absolute inset-0 z-0 opacity-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-400 via-emerald-100 to-transparent"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium">
                <Star className="w-4 h-4 fill-emerald-500" />
                <span>N°1 des services à domicile au Togo</span>
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight text-gray-900 leading-[1.1]">
                De l'aide pour tous vos travaux, <span className="text-emerald-600">en un clic.</span>
              </h1>
              <p className="text-lg text-gray-600 max-w-lg leading-relaxed">
                Trouvez des artisans qualifiés et vérifiés à Lomé pour le nettoyage, la plomberie, l'électricité, et plus encore. Satisfaction garantie.
              </p>
              
              <div className="relative max-w-xl group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search className="h-5 w-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors" />
                </div>
                <input 
                  type="text" 
                  className="w-full pl-12 pr-32 py-4 rounded-2xl border border-gray-200 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-lg"
                  placeholder="De quoi avez-vous besoin ?"
                />
                <button className="absolute right-2 top-2 bottom-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 rounded-xl font-medium transition-colors shadow-sm">
                  Chercher
                </button>
              </div>

              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span className="font-medium">Populaire :</span>
                <div className="flex gap-2">
                  <span className="px-3 py-1 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition">Nettoyage</span>
                  <span className="px-3 py-1 bg-gray-100 rounded-full cursor-pointer hover:bg-gray-200 transition">Plomberie</span>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-4 bg-emerald-500/10 rounded-3xl blur-2xl transform rotate-3"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl aspect-[4/5] md:aspect-auto md:h-[600px]">
                <Image
                  src="/hero.png"
                  alt="Artisan togolais souriant"
                  fill
                  className="object-cover"
                  priority
                />
                {/* Floating Badge */}
                <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-md p-4 rounded-2xl shadow-xl flex items-center gap-4">
                  <div className="bg-emerald-100 p-3 rounded-full text-emerald-600">
                    <Shield className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">Artisans Vérifiés</p>
                    <p className="text-sm text-gray-500">Identité et compétences</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="container mx-auto px-4">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-4">Nos Services</h2>
              <p className="text-gray-600 max-w-2xl">Une large gamme de services pour vous simplifier la vie au quotidien.</p>
            </div>
            <Link href="/services" className="hidden md:flex items-center gap-2 text-emerald-600 font-medium hover:text-emerald-700 transition">
              Voir tout <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {CATEGORIES.map((category) => {
              const Icon = category.icon;
              return (
                <Link key={category.slug} href={`/services/${category.slug}`} className="group relative bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all hover:border-emerald-200 overflow-hidden flex flex-col items-center text-center gap-4">
                  <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/0 to-emerald-50/0 group-hover:from-emerald-50/50 group-hover:to-emerald-100/50 transition-colors z-0"></div>
                  <div className="relative z-10 w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform group-hover:bg-white group-hover:shadow-sm">
                    <Icon className="w-7 h-7" />
                  </div>
                  <h3 className="relative z-10 font-medium text-gray-900">{category.name}</h3>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Showcase */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-bold text-gray-900 leading-tight">
                Des espaces impeccables, <br/>sans aucun effort.
              </h2>
              <p className="text-lg text-gray-600">
                Nos experts en nettoyage redonnent vie à votre intérieur. Que ce soit pour un grand ménage de printemps, l'entretien régulier ou le nettoyage après travaux.
              </p>
              <ul className="space-y-4">
                {[
                  'Produits respectueux de l\'environnement',
                  'Professionnels formés et évalués',
                  'Horaires flexibles selon vos disponibilités',
                  'Assurance dommages incluse'
                ].map((feature, idx) => (
                  <li key={idx} className="flex items-center gap-3 text-gray-700 font-medium">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>
              <button className="bg-emerald-600 text-white px-8 py-4 rounded-xl font-medium hover:bg-emerald-700 transition shadow-lg shadow-emerald-600/20">
                Réserver un nettoyage
              </button>
            </div>
            <div className="relative rounded-3xl overflow-hidden shadow-2xl aspect-[4/3]">
              <Image src="/cleaning.png" alt="Service de nettoyage" fill className="object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <h2 className="text-3xl md:text-5xl font-bold mb-16">Comment ça marche ?</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              { title: 'Décrivez votre besoin', desc: 'Sélectionnez le service, choisissez la date, et détaillez votre demande.', icon: Search },
              { title: 'Choisissez votre artisan', desc: 'Consultez les profils, les avis et les tarifs, et faites votre choix.', icon: Star },
              { title: 'Mission accomplie', desc: 'Le travail est fait. Vous payez en toute sécurité via Mobile Money.', icon: Shield },
            ].map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="flex flex-col items-center relative">
                  {idx !== 2 && <div className="hidden md:block absolute top-12 right-0 w-full h-[2px] bg-gradient-to-r from-emerald-500/50 to-transparent translate-x-1/2"></div>}
                  <div className="w-24 h-24 rounded-full bg-gray-800 border-4 border-gray-700 flex items-center justify-center text-emerald-400 mb-6 relative z-10">
                    <Icon className="w-10 h-10" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                  <p className="text-gray-400 max-w-xs">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
