'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function processPaymentAction(bookingId: string, taskId: string) {
  try {
    // Le client a "payé" -> Le booking passe en "in_progress" (En cours de réalisation)
    const { error } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'in_progress', started_at: new Date().toISOString() })
      .eq('id', bookingId);
      
    if (error) throw new Error(error.message);

    revalidatePath(`/client/tasks/${taskId}/workspace`);
    revalidatePath(`/tasker/tasks/${taskId}/workspace`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function markAsCompletedAction(bookingId: string, taskId: string) {
  try {
    // L'artisan a "terminé" -> Le booking passe en "completed"
    const { data: booking, error } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'completed', completed_at: new Date().toISOString() })
      .eq('id', bookingId)
      .select('client_id, task_id')
      .single();
      
    if (error) throw new Error(error.message);

    // Notifier le client
    await supabaseAdmin.from('notifications').insert({
      user_id: booking.client_id,
      type: 'task_completed',
      title: 'Mission terminée 🛠️',
      message: `Votre artisan a déclaré avoir terminé le travail ! Veuillez vérifier et libérer son paiement depuis l'espace de travail.`,
      data: { task_id: booking.task_id }
    });

    revalidatePath(`/tasker/tasks/${taskId}/workspace`);
    revalidatePath(`/client/tasks/${taskId}/workspace`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function confirmAndReleaseFundsAction(bookingId: string, taskId: string) {
  try {
    // Le client confirme la fin -> Booking = "paid", Task = "completed"
    const { data: booking, error: bError } = await supabaseAdmin
      .from('bookings')
      .update({ status: 'paid', client_confirmed: true })
      .eq('id', bookingId)
      .select('tasker_id, tasker_payout')
      .single();
    if (bError) throw new Error(bError.message);

    const { error: tError } = await supabaseAdmin
      .from('tasks')
      .update({ status: 'completed' })
      .eq('id', taskId);
    if (tError) throw new Error(tError.message);

    // Note : Dans un vrai projet, on appelle aussi une fonction SQL pour créditer le portefeuille de l'artisan.
    // On simule cela ici car on a un trigger ou on peut juste afficher le statut.

    // Notifier l'artisan
    if (booking) {
      await supabaseAdmin.from('notifications').insert({
        user_id: booking.tasker_id,
        type: 'payment_released',
        title: 'Paiement reçu ! 💸',
        message: `Félicitations ! Le client a validé votre travail. ${booking.tasker_payout} FCFA ont été ajoutés à votre portefeuille !`,
        data: { booking_id: bookingId }
      });
    }

    revalidatePath(`/client/tasks/${taskId}/workspace`);
    revalidatePath(`/tasker/tasks/${taskId}/workspace`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
