import { useRef } from 'react'
import type { Channel } from '../lib/types'
import { ConfirmDialog, type ConfirmDialogRef } from './ConfirmDialog'

interface ChannelCardProps {
  channel: Channel
  onDelete: (id: string) => void
}

/**
 * Displays a single channel with thumbnail, name, subscribers, and delete button.
 * REQ-CH-003: thumbnail (88x88), name, subscriber count, added by, created date
 */
export function ChannelCard({ channel, onDelete }: ChannelCardProps) {
  const dialogRef = useRef<ConfirmDialogRef>(null)

  const handleDeleteClick = () => {
    dialogRef.current?.open()
  }

  const handleConfirmDelete = () => {
    onDelete(channel.id)
  }

  // Format subscriber count (e.g., 1.2M, 500K)
  const formatSubscribers = (count: number | null): string => {
    if (count === null) return 'Hidden'
    if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`
    if (count >= 1_000) return `${(count / 1_000).toFixed(0)}K`
    return count.toString()
  }

  // Format date as relative or absolute
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return date.toLocaleDateString()
  }

  return (
    <>
      <div className="bg-[#272727] rounded-xl p-4 hover:bg-[#3f3f3f] transition-colors group">
        <div className="flex items-start gap-4">
          {/* Thumbnail */}
          <div className="flex-shrink-0">
            {channel.thumbnail_url ? (
              <img
                src={channel.thumbnail_url}
                alt={`${channel.name} thumbnail`}
                className="w-[88px] h-[88px] rounded-full object-cover"
              />
            ) : (
              <div className="w-[88px] h-[88px] rounded-full bg-[#3f3f3f] flex items-center justify-center">
                <span className="text-2xl text-[#aaaaaa]">
                  {channel.name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-lg truncate" title={channel.name}>
              {channel.name}
            </h3>

            <p className="text-[#aaaaaa] text-sm mt-1">
              {formatSubscribers(channel.subscriber_count)} subscribers
            </p>

            <p className="text-[#aaaaaa] text-xs mt-2">
              Added {formatDate(channel.created_at)}
              {channel.added_by && ` by ${channel.added_by}`}
            </p>
          </div>

          {/* Delete button */}
          <button
            onClick={handleDeleteClick}
            className="opacity-0 group-hover:opacity-100 p-2 rounded-lg hover:bg-[#4f4f4f] transition-all"
            aria-label={`Delete ${channel.name}`}
          >
            <svg
              className="w-5 h-5 text-[#aaaaaa] hover:text-red-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
          </button>
        </div>
      </div>

      <ConfirmDialog
        ref={dialogRef}
        title="Delete Channel"
        message={`Are you sure you want to delete "${channel.name}"? This will also delete all videos and ideas from this channel.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={handleConfirmDelete}
      />
    </>
  )
}
