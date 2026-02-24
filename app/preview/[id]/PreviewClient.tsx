'use client'

import React, { useState, useCallback, useEffect } from 'react'
import dynamic from 'next/dynamic'
import ImageGridItem from '@/app/components/atoms/ImageGridItem'
import Button from '@/app/components/atoms/Button'
import { getAssetUrl, getWatermarkedImageUrl, type Asset } from '@/app/utils/assetOperations'
import type { ShootWithClient } from '@/app/utils/shootOperations'
import type { UsageRights } from '@/app/utils/usageRightsOperations'
import { downloadUsageRightsPDF } from '@/app/components/atoms/UsageRightsPDFLazy'
import { formatDate } from '@/app/utils/format'

const PDFViewer = dynamic(() => import('@/app/components/atoms/PDFViewer'), { ssr: false })
const UsageRightsContent = dynamic(() => import('@/app/components/atoms/UsageRightsContent'), { ssr: false })

interface PreviewClientProps {
  shootData: ShootWithClient
  assets: Asset[]
  usageRights: UsageRights[]
}

export default function PreviewClient({ shootData, assets, usageRights }: PreviewClientProps) {
  const [activeTab, setActiveTab] = useState('Images')

  const hasContract = usageRights.some((r) => r.contract !== null && r.contract !== undefined)
  const allTabs = ['Images', 'Usage Document', 'Usage Rights']
  const tabs = hasContract ? allTabs : allTabs.filter((t) => t !== 'Usage Document')

  useEffect(() => {
    if (activeTab === 'Usage Document' && !hasContract) setActiveTab('Images')
  }, [hasContract, activeTab])

  const handleTabClick = useCallback((tab: string) => setActiveTab(tab), [])

  const handleDownloadPDF = useCallback(
    (rights: UsageRights) => downloadUsageRightsPDF(shootData, rights),
    [shootData]
  )

  const handleDownloadAgreement = useCallback(() => {
    const rightsWithContract = usageRights.find((r) => r.contract)
    if (rightsWithContract?.contract) {
      const link = document.createElement('a')
      link.href = rightsWithContract.contract
      link.download = 'usage-agreement.pdf'
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }, [usageRights])

  const handleDownloadAllImages = useCallback(async () => {
    if (assets.length === 0) return
    const CONCURRENCY_LIMIT = 5
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
      } catch (err) {
        console.error(`Error downloading image ${asset.id}:`, err)
      }
    }
    for (let i = 0; i < assets.length; i += CONCURRENCY_LIMIT) {
      const batch = assets.slice(i, i + CONCURRENCY_LIMIT)
      await Promise.all(batch.map(downloadImage))
      if (i + CONCURRENCY_LIMIT < assets.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }
  }, [assets])

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

      <div className='col-flex gap-3 border-b-[0.5px] border-foreground pb-2 mb-14
        md:flex-row! md:items-center! md:gap-12
        xl:pb-4 xl:mb-22
      '>
        {tabs.map((tab) => (
          <span
            key={tab}
            onClick={() => handleTabClick(tab)}
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
                {assets.map((asset, index) => {
                  const imageUrl = getWatermarkedImageUrl(asset.watermarked_image) || getAssetUrl(asset.image)
                  const altText = shootData.title
                    ? `${shootData.title} - Image ${index + 1}`
                    : `Photo shoot image ${index + 1}`
                  return (
                    <ImageGridItem key={asset.id} src={imageUrl} alt={altText} />
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
        const rightsWithContract = usageRights.find((r) => r.contract)
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
                  onClick={handleDownloadAgreement}
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
                    onClick={() => handleDownloadPDF(rights)}
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
