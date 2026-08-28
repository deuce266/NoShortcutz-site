import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function saveEmail(email) {
  const { error } = await supabase
    .from('subscribers')
    .insert([{ email }])
  return !error
}

async function getLatestReleasedIssue() {
  const { data, error } = await supabase
    .from('issues')
    .select('*')
    .lte('released_at', new Date().toISOString())
    .order('issue_number', { ascending: false })
    .limit(1)
    .single()
  return error ? null : data
}

function getEmailHtml(issue) {
  return `
    <div style="background:#0a0a0a;color:#f0f0f0;font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 32px;">
      <p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#888;margin-bottom:32px;">NoShortCutz</p>

      <h1 style="font-size:32px;font-weight:700;line-height:1.2;color:#fff;margin-bottom:24px;">
        ${issue.title}
      </h1>

      <p style="font-size:16px;line-height:1.8;color:#ccc;margin-bottom:24px;">
        You signed up. That already puts you ahead of most athletes who never think about this stuff.
      </p>

      <p style="font-size:16px;line-height:1.8;color:#ccc;margin-bottom:32px;">
        ${issue.description || 'Dive in and see what you\'ve been missing.'}
      </p>

      <p style="font-size:16px;line-height:1.8;color:#ccc;margin-bottom:32px;">
  You also have free access to the Brain Performance app suite — Brain Map, Pre-Game Protocol, and Pressure Simulator. Visit <a href="https://noshortcutz.com/members" style="color:#c0392b;">noshortcutz.com/members</a> and enter this email address to unlock them instantly.
</p>

      <a href="${issue.pdf_link}" style="display:inline-block;background:#ffffff;color:#0a0a0a;text-decoration:none;padding:16px 32px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:4px;margin-bottom:40px;">
        Read Issue →
      </a>

      <p style="font-size:14px;line-height:1.8;color:#666;margin-bottom:8px;">
        New issues drop on the 1st of the month.
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

    const issue = await getLatestReleasedIssue()

    if (!issue) {
      return NextResponse.json({ success: true, message: 'Subscribed but no issues released yet' })
    }

    await resend.emails.send({
      from: 'NoShortCutz <hello@noshortcutz.com>',
      to: email,
      subject: issue.title,
      html: getEmailHtml(issue),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 })
  }
}
