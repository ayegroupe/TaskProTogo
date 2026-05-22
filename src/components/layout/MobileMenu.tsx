'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Menu, X, User } from 'lucide-react'

export function MobileMenu({ user }: { user: any }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="md:hidden flex items-center">
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className="p-2 text-gray-600 hover:text-emerald-600"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isOpen && (
        <div className="absolute top-16 left-0 w-full bg-white border-b border-gray-200 shadow-xl py-4 px-6 flex flex-col space-y-4 z-50">
          <Link href="/taskers" onClick={() => setIsOpen(false)} className="text-gray-800 font-bold hover:text-emerald-600 py-2 border-b border-gray-50">Trouver un artisan</Link>
          <Link href="/services" onClick={() => setIsOpen(false)} className="text-gray-800 font-bold hover:text-emerald-600 py-2 border-b border-gray-50">Services</Link>
          <Link href="/devenir-tasker" onClick={() => setIsOpen(false)} className="text-gray-800 font-bold hover:text-emerald-600 py-2 border-b border-gray-50">Devenir Artisan</Link>
          
          {!user && (
            <div className="flex flex-col gap-3 pt-4">
              <Link href="/login" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-gray-200 hover:border-emerald-600 hover:text-emerald-600 transition font-bold">
                <User className="w-5 h-5" /> Connexion
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)} className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition shadow-sm font-bold">
                S'inscrire
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
