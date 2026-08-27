import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function POST(req) {
  // Simple admin secret check
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.ADMIN_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { issue_number, title, description, pdf_link, released_at } = await req.json()

    if (!issue_number || !title || !pdf_link || !released_at) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('issues')
      .insert([{ issue_number, title, description, pdf_link, released_at }])
      .select()
      .single()

    if (error) {
      // If duplicate, try update instead
      if (error.code === '23505') {
        const { data: updated, error: updateError } = await supabase
          .from('issues')
          .update({ title, description, pdf_link, released_at })
          .eq('issue_number', issue_number)
          .select()
          .single()

        if (updateError) {
          return NextResponse.json({ error: updateError.message }, { status: 500 })
        }
        return NextResponse.json({ success: true, action: 'updated', issue: updated })
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, action: 'created', issue: data })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
