'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function approveTaskerAction(taskerId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('tasker_profiles')
      .update({ verification_status: 'verified' })
      .eq('user_id', taskerId);

    if (error) throw new Error(error.message);

    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function rejectTaskerAction(taskerId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('tasker_profiles')
      .update({ verification_status: 'unverified' })
      .eq('user_id', taskerId);

    if (error) throw new Error(error.message);

    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function approveWithdrawalAction(withdrawalId: string, taskerId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('withdrawals')
      .update({ status: 'completed' })
      .eq('id', withdrawalId);

    if (error) throw new Error(error.message);

    // Envoyer une notification à l'artisan
    await supabaseAdmin.from('notifications').insert({
      user_id: taskerId,
      type: 'withdrawal_approved',
      title: 'Retrait traité avec succès 💸',
      message: `Votre demande de retrait a été traitée. Les fonds ont été envoyés sur votre compte Mobile Money.`,
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function rejectWithdrawalAction(withdrawalId: string, taskerId: string) {
  try {
    const { error } = await supabaseAdmin
      .from('withdrawals')
      .update({ status: 'failed' })
      .eq('id', withdrawalId);

    if (error) throw new Error(error.message);

    // Envoyer une notification à l'artisan
    await supabaseAdmin.from('notifications').insert({
      user_id: taskerId,
      type: 'withdrawal_rejected',
      title: 'Retrait refusé ❌',
      message: `Votre demande de retrait n'a pas pu être traitée. Veuillez contacter le support.`,
    });

    revalidatePath('/admin');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
