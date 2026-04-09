import { GoogleGenerativeAI } from '@google/generative-ai'
import { NextResponse } from 'next/server'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

export async function POST(request) {
  try {
    const { grades, subjects } = await request.json()

    if (!grades || grades.length === 0) {
      return NextResponse.json({ error: 'Nincsenek jegyek!' }, { status: 400 })
    }

    const gradesSummary = subjects.map(subject => {
      const subjectGrades = grades.filter(g => g.subject === subject)
      const avg = subjectGrades.reduce((s, g) => s + g.grade * g.weight, 0) / subjectGrades.reduce((s, g) => s + g.weight, 0)
      return `${subject}: ${subjectGrades.map(g => g.grade).join(', ')} (átlag: ${avg.toFixed(2)})`
    }).join('\n')

    const prompt = `Elemezd ezeket a jegyeket és adj személyre szabott tanácsot:

${gradesSummary}

Válaszolj CSAK JSON formátumban, semmi más szöveg nélkül, ne használj markdown backtick-eket:
{
  "overall_analysis": "2-3 mondatos általános értékelés",
  "predicted_average": 4.2,
  "subjects": [
    {F
      "name": "tantárgy neve",
      "trend": "improving/declining/stable",
      "analysis": "1 mondatos elemzés",
      "needed_for_5": "mit kell tenni az ötöshez",
      "alert": true
    }
  ],
  "top_tip": "leghasznosabb tanács"
}

Magyarul válaszolj!`

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
    const analysis = JSON.parse(text)
    return NextResponse.json(analysis)

  } catch (e) {
    console.error(e)
    return NextResponse.json({ error: e.message }, { status: 500 })
  }
}