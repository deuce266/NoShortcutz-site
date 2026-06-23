import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const PDF_LINK = 'https://drive.google.com/file/d/1YIXTWqdW4mGGmFCSvUubjGaa6jwzvRP1/view?usp=sharing'
const ISSUE_TITLE = 'Issue 01: Emotion & Threat Detection (+ Scheffler at Valhalla)'

async function saveEmail(email) {
  const { error } = await supabase
    .from('subscribers')
    .insert([{ email }])
  return !error
}

function getEmailHtml(pdfLink) {
  return `
    <div style="background:#0a0a0a;color:#f0f0f0;font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 32px;">
      <p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#888;margin-bottom:32px;">NoShortCutz</p>

      <h1 style="font-size:32px;font-weight:700;line-height:1.2;color:#fff;margin-bottom:24px;">
        ${ISSUE_TITLE}
      </h1>

      <p style="font-size:16px;line-height:1.8;color:#ccc;margin-bottom:24px;">
        You signed up. That already puts you ahead of most athletes who never think about this stuff.
      </p>

      <p style="font-size:16px;line-height:1.8;color:#ccc;margin-bottom:32px;">
        Issue 01 breaks down how your brain processes pressure — what's happening when your body tightens up,
        your vision narrows, and your instincts either fire right or completely fail you.
        We use Scottie Scheffler at Valhalla as the case study.
      </p>

      <a href="${pdfLink}" style="display:inline-block;background:#ffffff;color:#0a0a0a;text-decoration:none;padding:16px 32px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:4px;margin-bottom:40px;">
        Read Issue →
      </a>

      <p style="font-size:14px;line-height:1.8;color:#666;margin-bottom:8px;">
        Next issue drops first of the month.
      </p>

      <hr style="border:none;border-top:1px solid #222;margin:32px 0;" />

      <p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#444;">
        NoShortCutz &middot; Pressure-Tested &middot; Built for competitive athletes
      </p>
    </div>
  `
}

export async function POST(req) {
  const { email } = await req.json()

  if (!email || !email.includes('@')) {
    return NextResponse.json({ error: 'Invalid email address.' }, { status: 400 })
  }

  try {
    await saveEmail(email)

    await resend.emails.send({
      from: 'NoShortCutz <hello@noshortcutz.com>',
      to: email,
      subject: ISSUE_TITLE,
      html: getEmailHtml(PDF_LINK),
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send email. Please try again.' }, { status: 500 })
  }
}
