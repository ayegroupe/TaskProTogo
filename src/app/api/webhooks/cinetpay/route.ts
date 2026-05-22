import { createClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// On utilise supabaseAdmin car le webhook n'a pas la session de l'utilisateur (RLS Bypassed)
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    console.log("CINETPAY WEBHOOK RECU :", body);

    // CinetPay envoie 'ACCEPTED' en cas de succès
    if (body.status === 'ACCEPTED') {
      const transactionId = body.cpm_trans_id;

      // 1. Trouver le paiement
      const { data: payment } = await supabaseAdmin
        .from('payments')
        .select('booking_id')
        .eq('transaction_id', transactionId)
        .single();

      if (!payment) {
        console.error("Paiement introuvable pour la transaction :", transactionId);
        return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
      }

      // 2. Mettre à jour le statut du paiement
      await supabaseAdmin
        .from('payments')
        .update({ status: 'completed', paid_at: new Date().toISOString(), metadata: body })
        .eq('transaction_id', transactionId);

      // 3. Mettre à jour le statut de la réservation -> "in_progress" (Séquestre)
      const { data: booking } = await supabaseAdmin
        .from('bookings')
        .update({ status: 'in_progress' })
        .eq('id', payment.booking_id)
        .select()
        .single();

      // 4. Mettre à jour le statut de la tâche -> "in_progress"
      if (booking) {
        await supabaseAdmin
          .from('tasks')
          .update({ status: 'in_progress' })
          .eq('id', booking.task_id);

        // 5. Envoyer les Notifications
        await supabaseAdmin.from('notifications').insert([
          {
            user_id: booking.client_id,
            type: 'payment_confirmed',
            title: 'Paiement confirmé ✅',
            message: `Votre paiement de ${booking.total_client_amount} FCFA a bien été sécurisé. L'artisan a été prévenu et peut commencer le travail !`,
            data: { booking_id: booking.id }
          },
          {
            user_id: booking.tasker_id,
            type: 'new_booking',
            title: 'Nouvelle mission payée ! 🎉',
            message: `Excellente nouvelle ! Le client a déposé les fonds sur le compte séquestre. Vous pouvez démarrer le travail.`,
            data: { booking_id: booking.id }
          }
        ]);
      }

      return NextResponse.json({ status: 'ok', message: 'Paiement traité avec succès et fonds sécurisés.' });
    }

    return NextResponse.json({ status: 'ignored', message: 'Statut de paiement non traité.' });
  } catch (error: any) {
    console.error("ERREUR WEBHOOK CINETPAY :", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
