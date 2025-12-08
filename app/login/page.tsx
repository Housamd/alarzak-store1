'use client'
import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function Login(){
  const [number, setNumber] = useState('')
  const [code, setCode] = useState('')
  const [msg, setMsg] = useState<string|null>(null)

  const submit = async (e:React.FormEvent)=>{
    e.preventDefault()
    setMsg(null)
    const res = await signIn('credentials', { number, code, callbackUrl:'/', redirect:false })
    if (res?.ok) window.location.href = '/dashboard'
    else setMsg('Invalid number or code.')
  }

  return (
    <main className="container py-16 max-w-md">
      <h2 className="text-3xl font-bold mb-6">Customer login</h2>
      <form onSubmit={submit} className="space-y-4">
        <div className="space-y-2">
          <label>Customer number</label>
          <input className="w-full" value={number} onChange={e=>setNumber(e.target.value)} required />
        </div>
        <div className="space-y-2">
          <label>Code</label>
          <input type="password" className="w-full" value={code} onChange={e=>setCode(e.target.value)} required />
        </div>
        <button className="btn btn-primary w-full">Sign in</button>
        {msg && <p className="mt-2">{msg}</p>}
      </form>
      <p className="mt-6 text-sm text-gray-600">Demo: number <code>1001</code> / code <code>alrazak1</code></p>
    </main>
  )
}
