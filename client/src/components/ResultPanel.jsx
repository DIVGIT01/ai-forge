import Markdown from 'react-markdown'
import { Download, Loader2 } from 'lucide-react'

/**
 * The right-hand output column shared by every AI tool page.
 *
 * Handles the three states each tool has - empty, loading and done - so the
 * pages only deal with their own form and API call.
 *
 * @param {'markdown'|'image'} variant how `content` should be rendered
 */
const ResultPanel = ({
  title,
  Icon,
  accentClass = 'text-[#4A7AFF]',
  loading = false,
  content = '',
  emptyText,
  variant = 'markdown',
  className = '',
}) => {
  return (
    <div
      className={`w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px] ${className}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${accentClass}`} />
          <h1 className="text-xl font-semibold">{title}</h1>
        </div>
        {variant === 'image' && content && !loading && (
          <a
            href={content}
            target="_blank"
            rel="noreferrer"
            download
            title="Open full size"
            className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-800"
          >
            <Download className="w-4 h-4" />
            Open
          </a>
        )}
      </div>

      {loading ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="text-sm flex flex-col items-center gap-5 text-gray-400">
            <Loader2 className="w-9 h-9 animate-spin" />
            <p>Working on it...</p>
          </div>
        </div>
      ) : !content ? (
        <div className="flex-1 flex justify-center items-center">
          <div className="text-sm flex flex-col items-center gap-5 text-gray-400 text-center">
            <Icon className="w-9 h-9" />
            <p>{emptyText}</p>
          </div>
        </div>
      ) : variant === 'image' ? (
        <img
          src={content}
          alt="Result"
          className="mt-3 w-full h-full object-contain rounded-md"
        />
      ) : (
        <div className="mt-3 flex-1 overflow-y-auto text-sm text-slate-700">
          <div className="reset-tw">
            <Markdown>{String(content)}</Markdown>
          </div>
        </div>
      )}
    </div>
  )
}

export default ResultPanel
