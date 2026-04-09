import { NextResponse } from 'next/server'
import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  'https://www.diakplatform.online/api/auth/google/callback'
)

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const state = searchParams.get('state')
  
  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/calendar'],
    prompt: 'consent',
    state: state, // ← ezt hozzá kell adni!
  })
  return NextResponse.redirect(url)
}