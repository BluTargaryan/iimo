'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Button from '@/app/components/atoms/Button'
import ShootItem from '@/app/components/atoms/ShootItem'
import AddShootClientFixed from '@/app/components/sections/AddShootClientFixed'
import ArchiveConfirmationModal from '@/app/components/atoms/ArchiveConfirmationModal'
import Toast from '@/app/components/sections/Toast'

interface ClientPageProps {
  params: {
    id: string
  }
}

const ClientPage = ({ params }: ClientPageProps) => {
  const router = useRouter()
  const [activeShootTab, setActiveShootTab] = useState('Active')
  const [showAddNoteForm, setShowAddNoteForm] = useState(false)
  const [noteText, setNoteText] = useState('')
  const [noteToDelete, setNoteToDelete] = useState<number | null>(null)
  const [noteToEdit, setNoteToEdit] = useState<number | null>(null)
  const [showArchiveModal, setShowArchiveModal] = useState(false)
  const [showToast, setShowToast] = useState(false)

  // Mock data - replace with actual data fetching
  const clientData = {
    name: 'Client',
    addedDate: 'mm/dd/yy',
    shootCount: 2,
    email: 'xyz@email.com'
  }

  const shootTabs = ['Active', 'Expiring', 'Expired']

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

  const handleArchiveClick = () => {
    setShowArchiveModal(true)
  }

  const handleCloseArchiveModal = () => {
    setShowArchiveModal(false)
  }

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

  const handleShare = () => {
    setShowToast(true)
  }

  const handleCloseToast = () => {
    setShowToast(false)
  }

  return (
    <main className='col-flex xl:max-w-[1144px] xl:mx-auto pb-32'>
      {/* Client Section */}
      <div className='col-flex gap-4 mb-12'>
        <div className='col-flex justify-between items-start gap-4'>
          <div className='col-flex gap-2'>
            <h1 className='text-2xl xl:text-3xl font-bold'>Client</h1>
            <div className='col-flex gap-1 text-sm xl:text-base'>
              <span>Added on {clientData.addedDate}, has {clientData.shootCount} shoots</span>
              <span>
                Contact : <a href={`mailto:${clientData.email}`} className='underline'>{clientData.email}</a>
              </span>
            </div>
          </div>
          <Button 
            className='bg-background text-foreground border border-foreground px-4 py-2 rounded-3xl'
            onClick={handleArchiveClick}
          >
            <span>Archive client</span>
          </Button>
        </div>
      </div>

      {/* Notes Section */}
      <div className='col-flex gap-6 mb-12'>
        <div className='row-flex justify-between items-center'>
          <h2 className='text-xl xl:text-2xl font-bold'>Notes</h2>
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
      </div>

      {/* Shoots Section */}
      <div className='col-flex gap-6 mb-12'>
        <div className='row-flex justify-between items-center'>
          <h2 className='text-xl xl:text-2xl font-bold'>Shoots</h2>
          <Button 
            className='bg-foreground text-background px-4 py-2'
            onClick={() => router.push('/studio/add-shoot')}
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
        <div className='grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-3'>
          <ShootItem onShare={handleShare} />
          <ShootItem onShare={handleShare} />
        </div>
      </div>

      <ArchiveConfirmationModal isVisible={showArchiveModal} onClose={handleCloseArchiveModal} />
      <AddShootClientFixed />
      <Toast isVisible={showToast} onClose={handleCloseToast} />
    </main>
  )
}

export default ClientPage
