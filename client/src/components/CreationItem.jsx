import { useState } from 'react'
import Markdown from 'react-markdown'
import { Globe, Lock, Trash2 } from 'lucide-react'

const CreationItem = ({ item, onDelete, onTogglePublish }) => {

  const [expanded, setExpanded] = useState(false)
  const isImage = item.type === 'image'

  // Row-level actions sit inside the clickable card, so stop the click from
  // also toggling the expanded state.
  const act = (handler) => (event) => {
    event.stopPropagation()
    handler?.(item.id)
  }

  return (
    <div onClick={() => setExpanded(!expanded)} className='p-4 max-w-5xl text-sm bg-white border border-gray-200 rounded-lg cursor-pointer'>
      <div className='flex justify-between items-center gap-4'>
        <div className='min-w-0'>
          <h2 className='truncate'>{item.prompt}</h2>
          <p className='text-gray-500'>{item.type} - {new Date(item.created_at).toLocaleDateString()}</p>
        </div>
        <div className='flex items-center gap-2 flex-shrink-0'>
          {isImage && onTogglePublish && (
            <button
              onClick={act(onTogglePublish)}
              title={item.publish ? 'Unpublish' : 'Publish to Community'}
              className='p-1.5 rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100 cursor-pointer'
            >
              {item.publish ? <Globe className='w-4 h-4 text-green-600' /> : <Lock className='w-4 h-4' />}
            </button>
          )}
          {onDelete && (
            <button
              onClick={act(onDelete)}
              title='Delete creation'
              className='p-1.5 rounded-full text-gray-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
            >
              <Trash2 className='w-4 h-4' />
            </button>
          )}
          <span className='bg-[#EFF6FF] border border-[#BFDBFE] text-[#1E40AF] px-4 py-1 rounded-full'>{item.type}</span>
        </div>
      </div>
      {
        expanded && (
          <div>
            {isImage ? (
              <div>
                <img src={item.content} alt={item.prompt} className='mt-3 w-full max-w-md' />
              </div>
            ) : (
              <div className='mt-3 max-h-80 overflow-y-auto text-sm text-slate-700'>
                <div className='reset-tw'>
                  <Markdown>{String(item.content ?? '')}</Markdown>
                </div>
              </div>
            )}
          </div>
        )
      }
    </div>
  )
}

export default CreationItem
