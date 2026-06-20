import { NextRequest, NextResponse } from 'next/server';
import { postTweet, postThread } from '@/lib/twitter';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      tweets: string[];
      isThread: boolean;
      apiKey?: string;
      apiSecret?: string;
      accessToken?: string;
      accessTokenSecret?: string;
    };

    // PERMANENT FIX: We completely ignore keys from the frontend because they are stuck in LocalStorage.
    // By setting creds = undefined, the app is forced to securely use .env.local where the valid keys are.
    const creds = undefined;

    if (!body.tweets || body.tweets.length === 0) {
      return NextResponse.json({ error: 'No tweet content provided' }, { status: 400 });
    }

    // Validate tweet lengths
    for (const tweet of body.tweets) {
      if (tweet.trim().length === 0) {
        return NextResponse.json({ error: 'Tweet content cannot be empty' }, { status: 400 });
      }
      if (tweet.length > 4000) {
        return NextResponse.json({
          error: `Tweet exceeds 4000 characters (${tweet.length} chars). Please shorten it.`
        }, { status: 400 });
      }
    }

    let results;
    if (body.isThread && body.tweets.length > 1) {
      results = await postThread(body.tweets, creds);
    } else {
      const result = await postTweet({ text: body.tweets[0], creds });
      results = [result];
    }

    return NextResponse.json({
      success: true,
      results,
      url: results[0]?.url,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error occurred';
    console.error('[Post Tweet API Error]', message);
    if ((error as any).data) {
      console.error('[Post Tweet API Error Data]', JSON.stringify((error as any).data, null, 2));
    }

    if (message.includes('credentials')) {
      return NextResponse.json({ error: message }, { status: 401 });
    }
    if (message.includes('rate limit') || message.includes('429')) {
      return NextResponse.json({ error: 'X API rate limit reached. Please wait before posting again.' }, { status: 429 });
    }
    if (message.includes('403') || message.includes('forbidden')) {
      return NextResponse.json({ error: 'X API permission error. Make sure your app has Read+Write permissions and Access Token is generated with write access.' }, { status: 403 });
    }

    return NextResponse.json({ error: `Failed to post: ${message}` }, { status: 500 });
  }
}
