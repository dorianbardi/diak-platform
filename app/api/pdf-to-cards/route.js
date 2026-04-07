import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'
import pdf from 'pdf-parse'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('pdf')
    const count = formData.get('count') || 15

    if (!file) {
      return NextResponse.json({ error: 'PDF fájl szükséges' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    const pdfData = await pdf(buffer)
    const text = pdfData.text.slice(0, 8000)

    if (!text.trim()) {
      return NextResponse.json({ error: 'A PDF nem tartalmaz szöveget' }, { status: 400 })
    }

    const prompt = `Az alábbi szövegből generálj ${count} flashcardot tanuláshoz.

SZÖVEG:
${text}

Válaszolj CSAK JSON formátumban, semmi más szöveg nélkül, ne használj markdown backtick-eket:
[
  {"question": "kérdés szövege", "answer": "válasz szövege"}
]

A kérdések legyenek konkrétak és a szöveg legfontosabb részeire fókuszáljanak. Magyarul válaszolj!`

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

    const responseText = result.response.text().trim()
    const cards = JSON.parse(responseText)
    const markedCards = cards.map(card => ({ ...card, is_ai_generated: true }))
    return NextResponse.json({ cards: markedCards })

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}