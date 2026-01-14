'use client'

import React, { useState } from 'react'
import ImageGridItem from '@/app/components/atoms/ImageGridItem'
import PDFViewer from '@/app/components/atoms/PDFViewer'
import Button from '@/app/components/atoms/Button'
import DeleteAssetConfirmationModal from '@/app/components/atoms/DeleteAssetConfirmationModal'
import UsageRightsContent from '@/app/components/atoms/UsageRightsContent'
import { downloadUsageRightsPDF } from '@/app/components/atoms/UsageRightsPDF'

interface ShootPageProps {
  params: {
    id: string
  }
}

const ShootPage = ({ params }: ShootPageProps) => {
  const [activeTab, setActiveTab] = useState('Images')
  const [imageToDelete, setImageToDelete] = useState<number | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  
  // Mock data - replace with actual data fetching
  const shootData = {
    title: 'Title',
    client: 'client',
    doneDate: 'mm/dd/yy',
    deliveredDate: 'mm/dd/yy',
    expiryDate: 'mm/dd/yy',
    description: 'Porem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.',
    usageDocumentUrl: undefined // Replace with actual PDF URL when available
  }

  const tabs = ['Images', 'Usage Document', 'Usage Rights']
  const images = Array(4).fill(null) // Mock 4 images

  const handleDeleteImage = (index: number) => {
    setImageToDelete(index)
    setShowDeleteModal(true)
  }

  const handleConfirmDelete = () => {
    if (imageToDelete !== null) {
      // TODO: Implement delete image functionality - delete from backend
      console.log('Deleting image at index:', imageToDelete)
      setImageToDelete(null)
    }
  }

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false)
    setImageToDelete(null)
  }

  return (
    <main className='col-flex xl:max-w-[1144px] xl:mx-auto'>
      {/* Title Section */}
      <div className='col-flex gap-2 mb-8 xl:mb-25 xl:gap-3'>
        <h1>{shootData.title}</h1>
        <div className='text-sm col-flex gap-1'>
          <span className=' xl:text-3xl'>Done for {shootData.client}, on {shootData.doneDate}</span>
          <p className='font-normal xl:text-3xl'>{shootData.description}</p>
          <span className='xl:text-3xl font-bold'>Delivered to client, expiring {shootData.expiryDate}</span>
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
          <div className='grid grid-cols-2 gap-4.5 mb-8 md:gap-7.5'>
            {images.map((_, index) => (
              <ImageGridItem 
                key={index} 
                onDelete={() => handleDeleteImage(index)}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className='row-flex gap-2'>
            <Button className='bg-foreground text-background flex-1 p-3.5'>
              Download images
            </Button>
            <Button className='bg-background text-foreground border border-foreground flex-1 p-3.5'>
              Upload images
            </Button>
          </div>
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
          <UsageRightsContent shootData={shootData} />
          
          {/* Download PDF Button */}
          <Button 
            className='bg-foreground text-background w-full p-3.5 md:w-[322px]'
            onClick={() => downloadUsageRightsPDF(shootData)}
          >
            Download Usage Rights as PDF
          </Button>
        </div>
      )}

      <DeleteAssetConfirmationModal 
        isVisible={showDeleteModal}
        onClose={handleCloseDeleteModal}
        onConfirm={handleConfirmDelete}
      />
    </main>
  )
}

export default ShootPage

