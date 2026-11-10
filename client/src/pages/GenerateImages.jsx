import { useState } from 'react'
import { Sparkles, Image, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { useApi, apiErrorMessage } from '../hooks/useApi'
import ResultPanel from '../components/ResultPanel'

const GenerateImages = () => {

  const imageStyle = ['Realistic', 'Ghibli style', 'Anime style', 'Cartoon style', 'Fantasy style', 'Watercolour style', '3D style', 'Portrait style']

  const [selectedStyle, setSelectedStyle] = useState(imageStyle[0])
  const [input, setInput] = useState('')
  const [publish, setPublish] = useState(false)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const api = useApi()

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (loading) return
    try {
      setLoading(true)
      const { data } = await api.post('/api/ai/generate-image', {
        prompt: input,
        style: selectedStyle,
        publish,
      })
      setContent(data.content)
    } catch (error) {
      toast.error(apiErrorMessage(error))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
          {/*left col*/}
          <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
            <div className='flex items-center gap-3'>
              <Sparkles className='w-6 text-[#00AD25]' />
              <h1 className='text-xl font-semibold'>AI Image Generator</h1>
            </div>
            <p className='mt-6 text-sm font-medium'>Describe your image</p>

            <textarea onChange={(e) => setInput(e.target.value)} value={input} rows={4} className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300' placeholder='Describe the image you want to generate...' required />

            <p className='mt-4 text-sm font-medium'>Style</p>

            <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
              {imageStyle.map((item) => (
                <span
                  onClick={() => setSelectedStyle(item)}
                  className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${selectedStyle === item ? 'bg-blue-50 text-blue-700' : 'text-gray-500 border-gray-300'}`}
                  key={item}
                >
                  {item}
                </span>
              ))}
            </div>

            <div className='my-6 flex items-center gap-2'>
              <label className='relative cursor-pointer'>
                <input type="checkbox" onChange={(e) => setPublish(e.target.checked)} checked={publish} className='sr-only peer' />
                <div className='w-9 h-5 bg-slate-300 rounded-full peer-checked:bg-green-500 transition'></div>
                <span className='absolute left-1 top-1 w-3 h-3 bg-white rounded-full transition peer-checked:translate-x-4'></span>
              </label>
              <p className='text-sm'>Make this image public</p>
            </div>

            <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00AD25] to-[#3aeb37] text-white px-4 py-2 mt-2 text-sm rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'>
              {loading
                ? <Loader2 className='w-5 animate-spin' />
                : <Image className='w-5' />}
              Generate Image
            </button>
          </form>
          {/*Right col*/}
          <ResultPanel
            title='Generated Image'
            Icon={Image}
            accentClass='text-[#00AD25]'
            loading={loading}
            content={content}
            variant='image'
            emptyText='Enter a description and click "Generate Image" to get started'
          />
        </div>
  )
}

export default GenerateImages
