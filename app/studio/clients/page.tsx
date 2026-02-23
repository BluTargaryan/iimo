'use client'

import React, { useState, useEffect, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useAuth } from '@/app/contexts/AuthContext'
import { fetchClients, archiveClient, restoreClient, type Client } from '@/app/utils/clientOperations'
import AddShootClientFixed from '@/app/components/sections/AddShootClientFixed'
import Toast from '@/app/components/sections/Toast'
import ClientItem from '@/app/components/atoms/ClientItem'

// Lazy load modals
const ArchiveConfirmationModal = dynamic(() => import('@/app/components/atoms/ArchiveConfirmationModal'), { ssr: false })
const NotesModal = dynamic(() => import('@/app/components/atoms/NotesModal'), { ssr: false })


const Clients = () => {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState('Active')
  const [searchQuery, setSearchQuery] = useState('')
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [showNotesModal, setShowNotesModal] = useState(false)
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null)
  const [isArchiving, setIsArchiving] = useState(false)

  const tabs = ['Active', 'Archived']

  // Fetch all clients once on mount
  useEffect(() => {
    if (!user?.id) return

    const loadClients = async () => {
      setLoading(true)
      setError(null)
      // Fetch all clients without status filter
      const { data, error: fetchError } = await fetchClients(user.id)
      
      if (fetchError) {
        setError(fetchError.message)
        setClients([])
      } else {
        setClients(data || [])
      }
      setLoading(false)
    }

    loadClients()
  }, [user?.id]) // Removed activeTab dependency

  // Filter clients by active tab and search query in memory
  const filteredClients = useMemo(() => {
    let result = clients.filter(client => {
      if (activeTab === 'Active') {
        return client.status === 'active'
      } else {
        return client.status === 'archived'
      }
    })
    const q = searchQuery.trim()
    if (q !== '') {
      const lower = q.toLowerCase()
      result = result.filter(
        client =>
          (client.name || '').toLowerCase().includes(lower) ||
          (client.email || '').toLowerCase().includes(lower)
      )
    }
    return result
  }, [clients, activeTab, searchQuery])

  const handleShare = useCallback(() => {
    setShowToast(true)
  }, [])

  const handleCloseToast = useCallback(() => {
    setShowToast(false)
  }, [])

  const handleArchiveClick = useCallback((clientId: string) => {
    setSelectedClientId(clientId)
    setShowArchiveModal(true)
  }, [])

  const handleCloseArchiveModal = useCallback(() => {
    setShowArchiveModal(false)
    setSelectedClientId(null)
  }, [])

  const handleConfirmArchive = useCallback(async () => {
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

    // Update local state instead of refetching
    setClients(prevClients => 
      prevClients.map(client => 
        client.id === selectedClientId 
          ? { ...client, status: isRestoring ? 'active' : 'archived' as 'active' | 'archived' }
          : client
      )
    )
    
    setIsArchiving(false)
    setShowArchiveModal(false)
    setSelectedClientId(null)
  }, [selectedClientId])

  const handleNotesClick = useCallback((clientId: string) => {
    setSelectedClientId(clientId)
    setShowNotesModal(true)
  }, [])

  const handleCloseNotesModal = useCallback(() => {
    setShowNotesModal(false)
    setSelectedClientId(null)
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
  <div className='row-flex items-center gap-2 md:ml-auto'>
    <input
      type='text'
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      placeholder='Search clients...'
      className='border border-foreground rounded-3xl p-2.5 md:p-3.5 text-foreground bg-transparent focus:outline-none min-w-0 max-w-[240px]'
    />
    {searchQuery.trim() !== '' && (
      <button
        type='button'
        onClick={() => setSearchQuery('')}
        className='text-foreground hover:opacity-70 p-1'
        aria-label='Clear search'
      >
        ×
      </button>
    )}
  </div>
</div>


{loading ? (
  <div className='col-flex gap-4'>
    <p>Loading clients...</p>
  </div>
) : error ? (
  <div className='col-flex gap-4'>
    <p className='text-red-500'>Error: {error}</p>
  </div>
) : filteredClients.length === 0 ? (
  <div className='col-flex gap-4'>
    <p>
      {searchQuery.trim() !== ''
        ? `No clients match your search for "${searchQuery.trim()}"`
        : `No ${activeTab.toLowerCase()} clients found.`}
    </p>
  </div>
) : (
  <div className='grid grid-cols-1 gap-12 lg:grid-cols-3 '>
    {filteredClients.map((client) => (
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