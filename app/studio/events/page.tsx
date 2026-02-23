'use client'

import React, { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useAuth } from '@/app/contexts/AuthContext'
import {
  fetchNotificationsWithShoot,
  getNotificationTypeLabel,
  formatNotificationDate,
  type NotificationWithRelations,
} from '@/app/utils/notificationOperations'
import AddShootClientFixed from '@/app/components/sections/AddShootClientFixed'
import Button from '@/app/components/atoms/Button'

const PAGE_SIZE = 20

const Events = () => {
  const { user } = useAuth()
  const [events, setEvents] = useState<NotificationWithRelations[]>([])
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)

  const loadEvents = useCallback(
    async (isLoadMore = false) => {
      if (!user?.id) return

      if (isLoadMore) {
        setLoadingMore(true)
      } else {
        setLoading(true)
        setError(null)
      }

      const currentOffset = isLoadMore ? offset : 0
      const { data, error: fetchError } = await fetchNotificationsWithShoot(user.id, {
        limit: PAGE_SIZE,
        offset: currentOffset,
      })

      if (fetchError) {
        setError(fetchError.message)
        if (!isLoadMore) setEvents([])
        setLoading(false)
        setLoadingMore(false)
        return
      }

      const list = data ?? []
      if (isLoadMore) {
        setEvents((prev) => [...prev, ...list])
        setOffset((prev) => prev + PAGE_SIZE)
      } else {
        setEvents(list)
        setOffset(PAGE_SIZE)
      }
      setHasMore(list.length === PAGE_SIZE)
      setLoading(false)
      setLoadingMore(false)
    },
    [user?.id, offset]
  )

  useEffect(() => {
    if (user?.id) {
      loadEvents()
    } else {
      setLoading(false)
    }
  }, [user?.id])

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) loadEvents(true)
  }

  return (
    <main className="col-flex xl:max-w-[1144px] xl:mx-auto">
      <div className="col-flex gap-3 border-b-[0.5px] border-foreground pb-2 mb-14 md:flex-row! md:items-center! md:gap-12 xl:pb-4 xl:mb-22">
        <h1 className="text-xl xl:text-3xl font-bold">Events</h1>
      </div>

      {loading ? (
        <div className="col-flex items-center justify-center py-12">
          <span>Loading events...</span>
        </div>
      ) : error ? (
        <div className="col-flex items-center justify-center py-12">
          <span className="text-red-500">Error: {error}</span>
        </div>
      ) : events.length === 0 ? (
        <div className="col-flex items-center justify-center py-12">
          <span>No events yet.</span>
        </div>
      ) : (
        <div className="col-flex gap-3">
          {events.map((n) => (
            <div
              key={n.id}
              className="col-flex gap-1 p-3 rounded-lg border border-foreground/50 bg-foreground/5"
            >
              <span className="text-sm font-medium">
                {getNotificationTypeLabel(n.type)}
                {n.shoots?.title ? (
                  n.shoot_id ? (
                    <>
                      {' — '}
                      <Link
                        href={`/studio/shoots/${n.shoot_id}`}
                        className="hover:underline"
                      >
                        {n.shoots.title}
                      </Link>
                    </>
                  ) : (
                    ` — ${n.shoots.title}`
                  )
                ) : (
                  ''
                )}
              </span>
              <span className="text-xs text-foreground/80">
                {formatNotificationDate(n.sent_at)}
              </span>
            </div>
          ))}
        </div>
      )}

      {!loading && !error && hasMore && events.length > 0 && (
        <div className="mt-8">
          <Button
            type="button"
            className="border border-foreground text-foreground w-full max-w-[200px] p-3! row-flex gap-2 flex-centerize"
            onClick={handleLoadMore}
            disabled={loadingMore}
          >
            <span>{loadingMore ? 'Loading...' : 'Load more'}</span>
          </Button>
        </div>
      )}

      <AddShootClientFixed />
    </main>
  )
}

export default Events
