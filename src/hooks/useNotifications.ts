'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return;

    // 1. Charger les notifications existantes
    const fetchNotifications = async () => {
      const { data } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.is_read).length);
      }
    };

    fetchNotifications();

    // 2. S'abonner aux nouvelles notifications en temps réel
    const channel = supabase.channel(`notifs-${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', 
        schema: 'public',
        table: 'notifications', 
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        const newNotif = payload.new;
        setNotifications(prev => [newNotif, ...prev]);
        setUnreadCount(prev => prev + 1);
        
        // Afficher le Toast
        toast.success(newNotif.title, {
          description: newNotif.message,
          duration: 6000,
        });
      })
      .subscribe();

    return () => { supabase.removeChannel(channel) };
  }, [userId, supabase]);

  const markAllRead = async () => {
    if (unreadCount === 0) return;
    
    await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);
      
    setUnreadCount(0);
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
  }

  return { notifications, unreadCount, markAllRead }
}
