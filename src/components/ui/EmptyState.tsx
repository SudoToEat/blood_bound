import { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

const EmptyState = ({
  icon,
  title,
  description,
  action,
  className = ''
}: EmptyStateProps) => {
  return (
    <div className={`flex flex-col items-center justify-center p-8 text-center ${className}`}>
      {/* 图标 */}
      {icon && (
        <div className="text-6xl mb-4 text-gray-500">
          {icon}
        </div>
      )}

      {/* 标题 */}
      <h3 className="text-xl font-bold text-gray-300 mb-2">
        {title}
      </h3>

      {/* 描述 */}
      {description && (
        <p className="text-gray-400 mb-6 max-w-md">
          {description}
        </p>
      )}

      {/* 操作按钮 */}
      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export default EmptyState
