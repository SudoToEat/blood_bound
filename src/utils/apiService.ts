// 动态获取API基础URL：使用当前主机名但连接到3000端口
// 这样可以支持localhost和局域网IP访问
const hostname = window.location.hostname;
const API_BASE_URL = `http://${hostname}:3000/api`;

console.log('API服务初始化，基础URL:', API_BASE_URL);

export interface RoomInfo {
  roomId: string;
  playerCount: number;
  players: number[];
  gameState: any;
}

export interface CreateRoomResponse {
  roomId: string;
  success: boolean;
}

export interface JoinRoomResponse {
  success: boolean;
  players: number[];
}

export class ApiService {
  // 创建房间
  static async createRoom(playerCount: number): Promise<CreateRoomResponse> {
    try {
      console.log('发送创建房间请求:', { playerCount });
      const response = await fetch(`${API_BASE_URL}/rooms`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ playerCount }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('服务器返回错误:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('创建房间成功:', data);
      return data;
    } catch (error) {
      console.error('创建房间失败:', error);
      throw error;
    }
  }

  // 获取房间信息
  static async getRoomInfo(roomId: string): Promise<RoomInfo> {
    try {
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}`);

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('房间不存在');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('获取房间信息失败:', error);
      throw error;
    }
  }

  // 开始游戏
  static async startGame(roomId: string): Promise<RoomInfo> {
    try {
      console.log('发送开始游戏请求:', roomId);
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('房间不存在');
        }
        const errorText = await response.text();
        console.error('服务器返回错误:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('开始游戏成功，获得游戏状态:', data);
      return data;
    } catch (error) {
      console.error('开始游戏失败:', error);
      throw error;
    }
  }

  // 重新开始游戏
  static async restartGame(roomId: string): Promise<RoomInfo> {
    try {
      console.log('发送重新开始游戏请求:', roomId);
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/restart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('房间不存在');
        }
        const errorText = await response.text();
        console.error('服务器返回错误:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log('重新开始游戏成功，获得新游戏状态:', data);
      return data;
    } catch (error) {
      console.error('重新开始游戏失败:', error);
      throw error;
    }
  }

  // 健康检查
  static async healthCheck(): Promise<{ status: string; rooms: number; connections: number }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('健康检查失败:', error);
      throw error;
    }
  }
}