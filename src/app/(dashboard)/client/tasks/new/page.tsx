import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { NewTaskForm } from '@/components/tasks/NewTaskForm';

export default async function NewTaskPage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect('/login');
  }

  // Fetch categories from database to populate the dropdown
  const { data: categories } = await supabase
    .from('service_categories')
    .select('id, name, icon_name')
    .eq('is_active', true)
    .order('sort_order');

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Publier une demande</h1>
          <p className="text-gray-600 mt-2">Décrivez votre besoin en détail pour recevoir les meilleures offres de nos artisans qualifiés.</p>
        </div>

        <NewTaskForm categories={categories || []} userId={user.id} />
      </div>
    </div>
  );
}
