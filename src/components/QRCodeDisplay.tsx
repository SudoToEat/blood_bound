import React from 'react'
import QRCode from 'qrcode'

interface QRCodeDisplayProps {
  url: string
  title?: string
  description?: string
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  url,
  title = '玩家访问二维码',
  description = '让玩家扫描二维码访问游戏'
}) => {
  const [qrCodeUrl, setQrCodeUrl] = React.useState<string>('')
  const [copied, setCopied] = React.useState(false)

  // 生成二维码
  React.useEffect(() => {
    const generateQRCode = async () => {
      try {
        const qrCodeDataUrl = await QRCode.toDataURL(url, {
          width: 200,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        })
        setQrCodeUrl(qrCodeDataUrl)
      } catch (error) {
        console.error('生成二维码失败:', error)
      }
    }
    generateQRCode()
  }, [url])

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('无法复制链接:', err)
    }
  }

  const openPlayerLink = () => {
    window.open(url, '_blank')
  }

  return (
    <div className="flex flex-col items-center space-y-2">
      <div className="text-center">
        <h3 className="text-base font-semibold text-gray-800 mb-1">{title}</h3>
        {description && <p className="text-xs text-gray-600">{description}</p>}
      </div>
      <div className="bg-white p-2 rounded-lg border flex flex-col items-center">
        {qrCodeUrl && (
          <img src={qrCodeUrl} alt="QR Code" className="w-28 h-28" />
        )}
      </div>
      <div className="flex items-center space-x-2 mt-1">
        <span className="text-xs text-gray-700 break-all">{url}</span>
        <button
          onClick={openPlayerLink}
          className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
          title="在新窗口打开"
        >
          打开
        </button>
        <button
          onClick={copyToClipboard}
          className={`px-2 py-1 text-xs rounded ${copied ? 'bg-green-600 text-white' : 'bg-gray-600 text-white hover:bg-gray-700'}`}
          title="复制链接"
        >
          {copied ? '已复制' : '复制'}
        </button>
      </div>
    </div>
  )
}