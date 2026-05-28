import { getStore } from '@netlify/blobs';

const DEFAULT_PRODUCTS = [
  { id: 'p1', name: '春朝・粉牡丹', desc: '粉牡丹 · 銀蓮花 · 尤加利',  price: 1880, img: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?w=900&q=80', tag: 'New' },
  { id: 'p2', name: '夜遊・絨玫瑰', desc: '深紅大衛奧斯汀玫瑰',        price: 2450, img: 'https://images.unsplash.com/photo-1487530811176-3780de880c2d?w=900&q=80', tag: null },
  { id: 'p3', name: '田野・野薔薇', desc: '英式庭園混搭 · 季節綠葉',    price: 1680, img: 'https://images.unsplash.com/photo-1508610048659-a06b669e3321?w=900&q=80', tag: null },
  { id: 'p4', name: '初雪・白繡球', desc: '白繡球 · 蝴蝶蘭 · 滿天星',   price: 2280, img: 'https://images.unsplash.com/photo-1494972308805-463bc619d34e?w=900&q=80', tag: 'Bestseller' },
  { id: 'p5', name: '薄霧・鬱金香', desc: '法式鬱金香十二支',           price: 1280, img: 'https://images.unsplash.com/photo-1469259943454-aa100abba749?w=900&q=80', tag: null },
  { id: 'p6', name: '森居・小綠植', desc: '尤加利 · 蕨類 · 銀葉菊',     price: 980,  img: 'https://images.unsplash.com/photo-1518895949257-7621c3c786d7?w=900&q=80', tag: null },
];

export default async (req) => {
  const store = getStore('rosery-products');
  const url = new URL(req.url);
  const id = url.searchParams.get('id');
  const adminPwd = Netlify.env.get('ADMIN_PASSWORD') || 'rosery-admin-2026';
  const isAdmin = req.headers.get('x-admin-password') === adminPwd;

  if (req.method === 'GET') {
    let products = null;
    try { products = await store.get('all', { type: 'json' }); } catch (_) {}
    return Response.json(products?.length ? products : DEFAULT_PRODUCTS);
  }

  if (!isAdmin) {
    return Response.json({ error: '未授權' }, { status: 401 });
  }

  if (req.method === 'POST') {
    const body = await req.json();
    let products = [];
    try { products = await store.get('all', { type: 'json' }) || []; } catch (_) {}
    if (!products.length) products = [...DEFAULT_PRODUCTS];

    const product = {
      id: 'p' + Date.now(),
      name: body.name,
      desc: body.desc || '',
      price: Number(body.price),
      img: body.img || '',
      tag: body.tag || null,
    };
    products.push(product);
    await store.set('all', JSON.stringify(products));
    return Response.json(product, { status: 201 });
  }

  if (req.method === 'DELETE' && id) {
    let products = [];
    try { products = await store.get('all', { type: 'json' }) || []; } catch (_) {}
    if (!products.length) products = [...DEFAULT_PRODUCTS];
    products = products.filter(p => p.id !== id);
    await store.set('all', JSON.stringify(products));
    return Response.json({ ok: true });
  }

  return new Response('Method Not Allowed', { status: 405 });
};

export const config = { path: '/api/products' };
