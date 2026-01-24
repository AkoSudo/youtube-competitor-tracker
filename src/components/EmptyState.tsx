import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon: ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

/**
 * Reusable empty state component for when lists have no items.
 * Displays icon, title, description, and optional action button.
 * Used in ChannelGrid, IdeasPage, etc. when no data to display.
 */
export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      {/* Icon container */}
      <div className="text-[#3f3f3f] mb-4 flex justify-center">
        <div className="w-16 h-16">
          {icon}
        </div>
      </div>

      {/* Title */}
      <h3 className="text-lg font-medium text-[#f1f1f1] mb-2">
        {title}
      </h3>

      {/* Description */}
      <p className="text-[#aaaaaa] mb-4">
        {description}
      </p>

      {/* Optional action button */}
      {action && (
        <button
          onClick={action.onClick}
          className="text-red-500 hover:text-red-400 transition-colors font-medium"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
