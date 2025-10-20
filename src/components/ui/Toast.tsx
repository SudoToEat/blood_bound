import React, { useEffect } from 'react'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastProps {
  id: string
  type: ToastType
  message: string
  duration?: number
  onClose: (id: string) => void
}

const Toast: React.FC<ToastProps> = ({ id, type, message, duration = 3000, onClose }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id)
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [id, duration, onClose])

  const getIcon = () => {
    switch (type) {
      case 'success':
        return '✓'
      case 'error':
        return '✕'
      case 'warning':
        return '⚠'
      case 'info':
        return 'ⓘ'
    }
  }

  const getStyles = () => {
    const baseStyles = 'rounded-lg shadow-lg p-4 flex items-center gap-3 min-w-[300px] max-w-[500px]'
    switch (type) {
      case 'success':
        return `${baseStyles} bg-green-600 text-white`
      case 'error':
        return `${baseStyles} bg-red-600 text-white`
      case 'warning':
        return `${baseStyles} bg-yellow-600 text-white`
      case 'info':
        return `${baseStyles} bg-blue-600 text-white`
    }
  }

  return (
    <div
      className={`${getStyles()} animate-in slide-in-from-top-5 duration-300`}
      role="alert"
    >
      <div className="text-2xl font-bold">{getIcon()}</div>
      <div className="flex-1 text-sm font-medium">{message}</div>
      <button
        onClick={() => onClose(id)}
        className="text-white hover:text-gray-200 transition-colors"
        aria-label="关闭"
      >
        ✕
      </button>
    </div>
  )
}

export default Toast
