export const dynamic = 'force-dynamic';
import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { TaskerProfileForm } from '@/components/profile/TaskerProfileForm';

export default async function TaskerProfilePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Vérifier si le profil tasker existe déjà
  const { data: taskerProfile } = await supabase
    .from('tasker_profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Compléter mon profil</h1>
          <p className="text-gray-600 mt-2">Plus votre profil est complet et détaillé, plus vous aurez de chances d'être sélectionné par les clients.</p>
        </div>

        <TaskerProfileForm initialData={taskerProfile} userId={user.id} />
      </div>
    </div>
  );
}
