import { useMemo } from 'react'
import axios from 'axios'
import { useAuth } from '@clerk/clerk-react'

const baseURL = import.meta.env.VITE_BASE_URL || 'http://localhost:3000'

/**
 * Axios instance that attaches the current Clerk session token to every
 * request. Use this for all calls to the ai-forge API so routes stay
 * authenticated without each page repeating the token plumbing.
 */
export const useApi = () => {
  const { getToken } = useAuth()

  return useMemo(() => {
    const instance = axios.create({ baseURL })

    instance.interceptors.request.use(async (config) => {
      const token = await getToken()
      if (token) config.headers.Authorization = `Bearer ${token}`
      return config
    })

    return instance
  }, [getToken])
}

/** Pulls the most useful message out of an axios/API error. */
export const apiErrorMessage = (error) =>
  error?.response?.data?.message ||
  error?.message ||
  'Something went wrong. Please try again.'
