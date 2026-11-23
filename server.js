'use strict';

/**
 * Tmall clone backend — zero dependencies, built on Node's http module.
 * Features: accounts + sessions, per-user carts/orders, catalog filters,
 * and image-based "find similar" search with locally stored uploads.
 */

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomBytes, scryptSync, timingSafeEqual } = require('node:crypto');

const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const UPLOAD_DIR = path.join(DATA_DIR, 'uploads');
const STORE_FILE = path.join(DATA_DIR, 'store.json');
const SEED_FILE = path.join(DATA_DIR, 'products.json');
const PORT = Number(process.env.PORT) || 3000;
const SESSION_AGE = 60 * 60 * 24 * 7; // 7 days
const COUPONS = [
  { code: 'WELCOME20', type: 'percent', value: 20, minSubtotal: 100, label: '20% off orders over ¥100' },
  { code: 'SAVE10', type: 'fixed', value: 10, minSubtotal: 50, label: '¥10 off orders over ¥50' },
  { code: 'FREESHIP', type: 'shipping', value: 0, minSubtotal: 0, label: 'Free shipping on any order' },
];
const REWARDS = [
  { id: 'R_SAVE10', cost: 200, code: 'SAVE10', label: '¥10 off coupon' },
  { id: 'R_FREESHIP', cost: 150, code: 'FREESHIP', label: 'Free shipping coupon' },
  { id: 'R_WELCOME20', cost: 500, code: 'WELCOME20', label: '20% off coupon' },
];
const DELIVERY = {
  standard: { label: 'Standard (3–5 days)', fee: 10 },
  express: { label: 'Express (next day)', fee: 25 },
  pickup: { label: 'Store pickup', fee: 0 },
};
const LEGACY_ADMIN_EMAIL = 'admin@tmall.com';
const ORDER_STATUSES = new Set(['Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled']);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
};

/* ---------- storage ---------- */

function loadStore() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  if (fs.existsSync(STORE_FILE)) {
    const saved = JSON.parse(fs.readFileSync(STORE_FILE, 'utf8'));
    // migrate an older single-cart store, if present
    if (!saved.users) {
      saved.users = [];
      saved.sessions = {};
      saved.carts = saved.cart ? { guest: saved.cart } : {};
      saved.visualSearches = [];
      delete saved.cart;
      saved.orders = (saved.orders || []).map((o) => ({ ...o, ownerId: 'guest', ownerName: 'Guest' }));
    }
    saved.wishlists = saved.wishlists || {};
    saved.reviews = saved.reviews || [];
    saved.recentlyViewed = saved.recentlyViewed || {};
    saved.searchHistory = saved.searchHistory || {};
    saved.coupons = saved.coupons || COUPONS;
    saved.addresses = saved.addresses || {};
    saved.points = saved.points || {};
    saved.redemptions = saved.redemptions || {};
    saved.users = saved.users || [];
    configureAdmin(saved);
    return saved;
  }
  const fresh = {
    users: [],
    sessions: {},
    products: JSON.parse(fs.readFileSync(SEED_FILE, 'utf8')),
    carts: {},
    orders: [],
    visualSearches: [],
    wishlists: {},
    reviews: [],
    recentlyViewed: {},
    searchHistory: {},
    coupons: COUPONS,
    addresses: {},
    points: {},
    redemptions: {},
  };
  configureAdmin(fresh);
  fs.writeFileSync(STORE_FILE, JSON.stringify(fresh, null, 2));
  return fresh;
}

function configureAdmin(data) {
  data.users = data.users || [];
  data.sessions = data.sessions || {};
  // Remove the former public development account and invalidate any sessions
  // it left behind in an existing store file.
  const legacy = data.users.find((user) => user.email === LEGACY_ADMIN_EMAIL && user.id === 'u_admin');
  if (legacy) {
    data.users = data.users.filter((user) => user.id !== legacy.id);
    Object.entries(data.sessions).forEach(([token, session]) => {
      if (session.userId === legacy.id) delete data.sessions[token];
    });
  }

  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const password = String(process.env.ADMIN_PASSWORD || '');
  if (!email && !password) return;
  if (!email || !password) throw new Error('Set both ADMIN_EMAIL and ADMIN_PASSWORD to configure an admin account');
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('ADMIN_EMAIL must be a valid email address');
  if (password.length < 12) throw new Error('ADMIN_PASSWORD must be at least 12 characters');

  let admin = data.users.find((user) => user.email === email);
  if (!admin) {
    admin = {
      id: `u_admin_${randomBytes(6).toString('hex')}`,
      name: 'Tmall Admin',
      email,
      createdAt: new Date().toISOString(),
    };
    data.users.push(admin);
  }
  admin.role = 'admin';
  admin.passwordHash = hashPassword(password);
  Object.entries(data.sessions).forEach(([token, session]) => {
    if (session.userId === admin.id) delete data.sessions[token];
  });
}

let store = loadStore();

function saveStore() {
  const temp = `${STORE_FILE}.tmp`;
  fs.writeFileSync(temp, JSON.stringify(store, null, 2));
  fs.renameSync(temp, STORE_FILE);
}

/* ---------- http + auth helpers ---------- */

function json(res, status, payload, headers = {}) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    ...headers,
  });
  res.end(JSON.stringify(payload));
}

