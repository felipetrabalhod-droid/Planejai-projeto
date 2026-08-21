interface GeminiResponse {
  candidates?: {
    content: {
      parts: { text: string }[]
    }
  }[]
  error?: {
    message?: string
  }
}

export interface InsightData {
  feasibility: {
    status: 'viable' | 'needs_adjustment' | 'unfeasible'
    content: string
  }
  diagnosis: {
    content: string
  }
  suggestions: {
    items: string[]
  }
  extraIncome: {
    items: string[]
  }
  investment: {
    items: string[]
  }
  motivation: {
    content: string
  }
}

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY?.trim()
const MODEL_NAME = 'gemini-flash-latest'
const GEMINI_API_URL = API_KEY
  ? `https://generativelanguage.googleapis.com/v1beta/models/${MODEL_NAME}:generateContent?key=${API_KEY}`
  : null

const callGeminiAPI = async (prompt: string) => {
  if (!GEMINI_API_URL) {
    throw new Error(
      'Chave da API do Gemini não configurada. Defina VITE_GEMINI_API_KEY no arquivo .env e reinicie o Vite.',
    )
  }

  const response = await fetch(GEMINI_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { responseMimeType: 'application/json' },
    }),
  })

  const payload = (await response.json()) as GeminiResponse

  if (!response.ok) {
    throw new Error(
      payload.error?.message ?? `Erro na requisição: ${response.status}`,
    )
  }

  return payload
}

export const getInsight = async (prompt: string) => {
  const response = await callGeminiAPI(prompt)
  const text = response.candidates?.[0]?.content.parts[0]?.text

  if (!text) {
    throw new Error('A API do Gemini não retornou um diagnóstico.')
  }

  const json = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '')
  return JSON.parse(json) as InsightData
}
