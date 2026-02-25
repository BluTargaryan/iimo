'use client'

import React, { useState, useCallback, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'
import {
  archiveClient,
  restoreClient,
  createNote,
  updateNote,
  deleteNote,
  type Client,
  type Note,
} from '@/app/utils/clientOperations'
import type { Shoot } from '@/app/utils/shootOperations'
import Button from '@/app/components/atoms/Button'
import ShootItem from '@/app/components/atoms/ShootItem'
import AddShootClientFixed from '@/app/components/sections/AddShootClientFixed'
import Toast from '@/app/components/sections/Toast'
import { formatDateShort } from '@/app/utils/format'

const ArchiveConfirmationModal = dynamic(() => import('@/app/components/atoms/ArchiveConfirmationModal'), { ssr: false })

const SHOOT_TAB_STATUS_MAP: Record<string, string> = {
  Active: 'active',
  Expiring: 'expiring',
  Expired: 'expired',
  Archived: 'archived',
}

interface ClientDetailClientProps {
  clientId: string
  initialClient: Client
  initialNotes: Note[]
  initialShoots: Shoot[]
  initialShootThumbnails: Record<string, string[]>
}

export default function ClientDetailClient({
  clientId,
  initialClient,
  initialNotes,
  initialShoots,
  initialShootThumbnails,
}: ClientDetailClientProps) {
  const router = useRouter()
  const [client, setClient] = useState<Client>(initialClient)
  const [notes, setNotes] = useState<Note[]>(initialNotes)
  const [shoots] = useState<Shoot[]>(initialShoots)
  const [shootThumbnails] = useState<Record<string, string[]>>(initialShootThumbnails)
  const [activeShootTab, setActiveShootTab] = useState('Active')
  const [showAddNoteForm, setShowAddNoteForm] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)
  const [noteToEdit, setNoteToEdit] = useState<string | null>(null)
  const [isSubmittingNote, setIsSubmittingNote] = useState(false)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [isArchiving, setIsArchiving] = useState(false)
  const [showToast, setShowToast] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const shootTabs = ['Active', 'Expiring', 'Expired', 'Archived']

  const filteredShoots = useMemo(() => {
    const targetStatus = SHOOT_TAB_STATUS_MAP[activeShootTab]
    return shoots.filter((shoot) => shoot.status === targetStatus)
  }, [shoots, activeShootTab])

  const handleEditClick = useCallback(() => {
    router.push(`/studio/clients/${clientId}/edit`)
  }, [router, clientId])

  const handleArchiveClick = useCallback(() => setShowArchiveModal(true), [])

  const handleCloseArchiveModal = useCallback(() => setShowArchiveModal(false), [])

  const handleConfirmArchive = useCallback(async () => {
    if (!client) return
    setIsArchiving(true)
    const isRestoring = client.status === 'archived'
    const { error: opError, data } = isRestoring
      ? await restoreClient(client.id)
      : await archiveClient(client.id)

    if (opError) {
      setError(opError.message)
      setIsArchiving(false)
      return
    }

    if (data && isRestoring) {
      setClient(data)
      setIsArchiving(false)
      setShowArchiveModal(false)
      return
    }

    router.push('/studio/clients')
  }, [client, router])

  const handleAddNoteClick = useCallback(() => setShowAddNoteForm(true), [])

  const handleSubmitNote = useCallback(async () => {
    if (!noteText.trim()) return
    setIsSubmittingNote(true)

    if (noteToEdit !== null) {
      const { data: updatedNote, error: opError } = await updateNote(noteToEdit, noteText)
      if (opError) { setError(opError.message); setIsSubmittingNote(false); return }
      if (updatedNote) setNotes((prev) => prev.map((n) => n.id === noteToEdit ? updatedNote : n))
      setNoteToEdit(null)
    } else {
      const { data: newNote, error: opError } = await createNote(clientId, noteText)
      if (opError) { setError(opError.message); setIsSubmittingNote(false); return }
      if (newNote) setNotes((prev) => [newNote, ...prev])
      setShowAddNoteForm(false)
    }

    setNoteText('')
    setIsSubmittingNote(false)
  }, [noteText, noteToEdit, clientId])

  const handleCancelNote = useCallback(() => {
    setNoteText('')
    setShowAddNoteForm(false)
    setNoteToEdit(null)
  }, [])

  const handleEditNote = useCallback((noteId: string) => {
    const note = notes.find((n) => n.id === noteId)
    if (note) {
      setNoteText(note.content)
      setNoteToEdit(noteId)
      setShowAddNoteForm(false)
    }
  }, [notes])

  const handleDeleteNote = useCallback((noteId: string) => setNoteToDelete(noteId), [])

  const handleConfirmDelete = useCallback(async () => {
    if (noteToDelete === null) return
    const { error: opError } = await deleteNote(noteToDelete)
    if (opError) { setError(opError.message); setNoteToDelete(null); return }
    setNotes((prev) => prev.filter((n) => n.id !== noteToDelete))
    setNoteToDelete(null)
  }, [noteToDelete])

  const handleCancelDelete = useCallback(() => setNoteToDelete(null), [])

  const handleShare = useCallback(() => setShowToast(true), [])

  const handleCloseToast = useCallback(() => setShowToast(false), [])

  const handleAddShootClick = useCallback(() => {
    router.push(`/studio/add-shoot?clientId=${clientId}`)
  }, [router, clientId])

  if (error) {
    return (
      <main className='col-flex md:gap-25 xl:max-w-[1144px] xl:mx-auto pb-32'>
        <div className='col-flex gap-4'>
          <p className='text-red-500'>Error: {error}</p>
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
    <main className='col-flex md:gap-25 xl:max-w-[1144px] xl:mx-auto pb-32'>
      <div className='col-flex gap-4 mb-12'>
        <div className='col-flex justify-between items-start gap-4'>
          <div className='col-flex gap-2 flex-1'>
            <h1 className='text-2xl xl:text-3xl font-bold'>{client.name}</h1>
            <div className='col-flex gap-1 text-sm md:text-base'>
              <span>
                Added on {formatDateShort(client.created_at)}, has {shoots.length}{' '}
                {shoots.length === 1 ? 'shoot' : 'shoots'}
              </span>
              {client.email && (
                <span>
                  Contact :{' '}
                  <a href={`mailto:${client.email}`} className='underline'>
                    {client.email}
                  </a>
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
                <span>{isSubmittingNote ? 'Saving...' : noteText.trim() ? 'Submit edits' : 'Add note'}</span>
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

        {notes.length === 0 && !showAddNoteForm ? (
          <div className='col-flex gap-4'>
            <p>No notes yet. Add your first note above.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3'>
            {notes.map((note) => (
              <div key={note.id} className='col-flex gap-2 relative'>
                {noteToEdit === note.id ? (
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
                  <div className='bg-foreground rounded-lg p-6 col-flex gap-6 items-center justify-center'>
                    <p className='text-background text-center'>Are you sure you want to delete this note ?</p>
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

      <div className='col-flex gap-6 mb-12 md:gap-16'>
        <div className='row-flex justify-between items-center'>
          <h2 className='text-xl xl:text-2xl font-bold'>Shoots</h2>
          <Button
            className='bg-foreground text-background px-4 py-2 xl:w-[238px]'
            onClick={handleAddShootClick}
          >
            <span>Add shoot</span>
          </Button>
        </div>

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

        {filteredShoots.length === 0 ? (
          <div className='col-flex items-center justify-center py-12'>
            <span>No {activeShootTab.toLowerCase()} shoots found</span>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3'>
            {filteredShoots.map((shoot) => (
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
