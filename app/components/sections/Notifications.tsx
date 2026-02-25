'use client'

import React, { useEffect, useRef, useCallback, useState } from 'react'
import Link from 'next/link'
import Button from '../atoms/Button'
import {
  fetchNotificationsWithShoot,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  getNotificationTypeLabel,
  formatNotificationDate,
  type NotificationWithRelations,
} from '@/app/utils/notificationOperations'

interface NotificationsProps {
  userId: string
  onClose: () => void
  onNotificationRead?: () => void
}

const PAGE_SIZE = 20

const Notifications = ({ userId, onClose, onNotificationRead }: NotificationsProps) => {
  const notificationsRef = useRef<HTMLDivElement>(null)
  const [notifications, setNotifications] = useState<NotificationWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [markingAllAsRead, setMarkingAllAsRead] = useState(false)

  const loadNotifications = useCallback(
    async (isLoadMore = false) => {
      if (!userId) return

      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setError(null)
      }

      const currentOffset = isLoadMore ? offset : 0
      const { data, error: fetchError } = await fetchNotificationsWithShoot(userId, {
        limit: PAGE_SIZE,
        offset: currentOffset,
      })

      if (fetchError) {
        setError(fetchError.message)
        if (!isLoadMore) setNotifications([])
        setLoading(false)
        setLoadingMore(false)
        return
      }

      const list = data ?? []
      if (isLoadMore) {
        setNotifications((prev) => [...prev, ...list])
        setOffset((prev) => prev + PAGE_SIZE)
      } else {
        setNotifications(list)
        setOffset(PAGE_SIZE)
      }
      setHasMore(list.length === PAGE_SIZE)
      setLoading(false)
      setLoadingMore(false)
    },
    [userId, offset]
  )

  useEffect(() => {
    queueMicrotask(() => loadNotifications())
  }, [userId, loadNotifications])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) loadNotifications(true)
  }

  const handleNotificationClick = async (n: NotificationWithRelations) => {
    if (n.status === 'read' || n.status === 'archived') return
    const { error: updateError } = await markNotificationAsRead(n.id)
    if (!updateError) {
      setNotifications((prev) =>
        prev.map((item) => (item.id === n.id ? { ...item, status: 'read' as const } : item))
      )
      onNotificationRead?.()
    }
  }

  const handleMarkAllAsRead = async () => {
    if (!userId) return

    setMarkingAllAsRead(true)
    const { error: updateError } = await markAllNotificationsAsRead(userId)
    
    if (!updateError) {
      // Update all notifications in state to 'read'
      setNotifications((prev) =>
        prev.map((item) => 
          item.status === 'pending' || item.status === 'sent' 
            ? { ...item, status: 'read' as const } 
            : item
        )
      )
      // Trigger callback to update badge count
      onNotificationRead?.()
    } else {
      setError('Failed to mark all notifications as read')
    }
    
    setMarkingAllAsRead(false)
  }

  // Check if there are any unread notifications
  const hasUnreadNotifications = notifications.some(
    (n) => n.status === 'pending' || n.status === 'sent'
  )

  return (
    <div
      ref={notificationsRef}
      className="col-flex gap-8 px-5 py-8 bg-background rounded-lg border-2 border-foreground fixed z-50 top-30 inset-x-4
        md:inset-x-10 md:top-20
        xl:inset-x-0 xl:max-w-[1144px] xl:mx-auto"
    >
      <div className="row-flex justify-between items-center">
        <h2>Notifications</h2>
        <span className="row-flex items-center gap-3">
          <Link
            href="/studio/events"
            onClick={() => onClose()}
            className="border-b border-foreground cursor-pointer text-foreground text-sm inline-flex items-center justify-center md:text-base"
          >
            View all events
          </Link>
          {hasUnreadNotifications && (
          <Button
            type="button"
            className="border border-foreground text-foreground px-4 py-2 text-sm"
            onClick={handleMarkAllAsRead}
            disabled={markingAllAsRead}
          >
            {markingAllAsRead ? 'Marking...' : 'Mark all as seen'}
          </Button>
          )}
        </span>
      </div>

      <div className="col-flex gap-3 h-30 overflow-y-scroll xl:h-50">
        {loading ? (
          <div className="col-flex items-center justify-center py-8">
            <span className="text-sm">Loading notifications...</span>
          </div>
        ) : error ? (
          <div className="col-flex items-center justify-center py-8">
            <span className="text-sm text-red-500">Error: {error}</span>
          </div>
        ) : notifications.length === 0 ? (
          <div className="col-flex items-center justify-center py-8">
            <span className="text-sm">No notifications yet.</span>
          </div>
        ) : (
          notifications.map((n) => (
            <div
              key={n.id}
              role="button"
              tabIndex={0}
              onClick={() => handleNotificationClick(n)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleNotificationClick(n)
                }
              }}
              className={`col-flex gap-1 p-2 rounded-lg border cursor-pointer transition-colors ${
                n.status === 'read' || n.status === 'archived'
                  ? 'border-foreground/30 bg-foreground/5'
                  : 'border-foreground bg-foreground/10'
              }`}
            >
              <span className="text-sm font-medium">
                {getNotificationTypeLabel(n.type)}
                {n.shoots?.title ? ` — ${n.shoots.title}` : ''}
              </span>
              <span className="text-xs text-foreground/80">
                Sent at {formatNotificationDate(n.sent_at)}
              </span>
            </div>
          ))
        )}
      </div>

      {!loading && !error && hasMore && notifications.length > 0 && (
        <Button
          type="button"
          className="border border-foreground cursor-pointer text-foreground w-1/2 p-3! row-flex gap-2 flex-centerize md:w-1/4"
          onClick={handleLoadMore}
          disabled={loadingMore}
        >
          <span>{loadingMore ? 'Loading...' : 'Load more'}</span>
        </Button>
      )}
    </div>
  )
}

export default Notifications
