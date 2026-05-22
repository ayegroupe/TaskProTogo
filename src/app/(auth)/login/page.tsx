import { PhoneLoginForm } from '@/components/auth/PhoneLoginForm';
import Link from 'next/link';

export default function LoginPage() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <Link href="/" className="inline-block mb-6">
            <span className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
              ayeJOB
            </span>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Bienvenue !
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Accédez à votre compte avec votre numéro de téléphone.
          </p>
        </div>

        <PhoneLoginForm />

        <p className="text-center text-sm text-gray-500">
          Nouveau sur ayeJOB ?{' '}
          <Link href="/register" className="font-semibold text-emerald-600 hover:text-emerald-500 transition">
            Créer un compte
          </Link>
        </p>
      </div>
    </div>
  );
}