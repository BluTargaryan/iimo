'use client'

import React, { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import Button from './Button'
import closeIcon from '@/app/assets/images/close.svg'
import { fetchNotes, createNote, updateNote, deleteNote, type Note } from '@/app/utils/clientOperations'

interface NotesModalProps {
  isVisible: boolean
  onClose: () => void
  clientId?: string
}

const NotesModal = ({ isVisible, onClose, clientId }: NotesModalProps) => {
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(false)
  const [showAddNoteForm, setShowAddNoteForm] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteToDelete, setNoteToDelete] = useState<string | null>(null)
  const [noteToEdit, setNoteToEdit] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const prevVisibleRef = useRef(false)

  const notesToShow = isVisible && clientId ? notes : []

  // Fetch notes when modal opens and clientId is provided
  useEffect(() => {
    if (isVisible && clientId) {
      const loadNotes = async () => {
        setLoading(true)
        const { data, error } = await fetchNotes(clientId)
        if (error) {
          console.error('Error fetching notes:', error)
          setNotes([])
        } else {
          setNotes(data || [])
        }
        setLoading(false)
      }
      loadNotes()
    }
  }, [isVisible, clientId])

  useEffect(() => {
    if (isVisible) {
      if (!prevVisibleRef.current) {
        queueMicrotask(() => {
          setShowAddNoteForm(false)
          setNoteText('')
          setNoteToDelete(null)
          setNoteToEdit(null)
          setNotes([])
        })
        prevVisibleRef.current = true
      }
      document.body.style.overflow = 'hidden'
    } else {
      prevVisibleRef.current = false
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isVisible])

  if (!isVisible) return null

  const handleAddNoteClick = () => {
    setShowAddNoteForm(true)
  }

  const handleSubmitNote = async () => {
    if (!noteText.trim() || !clientId) return

    setIsSubmitting(true)
    
    if (noteToEdit !== null) {
      // Update existing note
      const { error } = await updateNote(noteToEdit, noteText)
      if (error) {
        console.error('Error updating note:', error)
        setIsSubmitting(false)
        return
      }
      setNoteToEdit(null)
    } else {
      // Create new note
      const { error } = await createNote(clientId, noteText)
      if (error) {
        console.error('Error creating note:', error)
        setIsSubmitting(false)
        return
      }
      setShowAddNoteForm(false)
    }

    // Refresh notes list
    const { data } = await fetchNotes(clientId)
    setNotes(data || [])
    
    // Reset form
    setNoteText('')
    setIsSubmitting(false)
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
    if (noteToDelete === null || !clientId) return

    const { error } = await deleteNote(noteToDelete)
    if (error) {
      console.error('Error deleting note:', error)
      setNoteToDelete(null)
      return
    }

    // Refresh notes list
    const { data } = await fetchNotes(clientId)
    setNotes(data || [])
    setNoteToDelete(null)
  }

  const handleCancelDelete = () => {
    setNoteToDelete(null)
  }

  return (
    <div 
      className='fixed inset-0 z-9999 bg-black/20 flex-centerize p-4'
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose()
        }
      }}
    >
      <div 
        className='relative w-full max-w-2xl bg-background rounded-lg pt-8 px-6 pb-20 col-flex gap-6 max-h-[90vh] overflow-y-auto
        
        xl:max-w-[1152px]
        '
        onClick={(e) => e.stopPropagation()}
      >
        
        <button
          onClick={onClose}
          className='p-1.5 flex-centerize rounded-full w-fit bg-background border border-foreground'
          aria-label='Close notes'
        >
          <Image src={closeIcon} alt='close' width={100} height={100} sizes="16px" className='w-2 h-auto' />
        </button>

        {/* Header with title and Add note button */}
        <div className='row-flex justify-between items-center mt-2 md:mb-12 xl:w-[956px] xl:mx-auto'>
          <h2 className='text-2xl font-bold'>Notes</h2>
          <Button 
            className='bg-foreground text-background px-4 py-2'
            onClick={handleAddNoteClick}
          >
            <span>Add note</span>
          </Button>
        </div>

        {/* Add note form */}
        {showAddNoteForm && (
          <div className='col-flex gap-4 xl:w-[956px] xl:mx-auto'>
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
                disabled={isSubmitting || !clientId}
              >
                <span>{isSubmitting ? 'Saving...' : (noteText.trim() ? 'Submit note' : 'Add note')}</span>
              </Button>
              <Button 
                className='bg-background text-foreground border border-foreground w-full p-3! xl:w-[238px]!'
                onClick={handleCancelNote}
              >
                <span>Cancel</span>
              </Button>
            </div>
          </div>
        )}

        {/* Notes list */}
        {loading ? (
          <div className='col-flex gap-4 xl:w-[956px] xl:mx-auto'>
            <p>Loading notes...</p>
          </div>
        ) : notesToShow.length === 0 ? (
          <div className='col-flex gap-4 xl:w-[956px] xl:mx-auto'>
            <p>No notes yet. Add your first note above.</p>
          </div>
        ) : (
          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3 xl:w-[956px] xl:mx-auto'>
            {notesToShow.map((note) => (
              <div key={note.id} className='col-flex gap-2 relative '>
                {noteToEdit === note.id ? (
                  /* Edit note form */
                  <div className='col-flex gap-4 '>
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
                        disabled={isSubmitting}
                      >
                        <span>{isSubmitting ? 'Saving...' : 'Submit edits'}</span>
                      </Button>
                      <Button 
                        className='bg-background text-foreground border border-foreground flex-1 p-3!'
                        onClick={handleCancelNote}
                        disabled={isSubmitting}
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
                    <p className='text-sm xl:text-base xl:mb-6'>{note.content}</p>
                    <div className='row-flex gap-2 xl:flex-col!'>
                      <Button 
                        className='bg-background text-foreground border border-foreground px-3 py-1 flex-1'
                        onClick={() => handleEditNote(note.id)}
                      >
                        <span>Edit</span>
                      </Button>
                      <Button 
                        className='bg-background text-foreground border border-foreground px-3 py-1 flex-1'
                        onClick={() => handleDeleteNote(note.id)}
                      >
                        <span>Delete</span>
                      </Button>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default NotesModal
