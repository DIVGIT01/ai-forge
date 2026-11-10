import OpenAI from 'openai'
import { env } from './env.js'

/**
 * Google Gemini exposed through its OpenAI-compatible endpoint, so the
 * standard `openai` SDK can drive it. Swapping providers means changing
 * GEMINI_BASE_URL / GEMINI_MODEL, not the controllers.
 */
let client = null

export const aiClient = () => {
  if (!env.gemini.apiKey) {
    throw Object.assign(
      new Error(
        'Text generation is not configured on this server (GEMINI_API_KEY is missing).'
      ),
      { statusCode: 503 }
    )
  }
  client ??= new OpenAI({
    apiKey: env.gemini.apiKey,
    baseURL: env.gemini.baseUrl,
  })
  return client
}

/**
 * Single entry point for every text completion in the app.
 * Returns the assistant message content as a plain string.
 */
export const generateText = async (prompt, { maxTokens = 1200 } = {}) => {
  const response = await aiClient().chat.completions.create({
    model: env.gemini.model,
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7,
    max_tokens: maxTokens,
  })

  const content = response.choices?.[0]?.message?.content?.trim()
  if (!content) throw new Error('The AI provider returned an empty response.')
  return content
}
