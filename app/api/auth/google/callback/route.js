import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://www.diakplatform.online/api/auth/google/callback'
)

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')
    const state = searchParams.get('state')

    const { tokens } = await oauth2Client.getToken(code)

    // Token mentése Supabase-be
    await supabase.from('google_tokens').upsert({
      user_id: state,
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expiry_date: tokens.expiry_date,
    })

    return NextResponse.redirect('https://www.diakplatform.online/dashboard/utemterv?calendar=connected')
  } catch (e) {
    console.error(e)
    return NextResponse.redirect('https://www.diakplatform.online/dashboard/utemterv?calendar=error')
  }
}