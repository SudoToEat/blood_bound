import { io, Socket } from 'socket.io-client';
import { logger } from './logger';
import { NETWORK_CONFIG, SOCKET_EVENTS, getServerUrl } from '../constants/gameConstants';
import type {
  ConnectionStatus,
  ConnectionStatusCallback,
  JoinRoomData,
  UpdateGameStateData,
  PlayerActionData,
  RoomStateCallback,
  GameStateUpdatedCallback,
  PlayerJoinedCallback,
  PlayerLeftCallback,
  PlayerStatusChangedCallback,
  PlayerActionEventCallback,
  GameStatePayload,
} from '../types/socketTypes';

// 导出 ConnectionStatus 枚举供外部使用
export { ConnectionStatus } from '../types/socketTypes';

class SocketService {
  private socket: Socket | null = null;
  private serverUrl: string;
  private roomId: string | null = null;
  private playerId: number | null = null;
  private reconnectAttempts: number = 0;
  private readonly maxReconnectAttempts = NETWORK_CONFIG.MAX_RECONNECT_ATTEMPTS;
  private readonly baseReconnectInterval = NETWORK_CONFIG.BASE_RECONNECT_INTERVAL;
  private connectionStatus: ConnectionStatus = 'disconnected';
  private statusCallbacks: Set<ConnectionStatusCallback> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastHeartbeat: number = 0;

  constructor() {
    this.serverUrl = getServerUrl();
    logger.log('初始化SocketService，服务器URL:', this.serverUrl);
  }

  // 获取当前连接状态
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  // 更新连接状态并通知所有监听器
  private updateConnectionStatus(status: ConnectionStatus, message?: string): void {
    this.connectionStatus = status;
    logger.log(`连接状态变更: ${status}`, message || '');

    // 通知所有状态监听器
    this.statusCallbacks.forEach(callback => {
      try {
        callback(status, message);
      } catch (error) {
        logger.error('状态回调执行错误:', error);
      }
    });
  }

