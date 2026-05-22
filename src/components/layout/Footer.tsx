import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-12 mt-auto">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div>
          <Link href="/" className="flex items-center gap-2 mb-4">
            <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">ayeJOB</span>
          </Link>
          <p className="text-gray-600 text-sm">
            La première marketplace de services à domicile au Togo. Trouvez les meilleurs artisans pour tous vos besoins.
          </p>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Clients</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link href="/comment-ca-marche" className="hover:text-emerald-600">Comment ça marche</Link></li>
            <li><Link href="/securite" className="hover:text-emerald-600">Sécurité et garanties</Link></li>
            <li><Link href="/tarifs" className="hover:text-emerald-600">Tarifs</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Artisans</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li><Link href="/devenir-tasker" className="hover:text-emerald-600">Devenir Artisan</Link></li>
            <li><Link href="/regles" className="hover:text-emerald-600">Règles de la communauté</Link></li>
            <li><Link href="/succes" className="hover:text-emerald-600">Histoires de succès</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-gray-900 mb-4">Contact</h4>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>Lomé, Togo</li>
            <li>support@ayejob.com</li>
            <li>+228 90 11 67 44</li>
          </ul>
        </div>
      </div>
      <div className="container mx-auto px-4 mt-12 pt-8 border-t border-gray-200 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} ayeJOB Togo. Tous droits réservés.
      </div>
    </footer>
  );
}
