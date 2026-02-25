'use client'

import React, { useState, useCallback } from 'react'
import Link from 'next/link'
import {
  fetchNotificationsWithShoot,
  getNotificationTypeLabel,
  formatNotificationDate,
  type NotificationWithRelations,
} from '@/app/utils/notificationOperations'
import AddShootClientFixed from '@/app/components/sections/AddShootClientFixed'
import Button from '@/app/components/atoms/Button'

const PAGE_SIZE = 20

interface EventsClientProps {
  initialEvents: NotificationWithRelations[]
  userId: string
}

export default function EventsClient({ initialEvents, userId }: EventsClientProps) {
  const [events, setEvents] = useState<NotificationWithRelations[]>(initialEvents)
  const [offset, setOffset] = useState(PAGE_SIZE)
  const [hasMore, setHasMore] = useState(initialEvents.length === PAGE_SIZE)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleLoadMore = useCallback(async () => {
    if (loadingMore || !hasMore) return
    setLoadingMore(true)

    const { data, error: fetchError } = await fetchNotificationsWithShoot(userId, {
      limit: PAGE_SIZE,
      offset,
    })

    if (fetchError) {
      setError(fetchError.message)
      setLoadingMore(false)
      return
    }

    const list = data ?? []
    setEvents((prev) => [...prev, ...list])
    setOffset((prev) => prev + PAGE_SIZE)
    setHasMore(list.length === PAGE_SIZE)
    setLoadingMore(false)
  }, [loadingMore, hasMore, offset, userId])

  return (
    <main className='col-flex xl:max-w-[1144px] xl:mx-auto'>
      <div className='col-flex gap-3 border-b-[0.5px] border-foreground pb-2 mb-14 md:flex-row! md:items-center! md:gap-12 xl:pb-4 xl:mb-22'>
        <h1 className='text-xl xl:text-3xl font-bold'>Events</h1>
      </div>

      {error && (
        <div className='col-flex items-center justify-center py-12'>
          <span className='text-red-500'>Error: {error}</span>
        </div>
      )}

      {events.length === 0 ? (
        <div className='col-flex items-center justify-center py-12'>
          <span>No events yet.</span>
        </div>
      ) : (
        <div className='col-flex gap-3'>
          {events.map((n) => (
            <div
              key={n.id}
              className='col-flex gap-1 p-3 rounded-lg border border-foreground/50 bg-foreground/5'
            >
              <span className='text-sm font-medium'>
                {getNotificationTypeLabel(n.type)}
                {n.shoots?.title ? (
                  n.shoot_id ? (
                    <>
                      {' — '}
                      <Link href={`/studio/shoots/${n.shoot_id}`} className='hover:underline'>
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
              <span className='text-xs text-foreground/80'>
                {formatNotificationDate(n.sent_at)}
              </span>
            </div>
          ))}
        </div>
      )}

      {!error && hasMore && events.length > 0 && (
        <div className='mt-8'>
          <Button
            type='button'
            className='border border-foreground text-foreground w-full max-w-[200px] p-3! row-flex gap-2 flex-centerize'
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
