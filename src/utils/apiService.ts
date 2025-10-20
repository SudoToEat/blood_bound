import { logger } from './logger';
import { NETWORK_CONFIG, API_ENDPOINTS, getServerUrl } from '../constants/gameConstants';
import type {
  CreateRoomRequest,
  CreateRoomResponse,
  GetRoomResponse,
  JoinRoomResponse,
  HealthCheckResponse,
  CreateRoomResult,
  GetRoomResult,
  JoinRoomResult,
  HealthCheckResult,
} from '../types/apiTypes';

// API基础URL：使用配置的服务器地址
const API_BASE_URL = `${getServerUrl()}/api`;

logger.log('API服务初始化，基础URL:', API_BASE_URL);

/**
 * API服务类
 * 提供与后端API交互的方法，包含完整的类型安全和错误处理
 */
export class ApiService {
  /**
   * 创建房间
   */
  static async createRoom(playerCount: number): Promise<CreateRoomResult> {
    try {
      logger.log('发送创建房间请求:', { playerCount });

      const requestBody: CreateRoomRequest = { playerCount };
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.ROOMS}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(NETWORK_CONFIG.API_TIMEOUT),
      });

      if (!response.ok) {
        const errorText = await response.text();
        logger.error('服务器返回错误:', response.status, errorText);
        return {
          success: false,
          error: `HTTP error! status: ${response.status}`,
          details: errorText,
        };
      }

      const data: CreateRoomResponse = await response.json();
      logger.log('创建房间成功:', data);
      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error('创建房间失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '创建房间失败',
        details: error,
      };
    }
  }

  /**
   * 获取房间信息
   */
  static async getRoomInfo(roomId: string): Promise<GetRoomResult> {
    try {
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.GET_ROOM(roomId)}`,
        {
          signal: AbortSignal.timeout(NETWORK_CONFIG.API_TIMEOUT),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: '房间不存在',
          };
        }
        return {
          success: false,
          error: `HTTP error! status: ${response.status}`,
        };
      }

      const data: GetRoomResponse = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error('获取房间信息失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '获取房间信息失败',
        details: error,
      };
    }
  }

  /**
   * 开始游戏
   */
  static async startGame(roomId: string): Promise<GetRoomResult> {
    try {
      logger.log('发送开始游戏请求:', roomId);
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(NETWORK_CONFIG.API_TIMEOUT),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: '房间不存在',
          };
        }
        const errorText = await response.text();
        logger.error('服务器返回错误:', response.status, errorText);
        return {
          success: false,
          error: `HTTP error! status: ${response.status}`,
          details: errorText,
        };
      }

      const data: GetRoomResponse = await response.json();
      logger.log('开始游戏成功，获得游戏状态:', data);
      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error('开始游戏失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '开始游戏失败',
        details: error,
      };
    }
  }

  /**
   * 重新开始游戏
   */
  static async restartGame(roomId: string): Promise<GetRoomResult> {
    try {
      logger.log('发送重新开始游戏请求:', roomId);
      const response = await fetch(`${API_BASE_URL}/rooms/${roomId}/restart`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        signal: AbortSignal.timeout(NETWORK_CONFIG.API_TIMEOUT),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: '房间不存在',
          };
        }
        const errorText = await response.text();
        logger.error('服务器返回错误:', response.status, errorText);
        return {
          success: false,
          error: `HTTP error! status: ${response.status}`,
          details: errorText,
        };
      }

      const data: GetRoomResponse = await response.json();
      logger.log('重新开始游戏成功，获得新游戏状态:', data);
      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error('重新开始游戏失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '重新开始游戏失败',
        details: error,
      };
    }
  }

  /**
   * 健康检查
   */
  static async healthCheck(): Promise<HealthCheckResult> {
    try {
      const response = await fetch(`${API_BASE_URL}${API_ENDPOINTS.HEALTH}`, {
        signal: AbortSignal.timeout(NETWORK_CONFIG.API_TIMEOUT),
      });

      if (!response.ok) {
        return {
          success: false,
          error: `HTTP error! status: ${response.status}`,
        };
      }

      const data: HealthCheckResponse = await response.json();
      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error('健康检查失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '健康检查失败',
        details: error,
      };
    }
  }

  /**
   * 加入房间
   */
  static async joinRoom(roomId: string, playerId: number): Promise<JoinRoomResult> {
    try {
      logger.log('发送加入房间请求:', { roomId, playerId });
      const response = await fetch(
        `${API_BASE_URL}${API_ENDPOINTS.JOIN_ROOM(roomId)}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ playerId }),
          signal: AbortSignal.timeout(NETWORK_CONFIG.API_TIMEOUT),
        }
      );

      if (!response.ok) {
        if (response.status === 404) {
          return {
            success: false,
            error: '房间不存在',
          };
        }
        const errorText = await response.text();
        logger.error('服务器返回错误:', response.status, errorText);
        return {
          success: false,
          error: `HTTP error! status: ${response.status}`,
          details: errorText,
        };
      }

      const data: JoinRoomResponse = await response.json();
      logger.log('加入房间成功:', data);
      return {
        success: true,
        data,
      };
    } catch (error) {
      logger.error('加入房间失败:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : '加入房间失败',
        details: error,
      };
    }
  }
}

// 导出便捷方法（保持向后兼容）
export const createRoom = ApiService.createRoom.bind(ApiService);
export const getRoomInfo = ApiService.getRoomInfo.bind(ApiService);
export const startGame = ApiService.startGame.bind(ApiService);
export const restartGame = ApiService.restartGame.bind(ApiService);
export const healthCheck = ApiService.healthCheck.bind(ApiService);
export const joinRoom = ApiService.joinRoom.bind(ApiService);
