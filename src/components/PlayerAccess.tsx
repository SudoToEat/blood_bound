import React, { useEffect, useState } from 'react';
import { useGame } from '../context/GameContext';
import { useParams, useNavigate } from 'react-router-dom';
import PlayerView from './PlayerView';
import LoadingSpinner from './ui/LoadingSpinner';
import { logger } from '../utils/logger'

export const PlayerAccess: React.FC = () => {
  const { roomId, playerId } = useParams<{ roomId: string; playerId: string }>();
  const { state, joinRoom, checkServerHealth } = useGame();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    const initializePlayer = async () => {
      if (!roomId || !playerId) {
        setError('无效的房间号或玩家ID');
        setIsLoading(false);
        return;
      }

      const parsedPlayerId = parseInt(playerId);
      if (isNaN(parsedPlayerId)) {
        setError('玩家ID必须是数字');
        setIsLoading(false);
        return;
      }

      if (hasJoined) {
        return; // 已经加入过了，不要重复加入
      }

      try {
        logger.log('=== PlayerAccess 初始化 ===');
        logger.log('房间ID:', roomId);
        logger.log('玩家ID:', parsedPlayerId);

        // 检查服务器连接
        const isServerHealthy = await checkServerHealth();
        logger.log('服务器健康检查:', isServerHealthy);
        if (!isServerHealthy) {
          setError('无法连接到游戏服务器，请确保服务器正在运行');
          setIsLoading(false);
          return;
        }

        // 加入房间
        logger.log('正在加入房间...');
        await joinRoom(roomId, parsedPlayerId);
        logger.log('加入房间成功');
        setHasJoined(true);
        setIsLoading(false);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : '加入房间失败';
        logger.error('加入房间失败:', err);
        setError(errorMessage);
        setIsLoading(false);

        // 收集调试信息
        setDebugInfo({
          roomId,
          playerId: parsedPlayerId,
          serverHealth: await checkServerHealth().catch(() => false),
          url: window.location.href,
          userAgent: navigator.userAgent,
          timestamp: new Date().toISOString()
        });
      }
    };

    initializePlayer();
  }, [roomId, playerId, hasJoined]); // 移除 joinRoom 和 checkServerHealth 依赖

  // 监听 state 变化，当 gameData 准备好时显示玩家身份
  useEffect(() => {
    logger.log('=== useEffect 触发 ===');
    logger.log('state.gameData:', state.gameData);
    logger.log('state.gameData?.players:', state.gameData?.players);
    logger.log('state.playerId:', state.playerId);
    logger.log('hasJoined:', hasJoined);

    if (state.gameData?.players && state.playerId && hasJoined) {
      logger.log('=== State 已更新，检查玩家身份 ===');
      logger.log('gameData.players:', state.gameData.players);
      logger.log('当前 playerId:', state.playerId);
      logger.log('玩家类型:', typeof state.playerId);

      const playerObj = state.gameData.players.find((p: any) => {
        logger.log(`比较 p.id(${p.id}, ${typeof p.id}) === state.playerId(${state.playerId}, ${typeof state.playerId})`);
        return p.id === state.playerId;
      });

      if (playerObj) {
        logger.log('✅ 找到玩家身份:', playerObj);
        setIsLoading(false);
      } else {
        logger.log('⚠️ 未找到玩家身份');
      }
    }
  }, [state.gameData, state.playerId, hasJoined]);

  const handleRetry = () => {
    setIsLoading(true);
    setError(null);
    setDebugInfo(null);
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-white mb-2">正在加入房间...</h2>
          <p className="text-gray-400">请稍候，正在连接到游戏服务器</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-white mb-2">无法加入房间</h2>
            <p className="text-gray-400 mb-4">{error}</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleRetry}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              重试
            </button>
            <button
              onClick={handleGoHome}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              返回主页
            </button>
          </div>

          {debugInfo && (
            <details className="mt-6">
              <summary className="cursor-pointer text-sm text-gray-400 hover:text-gray-200">
                调试信息
              </summary>
              <div className="mt-2 p-3 bg-gray-700 rounded text-xs text-gray-300">
                <pre>{JSON.stringify(debugInfo, null, 2)}</pre>
              </div>
            </details>
          )}
        </div>
      </div>
    );
  }

  // 如果已加入且有游戏数据，检查是否能显示玩家身份
  if (hasJoined && state.roomId && state.playerId && state.gameData?.players) {
    const playerObj = state.gameData.players.find((p: any) => p.id === state.playerId);

    if (playerObj) {
      // 找到玩家身份，显示身份信息，并传递所有玩家数据
      logger.log('渲染玩家身份视图');
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <PlayerView
            player={playerObj}
            allPlayers={state.gameData.players}
            onBack={handleGoHome}
            isPlayerAccess={true}
          />
        </div>
      );
    }
  }

  // 成功加入房间后的显示
  if (hasJoined && state.roomId && state.playerId) {
    // 添加调试日志
    logger.log('=== PlayerAccess 渲染状态 ===');
    logger.log('state.gamePhase:', state.gamePhase);
    logger.log('state.gameData:', state.gameData);
    logger.log('state.playerId:', state.playerId);

    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md mx-auto p-6 bg-gray-800 rounded-lg shadow-lg">
          <div className="text-center mb-6">
            <div className="text-green-500 text-6xl mb-4">✅</div>
            <h2 className="text-xl font-semibold text-white mb-2">成功加入房间！</h2>
            <p className="text-gray-400">房间号: {state.roomId}</p>
            <p className="text-gray-400">玩家ID: {state.playerId}</p>
            <p className="text-sm text-gray-500 mt-2">游戏阶段: {state.gamePhase}</p>
          </div>

          <div className="bg-blue-900 border border-blue-700 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-300 mb-2">连接状态</h3>
            <div className="flex items-center space-x-2">
              <div className={`w-3 h-3 rounded-full ${state.isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-blue-200">
                {state.isConnected ? '已连接到服务器' : '连接中...'}
              </span>
            </div>
          </div>

          <div className="bg-gray-700 border border-gray-600 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-gray-200 mb-2">房间信息</h3>
            <p className="text-sm text-gray-400">当前玩家数: {state.players.length}</p>
            <p className="text-sm text-gray-400">总玩家数: {state.playerCount}</p>
            {state.players.length > 0 && (
              <p className="text-sm text-gray-400">
                已加入玩家: {state.players.join(', ')}
              </p>
            )}
          </div>

          {/* 调试信息 */}
          <div className="bg-yellow-900 border border-yellow-700 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-300 mb-2">调试信息</h3>
            <p className="text-xs text-yellow-200">gameData 存在: {state.gameData ? '是' : '否'}</p>
            {state.gameData && (
              <>
                <p className="text-xs text-yellow-200">
                  gameData.players 数量: {state.gameData.players?.length || 0}
                </p>
                <p className="text-xs text-yellow-200">
                  当前玩家身份: {state.gameData.players?.find((p: any) => p.id === state.playerId) ? '已找到' : '未找到'}
                </p>
              </>
            )}
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-400 mb-4">
              等待游戏主持人开始游戏...
            </p>
            <button
              onClick={handleGoHome}
              className="bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
            >
              返回主页
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
};