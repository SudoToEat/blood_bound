/**
 * Logger 工具类
 * 根据环境自动控制日志输出
 * 生产环境只输出错误日志，开发环境输出所有日志
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug'

class Logger {
  private isDevelopment: boolean

  constructor() {
    // 检测是否为开发环境
    this.isDevelopment = import.meta.env.DEV || process.env.NODE_ENV !== 'production'
  }

  /**
   * 普通日志 - 仅开发环境输出
   */
  log(...args: any[]): void {
    if (this.isDevelopment) {
      console.log('[LOG]', ...args)
    }
  }

  /**
   * 信息日志 - 仅开发环境输出
   */
  info(...args: any[]): void {
    if (this.isDevelopment) {
      console.info('[INFO]', ...args)
    }
  }

  /**
   * 调试日志 - 仅开发环境输出
   */
  debug(...args: any[]): void {
    if (this.isDevelopment) {
      console.debug('[DEBUG]', ...args)
    }
  }

  /**
   * 警告日志 - 所有环境输出
   */
  warn(...args: any[]): void {
    console.warn('[WARN]', ...args)
  }

  /**
   * 错误日志 - 所有环境输出
   */
  error(...args: any[]): void {
    console.error('[ERROR]', ...args)
  }

  /**
   * 分组日志 - 仅开发环境输出
   */
  group(label: string): void {
    if (this.isDevelopment) {
      console.group(label)
    }
  }

  /**
   * 结束分组
   */
  groupEnd(): void {
    if (this.isDevelopment) {
      console.groupEnd()
    }
  }

  /**
   * 表格日志 - 仅开发环境输出
   */
  table(data: any): void {
    if (this.isDevelopment) {
      console.table(data)
    }
  }

  /**
   * 计时开始 - 仅开发环境输出
   */
  time(label: string): void {
    if (this.isDevelopment) {
      console.time(label)
    }
  }

  /**
   * 计时结束
   */
  timeEnd(label: string): void {
    if (this.isDevelopment) {
      console.timeEnd(label)
    }
  }
}

// 导出单例
export const logger = new Logger()

// 导出默认实例
export default logger
