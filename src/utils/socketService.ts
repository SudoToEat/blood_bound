import { io, Socket } from 'socket.io-client';
import { logger } from './logger';

// 连接状态枚举
export enum ConnectionStatus {
  DISCONNECTED = 'disconnected',
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error'
}

// 连接状态回调类型
type ConnectionStatusCallback = (status: ConnectionStatus, message?: string) => void;

class SocketService {
  private socket: Socket | null = null;
  private serverUrl: string;
  private roomId: string | null = null;
  private playerId: number | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private baseReconnectInterval: number = 1000; // 1秒基础间隔
  private connectionStatus: ConnectionStatus = ConnectionStatus.DISCONNECTED;
  private statusCallbacks: Set<ConnectionStatusCallback> = new Set();
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private lastHeartbeat: number = 0;

  constructor() {
    // 动态获取服务器地址：使用当前主机名但连接到3000端口
    // 这样可以支持localhost和局域网IP访问
    const hostname = window.location.hostname;
    this.serverUrl = `http://${hostname}:3000`;
    logger.log('初始化SocketService，服务器URL:', this.serverUrl);
  }

  // 获取当前连接状态
  getConnectionStatus(): ConnectionStatus {
    return this.connectionStatus;
  }

  // 更新连接状态并通知所有监听器
  private updateConnectionStatus(status: ConnectionStatus, message?: string) {
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
  onConnectionStatusChange(callback: ConnectionStatusCallback) {
    this.statusCallbacks.add(callback);
    // 立即返回当前状态
    callback(this.connectionStatus);

    // 返回取消监听的函数
    return () => {
      this.statusCallbacks.delete(callback);
    };
  }

  // 启动心跳检测
  private startHeartbeat() {
    // 清除已有的心跳
    this.stopHeartbeat();

    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        const now = Date.now();
        // 如果超过60秒没有收到任何消息，可能连接有问题
        // 注意：lastHeartbeat 会在 socket.onAny() 中更新，这里只做检查
        if (this.lastHeartbeat > 0 && now - this.lastHeartbeat > 60000) {
          logger.warn('心跳超时，可能连接异常');
          this.updateConnectionStatus(ConnectionStatus.ERROR, '连接可能已断开');
        }
      }
    }, 10000); // 每10秒检测一次
  }

  // 停止心跳检测
  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // 计算重连延迟（指数退避策略）
  private getReconnectDelay(): number {
    // 指数退避：1s, 2s, 4s, 8s, 16s, 最大30s
    const delay = Math.min(this.baseReconnectInterval * Math.pow(2, this.reconnectAttempts), 30000);
    return delay;
  }

  // 初始化连接
  connect(roomId: string, playerId: number) {
    // 保存房间和玩家信息，用于重连
    this.roomId = roomId;
    this.playerId = playerId;
    this.reconnectAttempts = 0;

    if (this.socket) {
      logger.log('断开现有WebSocket连接');
      this.socket.disconnect();
    }

    this.updateConnectionStatus(ConnectionStatus.CONNECTING, '正在连接服务器...');

    logger.log(`尝试连接到WebSocket服务器: ${this.serverUrl}, 房间ID: ${roomId}, 玩家ID: ${playerId}`);
    this.socket = io(this.serverUrl, {
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.baseReconnectInterval,
      reconnectionDelayMax: 30000,
      timeout: 10000,
      autoConnect: true,
      forceNew: true
    });

    this.socket.on('connect', () => {
      logger.log(`✅ WebSocket连接成功, socketId: ${this.socket?.id}`);
      this.updateConnectionStatus(ConnectionStatus.CONNECTED, '已连接到服务器');
      this.reconnectAttempts = 0; // 重置重连计数
      this.lastHeartbeat = Date.now();
      this.startHeartbeat(); // 启动心跳检测

      logger.log(`加入房间: ${roomId}, 玩家ID: ${playerId}`);
      this.socket?.emit('joinRoom', { roomId, playerId });
    });

    this.socket.on('connect_error', (error) => {
      logger.error('❌ WebSocket连接错误:', error);
      this.updateConnectionStatus(ConnectionStatus.ERROR, `连接失败: ${error.message}`);
      // Socket.IO 会自动尝试重连，这里只是记录错误
    });

    this.socket.on('disconnect', (reason) => {
      logger.log(`🔌 WebSocket连接断开, 原因: ${reason}`);
      this.stopHeartbeat(); // 停止心跳检测

      if (reason === 'io server disconnect') {
        // 服务器主动断开连接
        this.updateConnectionStatus(ConnectionStatus.DISCONNECTED, '服务器断开连接');
        this.handleReconnect();
      } else if (reason === 'transport close' || reason === 'transport error') {
        // 传输层错误
        this.updateConnectionStatus(ConnectionStatus.RECONNECTING, '连接中断，正在重连...');
        this.handleReconnect();
      } else {
        // 客户端主动断开或其他原因
        this.updateConnectionStatus(ConnectionStatus.DISCONNECTED, '连接已断开');
      }
    });

    this.socket.on('error', (error) => {
      logger.error('❌ WebSocket错误:', error);
      this.updateConnectionStatus(ConnectionStatus.ERROR, `错误: ${error}`);
    });

    // 监听所有消息以更新心跳时间
    this.socket.onAny(() => {
      this.lastHeartbeat = Date.now();
    });

    // Socket.IO 自动重连事件
    this.socket.on('reconnect_attempt', (attemptNumber) => {
      logger.log(`🔄 尝试重连 (${attemptNumber}/${this.maxReconnectAttempts})...`);
      this.updateConnectionStatus(ConnectionStatus.RECONNECTING, `重连中... (${attemptNumber}/${this.maxReconnectAttempts})`);
    });

    this.socket.on('reconnect', (attemptNumber) => {
      logger.log(`✅ WebSocket重连成功，尝试次数: ${attemptNumber}`);
      this.updateConnectionStatus(ConnectionStatus.CONNECTED, '重连成功');
      this.reconnectAttempts = 0;
      this.lastHeartbeat = Date.now();
      this.startHeartbeat();

      // 重新加入房间
      if (this.roomId && this.playerId !== null) {
        logger.log(`重新加入房间: ${this.roomId}, 玩家ID: ${this.playerId}`);
        this.socket?.emit('joinRoom', { roomId: this.roomId, playerId: this.playerId });
      }
    });

    this.socket.on('reconnect_failed', () => {
      logger.error('❌ WebSocket重连失败，已达最大重连次数');
      this.updateConnectionStatus(ConnectionStatus.ERROR, '无法连接到服务器，请刷新页面重试');
    });

    return this.socket;
  }

  // 获取socket实例
  getSocket(): Socket | null {
    return this.socket;
  }

  // 断开连接
  disconnect() {
    this.stopHeartbeat(); // 停止心跳检测

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }

    // 清理状态
    this.roomId = null;
    this.playerId = null;
    this.reconnectAttempts = 0;
    this.updateConnectionStatus(ConnectionStatus.DISCONNECTED, '已断开连接');
  }

  // 更新游戏状态
  updateGameState(roomId: string, gameState: any) {
    if (this.socket) {
      this.socket.emit('updateGameState', { roomId, gameState });
    }
  }

  // 发送玩家操作
  sendPlayerAction(roomId: string, playerId: number, action: string, data?: any) {
    if (this.socket) {
      this.socket.emit('playerAction', { roomId, playerId, action, data });
    }
  }

  // 监听房间状态更新
  onRoomState(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('roomState', callback);
    }
  }

  // 监听游戏状态更新
  onGameStateUpdated(callback: (gameState: any) => void) {
    if (this.socket) {
      this.socket.on('gameStateUpdated', callback);
    }
  }

  // 监听玩家加入
  onPlayerJoined(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('playerJoined', callback);
    }
  }

  // 监听玩家离开
  onPlayerLeft(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('playerLeft', callback);
    }
  }

  // 监听玩家操作
  onPlayerAction(callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on('playerAction', callback);
    }
  }

  // 监听玩家在线状态变化
  onPlayerStatusChanged(callback: (data: { playerId: number; isOnline: boolean }) => void) {
    if (this.socket) {
      this.socket.on('playerStatusChanged', callback);
    }
  }

  // 移除所有监听器
  removeAllListeners() {
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
        ConnectionStatus.RECONNECTING,
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
      this.updateConnectionStatus(ConnectionStatus.ERROR, '无法连接到服务器，请刷新页面重试');
    }
  }
}

export const socketService = new SocketService();