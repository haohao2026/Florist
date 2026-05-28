import { getStore } from '@netlify/blobs';

export default async (req) => {
  const store = getStore('rosery-orders');
  const adminPwd = Netlify.env.get('ADMIN_PASSWORD') || 'rosery-admin-2026';
  const isAdmin = req.headers.get('x-admin-password') === adminPwd;

  if (req.method === 'GET') {
    if (!isAdmin) return Response.json({ error: '未授權' }, { status: 401 });
    let orders = [];
    try { orders = await store.get('all', { type: 'json' }) || []; } catch (_) {}
    return Response.json([...orders].reverse());
  }

  if (req.method === 'POST') {
    const body = await req.json();
    let orders = [];
    try { orders = await store.get('all', { type: 'json' }) || []; } catch (_) {}

    const order = {
      id: 'o' + Date.now(),
      createdAt: new Date().toISOString(),
      status: '待確認',
      type: body.type || 'bespoke',
      name: body.name || '',
      contact: body.contact || '',
      budget: body.budget || null,
      palette: body.palette || null,
      date: body.date || null,
      occasion: body.occasion || null,
      note: body.note || '',
      items: body.items || [],
      total: body.total || null,
      address: body.address || '',
    };
    orders.push(order);
    await store.set('all', JSON.stringify(orders));
    return Response.json({ ok: true, id: order.id }, { status: 201 });
  }

  return new Response('Method Not Allowed', { status: 405 });
};

export const config = { path: '/api/orders' };
