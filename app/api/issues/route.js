import { createClient } from '@supabase/supabase-js'
import { NextResponse } from 'next/server'

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

export async function GET() {
  try {
    const { data: issues, error } = await supabase
      .from('issues')
      .select('*')
      .lte('released_at', new Date().toISOString())
      .order('issue_number', { ascending: false })

    if (error) {
      return NextResponse.json({ error: 'Failed to fetch issues' }, { status: 500 })
    }

    return NextResponse.json({ issues: issues || [] })
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
