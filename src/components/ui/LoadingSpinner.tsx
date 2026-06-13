interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
  fullScreen?: boolean
  className?: string
}

const LoadingSpinner = ({
  size = 'md',
  message,
  fullScreen = false,
  className = ''
}: LoadingSpinnerProps) => {
  const sizeClasses = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-3',
    lg: 'w-16 h-16 border-4',
    xl: 'w-24 h-24 border-4'
  }

  const textSizeClasses = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl'
  }

  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center gap-4 ${className}`}>
      {/* 旋转动画 */}
      <div
        className={`${sizeClasses[size]} border-blue-600 border-t-transparent rounded-full animate-spin`}
        role="status"
        aria-label="加载中"
      />

      {/* 加载消息 */}
      {message && (
        <p className={`${textSizeClasses[size]} text-gray-300 text-center animate-pulse`}>
          {message}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center z-50">
        {spinnerContent}
      </div>
    )
  }

  return spinnerContent
}

export default LoadingSpinner
