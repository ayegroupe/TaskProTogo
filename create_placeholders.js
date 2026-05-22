const fs = require('fs');
const path = require('path');

const routes = [
  'src/app/(auth)/login',
  'src/app/(auth)/register',
  'src/app/services',
  'src/app/devenir-tasker',
  'src/app/comment-ca-marche',
  'src/app/securite',
  'src/app/tarifs',
  'src/app/regles',
  'src/app/succes'
];

routes.forEach(route => {
  const dirPath = path.join(process.cwd(), route);
  fs.mkdirSync(dirPath, { recursive: true });
  
  let title = route.split('/').pop().replace(/-/g, ' ');
  title = title.charAt(0).toUpperCase() + title.slice(1);
  const componentName = title.replace(/\s+/g, '');
  
  const content = `
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function ${componentName}Page() {
  return (
    <div className="container mx-auto px-4 py-24 flex flex-col items-center justify-center min-h-[60vh] text-center">
      <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
        <span className="text-2xl">🚧</span>
      </div>
      <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-6 tracking-tight">
        ${title}
      </h1>
      <p className="text-lg text-gray-600 max-w-2xl mb-12">
        Cette page est actuellement en cours de construction. Elle sera bientôt disponible dans la prochaine phase de développement.
      </p>
      <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition shadow-sm">
        <ArrowLeft className="w-4 h-4" /> Retour à l'accueil
      </Link>
    </div>
  );
}
`;
  fs.writeFileSync(path.join(dirPath, 'page.tsx'), content.trim());
});

console.log('Pages créées avec succès !');
