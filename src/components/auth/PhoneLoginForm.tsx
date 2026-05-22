'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function PhoneLoginForm() {
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'phone' | 'otp'>('phone')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const sendOTP = async () => {
    if (phone.length < 8) return
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOtp({ phone: `+228${phone}` })
    if (error) setError(error.message)
    else setStep('otp')
    setLoading(false)
  }

  const verifyOTP = async () => {
    setLoading(true); setError('')
    const { error } = await supabase.auth.verifyOtp({
      phone: `+228${phone}`,
      token: otp,
      type: 'sms'
    })
    if (error) setError(error.message)
    else router.push('/dashboard')
    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm mx-auto p-6 space-y-4 bg-white rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-center text-gray-900">Connexion</h2>
      <p className="text-center text-sm text-gray-500 mb-6">Connectez-vous pour gérer vos services ayeJOB.</p>
      
      {step === 'phone' ? (
        <div className="space-y-4">
          <div className="flex">
            <span className="bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl px-4 flex items-center text-gray-600 font-medium">+228</span>
            <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
              placeholder="90 00 00 00" maxLength={8}
              className="flex-1 border border-gray-200 rounded-r-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
          </div>
          <button onClick={sendOTP} disabled={loading || phone.length < 8}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-emerald-700 transition shadow-sm hover:shadow-md">
            {loading ? 'Envoi en cours...' : 'Recevoir le code SMS'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-center text-sm text-gray-600">Code envoyé au <span className="font-semibold">+228 {phone}</span></p>
          <input type="text" value={otp} onChange={e => setOtp(e.target.value)}
            placeholder="0 0 0 0 0 0" maxLength={6}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-center text-2xl tracking-widest focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
          <button onClick={verifyOTP} disabled={loading || otp.length < 6}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-emerald-700 transition shadow-sm hover:shadow-md">
            {loading ? 'Vérification...' : 'Confirmer'}
          </button>
          <button onClick={() => setStep('phone')} className="w-full text-sm text-gray-500 hover:text-emerald-600 transition">
            Modifier le numéro
          </button>
        </div>
      )}
      {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
    </div>
  )
}
