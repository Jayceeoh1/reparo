'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/types/database'

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const supabase = createClient()

  useEffect(() => {
    if (!userId) return

    // Incarca notificarile initiale
    supabase.from('notifications').select('*')
      .eq('user_id', userId).order('created_at', { ascending: false }).limit(20)
      .then(({ data }) => {
        setNotifications(data ?? [])
        setUnreadCount(data?.filter(n => !n.is_read).length ?? 0)
      })

    // Subscrie la notificari noi in timp real
    const channel = supabase.channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, payload => {
        setNotifications(prev => [payload.new as Notification, ...prev])
        setUnreadCount(c => c + 1)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [userId])

  async function markAllRead() {
    await supabase.from('notifications').update({ is_read: true }).eq('user_id', userId!)
    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))
    setUnreadCount(0)
  }

  return { notifications, unreadCount, markAllRead }
}
