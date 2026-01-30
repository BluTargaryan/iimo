import { supabase } from './supabase'

export interface Notification {
  id: string
  user_id: string
  shoot_id: string | null
  usage_right_id: string | null
  type: 'expiry_reminder' | 'expiring' | 'expired' | 'status_update'
  sent_at: string
  status: 'pending' | 'sent' | 'read' | 'archived'
  created_at?: string
  updated_at?: string
}

export interface NotificationWithRelations extends Notification {
  shoots?: { id: string; title: string } | null
}

const PAGE_SIZE = 20

/**
 * Fetch notifications for the current user, ordered by sent_at descending.
 */
export async function fetchNotifications(
  userId: string,
  options?: { limit?: number; offset?: number; status?: Notification['status'] }
): Promise<{ data: Notification[] | null; error: Error | null }> {
  try {
    const limit = options?.limit ?? PAGE_SIZE
    const offset = options?.offset ?? 0

    let query = supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (options?.status) {
      query = query.eq('status', options.status)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching notifications:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as Notification[], error: null }
  } catch (error) {
    console.error('Unexpected error fetching notifications:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to fetch notifications'),
    }
  }
}

/**
 * Fetch notifications with optional shoot title for display.
 */
export async function fetchNotificationsWithShoot(
  userId: string,
  options?: { limit?: number; offset?: number }
): Promise<{ data: NotificationWithRelations[] | null; error: Error | null }> {
  try {
    const limit = options?.limit ?? PAGE_SIZE
    const offset = options?.offset ?? 0

    const { data, error } = await supabase
      .from('notifications')
      .select(`
        *,
        shoots (
          id,
          title
        )
      `)
      .eq('user_id', userId)
      .order('sent_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (error) {
      console.error('Error fetching notifications with shoot:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: data as NotificationWithRelations[], error: null }
  } catch (error) {
    console.error('Unexpected error fetching notifications:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to fetch notifications'),
    }
  }
}

/**
 * Mark a notification as read.
 */
export async function markNotificationAsRead(
  notificationId: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ status: 'read' })
      .eq('id', notificationId)

    if (error) {
      console.error('Error marking notification as read:', error)
      return { error: new Error(error.message) }
    }

    return { error: null }
  } catch (error) {
    console.error('Unexpected error marking notification as read:', error)
    return {
      error: error instanceof Error ? error : new Error('Failed to update notification'),
    }
  }
}

/**
 * Archive a notification.
 */
export async function archiveNotification(
  notificationId: string
): Promise<{ error: Error | null }> {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ status: 'archived' })
      .eq('id', notificationId)

    if (error) {
      console.error('Error archiving notification:', error)
      return { error: new Error(error.message) }
    }

    return { error: null }
  } catch (error) {
    console.error('Unexpected error archiving notification:', error)
    return {
      error: error instanceof Error ? error : new Error('Failed to update notification'),
    }
  }
}

/**
 * Get count of unread (pending or sent) notifications for the current user.
 */
export async function getUnreadNotificationCount(
  userId: string
): Promise<{ data: number | null; error: Error | null }> {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .in('status', ['pending', 'sent'])

    if (error) {
      console.error('Error fetching unread notification count:', error)
      return { data: null, error: new Error(error.message) }
    }

    return { data: count ?? 0, error: null }
  } catch (error) {
    console.error('Unexpected error fetching unread count:', error)
    return {
      data: null,
      error: error instanceof Error ? error : new Error('Failed to fetch count'),
    }
  }
}

/**
 * Format notification type for display.
 */
export function getNotificationTypeLabel(type: Notification['type']): string {
  switch (type) {
    case 'expiry_reminder':
      return 'Usage rights expiring soon'
    case 'expiring':
      return 'Usage rights expiring'
    case 'expired':
      return 'Usage rights expired'
    case 'status_update':
      return 'Status update'
    default:
      return type
  }
}

/**
 * Format sent_at for display (e.g. "Jan 28, 2025 at 2:30 PM").
 */
export function formatNotificationDate(isoString: string): string {
  try {
    const date = new Date(isoString)
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })
  } catch {
    return isoString
  }
}
