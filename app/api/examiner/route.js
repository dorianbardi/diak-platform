import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { action, cards, question, userAnswer, correctAnswer } = await request.json()

    const modelNames = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-pro']
    let result

    const prompt = action === 'evaluate'
      ? `Értékeld ezt a választ:
Kérdés: "${question}"
Helyes válasz: "${correctAnswer}"
Tanuló válasza: "${userAnswer}"

Válaszolj CSAK JSON formátumban, semmi más szöveg nélkül, ne használj markdown backtick-eket:
{"score": 0-100, "score10": 0-10, "feedback": "részletes visszajelzés magyarul", "correct": true}`
      : `Tegyél fel egy kérdést ezekből a flashcardokból:
${cards.map((c, i) => `${i + 1}. Kérdés: ${c.question} | Válasz: ${c.answer}`).join('\n')}

Válaszolj CSAK JSON formátumban, semmi más szöveg nélkül, ne használj markdown backtick-eket:
{"question": "kérdés szövege", "correctAnswer": "helyes válasz", "cardIndex": 0}`

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

    const text = result.response.text()
      .trim()
      .replace(/```json/g, '')
      .replace(/```/g, '')
      .trim()

    const data = JSON.parse(text)
    return NextResponse.json(data)

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}