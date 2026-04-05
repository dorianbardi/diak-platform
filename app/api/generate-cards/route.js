import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request) {
  try {
    const { topic, count = 10 } = await request.json()

    if (!topic) {
      return NextResponse.json({ error: 'Téma megadása kötelező' }, { status: 400 })
    }

    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: `Generálj ${count} flashcardot a következő témához: "${topic}".
          
Válaszolj CSAK JSON formátumban, semmi más szöveg nélkül, ne használj markdown backtick-eket:
[
  {"question": "kérdés szövege", "answer": "válasz szövege"}
]`
        }
      ]
    })

    const content = message.content[0].text.trim()
    const cards = JSON.parse(content)
    return NextResponse.json({ cards })

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}