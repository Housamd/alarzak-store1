'use client'
import { useState } from 'react'
import { useCart } from '../../lib/cart'
import CartModal from './CartModal'

export default function CartButton() {
  const items = useCart(s=>s.items)
  const [open,setOpen]=useState(false)
  const totalQty = items.reduce((a,b)=>a+b.qty,0)

  return (
    <>
      <button className="btn btn-outline" onClick={()=>setOpen(true)}>
        Cart ({totalQty})
      </button>
      {open && <CartModal onClose={()=>setOpen(false)} />}
    </>
  )
}
