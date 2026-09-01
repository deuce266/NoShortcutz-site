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

function getFooter() {
  return `
    <hr style="border:none;border-top:1px solid #222;margin:40px 0 28px;" />
    <table style="width:100%;border-collapse:collapse;">
      <tr>
        <td style="padding-bottom:12px;">
          <a href="https://noshortcutz.com" style="font-family:Georgia,serif;font-size:16px;font-weight:700;color:#c0392b;text-decoration:none;">NoShortcutz</a>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:12px;">
          <p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#444;margin:0;">Pressure-Tested &middot; Built for competitive athletes</p>
        </td>
      </tr>
      <tr>
        <td style="padding-bottom:16px;">
          <a href="https://noshortcutz.com" style="font-family:Arial,sans-serif;font-size:11px;color:#555;text-decoration:none;">noshortcutz.com</a>
          &nbsp;&nbsp;&middot;&nbsp;&nbsp;
          <a href="https://instagram.com/noshortcutz" style="font-family:Arial,sans-serif;font-size:11px;color:#555;text-decoration:none;">@noshortcutz</a>
        </td>
      </tr>
      <tr>
        <td>
          <p style="font-family:Arial,sans-serif;font-size:10px;color:#333;margin:0;line-height:1.6;">
            You're receiving this because you signed up at noshortcutz.com.
            &nbsp;<a href="https://noshortcutz.com" style="color:#555;text-decoration:underline;">Unsubscribe</a>
          </p>
        </td>
      </tr>
    </table>
  `
}

function getEmailHtml(issue) {
  return `
    <div style="background:#0a0a0a;color:#f0f0f0;font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 32px;">
      <p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#888;margin-bottom:32px;">NoShortcutz</p>
      <h1 style="font-size:32px;font-weight:700;line-height:1.2;color:#fff;margin-bottom:20px;">
        You're in.
      </h1>
      <p style="font-size:16px;line-height:1.8;color:#ccc;margin-bottom:16px;">
        You signed up. That already puts you ahead of most athletes who never think about this stuff.
      </p>
      <p style="font-size:16px;line-height:1.8;color:#ccc;margin-bottom:16px;">
        Your latest issue is waiting — <strong style="color:#fff;">${issue ? issue.title : 'The Pressure-Tested Monthly'}</strong>. ${issue ? (issue.description || '') : ''}
      </p>
      <p style="font-size:16px;line-height:1.8;color:#ccc;margin-bottom:32px;">
        You also have free access to the Brain Performance app suite — Brain Map, Pre-Game Protocol, and the Pressure Simulator with 105 real sports scenarios.
      </p>
      <a href="https://noshortcutz.com/members" style="display:inline-block;background:#c0392b;color:#fff;text-decoration:none;padding:16px 32px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:4px;margin-bottom:40px;">
        Go to Members Area →
      </a>
      <p style="font-size:13px;line-height:1.8;color:#555;margin-bottom:0;">
        Enter your email on the members page to unlock everything instantly. New issues drop on the 1st of every month.
      </p>
      ${getFooter()}
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
    await resend.emails.send({
      from: 'NoShortcutz <hello@noshortcutz.com>',
      to: email,
      subject: issue ? `Welcome — Issue ${String(issue.issue_number).padStart(2,'0')} is waiting for you` : 'Welcome to NoShortcutz',
      html: getEmailHtml(issue),
    })
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to subscribe. Please try again.' }, { status: 500 })
  }
}
