'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function Contact() {
  const [formData, setFormData] = useState({ name: '', sport: '', message: '' })
  const [status, setStatus] = useState('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        setStatus('success')
        setFormData({ name: '', sport: '', message: '' })
      } else {
        const data = await res.json()
        setErrorMsg(data.error || 'Something went wrong.')
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

        <h1>Get in Touch</h1>

        <p className="tagline">Let's talk about your game.</p>

        <div className="divider" />

        <p className="body-text">
          Have a question? Want to work together? Tell us about your sport and what you're working on.
          We read every message.
        </p>

        {status === 'success' ? (
          <div className="success">
            Thanks for reaching out.<br />
            <span style={{ color: '#888', fontSize: '13px' }}>
              We'll be in touch soon.
            </span>
          </div>
        ) : (
          <form className="form-wrapper" onSubmit={handleSubmit}>
            <input
              type="text"
              placeholder="Your name"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              required
            />

            <input
              type="text"
              placeholder="Your sport"
              value={formData.sport}
              onChange={e => setFormData({ ...formData, sport: e.target.value })}
              required
            />

            <textarea
              placeholder="What do you want to work on?"
              value={formData.message}
              onChange={e => setFormData({ ...formData, message: e.target.value })}
              required
              style={{
                width: '100%',
                padding: '16px 20px',
                background: '#1a1a1a',
                border: '1px solid #333',
                borderRadius: '4px',
                color: '#fff',
                fontSize: '16px',
                fontFamily: 'Arial, sans-serif',
                minHeight: '120px',
                outline: 'none',
                resize: 'vertical',
              }}
              onFocus={e => e.target.style.borderColor = '#fff'}
              onBlur={e => e.target.style.borderColor = '#333'}
            />

            <button type="submit" disabled={status === 'loading'}>
              {status === 'loading' ? 'Sending...' : 'Send Message'}
            </button>

            {status === 'error' && <p className="error-msg">{errorMsg}</p>}
          </form>
        )}

        <p className="fine-print" style={{ marginTop: '40px' }}>
          <Link href="/" style={{ color: '#888', textDecoration: 'none', borderBottom: '1px solid #444' }}>
            Back to signup
          </Link>
        </p>

        <p className="footer">NoShortCutz &middot; Pressure-Tested &middot; Built for competitive athletes</p>
      </div>
    </main>
  )
}
