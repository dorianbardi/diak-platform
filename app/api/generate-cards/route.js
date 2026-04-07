import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { topic, count = 10 } = await request.json()

    if (!topic) {
      return NextResponse.json({ error: 'Téma megadása kötelező' }, { status: 400 })
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `Generálj ${count} flashcardot a következő témához: "${topic}".
    
Válaszolj CSAK JSON formátumban, semmi más szöveg nélkül, ne használj markdown backtick-eket:
[
  {"question": "kérdés szövege", "answer": "válasz szövege"}
]

A kérdések legyenek rövidek és konkrétak. A válaszok legyenek tömörek. Magyarul válaszolj!`

    const result = await model.generateContent(prompt)
    const text = result.response.text().trim()
    const cards = JSON.parse(text)

    return NextResponse.json({ cards })

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}