  // 注册连接状态监听器
  onConnectionStatusChange(callback: ConnectionStatusCallback): () => void {
    this.statusCallbacks.add(callback);
    // 立即返回当前状态
    callback(this.connectionStatus);

    // 返回取消监听的函数
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  // 启动心跳检测
  private startHeartbeat(): void {
    // 清除已有的心跳
    this.stopHeartbeat();

    // 定期发送ping，并检测心跳超时
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        // 发送ping请求
        this.socket.emit(SOCKET_EVENTS.PING);

        const now = Date.now();
        // 如果超过配置时间没有收到任何消息（包括pong），可能连接有问题
        if (this.lastHeartbeat > 0 && now - this.lastHeartbeat > NETWORK_CONFIG.HEARTBEAT_TIMEOUT) {
          logger.warn('心跳超时，可能连接异常');
          this.updateConnectionStatus('error', '连接可能已断开');
        }
      }
    }, NETWORK_CONFIG.HEARTBEAT_CHECK_INTERVAL);
  }

  // 停止心跳检测
  private stopHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // 计算重连延迟（指数退避策略）
  private getReconnectDelay(): number {
    const delay = Math.min(
      this.baseReconnectInterval * Math.pow(2, this.reconnectAttempts),
      NETWORK_CONFIG.MAX_RECONNECT_DELAY
    );
    return delay;
  }

  // 初始化连接
  connect(roomId: string, playerId: number): Socket {
    // 保存房间和玩家信息，用于重连
    this.roomId = roomId;
    this.playerId = playerId;
    this.reconnectAttempts = 0;

    if (this.socket) {
      logger.log('断开现有WebSocket连接');
      this.socket.disconnect();
    }

    this.updateConnectionStatus('connecting', '正在连接服务器...');

    logger.log(`尝试连接到WebSocket服务器: ${this.serverUrl}, 房间ID: ${roomId}, 玩家ID: ${playerId}`);

    this.socket = io(this.serverUrl, {
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.baseReconnectInterval,
      reconnectionDelayMax: NETWORK_CONFIG.MAX_RECONNECT_DELAY,
      timeout: NETWORK_CONFIG.WEBSOCKET_TIMEOUT,
      autoConnect: true,
      forceNew: true
    });

    // 连接成功
    this.socket.on(SOCKET_EVENTS.CONNECT, () => {
      logger.log(`✅ WebSocket连接成功, socketId: ${this.socket?.id}`);
      this.updateConnectionStatus('connected', '已连接到服务器');
      this.reconnectAttempts = 0;
      this.lastHeartbeat = Date.now();
      this.startHeartbeat();

      // 加入房间
      const joinData: JoinRoomData = { roomId, playerId };
      logger.log(`加入房间:`, joinData);
      this.socket?.emit(SOCKET_EVENTS.JOIN_ROOM, joinData);
    });

    // 连接错误
    this.socket.on(SOCKET_EVENTS.CONNECT_ERROR, (error: Error) => {
      logger.error('❌ WebSocket连接错误:', error);
      this.updateConnectionStatus('error', `连接失败: ${error.message}`);
    });

    // 断开连接
    this.socket.on(SOCKET_EVENTS.DISCONNECT, (reason: string) => {
      logger.log(`🔌 WebSocket连接断开, 原因: ${reason}`);
      this.stopHeartbeat();

      if (reason === 'io server disconnect') {
        this.updateConnectionStatus('disconnected', '服务器断开连接');
        this.handleReconnect();
      } else if (reason === 'transport close' || reason === 'transport error') {
        this.updateConnectionStatus('reconnecting', '连接中断，正在重连...');
        this.handleReconnect();
      } else {
        this.updateConnectionStatus('disconnected', '连接已断开');
      }
    });

    // 错误处理
    this.socket.on(SOCKET_EVENTS.ERROR, (error: Error) => {
      logger.error('❌ WebSocket错误:', error);
      this.updateConnectionStatus('error', `错误: ${error.message}`);
    });

    // 监听所有消息以更新心跳时间
    this.socket.onAny(() => {
      this.lastHeartbeat = Date.now();
    });

    // 监听pong响应
    this.socket.on(SOCKET_EVENTS.PONG, () => {
      this.lastHeartbeat = Date.now();
    });

    // Socket.IO 自动重连事件
    this.socket.on(SOCKET_EVENTS.RECONNECT_ATTEMPT, (attemptNumber: number) => {
      logger.log(`🔄 尝试重连 (${attemptNumber}/${this.maxReconnectAttempts})...`);
      this.updateConnectionStatus(
        'reconnecting',
        `重连中... (${attemptNumber}/${this.maxReconnectAttempts})`
      );
    });

    this.socket.on(SOCKET_EVENTS.RECONNECT, (attemptNumber: number) => {
      logger.log(`✅ WebSocket重连成功，尝试次数: ${attemptNumber}`);
      this.updateConnectionStatus('connected', '重连成功');
      this.reconnectAttempts = 0;
      this.lastHeartbeat = Date.now();
      this.startHeartbeat();

      // 重新加入房间
      if (this.roomId && this.playerId !== null) {
        const joinData: JoinRoomData = { roomId: this.roomId, playerId: this.playerId };
        logger.log(`重新加入房间:`, joinData);
        this.socket?.emit(SOCKET_EVENTS.JOIN_ROOM, joinData);
      }
    });

    this.socket.on(SOCKET_EVENTS.RECONNECT_FAILED, () => {
      logger.error('❌ WebSocket重连失败，已达最大重连次数');
      this.updateConnectionStatus('error', '无法连接到服务器，请刷新页面重试');
    });

    return this.socket;
  }

  // 获取socket实例
  getSocket(): Socket | null {
    return this.socket;
  }

  // 断开连接
  disconnect(): void {
    this.stopHeartbeat();

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    this.roomId = null;
    this.playerId = null;
    this.reconnectAttempts = 0;
    this.updateConnectionStatus('disconnected', '已断开连接');
  }

  // 更新游戏状态
  updateGameState(roomId: string, gameState: GameStatePayload): void {
    if (this.socket) {
      const data: UpdateGameStateData = { roomId, gameState };
      this.socket.emit(SOCKET_EVENTS.UPDATE_GAME_STATE, data);
    }
  }

  // 发送玩家操作
  sendPlayerAction(data: PlayerActionData): void {
    if (this.socket) {
      this.socket.emit(SOCKET_EVENTS.PLAYER_ACTION, data);
    }
  }

  // 监听房间状态更新
  onRoomState(callback: RoomStateCallback): void {
    if (this.socket) {
      this.socket.on(SOCKET_EVENTS.ROOM_STATE, callback);
    }
  }

  // 监听游戏状态更新
  onGameStateUpdated(callback: GameStateUpdatedCallback): void {
    if (this.socket) {
      this.socket.on(SOCKET_EVENTS.GAME_STATE_UPDATED, callback);
    }
  }

  // 监听玩家加入
  onPlayerJoined(callback: PlayerJoinedCallback): void {
    if (this.socket) {
      this.socket.on(SOCKET_EVENTS.PLAYER_JOINED, callback);
    }
  }

  // 监听玩家离开
  onPlayerLeft(callback: PlayerLeftCallback): void {
    if (this.socket) {
      this.socket.on(SOCKET_EVENTS.PLAYER_LEFT, callback);
    }
  }

  // 监听玩家操作
  onPlayerAction(callback: PlayerActionEventCallback): void {
    if (this.socket) {
      this.socket.on(SOCKET_EVENTS.PLAYER_ACTION_EVENT, callback);
    }
  }

  // 监听玩家在线状态变化
  onPlayerStatusChanged(callback: PlayerStatusChangedCallback): void {
    if (this.socket) {
      this.socket.on(SOCKET_EVENTS.PLAYER_STATUS_CHANGED, callback);
    }
  }

  // 移除所有监听器
  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  // 处理重连逻辑
  private handleReconnect(): void {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = this.getReconnectDelay();

      logger.log(`🔄 计划重连 (${this.reconnectAttempts}/${this.maxReconnectAttempts})，${delay}ms 后重试...`);
      this.updateConnectionStatus(
        'reconnecting',
        `重连中... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`
      );

      // 如果Socket.IO的自动重连失败，手动尝试重连
      if (!this.socket?.connected && this.roomId && this.playerId !== null) {
        setTimeout(() => {
          if (!this.socket?.connected) {
            logger.log('⚡ 手动重新连接...');
            this.connect(this.roomId!, this.playerId!);
          }
        }, delay);
      }
    } else {
      logger.error('❌ 达到最大重连次数，无法重新连接到服务器');
      this.updateConnectionStatus('error', '无法连接到服务器，请刷新页面重试');
    }
  }
}

export const socketService = new SocketService();
