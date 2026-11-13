import React, { useState } from 'react'
import { FileText } from 'lucide-react'

const FILE_TYPES = {
  pdf: { label: 'PDF', accept: 'application/pdf' },
  jpg: { label: 'JPG', accept: 'image/jpeg' },
}

const ReviewResume = () => {
  const [input, setInput] = useState(null)
  const [fileType, setFileType] = useState('pdf')

  const onSubmitHandler = async (e) => {
    e.preventDefault()

    if (!input) return

    if (input.type !== FILE_TYPES[fileType].accept) {
      alert(`Please upload a ${FILE_TYPES[fileType].label} file`)
      return
    }

    // ...send `input` to your backend here
  }

  return (
    <div className='h-full overflow-y-scroll p-6 flex items-start flex-wrap gap-4 text-slate-700'>
      {/*left col*/}
      <form onSubmit={onSubmitHandler} className='w-full max-w-lg p-4 bg-white rounded-lg border border-gray-200'>
        <div className='flex items-center gap-3'>
          <FileText className='w-6 text-[#00DA83]' />
          <h1 className='text-xl font-semibold'>Resume Review</h1>
        </div>

        <p className='mt-6 text-sm font-medium'>File Type</p>
        <select
          value={fileType}
          onChange={(e) => {
            setFileType(e.target.value)
            setInput(null) // clear previously selected file
          }}
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600 bg-white'
        >
          {Object.entries(FILE_TYPES).map(([key, { label }]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>

        <p className='mt-4 text-sm font-medium'>Upload Resume</p>
        <input
          key={fileType} // remounts the input so the old file is cleared
          onChange={(e) => setInput(e.target.files[0])}
          type="file"
          accept={FILE_TYPES[fileType].accept}
          className='w-full p-2 px-3 mt-2 outline-none text-sm rounded-md border border-gray-300 text-gray-600'
          required
        />

        <p className='text-xs text-gray-500 font-light mt-1'>
          Supports {FILE_TYPES[fileType].label} resume only
        </p>

        <button className='w-full flex justify-center items-center gap-2 bg-gradient-to-r from-[#00DA83] to-[#009BB3] text-white px-4 py-2 mt-6 text-sm rounded-lg cursor-pointer'>
          <FileText className='w-5' />
          Review Resume
        </button>
      </form>

      {/*Right col*/}
      <div className='w-full max-w-lg p-4 bg-white rounded-lg flex flex-col border border-gray-200 min-h-96 max-h-[600px]'>
        <div className='flex items-center gap-3'>
          <FileText className='w-5 h-5 text-[#00DA83]' />
          <h1 className='text-xl font-semibold'>Analysis Results</h1>
        </div>
        <div className='flex-1 flex justify-center items-center'>
          <div className='text-sm flex flex-col items-center gap-5 text-gray-400'>
            <FileText className='w-9 h-9' />
            <p>Upload a resume and click "Review Resume" to get started</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ReviewResume