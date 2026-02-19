'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { fetchShoots, type Shoot } from '@/app/utils/shootOperations'
import { fetchAssets, fetchAssetsForShoots, getWatermarkedImageUrl, getAssetUrl } from '@/app/utils/assetOperations'
import ShootItem from '@/app/components/atoms/ShootItem'
import AddShootClientFixed from '@/app/components/sections/AddShootClientFixed'
import Toast from '@/app/components/sections/Toast'


const Shoots = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('Active')
  const [showToast, setShowToast] = useState(false)
  const [shoots, setShoots] = useState<Shoot[]>([])
  const [shootThumbnails, setShootThumbnails] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const tabs = ['Active', 'Expiring', 'Expired', 'Archived']

  useEffect(() => {
    if (!user?.id) return

    const loadShoots = async () => {
      setLoading(true)
      setError(null)
      // Fetch all shoots without status filter
      const { data, error: fetchError } = await fetchShoots(user.id)
      
      if (fetchError) {
        setError(fetchError.message)
        setShoots([])
        setLoading(false)
        return
      }

      const shootsData = data || []
      setShoots(shootsData)

      // Batch fetch assets for all shoots in one query (eliminates N+1)
      const shootIds = shootsData.map(shoot => shoot.id)
      const { data: assetsByShoot } = await fetchAssetsForShoots(shootIds)
      
      const thumbnailMap: Record<string, string[]> = {}
      shootsData.forEach((shoot) => {
        const assets = assetsByShoot?.[shoot.id] || []
        if (assets.length > 0) {
          // Get first 4 watermarked images, falling back to regular image if watermarked not available
          const thumbnails = assets.slice(0, 4).map(asset => {
            const watermarkedUrl = getWatermarkedImageUrl(asset.watermarked_image)
            return watermarkedUrl || getAssetUrl(asset.image)
          })
          thumbnailMap[shoot.id] = thumbnails
        } else {
          thumbnailMap[shoot.id] = []
        }
      })
      setShootThumbnails(thumbnailMap)
      setLoading(false)
    }

    loadShoots()
  }, [user?.id]) // Removed activeTab dependency

  // Filter shoots by active tab in memory
  const filteredShoots = useMemo(() => {
    const statusMap: Record<string, string> = {
      'Active': 'active',
      'Expiring': 'expiring',
      'Expired': 'expired',
      'Archived': 'archived'
    }
    const targetStatus = statusMap[activeTab]
    return shoots.filter(shoot => shoot.status === targetStatus)
  }, [shoots, activeTab])

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
</div>

{loading ? (
  <div className='col-flex items-center justify-center py-12'>
    <span>Loading shoots...</span>
  </div>
) : error ? (
  <div className='col-flex items-center justify-center py-12'>
    <span className='text-red-500'>Error: {error}</span>
  </div>
) : filteredShoots.length === 0 ? (
  <div className='col-flex items-center justify-center py-12'>
    <span>No {activeTab.toLowerCase()} shoots found</span>
  </div>
) : (
  <div className='grid grid-cols-1 gap-12 md:grid-cols-2  lg:grid-cols-3 '>
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
<AddShootClientFixed/>
<Toast isVisible={showToast} onClose={handleCloseToast} />
    </main>
  )
}

export default Shoots