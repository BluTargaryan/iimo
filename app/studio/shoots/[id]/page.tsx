'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { fetchShootById, updateShootStatus, type ShootWithClient } from '@/app/utils/shootOperations'
import { fetchAssets, deleteAsset, getAssetUrl, getWatermarkedImageUrl, type Asset } from '@/app/utils/assetOperations'
import { fetchUsageRights, type UsageRights } from '@/app/utils/usageRightsOperations'
import { generateShareLink, getShareLinkByShootId, revokeShareLink, type ShareLink } from '@/app/utils/shareLinksOperations'
import ImageGridItem from '@/app/components/atoms/ImageGridItem'
import PDFViewer from '@/app/components/atoms/PDFViewer'
import Button from '@/app/components/atoms/Button'
import DeleteAssetConfirmationModal from '@/app/components/atoms/DeleteAssetConfirmationModal'
import RevokeLinkConfirmationModal from '@/app/components/atoms/RevokeLinkConfirmationModal'
import ArchiveShootConfirmationModal from '@/app/components/atoms/ArchiveShootConfirmationModal'
import UsageRightsContent from '@/app/components/atoms/UsageRightsContent'
import { downloadUsageRightsPDF } from '@/app/components/atoms/UsageRightsPDF'
import Toast from '@/app/components/sections/Toast'
import share from '@/app/assets/images/share.svg'

interface ShootPageProps {
  params: Promise<{
    id: string
  }>
}

