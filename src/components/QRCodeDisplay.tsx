import { memo, useState, useEffect, useCallback, useMemo } from 'react'
import QRCode from 'qrcode'

interface QRCodeDisplayProps {
  url: string
  title?: string
  description?: string
}

export const QRCodeDisplay = memo<QRCodeDisplayProps>(({
  url,
  title = '玩家访问二维码',
  description = '让玩家扫描二维码访问游戏'
}) => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [copied, setCopied] = useState(false)

  // 使用 useMemo 缓存二维码配置
  const qrConfig = useMemo(() => ({
    width: 200,
    margin: 2,
    color: {
      dark: '#000000',
      light: '#FFFFFF'
    }
  }), [])

  // 生成二维码
  useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(url, qrConfig)
        setQrCodeUrl(qrCodeDataUrl)
      } catch (error) {
        console.error('生成二维码失败:', error)
      }
    }
    generateQRCode()
  }, [url, qrConfig])

  // 使用 useCallback 优化回调函数
  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('无法复制链接:', err)
    }
  }, [url])

  const openPlayerLink = useCallback(() => {
    window.open(url, '_blank')
  }, [url])

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-center">
        <h3 className="text-base font-semibold text-stone-200 mb-1">{title}</h3>
        {description && <p className="text-xs text-stone-500">{description}</p>}
      </div>
      <div className="flex flex-col items-center rounded-lg border border-amber-500/30 bg-stone-100 p-2 shadow-lg">
        {qrCodeUrl && (
          <img src={qrCodeUrl} alt="QR Code" className="w-28 h-28" />
        )}
      </div>
      <div className="mt-1 flex w-full items-center justify-center gap-2">
        <span className="min-w-0 break-all text-xs text-stone-500">{url}</span>
        <button
          onClick={openPlayerLink}
          className="rounded border border-blue-400/30 bg-blue-800 px-2 py-1 text-xs text-white hover:bg-blue-900"
          title="在新窗口打开"
        >
          打开
        </button>
        <button
          onClick={copyToClipboard}
          className={`rounded border px-2 py-1 text-xs ${copied ? 'border-emerald-400/30 bg-emerald-700 text-white' : 'border-stone-400/30 bg-stone-700 text-white hover:bg-stone-800'}`}
          title="复制链接"
        >
          {copied ? '已复制' : '复制'}
        </button>
      </div>
    </div>
  )
})

QRCodeDisplay.displayName = 'QRCodeDisplay'
