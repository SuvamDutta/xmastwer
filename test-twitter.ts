import { TwitterApi } from 'twitter-api-v2';
import * as fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const lines = env.split('\n');
const getEnv = (key: string) => {
  const line = lines.find(l => l.startsWith(key + '='));
  if (!line) return '';
  const idx = line.indexOf('=');
  return line.substring(idx + 1).trim();
};

const client = new TwitterApi({
  appKey: getEnv('TWITTER_API_KEY'),
  appSecret: getEnv('TWITTER_API_SECRET'),
  accessToken: getEnv('TWITTER_ACCESS_TOKEN'),
  accessSecret: getEnv('TWITTER_ACCESS_TOKEN_SECRET'),
});

async function testAuth() {
  try {
    const user = await client.v2.me();
    console.log("Success! Authenticated as:", user.data.username);
  } catch (err: any) {
    console.error("Auth Error:", err.message);
    if (err.data) console.error("Error data:", err.data);
  }
}

testAuth();
