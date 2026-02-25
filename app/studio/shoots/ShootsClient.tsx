'use client'

import React, { useState, useCallback, useMemo } from 'react'
import type { Shoot } from '@/app/utils/shootOperations'
import ShootItem from '@/app/components/atoms/ShootItem'
import AddShootClientFixed from '@/app/components/sections/AddShootClientFixed'
import Toast from '@/app/components/sections/Toast'

interface ShootsClientProps {
  shoots: Shoot[]
  shootThumbnails: Record<string, string[]>
}

const tabs = ['Active', 'Expiring', 'Expired', 'Archived']

const statusMap: Record<string, string> = {
  Active: 'active',
  Expiring: 'expiring',
  Expired: 'expired',
  Archived: 'archived',
}

export default function ShootsClient({ shoots, shootThumbnails }: ShootsClientProps) {
  const [activeTab, setActiveTab] = useState('Active')
  const [searchQuery, setSearchQuery] = useState('')
  const [showToast, setShowToast] = useState(false)

  const filteredShoots = useMemo(() => {
    const targetStatus = statusMap[activeTab]
    let result = shoots.filter((shoot) => shoot.status === targetStatus)
    const q = searchQuery.trim()
    if (q !== '') {
      const lower = q.toLowerCase()
      result = result.filter((shoot) => (shoot.title || '').toLowerCase().includes(lower))
    }
    return result
  }, [shoots, activeTab, searchQuery])

  const handleShare = useCallback(() => {
    setShowToast(true)
  }, [])

  const handleCloseToast = useCallback(() => {
    setShowToast(false)
  }, [])

  return (
    <main className='col-flex xl:max-w-[1144px] xl:mx-auto'>
      <div className='col-flex gap-3 border-b-[0.5px] border-foreground pb-2 mb-14
        md:flex-row! md:items-center! md:gap-12
        xl:pb-4 xl:mb-22
      '>
        {tabs.map((tab) => (
          <span
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xl xl:text-3xl cursor-pointer ${activeTab === tab ? 'font-bold' : ''}`}
          >
            {tab}
          </span>
        ))}
        <div className='row-flex items-center gap-2 md:ml-auto'>
          <input
            type='text'
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search shoots...'
            className='border border-foreground rounded-3xl p-2.5 md:p-3.5 text-foreground bg-transparent focus:outline-none w-full'
          />
          {searchQuery.trim() !== '' && (
            <button
              type='button'
              onClick={() => setSearchQuery('')}
              className='text-foreground text-xl hover:opacity-70 p-1'
              aria-label='Clear search'
            >
              ×
            </button>
          )}
        </div>
      </div>

      {filteredShoots.length === 0 ? (
        <div className='col-flex items-center justify-center py-12'>
          <span>
            {searchQuery.trim() !== ''
              ? `No shoots match your search for "${searchQuery.trim()}"`
              : `No ${activeTab.toLowerCase()} shoots found`}
          </span>
        </div>
      ) : (
        <div className='grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3'>
          {filteredShoots.map((shoot) => (
            <ShootItem
              key={shoot.id}
              shoot={shoot}
              onShare={handleShare}
              thumbnailUrls={shootThumbnails[shoot.id]}
            />
          ))}
        </div>
      )}

      <AddShootClientFixed />
      <Toast isVisible={showToast} onClose={handleCloseToast} />
    </main>
  )
}
