import { useEffect, useState } from 'react'
import { Protect } from '@clerk/clerk-react'
import { Gem, Sparkles, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

import CreationItem from '../components/CreationItem'
import { useApi, apiErrorMessage } from '../hooks/useApi'

const Dashboard = () => {

  const [creations, setCreations] = useState([])
  const [usage, setUsage] = useState(null)
  const [loading, setLoading] = useState(true)

  const api = useApi()

  useEffect(() => {
    let active = true

    const loadDashboard = async () => {
      try {
        const [creationsRes, usageRes] = await Promise.all([
          api.get('/api/user/get-user-creations'),
          api.get('/api/user/usage'),
        ])
        if (!active) return
        setCreations(creationsRes.data.creations)
        setUsage(usageRes.data)
      } catch (error) {
        if (active) toast.error(apiErrorMessage(error))
      } finally {
        if (active) setLoading(false)
      }
    }

    loadDashboard()
    return () => { active = false }
  }, [api])

  const removeCreation = async (id) => {
    try {
      await api.delete(`/api/user/creations/${id}`)
      setCreations((prev) => prev.filter((item) => item.id !== id))
      toast.success('Creation deleted.')
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  const togglePublish = async (id) => {
    try {
      const { data } = await api.post('/api/user/toggle-publish-creation', { id })
      setCreations((prev) =>
        prev.map((item) => (item.id === id ? data.creation : item))
      )
      toast.success(data.creation.publish ? 'Published to Community.' : 'Unpublished.')
    } catch (error) {
      toast.error(apiErrorMessage(error))
    }
  }

  const isFreePlan = usage && usage.plan === 'free'

  return (
    <div className='h-full overflow-y-scroll p-6'>
      <div className='flex justify-start gap-4 flex-wrap'>
        {/* Total Creations Card */}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Total Creations</p>
            <h2 className='text-xl font-semibold'>{creations.length}</h2>
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#3588F2] to-[#0BB0D7] text-white flex justify-center items-center'>
            <Sparkles className='w-5 text-white' />
          </div>
        </div>

        {/* Active Plan Card */}
        <div className='flex justify-between items-center w-72 p-4 px-6 bg-white rounded-xl border border-gray-200'>
          <div className='text-slate-600'>
            <p className='text-sm'>Active Plan</p>
            <h2 className='text-xl font-semibold'>
              <Protect plan="premium" fallback="Free">Premium</Protect>
            </h2>
            {isFreePlan && (
              <p className='text-xs text-gray-500 mt-1'>
                {Math.max(usage.free_usage_limit - usage.free_usage, 0)} of{' '}
                {usage.free_usage_limit} free generations left
              </p>
            )}
          </div>
          <div className='w-10 h-10 rounded-lg bg-gradient-to-br from-[#FF61C5] to-[#0BB0D7] text-white flex justify-center items-center'>
            <Gem className='w-5 text-white' />
          </div>
        </div>
      </div>

      {loading ? (
        <div className='flex justify-center items-center h-3/4'>
          <Loader2 className='w-10 h-10 text-primary animate-spin' />
        </div>
      ) : (
        <div className='space-y-3'>
          <p className='mt-6 mb-4'>Recent Creations</p>
          {creations.length === 0 ? (
            <p className='text-sm text-gray-500'>
              Nothing here yet. Pick a tool from the sidebar to make your first creation.
            </p>
          ) : (
            creations.map((item) => (
              <CreationItem
                key={item.id}
                item={item}
                onDelete={removeCreation}
                onTogglePublish={togglePublish}
              />
            ))
          )}
        </div>
      )}
    </div>
  )
}

export default Dashboard
