import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function getCalendarClient(userId) {
  const { data: tokenData } = await supabase
    .from('google_tokens')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (!tokenData) return null

  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://www.diakplatform.online/api/auth/google/callback'
  )

  oauth2Client.setCredentials({
    access_token: tokenData.access_token,
    refresh_token: tokenData.refresh_token,
    expiry_date: tokenData.expiry_date,
  })

  // Token frissítése ha lejárt
  oauth2Client.on('tokens', async (tokens) => {
    await supabase.from('google_tokens').update({
      access_token: tokens.access_token,
      expiry_date: tokens.expiry_date,
    }).eq('user_id', userId)
  })

  return google.calendar({ version: 'v3', auth: oauth2Client })
}

export async function POST(request) {
  try {
    const { user_id, action, exam, studyPlan } = await request.json()

    const calendar = await getCalendarClient(user_id)
    if (!calendar) {
      return NextResponse.json({ error: 'Nincs Google Calendar kapcsolat!' }, { status: 401 })
    }

    if (action === 'add_exam') {
      // Vizsga esemény
      const examEvent = {
        summary: `🎓 ${exam.name}`,
        description: `Témák: ${exam.topics.join(', ')}\n\nDiák Platform - Automatikusan létrehozva`,
        start: { date: exam.exam_date },
        end: { date: exam.exam_date },
        colorId: '11', // Piros
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 7 * 24 * 60 },  // 1 héttel előtte
            { method: 'popup', minutes: 24 * 60 },       // 1 nappal előtte
            { method: 'popup', minutes: 60 },            // 1 órával előtte
          ],
        },
      }

      const examResult = await calendar.events.insert({
        calendarId: 'primary',
        resource: examEvent,
      })

      // Tanulási napok hozzáadása ha van AI terv
      if (studyPlan?.days) {
        for (const day of studyPlan.days) {
          const studyEvent = {
            summary: `📚 Tanulás — ${exam.name}`,
            description: `Témák: ${day.topics?.join(', ')}\n\nFeladatok:\n${day.tasks?.map(t => `• ${t}`).join('\n')}\n\n💬 ${day.motivation}\n\nDiák Platform - Automatikusan létrehozva`,
            start: {
              dateTime: `${day.date}T08:00:00`,
              timeZone: 'Europe/Budapest',
            },
            end: {
              dateTime: `${day.date}T${String(8 + Math.ceil(day.hours)).padStart(2, '0')}:00:00`,
              timeZone: 'Europe/Budapest',
            },
            colorId: '1', // Kék
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'popup', minutes: 30 },
              ],
            },
          }

          await calendar.events.insert({
            calendarId: 'primary',
            resource: studyEvent,
          })
        }
      }

      return NextResponse.json({ success: true, examEventId: examResult.data.id })
    }

    if (action === 'check_connection') {
      const { data } = await supabase.from('google_tokens').select('user_id').eq('user_id', user_id).single()
      return NextResponse.json({ connected: !!data })
    }

    return NextResponse.json({ error: 'Ismeretlen action' }, { status: 400 })

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}