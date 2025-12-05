'use client'

import React, { useState } from 'react'
import ImageGridItem from '@/app/components/atoms/ImageGridItem'
import PDFViewer from '@/app/components/atoms/PDFViewer'
import Button from '@/app/components/atoms/Button'

interface ShootPageProps {
  params: {
    id: string
  }
}

const ShootPage = ({ params }: ShootPageProps) => {
  const [activeTab, setActiveTab] = useState('Images')
  
  // Mock data - replace with actual data fetching
  const shootData = {
    title: 'Title',
    owner: 'user',
    expiryDate: 'dd/mm/yy',
    usageDocumentUrl: undefined // Replace with actual PDF URL when available
  }

  const tabs = ['Images', 'Usage Document']
  const images = Array(4).fill(null) // Mock 4 images

  return (
    <main className='col-flex xl:max-w-[1144px] xl:mx-auto'>
      {/* Title Section */}
      <div className='col-flex gap-2 mb-8 xl:mb-25 xl:gap-3'>
        <h1>{shootData.title}</h1>
        <div className='col-flex gap-1'>
          <span className='text-xl xl:text-3xl'>Owned by {shootData.owner}</span>
          <span className='text-xl xl:text-3xl'>Usage expiring {shootData.expiryDate}</span>
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
            className={`text-xl xl:text-3xl ${activeTab === tab ? 'h1-like' : ''}`}
          >
            {tab}
          </span>
        ))}
      </div>

      {/* Images Grid */}
      {activeTab === 'Images' && (
        <>
          <div className='grid grid-cols-3 gap-4.5 mb-8 md:gap-7.5'>
            {images.map((_, index) => (
              <ImageGridItem key={index} />
            ))}
          </div>

          {/* Download Images Button */}
          <Button className='bg-foreground text-background w-full p-3.5 md:w-[322px]'>
            Download images
          </Button>
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
    </main>
  )
}

export default ShootPage

