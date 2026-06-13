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
        <div className="text-6xl mb-4 text-stone-500">
          {icon}
        </div>
      )}

      {/* 标题 */}
      <h3 className="bb-title text-xl mb-2">
        {title}
      </h3>

      {/* 描述 */}
      {description && (
        <p className="mb-6 max-w-md text-stone-400">
          {description}
        </p>
      )}

      {/* 操作按钮 */}
      {action && (
        <button
          onClick={action.onClick}
          className="bb-button-blue"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

export default EmptyState
