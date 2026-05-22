'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export function RegisterForm() {
  const [phone, setPhone] = useState('')
  const [fullName, setFullName] = useState('')
  const [role, setRole] = useState<'client' | 'tasker'>('client')
  const [otp, setOtp] = useState('')
  const [step, setStep] = useState<'details' | 'otp'>('details')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const sendOTP = async () => {
    if (phone.length < 8 || fullName.length < 2) return
    setLoading(true); setError('')
    const { error } = await supabase.auth.signInWithOtp({ 
      phone: `+228${phone}`,
      options: {
        data: {
          full_name: fullName,
          role: role
        }
      }
    })
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
    <div className="w-full max-w-md mx-auto p-8 space-y-6 bg-white rounded-2xl shadow-xl border border-gray-100">
      <h2 className="text-2xl font-bold text-center text-gray-900">Créer un compte</h2>
      <p className="text-center text-sm text-gray-500 mb-6">Rejoignez la communauté ayeJOB.</p>
      
      {step === 'details' ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom complet</label>
            <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
              placeholder="Ex: Jean Dupont"
              className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Numéro de téléphone (Togo)</label>
            <div className="flex">
              <span className="bg-gray-50 border border-r-0 border-gray-200 rounded-l-xl px-4 flex items-center text-gray-600 font-medium">+228</span>
              <input type="tel" value={phone} onChange={e => setPhone(e.target.value)}
                placeholder="90 00 00 00" maxLength={8}
                className="flex-1 border border-gray-200 rounded-r-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Je souhaite :</label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setRole('client')}
                className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                  role === 'client' 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700' 
                    : 'border-gray-200 hover:border-emerald-200 text-gray-600'
                }`}
              >
                Embaucher (Client)
              </button>
              <button
                type="button"
                onClick={() => setRole('tasker')}
                className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                  role === 'tasker' 
                    ? 'border-emerald-600 bg-emerald-50 text-emerald-700' 
                    : 'border-gray-200 hover:border-emerald-200 text-gray-600'
                }`}
              >
                Travailler (Artisan)
              </button>
            </div>
          </div>

          <button onClick={sendOTP} disabled={loading || phone.length < 8 || fullName.length < 2}
            className="w-full bg-emerald-600 text-white py-3 rounded-xl font-semibold disabled:opacity-50 hover:bg-emerald-700 transition shadow-sm hover:shadow-md mt-4">
            {loading ? 'Création en cours...' : 'Recevoir le code SMS'}
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
            {loading ? 'Vérification...' : 'Confirmer l\'inscription'}
          </button>
          <button onClick={() => setStep('details')} className="w-full text-sm text-gray-500 hover:text-emerald-600 transition">
            Modifier mes informations
          </button>
        </div>
      )}
      {error && <p className="text-red-500 text-sm text-center bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>}
    </div>
  )
}
