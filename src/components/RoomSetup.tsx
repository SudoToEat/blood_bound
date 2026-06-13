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
      <div className="bb-panel max-w-md mx-auto p-6 text-center">
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
    <div className="bb-panel mx-auto max-w-3xl p-6">
      <h2 className="bb-title text-3xl text-center mb-2">
        房间创建成功！
      </h2>
      <div className="mb-6" />
      <div className="rounded-lg border border-blue-700/40 bg-blue-950/50 p-4 mb-4 text-center">
        <p className="text-sm text-blue-200 mb-2">房间号:</p>
        <p className="text-3xl font-mono font-bold text-blue-100">{state.roomId}</p>
      </div>
      <div className="bb-panel-muted p-4 mb-6 text-center">
        <p className="text-sm text-stone-400 mb-2">玩家数量:</p>
        <p className="text-lg font-semibold text-stone-100">
          <span className="text-emerald-300">{state.players.length}</span> / {count} 人
        </p>
        {state.players.length > 0 && (
          <p className="text-xs text-stone-500 mt-2">
            已加入: {state.players.join(', ')}
          </p>
        )}
      </div>
      <div className="mb-6">
        <p className="text-sm text-stone-400 mb-3">每位玩家请使用下方专属二维码或链接加入：</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: count }, (_, i) => i + 1).map((playerId) => {
            const url = `${baseUrl}/access/${state.roomId}/${playerId}`
            const hasJoined = state.players.includes(playerId)
            return (
              <div key={playerId} className={`flex flex-col items-center rounded-lg border p-4 ${
                hasJoined ? 'border-emerald-500/60 bg-emerald-950/30' : 'border-stone-700/70 bg-stone-950/40'
              }`}>
                <div className={`mb-2 font-medium ${
                  hasJoined ? 'text-emerald-200' : 'text-stone-300'
                }`}>
                  玩家 {playerId} {hasJoined && '✓'}
                </div>
                <QRCodeDisplay url={url} title={undefined} description={undefined} />
              </div>
            )
          })}
        </div>
      </div>
      <div className="mt-6 rounded-lg border border-amber-500/30 bg-amber-950/30 p-4 text-center">
        <p className="text-sm text-amber-100">
          <strong>提示:</strong> 每位玩家请用自己的二维码或链接加入。玩家加入后即可查看自己的身份，无需等待所有玩家。
        </p>
      </div>
      {error && (
        <div className="mt-4 rounded-md border border-red-700/50 bg-red-950/70 p-3 text-red-100">
          {error}
        </div>
      )}
      <div className="mt-6 space-y-3">
        <button
          onClick={handleStartGame}
          disabled={isStarting}
          className="bb-button-gold w-full disabled:bg-stone-600"
        >
          {isStarting ? '正在开始...' : `进入游戏面板 ${state.players.length > 0 ? `(${state.players.length}/${count} 人已加入)` : ''}`}
        </button>
        <p className="text-xs text-stone-500 text-center">
          点击上方按钮可查看所有玩家身份。玩家加入后会自动获得身份。
        </p>
      </div>
    </div>
  )
}
