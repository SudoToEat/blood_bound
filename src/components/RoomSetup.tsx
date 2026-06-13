import React, { useState } from 'react'
import { useGame } from '../context/GameContext'
import { QRCodeDisplay } from './QRCodeDisplay'
import LoadingSpinner from './ui/LoadingSpinner'
import { logger } from '../utils/logger'

interface RoomSetupProps {
  onRoomReady: () => void;
  playerCount?: number;
}

export const RoomSetup: React.FC<RoomSetupProps> = ({ onRoomReady, playerCount }) => {
  const { state, startGame } = useGame()
  const [isStarting, setIsStarting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const baseUrl = window.location.origin
  const count = playerCount || state.playerCount || 8

  if (!state.roomId) {
    // 房间未创建好时显示加载中
    return (
      <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg text-center">
        <LoadingSpinner size="lg" message="正在创建房间..." />
      </div>
    )
  }

  const handleStartGame = async () => {
    try {
      setIsStarting(true)
      setError(null)
      logger.log('主持人点击开始游戏')

      // 调用startGame获取游戏状态
      await startGame()

      // 成功后切换到游戏面板
      onRoomReady()
    } catch (error) {
      logger.error('开始游戏失败:', error)
      setError(error instanceof Error ? error.message : '开始游戏失败')
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
        房间创建成功！
      </h2>
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
        <p className="text-sm text-blue-800 mb-2">房间号:</p>
        <p className="text-2xl font-mono font-bold text-blue-900">{state.roomId}</p>
      </div>
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-6 text-center">
        <p className="text-sm text-gray-600 mb-2">玩家数量:</p>
        <p className="text-lg font-semibold text-gray-800">
          <span className="text-green-600">{state.players.length}</span> / {count} 人
        </p>
        {state.players.length > 0 && (
          <p className="text-xs text-gray-500 mt-2">
            已加入: {state.players.join(', ')}
          </p>
        )}
      </div>
      <div className="mb-6">
        <p className="text-sm text-gray-600 mb-3">每位玩家请使用下方专属二维码或链接加入：</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: count }, (_, i) => i + 1).map((playerId) => {
            const url = `${baseUrl}/access/${state.roomId}/${playerId}`
            const hasJoined = state.players.includes(playerId)
            return (
              <div key={playerId} className={`flex flex-col items-center p-4 rounded border ${
                hasJoined ? 'bg-green-50 border-green-400' : 'bg-gray-50'
              }`}>
                <div className={`mb-2 font-medium ${
                  hasJoined ? 'text-green-700' : 'text-gray-700'
                }`}>
                  玩家 {playerId} {hasJoined && '✓'}
                </div>
                <QRCodeDisplay url={url} title={undefined} description={undefined} />
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
        <p className="text-sm text-yellow-800">
          <strong>提示:</strong> 每位玩家请用自己的二维码或链接加入。玩家加入后即可查看自己的身份，无需等待所有玩家。
        </p>
      </div>
      {error && (
        <div className="mt-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}
      <div className="mt-6 space-y-3">
        <button
          onClick={handleStartGame}
          disabled={isStarting}
          className="w-full bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {isStarting ? '正在开始...' : `进入游戏面板 ${state.players.length > 0 ? `(${state.players.length}/${count} 人已加入)` : ''}`}
        </button>
        <p className="text-xs text-gray-500 text-center">
          点击上方按钮可查看所有玩家身份。玩家加入后会自动获得身份。
        </p>
      </div>
    </div>
  )
}