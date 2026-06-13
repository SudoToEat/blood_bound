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
        <div className="bb-page flex min-h-screen items-center justify-center p-4">
          <div className="bb-panel w-full max-w-2xl p-8">
            <div className="text-center mb-6">
              <div className="text-6xl mb-4">😵</div>
              <h1 className="bb-title mb-2 text-3xl text-red-300">糟糕！出错了</h1>
              <p className="text-stone-400">应用遇到了一个意外错误</p>
            </div>

            {/* 错误详情（开发模式） */}
            {import.meta.env.DEV && this.state.error && (
              <div className="mb-6 overflow-auto rounded border border-stone-700 bg-stone-950 p-4">
                <h3 className="text-red-400 font-bold mb-2">错误信息：</h3>
                <pre className="whitespace-pre-wrap text-sm text-stone-300">
                  {this.state.error.toString()}
                </pre>

                {this.state.errorInfo && (
                  <>
                    <h3 className="text-red-400 font-bold mt-4 mb-2">错误堆栈：</h3>
                    <pre className="whitespace-pre-wrap text-xs text-stone-400">
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
                className="bb-button-blue"
              >
                刷新页面
              </button>
              <button
                onClick={this.handleGoHome}
                className="bb-button-secondary"
              >
                返回首页
              </button>
            </div>

            {/* 帮助提示 */}
            <div className="mt-6 text-center text-sm text-stone-500">
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
