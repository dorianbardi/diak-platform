import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const BADGES = [
  { id: 'first_study', icon: '🌱', title: 'Első lépés', desc: 'Először tanultál!', condition: (s) => s.xp >= 10 },
  { id: 'streak_3', icon: '🔥', title: '3 napos streak', desc: '3 egymás utáni nap tanultál!', condition: (s) => s.streak >= 3 },
  { id: 'streak_7', icon: '⚡', title: 'Heti bajnok', desc: '7 egymás utáni nap tanultál!', condition: (s) => s.streak >= 7 },
  { id: 'streak_14', icon: '💫', title: 'Két hetes', desc: '14 egymás utáni nap tanultál!', condition: (s) => s.streak >= 14 },
  { id: 'streak_30', icon: '👑', title: 'Havi bajnok', desc: '30 egymás utáni nap tanultál!', condition: (s) => s.streak >= 30 },
  { id: 'xp_100', icon: '⭐', title: '100 XP', desc: 'Elérted a 100 XP-t!', condition: (s) => s.xp >= 100 },
  { id: 'xp_500', icon: '🌟', title: '500 XP', desc: 'Elérted az 500 XP-t!', condition: (s) => s.xp >= 500 },
  { id: 'xp_1000', icon: '💎', title: '1000 XP', desc: 'Elérted az 1000 XP-t!', condition: (s) => s.xp >= 1000 },
  { id: 'level_3', icon: '🎓', title: 'Haladó', desc: 'Elérted a 3. szintet!', condition: (s) => s.level >= 3 },
  { id: 'level_5', icon: '🏆', title: 'Mester', desc: 'Elérted az 5. szintet!', condition: (s) => s.level >= 5 },
]

function getLevel(xp) {
  if (xp < 100) return 1
  if (xp < 300) return 2
  if (xp < 600) return 3
  if (xp < 1000) return 4
  if (xp < 2000) return 5
  return 6
}

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
      const newStats = {
        user_id, streak: 1, longest_streak: 1,
        last_study_date: today, xp: 10, level: 1,
        badges: ['first_study'],
      }
      await supabase.from('user_stats').insert(newStats)
      return NextResponse.json({ streak: 1, xp: 10, is_new: true, new_badges: ['first_study'] })
    }

    if (stats.last_study_date === today) {
      return NextResponse.json({ streak: stats.streak, xp: stats.xp, is_new: false, new_badges: [] })
    }

    const newStreak = stats.last_study_date === yesterday ? stats.streak + 1 : 1
    const newXP = stats.xp + 10
    const newLongest = Math.max(newStreak, stats.longest_streak)
    const newLevel = getLevel(newXP)

    const currentBadges = stats.badges || []
    const updatedStats = { streak: newStreak, longest_streak: newLongest, last_study_date: today, xp: newXP, level: newLevel }
    const newBadges = BADGES
      .filter(b => !currentBadges.includes(b.id) && b.condition({ ...updatedStats }))
      .map(b => b.id)

    await supabase.from('user_stats').update({
      ...updatedStats,
      badges: [...currentBadges, ...newBadges],
    }).eq('user_id', user_id)

    return NextResponse.json({ streak: newStreak, xp: newXP, is_new: true, new_badges: newBadges })

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

    if (!data) return NextResponse.json({ streak: 0, xp: 0, longest_streak: 0, level: 1, badges: [] })
    return NextResponse.json(data)

  } catch (e) {
    return NextResponse.json({ streak: 0, xp: 0, longest_streak: 0, level: 1, badges: [] })
  }
}