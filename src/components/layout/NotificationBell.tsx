'use client'

import { useState, useRef, useEffect } from 'react'
import { Bell, CheckCircle } from 'lucide-react'
import { useNotifications } from '@/hooks/useNotifications'

export function NotificationBell({ userId }: { userId: string }) {
  const { notifications, unreadCount, markAllRead } = useNotifications(userId);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fermer le dropdown si on clique à l'extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleOpen = () => {
    setIsOpen(!isOpen);
    if (!isOpen && unreadCount > 0) {
      // Marquer comme lu après 2 secondes d'ouverture
      setTimeout(() => {
        markAllRead();
      }, 2000);
    }
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        onClick={handleOpen}
        className="p-2 relative rounded-full hover:bg-gray-100 transition text-gray-700"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white animate-pulse"></span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-[-4rem] sm:right-auto sm:left-1/2 sm:-translate-x-1/2 mt-2 w-[320px] bg-white rounded-2xl shadow-2xl border border-gray-100 z-[60] overflow-hidden flex flex-col max-h-[80vh] sm:max-h-96">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
            <h3 className="font-bold text-gray-900">Notifications</h3>
            {unreadCount > 0 && (
              <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2 py-1 rounded-full">
                {unreadCount} nouvelle(s)
              </span>
            )}
          </div>
          
          <div className="overflow-y-auto flex-1 p-2">
            {notifications.length === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                Aucune notification pour le moment.
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notif) => (
                  <div key={notif.id} className={`p-3 rounded-xl transition ${notif.is_read ? 'opacity-70' : 'bg-emerald-50/50'}`}>
                    <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                      {notif.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1 leading-relaxed">{notif.message}</p>
                    <p className="text-[10px] text-gray-400 mt-2">
                      {new Date(notif.created_at).toLocaleDateString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
