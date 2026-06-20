import { TwitterApi } from 'twitter-api-v2';

export interface TwitterCredentials {
  apiKey: string;
  apiSecret: string;
  accessToken: string;
  accessTokenSecret: string;
}

const getTwitterClient = (creds?: TwitterCredentials) => {
  const apiKey = creds?.apiKey || process.env.TWITTER_API_KEY;
  const apiSecret = creds?.apiSecret || process.env.TWITTER_API_SECRET;
  const accessToken = creds?.accessToken || process.env.TWITTER_ACCESS_TOKEN;
  const accessTokenSecret = creds?.accessTokenSecret || process.env.TWITTER_ACCESS_TOKEN_SECRET;

  if (!apiKey || !apiSecret || !accessToken || !accessTokenSecret ||
      accessToken === 'your_access_token_here') {
    throw new Error('Twitter API credentials not fully configured. Please add your Access Token & Secret in Settings.');
  }

  return new TwitterApi({
    appKey: apiKey,
    appSecret: apiSecret,
    accessToken: accessToken,
    accessSecret: accessTokenSecret,
  });
};

export interface PostTweetOptions {
  text: string;
  replyToId?: string;
  mediaId?: string;
  creds?: TwitterCredentials;
}

export interface PostResult {
  id: string;
  text: string;
  url: string;
}

export async function postTweet(options: PostTweetOptions): Promise<PostResult> {
  const client = getTwitterClient(options.creds);

  const tweetPayload: { text: string; reply?: { in_reply_to_tweet_id: string } } = {
    text: options.text,
  };

  if (options.replyToId) {
    tweetPayload.reply = { in_reply_to_tweet_id: options.replyToId };
  }

  const result = await client.v2.tweet(tweetPayload);

  if (!result.data) {
    throw new Error('Failed to post tweet - no data returned from X API');
  }

  return {
    id: result.data.id,
    text: result.data.text,
    url: `https://x.com/i/web/status/${result.data.id}`,
  };
}

export async function postThread(tweets: string[], creds?: TwitterCredentials): Promise<PostResult[]> {
  const results: PostResult[] = [];
  let replyToId: string | undefined;

  for (const tweetText of tweets) {
    const result = await postTweet({ text: tweetText, replyToId, creds });
    results.push(result);
    replyToId = result.id;
    // Small delay between tweets to avoid rate limiting
    if (tweets.indexOf(tweetText) < tweets.length - 1) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return results;
}

export function isTwitterConfigured(): boolean {
  return !!(
    process.env.TWITTER_API_KEY &&
    process.env.TWITTER_API_SECRET &&
    process.env.TWITTER_ACCESS_TOKEN &&
    process.env.TWITTER_ACCESS_TOKEN_SECRET &&
    process.env.TWITTER_ACCESS_TOKEN !== 'your_access_token_here'
  );
}
