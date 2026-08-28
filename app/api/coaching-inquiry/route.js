import { Resend } from 'resend'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(req) {
  try {
    const { sport, breakdown, email } = await req.json()

    if (!sport || !breakdown || !email) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    // Notify Gerry
    await resend.emails.send({
      from: 'NoShortcutz <hello@noshortcutz.com>',
      to: 'ggnoshortcutz@gmail.com',
      subject: `New Coaching Inquiry — ${sport}`,
      html: `
        <div style="background:#080808;color:#f0f0f0;font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 32px;">
          <p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#888;margin-bottom:24px;">NoShortcutz · Coaching Inquiry</p>
          <h2 style="font-size:24px;font-weight:700;color:#fff;margin-bottom:20px;">New inquiry from ${email}</h2>
          <table style="width:100%;border-collapse:collapse;">
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid #222;font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;width:120px;">Sport</td>
              <td style="padding:12px 0;border-bottom:1px solid #222;font-size:15px;color:#fff;">${sport}</td>
            </tr>
            <tr>
              <td style="padding:12px 0;border-bottom:1px solid #222;font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;">Email</td>
              <td style="padding:12px 0;border-bottom:1px solid #222;font-size:15px;color:#c0392b;">${email}</td>
            </tr>
            <tr>
              <td style="padding:16px 0 0;font-family:Arial,sans-serif;font-size:11px;letter-spacing:2px;text-transform:uppercase;color:#888;vertical-align:top;">Breaking down</td>
              <td style="padding:16px 0 0;font-size:15px;color:#ccc;line-height:1.7;">${breakdown}</td>
            </tr>
          </table>
          <hr style="border:none;border-top:1px solid #222;margin:32px 0;" />
          <a href="mailto:${email}" style="display:inline-block;background:#c0392b;color:#fff;text-decoration:none;padding:12px 24px;font-family:Arial,sans-serif;font-size:12px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:4px;">Reply to ${email.split('@')[0]}</a>
        </div>
      `
    })

    // Auto-reply to the athlete
    await resend.emails.send({
      from: 'NoShortcutz <hello@noshortcutz.com>',
      to: email,
      subject: 'Got it — I\'ll be in touch.',
      html: `
        <div style="background:#080808;color:#f0f0f0;font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 32px;">
          <p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#888;margin-bottom:32px;">NoShortcutz</p>
          <h1 style="font-size:28px;font-weight:700;color:#fff;margin-bottom:20px;line-height:1.2;">Your inquiry is in.</h1>
          <p style="font-size:16px;line-height:1.8;color:#ccc;margin-bottom:24px;">
            I've received your message about ${sport}. I'll review what you've shared and get back to you directly.
          </p>
          <p style="font-size:16px;line-height:1.8;color:#ccc;margin-bottom:32px;">
            In the meantime — if you haven't already, the free newsletter breaks down exactly the kind of stuff we'll be working on. One brain system per month, one athlete story, one tool you can use before your next game.
          </p>
          <hr style="border:none;border-top:1px solid #222;margin:32px 0;" />
          <p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#444;">
            NoShortcutz &middot; Pressure-Tested &middot; Built for competitive athletes
          </p>
        </div>
      `
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
