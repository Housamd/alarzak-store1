'use client'

import { useCart } from '../../lib/cart'
import { useState } from 'react'

type Props = { onClose: () => void }

export default function CartModal({ onClose }: Props) {
  const { items, setQty, clear } = useCart()
  const [delivery, setDelivery] = useState<'SHIP' | 'PICKUP'>('SHIP')
  const [notes, setNotes] = useState('')
  const [accepted, setAccepted] = useState(false)
  const [msg, setMsg] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async () => {
    if (!accepted) {
      setMsg('You must accept Terms & Conditions')
      return
    }
    if (items.length === 0) {
      setMsg('No items in cart.')
      return
    }

    try {
      setSubmitting(true)
      const res = await fetch('/api/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          deliveryMethod: delivery,
          notes,
          acceptedTerms: accepted,
        }),
      })
      const j = await res.json()
      if (res.ok) {
        setMsg('Order submitted: ' + j.orderId)
        clear()
      } else {
        setMsg(j.error || 'Error')
      }
    } catch (e) {
      setMsg('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-semibold">Your cart</h3>
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
        </div>

        {/* Items */}
        <div className="mt-4 max-h-[50vh] space-y-3 overflow-auto">
          {items.length === 0 && <div>No items in cart.</div>}

          {items.map((i) => (
            <div
              key={i.sku}
              className="flex items-center justify-between rounded border p-2"
            >
              <div>
                <div className="font-medium">{i.name}</div>
                <div className="text-xs text-gray-500">{i.sku}</div>
              </div>

              <div className="flex items-center gap-2">
                <label className="text-sm text-gray-600">Qty</label>
                <input
                  type="number"
                  min={1}
                  value={i.qty}
                  onChange={(e) =>
                    setQty(
                      i.sku,
                      Math.max(1, parseInt(e.target.value || '1', 10))
                    )
                  }
                  className="w-20"
                />
              </div>
            </div>
          ))}
        </div>

        {/* Options */}
        <div className="mt-4 grid gap-3">
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={delivery === 'SHIP'}
                onChange={() => setDelivery('SHIP')}
              />
              Ship with transport
            </label>

            <label className="flex items-center gap-2">
              <input
                type="radio"
                checked={delivery === 'PICKUP'}
                onChange={() => setDelivery('PICKUP')}
              />
              Pickup
            </label>
          </div>

          <div>
            <label className="mb-1 block">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="h-20 w-full"
              placeholder="Optional notes about your order..."
            />
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={accepted}
              onChange={(e) => setAccepted(e.target.checked)}
            />
            I accept the{' '}
            <a href="/terms" className="underline">
              Terms &amp; Conditions
            </a>
            .
          </label>
        </div>

        {/* Message */}
        {msg && <div className="mt-3 text-sm">{msg}</div>}

        {/* Footer buttons */}
        <div className="mt-4 flex justify-end gap-2">
          <button className="btn btn-outline" onClick={onClose}>
            Close
          </button>
          <button
            className="btn btn-primary"
            onClick={submit}
            disabled={submitting}
          >
            {submitting ? 'Submitting…' : 'Submit order'}
          </button>
        </div>
      </div>
    </div>
  )
}
