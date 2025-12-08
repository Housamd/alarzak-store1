'use client'
import { signOut, useSession } from 'next-auth/react'
import Link from 'next/link'

export default function AuthButtons() {
  const { data } = useSession()
  if (data?.user) {
    return (
      <button className="btn btn-outline" onClick={() => signOut({ callbackUrl: '/' })}>
        Logout
      </button>
    )
  }
  return (
    <Link href="/login" className="btn btn-outline no-underline">
      Login
    </Link>
  )
}
