'use client'

import React, { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { updateShootStatus, type ShootWithClient } from '@/app/utils/shootOperations'
import { deleteAsset, getAssetUrl, getWatermarkedImageUrl, type Asset } from '@/app/utils/assetOperations'
import { generateShareLink, revokeShareLink, type ShareLink } from '@/app/utils/shareLinksOperations'
import type { UsageRights } from '@/app/utils/usageRightsOperations'
import dynamic from 'next/dynamic'
import ImageGridItem from '@/app/components/atoms/ImageGridItem'
import Button from '@/app/components/atoms/Button'

const PDFViewer = dynamic(() => import('@/app/components/atoms/PDFViewer'), { ssr: false })
const UsageRightsContent = dynamic(() => import('@/app/components/atoms/UsageRightsContent'), { ssr: false })
const DeleteAssetConfirmationModal = dynamic(() => import('@/app/components/atoms/DeleteAssetConfirmationModal'), { ssr: false })
const RevokeLinkConfirmationModal = dynamic(() => import('@/app/components/atoms/RevokeLinkConfirmationModal'), { ssr: false })
const ArchiveShootConfirmationModal = dynamic(() => import('@/app/components/atoms/ArchiveShootConfirmationModal'), { ssr: false })
import { downloadUsageRightsPDF } from '@/app/components/atoms/UsageRightsPDFLazy'
import Toast from '@/app/components/sections/Toast'
import { formatDate } from '@/app/utils/format'
import share from '@/app/assets/images/share.svg'

interface ShootDetailClientProps {
  shootId: string
  initialShoot: ShootWithClient
  initialAssets: Asset[]
  initialUsageRights: UsageRights[]
  initialShareLink: ShareLink | null
}

export default function ShootDetailClient({
  shootId,
  initialShoot,
  initialAssets,
  initialUsageRights,
  initialShareLink,
}: ShootDetailClientProps) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Images')
  const [shootData, setShootData] = useState<ShootWithClient>(initialShoot)
  const [assets, setAssets] = useState<Asset[]>(initialAssets)
  const [usageRights] = useState<UsageRights[]>(initialUsageRights)
  const [shareLink, setShareLink] = useState<ShareLink | null>(initialShareLink)
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [showRevokeModal, setShowRevokeModal] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const hasContract = usageRights.some((r) => r.contract !== null && r.contract !== undefined)
  const allTabs = ['Images', 'Usage Document', 'Usage Rights']
  const tabs = hasContract ? allTabs : allTabs.filter((t) => t !== 'Usage Document')

  useEffect(() => {
    if (activeTab === 'Usage Document' && !hasContract) setActiveTab('Images')
  }, [hasContract, activeTab])

  useEffect(() => {
    setShowToast(false)
    setToastMessage('')
  }, [shootId])

  const handleDeleteImage = useCallback((assetId: string) => {
    setAssetToDelete(assetId)
    setShowDeleteModal(true)
  }, [])

  const handleConfirmDelete = useCallback(async () => {
    if (!assetToDelete) return
    const { error: deleteError } = await deleteAsset(assetToDelete)
    if (deleteError) {
      setError(deleteError.message)
      setShowDeleteModal(false)
      setAssetToDelete(null)
      return
    }
    setAssets((prev) => prev.filter((a) => a.id !== assetToDelete))
    setToastMessage('Asset deleted successfully')
    setShowToast(true)
    setShowDeleteModal(false)
    setAssetToDelete(null)
  }, [assetToDelete])

  const handleCloseDeleteModal = useCallback(() => {
    setShowDeleteModal(false)
    setAssetToDelete(null)
  }, [])

  const handleCloseToast = useCallback(() => setShowToast(false), [])

  const handleUploadImages = useCallback(() => {
    router.push(`/studio/upload-assets?shootId=${shootId}`)
  }, [router, shootId])

  const handleUploadImagesClick = useCallback(
    (e: React.MouseEvent) => { e.stopPropagation(); handleUploadImages() },
    [handleUploadImages]
  )

  const handleAddUsageRights = useCallback(() => {
    router.push(`/studio/add-rights?shootId=${shootId}`)
  }, [router, shootId])

  const handleAddUsageRightsClick = useCallback(
    (e: React.MouseEvent) => { e.stopPropagation(); handleAddUsageRights() },
    [handleAddUsageRights]
  )

  const handleEditUsageRights = useCallback(
    (rightsId: string) => { router.push(`/studio/edit-rights?shootId=${shootId}&rightsId=${rightsId}`) },
    [router, shootId]
  )

  const handleSharePreview = useCallback(async () => {
    try {
      let shareUrl: string
      if (shareLink) {
        shareUrl = `${window.location.origin}/preview/${shareLink.share_token}`
        await navigator.clipboard.writeText(shareUrl)
        setToastMessage('Preview link copied to clipboard')
        setShowToast(true)
        return
      }
      const { data, error: genError } = await generateShareLink(shootId, 7)
      if (genError || !data) {
        setToastMessage(genError?.message || 'Failed to generate share link')
        setShowToast(true)
        return
      }
      setShareLink(data.shareLink)
      await navigator.clipboard.writeText(data.shareUrl)
      setToastMessage('Share link created and copied to clipboard')
      setShowToast(true)
    } catch {
      setToastMessage('Failed to copy preview link')
      setShowToast(true)
    }
  }, [shareLink, shootId])

  const handleRevokeLink = useCallback(() => setShowRevokeModal(true), [])

  const handleConfirmRevoke = useCallback(async () => {
    if (!shareLink) return
    const { error: revokeError } = await revokeShareLink(shareLink.id)
    if (revokeError) {
      setToastMessage(revokeError.message)
      setShowToast(true)
      setShowRevokeModal(false)
      return
    }
    setShareLink(null)
    setToastMessage('Share link revoked')
    setShowToast(true)
    setShowRevokeModal(false)
  }, [shareLink])

  const handleCloseRevokeModal = useCallback(() => setShowRevokeModal(false), [])

  const handleArchiveShoot = useCallback(() => setShowArchiveModal(true), [])

  const handleConfirmArchive = useCallback(async () => {
    setIsArchiving(true)
    const isRestoring = shootData.status === 'archived'
    const newStatus = isRestoring ? 'active' : 'archived'
    const { data, error: archiveError } = await updateShootStatus(shootId, newStatus)
    if (archiveError) {
      setToastMessage(archiveError.message)
      setShowToast(true)
      setIsArchiving(false)
      setShowArchiveModal(false)
      return
    }
    if (data) setShootData(data)
    setToastMessage(isRestoring ? 'Shoot unarchived successfully' : 'Shoot archived successfully')
    setShowToast(true)
    setIsArchiving(false)
    setShowArchiveModal(false)
  }, [shootId, shootData.status])

  const handleCloseArchiveModal = useCallback(() => setShowArchiveModal(false), [])

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
    const concurrencyLimit = 5
    const downloadImage = async (asset: Asset, index: number) => {
      const imageUrl = getWatermarkedImageUrl(asset.watermarked_image) || getAssetUrl(asset.image)
      try {
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        const blobUrl = URL.createObjectURL(blob)
        const urlParts = imageUrl.split('/')
        const urlFilename = urlParts[urlParts.length - 1].split('?')[0]
        const filename = urlFilename || `${shootData.title || 'image'}_${index + 1}.jpg`
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
    for (let i = 0; i < assets.length; i += concurrencyLimit) {
      const batch = assets.slice(i, i + concurrencyLimit)
      await Promise.all(batch.map((asset, idx) => downloadImage(asset, i + idx)))
      if (i + concurrencyLimit < assets.length) {
        await new Promise((resolve) => setTimeout(resolve, 100))
      }
    }
  }, [assets, shootData.title])

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
        <div className='col-flex gap-2'>
          <div className='col-flex gap-2 lg:flex-row!'>
            <Button
              className='border border-foreground text-foreground w-full p-3.5 md:w-[322px] row-flex gap-2 flex-centerize'
              onClick={handleSharePreview}
            >
              <span>{shareLink ? 'Copy share link' : 'Share to client'}</span>
              <Image src={share} alt='share' width={20} height={20} sizes='20px' className='h-4 w-auto' />
            </Button>
            <Button
              className='border border-foreground text-foreground w-full p-3.5 md:w-[322px] row-flex gap-2 flex-centerize'
              onClick={handleArchiveShoot}
              disabled={isArchiving}
            >
              <span>{shootData.status === 'archived' ? 'Unarchive shoot' : 'Archive shoot'}</span>
            </Button>
          </div>
          {shareLink && (
            <>
              <span className='text-sm text-placeholder'>
                Share link active{shareLink.expires_at ? ` · Expires ${formatDate(shareLink.expires_at)}` : ''}
              </span>
              <Button
                className='bg-background text-foreground border border-foreground w-full p-3.5 md:w-[322px]'
                onClick={handleRevokeLink}
              >
                Revoke link
              </Button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className='col-flex items-center justify-center py-4'>
          <span className='text-red-500'>Error: {error}</span>
        </div>
      )}

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

      {activeTab === 'Images' && (
        <>
          {assets.length === 0 ? (
            <div className='col-flex gap-6 mb-8'>
              <div
                className='border-2 border-foreground rounded-3xl p-8 md:p-12 col-flex items-center justify-center gap-4 cursor-pointer hover:opacity-70 transition-opacity bg-background'
                onClick={handleUploadImages}
              >
                <div className='col-flex items-center gap-3 text-center'>
                  <h3 className='text-xl md:text-2xl xl:text-3xl font-semibold'>No assets uploaded yet</h3>
                  <p className='text-sm md:text-base text-placeholder'>Click here to upload images for this shoot</p>
                </div>
                <Button
                  className='bg-foreground text-background w-full p-3.5 md:w-[322px] mt-2'
                  onClick={handleUploadImagesClick}
                >
                  Upload images
                </Button>
              </div>
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
                      onDelete={() => handleDeleteImage(asset.id)}
                    />
                  )
                })}
              </div>
              <div className='row-flex gap-2'>
                <Button
                  className='bg-foreground text-background w-full p-3.5 md:w-[322px]'
                  onClick={handleDownloadAllImages}
                  disabled={assets.length === 0}
                >
                  Download images
                </Button>
                <Button
                  className='bg-background text-foreground border border-foreground w-full p-3.5 md:w-[322px]'
                  onClick={handleUploadImages}
                >
                  Upload images
                </Button>
              </div>
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
                <span>No contract available for this shoot</span>
              </div>
            )}
          </>
        )
      })()}

      {activeTab === 'Usage Rights' && (
        <div className='col-flex gap-6'>
          {usageRights.length === 0 ? (
            <div className='col-flex gap-6'>
              <div
                className='border-2 border-foreground rounded-3xl p-8 md:p-12 col-flex items-center justify-center gap-4 cursor-pointer hover:opacity-70 transition-opacity bg-background'
                onClick={handleAddUsageRights}
              >
                <div className='col-flex items-center gap-3 text-center'>
                  <h3 className='text-xl md:text-2xl xl:text-3xl font-semibold'>No usage rights defined yet</h3>
                  <p className='text-sm md:text-base text-placeholder'>Click here to add usage rights for this shoot</p>
                </div>
                <Button
                  className='bg-foreground text-background w-full p-3.5 md:w-[322px] mt-2'
                  onClick={handleAddUsageRightsClick}
                >
                  Add Usage Rights
                </Button>
              </div>
            </div>
          ) : (
            <>
              {usageRights.map((rights) => (
                <div key={rights.id} className='col-flex gap-6'>
                  <UsageRightsContent shootData={shootData} usageRights={rights} />
                  <div className='col-flex gap-2 xl:flex-row!'>
                    <Button
                      className='bg-background text-foreground border border-foreground w-full p-3.5 md:w-[322px]'
                      onClick={() => handleEditUsageRights(rights.id)}
                    >
                      Edit Usage Rights
                    </Button>
                    <Button
                      className='bg-foreground text-background w-full p-3.5 md:w-[322px]'
                      onClick={() => downloadUsageRightsPDF(shootData, rights)}
                    >
                      Download Usage Rights as PDF
                    </Button>
                  </div>
                </div>
              ))}
            </>
          )}
        </div>
      )}

      <DeleteAssetConfirmationModal
        isVisible={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
      <RevokeLinkConfirmationModal
        isVisible={showRevokeModal}
        onClose={handleCloseRevokeModal}
        onConfirm={handleConfirmRevoke}
      />
      <ArchiveShootConfirmationModal
        isVisible={showArchiveModal}
        onClose={handleCloseArchiveModal}
        onConfirm={handleConfirmArchive}
        isLoading={isArchiving}
        isRestore={shootData.status === 'archived'}
      />
      <Toast isVisible={showToast} onClose={handleCloseToast} message={toastMessage} />
    </main>
  )
}
