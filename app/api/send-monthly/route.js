import { Resend } from 'resend'
import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const resend = new Resend(process.env.RESEND_API_KEY)
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

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

async function getAllSubscribers() {
  const { data, error } = await supabase
    .from('subscribers')
    .select('email')
  return error ? [] : (data || [])
}

function getEmailHtml(issue) {
  return `
    <div style="background:#0a0a0a;color:#f0f0f0;font-family:Georgia,serif;max-width:600px;margin:0 auto;padding:40px 32px;">
      <p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:4px;text-transform:uppercase;color:#888;margin-bottom:32px;">NoShortcutz</p>
      <h1 style="font-size:32px;font-weight:700;line-height:1.2;color:#fff;margin-bottom:24px;">
        ${issue.title}
      </h1>
      <p style="font-size:16px;line-height:1.8;color:#ccc;margin-bottom:24px;">
        Your monthly breakdown is ready.
      </p>
      <p style="font-size:16px;line-height:1.8;color:#ccc;margin-bottom:32px;">
        ${issue.description || 'One brain system. One athlete. One tool. Every month.'}
      </p>
      <a href="${issue.pdf_link}" style="display:inline-block;background:#ffffff;color:#0a0a0a;text-decoration:none;padding:16px 32px;font-family:Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:2px;text-transform:uppercase;border-radius:4px;margin-bottom:40px;">
        Read This Month's Issue →
      </a>
      <hr style="border:none;border-top:1px solid #222;margin:32px 0;" />
      <p style="font-family:Arial,sans-serif;font-size:11px;letter-spacing:3px;text-transform:uppercase;color:#444;">
        NoShortcutz &middot; Pressure-Tested &middot; Built for competitive athletes
      </p>
    </div>
  `
}

export async function POST(req) {
  const authHeader = req.headers.get('authorization')
  const expectedSecret = process.env.CRON_SECRET
  if (authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  try {
    const issue = await getLatestReleasedIssue()
    if (!issue) {
      return NextResponse.json({ message: 'No issue ready to send' })
    }

    const subscribers = await getAllSubscribers()
    if (subscribers.length === 0) {
      return NextResponse.json({ message: 'No subscribers to send to' })
    }

    const emails = subscribers.map(sub => ({
      from: 'NoShortcutz <hello@noshortcutz.com>',
      to: sub.email,
      subject: issue.title,
      html: getEmailHtml(issue),
    }))

    for (let i = 0; i < emails.length; i += 100) {
      const batch = emails.slice(i, i + 100)
      await resend.batch.send(batch)
    }

    return NextResponse.json({ success: true, sent: emails.length, issue: issue.title })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
