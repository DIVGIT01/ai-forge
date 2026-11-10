import { Eraser, Loader2 } from 'lucide-react';
import { useState } from 'react'
import toast from 'react-hot-toast'

import { useApi, apiErrorMessage } from '../hooks/useApi'
import ResultPanel from '../components/ResultPanel'

const RemoveBackground = () => {
  const [input, setInput] = useState(null)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const api = useApi()

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (loading) return
    if (!input) return toast.error('Please choose an image first.')
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('image', input)
      const { data } = await api.post('/api/ai/remove-image-background', formData)
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
          <Eraser className='w-6 text-[#FF4938]' />
          <h1 className='text-xl font-semibold'>Background Removal</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Image</p>

        <input onChange={(e) => setInput(e.target.files[0])} type="file" accept="image/jpeg,image/png,image/webp" className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600' required />

        <p className='text-xs text-gray-500 font-light mt-1'>Supports JPG, PNG, and WebP formats (up to 10 MB)</p>

        <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#F6AB41] to-[#FF4938] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'>
          {loading
            ? <Loader2 className='w-5 animate-spin' />
            : <Eraser className='w-5' />}
          Remove Background
        </button>
      </form>
      {/*Right col*/}
      <ResultPanel
        title='Processed Image'
        Icon={Eraser}
        accentClass='text-[#FF4938]'
        loading={loading}
        content={content}
        variant='image'
        emptyText='Upload an image and click "Remove Background" to get started'
      />
    </div>
  )
}

export default RemoveBackground
