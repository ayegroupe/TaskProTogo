'use server'

import { createClient } from '@supabase/supabase-js'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function initiatePaymentAction(bookingId: string) {
  try {
    const { data: booking, error: fetchError } = await supabaseAdmin
      .from('bookings')
      .select('*, tasks(*), profiles!client_id(*)')
      .eq('id', bookingId)
      .single()

    if (fetchError || !booking) throw new Error("Réservation introuvable");

    const transactionId = `AYEJOB_${Date.now()}_${bookingId.split('-')[0]}`

    // 1. Enregistrer l'intention de paiement en statut "pending"
    await supabaseAdmin.from('payments').insert({
      booking_id: bookingId,
      client_id: booking.client_id,
      amount: booking.total_client_amount,
      provider: 'cinetpay',
      transaction_id: transactionId,
      status: 'pending'
    })

    const apikey = process.env.CINETPAY_API_KEY;
    const site_id = process.env.CINETPAY_SITE_ID;

    // 2. Vérification: S'il n'y a pas de clés CinetPay réelles, on utilise le Sandbox
    if (!apikey || !site_id || apikey === 'test') {
      console.log("MODE SANDBOX: Génération d'une URL de paiement fictive.");
      const mockUrl = `/mock-cinetpay?transaction_id=${transactionId}&amount=${booking.total_client_amount}&task_id=${booking.task_id}`;
      return { success: true, payment_url: mockUrl };
    }

    // 3. MODE RÉEL (API CinetPay)
    const cinetpayRes = await fetch('https://api-checkout.cinetpay.com/v2/payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apikey: apikey,
        site_id: site_id,
        transaction_id: transactionId,
        amount: booking.total_client_amount,
        currency: 'XOF',
        description: `ayeJOB — ${booking.tasks.title} (dont 500 FCFA assurance prestation)`,
        customer_name: booking.profiles.full_name,
        customer_phone_number: booking.profiles.phone || '00000000',
        notify_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ayejob.com'}/api/webhooks/cinetpay`,
        return_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ayejob.com'}/client/tasks/${booking.task_id}/workspace?payment=success`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL || 'https://ayejob.com'}/client/tasks/${booking.task_id}/workspace?payment=cancelled`,
        channels: 'ALL',
        lang: 'fr',
      })
    });

    const paymentData = await cinetpayRes.json()

    if (paymentData.code === '201') {
      // Mettre à jour l'url de paiement dans la BDD
      await supabaseAdmin.from('payments').update({ payment_url: paymentData.data?.payment_url }).eq('transaction_id', transactionId);
      return { success: true, payment_url: paymentData.data?.payment_url };
    } else {
      throw new Error(paymentData.message || "Erreur lors de l'initialisation CinetPay");
    }

  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
