const axios = require('axios');

// Cloudflare API configuration
const CF_API_TOKEN = process.env.CF_API_TOKEN;
const CF_ACCOUNT_ID = process.env.CF_ACCOUNT_ID;
const CF_ZONE_ID = process.env.CF_ZONE_ID;
const DOMAIN = 'yourdomain.com';
const SUBDOMAIN = 'www';
const BUCKET_NAME = 'your-bucket-name';

const cf = axios.create({
  baseURL: 'https://api.cloudflare.com/client/v4',
  headers: {
    'Authorization': `Bearer ${CF_API_TOKEN}`,
    'Content-Type': 'application/json',
  },
});

async function createR2Bucket() {
  try {
    await cf.post(`/accounts/${CF_ACCOUNT_ID}/r2/buckets`, {
      name: BUCKET_NAME,
    });
    console.log(`R2 bucket '${BUCKET_NAME}' created successfully.`);
  } catch (error) {
    console.error('Error creating R2 bucket:', error.response.data);
  }
}

async function createWorker() {
  const workerScript = `
    export default {
      async fetch(request, env) {
        const url = new URL(request.url);
        let path = url.pathname.replace(/^\/+/, '');
        if (path.endsWith('/') || path === '') {
          path += 'index.html';
        }
        const pathsToTry = [path];
        if (!path.endsWith('.html')) {
          pathsToTry.push(path + '.html');
        }
        if (!path.endsWith('/') && !path.endsWith('.html')) {
          pathsToTry.push(path + '/index.html');
        }
        for (const pathToTry of pathsToTry) {
          try {
            const object = await env.MY_BUCKET.get(pathToTry);
            if (object !== null) {
              const data = await object.arrayBuffer();
              const contentType = object.httpMetadata.contentType || 'text/plain';
              return new Response(data, {
                headers: {
                  'content-type': contentType,
                  'cache-control': 'public, max-age=14400',
                },
              });
            }
          } catch (error) {
            console.error(\`Error fetching \${pathToTry}:\`, error);
          }
        }
        return new Response('Not Found', { status: 404 });
      },
    };
  `;

  try {
    await cf.put(`/accounts/${CF_ACCOUNT_ID}/workers/scripts/r2-worker`, workerScript, {
      headers: {
        'Content-Type': 'application/javascript',
      },
    });
    console.log('Worker script uploaded successfully.');

    // Bind R2 bucket to the worker
    await cf.put(`/accounts/${CF_ACCOUNT_ID}/workers/scripts/r2-worker/bindings`, {
      bindings: [
        {
          name: 'MY_BUCKET',
          type: 'r2_bucket',
          bucket_name: BUCKET_NAME,
        },
      ],
    });
    console.log('R2 bucket bound to worker successfully.');
  } catch (error) {
    console.error('Error creating or configuring worker:', error.response.data);
  }
}

async function createDNSRecord() {
  try {
    await cf.post(`/zones/${CF_ZONE_ID}/dns_records`, {
      type: 'CNAME',
      name: SUBDOMAIN,
      content: `${CF_ACCOUNT_ID}.r2.cloudflarestorage.com`,
      proxied: true,
    });
    console.log('DNS record created successfully.');
  } catch (error) {
    console.error('Error creating DNS record:', error.response.data);
  }
}

async function createWorkerRoute() {
  try {
    await cf.post(`/zones/${CF_ZONE_ID}/workers/routes`, {
      pattern: `${SUBDOMAIN}.${DOMAIN}/*`,
      script: 'r2-worker',
    });
    console.log('Worker route created successfully.');
  } catch (error) {
    console.error('Error creating worker route:', error.response.data);
  }
}

async function main() {
  await createR2Bucket();
  await createWorker();
  await createDNSRecord();
  await createWorkerRoute();
  console.log('Setup completed successfully!');
}

main().catch(console.error);
