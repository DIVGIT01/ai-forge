import { useState, useEffect } from 'react'
import { useUser } from '@clerk/clerk-react'
import { Heart, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

import { useApi, apiErrorMessage } from '../hooks/useApi'

const Community = () => {

  const [creations, setCreations] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useUser()

  const api = useApi()

  useEffect(() => {
    if (!user) return
    let active = true

    const fetchCreations = async () => {
      try {
        const { data } = await api.get('/api/user/get-published-creations')
        if (active) setCreations(data.creations)
      } catch (error) {
        if (active) toast.error(apiErrorMessage(error))
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchCreations()
    return () => { active = false }
  }, [user, api])

  const toggleLike = async (id) => {
    try {
      const { data } = await api.post('/api/user/toggle-like-creation', { id })
      setCreations((prev) =>
        prev.map((creation) => (creation.id === id ? data.creation : creation))
      )
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  if (loading) {
    return (
      <div className='flex-1 h-full flex justify-center items-center'>
        <Loader2 className='w-10 h-10 text-primary animate-spin' />
      </div>
    )
  }

  return (
    <div className='flex-1 h-full flex flex-col gap-4 p-6'>
      Creations
      <div className='bg-white h-full w-full rounded-xl overflow-y-scroll'>
        {creations.length === 0 ? (
          <p className='p-6 text-sm text-gray-500'>
            No published creations yet. Generate an image and mark it public to see it here.
          </p>
        ) : creations.map((creation) => {
          const likes = creation.likes || []
          const liked = likes.includes(user?.id)
          return (
            <div key={creation.id} className='relative group inline-block pl-3 pt-3 w-full sm:max-w-1/2 lg:max-w-1/3'>
              <img src={creation.content} alt={creation.prompt} className='w-full h-full object-cover rounded-lg' />

              <div className='absolute bottom-0 top-0 right-0 left-3 flex gap-2 items-end justify-end group-hover:justify-between p-3 group-hover:bg-gradient-to-b from-transparent to-black/80 text-white rounded-lg'>

                <p className='text-sm hidden group-hover:block'>{creation.prompt}</p>
                <div className='flex gap-1 items-center'>
                  <p>{likes.length}</p>
                  <Heart
                    onClick={() => toggleLike(creation.id)}
                    className={`min-w-5 h-5 hover:scale-110 cursor-pointer transition ${liked ? 'fill-red-500 text-red-500' : 'text-gray-300'}`}
                  />
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Community
