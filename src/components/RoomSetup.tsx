import { useState, useEffect } from 'react'
import { useGame } from '../context/GameContext'
import QRCode from 'react-qr-code'

interface RoomSetupProps {
  onRoomReady: () => void
}

const RoomSetup = ({ onRoomReady }: RoomSetupProps) => {
  const { players, roomId, createRoom, isHost } = useGame()
  const [showQRCode, setShowQRCode] = useState(false)
  const [baseUrl, setBaseUrl] = useState('')
  
  // 获取当前页面的基础URL
  useEffect(() => {
    const url = window.location.origin
    setBaseUrl(url)
  }, [])

  // 创建房间
  const handleCreateRoom = () => {
    createRoom()
    setShowQRCode(true)
  }

  // 生成玩家访问链接
  const generatePlayerLink = (playerId: number) => {
    if (!roomId) return ''
    return `${baseUrl}/access/${roomId}/${playerId}`
  }

  // 复制链接到剪贴板
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
      .then(() => alert('链接已复制到剪贴板'))
      .catch(err => console.error('复制失败:', err))
  }
  
  // 测试链接
  const testLink = (playerId: number) => {
    const link = generatePlayerLink(playerId)
    if (link) {
      window.open(link, '_blank')
    }
  }

  return (
    <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">房间设置</h2>
      
      {!roomId ? (
        <div className="flex flex-col items-center">
          <p className="mb-4 text-center">
            创建一个房间，让玩家通过手机访问查看自己的身份
          </p>
          <button
            onClick={handleCreateRoom}
            className="w-full py-2 px-4 bg-red-600 hover:bg-red-700 rounded-md"
          >
            创建房间
          </button>
        </div>
      ) : (
        <div>
          <div className="mb-4">
            <h3 className="text-xl font-bold mb-2">房间号: {roomId}</h3>
            <p className="text-sm text-gray-400 mb-4">
              请让玩家使用以下链接或扫描二维码加入游戏
            </p>
          </div>

          {showQRCode && players.length > 0 && (
            <div className="mb-6">
              <div className="grid grid-cols-1 gap-4">
                {players.map((player) => (
                  <div key={player.id} className="bg-gray-700 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-bold">玩家 {player.id}</h4>
                      <div className="flex space-x-1">
                        <button
                          onClick={() => testLink(player.id)}
                          className="text-xs px-2 py-1 bg-green-600 hover:bg-green-700 rounded"
                          title="在新窗口中测试此链接"
                        >
                          测试
                        </button>
                        <button
                          onClick={() => copyToClipboard(generatePlayerLink(player.id))}
                          className="text-xs px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded"
                        >
                          复制链接
                        </button>
                      </div>
                    </div>
                    <div className="text-sm mb-2">
                      访问代码: <span className="font-mono">{player.accessCode}</span>
                    </div>
                    <div className="flex justify-center bg-white p-2 rounded">
                      <QRCode
                        value={generatePlayerLink(player.id)}
                        size={128}
                        level="L"
                      />
                    </div>
                    <p className="text-xs text-center mt-2 text-gray-400">
                      扫描二维码或使用链接访问
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4">
            <p className="text-sm text-gray-400 mb-2 text-center">
              请确保所有玩家都能成功访问自己的身份页面
            </p>
            <div className="flex justify-between">
              <button
                onClick={onRoomReady}
                className="w-full py-2 px-4 bg-green-600 hover:bg-green-700 rounded-md"
              >
                开始游戏
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default RoomSetup