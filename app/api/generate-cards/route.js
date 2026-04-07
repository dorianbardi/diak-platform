import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { topic, count = 10 } = await request.json()

    if (!topic) {
      return NextResponse.json({ error: 'Téma megadása kötelező' }, { status: 400 })
    }

    const prompt = `A következő témához generálj tanulási anyagot: "${topic}".

Válaszolj CSAK JSON formátumban, semmi más szöveg nélkül, ne használj markdown backtick-eket:
{
  "summary": "2-3 mondatos tömör összefoglaló a témáról magyarul",
  "key_points": ["3-5 legfontosabb pont a témáról"],
  "cards": [
    {"question": "kérdés szövege", "answer": "válasz szövege"}
  ]
}

Generálj pontosan ${count} kártyát. Minden magyarul legyen!`

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

    const text = result.response.text().trim()
    const data = JSON.parse(text)
    const markedCards = data.cards.map(card => ({
      ...card,
      is_ai_generated: true,
      topic,
    }))

    return NextResponse.json({
      cards: markedCards,
      summary: data.summary,
      key_points: data.key_points,
      topic,
    })

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}