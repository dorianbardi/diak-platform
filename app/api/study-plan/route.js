import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { examName, examDate, topics, hoursPerDay, cardCount } = await request.json()

    const daysLeft = Math.ceil((new Date(examDate) - new Date()) / (1000 * 60 * 60 * 24))

    if (daysLeft <= 0) {
      return NextResponse.json({ error: 'A vizsga már lejárt!' }, { status: 400 })
    }

    const prompt = `Készíts részletes tanulási tervet erre a vizsgára:

Vizsga neve: ${examName}
Vizsga dátuma: ${examDate}
Hátralévő napok: ${daysLeft}
Témák: ${topics.join(', ')}
Napi tanulási idő: ${hoursPerDay} óra
Meglévő flashcardok: ${cardCount} db

Válaszolj CSAK JSON formátumban, semmi más szöveg nélkül, ne használj markdown backtick-eket:
{
  "overview": "2-3 mondatos összefoglaló a tervről",
  "priority": "melyik témára kell a legtöbbet koncentrálni és miért",
  "daily_cards": 10,
  "days": [
    {
      "day": 1,
      "date": "2026-04-10",
      "topics": ["téma1"],
      "tasks": ["konkrét feladat 1", "konkrét feladat 2"],
      "hours": 1.5,
      "motivation": "rövid motivációs üzenet"
    }
  ]
}

Maximum ${Math.min(daysLeft, 14)} napot generálj. Minden magyarul legyen!`

    const modelNames = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro']
    let result

    for (const modelName of modelNames) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        result = await model.generateContent(prompt)
        break
      } catch (e) {
        if (modelName === modelNames[modelNames.length - 1]) throw e
        continue
      }
    }

    const text = result.response.text().trim().replace(/```json/g, '').replace(/```/g, '').trim()
    const plan = JSON.parse(text)
    return NextResponse.json(plan)

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}