function addCookie(res, value) {
  const existing = res.getHeader('Set-Cookie');
  if (!existing) return res.setHeader('Set-Cookie', value);
  res.setHeader('Set-Cookie', Array.isArray(existing) ? [...existing, value] : [existing, value]);
}

function parseCookies(header) {
  return Object.fromEntries(header.split(';').map((part) => {
    const index = part.indexOf('=');
    return index === -1 ? [part.trim(), ''] : [part.slice(0, index).trim(), part.slice(index + 1).trim()];
  }));
}

function context(req, res) {
  const cookies = parseCookies(req.headers.cookie || '');
  const session = store.sessions[cookies.tmall_session];
  const user = session ? store.users.find((u) => u.id === session.userId) : null;
  let guestId = cookies.tmall_guest;
  if (!guestId) {
    guestId = `g_${randomBytes(10).toString('hex')}`;
    addCookie(res, `tmall_guest=${guestId}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}; Max-Age=31536000`);
  }
  return { user, guestId, ownerId: user ? `u_${user.id}` : guestId, session };
}

function publicUser(user) {
  return user ? { id: user.id, name: user.name, email: user.email, role: user.role || 'customer' } : null;
}

function pointsFor(ownerId) {
  if (store.points[ownerId] === undefined) store.points[ownerId] = 0;
  return store.points[ownerId];
}

function addressesFor(ownerId) {
  if (!store.addresses[ownerId]) store.addresses[ownerId] = [];
  return store.addresses[ownerId];
}

function requireAdmin(ctx) {
  return ctx.user?.role === 'admin';
}

function mergeGuestInto(user, ctx) {
  const ownerId = `u_${user.id}`;
  const userCart = getCart(ownerId);
  (store.carts[ctx.guestId] || []).forEach((item) => {
    const line = userCart.find((i) => i.id === item.id);
    const product = store.products.find((p) => p.id === item.id);
    const max = product ? product.stock : item.quantity;
    if (line) line.quantity = Math.min(max, line.quantity + item.quantity);
    else userCart.push({ ...item, quantity: Math.min(max, item.quantity) });
  });
  delete store.carts[ctx.guestId];
  const wishlist = wishlistFor(ownerId);
  (store.wishlists[ctx.guestId] || []).forEach((pid) => { if (!wishlist.includes(pid)) wishlist.push(pid); });
  delete store.wishlists[ctx.guestId];
  const recent = store.recentlyViewed[ownerId] || (store.recentlyViewed[ownerId] = []);
  (store.recentlyViewed[ctx.guestId] || []).forEach((pid) => { if (!recent.includes(pid)) recent.push(pid); });
  delete store.recentlyViewed[ctx.guestId];
  store.orders.forEach((order) => {
    if (order.ownerId === ctx.guestId) { order.ownerId = ownerId; order.ownerName = user.name; }
  });
  store.reviews.forEach((review) => {
    if (review.ownerId === ctx.guestId) { review.ownerId = ownerId; review.ownerName = user.name; }
  });
}

