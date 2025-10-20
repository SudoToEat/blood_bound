import { useState, useEffect } from 'react'
import { socketService } from '../utils/socketService'
import type { ConnectionStatus } from '../types/socketTypes'

interface ConnectionStatusBarProps {
  className?: string
}

const ConnectionStatusBar = ({ className = '' }: ConnectionStatusBarProps) => {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected')
  const [message, setMessage] = useState<string>('')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    // 订阅连接状态变化
    const unsubscribe = socketService.onConnectionStatusChange((newStatus, newMessage) => {
      setStatus(newStatus)
      setMessage(newMessage || '')

      // 只在连接中、重连中或错误时显示状态栏
      if (
        newStatus === 'connecting' ||
        newStatus === 'reconnecting' ||
        newStatus === 'error'
      ) {
        setIsVisible(true)
      } else if (newStatus === 'connected') {
        // 连接成功后显示2秒
        setIsVisible(true)
        setTimeout(() => setIsVisible(false), 2000)
      } else {
        setIsVisible(false)
      }
    })

    return () => {
      unsubscribe()
    }
  }, [])

  // 根据状态返回样式
  const getStatusStyle = () => {
    switch (status) {
      case 'connected':
        return {
          bg: 'bg-green-600',
          icon: '✓',
          text: '已连接'
        }
      case 'connecting':
        return {
          bg: 'bg-yellow-600',
          icon: '⟳',
          text: '正在连接...'
        }
      case 'reconnecting':
        return {
          bg: 'bg-yellow-600',
          icon: '⟳',
          text: '重新连接中...'
        }
      case 'error':
        return {
          bg: 'bg-red-600',
          icon: '✗',
          text: '连接错误'
        }
      case 'disconnected':
      default:
        return {
          bg: 'bg-gray-600',
          icon: '○',
          text: '未连接'
        }
    }
  }

  const style = getStatusStyle()

  if (!isVisible) {
    return null
  }

  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 ${style.bg} text-white shadow-lg transition-all duration-300 ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className="container mx-auto px-4 py-2 flex items-center justify-center gap-2 text-sm">
        {/* 图标 */}
        <span
          className={`font-bold text-lg ${
            status === 'connecting' || status === 'reconnecting'
              ? 'animate-spin'
              : ''
          }`}
        >
          {style.icon}
        </span>

        {/* 状态文本 */}
        <span className="font-medium">{message || style.text}</span>

        {/* 如果是错误状态，提供刷新按钮 */}
        {status === 'error' && (
          <button
            onClick={() => window.location.reload()}
            className="ml-4 px-3 py-1 bg-white bg-opacity-20 hover:bg-opacity-30 rounded text-xs font-bold transition-colors"
          >
            刷新页面
          </button>
        )}
      </div>
    </div>
  )
}

export default ConnectionStatusBar
