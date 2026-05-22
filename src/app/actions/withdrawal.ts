'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function requestWithdrawalAction(taskerId: string, amount: number, phoneNumber: string, operator: string) {
  try {
    // 1. Vérifier le solde disponible (Total gagné - Total déjà retiré ou en attente)
    const { data: bookings } = await supabaseAdmin
      .from('bookings')
      .select('tasker_payout')
      .eq('tasker_id', taskerId)
      .eq('status', 'paid');
    
    const totalEarned = bookings?.reduce((sum, b) => sum + (b.tasker_payout || 0), 0) || 0;

    const { data: withdrawals } = await supabaseAdmin
      .from('withdrawals')
      .select('amount')
      .eq('tasker_id', taskerId)
      .in('status', ['pending', 'processing', 'completed']);

    const totalWithdrawn = withdrawals?.reduce((sum, w) => sum + (w.amount || 0), 0) || 0;
    const availableBalance = totalEarned - totalWithdrawn;

    if (amount > availableBalance) {
      throw new Error("Fonds insuffisants. Vous ne pouvez pas retirer plus que votre solde disponible.");
    }
    if (amount < 1000) {
      throw new Error("Le montant minimum de retrait est de 1000 FCFA.");
    }

    // 2. Insérer la demande de retrait
    const { error } = await supabaseAdmin
      .from('withdrawals')
      .insert({
        tasker_id: taskerId,
        amount: amount,
        phone_number: phoneNumber,
        operator: operator,
        status: 'pending'
      });

    if (error) throw new Error(error.message);

    revalidatePath('/tasker/earnings');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