function hashPassword(password) {
  const salt = randomBytes(16).toString('hex');
  return `${salt}:${scryptSync(password, salt, 64).toString('hex')}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = String(stored).split(':');
  if (!salt || !hash) return false;
  const actual = scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 8_000_000) {
        reject(new Error('Payload too large (max 8 MB)'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch { reject(new Error('Invalid JSON body')); }
    });
    req.on('error', reject);
  });
}

/* ---------- domain helpers ---------- */

function getCart(ownerId) {
  if (!store.carts[ownerId]) store.carts[ownerId] = [];
  return store.carts[ownerId];
}

function cartSummary(ownerId) {
  const items = getCart(ownerId);
  return {
    items,
    count: items.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: Number(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2)),
  };
}

function productMatches(p, url) {
  const term = (url.searchParams.get('search') || '').trim().toLowerCase();
  const category = (url.searchParams.get('category') || '').toLowerCase();
  const origin = (url.searchParams.get('origin') || '').toLowerCase();
  const brand = (url.searchParams.get('brand') || '').toLowerCase();
  const globalOnly = url.searchParams.get('global') === 'true';
  const filter = url.searchParams.get('filter') || 'all';

  if (term && !`${p.name} ${p.tag} ${p.brand} ${p.origin}`.toLowerCase().includes(term)) return false;
  if (category && p.tag.toLowerCase() !== category) return false;
  if (origin && p.origin.toLowerCase() !== origin) return false;
  if (brand && p.brand.toLowerCase() !== brand) return false;
  if (globalOnly && !p.global) return false;
  if (filter === 'low' && p.price >= 50) return false;
  if (filter === 'mid' && (p.price < 50 || p.price >= 100)) return false;
  if (filter === 'new' && !p.new) return false;
  return true;
}

function facets() {
  return {
    categories: [...new Set(store.products.map((p) => p.tag))].sort(),
    origins: [...new Set(store.products.map((p) => p.origin))].sort(),
    brands: [...new Set(store.products.map((p) => p.brand))].sort(),
  };
}

function sortProducts(products, sort) {
  const copy = [...products];
  if (sort === 'price_asc') return copy.sort((a, b) => a.price - b.price);
  if (sort === 'price_desc') return copy.sort((a, b) => b.price - a.price);
  if (sort === 'newest') return copy.sort((a, b) => Number(b.new) - Number(a.new));
  return copy;
}

/* ---------- reviews, wishlist, recommendations, coupons ---------- */

function reviewStats(productId) {
  const reviews = store.reviews.filter((r) => r.productId === Number(productId));
  return {
    rating: reviews.length ? Number((reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)) : 0,
    reviewCount: reviews.length,
  };
}

function decorate(product) {
  return { ...product, ...reviewStats(product.id) };
}

function wishlistFor(ownerId) {
  if (!store.wishlists[ownerId]) store.wishlists[ownerId] = [];
  return store.wishlists[ownerId];
}

function recommend(ownerId, limit = 8) {
  const cart = (store.carts[ownerId] || []).map((item) => item.id);
  const wishlist = wishlistFor(ownerId);
  const ordered = store.orders.filter((order) => order.ownerId === ownerId).flatMap((order) => order.items.map((item) => item.id));
  const recent = store.recentlyViewed[ownerId] || [];
  const interestIds = [...recent, ...wishlist, ...cart, ...ordered];
  const interests = interestIds.map((pid) => store.products.find((p) => p.id === pid)).filter(Boolean);
  const categories = new Set(interests.map((p) => p.tag));
  const origins = new Set(interests.map((p) => p.origin));
  const palette = interests.flatMap((p) => p.colors || []);
  const exclude = new Set(interestIds);

  const scored = store.products.filter((p) => !exclude.has(p.id)).map((p) => {
    let score = p.new ? 4 : 0;
    if (categories.has(p.tag)) score += 10;
    if (origins.has(p.origin)) score += 4;
    if (palette.length && (p.colors || []).some((c) => palette.some((ic) => colorDistance(c, ic) < 60))) score += 5;
    score += reviewStats(p.id).rating / 2;
    return {
      ...decorate(p),
      score: Number(score.toFixed(1)),
      reason: categories.has(p.tag) ? "Because of what you've been browsing" : p.new ? 'New arrival' : 'Popular pick',
    };
  });
  return scored.sort((a, b) => b.score - a.score).slice(0, limit);
}

function couponFor(code, subtotal) {
  const coupon = store.coupons.find((c) => c.code === String(code || '').trim().toUpperCase());
  if (!coupon) return { valid: false, error: 'That coupon code was not recognised' };
  if (subtotal < coupon.minSubtotal) return { valid: false, error: `Spend ¥${coupon.minSubtotal.toFixed(2)} or more to use ${coupon.code}` };
  const raw = coupon.type === 'percent' ? subtotal * coupon.value / 100 : coupon.type === 'fixed' ? coupon.value : 0;
  return { valid: true, coupon, discount: Number(Math.min(subtotal, raw).toFixed(2)) };
}

/* ---------- visual search helpers ---------- */

function hexToRgb(hex) {
  const value = String(hex).replace('#', '');
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) || 0);
}

function colorDistance(a, b) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return Math.sqrt(0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db);
}

function matchScore(imagePalette, productColors, category, product) {
  const palette = imagePalette?.length ? imagePalette : ['#cccccc'];
  const distances = palette.map((color) => Math.min(...(product.colors || ['#cccccc']).map((pc) => colorDistance(color, pc))));
  const average = distances.reduce((sum, d) => sum + d, 0) / distances.length;
  let score = Math.max(5, Math.round(100 - average / 2.2));
  if (category && product.tag.toLowerCase() === category.toLowerCase()) score += 8;
  return Math.min(99, score);
}

/* ---------- API ---------- */

async function handleApi(req, res, url) {
  const [, resource, rawId, sub] = url.pathname.split('/').filter(Boolean);
  const id = rawId ? Number(rawId) : null;
  const method = req.method;
  const ctx = context(req, res);

  if (method === 'OPTIONS') return json(res, 204, {});

  /* ---- authentication ---- */

  if (resource === 'auth' && method === 'GET') {
    return json(res, 200, { user: publicUser(ctx.user) });
  }

  if (resource === 'auth' && rawId === 'register' && method === 'POST') {
    const { name, email, password } = await readBody(req);
    const cleanName = String(name || '').trim();
    const cleanEmail = String(email || '').trim().toLowerCase();
    if (cleanName.length < 2 || cleanName.length > 40) return json(res, 400, { error: 'Name must be 2–40 characters' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) return json(res, 400, { error: 'Enter a valid email address' });
    if (String(password || '').length < 6) return json(res, 400, { error: 'Password must be at least 6 characters' });
    if (store.users.some((u) => u.email === cleanEmail)) return json(res, 409, { error: 'An account with that email already exists' });

    const user = {
      id: `u_${Date.now().toString(36)}_${randomBytes(3).toString('hex')}`,
      name: cleanName,
      email: cleanEmail,
      passwordHash: hashPassword(String(password)),
      createdAt: new Date().toISOString(),
    };
    store.users.push(user);
    mergeGuestInto(user, ctx);
    const token = randomBytes(24).toString('hex');
    store.sessions[token] = { userId: user.id, createdAt: new Date().toISOString() };
    saveStore();
    addCookie(res, `tmall_session=${token}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}; Max-Age=${SESSION_AGE}`);
    return json(res, 201, { user: publicUser(user) });
  }

  if (resource === 'auth' && rawId === 'login' && method === 'POST') {
    const { email, password } = await readBody(req);
    const user = store.users.find((u) => u.email === String(email || '').trim().toLowerCase());
    if (!user || !verifyPassword(String(password || ''), user.passwordHash)) {
      return json(res, 401, { error: 'Incorrect email or password' });
    }
    const token = randomBytes(24).toString('hex');
    store.sessions[token] = { userId: user.id, createdAt: new Date().toISOString() };

    mergeGuestInto(user, ctx);
    saveStore();
    addCookie(res, `tmall_session=${token}; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}; Max-Age=${SESSION_AGE}`);
    return json(res, 200, { user: publicUser(user), cart: getCart(`u_${user.id}`).length });
  }

  if (resource === 'auth' && rawId === 'logout' && method === 'POST') {
    if (ctx.session) delete store.sessions[Object.keys(store.sessions).find((key) => store.sessions[key] === ctx.session)];
    saveStore();
    addCookie(res, `tmall_session=; Path=/; HttpOnly; SameSite=Lax${process.env.NODE_ENV === 'production' ? '; Secure' : ''}; Max-Age=0`);
    return json(res, 200, { ok: true });
  }

  /* ---- products ---- */

  if (resource === 'products' && id === null && method === 'GET') {
    const products = sortProducts(store.products.filter((p) => productMatches(p, url)), url.searchParams.get('sort')).map(decorate);
    return json(res, 200, { products, count: products.length, facets: facets() });
  }

  if (resource === 'products' && id !== null && !sub && method === 'GET') {
    const product = store.products.find((p) => p.id === id);
    return product ? json(res, 200, decorate(product)) : json(res, 404, { error: 'Product not found' });
  }

  /* ---- cart ---- */

  if (resource === 'cart' && id === null && method === 'GET') {
    return json(res, 200, cartSummary(ctx.ownerId));
  }

  if (resource === 'cart' && id === null && method === 'POST') {
    const body = await readBody(req);
    const product = store.products.find((p) => p.id === Number(body.id));
    if (!product) return json(res, 404, { error: 'Product not found' });
    const quantity = Math.max(1, Math.min(99, Number(body.quantity) || 1));
    const cart = getCart(ctx.ownerId);
    const line = cart.find((item) => item.id === product.id);
    const next = (line ? line.quantity : 0) + quantity;
    if (next > product.stock) return json(res, 400, { error: `Only ${product.stock} left in stock` });
    if (line) line.quantity = next;
    else cart.push({ id: product.id, name: product.name, price: product.price, img: product.img, tag: product.tag, quantity: next });
    saveStore();
    return json(res, 200, cartSummary(ctx.ownerId));
  }

  if (resource === 'cart' && id !== null && (method === 'PUT' || method === 'PATCH')) {
    const body = await readBody(req);
    const cart = getCart(ctx.ownerId);
    const line = cart.find((item) => item.id === id);
    if (!line) return json(res, 404, { error: 'Cart item not found' });
    const quantity = Number(body.quantity);
    if (!Number.isInteger(quantity) || quantity < 0) return json(res, 400, { error: 'Quantity must be a whole number' });
    if (quantity === 0) store.carts[ctx.ownerId] = cart.filter((item) => item.id !== id);
    else {
      const product = store.products.find((p) => p.id === id);
      if (quantity > (product?.stock ?? quantity)) return json(res, 400, { error: `Only ${product.stock} left in stock` });
      line.quantity = quantity;
    }
    saveStore();
    return json(res, 200, cartSummary(ctx.ownerId));
  }

  if (resource === 'cart' && id !== null && method === 'DELETE') {
    const cart = getCart(ctx.ownerId);
    const before = cart.length;
    store.carts[ctx.ownerId] = cart.filter((item) => item.id !== id);
    if (store.carts[ctx.ownerId].length === before) return json(res, 404, { error: 'Cart item not found' });
    saveStore();
    return json(res, 200, cartSummary(ctx.ownerId));
  }

  /* ---- checkout + orders ---- */

  /* ---- admin order and inventory management ---- */

  if (resource === 'admin' && rawId === 'orders' && method === 'GET') {
    if (!requireAdmin(ctx)) return json(res, ctx.user ? 403 : 401, { error: 'Admin access required' });
    const requestedLimit = Number(url.searchParams.get('limit')) || 50;
    const limit = Math.max(1, Math.min(100, requestedLimit));
    const status = url.searchParams.get('status');
    const orders = store.orders.filter((order) => !status || order.status === status).slice(0, limit);
    return json(res, 200, { orders, count: orders.length });
  }

  if (resource === 'admin' && rawId === 'orders' && sub && method === 'PATCH') {
    if (!requireAdmin(ctx)) return json(res, ctx.user ? 403 : 401, { error: 'Admin access required' });
    const body = await readBody(req);
    const status = String(body.status || '');
    if (!ORDER_STATUSES.has(status)) {
      return json(res, 400, { error: `Status must be one of: ${[...ORDER_STATUSES].join(', ')}` });
    }
    const order = store.orders.find((candidate) => candidate.id === sub);
    if (!order) return json(res, 404, { error: 'Order not found' });
    order.status = status;
    saveStore();
    return json(res, 200, order);
  }

  if (resource === 'admin' && rawId === 'products' && sub && method === 'PATCH') {
    if (!requireAdmin(ctx)) return json(res, ctx.user ? 403 : 401, { error: 'Admin access required' });
    const productId = Number(sub);
    const product = store.products.find((candidate) => candidate.id === productId);
    if (!product) return json(res, 404, { error: 'Product not found' });
    const body = await readBody(req);
    if (!Number.isSafeInteger(body.stock) || body.stock < 0 || body.stock > 1_000_000) {
      return json(res, 400, { error: 'Stock must be a whole number from 0 to 1,000,000' });
    }
    product.stock = body.stock;
    saveStore();
    return json(res, 200, { product });
  }

  if (resource === 'checkout' && method === 'POST') {
    const body = await readBody(req);
    const cart = getCart(ctx.ownerId);
    if (!cart.length) return json(res, 400, { error: 'Your cart is empty' });
    for (const item of cart) {
      const product = store.products.find((candidate) => candidate.id === item.id);
      if (!product || item.quantity > product.stock) {
        return json(res, 400, { error: `${product?.name || 'An item'} no longer has enough stock` });
      }
    }
    const items = cart.map((item) => ({ ...item }));
    const subtotal = Number(items.reduce((sum, item) => sum + item.price * item.quantity, 0).toFixed(2));
    let discount = 0;
    let coupon = null;
    if (body.code) {
      const check = couponFor(body.code, subtotal);
      if (!check.valid) return json(res, 400, { error: check.error });
      coupon = check.coupon.code;
      discount = check.discount;
    }
    const deliveryKey = DELIVERY[body.delivery] ? body.delivery : 'standard';
    const deliveryFee = deliveryKey === 'standard' ? (subtotal >= 200 ? 0 : DELIVERY.standard.fee) : DELIVERY[deliveryKey].fee;
    const shipping = coupon === 'FREESHIP' ? 0 : deliveryFee;
    const savedAddress = body.addressId ? addressesFor(ctx.ownerId).find((a) => a.id === Number(body.addressId)) : null;
    const address = savedAddress || {
      name: String(body.address?.name || ctx.user?.name || 'Guest'),
      phone: String(body.address?.phone || ''),
      line1: String(body.address?.line1 || 'Address provided at checkout'),
      city: String(body.address?.city || ''),
    };
    const total = Number((subtotal - discount + shipping).toFixed(2));
    const pointsEarned = Math.floor(total);
    pointsFor(ctx.ownerId);
    store.points[ctx.ownerId] += pointsEarned;

    const order = {
      id: `TM${Date.now().toString(36).toUpperCase()}`,
      ownerId: ctx.ownerId,
      ownerName: ctx.user?.name || 'Guest',
      createdAt: new Date().toISOString(),
      items,
      subtotal,
      coupon,
      discount,
      shippingAddress: address,
      delivery: { key: deliveryKey, label: DELIVERY[deliveryKey].label, fee: shipping },
      payment: String(body.payment || 'Card'),
      pointsEarned,
      shipping,
      total,
      status: 'Confirmed',
    };
    items.forEach((item) => {
      const product = store.products.find((p) => p.id === item.id);
      if (product) product.stock = Math.max(0, product.stock - item.quantity);
    });
    store.orders.unshift(order);
    store.carts[ctx.ownerId] = [];
    saveStore();
    return json(res, 201, order);
  }

  if (resource === 'orders' && method === 'GET') {
    const orders = store.orders.filter((order) => order.ownerId === ctx.ownerId);
    if (id !== null) {
      const order = orders.find((o) => o.id === id);
      return order ? json(res, 200, order) : json(res, 404, { error: 'Order not found' });
    }
    return json(res, 200, { orders, count: orders.length });
  }

  /* ---- visual search ---- */

  if (resource === 'visual-search' && method === 'POST') {
    const body = await readBody(req);
    const dataUrl = String(body.image || '');
    const match = dataUrl.match(/^data:image\/(png|jpeg|webp);base64,([A-Za-z0-9+/=]+)$/);
    if (!match) return json(res, 400, { error: 'Please upload a PNG, JPG or WebP image' });
    const buffer = Buffer.from(match[2], 'base64');
    if (!buffer.length || buffer.length > 5_000_000) return json(res, 400, { error: 'Image must be under 5 MB' });

    const extension = match[1] === 'jpeg' ? 'jpg' : match[1];
    const filename = `${Date.now().toString(36)}-${randomBytes(6).toString('hex')}.${extension}`;
    fs.writeFileSync(path.join(UPLOAD_DIR, filename), buffer);

    const palette = Array.isArray(body.palette) ? body.palette.slice(0, 5).map(String) : [];
    const category = String(body.category || '');
    const matches = store.products
      .map((p) => ({ ...p, score: matchScore(palette, p.colors, category, p) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 8)
      .map(({ score, ...product }) => ({ score, ...product }));

    const search = {
      id: `VS${Date.now().toString(36).toUpperCase()}`,
      ownerId: ctx.ownerId,
      createdAt: new Date().toISOString(),
      imageUrl: `/uploads/${filename}`,
      palette,
      category,
      matches,
    };
    store.visualSearches.unshift(search);
    saveStore();
    return json(res, 201, search);
  }

  if (resource === 'visual-searches' && method === 'GET') {
    return json(res, 200, { searches: store.visualSearches.filter((s) => s.ownerId === ctx.ownerId).slice(0, 10) });
  }

  /* ---- wishlist ---- */

  if (resource === 'wishlist' && method === 'GET') {
    const ids = wishlistFor(ctx.ownerId);
    return json(res, 200, {
      ids,
      count: ids.length,
      products: ids.map((pid) => store.products.find((p) => p.id === pid)).filter(Boolean).map(decorate),
    });
  }

  if (resource === 'wishlist' && method === 'POST') {
    const body = await readBody(req);
    const product = store.products.find((p) => p.id === Number(body.id));
    if (!product) return json(res, 404, { error: 'Product not found' });
    const ids = wishlistFor(ctx.ownerId);
    const index = ids.indexOf(product.id);
    if (index === -1) ids.push(product.id); else ids.splice(index, 1);
    saveStore();
    return json(res, 200, { saved: index === -1, count: ids.length, ids });
  }

  if (resource === 'wishlist' && id !== null && method === 'DELETE') {
    store.wishlists[ctx.ownerId] = wishlistFor(ctx.ownerId).filter((pid) => pid !== id);
    saveStore();
    return json(res, 200, { ids: store.wishlists[ctx.ownerId], count: store.wishlists[ctx.ownerId].length });
  }

  /* ---- recently viewed ---- */

  if (resource === 'recently-viewed' && method === 'GET') {
    const ids = (store.recentlyViewed[ctx.ownerId] || []).slice(0, 12);
    return json(res, 200, {
      products: ids.map((pid) => store.products.find((p) => p.id === pid)).filter(Boolean).map(decorate),
    });
  }

  if (resource === 'recently-viewed' && method === 'POST') {
    const body = await readBody(req);
    const pid = Number(body.id);
    if (!store.products.some((p) => p.id === pid)) return json(res, 404, { error: 'Product not found' });
    const ids = store.recentlyViewed[ctx.ownerId] || (store.recentlyViewed[ctx.ownerId] = []);
    const index = ids.indexOf(pid);
    if (index !== -1) ids.splice(index, 1);
    ids.unshift(pid);
    store.recentlyViewed[ctx.ownerId] = ids.slice(0, 12);
    saveStore();
    return json(res, 200, { ids: store.recentlyViewed[ctx.ownerId] });
  }

  /* ---- recommendations ---- */

  if (resource === 'recommendations' && method === 'GET') {
    const limit = Math.min(20, Number(url.searchParams.get('limit')) || 8);
    return json(res, 200, { products: recommend(ctx.ownerId, limit) });
  }

  /* ---- reviews ---- */

  if (resource === 'products' && id !== null && sub === 'reviews' && method === 'GET') {
    if (!store.products.some((p) => p.id === id)) return json(res, 404, { error: 'Product not found' });
    const reviews = store.reviews
      .filter((r) => r.productId === id)
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return json(res, 200, { reviews, ...reviewStats(id) });
  }

  if (resource === 'products' && id !== null && sub === 'reviews' && method === 'POST') {
    if (!ctx.user) return json(res, 401, { error: 'Sign in to write a review' });
    const body = await readBody(req);
    const rating = Number(body.rating);
    const title = String(body.title || '').trim().slice(0, 80);
    const text = String(body.body || '').trim().slice(0, 600);
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return json(res, 400, { error: 'Choose a rating from 1 to 5 stars' });
    if (!text) return json(res, 400, { error: 'Please write a short review' });
    const verified = store.orders.some((order) => order.ownerId === ctx.ownerId && order.items.some((item) => item.id === id));
    const review = {
      id: `R${Date.now().toString(36).toUpperCase()}`,
      productId: id,
      ownerId: ctx.ownerId,
      ownerName: ctx.user.name,
      rating,
      title,
      body: text,
      verified,
      createdAt: new Date().toISOString(),
    };
    store.reviews.unshift(review);
    saveStore();
    return json(res, 201, review);
  }

  /* ---- coupons ---- */

  if (resource === 'coupons' && method === 'GET') {
    return json(res, 200, { coupons: store.coupons });
  }

  if (resource === 'coupons' && rawId === 'validate' && method === 'POST') {
    const body = await readBody(req);
    return json(res, 200, couponFor(body.code, Number(body.subtotal) || 0));
  }

  /* ---- search suggestions + profile ---- */

  if (resource === 'suggestions' && method === 'GET') {
    const query = (url.searchParams.get('q') || '').trim().toLowerCase();
    const terms = new Set();
    store.products.forEach((p) => {
      [p.name, p.tag, p.brand, p.origin].forEach((value) => {
        if (!query || value.toLowerCase().includes(query)) terms.add(value);
      });
    });
    if (query.length >= 2) {
      const history = store.searchHistory[ctx.ownerId] || (store.searchHistory[ctx.ownerId] = []);
      history.unshift({ term: query, createdAt: new Date().toISOString() });
      store.searchHistory[ctx.ownerId] = history.slice(0, 20);
    }
    const counts = Object.values(store.searchHistory).flat().reduce((acc, entry) => {
      acc[entry.term] = (acc[entry.term] || 0) + 1;
      return acc;
    }, {});
    const trending = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([term]) => ({ term, trending: true }));
    saveStore();
    return json(res, 200, { suggestions: [...terms].slice(0, 8).map((term) => ({ term })), trending });
  }

  if (resource === 'profile' && method === 'GET') {
    const orders = store.orders.filter((order) => order.ownerId === ctx.ownerId);
    const reviews = store.reviews.filter((review) => review.ownerId === ctx.ownerId);
    return json(res, 200, {
      user: publicUser(ctx.user),
      stats: {
        orders: orders.length,
        spent: Number(orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)),
        reviews: reviews.length,
        wishlist: wishlistFor(ctx.ownerId).length,
        visualSearches: store.visualSearches.filter((s) => s.ownerId === ctx.ownerId).length,
        points: pointsFor(ctx.ownerId),
        addresses: addressesFor(ctx.ownerId).length,
      },
      reviews,
    });
  }

  /* ---- addresses ---- */

  if (resource === 'addresses' && method === 'GET') {
    const addresses = addressesFor(ctx.ownerId);
    return json(res, 200, {
      addresses,
      defaultId: addresses.find((a) => a.isDefault)?.id || addresses[0]?.id || null,
    });
  }

  if (resource === 'addresses' && method === 'POST') {
    const body = await readBody(req);
    const address = {
      id: Date.now(),
      name: String(body.name || '').trim(),
      phone: String(body.phone || '').trim(),
      line1: String(body.line1 || '').trim(),
      line2: String(body.line2 || '').trim(),
      city: String(body.city || '').trim(),
      region: String(body.region || '').trim(),
      postal: String(body.postal || '').trim(),
      isDefault: Boolean(body.isDefault),
    };
    if (!address.name || !address.phone || !address.line1) {
      return json(res, 400, { error: 'Name, phone and street address are required' });
    }
    const addresses = addressesFor(ctx.ownerId);
    if (address.isDefault || !addresses.length) addresses.forEach((a) => { a.isDefault = false; });
    if (!addresses.length) address.isDefault = true;
    addresses.push(address);
    saveStore();
    return json(res, 201, address);
  }

  if (resource === 'addresses' && id !== null && method === 'PUT') {
    const address = addressesFor(ctx.ownerId).find((a) => a.id === id);
    if (!address) return json(res, 404, { error: 'Address not found' });
    const body = await readBody(req);
    ['name', 'phone', 'line1', 'line2', 'city', 'region', 'postal'].forEach((key) => {
      if (body[key] !== undefined) address[key] = String(body[key]).trim();
    });
    if (body.isDefault) addressesFor(ctx.ownerId).forEach((a) => { a.isDefault = a.id === id; });
    saveStore();
    return json(res, 200, address);
  }

  if (resource === 'addresses' && id !== null && method === 'DELETE') {
    const addresses = addressesFor(ctx.ownerId);
    const before = addresses.length;
    store.addresses[ctx.ownerId] = addresses.filter((a) => a.id !== id);
    if (store.addresses[ctx.ownerId].length === before) return json(res, 404, { error: 'Address not found' });
    if (!store.addresses[ctx.ownerId].some((a) => a.isDefault) && store.addresses[ctx.ownerId].length) {
      store.addresses[ctx.ownerId][0].isDefault = true;
    }
    saveStore();
    return json(res, 200, { addresses: store.addresses[ctx.ownerId] });
  }

  /* ---- loyalty points ---- */

  if (resource === 'rewards' && method === 'GET') {
    return json(res, 200, {
      points: pointsFor(ctx.ownerId),
      rewards: REWARDS,
      redeemed: store.redemptions[ctx.ownerId] || [],
    });
  }

  if (resource === 'rewards' && rawId === 'redeem' && method === 'POST') {
    if (!ctx.user) return json(res, 401, { error: 'Sign in to redeem points' });
    const body = await readBody(req);
    const reward = REWARDS.find((r) => r.id === body.rewardId);
    if (!reward) return json(res, 404, { error: 'Reward not found' });
    if (pointsFor(ctx.ownerId) < reward.cost) {
      return json(res, 400, { error: `You need ${reward.cost} points — you have ${pointsFor(ctx.ownerId)}` });
    }
    store.points[ctx.ownerId] -= reward.cost;
    const redeemed = store.redemptions[ctx.ownerId] || (store.redemptions[ctx.ownerId] = []);
    redeemed.unshift({ id: reward.id, code: reward.code, label: reward.label, createdAt: new Date().toISOString() });
    if (!store.coupons.some((c) => c.code === reward.code)) {
      store.coupons.push(COUPONS.find((c) => c.code === reward.code));
    }
    saveStore();
    return json(res, 200, { code: reward.code, points: store.points[ctx.ownerId] });
  }

  /* ---- admin dashboard ---- */

  if (resource === 'admin' && !requireAdmin(ctx)) {
    return json(res, 403, { error: 'Admin access required' });
  }

  if (resource === 'admin' && rawId === 'stats' && method === 'GET') {
    const revenue = Number(store.orders.reduce((sum, o) => sum + o.total, 0).toFixed(2));
    const rated = store.products.map(decorate).filter((p) => p.reviewCount);
    const avgRating = rated.length ? Number((rated.reduce((sum, p) => sum + p.rating, 0) / rated.length).toFixed(1)) : 0;
    return json(res, 200, {
      users: store.users.length,
      orders: store.orders.length,
      revenue,
      products: store.products.length,
      lowStock: store.products.filter((p) => p.stock < 10).length,
      reviews: store.reviews.length,
      avgRating,
      recentOrders: store.orders.slice(0, 6),
      topProducts: rated.sort((a, b) => b.rating - a.rating).slice(0, 5),
    });
  }

  if (resource === 'admin' && rawId === 'products' && method === 'GET') {
    return json(res, 200, { products: store.products.map(decorate) });
  }

  if (resource === 'admin' && rawId === 'products' && method === 'POST') {
    const body = await readBody(req);
    const name = String(body.name || '').trim();
    const price = Number(body.price);
    if (!name || !Number.isFinite(price) || price < 0) {
      return json(res, 400, { error: 'A name and a valid price are required' });
    }
    const product = {
      id: Math.max(0, ...store.products.map((p) => p.id)) + 1,
      name,
      price,
      tag: String(body.tag || 'General'),
      origin: String(body.origin || 'China'),
      brand: String(body.brand || 'Tmall'),
      stock: Math.max(0, Number(body.stock) || 0),
      new: Boolean(body.new),
      global: Boolean(body.global),
      colors: Array.isArray(body.colors) && body.colors.length ? body.colors.slice(0, 3).map(String) : ['#cccccc'],
      description: String(body.description || 'A quality pick from Tmall.'),
      img: String(body.img || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=460&h=460&fit=crop'),
    };
    store.products.unshift(product);
    saveStore();
    return json(res, 201, decorate(product));
  }

  if (resource === 'admin' && rawId === 'products' && sub && (method === 'PUT' || method === 'DELETE')) {
    const targetId = Number(sub);
    const index = store.products.findIndex((p) => p.id === targetId);
    if (index === -1) return json(res, 404, { error: 'Product not found' });
    if (method === 'DELETE') {
      store.products.splice(index, 1);
      saveStore();
      return json(res, 200, { ok: true });
    }
    const body = await readBody(req);
    ['name', 'tag', 'origin', 'brand', 'description', 'img'].forEach((key) => {
      if (body[key] !== undefined) store.products[index][key] = String(body[key]);
    });
    if (body.price !== undefined) store.products[index].price = Math.max(0, Number(body.price) || 0);
    if (body.stock !== undefined) store.products[index].stock = Math.max(0, Number(body.stock) || 0);
    if (body.new !== undefined) store.products[index].new = Boolean(body.new);
    if (body.global !== undefined) store.products[index].global = Boolean(body.global);
    if (Array.isArray(body.colors)) store.products[index].colors = body.colors.slice(0, 3).map(String);
    saveStore();
    return json(res, 200, decorate(store.products[index]));
  }

  if (resource === 'admin' && rawId === 'orders' && method === 'GET') {
    return json(res, 200, { orders: store.orders });
  }

  if (resource === 'admin' && rawId === 'orders' && sub && method === 'PUT') {
    const order = store.orders.find((o) => o.id === sub);
    if (!order) return json(res, 404, { error: 'Order not found' });
    const body = await readBody(req);
    const status = String(body.status || '').trim();
    if (!ORDER_STATUSES.has(status)) {
      return json(res, 400, { error: `Status must be one of: ${[...ORDER_STATUSES].join(', ')}` });
    }
    order.status = status;
    saveStore();
    return json(res, 200, order);
  }

  if (resource === 'admin' && rawId === 'users' && method === 'GET') {
    const users = store.users.map((user) => {
      const ownerId = `u_${user.id}`;
      const orders = store.orders.filter((o) => o.ownerId === ownerId);
      return {
        ...publicUser(user),
        joined: user.createdAt,
        orders: orders.length,
        spent: Number(orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)),
        points: store.points[ownerId] || 0,
      };
    });
    return json(res, 200, { users });
  }

  if (resource === 'legal' && method === 'GET') {
    return json(res, 200, {
      disclaimer: 'Tmall™ is a registered trademark of Tmall Holdings Limited. This online shopping platform is operated by Tmall International Limited. All products and brands depicted are trademarks or registered trademarks of their respective owners. Use of this website constitutes acceptance of our Terms of Service and Privacy Policy.',
      effectiveDate: new Date().toLocaleDateString()
    });
  }

  return json(res, 404, { error: 'Endpoint not found' });
}

/* ---------- static files ---------- */

function serveStatic(req, res, url) {
  let pathname;
  try { pathname = decodeURIComponent(url.pathname); }
  catch { res.writeHead(400).end('Bad request'); return; }
  if (pathname === '/') {
    res.writeHead(302, { Location: '/src/index.html' }).end();
    return;
  }

  const isUpload = pathname.startsWith('/uploads/');
  const base = isUpload ? UPLOAD_DIR : ROOT;
  const relative = isUpload ? pathname.slice('/uploads/'.length) : `.${pathname}`;
  const filePath = path.resolve(base, relative);

  if (filePath !== base && !filePath.startsWith(base + path.sep)) {
    res.writeHead(403).end('Forbidden');
    return;
  }
  if (!isUpload) {
    const rel = path.relative(ROOT, filePath);
    if (rel.startsWith('data') || rel.startsWith('.git') || rel === 'server.js') {
      res.writeHead(403).end('Forbidden');
      return;
    }
  }

  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }).end('Not found');
      return;
    }
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(filePath).toLowerCase()] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

/* ---------- server ---------- */

const server = http.createServer((req, res) => {
  // Enhanced security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  res.setHeader('Content-Security-Policy', "default-src 'self'; script-src 'self' 'strict-dynamic'; style-src 'self' 'unsafe-inline'; img-src 'self' https: data:; connect-src 'self'; font-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'; upgrade-insecure-requests");
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) {
    handleApi(req, res, url).catch((error) => json(res, 400, { error: error.message }));
  } else if (req.method === 'GET' || req.method === 'HEAD') {
    serveStatic(req, res, url);
  } else {
    json(res, 405, { error: 'Method not allowed' });
  }
});

server.listen(PORT, () => {
  console.log(`Tmall clone running at http://localhost:${PORT}`);
});
