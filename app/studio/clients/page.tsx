'use client'

import React, { useState } from 'react'

import AddShootClientFixed from '@/app/components/sections/AddShootClientFixed'
import Toast from '@/app/components/sections/Toast'
import ClientItem from '@/app/components/atoms/ClientItem'
import ArchiveConfirmationModal from '@/app/components/atoms/ArchiveConfirmationModal'


const Clients = () => {
  const [activeTab, setActiveTab] = useState('Active')
  const [showToast, setShowToast] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)

  const tabs = ['Active', 'Archived']

  const handleShare = () => {
    setShowToast(true)
  }

  const handleCloseToast = () => {
    setShowToast(false)
  }

  const handleArchiveClick = () => {
    setShowArchiveModal(true)
  }

  const handleCloseArchiveModal = () => {
    setShowArchiveModal(false)
  }

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
      className={`text-xl xl:text-3xl ${activeTab === tab ? 'font-bold' : ''}`}
    >
      {tab}
    </span>
  ))}
</div>


<div className='grid grid-cols-1 gap-12 lg:grid-cols-3 '>
  <ClientItem onArchive={handleArchiveClick} />
  <ClientItem onArchive={handleArchiveClick} />
  <ClientItem onArchive={handleArchiveClick} />
  <ClientItem onArchive={handleArchiveClick} />

</div>

  <ArchiveConfirmationModal isVisible={showArchiveModal} onClose={handleCloseArchiveModal} />
<AddShootClientFixed/>
<Toast isVisible={showToast} onClose={handleCloseToast} />
    </main>
  )
}

export default Clients