'use client'

import React, { useState, useEffect, use } from 'react'
import dynamic from 'next/dynamic'
import ImageGridItem from '@/app/components/atoms/ImageGridItem'
import Button from '@/app/components/atoms/Button'

// Lazy load heavy components
const PDFViewer = dynamic(() => import('@/app/components/atoms/PDFViewer'), { ssr: false })
const UsageRightsContent = dynamic(() => import('@/app/components/atoms/UsageRightsContent'), { ssr: false })
import { downloadUsageRightsPDF } from '@/app/components/atoms/UsageRightsPDF'
import { getShootIdByToken } from '@/app/utils/shareLinksOperations'
import { fetchShootById, type ShootWithClient } from '@/app/utils/shootOperations'
import { fetchAssets, getAssetUrl, getWatermarkedImageUrl, type Asset } from '@/app/utils/assetOperations'
import { fetchUsageRights, type UsageRights } from '@/app/utils/usageRightsOperations'
import { formatDate } from '@/app/utils/format'

interface PreviewPageProps {
  params: Promise<{
    id: string
  }>
}

type ErrorType = 'not_found' | 'load_failed' | null

const PreviewPage = ({ params }: PreviewPageProps) => {
  const { id: shareToken } = use(params)
  const [activeTab, setActiveTab] = useState('Images')
  const [shootData, setShootData] = useState<ShootWithClient | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [usageRights, setUsageRights] = useState<UsageRights[]>([])
  const [loading, setLoading] = useState(true)
  const [errorType, setErrorType] = useState<ErrorType>(null)

  const hasContract = usageRights.some(rights => rights.contract !== null && rights.contract !== undefined)
  const allTabs = ['Images', 'Usage Document', 'Usage Rights']
  const tabs = hasContract ? allTabs : allTabs.filter(tab => tab !== 'Usage Document')

  useEffect(() => {
    if (activeTab === 'Usage Document' && !hasContract) {
      setActiveTab('Images')
    }
  }, [hasContract, activeTab])

  useEffect(() => {
    if (!shareToken) {
      setLoading(false)
      setErrorType('not_found')
      return
    }

    const load = async () => {
      setLoading(true)
      setErrorType(null)

      const { data: shootId, error: tokenError } = await getShootIdByToken(shareToken)

      if (tokenError || !shootId) {
        setLoading(false)
        setErrorType('not_found')
        return
      }

      const [shootResult, assetsResult, rightsResult] = await Promise.all([
        fetchShootById(shootId),
        fetchAssets(shootId),
        fetchUsageRights(shootId),
      ])

      if (shootResult.error || !shootResult.data) {
        setLoading(false)
        setErrorType('load_failed')
        return
      }

      setShootData(shootResult.data)
      setAssets(assetsResult.data ?? [])
      setUsageRights(rightsResult.data ?? [])
      setLoading(false)
    }

    load()
  }, [shareToken])

  // formatDate moved to utils/format.ts

  const handleDownloadAllImages = async () => {
    if (assets.length === 0) return

    const CONCURRENCY_LIMIT = 3
    const downloadImage = async (asset: Asset) => {
      const imageUrl = getWatermarkedImageUrl(asset.watermarked_image) || getAssetUrl(asset.image)
      try {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        const urlParts = imageUrl.split('/')
        const urlFilename = urlParts[urlParts.length - 1].split('?')[0]
        const filename = urlFilename || `asset-${asset.id}.jpg`

        const link = document.createElement('a')
        link.href = blobUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
      } catch (error) {
        console.error(`Error downloading image ${asset.id}:`, error)
      }
    }

    // Download in batches with concurrency limit
    for (let i = 0; i < assets.length; i += CONCURRENCY_LIMIT) {
      const batch = assets.slice(i, i + CONCURRENCY_LIMIT)
      await Promise.all(batch.map(downloadImage))
    }
  }

  if (loading) {
    return (
      <main className='col-flex xl:max-w-[1144px] xl:mx-auto'>
        <div className='col-flex items-center justify-center py-12'>
          <span>Loading preview...</span>
        </div>
      </main>
    )
  }

  if (errorType) {
    const message =
      errorType === 'not_found'
        ? 'This share link does not exist or is no longer valid.'
        : 'Unable to load preview.'
    return (
      <main className='col-flex xl:max-w-[1144px] xl:mx-auto'>
        <div className='col-flex items-center justify-center py-12'>
          <span className='text-red-500'>{message}</span>
        </div>
      </main>
    )
  }

  if (!shootData) {
    return (
      <main className='col-flex xl:max-w-[1144px] xl:mx-auto'>
        <div className='col-flex items-center justify-center py-12'>
          <span className='text-red-500'>Unable to load preview.</span>
        </div>
      </main>
    )
  }

  const clientName = shootData.clients?.name || 'Unknown Client'

  return (
    <main className='col-flex xl:max-w-[1144px] xl:mx-auto'>
      <div className='col-flex gap-2 mb-8 xl:mb-25 xl:gap-3'>
        <h1>{shootData.title}</h1>
        <div className='text-sm col-flex gap-1 md:text-base'>
          <span className='xl:text-3xl'>
            Done for {clientName}, on {formatDate(shootData.shoot_date)}
          </span>
          <span className='xl:text-3xl font-bold'>
            Status: {shootData.status.charAt(0).toUpperCase() + shootData.status.slice(1)}
          </span>
        </div>
      </div>

      <div
        className='col-flex gap-3 border-b-[0.5px] border-foreground pb-2 mb-14
      md:flex-row! md:items-center! md:gap-12
      xl:pb-4 xl:mb-22
      '
      >
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

      {activeTab === 'Images' && (
        <>
          {assets.length === 0 ? (
            <div className='col-flex items-center justify-center py-12'>
              <span>No images in this shoot.</span>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-2 gap-4.5 mb-8 md:gap-7.5 xl:grid-cols-3'>
                {assets.map((asset) => {
                  const imageUrl = getWatermarkedImageUrl(asset.watermarked_image) || getAssetUrl(asset.image)
                  return (
                    <ImageGridItem
                      key={asset.id}
                      src={imageUrl}
                      alt={`Asset ${asset.id}`}
                    />
                  )
                })}
              </div>
              <Button
                className='bg-foreground text-background w-full p-3.5 md:w-[322px]'
                onClick={handleDownloadAllImages}
              >
                Download images
              </Button>
            </>
          )}
        </>
      )}

      {activeTab === 'Usage Document' && (() => {
        const rightsWithContract = usageRights.find(rights => rights.contract)
        const contractUrl = rightsWithContract?.contract || null

        return (
          <>
            {contractUrl ? (
              <>
                <div className='mb-8'>
                  <PDFViewer src={contractUrl} title='Usage Document' />
                </div>
                <Button
                  className='bg-foreground text-background w-full p-3.5 md:w-[322px]'
                  onClick={() => {
                    const link = document.createElement('a')
                    link.href = contractUrl
                    link.download = 'usage-agreement.pdf'
                    link.target = '_blank'
                    document.body.appendChild(link)
                    link.click()
                    document.body.removeChild(link)
                  }}
                >
                  Download agreement
                </Button>
              </>
            ) : (
              <div className='col-flex items-center justify-center py-12'>
                <span>No contract available for this shoot.</span>
              </div>
            )}
          </>
        )
      })()}

      {activeTab === 'Usage Rights' && (
        <div className='col-flex gap-6'>
          {usageRights.length === 0 ? (
            <div className='col-flex items-center justify-center py-12'>
              <span>No usage rights for this shoot.</span>
            </div>
          ) : (
            <>
              {usageRights.map((rights) => (
                <div key={rights.id} className='col-flex gap-6'>
                  <UsageRightsContent shootData={shootData} usageRights={rights} />
                  <Button
                    className='bg-foreground text-background w-full p-3.5 md:w-[322px]'
                    onClick={() => downloadUsageRightsPDF(shootData, rights)}
                  >
                    Download Usage Rights as PDF
                  </Button>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </main>
  )
}

export default PreviewPage
