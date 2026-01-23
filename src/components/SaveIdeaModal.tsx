import { useRef, useImperativeHandle, forwardRef, useState } from 'react'
import type { Video } from '../lib/types'

export interface SaveIdeaModalRef {
  open: (video: Video) => void
  close: () => void
}

export interface SaveIdeaModalProps {
  onSave: (videoId: string, note: string, addedBy: string) => Promise<{ success: boolean; error?: string }>
}

const LOCALSTORAGE_KEY = 'youtubeTracker_userName'
const MIN_NOTE_LENGTH = 10

/**
 * Modal for saving video ideas with notes.
 * Uses native dialog element following ConfirmDialog pattern.
 * REQ-IDX-001: Save ideas with note and user attribution.
 */
export const SaveIdeaModal = forwardRef<SaveIdeaModalRef, SaveIdeaModalProps>(
  function SaveIdeaModal({ onSave }, ref) {
    const dialogRef = useRef<HTMLDialogElement>(null)

    // Local state
    const [video, setVideo] = useState<Video | null>(null)
    const [note, setNote] = useState('')
    const [addedBy, setAddedBy] = useState('')
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [noteError, setNoteError] = useState<string | null>(null)

    // Expose open/close methods via ref
    useImperativeHandle(ref, () => ({
      open: (videoToSave: Video) => {
        setVideo(videoToSave)
        setNote('')
        setNoteError(null)
        setError(null)
        setIsSubmitting(false)
        // Pre-fill addedBy from localStorage
        setAddedBy(localStorage.getItem(LOCALSTORAGE_KEY) || '')
        dialogRef.current?.showModal()
      },
      close: () => {
        dialogRef.current?.close()
      },
    }))

    const handleClose = () => {
      dialogRef.current?.close()
    }

    const validateNote = (value: string): boolean => {
      if (value.trim().length < MIN_NOTE_LENGTH) {
        setNoteError(`Note must be at least ${MIN_NOTE_LENGTH} characters`)
        return false
      }
      setNoteError(null)
      return true
    }

    const handleNoteBlur = () => {
      if (note.trim().length > 0) {
        validateNote(note)
      }
    }

    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault()

      // Validate
      if (!video) return

      const isNoteValid = validateNote(note)
      if (!isNoteValid) return

      if (!addedBy.trim()) {
        setError('Please enter your name')
        return
      }

      setError(null)
      setIsSubmitting(true)

      const result = await onSave(video.id, note.trim(), addedBy.trim())

      if (result.success) {
        // Save addedBy to localStorage on success
        localStorage.setItem(LOCALSTORAGE_KEY, addedBy.trim())
        handleClose()
      } else {
        setError(result.error || 'Failed to save idea')
        setIsSubmitting(false)
      }
    }

    const isFormValid = note.trim().length >= MIN_NOTE_LENGTH && addedBy.trim().length > 0

    return (
      <dialog
        ref={dialogRef}
        className="bg-[#272727] text-[#f1f1f1] rounded-xl p-0 max-w-md w-full backdrop:bg-black/70"
      >
        <form onSubmit={handleSubmit} className="p-6">
          <h2 className="text-lg font-semibold mb-4">Save Idea</h2>

          {/* Video preview (read-only) */}
          {video && (
            <div className="mb-6">
              <img
                src={video.thumbnail_url}
                alt={video.title}
                className="aspect-video max-w-xs w-full rounded-lg object-cover"
              />
              <p className="mt-2 text-sm text-[#f1f1f1] line-clamp-2">{video.title}</p>
            </div>
          )}

          {/* Note textarea */}
          <div className="mb-4">
            <label htmlFor="note" className="block text-sm font-medium text-[#aaaaaa] mb-1">
              Your idea note
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => {
                setNote(e.target.value)
                if (noteError) validateNote(e.target.value)
              }}
              onBlur={handleNoteBlur}
              placeholder="What makes this video interesting? (min 10 characters)"
              rows={4}
              className="w-full px-3 py-2 bg-[#1f1f1f] border border-[#3f3f3f] rounded-lg text-[#f1f1f1] placeholder-[#666666] focus:outline-none focus:border-blue-500 resize-none"
            />
            {noteError && (
              <p className="mt-1 text-sm text-red-500">{noteError}</p>
            )}
          </div>

          {/* Added by input */}
          <div className="mb-6">
            <label htmlFor="addedBy" className="block text-sm font-medium text-[#aaaaaa] mb-1">
              Your name
            </label>
            <input
              id="addedBy"
              type="text"
              value={addedBy}
              onChange={(e) => setAddedBy(e.target.value)}
              placeholder="Enter your name"
              className="w-full px-3 py-2 bg-[#1f1f1f] border border-[#3f3f3f] rounded-lg text-[#f1f1f1] placeholder-[#666666] focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Error display */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={handleClose}
              className="px-4 py-2 rounded-lg bg-[#3f3f3f] hover:bg-[#4f4f4f] text-white font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isFormValid || isSubmitting}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium transition-colors"
            >
              {isSubmitting ? 'Saving...' : 'Save Idea'}
            </button>
          </div>
        </form>
      </dialog>
    )
  }
)
