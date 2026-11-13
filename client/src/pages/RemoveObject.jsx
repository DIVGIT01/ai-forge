import { Scissors, Sparkles, Loader2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

import { useApi, apiErrorMessage } from '../hooks/useApi'
import ResultPanel from '../components/ResultPanel'

const RemoveObject = () => {

  const [input, setInput] = useState(null)
  const [object, setObject] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const api = useApi()

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (loading) return
    if (!input) return toast.error('Please choose an image first.')
    if (object.trim().split(/\s+/).length > 1) {
      return toast.error('Please describe the object in a single word.')
    }
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('image', input)
      formData.append('object', object.trim())
      const { data } = await api.post('/api/ai/remove-image-object', formData)
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
          <Sparkles className='w-6 text-[#4A7AFF]' />
          <h1 className='text-xl font-semibold'>Object Removal</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Upload image</p>

        <input onChange={(e) => setInput(e.target.files[0])} type="file" accept="image/jpeg,image/png,image/webp" className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600' required />

        <p className='mt-6 text-sm font-medium'>Describe object to remove</p>

        <textarea onChange={(e) => setObject(e.target.value)} value={object} rows={4} className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300' placeholder='e.g. watch or spoon - only a single object name' required />

        <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#417DF6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'>
          {loading
            ? <Loader2 className='w-5 animate-spin' />
            : <Scissors className='w-5' />}
          Remove Object
        </button>
      </form>
      {/*Right col*/}
      <ResultPanel
        title='Processed Image'
        Icon={Scissors}
        accentClass='text-[#FF4938]'
        loading={loading}
        content={content}
        variant='image'
        emptyText='Upload an image and click "Remove Object" to get started'
      />
    </div>
  )
}

export default RemoveObject
