import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../assets/assets'
import { Outlet } from 'react-router-dom'
import Sidebar from '../components/Sidebar'
import { Menu, X } from 'lucide-react'
import { SignIn, useUser } from '@clerk/clerk-react'
import { Loader2 } from 'lucide-react'

const Layout = () => {

  const navigate = useNavigate();
  const [sidebar, setSidebar] = useState(false);
  const { isLoaded, user } = useUser();

  // Clerk resolves the session asynchronously. Without this the sign-in form
  // flashes for a moment on every load for users who are already signed in.
  if (!isLoaded) {
    return (
      <div className='flex items-center justify-center h-screen'>
        <Loader2 className='w-10 h-10 text-primary animate-spin' />
      </div>
    )
  }

  return user ? (
    <div className="flex flex-col items-start justify-start h-screen">

      <nav className='w-full px-8 min-h-14 flex items-center justify-between border-b border-gray-200'>
        <img className="cursor-pointer w-32 sm:w-44" src={assets.logo} alt="logo" onClick={() => navigate('/')} />
        {
          sidebar
            ? <X onClick={() => setSidebar(false)} className="w-6 h-6 text-gray-600 sm:hidden" />
            : <Menu onClick={() => setSidebar(true)} className="w-6 h-6 text-gray-600 sm:hidden" />
        }
      </nav>
      <div className='flex-1 w-full flex h-[calc(100vh-64px)]'>
        <Sidebar sidebar={sidebar} setSidebar={setSidebar} />
        <div className='flex-1 bg-[#F4F7FB]'>
          <Outlet />
        </div>
      </div>
    </div>
  ) : (
    <div className='flex items-center justify-center h-screen'>
      <SignIn routing="hash" />
    </div>
  );
};

export default Layout