const ShootPage = ({ params }: ShootPageProps) => {
  const { id } = use(params)
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('Images')
  const [assetToDelete, setAssetToDelete] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [shootData, setShootData] = useState<ShootWithClient | null>(null)
  const [assets, setAssets] = useState<Asset[]>([])
  const [usageRights, setUsageRights] = useState<UsageRights[]>([])
  const [loading, setLoading] = useState(true)
  const [assetsLoading, setAssetsLoading] = useState(false)
  const [rightsLoading, setRightsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')
  const [shareLink, setShareLink] = useState<ShareLink | null>(null)
  const [shareLinkLoading, setShareLinkLoading] = useState(false)
  const [showRevokeModal, setShowRevokeModal] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)

  // Check if any usage rights have a contract
  const hasContract = usageRights.some(rights => rights.contract !== null && rights.contract !== undefined)
  
  // Filter tabs based on whether contract exists
  const allTabs = ['Images', 'Usage Document', 'Usage Rights']
  const tabs = hasContract ? allTabs : allTabs.filter(tab => tab !== 'Usage Document')
  
  // If active tab is "Usage Document" but no contract exists, switch to Images
  useEffect(() => {
    if (activeTab === 'Usage Document' && !hasContract) {
      setActiveTab('Images')
    }
  }, [hasContract, activeTab])

  // Reset toast state on mount to prevent showing toast from previous navigation
  useEffect(() => {
    setShowToast(false)
    setToastMessage('')
  }, [id])

  // Fetch shoot data on mount
  useEffect(() => {
    const loadShoot = async () => {
      setLoading(true)
      setError(null)
      const { data, error: fetchError } = await fetchShootById(id)
      
      if (fetchError) {
        setError(fetchError.message)
        setLoading(false)
        return
      }

      setShootData(data)
      setLoading(false)
    }

    loadShoot()
  }, [id])

  // Fetch active share link for this shoot when shoot is loaded
  useEffect(() => {
    if (!id) return
    const loadShareLink = async () => {
      setShareLinkLoading(true)
      try {
        const { data, error: linkError } = await getShareLinkByShootId(id)
        if (!linkError) {
          setShareLink(data ?? null)
        } else {
          setShareLink(null)
        }
      } finally {
        setShareLinkLoading(false)
      }
    }
    loadShareLink()
  }, [id])

  // Fetch assets on mount and when Images tab is active
  useEffect(() => {
    if (id) {
      const loadAssets = async () => {
        if (activeTab === 'Images') {
          setAssetsLoading(true)
        }
        const { data, error: fetchError } = await fetchAssets(id)
        
        if (fetchError) {
          console.error('Error fetching assets:', fetchError)
          setAssets([])
        } else {
          setAssets(data || [])
        }
        if (activeTab === 'Images') {
          setAssetsLoading(false)
        }
      }

      loadAssets()
    }
  }, [activeTab, id])

  // Fetch usage rights on mount and when Usage Rights tab is active
  useEffect(() => {
    if (id) {
      const loadUsageRights = async () => {
        if (activeTab === 'Usage Rights') {
          setRightsLoading(true)
        }
        const { data, error: fetchError } = await fetchUsageRights(id)
        
        if (fetchError) {
          console.error('Error fetching usage rights:', fetchError)
          setUsageRights([])
        } else {
          setUsageRights(data || [])
        }
        if (activeTab === 'Usage Rights') {
          setRightsLoading(false)
        }
      }

      loadUsageRights()
    }
  }, [activeTab, id])

  const formatDate = (dateString: string | null | undefined): string => {
    if (!dateString) return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    } catch {
      return dateString
    }
  }

  const handleDeleteImage = (assetId: string) => {
    setAssetToDelete(assetId)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = async () => {
    if (!assetToDelete) return

    const { error: deleteError } = await deleteAsset(assetToDelete)
    
    if (deleteError) {
      setError(deleteError.message)
      setShowDeleteModal(false)
      setAssetToDelete(null)
      return
    }

    // Remove asset from local state
    setAssets(assets.filter(asset => asset.id !== assetToDelete))
    setToastMessage('Asset deleted successfully')
    setShowToast(true)
    setShowDeleteModal(false)
    setAssetToDelete(null)
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setAssetToDelete(null)
  }

  const handleCloseToast = () => {
    setShowToast(false)
  }

  const handleUploadImages = () => {
    router.push(`/studio/upload-assets?shootId=${id}`)
  }

  const handleAddUsageRights = () => {
    router.push(`/studio/add-rights?shootId=${id}`)
  }

  const handleEditUsageRights = (rightsId: string) => {
    router.push(`/studio/edit-rights?shootId=${id}&rightsId=${rightsId}`)
  }

  const handleSharePreview = async () => {
    try {
      let shareUrl: string
      if (shareLink) {
        shareUrl = `${window.location.origin}/preview/${shareLink.share_token}`
        await navigator.clipboard.writeText(shareUrl)
        setToastMessage('Preview link copied to clipboard')
        setShowToast(true)
        return
      }
      const { data, error: genError } = await generateShareLink(id, 7)
      if (genError) {
        setError(genError.message)
        setToastMessage(genError.message)
        setShowToast(true)
        return
      }
      if (!data) {
        setToastMessage('Failed to generate share link')
        setShowToast(true)
        return
      }
      setShareLink(data.shareLink)
      shareUrl = data.shareUrl
      await navigator.clipboard.writeText(shareUrl)
      setToastMessage('Share link created and copied to clipboard')
      setShowToast(true)
    } catch (error) {
      console.error('Failed to copy link:', error)
      setError('Failed to copy preview link')
      setToastMessage('Failed to copy preview link')
      setShowToast(true)
    }
  }

  const handleRevokeLink = () => {
    setShowRevokeModal(true)
  }

  const handleConfirmRevoke = async () => {
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
  }

  const handleCloseRevokeModal = () => {
    setShowRevokeModal(false)
  }

  const handleArchiveShoot = () => {
    setShowArchiveModal(true)
  }

  const handleConfirmArchive = async () => {
    setIsArchiving(true)
    const isRestoring = shootData?.status === 'archived'
    const newStatus = isRestoring ? 'active' : 'archived'
    const { data, error: archiveError } = await updateShootStatus(id, newStatus)

    if (archiveError) {
      setToastMessage(archiveError.message)
      setShowToast(true)
      setIsArchiving(false)
      setShowArchiveModal(false)
      return
    }

    if (data) {
      setShootData(data)
    }

    setToastMessage(isRestoring ? 'Shoot unarchived successfully' : 'Shoot archived successfully')
    setShowToast(true)
    setIsArchiving(false)
    setShowArchiveModal(false)
  }

  const handleCloseArchiveModal = () => {
    setShowArchiveModal(false)
  }

  const handleDownloadAllImages = async () => {
    if (assets.length === 0) return

    for (let i = 0; i < assets.length; i++) {
      const asset = assets[i]
      // Use watermarked image if available, otherwise fall back to regular image
      const imageUrl = getWatermarkedImageUrl(asset.watermarked_image) || getAssetUrl(asset.image)
      
      try {
        // Fetch the image
        const response = await fetch(imageUrl)
        const blob = await response.blob()
        
        // Create a temporary URL for the blob
        const blobUrl = URL.createObjectURL(blob)
        
        // Extract filename from URL or use asset ID
        const urlParts = imageUrl.split('/')
        const urlFilename = urlParts[urlParts.length - 1].split('?')[0]
        const filename = urlFilename || `asset-${asset.id}.jpg`
        
        // Create a temporary anchor element and trigger download
        const link = document.createElement('a')
        link.href = blobUrl
        link.download = filename
        document.body.appendChild(link)
        link.click()
        
        // Clean up
        document.body.removeChild(link)
        URL.revokeObjectURL(blobUrl)
        
        // Small delay between downloads to prevent browser blocking
        if (i < assets.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 200))
        }
      } catch (error) {
        console.error(`Error downloading image ${asset.id}:`, error)
        // Continue with next image even if one fails
      }
    }
  }

  if (loading) {
    return (
      <main className='col-flex xl:max-w-[1144px] xl:mx-auto'>
        <div className='col-flex items-center justify-center py-12'>
          <span>Loading shoot...</span>
        </div>
      </main>
    )
  }

  if (error || !shootData) {
    return (
      <main className='col-flex xl:max-w-[1144px] xl:mx-auto'>
        <div className='col-flex items-center justify-center py-12'>
          <span className='text-red-500'>Error: {error || 'Shoot not found'}</span>
        </div>
      </main>
    )
  }

  const clientName = shootData.clients?.name || 'Unknown Client'

  return (
    <main className='col-flex xl:max-w-[1144px] xl:mx-auto'>
      {/* Title Section */}
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
            disabled={shareLinkLoading}
          >
            <span>{shareLink ? 'Copy share link' : 'Share to client'}</span>
            <Image src={share} alt='share' width={20} height={20} className='h-4 w-auto' />
          </Button>
            <Button 
              className='border border-foreground text-foreground w-full p-3.5 md:w-[322px] row-flex gap-2 flex-centerize'
              onClick={handleArchiveShoot}
              disabled={isArchiving}
            >
              <span>{shootData?.status === 'archived' ? 'Unarchive shoot' : 'Archive shoot'}</span>
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

      

      {/* Navigation Tabs */}
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

      {/* Images Grid */}
      {activeTab === 'Images' && (
        <>
          {assetsLoading ? (
            <div className='col-flex items-center justify-center py-12'>
              <span>Loading assets...</span>
            </div>
          ) : assets.length === 0 ? (
            <div className='col-flex gap-6 mb-8'>
              {/* Empty State Section for Assets */}
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
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUploadImages()
                  }}
                >
                  Upload images
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className='grid grid-cols-2 gap-4.5 mb-8 md:gap-7.5 xl:grid-cols-3'>
                {assets.map((asset) => {
                  // Use watermarked image if available, otherwise fall back to regular image
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

              {/* Action Buttons */}
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

      {/* Usage Document Tab Content */}
      {activeTab === 'Usage Document' && (() => {
        // Find the first usage rights with a contract
        const rightsWithContract = usageRights.find(rights => rights.contract)
        const contractUrl = rightsWithContract?.contract || null

        return (
          <>
            {contractUrl ? (
              <>
                <div className='mb-8'>
                  <PDFViewer src={contractUrl} title='Usage Document' />
                </div>

                {/* Download Agreement Button */}
                <Button 
                  className='bg-foreground text-background w-full p-3.5 md:w-[322px]'
                  onClick={() => {
                    if (contractUrl) {
                      const link = document.createElement('a')
                      link.href = contractUrl
                      link.download = 'usage-agreement.pdf'
                      link.target = '_blank'
                      document.body.appendChild(link)
                      link.click()
                      document.body.removeChild(link)
                    }
                  }}
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

      {/* Usage Rights Tab Content */}
      {activeTab === 'Usage Rights' && (
        <div className='col-flex gap-6'>
          {rightsLoading ? (
            <div className='col-flex items-center justify-center py-12'>
              <span>Loading usage rights...</span>
            </div>
          ) : usageRights.length === 0 ? (
            <div className='col-flex gap-6'>
              {/* Empty State Section for Usage Rights */}
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
                  onClick={(e) => {
                    e.stopPropagation()
                    handleAddUsageRights()
                  }}
                >
                  Add Usage Rights
                </Button>
              </div>
            </div>
          ) : (
            <>
              {usageRights.map((rights) => (
                <div key={rights.id} className='col-flex gap-6'>
                  <UsageRightsContent 
                    shootData={shootData}
                    usageRights={rights}
                  />

                  <div className='col-flex gap-2 xl:flex-row!'>
{/* Edit Button */}
<Button 
                    className='bg-background text-foreground border border-foreground w-full p-3.5 md:w-[322px]'
                    onClick={() => handleEditUsageRights(rights.id)}
                  >
                    Edit Usage Rights
                  </Button>
                  {/* Download PDF Button */}
              <Button 
                className='bg-foreground text-background w-full p-3.5 md:w-[322px]'
                onClick={() => downloadUsageRightsPDF(shootData, usageRights[0])}
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
        isRestore={shootData?.status === 'archived'}
      />
      <Toast isVisible={showToast} onClose={handleCloseToast} message={toastMessage} />
    </main>
  )
}

export default ShootPage

