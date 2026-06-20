import { buildSystemPrompt, buildUserPrompt, GeneratePostInput, GeneratedPost } from './prompts';

const GROQ_MODEL = 'llama-3.3-70b-versatile';

function getApiKey(): string {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || apiKey === 'your_groq_api_key_here') {
    throw new Error('GROQ_API_KEY not configured. Please add your Groq API key in Settings.');
  }
  return apiKey;
}

async function callGroqAPI(systemPrompt: string, userPrompt: string): Promise<string> {
  const apiKey = getApiKey();

  const body = {
    model: GROQ_MODEL,
    temperature: 0.7,
    max_tokens: 2048,
    response_format: { type: 'json_object' },
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userPrompt }
    ],
  };

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const errMsg = errData?.error?.message || response.statusText;

    if (response.status === 401 || response.status === 403) {
      throw new Error('Invalid Groq API key. Please check your key at console.groq.com');
    }
    if (response.status === 429) {
      throw new Error('Groq rate limit reached. Please wait a moment.');
    }
    throw new Error(`Groq API error (${response.status}): ${errMsg}`);
  }

  const data = await response.json();
  const text = data?.choices?.[0]?.message?.content;
  
  if (!text) {
    throw new Error('No text returned from Groq. Please try again.');
  }
  
  return text;
}

export async function generatePost(input: GeneratePostInput): Promise<GeneratedPost> {
  const systemPrompt = buildSystemPrompt(input.style);
  const userPrompt = buildUserPrompt(input) + '\n\nIMPORTANT: You must return valid JSON. Do not return markdown, just the raw JSON object.';

  const responseText = await callGroqAPI(systemPrompt, userPrompt);

  const cleaned = responseText
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(cleaned) as GeneratedPost;
    if (!parsed.tweets || !Array.isArray(parsed.tweets) || parsed.tweets.length === 0) {
      throw new Error('Invalid AI response structure. Please try again.');
    }
    // Fix literal \n strings that some LLMs output
    parsed.tweets = parsed.tweets.map(t => t.replace(/\\n/g, '\n'));
    return parsed;
  } catch {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsedMatch = JSON.parse(jsonMatch[0]) as GeneratedPost;
      if (parsedMatch.tweets) {
        parsedMatch.tweets = parsedMatch.tweets.map(t => t.replace(/\\n/g, '\n'));
      }
      return parsedMatch;
    }
    throw new Error('Failed to parse AI response. Groq did not return valid JSON.');
  }
}
