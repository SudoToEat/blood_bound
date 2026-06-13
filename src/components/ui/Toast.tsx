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
    const baseStyles = 'rounded-lg border shadow-2xl p-4 flex items-center gap-3 min-w-[300px] max-w-[500px]'
    switch (type) {
      case 'success':
        return `${baseStyles} border-emerald-400/30 bg-emerald-800 text-white`
      case 'error':
        return `${baseStyles} border-red-400/30 bg-red-800 text-white`
      case 'warning':
        return `${baseStyles} border-amber-400/30 bg-amber-800 text-white`
      case 'info':
        return `${baseStyles} border-blue-400/30 bg-blue-800 text-white`
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
        className="text-white transition-colors hover:text-stone-200"
        aria-label="关闭"
      >
        ✕
      </button>
    </div>
  )
}

export default Toast
