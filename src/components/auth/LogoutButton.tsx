'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export function LogoutButton() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/')
    router.refresh()
  }

  return (
    <button 
      onClick={handleLogout}
      className="p-2 sm:px-4 sm:py-2 text-gray-500 hover:text-red-600 transition rounded-full hover:bg-red-50 flex items-center gap-2"
      title="Se déconnecter"
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline text-sm font-medium">Déconnexion</span>
    </button>
  )
}
