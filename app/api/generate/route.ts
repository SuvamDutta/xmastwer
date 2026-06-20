import { NextRequest, NextResponse } from 'next/server';
import { generatePost } from '@/lib/gemini';
import { GeneratePostInput } from '@/lib/prompts';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as GeneratePostInput & { groqApiKey?: string };

    // Allow overriding env key with one saved in browser Settings
    if (body.groqApiKey && body.groqApiKey.length > 10) {
      process.env.GROQ_API_KEY = body.groqApiKey;
    }

    if (!body.summary || body.summary.trim().length < 3) {
      return NextResponse.json(
        { error: 'Please provide a topic summary (at least 3 characters)' },
        { status: 400 }
      );
    }

    const input: GeneratePostInput = {
      summary: body.summary.trim(),
      style: body.style || 'airdrop',
      format: body.format,
      additionalContext: body.additionalContext,
    };

    const post = await generatePost(input);

    return NextResponse.json({ success: true, post });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Generate API Error]', message);

    if (message.includes('GROQ_API_KEY')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    if (message.includes('quota') || message.includes('rate limit')) {
      return NextResponse.json({ error: 'Groq API rate limit reached. Please wait a moment and try again.' }, { status: 429 });
    }

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
