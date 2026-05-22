'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

// On utilise le Service Role Key pour contourner les potentielles limitations RLS 
// lors de la création de multiples enregistrements complexes (transaction).
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function acceptBidAction(bidId: string, taskId: string, taskerId: string, clientId: string, amount: number) {
  try {
    // 1. Mettre à jour le statut de l'offre
    const { error: bidError } = await supabaseAdmin
      .from('task_bids')
      .update({ status: 'accepted' })
      .eq('id', bidId)
      
    if (bidError) throw new Error("Erreur mise à jour offre: " + bidError.message)

    // 2. Mettre à jour la tâche (assigner l'artisan)
    const { error: taskError } = await supabaseAdmin
      .from('tasks')
      .update({ 
        status: 'assigned', 
        assigned_tasker_id: taskerId 
      })
      .eq('id', taskId)

    if (taskError) throw new Error("Erreur mise à jour tâche: " + taskError.message)

    // Calculs économiques
    const PLATFORM_COMMISSION_RATE = 0.12;
    const CLIENT_SERVICE_FEE = 500;
    
    const platformFee = Math.round(amount * PLATFORM_COMMISSION_RATE);
    const taskerPayout = amount - platformFee;
    const totalClientAmount = amount + CLIENT_SERVICE_FEE;

    // 3. Créer la réservation (Booking)
    const { error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        task_id: taskId,
        bid_id: bidId,
        client_id: clientId,
        tasker_id: taskerId,
        agreed_amount: amount,
        platform_fee: platformFee,
        tasker_payout: taskerPayout,
        service_fee: CLIENT_SERVICE_FEE,
        total_client_amount: totalClientAmount,
        status: 'pending_payment'
      })

    if (bookingError) throw new Error("Erreur création réservation: " + bookingError.message)

    // Rafraîchir la page pour afficher le nouveau statut
    revalidatePath(`/client/tasks/${taskId}`)
    
    return { success: true }
    
  } catch (err: any) {
    console.error(err)
    return { success: false, error: err.message }
  }
}
