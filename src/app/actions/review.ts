'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function submitReviewAction(
  bookingId: string, 
  taskId: string, 
  reviewerId: string, 
  reviewedId: string, 
  rating: number, 
  comment: string
) {
  try {
    const { error } = await supabaseAdmin
      .from('reviews')
      .insert({
        booking_id: bookingId,
        reviewer_id: reviewerId,
        reviewed_id: reviewedId,
        rating: rating,
        comment: comment,
        review_type: 'client_to_tasker'
      });
      
    if (error) throw new Error(error.message);

    // Note: Le trigger "update_tasker_rating" mettra automatiquement à jour rating_avg 
    // dans tasker_profiles !

    revalidatePath(`/client/tasks/${taskId}/workspace`);
    revalidatePath(`/tasker`);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
