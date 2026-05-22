import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { ClientProfileForm } from '@/components/profile/ClientProfileForm'
import { Settings } from 'lucide-react'

export const dynamic = 'force-dynamic';

export default async function ClientProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
          <Settings className="w-8 h-8 text-emerald-600" />
          Mon Profil
        </h1>
        <p className="text-gray-600 mt-2">Mettez à jour vos informations personnelles pour faciliter la mise en relation avec les artisans.</p>
      </div>

      <ClientProfileForm initialData={profile} />
    </div>
  )
}
