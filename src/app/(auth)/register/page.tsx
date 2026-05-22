import { RegisterForm } from '@/components/auth/RegisterForm';
import Link from 'next/link';

export default function RegisterPage() {
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
            Inscription
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Créez votre compte client ou artisan en quelques secondes.
          </p>
        </div>

        <RegisterForm />

        <p className="text-center text-sm text-gray-500">
          Vous avez déjà un compte ?{' '}
          <Link href="/login" className="font-semibold text-emerald-600 hover:text-emerald-500 transition">
            Connectez-vous
          </Link>
        </p>
      </div>
    </div>
  );
}