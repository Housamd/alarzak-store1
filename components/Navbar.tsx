import Image from 'next/image'
import Link from 'next/link'
import RoleBadge from './RoleBadge'
import AuthButtons from './AuthButtons'
import CartButton from './cart/CartButton'

export default function Navbar() {
  return (
    <header className="header">
      <nav className="container flex items-center justify-between py-3">
        <Link href="/" className="flex items-center gap-3 no-underline">
          {/* الشعار */}
          <Image src="/logo.png" alt="Al-Razak" width={44} height={44} />
          <span className="text-xl font-bold tracking-wide" style={{color: '#2A5DA8'}}>
            AL-RAZAK
          </span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/terms" className="no-underline text-gray-700 hover:text-brand-blue">Terms</Link>
          <Link href="/contact" className="no-underline text-gray-700 hover:text-brand-blue">Contact</Link>
          <Link href="/dashboard" className="no-underline text-gray-700 hover:text-brand-blue">Dashboard</Link>
          <span className="badge badge--gold hidden sm:inline-flex">Simple • Clean</span>
          <RoleBadge />
          <CartButton />
          <AuthButtons />
        </div>
      </nav>
    </header>
  )
}
