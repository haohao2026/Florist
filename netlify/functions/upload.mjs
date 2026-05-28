import { getStore } from '@netlify/blobs';

const ALLOWED_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif']);
const MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export default async (req) => {
  if (req.method !== 'POST') return new Response('Method Not Allowed', { status: 405 });

  const adminPwd = Netlify.env.get('ADMIN_PASSWORD') || 'rosery-admin-2026';
  if (req.headers.get('x-admin-password') !== adminPwd) {
    return Response.json({ error: '未授權' }, { status: 401 });
  }

  let formData;
  try {
    formData = await req.formData();
  } catch {
    return Response.json({ error: '無效的請求格式' }, { status: 400 });
  }

  const file = formData.get('file');
  if (!file || typeof file === 'string') {
    return Response.json({ error: '未提供圖片檔案' }, { status: 400 });
  }
  if (!ALLOWED_TYPES.has(file.type)) {
    return Response.json({ error: '僅支援 JPG、PNG、WebP、GIF、AVIF 格式' }, { status: 400 });
  }

  const buffer = await file.arrayBuffer();
  if (buffer.byteLength > MAX_BYTES) {
    return Response.json({ error: '圖片不得超過 5 MB' }, { status: 400 });
  }

  const ext = file.name.split('.').pop().toLowerCase().replace(/[^a-z0-9]/g, '') || 'jpg';
  const key = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

  const store = getStore('rosery-images');
  await store.set(key, buffer, { metadata: { contentType: file.type } });

  return Response.json({ url: `/api/images/${key}` });
};

export const config = { path: '/api/upload' };
