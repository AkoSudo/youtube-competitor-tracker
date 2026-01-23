import { formatRelativeDate } from '../lib/formatters'
import type { IdeaWithVideo } from '../lib/types'

interface IdeaCardProps {
  idea: IdeaWithVideo
  onDelete?: (id: string) => void
}

/**
 * Displays a single idea with video thumbnail, note, and metadata.
 * REQ-IDX-003: Shows note, video info, channel, added_by, timestamp.
 */
export function IdeaCard({ idea, onDelete }: IdeaCardProps) {
  const videoUrl = `https://www.youtube.com/watch?v=${idea.video.youtube_id}`

  const handleDeleteClick = () => {
    onDelete?.(idea.id)
  }

  return (
    <div className="bg-[#272727] rounded-xl p-4 hover:bg-[#303030] transition-colors">
      <div className="flex gap-4">
        {/* Video Thumbnail */}
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-shrink-0"
          aria-label={`Watch ${idea.video.title} on YouTube`}
        >
          <img
            src={idea.video.thumbnail_url}
            alt={`${idea.video.title} thumbnail`}
            className="w-[120px] aspect-video rounded object-cover hover:opacity-80 transition-opacity"
          />
        </a>

        {/* Content Area */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Note */}
          <p className="text-[#f1f1f1] whitespace-pre-wrap mb-2">
            {idea.note}
          </p>

          {/* Video Info */}
          <div className="text-sm text-[#aaaaaa] space-y-1">
            <p>
              <span className="text-[#888888]">Video:</span>{' '}
              <a
                href={videoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-white transition-colors truncate inline-block max-w-[400px] align-bottom"
                title={idea.video.title}
              >
                {idea.video.title}
              </a>
            </p>
            <p>
              <span className="text-[#888888]">Channel:</span>{' '}
              {idea.video.channel.name}
            </p>
          </div>

          {/* Footer: Added by + Date + Delete */}
          <div className="mt-auto pt-2 flex items-center justify-between">
            <span className="text-xs text-[#aaaaaa]">
              Added by {idea.added_by} {formatRelativeDate(idea.created_at)}
            </span>

            {onDelete && (
              <button
                onClick={handleDeleteClick}
                className="p-1.5 rounded hover:bg-[#4f4f4f] transition-colors text-[#aaaaaa] hover:text-red-500"
                aria-label="Delete idea"
              >
                <svg
                  className="w-4 h-4"
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
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
