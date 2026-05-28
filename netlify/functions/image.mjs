import { getStore } from '@netlify/blobs';

const EXT_TYPES = {
  jpg: 'image/jpeg', jpeg: 'image/jpeg',
  png: 'image/png',  gif: 'image/gif',
  webp: 'image/webp', avif: 'image/avif',
};

export default async (req) => {
  const url = new URL(req.url);
  const key = url.pathname.replace('/api/images/', '');
  if (!key) return new Response('Not Found', { status: 404 });

  const store = getStore('rosery-images');
  let result;
  try {
    result = await store.getWithMetadata(key, { type: 'arrayBuffer' });
  } catch {
    return new Response('Not Found', { status: 404 });
  }
  if (!result) return new Response('Not Found', { status: 404 });

  const ext = key.split('.').pop().toLowerCase();
  const contentType = result.metadata?.contentType || EXT_TYPES[ext] || 'image/jpeg';

  return new Response(result.data, {
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
};

export const config = { path: '/api/images/*' };
