import { useState } from 'react'
import { FileText, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { useApi, apiErrorMessage } from '../hooks/useApi'
import ResultPanel from '../components/ResultPanel'

const ReviewResume = () => {

  const [input, setInput] = useState(null)
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const api = useApi()

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (loading) return
    if (!input) return toast.error('Please choose a PDF resume first.')
    try {
      setLoading(true)
      const formData = new FormData()
      formData.append('resume', input)
      const { data } = await api.post('/api/ai/resume-review', formData)
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
          <FileText className='w-6 text-[#00DA83]' />
          <h1 className='text-xl font-semibold'>Resume Review</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Upload Resume</p>

        <input onChange={(e) => setInput(e.target.files[0])} type="file" accept="application/pdf" className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600' required />

        <p className='text-xs text-gray-500 font-light mt-1'>Supports PDF resumes only (up to 5 MB)</p>

        <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00DA83] to-[#009BB3] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'>
          {loading
            ? <Loader2 className='w-5 animate-spin' />
            : <FileText className='w-5' />}
          Review Resume
        </button>
      </form>
      {/*Right col*/}
      <ResultPanel
        title='Analysis Results'
        Icon={FileText}
        accentClass='text-[#00DA83]'
        loading={loading}
        content={content}
        emptyText='Upload a resume and click "Review Resume" to get started'
      />
    </div>
  )
}

export default ReviewResume
