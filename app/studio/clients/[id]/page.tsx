'use client'

import React, { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/app/contexts/AuthContext'
import {
  fetchClientById,
  archiveClient,
  restoreClient,
  fetchNotes,
  createNote,
  updateNote,
  deleteNote,
  type Client,
  type Note,
} from '@/app/utils/clientOperations'
import { fetchShootsByClient, type Shoot } from '@/app/utils/shootOperations'
import { fetchAssets, fetchAssetsForShoots, getWatermarkedImageUrl, getAssetUrl } from '@/app/utils/assetOperations'
import { supabase } from '@/app/utils/supabase'
import Button from '@/app/components/atoms/Button'
import ShootItem from '@/app/components/atoms/ShootItem'
import AddShootClientFixed from '@/app/components/sections/AddShootClientFixed'
import ArchiveConfirmationModal from '@/app/components/atoms/ArchiveConfirmationModal'
import Toast from '@/app/components/sections/Toast'
import { formatDateShort } from '@/app/utils/format'

interface ClientPageProps {
  params: Promise<{
    id: string
  }>
}

const ClientPage = ({ params }: ClientPageProps) => {
  const { id } = use(params)
  const router = useRouter()
  const { user } = useAuth()
  const [client, setClient] = useState<Client | null>(null)
  const [notes, setNotes] = useState<Note[]>([])
  const [shoots, setShoots] = useState<Shoot[]>([])
  const [totalShootCount, setTotalShootCount] = useState<number>(0)
  const [shootThumbnails, setShootThumbnails] = useState<Record<string, string[]>>({})
  const [shootsLoading, setShootsLoading] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeShootTab, setActiveShootTab] = useState('Active')
  const [showAddNoteForm, setShowAddNoteForm] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)
  const [noteToEdit, setNoteToEdit] = useState<string | null>(null)
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const shootTabs = ['Active', 'Expiring', 'Expired', 'Archived']

  // Fetch client and notes on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      setError(null)

      const { data: clientData, error: clientError } = await fetchClientById(id)
      if (clientError || !clientData) {
        setError(clientError?.message || 'Client not found')
        setLoading(false)
        return
      }

      setClient(clientData)

      const { data: notesData, error: notesError } = await fetchNotes(id)
      if (notesError) {
        console.error('Error fetching notes:', notesError)
        setNotes([])
      } else {
        setNotes(notesData || [])
      }

      setLoading(false)
    }

    loadData()
  }, [id])

  // Fetch shoots when client is loaded and tab changes
  useEffect(() => {
    if (!client?.id) return

    const loadShoots = async () => {
      setShootsLoading(true)
      
      // Fetch total count using count query (more efficient)
      const { count } = await supabase
        .from('shoots')
        .select('*', { count: 'exact', head: true })
        .eq('client_id', client.id)
      setTotalShootCount(count || 0)
      
      // Fetch filtered shoots for current tab
      const { data, error: fetchError } = await fetchShootsByClient(
        client.id,
        activeShootTab as 'Active' | 'Expiring' | 'Expired' | 'Archived'
      )
      
      if (fetchError) {
        console.error('Error fetching shoots:', fetchError)
        setShoots([])
        setShootThumbnails({})
        setShootsLoading(false)
        return
      }

      const shootsData = data || []
      setShoots(shootsData)

      // Batch fetch assets for all shoots in one query
      const shootIds = shootsData.map(shoot => shoot.id)
      const { data: assetsByShoot } = await fetchAssetsForShoots(shootIds)
      
      const thumbnailMap: Record<string, string[]> = {}
      shootsData.forEach((shoot) => {
        const assets = assetsByShoot?.[shoot.id] || []
        if (assets.length > 0) {
          // Get first 4 watermarked images, falling back to regular image if watermarked not available
          const thumbnails = assets.slice(0, 4).map(asset => {
            const watermarkedUrl = getWatermarkedImageUrl(asset.watermarked_image)
            return watermarkedUrl || getAssetUrl(asset.image)
          })
          thumbnailMap[shoot.id] = thumbnails
        } else {
          thumbnailMap[shoot.id] = []
        }
      })
      setShootThumbnails(thumbnailMap)
      setShootsLoading(false)
    }

    loadShoots()
  }, [client?.id, activeShootTab])

  // formatDate moved to utils/format.ts

  const handleEditClick = () => {
    router.push(`/studio/clients/${id}/edit`)
  }

  const handleArchiveClick = () => {
    setShowArchiveModal(true)
  }

  const handleCloseArchiveModal = () => {
    setShowArchiveModal(false)
  }

  const handleConfirmArchive = async () => {
    if (!client) return

    setIsArchiving(true)
    
    // If client is archived, restore it; otherwise archive it
    const isRestoring = client.status === 'archived'
    const { error, data } = isRestoring
      ? await restoreClient(client.id)
      : await archiveClient(client.id)

    if (error) {
      setError(error.message)
      setIsArchiving(false)
      return
    }

    // Update client state if restore was successful
    if (data && isRestoring) {
      setClient(data)
      setIsArchiving(false)
      setShowArchiveModal(false)
      return
    }

    // Redirect to clients list after archiving
    router.push('/studio/clients')
  }

  const handleAddNoteClick = () => {
    setShowAddNoteForm(true)
  }

  const handleSubmitNote = async () => {
    if (!noteText.trim() || !client) return

    setIsSubmittingNote(true)

    if (noteToEdit !== null) {
      // Update existing note
      const { error } = await updateNote(noteToEdit, noteText)
      if (error) {
        setError(error.message)
        setIsSubmittingNote(false)
        return
      }
      setNoteToEdit(null)
    } else {
      // Create new note
      const { error } = await createNote(client.id, noteText)
      if (error) {
        setError(error.message)
        setIsSubmittingNote(false)
        return
      }
      setShowAddNoteForm(false)
    }

    // Refresh notes list
    const { data } = await fetchNotes(client.id)
    setNotes(data || [])

    // Reset form
    setNoteText('')
    setIsSubmittingNote(false)
  }

  const handleCancelNote = () => {
    setNoteText('')
    setShowAddNoteForm(false)
    setNoteToEdit(null)
  }

  const handleEditNote = (noteId: string) => {
    const note = notes.find(n => n.id === noteId)
    if (note) {
      setNoteText(note.content)
      setNoteToEdit(noteId)
      setShowAddNoteForm(false) // Close add form if open
    }
  }

  const handleDeleteNote = (noteId: string) => {
    setNoteToDelete(noteId)
  }

  const handleConfirmDelete = async () => {
    if (noteToDelete === null || !client) return

    const { error } = await deleteNote(noteToDelete)
    if (error) {
      setError(error.message)
      setNoteToDelete(null)
      return
    }

    // Refresh notes list
    const { data } = await fetchNotes(client.id)
    setNotes(data || [])
    setNoteToDelete(null)
  }

  const handleCancelDelete = () => {
    setNoteToDelete(null)
  }

  const handleShare = () => {
    setShowToast(true)
  }

  const handleCloseToast = () => {
    setShowToast(false)
  }

  if (loading) {
    return (
      <main className='col-flex md:gap-25 xl:max-w-[1144px] xl:mx-auto pb-32'>
        <div className='col-flex gap-4'>
          <p>Loading client...</p>
        </div>
      </main>
    )
  }

  if (error || !client) {
    return (
      <main className='col-flex md:gap-25 xl:max-w-[1144px] xl:mx-auto pb-32'>
        <div className='col-flex gap-4'>
          <p className='text-red-500'>Error: {error || 'Client not found'}</p>
          <Button
            className='bg-foreground text-background px-4 py-2 w-fit'
            onClick={() => router.push('/studio/clients')}
          >
            <span>Back to Clients</span>
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className='col-flex  md:gap-25 xl:max-w-[1144px] xl:mx-auto pb-32'>
      {/* Client Section */}
      <div className='col-flex gap-4 mb-12 '>
        <div className='col-flex justify-between items-start gap-4'>
          <div className='col-flex gap-2 flex-1'>
            <h1 className='text-2xl xl:text-3xl font-bold'>{client.name}</h1>
            <div className='col-flex gap-1 text-sm md:text-base'>
              <span>Added on {formatDateShort(client.created_at)}, has {totalShootCount} {totalShootCount === 1 ? 'shoot' : 'shoots'}</span>
              {client.email && (
                <span>
                  Contact : <a href={`mailto:${client.email}`} className='underline'>{client.email}</a>
                </span>
              )}
            </div>
          </div>
          <div className='row-flex gap-2'>
            <Button 
              className='bg-background text-foreground border border-foreground px-4 py-2 rounded-3xl'
              onClick={handleEditClick}
            >
              <span>Edit</span>
            </Button>
            <Button 
              className='bg-background text-foreground border border-foreground px-4 py-2 rounded-3xl'
              onClick={handleArchiveClick}
            >
              <span>{client.status === 'archived' ? 'Restore client' : 'Archive client'}</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Notes Section */}
      <div className='col-flex gap-6 mb-12 md:gap-16'>
        <div className='row-flex justify-between items-center'>
          <h2 className='text-xl xl:text-2xl font-bold'>Notes</h2>
          <Button 
            className='bg-foreground text-background px-4 py-2 xl:w-[238px]'
            onClick={handleAddNoteClick}
          >
            <span>Add note</span>
          </Button>
        </div>

        {/* Add note form */}
        {showAddNoteForm && (
          <div className='col-flex gap-4'>
            <textarea
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder='Enter your note here...'
              className='w-full border border-foreground rounded-lg p-4 min-h-[120px] resize-none focus:outline-none'
              rows={4}
            />
            <div className='row-flex gap-2'>
              <Button 
                className='bg-foreground text-background w-full p-3! xl:w-[238px]!'
                onClick={handleSubmitNote}
                disabled={isSubmittingNote}
              >
                <span>{isSubmittingNote ? 'Saving...' : (noteText.trim() ? 'Submit edits' : 'Add note')}</span>
              </Button>
              <Button 
                className='bg-background text-foreground border border-foreground w-full p-3! xl:w-[238px]!'
                onClick={handleCancelNote}
                disabled={isSubmittingNote}
              >
                <span>Cancel</span>
              </Button>
            </div>
          </div>
        )}

        {/* Notes list */}
        {notes.length === 0 && !showAddNoteForm ? (
          <div className='col-flex gap-4'>
            <p>No notes yet. Add your first note above.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
            {notes.map((note) => (
              <div key={note.id} className='col-flex gap-2 relative'>
                {noteToEdit === note.id ? (
                  /* Edit note form */
                  <div className='col-flex gap-4'>
                    <textarea
                      value={noteText}
                      onChange={(e) => setNoteText(e.target.value)}
                      placeholder='Enter your note here...'
                      className='w-full border border-foreground rounded-lg p-4 min-h-[120px] resize-none focus:outline-none'
                      rows={4}
                    />
                    <div className='row-flex gap-2'>
                      <Button 
                        className='bg-foreground text-background flex-1 p-3!'
                        onClick={handleSubmitNote}
                        disabled={isSubmittingNote}
                      >
                        <span>{isSubmittingNote ? 'Saving...' : 'Submit edits'}</span>
                      </Button>
                      <Button 
                        className='bg-background text-foreground border border-foreground flex-1 p-3!'
                        onClick={handleCancelNote}
                        disabled={isSubmittingNote}
                      >
                        <span>Cancel</span>
                      </Button>
                    </div>
                  </div>
                ) : noteToDelete === note.id ? (
                  /* Delete confirmation modal */
                  <div className='bg-foreground rounded-lg p-6 col-flex gap-6 items-center justify-center'>
                    <p className='text-background text-center'>
                      Are you sure you want to delete this note ?
                    </p>
                    <div className='row-flex gap-2 w-full'>
                      <Button 
                        className='bg-background text-foreground border border-foreground flex-1 p-3!'
                        onClick={handleCancelDelete}
                      >
                        <span>No, cancel</span>
                      </Button>
                      <Button 
                        className='bg-foreground border border-background text-background flex-1 p-3!'
                        onClick={handleConfirmDelete}
                      >
                        <span>Yes, delete</span>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className='text-sm md:text-base'>{note.content}</p>
                    <div className='row-flex gap-2'>
                      <Button 
                        className='bg-background text-foreground border border-foreground px-3 py-2 flex-1'
                        onClick={() => handleEditNote(note.id)}
                      >
                        <span>Edit note</span>
                      </Button>
                      <Button 
                        className='bg-background text-foreground border border-foreground px-3 py-2 flex-1'
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <span>Delete note</span>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Shoots Section */}
      <div className='col-flex gap-6 mb-12 md:gap-16'>
        <div className='row-flex justify-between items-center'>
          <h2 className='text-xl xl:text-2xl font-bold'>Shoots</h2>
          <Button 
            className='bg-foreground text-background px-4 py-2 xl:w-[238px]'
            onClick={() => router.push(`/studio/add-shoot?clientId=${client.id}`)}
          >
            <span>Add shoot</span>
          </Button>
        </div>

        {/* Shoots Tabs */}
        <div className='col-flex gap-3 border-b-[0.5px] border-foreground pb-2 mb-6
        md:flex-row! md:items-center! md:gap-12
        xl:pb-4
        '>
          {shootTabs.map((tab) => (
            <span
              key={tab}
              onClick={() => setActiveShootTab(tab)}
              className={`text-xl xl:text-3xl cursor-pointer ${activeShootTab === tab ? 'font-bold' : ''}`}
            >
              {tab}
            </span>
          ))}
        </div>

        {/* Shoots Grid */}
        {shootsLoading ? (
          <div className='col-flex items-center justify-center py-12'>
            <span>Loading shoots...</span>
          </div>
        ) : shoots.length === 0 ? (
          <div className='col-flex items-center justify-center py-12'>
            <span>No shoots found</span>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3'>
            {shoots.map((shoot) => (
              <ShootItem 
                key={shoot.id} 
                shoot={shoot} 
                onShare={handleShare}
                thumbnailUrls={shootThumbnails[shoot.id]}
              />
            ))}
          </div>
        )}
      </div>

      <ArchiveConfirmationModal 
        isVisible={showArchiveModal} 
        onClose={handleCloseArchiveModal}
        clientId={client.id}
        onConfirm={handleConfirmArchive}
        isLoading={isArchiving}
        isRestore={client.status === 'archived'}
      />
      <AddShootClientFixed />
      <Toast isVisible={showToast} onClose={handleCloseToast} />
    </main>
  )
}

export default ClientPage
