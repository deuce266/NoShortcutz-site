import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  const { name, sport, message } = await req.json()

  if (!name || !sport || !message) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  try {
    await resend.emails.send({
      from: 'NoShortCutz <hello@noshortcutz.com>',
      to: 'ggnoshortcutz@gmail.com',
      replyTo: name,
      subject: `New contact form submission from ${name}`,
      html: `
        <div style="background:#0a0a0a;color:#f0f0f0;font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 32px;">
          <p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#888;margin-bottom:32px;">NoShortCutz</p>

          <h1 style="font-size:28px;font-weight:700;line-height:1.2;color:#fff;margin-bottom:24px;">
            New Contact Form Submission
          </h1>

          <p style="font-size:14px;color:#888;margin-bottom:24px;">
            <strong>Name:</strong> ${name}
          </p>

          <p style="font-size:14px;color:#888;margin-bottom:24px;">
            <strong>Sport:</strong> ${sport}
          </p>

          <p style="font-size:14px;color:#888;margin-bottom:32px;">
            <strong>Message:</strong><br />
            ${message.replace(/\n/g, '<br />')}
          </p>

          <hr style="border:none;border-top:1px solid #222;margin:32px 0;" />

          <p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#444;">
            NoShortCutz &middot; Pressure-Tested &middot; Built for competitive athletes
          </p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to send message. Please try again.' }, { status: 500 })
  }
}
