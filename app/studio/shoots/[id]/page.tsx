'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { fetchShootById, type ShootWithClient } from '@/app/utils/shootOperations'
import { fetchAssets, deleteAsset, getAssetUrl, getWatermarkedImageUrl, type Asset } from '@/app/utils/assetOperations'
import { fetchUsageRights, type UsageRights } from '@/app/utils/usageRightsOperations'
import ImageGridItem from '@/app/components/atoms/ImageGridItem'
import PDFViewer from '@/app/components/atoms/PDFViewer'
import Button from '@/app/components/atoms/Button'
import DeleteAssetConfirmationModal from '@/app/components/atoms/DeleteAssetConfirmationModal'
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

  const tabs = ['Images', 'Usage Document', 'Usage Rights']

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

  const handleSharePreview = async () => {
    try {
      const previewUrl = `${window.location.origin}/preview/${id}`
      await navigator.clipboard.writeText(previewUrl)
      setToastMessage('Preview link copied to clipboard')
      setShowToast(true)
    } catch (error) {
      console.error('Failed to copy link:', error)
      setError('Failed to copy preview link')
    }
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
        <Button 
          className='border border-foreground text-foreground w-full p-3.5 md:w-[322px] row-flex gap-2 flex-centerize'
          onClick={handleSharePreview}
        >
          <span>Share to client</span>
          <Image src={share} alt='share' width={20} height={20} className='h-4 w-auto' />
        </Button>
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
      {activeTab === 'Usage Document' && (
        <>
          <div className='mb-8'>
            <PDFViewer src='/documents/test.pdf' title='Usage Document' />
          </div>

          {/* Download Agreement Button */}
          <Button className='bg-foreground text-background w-full p-3.5 md:w-[322px]'>
            Download agreement
          </Button>
        </>
      )}

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
                <UsageRightsContent 
                  key={rights.id}
                  shootData={shootData}
                  usageRights={rights}
                />
              ))}
              
              {/* Download PDF Button */}
              <Button 
                className='bg-foreground text-background w-full p-3.5 md:w-[322px]'
                onClick={() => downloadUsageRightsPDF(shootData, usageRights[0])}
              >
                Download Usage Rights as PDF
              </Button>
            </>
          )}
        </div>
      )}

      <DeleteAssetConfirmationModal 
        isVisible={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
      <Toast isVisible={showToast} onClose={handleCloseToast} message={toastMessage} />
    </main>
  )
}

export default ShootPage

