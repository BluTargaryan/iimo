'use client'

import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import Button from './Button'
import closeIcon from '@/app/assets/images/close.svg'

interface NotesModalProps {
  isVisible: boolean
  onClose: () => void
}

const NotesModal = ({ isVisible, onClose }: NotesModalProps) => {
  const [showAddNoteForm, setShowAddNoteForm] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null)
  const [noteToEdit, setNoteToEdit] = useState<number | null>(null)

  useEffect(() => {
    if (isVisible) {
      // Prevent body scrolling when modal is open
      document.body.style.overflow = 'hidden'
    } else {
      // Restore body scrolling when modal is closed
      document.body.style.overflow = 'unset'
      // Reset form state when modal closes
      setShowAddNoteForm(false)
      setNoteText('')
      setNoteToDelete(null)
      setNoteToEdit(null)
    }

    // Cleanup: restore scrolling when component unmounts
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isVisible])

  if (!isVisible) return null

  // Sample notes data - in a real app, this would come from props or state
  const notes = [
    {
      id: 1,
      text: 'Gorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus.'
    },
    {
      id: 2,
      text: 'Gorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus.'
    },
    {
      id: 3,
      text: 'Gorem ipsum dolor sit amet, consectetur adipiscing elit. Etiam eu turpis molestie, dictum est a, mattis tellus.'
    }
  ]

  const handleAddNoteClick = () => {
    setShowAddNoteForm(true)
  }

  const handleSubmitNote = () => {
    if (noteText.trim()) {
      if (noteToEdit !== null) {
        // TODO: Implement edit note functionality - update in backend
        console.log('Editing note:', noteToEdit, 'with text:', noteText)
        setNoteToEdit(null)
      } else {
        // TODO: Implement add note functionality - save to backend
        console.log('Adding note:', noteText)
        setShowAddNoteForm(false)
      }
      // Reset form
      setNoteText('')
    }
  }

  const handleCancelNote = () => {
    setNoteText('')
    setShowAddNoteForm(false)
    setNoteToEdit(null)
  }

  const handleEditNote = (noteId: number) => {
    const note = notes.find(n => n.id === noteId)
    if (note) {
      setNoteText(note.text)
      setNoteToEdit(noteId)
      setShowAddNoteForm(false) // Close add form if open
    }
  }

  const handleDeleteNote = (noteId: number) => {
    setNoteToDelete(noteId)
  }

  const handleConfirmDelete = () => {
    if (noteToDelete !== null) {
      // TODO: Implement delete note functionality - delete from backend
      console.log('Deleting note:', noteToDelete)
      setNoteToDelete(null)
    }
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
        className='relative w-full max-w-2xl bg-background rounded-lg pt-8 px-6 pb-20 col-flex gap-6 max-h-[90vh] overflow-y-auto'
        onClick={(e) => e.stopPropagation()}
      >
        
        <button
          onClick={onClose}
          className='p-1.5 flex-centerize rounded-full w-fit bg-background border border-foreground'
          aria-label='Close notes'
        >
          <Image src={closeIcon} alt='close' width={100} height={100} className='w-2 h-auto' />
        </button>

        {/* Header with title and Add note button */}
        <div className='row-flex justify-between items-center mt-2'>
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
              >
                <span>{noteText.trim() ? 'Submit edits' : 'Add note'}</span>
              </Button>
              <Button 
                className='bg-background text-foreground border border-foreground flex-1 p-3!'
                onClick={handleCancelNote}
              >
                <span>Cancel</span>
              </Button>
            </div>
          </div>
        )}

        {/* Notes list */}
        <div className='col-flex gap-6'>
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
                    >
                      <span>Submit edits</span>
                    </Button>
                    <Button 
                      className='bg-background text-foreground border border-foreground flex-1 p-3!'
                      onClick={handleCancelNote}
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
                  <p className='text-sm'>{note.text}</p>
                  <div className='row-flex gap-2'>
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
      </div>
    </div>
  )
}

export default NotesModal
