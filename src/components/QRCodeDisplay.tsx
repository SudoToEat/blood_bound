import React from 'react'
import QRCode from 'react-qr-code'

interface QRCodeDisplayProps {
  url: string
  title?: string
  description?: string
  showCopyButton?: boolean
}

const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({
  url,
  title = '扫描二维码',
  description = '使用手机相机扫描此二维码访问',
  showCopyButton = true
}) => {
  const [copied, setCopied] = React.useState(false)

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('无法复制链接:', err)
    }
  }

  return (
    <div className="flex flex-col items-center p-4 bg-gray-800 rounded-lg shadow-lg">
      {title && <h3 className="text-lg font-bold mb-2">{title}</h3>}
      
      <div className="bg-white p-3 rounded-lg mb-3">
        <QRCode value={url} size={150} />
      </div>
      
      {description && <p className="text-sm text-gray-400 mb-2">{description}</p>}
      
      <div className="w-full text-xs text-gray-400 bg-gray-700 p-2 rounded mb-2 overflow-auto">
        <code className="break-all">{url}</code>
      </div>
      
      {showCopyButton && (
        <button
          onClick={copyToClipboard}
          className={`px-4 py-2 rounded-md text-sm transition-colors ${copied ? 'bg-green-600' : 'bg-blue-600 hover:bg-blue-700'}`}
        >
          {copied ? '已复制!' : '复制链接'}
        </button>
      )}
    </div>
  )
}

export default QRCodeDisplay