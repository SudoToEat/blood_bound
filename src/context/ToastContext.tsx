import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import Toast, { ToastType, ToastProps } from '../components/ui/Toast'

interface ToastOptions {
  type?: ToastType
  duration?: number
}

interface ToastContextType {
  showToast: (message: string, options?: ToastOptions) => void
  success: (message: string, duration?: number) => void
  error: (message: string, duration?: number) => void
  warning: (message: string, duration?: number) => void
  info: (message: string, duration?: number) => void
  confirm: (message: string, onConfirm: () => void, onCancel?: () => void) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

interface ToastItem extends Omit<ToastProps, 'onClose'> {}

export const ToastProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [confirmDialog, setConfirmDialog] = useState<{
    message: string
    onConfirm: () => void
    onCancel?: () => void
  } | null>(null)

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (message: string, options: ToastOptions = {}) => {
      const id = `toast-${Date.now()}-${Math.random()}`
      const toast: ToastItem = {
        id,
        type: options.type || 'info',
        message,
        duration: options.duration ?? 3000,
      }
      setToasts(prev => [...prev, toast])
    },
    []
  )

  const success = useCallback(
    (message: string, duration?: number) => {
      showToast(message, { type: 'success', duration })
    },
    [showToast]
  )

  const error = useCallback(
    (message: string, duration?: number) => {
      showToast(message, { type: 'error', duration })
    },
    [showToast]
  )

  const warning = useCallback(
    (message: string, duration?: number) => {
      showToast(message, { type: 'warning', duration })
    },
    [showToast]
  )

  const info = useCallback(
    (message: string, duration?: number) => {
      showToast(message, { type: 'info', duration })
    },
    [showToast]
  )

  const confirm = useCallback(
    (message: string, onConfirm: () => void, onCancel?: () => void) => {
      setConfirmDialog({ message, onConfirm, onCancel })
    },
    []
  )

  const handleConfirm = () => {
    if (confirmDialog) {
      confirmDialog.onConfirm()
      setConfirmDialog(null)
    }
  }

  const handleCancel = () => {
    if (confirmDialog) {
      confirmDialog.onCancel?.()
      setConfirmDialog(null)
    }
  }

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info, confirm }}>
      {children}

      {/* Toast容器 - 固定在右上角 */}
      <div className="fixed top-4 right-4 z-[9999] flex flex-col gap-2">
        {toasts.map(toast => (
          <Toast key={toast.id} {...toast} onClose={removeToast} />
        ))}
      </div>

      {/* Confirm对话框 */}
      {confirmDialog && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000]"
          onClick={handleCancel}
        >
          <div
            className="bg-gray-800 rounded-lg p-6 max-w-md mx-4 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-white text-lg mb-6">{confirmDialog.message}</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-md transition-colors"
              >
                取消
              </button>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                确定
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export const useToast = (): ToastContextType => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}
