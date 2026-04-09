import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export async function POST(request) {
  try {
    const { user_id } = await request.json()

    const { data: stats } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user_id)
      .single()

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    if (!stats) {
      await supabase.from('user_stats').insert({
        user_id, streak: 1, longest_streak: 1,
        last_study_date: today, xp: 10,
      })
      return NextResponse.json({ streak: 1, xp: 10, is_new: true })
    }

    if (stats.last_study_date === today) {
      return NextResponse.json({ streak: stats.streak, xp: stats.xp, is_new: false })
    }

    const newStreak = stats.last_study_date === yesterday ? stats.streak + 1 : 1
    const newXP = stats.xp + 10
    const newLongest = Math.max(newStreak, stats.longest_streak)

    await supabase.from('user_stats').update({
      streak: newStreak,
      longest_streak: newLongest,
      last_study_date: today,
      xp: newXP,
    }).eq('user_id', user_id)

    return NextResponse.json({ streak: newStreak, xp: newXP, is_new: true })

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const user_id = searchParams.get('user_id')

    const { data } = await supabase
      .from('user_stats')
      .select('*')
      .eq('user_id', user_id)
      .single()

    if (!data) return NextResponse.json({ streak: 0, xp: 0, longest_streak: 0, level: 1 })
    return NextResponse.json(data)

  } catch (e) {
    return NextResponse.json({ streak: 0, xp: 0, longest_streak: 0, level: 1 })
  }
}