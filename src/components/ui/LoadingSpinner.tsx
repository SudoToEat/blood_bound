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
        className={`${sizeClasses[size]} animate-spin rounded-full border-amber-500 border-t-transparent`}
        role="status"
        aria-label="加载中"
      />

      {/* 加载消息 */}
      {message && (
        <p className={`${textSizeClasses[size]} animate-pulse text-center text-stone-300`}>
          {message}
        </p>
      )}
    </div>
  )

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75">
        {spinnerContent}
      </div>
    )
  }

  return spinnerContent
}

export default LoadingSpinner
