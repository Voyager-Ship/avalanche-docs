import { algoliasearch } from 'algoliasearch';
import { sync, DocumentRecord } from '../node_modules/fumadocs-core/dist/search/algolia.js';
import * as fs from 'node:fs';

async function main() {
  // Skip if not production OR if no write key is provided
  if (process.env.VERCEL_ENV !== 'production') {
    console.log('Skipping Algolia sync: Not in production environment');
    return;
  }

  if (!process.env.ALGOLIA_WRITE_KEY) {
    console.warn('Skipping Algolia sync: ALGOLIA_WRITE_KEY not found');
    return;
  }

  const filePath = {
    next: '.next/server/app/static.json.body',
    'tanstack-start': '.output/public/static.json',
    'react-router': 'build/client/static.json',
    waku: 'dist/public/static.json',
  }['next'];

  try {
    const content = fs.readFileSync(filePath);
    const records = JSON.parse(content.toString()) as DocumentRecord[];
    const client = algoliasearch('0T4ZBDJ3AF', process.env.ALGOLIA_WRITE_KEY);

    await sync(client, {
      documents: records,
      indexName: 'builder-hub',
    });
    
    console.log('Algolia sync completed successfully');
  } catch (error) {
    console.error('Algolia sync failed:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Script execution failed:', error);
  if (process.env.VERCEL_ENV === 'production') {
    process.exit(1);
  }
});