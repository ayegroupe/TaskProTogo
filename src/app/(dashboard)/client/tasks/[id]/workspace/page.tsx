import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, UserCircle, Briefcase } from 'lucide-react';
import { ClientWorkspaceActions } from '@/components/workspace/ClientWorkspaceActions';

export const dynamic = 'force-dynamic';

export default async function ClientWorkspacePage({ params }: { params: { id: string } }) {
  const resolvedParams = await params;
  const id = resolvedParams.id;
  
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');

  const { data: task } = await supabase
    .from('tasks')
    .select('*, service_categories(name)')
    .eq('id', id)
    .single();

  if (!task || task.client_id !== user.id) redirect('/client');

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .select('*, tasker:profiles!tasker_id(full_name)')
    .eq('task_id', id)
    .single();

  if (!booking) {
    console.error("Booking fetch error:", bookingError);
    return <div className="p-12 text-center text-red-500">Aucune réservation trouvée pour cette tâche. ({bookingError?.message || 'Inconnue'})</div>;
  }

  // Si la mission est payée, chercher s'il y a déjà un avis
  let existingReview = null;
  if (booking.status === 'paid') {
    const { data: rev } = await supabase
      .from('reviews')
      .select('*')
      .eq('booking_id', booking.id)
      .single();
    existingReview = rev;
  }

  const taskerName = booking.tasker?.full_name || 'Artisan';

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <Link href="/client" className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 mb-6 font-medium transition">
          <ArrowLeft className="w-4 h-4" /> Retour au tableau de bord
        </Link>

        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-gray-900">Espace de travail Client</h1>
              <p className="text-gray-500">{task.title}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Artisan assigné</p>
              <div className="flex items-center gap-2 font-bold text-gray-900">
                <UserCircle className="w-5 h-5 text-emerald-600" /> {taskerName}
              </div>
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium mb-1">Montant total à payer</p>
              <p className="font-bold text-gray-900">{booking.total_client_amount || booking.agreed_amount} FCFA <span className="text-xs font-normal text-gray-500">(dont 500 F de frais)</span></p>
            </div>
          </div>

          <ClientWorkspaceActions booking={booking} taskId={task.id} existingReview={existingReview} />
        </div>
      </div>
    </div>
  );
}
