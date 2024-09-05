const axios = require('axios');
const sodium = require('tweetsodium');

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const GITHUB_REPO_OWNER = 'your-github-username';
const GITHUB_REPO_NAME = 'your-repo-name';

const secrets = {
  R2_ACCESS_KEY_ID: process.env.R2_ACCESS_KEY_ID,
  R2_SECRET_ACCESS_KEY: process.env.R2_SECRET_ACCESS_KEY,
  R2_BUCKET_NAME: process.env.R2_BUCKET_NAME,
  CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_ZONE_ID: process.env.CLOUDFLARE_ZONE_ID,
  CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
};

const github = axios.create({
  baseURL: 'https://api.github.com',
  headers: {
    'Authorization': `token ${GITHUB_TOKEN}`,
    'Accept': 'application/vnd.github.v3+json',
  },
});

async function getPublicKey() {
  const response = await github.get(`/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/actions/secrets/public-key`);
  return response.data;
}

async function setSecret(secretName, secretValue, publicKey) {
  const messageBytes = Buffer.from(secretValue);
  const keyBytes = Buffer.from(publicKey.key, 'base64');
  const encryptedBytes = sodium.seal(messageBytes, keyBytes);
  const encrypted = Buffer.from(encryptedBytes).toString('base64');

  await github.put(`/repos/${GITHUB_REPO_OWNER}/${GITHUB_REPO_NAME}/actions/secrets/${secretName}`, {
    encrypted_value: encrypted,
    key_id: publicKey.key_id,
  });
}

async function main() {
  try {
    const publicKey = await getPublicKey();
    
    for (const [name, value] of Object.entries(secrets)) {
      await setSecret(name, value, publicKey);
      console.log(`Secret ${name} set successfully.`);
    }

    console.log('All secrets have been set successfully!');
  } catch (error) {
    console.error('Error setting secrets:', error.response ? error.response.data : error.message);
  }
}

main();
