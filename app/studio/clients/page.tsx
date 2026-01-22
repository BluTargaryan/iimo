'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/app/contexts/AuthContext'
import { fetchClients, archiveClient, restoreClient, type Client } from '@/app/utils/clientOperations'
import AddShootClientFixed from '@/app/components/sections/AddShootClientFixed'
import Toast from '@/app/components/sections/Toast'
import ClientItem from '@/app/components/atoms/ClientItem'
import ArchiveConfirmationModal from '@/app/components/atoms/ArchiveConfirmationModal'
import NotesModal from '@/app/components/atoms/NotesModal'


const Clients = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('Active')
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [isArchiving, setIsArchiving] = useState(false)

  const tabs = ['Active', 'Archived']

  // Fetch clients when tab changes or component mounts
  useEffect(() => {
    if (!user?.id) return

    const loadClients = async () => {
      setLoading(true)
      setError(null)
      const status = activeTab === 'Active' ? 'active' : 'archived'
      const { data, error: fetchError } = await fetchClients(user.id, status)
      
      if (fetchError) {
        setError(fetchError.message)
        setClients([])
      } else {
        setClients(data || [])
      }
      setLoading(false)
    }

    loadClients()
  }, [user?.id, activeTab])

  const handleShare = () => {
    setShowToast(true)
  }

  const handleCloseToast = () => {
    setShowToast(false)
  }

  const handleArchiveClick = (clientId: string) => {
    setSelectedClientId(clientId)
    setShowArchiveModal(true)
  }

  const handleCloseArchiveModal = () => {
    setShowArchiveModal(false)
    setSelectedClientId(null)
  }

  const handleConfirmArchive = async () => {
    if (!selectedClientId || !user?.id) return

    setIsArchiving(true)
    
    // Determine if we're archiving or restoring based on current tab
    const isRestoring = activeTab === 'Archived'
    const { error } = isRestoring 
      ? await restoreClient(selectedClientId)
      : await archiveClient(selectedClientId)
    
    if (error) {
      setError(error.message)
      setIsArchiving(false)
      return
    }

    // Refresh clients list
    const status = activeTab === 'Active' ? 'active' : 'archived'
    const { data } = await fetchClients(user.id, status)
    setClients(data || [])
    
    setIsArchiving(false)
    setShowArchiveModal(false)
    setSelectedClientId(null)
  }

  const handleNotesClick = (clientId: string) => {
    setSelectedClientId(clientId)
    setShowNotesModal(true)
  }

  const handleCloseNotesModal = () => {
    setShowNotesModal(false)
    setSelectedClientId(null)
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


{loading ? (
  <div className='col-flex gap-4'>
    <p>Loading clients...</p>
  </div>
) : error ? (
  <div className='col-flex gap-4'>
    <p className='text-red-500'>Error: {error}</p>
  </div>
) : clients.length === 0 ? (
  <div className='col-flex gap-4'>
    <p>No {activeTab.toLowerCase()} clients found.</p>
  </div>
) : (
  <div className='grid grid-cols-1 gap-12 lg:grid-cols-3 '>
    {clients.map((client) => (
      <ClientItem
        key={client.id}
        id={client.id}
        name={client.name}
        email={client.email || undefined}
        createdAt={client.created_at}
        status={client.status}
        onArchive={handleArchiveClick}
        onNotes={handleNotesClick}
      />
    ))}
  </div>
)}

  <ArchiveConfirmationModal 
    isVisible={showArchiveModal} 
    onClose={handleCloseArchiveModal}
    clientId={selectedClientId || undefined}
    onConfirm={handleConfirmArchive}
    isLoading={isArchiving}
    isRestore={activeTab === 'Archived'}
  />
  <NotesModal 
    isVisible={showNotesModal} 
    onClose={handleCloseNotesModal}
    clientId={selectedClientId || undefined}
  />
<AddShootClientFixed/>
<Toast isVisible={showToast} onClose={handleCloseToast} />
    </main>
  )
}

export default Clients