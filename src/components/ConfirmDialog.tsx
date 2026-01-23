import { useRef, useImperativeHandle, forwardRef } from 'react'

export interface ConfirmDialogProps {
  title: string
  message: string
  confirmLabel?: string
  cancelLabel?: string
  confirmVariant?: 'danger' | 'primary'
  onConfirm: () => void
  onCancel?: () => void
}

export interface ConfirmDialogRef {
  open: () => void
  close: () => void
}

/**
 * Confirmation dialog using native <dialog> element.
 * Handles focus trap, backdrop, and Escape key automatically.
 */
export const ConfirmDialog = forwardRef<ConfirmDialogRef, ConfirmDialogProps>(
  function ConfirmDialog(
    {
      title,
      message,
      confirmLabel = 'Confirm',
      cancelLabel = 'Cancel',
      confirmVariant = 'danger',
      onConfirm,
      onCancel,
    },
    ref
  ) {
    const dialogRef = useRef<HTMLDialogElement>(null)

    useImperativeHandle(ref, () => ({
      open: () => dialogRef.current?.showModal(),
      close: () => dialogRef.current?.close(),
    }))

    const handleCancel = () => {
      dialogRef.current?.close()
      onCancel?.()
    }

    const handleConfirm = () => {
      dialogRef.current?.close()
      onConfirm()
    }

    const confirmButtonClass =
      confirmVariant === 'danger'
        ? 'bg-red-600 hover:bg-red-500'
        : 'bg-blue-600 hover:bg-blue-500'

    return (
      <dialog
        ref={dialogRef}
        className="bg-[#272727] text-[#f1f1f1] rounded-xl p-0 max-w-md w-full backdrop:bg-black/70"
      >
        <div className="p-6">
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="mt-2 text-[#aaaaaa]">{message}</p>

          <div className="mt-6 flex gap-3 justify-end">
            <button
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg bg-[#3f3f3f] hover:bg-[#4f4f4f] text-white font-medium transition-colors"
            >
              {cancelLabel}
            </button>
            <button
              onClick={handleConfirm}
              className={`px-4 py-2 rounded-lg ${confirmButtonClass} text-white font-medium transition-colors`}
            >
              {confirmLabel}
            </button>
          </div>
        </div>
      </dialog>
    )
  }
)
