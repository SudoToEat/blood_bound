import { io, Socket } from 'socket.io-client';

class SocketService {
  private socket: Socket | null = null;
  private serverUrl: string;
  private roomId: string | null = null;
  private playerId: number | null = null;
  private reconnectAttempts: number = 0;
  private maxReconnectAttempts: number = 10;
  private reconnectInterval: number = 1000; // 1秒

  constructor() {
    // 动态获取服务器地址：使用当前主机名但连接到3000端口
    // 这样可以支持localhost和局域网IP访问
    const hostname = window.location.hostname;
    this.serverUrl = `http://${hostname}:3000`;
    console.log('初始化SocketService，服务器URL:', this.serverUrl);
  }

  // 初始化连接
  connect(roomId: string, playerId: number) {
    // 保存房间和玩家信息，用于重连
    this.roomId = roomId;
    this.playerId = playerId;
    this.reconnectAttempts = 0;
    
    if (this.socket) {
      console.log('断开现有WebSocket连接');
      this.socket.disconnect();
    }

    console.log(`尝试连接到WebSocket服务器: ${this.serverUrl}, 房间ID: ${roomId}, 玩家ID: ${playerId}`);
    this.socket = io(this.serverUrl, {
      reconnectionAttempts: this.maxReconnectAttempts,
      reconnectionDelay: this.reconnectInterval,
      timeout: 10000,
      autoConnect: true,
      forceNew: true
    });
    
    this.socket.on('connect', () => {
      console.log(`WebSocket连接成功, socketId: ${this.socket?.id}`);
      console.log(`加入房间: ${roomId}, 玩家ID: ${playerId}`);
      this.socket?.emit('joinRoom', { roomId, playerId });
    });

    this.socket.on('connect_error', (error) => {
      console.error('WebSocket连接错误:', error);
      // 尝试重新连接
      this.handleReconnect();
    });

    this.socket.on('disconnect', (reason) => {
      console.log(`WebSocket连接断开, 原因: ${reason}`);
      if (reason === 'io server disconnect' || reason === 'transport close') {
        // 服务器主动断开连接或传输关闭，需要手动重连
        this.handleReconnect();
      }
    });

    this.socket.on('error', (error) => {
      console.error('WebSocket错误:', error);
    });

    // 添加重连成功事件处理
    this.socket.on('reconnect', (attemptNumber) => {
      console.log(`WebSocket重连成功，尝试次数: ${attemptNumber}`);
      // 重置重连计数
      this.reconnectAttempts = 0;
      // 重新加入房间
      if (this.roomId && this.playerId !== null) {
        console.log(`重连成功，重新加入房间: ${this.roomId}, 玩家ID: ${this.playerId}`);
        this.socket?.emit('joinRoom', { roomId: this.roomId, playerId: this.playerId });
      }
    });

    return this.socket;
  }

  // 获取socket实例
  getSocket(): Socket | null {
    return this.socket;
  }

  // 断开连接
  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      // 清理状态
      this.roomId = null;
      this.playerId = null;
      this.reconnectAttempts = 0;
    }
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
      console.log(`尝试重新连接 (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      
      // 如果Socket.IO的自动重连失败，手动尝试重连
      if (!this.socket?.connected && this.roomId && this.playerId !== null) {
        setTimeout(() => {
          console.log('手动尝试重新连接...');
          this.connect(this.roomId!, this.playerId!);
        }, this.reconnectInterval * this.reconnectAttempts); // 使用递增的重连间隔
      }
    } else {
      console.error('达到最大重连次数，无法重新连接到服务器');
    }
  }
}

export const socketService = new SocketService();