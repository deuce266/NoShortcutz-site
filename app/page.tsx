'use client'

import { useState } from 'react'

export default function Home() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (res.ok) {
        setStatus('success')
      } else {
        const data = await res.json()
        setErrorMsg(data.error || 'Something went wrong. Try again.')
        setStatus('error')
      }
    } catch {
      setErrorMsg('Something went wrong. Try again.')
      setStatus('error')
    }
  }

  return (
    <main>
      <div className="container">
        <p className="eyebrow">NoShortCutz</p>

        <h1>The Pressure&#8209;Tested Monthly</h1>

        <p className="tagline">One brain system. One athlete. One tool. Every month.</p>

        <div className="divider" />

        <p className="body-text">
          Most athletes train their body. The ones who make it train their brain too.
          <br /><br />
          Each month you get one breakdown of how your brain works under pressure — what it does,
          what it looks like when it fails, and what it looks like when it fires right.
          A real sports moment from that month that shows the system in action.
          And one practical tool you can use before your next game.
          <br /><br />
          No fluff. No &ldquo;believe in yourself.&rdquo; Just the system, the proof, and the protocol.
        </p>

        {status === 'success' ? (
          <div className="success">
            Check your inbox — Issue 01 is on its way.<br />
            <span style={{ color: '#888', fontSize: '13px' }}>
              (Check your spam folder if you don&apos;t see it within a minute.)
            </span>
          </div>
        ) : (
          <form className="form-wrapper" onSubmit={handleSubmit}>
            <input
              type="email"
              placeholder="Your email address"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
            <button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending...' : 'Send Me Issue One'}
            </button>
            {status === 'error' && <p className="error-msg">{errorMsg}</p>}
          </form>
        )}

        <p className="fine-print">Free. One email a month. Unsubscribe anytime.</p>

        <p className="footer">NoShortCutz &middot; Pressure-Tested &middot; Built for competitive athletes</p>
      </div>
    </main>
  )
}
