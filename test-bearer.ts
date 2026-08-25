import { TwitterApi } from 'twitter-api-v2';
import * as fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf-8');
const lines = env.split('\n');
const getEnv = (key: string) => {
  const line = lines.find(l => l.startsWith(key + '='));
  return line ? line.split('=')[1].trim() : '';
};

// Use App-only Bearer Token
const client = new TwitterApi(getEnv('TWITTER_BEARER_TOKEN'));

async function testBearer() {
  try {
    // Look up the user by username to verify the Bearer token works
    const user = await client.v2.userByUsername('TwitterDev');
    console.log("Bearer Token Success! App is active. Found user:", user.data.username);
  } catch (err: any) {
    console.error("Bearer Auth Error:", err.message);
    if (err.data) console.error("Error data:", err.data);
  }
}

testBearer();
