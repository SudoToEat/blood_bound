import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    // 更新 state 使下一次渲染能够显示降级后的 UI
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // 你同样可以将错误日志上报给服务器
    console.error('ErrorBoundary caught an error:', error, errorInfo)

    this.setState({
      error,
      errorInfo
    })
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })

    // 刷新页面
    window.location.reload()
  }

  private handleGoHome = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })

    // 返回首页
    window.location.href = '/'
  }

  public render() {
    if (this.state.hasError) {
      // 如果提供了自定义的 fallback，使用它
      if (this.props.fallback) {
        return this.props.fallback
      }

      // 默认错误 UI
      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">😵</div>
              <h1 className="text-3xl font-bold text-red-500 mb-2">糟糕！出错了</h1>
              <p className="text-gray-400">应用遇到了一个意外错误</p>
            </div>

            {/* 错误详情（开发模式） */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 bg-gray-900 rounded p-4 overflow-auto">
                <h3 className="text-red-400 font-bold mb-2">错误信息：</h3>
                <pre className="text-sm text-gray-300 whitespace-pre-wrap">
                  {this.state.error.toString()}
                </pre>

                {this.state.errorInfo && (
                  <>
                    <h3 className="text-red-400 font-bold mt-4 mb-2">错误堆栈：</h3>
                    <pre className="text-xs text-gray-400 whitespace-pre-wrap">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </>
                )}
              </div>
            )}

            {/* 操作按钮 */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={this.handleReset}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-md transition-colors"
              >
                刷新页面
              </button>
              <button
                onClick={this.handleGoHome}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-md transition-colors"
              >
                返回首页
              </button>
            </div>

            {/* 帮助提示 */}
            <div className="mt-6 text-center text-sm text-gray-500">
              <p>如果问题持续存在，请尝试：</p>
              <ul className="list-disc list-inside mt-2">
                <li>清除浏览器缓存</li>
                <li>使用隐私/无痕模式</li>
                <li>检查网络连接</li>
                <li>联系游戏管理员</li>
              </ul>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
