import { Hash, Sparkles, Loader2 } from 'lucide-react'
import { useState } from 'react'
import toast from 'react-hot-toast'

import { useApi, apiErrorMessage } from '../hooks/useApi'
import ResultPanel from '../components/ResultPanel'

const BlogTitles = () => {

  const blogCategories = ['General', 'Technology', 'Health', 'Travel', 'Food', 'Lifestyle', 'Business', 'Education']

  const [selectedCategory, setSelectedCategory] = useState(blogCategories[0])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')

  const api = useApi()

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    if (loading) return
    try {
      setLoading(true)
      const { data } = await api.post('/api/ai/generate-blog-title', {
        prompt: input,
        category: selectedCategory,
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
          <Sparkles className='w-6 text-[#8E37EB]' />
          <h1 className='text-xl font-semibold'>AI Title Generator</h1>
        </div>
        <p className='mt-6 text-sm font-medium'>Keyword</p>

        <input onChange={(e) => setInput(e.target.value)} value={input} type="text" className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300' placeholder='The future of artificial intelligence is...' required />

        <p className='mt-4 text-sm font-medium'>Category</p>

        <div className='mt-3 flex gap-3 flex-wrap sm:max-w-9/11'>
          {blogCategories.map((item) => (
            <span
              onClick={() => setSelectedCategory(item)}
              className={`text-xs px-4 py-1 border rounded-full cursor-pointer ${selectedCategory === item ? 'bg-blue-50 text-blue-700' : 'text-gray-500 border-gray-300'}`}
              key={item}
            >
              {item}
            </span>
          ))}
        </div>
        <br />
        <button disabled={loading} className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#C341F6] to-[#8E37EB] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed'>
          {loading
            ? <Loader2 className='w-5 animate-spin' />
            : <Hash className='w-5' />}
          Generate Titles
        </button>
      </form>
      {/*Right col*/}
      <ResultPanel
        title='Generated Titles'
        Icon={Hash}
        accentClass='text-[#8E37EB]'
        loading={loading}
        content={content}
        emptyText='Enter a keyword and click "Generate Titles" to get started'
      />
    </div>
  )
}

export default BlogTitles
