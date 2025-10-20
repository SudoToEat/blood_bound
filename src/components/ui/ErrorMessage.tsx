import { ReactNode } from 'react'

interface ErrorMessageProps {
  title?: string
  message: string
  onRetry?: () => void
  onClose?: () => void
  icon?: ReactNode
  className?: string
  variant?: 'error' | 'warning' | 'info'
}

const ErrorMessage = ({
  title = '出错了',
  message,
  onRetry,
  onClose,
  icon,
  className = '',
  variant = 'error'
}: ErrorMessageProps) => {
  const variantStyles = {
    error: {
      bg: 'bg-red-900 bg-opacity-20',
      border: 'border-red-600',
      titleColor: 'text-red-400',
      textColor: 'text-red-300',
      icon: '❌'
    },
    warning: {
      bg: 'bg-yellow-900 bg-opacity-20',
      border: 'border-yellow-600',
      titleColor: 'text-yellow-400',
      textColor: 'text-yellow-300',
      icon: '⚠️'
    },
    info: {
      bg: 'bg-blue-900 bg-opacity-20',
      border: 'border-blue-600',
      titleColor: 'text-blue-400',
      textColor: 'text-blue-300',
      icon: 'ℹ️'
    }
  }

  const styles = variantStyles[variant]

  return (
    <div
      className={`${styles.bg} ${styles.border} border-2 rounded-lg p-6 ${className}`}
      role="alert"
    >
      {/* 头部区域 */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          {/* 图标 */}
          <div className="text-3xl flex-shrink-0">
            {icon || styles.icon}
          </div>

          {/* 标题 */}
          <div>
            <h3 className={`text-lg font-bold ${styles.titleColor}`}>
              {title}
            </h3>
            <p className={`mt-1 ${styles.textColor}`}>
              {message}
            </p>
          </div>
        </div>

        {/* 关闭按钮 */}
        {onClose && (
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            aria-label="关闭"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* 操作按钮 */}
      {onRetry && (
        <div className="flex justify-end">
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition-colors"
          >
            重试
          </button>
        </div>
      )}
    </div>
  )
}

export default ErrorMessage
