/* Tmall clone — frontend logic.
   Uses the REST API when served by server.js; falls back to local data and
   localStorage when opened directly as a file. */

/* ---------------- local fallback data ---------------- */

const fallbackProducts = [
  { id: 1, name: "Roller eraser for elementary school", price: 2.5, tag: "Stationery", origin: "China", brand: "M&G", stock: 15, new: false, global: false, colors: ["#f5b7c4", "#ffe3ec", "#8fd3d1"], description: "A fun, clean roller eraser that lifts marks without tearing paper.", img: "https://img.alicdn.com/bao/uploaded/i2/3862696800/O1CN01rO2CJd206S8AoMDgS_!!0-item_pic.jpg_460x460q90.jpg_.webp" },
  { id: 2, name: "Anti-Myopia stitched notebook", price: 5.05, tag: "Stationery", origin: "China", brand: "Deli", stock: 52, new: false, global: false, colors: ["#c9a227", "#f0e0b0", "#8b5a2b"], description: "Eye-friendly pages with durable stitched binding.", img: "https://img.alicdn.com/bao/uploaded/i3/2124153145/O1CN012bmdJF1Z6SiIMEv0x_!!4611686018427380025-0-item_pic.jpg_460x460q90.jpg_.webp" },
  { id: 3, name: "GT2 watch charger cable", price: 55.25, tag: "Electronics", origin: "China", brand: "Huawei", stock: 8, new: true, global: false, colors: ["#2b2b2b", "#4a90d9", "#e0e0e0"], description: "A snug magnetic charger made for GT2 smartwatches.", img: "https://img.alicdn.com/bao/uploaded/i4/2219543796828/O1CN01RThleO20JHQlwT67O_!!4611686018427386972-0-item_pic.jpg_460x460q90.jpg_.webp" },
  { id: 4, name: "Phone holder with ring buckle", price: 7.79, tag: "Electronics", origin: "China", brand: "Baseus", stock: 27, new: false, global: false, colors: ["#e74c3c", "#2c3e50", "#f1c40f"], description: "A sticky ring grip and stand in one.", img: "https://img.alicdn.com/bao/uploaded/i1/2209083264270/O1CN010YSHwm1hPiGos2xUl_!!2209083264270.jpg_460x460q90.jpg_.webp" },
  { id: 5, name: "Disposable toilet seat cover", price: 7.5, tag: "Home", origin: "China", brand: "HomeCare", stock: 22, new: false, global: false, colors: ["#ffffff", "#dfe9ec", "#b0bec5"], description: "Individually wrapped, waterproof and comfortable.", img: "https://img.alicdn.com/bao/uploaded/i4/2219902819204/O1CN01hpvBoC2HrUVKOJ8k0_!!2219902819204.jpg_460x460q90.jpg_.webp" },
  { id: 6, name: "Medical clogs", price: 45.9, tag: "Fashion", origin: "China", brand: "MedStep", stock: 32, new: false, global: false, colors: ["#1a1a1a", "#333333", "#555555"], description: "Lightweight, easy-clean clogs for long days.", img: "https://img.alicdn.com/bao/uploaded/i3/2216300976695/O1CN01gS8v2f1zKMk4L18ms_!!4611686018427386423-0-item_pic.jpg_460x460q90.jpg_.webp" },
  { id: 7, name: "Car perfume and air freshener", price: 38.75, tag: "Auto", origin: "China", brand: "Lincoln", stock: 45, new: false, global: false, colors: ["#b08d57", "#f5e6cc", "#3f3f3f"], description: "A subtle, long-lasting car fragrance.", img: "https://img.alicdn.com/bao/uploaded/i3/2218742651986/O1CN01MopT3a1QXdgKFXVZE_!!2218742651986.jpg_460x460q90.jpg_.webp" },
  { id: 8, name: "Soft sterile disposable underwear", price: 110.55, tag: "Fashion", origin: "China", brand: "CottonLab", stock: 11, new: false, global: false, colors: ["#d8d8d8", "#b0bec5", "#f5f5f5"], description: "Breathable and comfortable. Ideal for travel.", img: "https://img.alicdn.com/bao/uploaded/i2/2217618979812/O1CN01wkXatR2MLxK1JSEjP_!!4611686018427386852-0-item_pic.jpg_460x460q90.jpg_.webp" },
  { id: 9, name: "Titanium gray frosted iPhone case", price: 69.1, tag: "Electronics", origin: "China", brand: "Spigen", stock: 56, new: true, global: false, colors: ["#5b5b5b", "#8e8e8e", "#2f2f2f"], description: "A slim matte case with a soft-touch finish.", img: "https://img.alicdn.com/bao/uploaded/i2/2218612120115/O1CN01aDhM131CiieOAh2O4_!!4611686018427386419-0-item_pic.jpg_460x460q90.jpg_.webp" },
  { id: 10, name: "Wireless Bluetooth speaker", price: 67.6, tag: "Electronics", origin: "Germany", brand: "Teufel", stock: 16, new: true, global: true, colors: ["#2c2c2c", "#00bcd4", "#7b1fa2"], description: "Rich room-filling sound in a compact body.", img: "https://img.alicdn.com/bao/uploaded/i2/2208457612939/O1CN01zqDlsy1Xa75A9CCt0_!!4611686018427387531-0-item_pic.jpg_460x460q90.jpg_.webp" },
  { id: 11, name: "ASUS Fearless Ultra 5 laptop", price: 8970.7, tag: "Electronics", origin: "China", brand: "ASUS", stock: 4, new: true, global: false, colors: ["#c0c0c0", "#2b2b2b", "#1e88e5"], description: "A powerful 16-core laptop for work and creation.", img: "https://img.alicdn.com/bao/uploaded/i3/686773455/O1CN01uzEl501bORWwiJKP4_!!4611686018427385039-0-item_pic.jpg_460x460q90.jpg_.webp" },
  { id: 12, name: "Minimalist Leather Watch", price: 268, tag: "Fashion", origin: "Germany", brand: "Aured", stock: 18, new: true, global: true, colors: ["#8d6e63", "#d7ccc8", "#3e2723"], description: "Clean lines and a genuine leather strap.", img: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=460&h=460&fit=crop" },
  { id: 13, name: "Classic Red Sneakers", price: 429, tag: "Fashion", origin: "USA", brand: "Runway", stock: 24, new: true, global: true, colors: ["#d32f2f", "#ffffff", "#212121"], description: "A bold everyday sneaker with cushioned soles.", img: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=460&h=460&fit=crop" },
  { id: 14, name: "Studio Wireless Headphones", price: 599, tag: "Electronics", origin: "USA", brand: "Soundwave", stock: 12, new: false, global: true, colors: ["#212121", "#616161", "#e0e0e0"], description: "Warm, detailed sound with plush earcups.", img: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=460&h=460&fit=crop" },
  { id: 15, name: "Mirrorless Camera Kit", price: 3299, tag: "Electronics", origin: "Japan", brand: "Sora", stock: 6, new: true, global: true, colors: ["#2f2f2f", "#b0bec5", "#37474f"], description: "A compact mirrorless camera with a kit lens.", img: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=460&h=460&fit=crop" },
  { id: 16, name: "Apex Smart Watch Series 8", price: 899, tag: "Electronics", origin: "USA", brand: "Apex", stock: 21, new: true, global: true, colors: ["#212121", "#42a5f5", "#eeeeee"], description: "Track workouts, sleep and notifications.", img: "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=460&h=460&fit=crop" },
  { id: 17, name: "Polarized Sunglasses", price: 219, tag: "Fashion", origin: "Italy", brand: "Luce", stock: 33, new: false, global: true, colors: ["#212121", "#5d4037", "#c9a227"], description: "Italian frames with polarized lenses.", img: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=460&h=460&fit=crop" },
  { id: 18, name: "Noise-Cancelling Headphones", price: 749, tag: "Electronics", origin: "Germany", brand: "Aural", stock: 14, new: true, global: true, colors: ["#1a1a1a", "#37474f", "#90a4ae"], description: "Quiet the world with rich, balanced sound.", img: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=460&h=460&fit=crop" },
  { id: 19, name: "Everyday Leather Tote", price: 389, tag: "Fashion", origin: "Italy", brand: "Bella", stock: 19, new: false, global: true, colors: ["#8d6e63", "#5d4037", "#d7ccc8"], description: "A roomy tote in supple leather.", img: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?w=460&h=460&fit=crop" },
  { id: 20, name: "Lightweight Running Shoes", price: 359, tag: "Sports", origin: "USA", brand: "Stride", stock: 28, new: true, global: true, colors: ["#f5f5f5", "#ef5350", "#42a5f5"], description: "Breathable mesh and a springy sole.", img: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=460&h=460&fit=crop" },
  { id: 21, name: "Hydrating Skincare Set", price: 259, tag: "Beauty", origin: "South Korea", brand: "Lumi", stock: 40, new: true, global: true, colors: ["#f8bbd0", "#fce4ec", "#ffffff"], description: "A gentle three-step routine for dewy skin.", img: "https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=460&h=460&fit=crop" },
  { id: 22, name: "Radiance Makeup Kit", price: 319, tag: "Beauty", origin: "France", brand: "Roseau", stock: 17, new: false, global: true, colors: ["#d81b60", "#f48fb1", "#f8bbd0"], description: "Flattering shades for an effortless look.", img: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=460&h=460&fit=crop" },
  { id: 23, name: "Classic Canvas Backpack", price: 279, tag: "Fashion", origin: "UK", brand: "Heritage", stock: 26, new: false, global: true, colors: ["#5d4037", "#8d6e63", "#d7ccc8"], description: "Durable canvas with a padded laptop sleeve.", img: "https://images.unsplash.com/photo-1560343090-f0409e92791a?w=460&h=460&fit=crop" },
  { id: 24, name: "Street Style Sneakers", price: 459, tag: "Fashion", origin: "USA", brand: "Urban", stock: 15, new: true, global: true, colors: ["#ffffff", "#212121", "#b0bec5"], description: "A clean, versatile low-top sneaker.", img: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=460&h=460&fit=crop" },
  { id: 25, name: "Brightening Serum", price: 429, tag: "Beauty", origin: "Japan", brand: "Mizuki", stock: 22, new: true, global: true, colors: ["#e6c27a", "#fff3d6", "#c48b3a"], description: "A lightweight serum for brighter, even skin.", img: "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=460&h=460&fit=crop" },
  { id: 26, name: "Premium Leather Wallet", price: 299, tag: "Fashion", origin: "Italy", brand: "Ferrara", stock: 31, new: false, global: true, colors: ["#3e2723", "#6d4c41", "#a1887f"], description: "Slim, hand-finished leather wallet.", img: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=460&h=460&fit=crop" },
  { id: 27, name: "Casual Canvas Shoes", price: 239, tag: "Fashion", origin: "France", brand: "Bleu", stock: 37, new: false, global: true, colors: ["#1565c0", "#ffffff", "#90caf9"], description: "Easy-going canvas shoes in fresh blue.", img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=460&h=460&fit=crop" },
  { id: 28, name: "Vintage Frame Sunglasses", price: 189, tag: "Fashion", origin: "USA", brand: "Vista", stock: 44, new: false, global: true, colors: ["#212121", "#d7a86e", "#424242"], description: "Retro-inspired frames with warm lenses.", img: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=460&h=460&fit=crop" },
];

/* ---------------- state ---------------- */

const CART_KEY = "tmallCart";
const ORDERS_KEY = "tmallOrders";
const money = (amount) => `¥ ${Number(amount).toFixed(2)}`;
let useApi = window.location.protocol !== "file:";
let products = fallbackProducts;
let facets = { categories: [], origins: [], brands: [] };
let currentUser = null;
let cartItems = [];
let wishlistIds = JSON.parse(localStorage.getItem("tmallWishlist") || "[]");
let localCart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
let localOrders = JSON.parse(localStorage.getItem(ORDERS_KEY) || "[]");
let localRecent = JSON.parse(localStorage.getItem("tmallRecent") || "[]");
let appliedCoupon = null;
let selectedRating = 5;
let visual = { dataUrl: null, palette: [], result: null };

const $ = (selector) => document.querySelector(selector);
const wrapper = $("#products-wrapper");
const searchInput = $(".search-container input");

/* ---------------- generic helpers ---------------- */

async function api(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Something went wrong");
  return data;
}

let toastTimer;
function toast(message) {
  const element = $("#toast");
  if (!element) return;
  element.textContent = message;
  element.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => element.classList.remove("show"), 3200);
}

function rgbToHex(r, g, b) {
  return `#${[r, g, b].map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, "0")).join("")}`;
}

function hexToRgb(hex) {
  const value = String(hex).replace("#", "");
  return [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) || 0);
}

function colorDistance(a, b) {
  const [r1, g1, b1] = hexToRgb(a);
  const [r2, g2, b2] = hexToRgb(b);
  const dr = r1 - r2, dg = g1 - g2, db = b1 - b2;
  return Math.sqrt(0.3 * dr * dr + 0.59 * dg * dg + 0.11 * db * db);
}

function localScore(palette, product, category) {
  const distances = (palette.length ? palette : ["#cccccc"]).map((c) => Math.min(...(product.colors || ["#cccccc"]).map((pc) => colorDistance(c, pc))));
  const average = distances.reduce((a, b) => a + b, 0) / distances.length;
  let score = Math.max(5, Math.round(100 - average / 2.2));
  if (category && product.tag.toLowerCase() === category.toLowerCase()) score += 8;
  return Math.min(99, score);
}

/* ---------------- product cards ---------------- */

function productCardHtml(p, score) {
  const saved = wishlistIds.includes(p.id);
  const rating = p.rating ? `<p class="rating">${"★".repeat(Math.round(p.rating))} ${p.rating.toFixed(1)} <small>(${p.reviewCount})</small></p>` : "";
  return `
    <article class="product-card" data-id="${p.id}">
      ${p.reason ? `<span class="reason">${p.reason}</span>` : ""}
      ${score ? `<span class="match-badge">${score}% match</span>` : ""}
      <button class="wish-btn ${saved ? "saved" : ""}" data-id="${p.id}" aria-label="Save to favorites">${saved ? "♥" : "♡"}</button>
      <img src="${p.img}" alt="${p.name}" loading="lazy" />
      <p class="product-name">${p.name}</p>
      ${rating}
      <p class="product-origin">${p.origin || "China"} · ${p.brand || "Tmall"}</p>
      <p class="price"><small>¥</small>${p.price.toFixed(2)}</p>
      <button class="cart-btn" data-id="${p.id}">Add to Cart</button>
    </article>`;
}

function renderInto(target, items, scores = {}) {
  if (!target) return;
  target.innerHTML = items.length
    ? items.map((p) => productCardHtml(p, scores[p.id])).join("")
    : `<p class="empty-state">No products found. Try a different search.</p>`;
}

function renderHome(items) {
  renderInto(wrapper, items);
  const count = $("#product-count");
  if (count) count.textContent = `Showing ${items.length} product${items.length === 1 ? "" : "s"}`;
}

function applyFilters() {
  const term = (searchInput?.value || "").trim().toLowerCase();
  const filter = $(".filter-pill.selected")?.dataset.filter || "all";
  if (useApi) {
    api(`/products?search=${encodeURIComponent(term)}&filter=${filter}`)
      .then((data) => renderHome(data.products))
      .catch(() => {
        useApi = false;
        renderHome(homeFallback(term, filter));
      });
  } else {
    renderHome(homeFallback(term, filter));
  }
}

function homeFallback(term, filter) {
  return products.filter((p) => {
    const text = !term || `${p.name} ${p.tag} ${p.brand}`.toLowerCase().includes(term);
    const price = filter === "low" ? p.price < 50 : filter === "mid" ? p.price >= 50 && p.price < 100 : filter === "new" ? p.new : true;
    return text && price;
  });
}

async function loadCatalog() {
  if (useApi) {
    try {
      const data = await api("/products");
      products = data.products;
      facets = data.facets;
      return;
    } catch { useApi = false; }
  }
  products = fallbackProducts;
  facets = {
    categories: [...new Set(products.map((p) => p.tag))].sort(),
    origins: [...new Set(products.map((p) => p.origin))].sort(),
    brands: [...new Set(products.map((p) => p.brand))].sort(),
  };
}

/* ---------------- cart ---------------- */

function localCartSummary() {
  return {
    items: localCart,
    count: localCart.reduce((sum, item) => sum + item.quantity, 0),
    subtotal: localCart.reduce((sum, item) => sum + item.price * item.quantity, 0),
  };
}

function renderCart(summary) {
  cartItems = summary.items;
  const badge = $("#cart-count");
  const total = $("#cart-total");
  const list = $("#cart-sidebar-items");
  if (appliedCoupon && summary.subtotal < appliedCoupon.minSubtotal) {
    appliedCoupon = null;
    const feedback = $("#coupon-feedback");
    if (feedback) { feedback.textContent = "Coupon removed — your subtotal is now too low."; feedback.classList.add("error"); }
  }
  const discount = appliedCoupon?.discount || 0;
  if (badge) badge.textContent = summary.count;
  if (total) total.textContent = money(Math.max(0, summary.subtotal - discount));
  const discountLine = $("#discount-line");
  if (discountLine) discountLine.hidden = !discount;
  const discountText = $("#cart-discount");
  if (discountText) discountText.textContent = `- ${money(discount)}`;
  const shippingNote = $("#shipping-note");
  if (shippingNote) shippingNote.textContent = summary.subtotal >= 200 ? "🎉 You've unlocked free shipping!" : `Add ${money(200 - summary.subtotal)} more for free shipping`;
  if (!list) return;
  list.innerHTML = summary.items.length
    ? summary.items.map((item) => `
        <div class="cart-row">
          <img src="${item.img}" alt="" />
          <div><strong>${item.name}</strong><small>${money(item.price)} × ${item.quantity}</small></div>
          <div class="cart-row-actions">
            <div class="qty-stepper">
              <button class="qty-minus" data-id="${item.id}" aria-label="Decrease quantity">−</button>
              <span>${item.quantity}</span>
              <button class="qty-plus" data-id="${item.id}" aria-label="Increase quantity">+</button>
            </div>
            <button class="remove-item" data-id="${item.id}" aria-label="Remove item">×</button>
          </div>
        </div>`).join("")
    : `<p class="cart-empty">Your cart is empty. Go find something you love.</p>`;
}

function saveLocalCart() {
  localStorage.setItem(CART_KEY, JSON.stringify(localCart));
  renderCart(localCartSummary());
}

async function loadCart() {
  if (useApi) {
    try { renderCart(await api("/cart")); return; }
    catch { useApi = false; }
  }
  renderCart(localCartSummary());
}

async function addToCart(id, button) {
  const product = products.find((p) => p.id === Number(id)) || fallbackProducts.find((p) => p.id === Number(id));
  if (!product) return;
  try {
    if (useApi) renderCart(await api("/cart", { method: "POST", body: JSON.stringify({ id: product.id }) }));
    else {
      const line = localCart.find((item) => item.id === product.id);
      if (line) line.quantity++;
      else localCart.push({ id: product.id, name: product.name, price: product.price, img: product.img, quantity: 1 });
      saveLocalCart();
    }
    toast(`${product.name} added to your cart`);
    if (button && button.classList.contains("cart-btn")) {
      button.textContent = "Added ✓";
      setTimeout(() => { button.textContent = "Add to Cart"; }, 1000);
    }
  } catch (error) { toast(error.message); }
}

async function changeQty(id, delta) {
  const item = cartItems.find((i) => i.id === Number(id));
  if (!item) return;
  const next = item.quantity + delta;
  if (next < 1) return removeFromCart(id);
  try {
    if (useApi) renderCart(await api(`/cart/${id}`, { method: "PUT", body: JSON.stringify({ quantity: next }) }));
    else { item.quantity = next; saveLocalCart(); }
  } catch (error) { toast(error.message); }
}

async function removeFromCart(id) {
  try {
    if (useApi) renderCart(await api(`/cart/${id}`, { method: "DELETE" }));
    else { localCart = localCart.filter((item) => item.id !== Number(id)); saveLocalCart(); }
    toast("Item removed from cart");
  } catch (error) { toast(error.message); }
}

function setCartOpen(open) {
  $("#cart-sidebar")?.classList.toggle("open", open);
  $("#cart-overlay")?.classList.toggle("open", open);
}

/* ---------------- checkout + orders ---------------- */

function showOrder(order) {
  const count = order.items.reduce((sum, item) => sum + item.quantity, 0);
  toast(`Order #${order.id} placed! ${count} item${count === 1 ? "" : "s"} · ${money(order.total)}`);
}

async function checkout() {
  if (useApi) {
    try {
      showOrder(await api("/checkout", {
        method: "POST",
        body: JSON.stringify({ code: appliedCoupon?.code }),
      }));
      appliedCoupon = null;
      const codeInput = $("#coupon-code");
      if (codeInput) codeInput.value = "";
      const feedback = $("#coupon-feedback");
      if (feedback) { feedback.textContent = ""; feedback.classList.remove("error"); }
      await loadCart();
      setCartOpen(false);
    } catch (error) { toast(error.message); }
    return;
  }
  if (!localCart.length) return toast("Your cart is empty. Add something first!");
  const items = localCart.map((item) => ({ ...item }));
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const discount = appliedCoupon?.discount || 0;
  const couponCode = appliedCoupon?.code || null;
  const shipping = subtotal >= 200 || couponCode === "FREESHIP" ? 0 : 10;
  const order = {
    id: `TM${Date.now().toString(36).toUpperCase()}`,
    createdAt: new Date().toISOString(), items, subtotal, discount, coupon: couponCode, shipping,
    total: subtotal - discount + shipping, status: "Confirmed",
  };
  appliedCoupon = null;
  localOrders.unshift(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(localOrders));
  localCart = [];
  saveLocalCart();
  setCartOpen(false);
  showOrder(order);
}

function renderOrders(orders) {
  const body = $("#orders-body");
  if (!body) return;
  body.innerHTML = orders.length
    ? orders.map((order) => `
        <div class="order-card">
          <div class="order-meta"><span>Order <b>#${order.id}</b></span><span>${new Date(order.createdAt).toLocaleString()}</span></div>
          <ul class="order-items">${order.items.map((item) => `<li><span>${item.name} × ${item.quantity}</span><span>${money(item.price * item.quantity)}</span></li>`).join("")}</ul>
          <div class="order-total"><span>Shipping ${order.shipping ? money(order.shipping) : "Free"}${order.coupon ? ` · ${order.coupon} (−${money(order.discount)})` : ""} · <span class="order-status">${order.status}</span></span><b>${money(order.total)}</b></div>
        </div>`).join("")
    : `<p class="cart-empty">No orders yet. Your completed orders will appear here.</p>`;
}

function setOrdersOpen(open) {
  $("#orders-overlay")?.classList.toggle("open", open);
  $("#orders-modal")?.classList.toggle("open", open);
}

async function openOrders() {
  setOrdersOpen(true);
  if (useApi) {
    try { renderOrders((await api("/orders")).orders); return; }
    catch { useApi = false; }
  }
  renderOrders(localOrders);
}

/* ---------------- authentication ---------------- */

function setAuthMode(mode) {
  const login = mode === "login";
  document.querySelectorAll(".auth-tab").forEach((tab) => tab.classList.toggle("active", tab.dataset.mode === mode));
  $("#auth-name").hidden = login;
  $("#auth-password").autocomplete = login ? "current-password" : "new-password";
  $("#auth-submit").textContent = login ? "Sign In" : "Create Account";
  $("#auth-heading").textContent = login ? "Welcome back" : "Join Tmall";
  $("#auth-error").textContent = "";
}

function openAuth(mode = "login") {
  setAuthMode(mode);
  $("#auth-overlay")?.classList.add("open");
  $("#auth-modal")?.classList.add("open");
}

function closeAuth() {
  $("#auth-overlay")?.classList.remove("open");
  $("#auth-modal")?.classList.remove("open");
}

function updateAuthUI() {
  const topAuth = $("#auth-trigger");
  const topRegister = $("#register-trigger");
  const memberAvatar = $("#member-avatar");
  const memberTitle = $("#member-title");
  const memberSub = $("#member-sub");
  const memberAuth = $("#member-auth");
  const memberRegister = $("#member-register");
  if (currentUser) {
    const name = currentUser.name;
    if (topAuth) topAuth.textContent = `Hi, ${name}`;
    if (topRegister) topRegister.textContent = "Sign Out";
    if (memberAvatar) memberAvatar.textContent = name.slice(0, 1).toUpperCase();
    if (memberTitle) memberTitle.textContent = `Hi, ${name}`;
    if (memberSub) memberSub.textContent = "Your account is ready";
    if (memberAuth) memberAuth.textContent = "My Orders";
    if (memberRegister) memberRegister.textContent = "Sign Out";
  } else {
    if (topAuth) topAuth.textContent = "Sign In";
    if (topRegister) topRegister.textContent = "Register";
    if (memberAvatar) memberAvatar.textContent = "Hi";
    if (memberTitle) memberTitle.textContent = "Hi, welcome to Tmall";
    if (memberSub) memberSub.textContent = "New surprises every day";
    if (memberAuth) memberAuth.textContent = "Sign In";
    if (memberRegister) memberRegister.textContent = "Register";
  }
}

async function loadUser() {
  if (!useApi) return;
  try { currentUser = (await api("/auth")).user; }
  catch { useApi = false; }
  updateAuthUI();
}

async function submitAuth(event) {
  event.preventDefault();
  const mode = $(".auth-tab.active")?.dataset.mode || "login";
  const email = $("#auth-email")?.value.trim();
  const password = $("#auth-password")?.value;
  const name = $("#auth-name")?.value.trim();
  const error = $("#auth-error");
  if (error) error.textContent = "";
  if (!useApi) {
    if (error) error.textContent = "Accounts need the server. Run npm start to sign in.";
    return;
  }
  try {
    const data = await api(`/auth/${mode === "login" ? "login" : "register"}`, {
      method: "POST",
      body: JSON.stringify(mode === "login" ? { email, password } : { name, email, password }),
    });
    currentUser = data.user;
    closeAuth();
    updateAuthUI();
    toast(`Welcome${mode === "register" ? " to Tmall" : " back"}, ${currentUser.name}!`);
    await loadCart();
  } catch (err) {
    if (error) error.textContent = err.message;
  }
}

async function logout() {
  if (useApi) {
    try { await api("/auth/logout", { method: "POST" }); }
    catch { /* ignore */ }
  }
  currentUser = null;
  updateAuthUI();
  await loadCart();
  toast("You've signed out");
}

/* ---------------- wishlist ---------------- */

function refreshWishButtons() {
  document.querySelectorAll(".wish-btn").forEach((button) => {
    const saved = wishlistIds.includes(Number(button.dataset.id));
    button.classList.toggle("saved", saved);
    button.textContent = saved ? "♥" : "♡";
  });
}

async function loadWishlistIds() {
  if (useApi) {
    try { wishlistIds = (await api("/wishlist")).ids; }
    catch { useApi = false; }
  }
  localStorage.setItem("tmallWishlist", JSON.stringify(wishlistIds));
  refreshWishButtons();
}

async function toggleWishlist(id) {
  const pid = Number(id);
  let saved;
  if (useApi) {
    try {
      const data = await api("/wishlist", { method: "POST", body: JSON.stringify({ id: pid }) });
      wishlistIds = data.ids;
      saved = data.saved;
    } catch { useApi = false; }
  }
  if (!useApi) {
    const index = wishlistIds.indexOf(pid);
    saved = index === -1;
    if (saved) wishlistIds.push(pid); else wishlistIds.splice(index, 1);
  }
  localStorage.setItem("tmallWishlist", JSON.stringify(wishlistIds));
  refreshWishButtons();
  toast(saved ? "Saved to favorites" : "Removed from favorites");
  if ($("#wishlist-modal")?.classList.contains("open")) loadWishlist();
}

function setWishlistOpen(open) {
  $("#wishlist-overlay")?.classList.toggle("open", open);
  $("#wishlist-modal")?.classList.toggle("open", open);
}

async function loadWishlist() {
  const body = $("#wishlist-body");
  if (!body) return;
  let items = [];
  if (useApi) {
    try { items = (await api("/wishlist")).products; } catch { useApi = false; }
  }
  if (!items.length && !useApi) items = wishlistIds.map((pid) => products.find((p) => p.id === pid)).filter(Boolean);
  const count = $("#wish-count");
  if (count) count.textContent = wishlistIds.length;
  body.innerHTML = items.length
    ? `<div class="wishlist-body">${items.map((p) => `
        <div class="wish-item">
          <button class="remove-item" data-id="${p.id}" aria-label="Remove">×</button>
          <img src="${p.img}" alt="${p.name}" />
          <p>${p.name}</p>
          <strong>${money(p.price)}</strong>
          <button class="cart-btn" data-id="${p.id}">Add to Cart</button>
        </div>`).join("")}</div>`
    : `<p class="cart-empty">No favorites yet. Tap the ♡ on any product to save it here.</p>`;
}

/* ---------------- recently viewed + recommendations ---------------- */

async function recordRecent(id) {
  const pid = Number(id);
  if (useApi) {
    try { await api("/recently-viewed", { method: "POST", body: JSON.stringify({ id: pid }) }); }
    catch { /* ignore */ }
  }
  localRecent = [pid, ...localRecent.filter((x) => x !== pid)].slice(0, 12);
  localStorage.setItem("tmallRecent", JSON.stringify(localRecent));
}

async function loadRecent() {
  let items = [];
  if (useApi) {
    try { items = (await api("/recently-viewed")).products; } catch { useApi = false; }
  }
  if (!items.length) items = localRecent.map((pid) => products.find((p) => p.id === pid)).filter(Boolean);
  const section = $("#recent-section");
  if (section) section.hidden = !items.length;
  renderInto($("#recent-products"), items);
}

async function loadRecommendations() {
  let items = [];
  if (useApi) {
    try { items = (await api("/recommendations?limit=10")).products; } catch { useApi = false; }
  }
  if (!items.length) {
    items = products.slice().sort((a, b) => (b.rating || 0) - (a.rating || 0))
      .slice(0, 10).map((p) => ({ ...p, reason: "Popular pick" }));
  }
  renderInto($("#recommend-products"), items);
}

/* ---------------- reviews ---------------- */

function stars(n) { return "★".repeat(n) + "☆".repeat(5 - n); }

async function loadReviews(productId) {
  const list = $("#reviews-list");
  const formArea = $("#review-form-area");
  if (!list) return;
  let data = { reviews: [], rating: 0, reviewCount: 0 };
  if (useApi) {
    try { data = await api(`/products/${productId}/reviews`); } catch { /* ignore */ }
  }
  list.innerHTML = data.reviews.length
    ? `<p class="review-stars">${stars(Math.round(data.rating))} ${data.rating.toFixed(1)} · ${data.reviewCount} review${data.reviewCount === 1 ? "" : "s"}</p>` +
      data.reviews.map((r) => `
        <div class="review-item">
          <strong>${r.ownerName}</strong>${r.verified ? `<span class="verified">✓ Verified purchase</span>` : ""}
          <span class="review-stars" style="float:right">${stars(r.rating)}</span>
          ${r.title ? `<p><b>${r.title}</b></p>` : ""}<p>${r.body}</p>
          <small style="color:#aaa">${new Date(r.createdAt).toLocaleDateString()}</small>
        </div>`).join("")
    : `<p class="cart-empty" style="padding:12px 0">No reviews yet. Be the first to share your thoughts.</p>`;
  if (!formArea) return;
  if (!currentUser) {
    formArea.innerHTML = `<button class="ghost-btn" id="review-signin">Sign in to write a review</button>`;
    return;
  }
  formArea.innerHTML = `
    <form class="review-form" id="review-form">
      <div class="star-picker">${[1, 2, 3, 4, 5].map((n) => `<button type="button" class="${n <= selectedRating ? "on" : ""}" data-star="${n}">★</button>`).join("")}</div>
      <input type="text" id="review-title" placeholder="Title (optional)" maxlength="80" />
      <textarea id="review-body" placeholder="What did you think of this product?" maxlength="600" required></textarea>
      <button type="submit">Post review</button>
    </form>`;
}

/* ---------------- coupons ---------------- */

async function applyCoupon() {
  const input = $("#coupon-code");
  const feedback = $("#coupon-feedback");
  const code = input?.value.trim().toUpperCase();
  if (!code) return;
  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  let result;
  if (useApi) {
    try { result = await api("/coupons/validate", { method: "POST", body: JSON.stringify({ code, subtotal }) }); }
    catch (error) { feedback.textContent = error.message; feedback.classList.add("error"); return; }
  } else {
    const local = {
      WELCOME20: { type: "percent", value: 20, minSubtotal: 100, label: "20% off orders over ¥100" },
      SAVE10: { type: "fixed", value: 10, minSubtotal: 50, label: "¥10 off orders over ¥50" },
      FREESHIP: { type: "shipping", value: 0, minSubtotal: 0, label: "Free shipping on any order" },
    };
    const coupon = local[code];
    if (!coupon) result = { valid: false, error: "That coupon code was not recognised" };
    else if (subtotal < coupon.minSubtotal) result = { valid: false, error: `Spend ¥${coupon.minSubtotal.toFixed(2)} or more to use ${code}` };
    else result = { valid: true, coupon, discount: coupon.type === "percent" ? Number((subtotal * coupon.value / 100).toFixed(2)) : coupon.value || 0 };
  }
  if (!result.valid) { feedback.textContent = result.error; feedback.classList.add("error"); return; }
  appliedCoupon = { code: result.coupon.code, discount: result.discount, minSubtotal: result.coupon.minSubtotal };
  feedback.textContent = `✓ ${result.coupon.label} applied`;
  feedback.classList.remove("error");
  renderCart({ items: cartItems, count: cartItems.reduce((s, i) => s + i.quantity, 0), subtotal });
  toast("Coupon applied!");
}

/* ---------------- search suggestions ---------------- */

function renderSuggestions(items) {
  const box = $("#suggestions");
  if (!box) return;
  box.innerHTML = items.length
    ? items.map((i) => `<button data-term="${i.term}">${i.term}${i.trending ? "<small>trending</small>" : ""}</button>`).join("")
    : "";
  box.classList.toggle("show", items.length > 0);
}

async function loadSuggestions() {
  const query = searchInput?.value.trim() || "";
  if (useApi) {
    try {
      const data = await api(`/suggestions?q=${encodeURIComponent(query)}`);
      renderSuggestions([...data.suggestions, ...data.trending]);
      return;
    } catch { useApi = false; }
  }
  const pool = [...facets.categories, ...facets.origins, ...facets.brands, ...new Set(products.map((p) => p.name))];
  renderSuggestions(pool.filter((t) => !query || t.toLowerCase().includes(query.toLowerCase())).slice(0, 8).map((term) => ({ term })));
}

/* ---------------- profile dashboard ---------------- */

function setProfileOpen(open) {
  $("#profile-overlay")?.classList.toggle("open", open);
  $("#profile-modal")?.classList.toggle("open", open);
}

async function openProfile() {
  setProfileOpen(true);
  const body = $("#profile-body");
  if (!body) return;
  if (!currentUser) {
    body.innerHTML = `<p class="cart-empty">Sign in to see your account, orders and favorites.</p><button class="cart-btn" id="profile-signin">Sign In</button>`;
    return;
  }
  let data = null;
  if (useApi) { try { data = await api("/profile"); } catch { useApi = false; } }
  if (!data) {
    data = { stats: { orders: localOrders.length, spent: localOrders.reduce((s, o) => s + o.total, 0), wishlist: wishlistIds.length, reviews: 0, visualSearches: 0 }, reviews: [] };
  }
  const heading = $("#profile-heading");
  if (heading) heading.textContent = `${currentUser.name}'s Account`;
  const s = data.stats;
  body.innerHTML = `
    <div class="profile-stats">
      <div class="profile-stat"><b>${s.orders}</b><span>Orders</span></div>
      <div class="profile-stat"><b>${money(s.spent)}</b><span>Total spent</span></div>
      <div class="profile-stat"><b>${s.wishlist}</b><span>Favorites</span></div>
      <div class="profile-stat"><b>${s.reviews}</b><span>Reviews</span></div>
      <div class="profile-stat"><b>${s.visualSearches}</b><span>Visual searches</span></div>
    </div>
    <div class="profile-actions">
      <button class="ghost-btn" data-profile="orders">My Orders</button>
      <button class="ghost-btn" data-profile="wishlist">Favorites</button>
      <button class="ghost-btn" data-profile="reviews">My Reviews</button>
      <button class="ghost-btn" data-profile="signout">Sign Out</button>
    </div>
    <div class="profile-reviews"><h4>Recent reviews</h4>${data.reviews.length
      ? data.reviews.slice(0, 3).map((r) => `<div class="review-item"><strong>Product #${r.productId}</strong><span class="review-stars" style="float:right">${stars(r.rating)}</span><p>${r.body}</p></div>`).join("")
      : `<p class="cart-empty" style="padding:10px 0">No reviews yet.</p>`}</div>`;
}

function closeProfile() {
  $("#profile-overlay")?.classList.remove("open");
  $("#profile-modal")?.classList.remove("open");
}

/* ---------------- global finds ---------------- */

function showGlobal() {
  $("#global-view")?.classList.add("open");
  document.body.style.overflow = "hidden";
  populateGlobalFilters();
  loadGlobal();
}

function hideGlobal() {
  $("#global-view")?.classList.remove("open");
  document.body.style.overflow = "";
}

function populateGlobalFilters() {
  const origin = $("#global-origin");
  const category = $("#global-category");
  const visualCategory = $("#visual-category");
  const chips = $("#global-chips");
  if (origin) origin.innerHTML = `<option value="">All countries</option>${facets.origins.map((o) => `<option value="${o}">${o}</option>`).join("")}`;
  if (category) category.innerHTML = `<option value="">All categories</option>${facets.categories.map((c) => `<option value="${c}">${c}</option>`).join("")}`;
  if (visualCategory && !visualCategory.options.length) visualCategory.innerHTML = `<option value="">Any category</option>${facets.categories.map((c) => `<option value="${c}">${c}</option>`).join("")}`;
  if (chips) chips.innerHTML = ["All", ...facets.origins].map((o, i) => `<button class="chip ${i === 0 ? "active" : ""}" data-origin="${o}">${o}</button>`).join("");
}

function globalQuery() {
  const params = new URLSearchParams({ global: "true" });
  const search = $("#global-search")?.value.trim();
  const origin = $("#global-origin")?.value;
  const category = $("#global-category")?.value;
  const sort = $("#global-sort")?.value;
  if (search) params.set("search", search);
  if (origin) params.set("origin", origin);
  if (category) params.set("category", category);
  if (sort) params.set("sort", sort);
  return params.toString();
}

async function loadGlobal() {
  const stats = $("#global-stats");
  let items;
  if (useApi) {
    try {
      const data = await api(`/products?${globalQuery()}`);
      items = data.products;
    } catch { useApi = false; }
  }
  if (!items) {
    const params = new URLSearchParams(globalQuery());
    const term = (params.get("search") || "").toLowerCase();
    items = products.filter((p) => p.global
      && (!term || `${p.name} ${p.brand} ${p.origin}`.toLowerCase().includes(term))
      && (!params.get("origin") || p.origin === params.get("origin"))
      && (!params.get("category") || p.tag === params.get("category")));
    if (params.get("sort") === "price_asc") items.sort((a, b) => a.price - b.price);
    if (params.get("sort") === "price_desc") items.sort((a, b) => b.price - a.price);
  }
  renderInto($("#global-products"), items);
  if (stats) stats.textContent = `${items.length} global product${items.length === 1 ? "" : "s"} found · ${facets.origins.length} countries to explore`;
}

/* ---------------- product detail ---------------- */

async function openDetail(id) {
  let product = products.find((p) => p.id === Number(id));
  if (useApi && !product) {
    try { product = await api(`/products/${id}`); } catch { /* ignore */ }
  }
  if (!product) return;
  recordRecent(product.id).then(() => loadRecent());
  const content = $("#detail-content");
  if (!content) return;
  content.innerHTML = `
    <img src="${product.img}" alt="${product.name}" />
    <div class="detail-info">
      <h3>${product.name}</h3>
      <p class="detail-price">${money(product.price)}</p>
      <p class="detail-meta">Brand: <b>${product.brand || "Tmall"}</b><br />
        From: <b>${product.origin || "China"}</b><br />
        Category: <b>${product.tag || "General"}</b><br />
        In stock: <b>${product.stock ?? "Available"}</b></p>
      <div class="color-dots">${(product.colors || []).map((c) => `<span class="color-dot" style="background:${c}" title="${c}"></span>`).join("")}</div>
      <p class="detail-desc">${product.description || "A quality pick from Tmall."}</p>
      <div class="detail-actions">
        <button class="cart-btn" data-id="${product.id}">Add to Cart</button>
        <button class="ghost-btn" id="detail-similar" data-id="${product.id}">📷 Find similar</button>
      </div>
    </div>
    <div class="reviews-section" id="reviews-section">
      <h4>Ratings & Reviews</h4>
      <div id="reviews-list"><p class="cart-empty" style="padding:12px 0">Loading reviews…</p></div>
      <div id="review-form-area"></div>
    </div>`;
  $("#detail-overlay")?.classList.add("open");
  $("#detail-modal")?.classList.add("open");
  loadReviews(product.id);
}

function closeDetail() {
  $("#detail-overlay")?.classList.remove("open");
  $("#detail-modal")?.classList.remove("open");
}

/* ---------------- visual search ---------------- */

function openVisual() {
  $("#visual-overlay")?.classList.add("open");
  $("#visual-modal")?.classList.add("open");
  if (useApi) loadRecentSearches();
}
function closeVisual() {
  $("#visual-overlay")?.classList.remove("open");
  $("#visual-modal")?.classList.remove("open");
}

function extractFeatures(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Could not read that file"));
    reader.onload = () => {
      const image = new Image();
      image.onerror = () => reject(new Error("That image could not be opened"));
      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = canvas.height = 80;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(image, 0, 0, 80, 80);
        const data = ctx.getImageData(0, 0, 80, 80).data;
        const buckets = new Map();
        let r = 0, g = 0, b = 0, n = 0;
        for (let i = 0; i < data.length; i += 16) {
          if (data[i + 3] < 128) continue;
          const pr = data[i], pg = data[i + 1], pb = data[i + 2];
          r += pr; g += pg; b += pb; n++;
          const key = `${pr >> 5},${pg >> 5},${pb >> 5}`;
          const bucket = buckets.get(key) || { r: 0, g: 0, b: 0, count: 0 };
          bucket.r += pr; bucket.g += pg; bucket.b += pb; bucket.count++;
          buckets.set(key, bucket);
        }
        const palette = [...buckets.values()]
          .sort((a, b2) => b2.count - a.count)
          .slice(0, 3)
          .map((bucket) => rgbToHex(bucket.r / bucket.count, bucket.g / bucket.count, bucket.b / bucket.count));
        resolve({ dataUrl: reader.result, average: n ? rgbToHex(r / n, g / n, b / n) : "#cccccc", palette });
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

async function handleVisualFile(file) {
  if (!file) return;
  if (!/^image\/(png|jpeg|webp)$/.test(file.type)) return toast("Please choose a PNG, JPG or WebP image");
  if (file.size > 5_000_000) return toast("That image is larger than 5 MB");
  const results = $("#visual-results");
  if (results) results.innerHTML = `<p class="cart-empty">Looking for matches…</p>`;
  try {
    const features = await extractFeatures(file);
    visual.dataUrl = features.dataUrl;
    visual.palette = features.palette;
    const preview = $("#visual-preview");
    if (preview) {
      preview.innerHTML = `<img src="${features.dataUrl}" alt="Your upload" /><div><strong>Photo ready</strong><p>Colours spotted: ${features.palette.map((c) => `<span class="color-dot" style="display:inline-block;background:${c}"></span>`).join(" ")} ${features.palette.join(" · ")}</p></div>`;
      preview.classList.add("show");
    }
    const category = $("#visual-category")?.value || "";
    if (useApi) {
      try {
        visual.result = await api("/visual-search", {
          method: "POST",
          body: JSON.stringify({ image: features.dataUrl, palette: features.palette, category }),
        });
        renderVisualMatches(visual.result.matches);
        loadRecentSearches();
        return;
      } catch { useApi = false; }
    }
    const scored = products.map((p) => ({ ...p, score: localScore(features.palette, p, category) })).sort((a, b) => b.score - a.score).slice(0, 8);
    visual.result = { matches: scored };
    renderVisualMatches(scored);
  } catch (error) {
    toast(error.message);
    if (results) results.innerHTML = "";
  }
}

function renderVisualMatches(matches) {
  const results = $("#visual-results");
  if (!results) return;
  results.innerHTML = matches.length
    ? `<p class="cart-empty" style="padding:6px 0;text-align:left">Top ${matches.length} closest matches — tap a card for details.</p>` +
      `<div class="visual-grid">${matches.map((p) => `
        <div class="match-card" data-id="${p.id}">
          <span class="match-badge">${p.score}% match</span>
          <img src="${p.img}" alt="${p.name}" loading="lazy" />
          <p>${p.name}</p>
          <strong>${money(p.price)}</strong>
          <button class="cart-btn" data-id="${p.id}">Add to Cart</button>
        </div>`).join("")}</div>`
    : `<p class="cart-empty">No matches found.</p>`;
}

function findSimilarToProduct(id) {
  const product = products.find((p) => p.id === Number(id));
  if (!product) return;
  const matches = products
    .filter((p) => p.id !== product.id)
    .map((p) => ({ ...p, score: localScore(product.colors || [], p, product.tag) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);
  closeDetail();
  openVisual();
  const preview = $("#visual-preview");
  if (preview) {
    preview.innerHTML = `<img src="${product.img}" alt="${product.name}" /><div><strong>Similar to ${product.name}</strong><p>Matched using its colour palette</p></div>`;
    preview.classList.add("show");
  }
  renderVisualMatches(matches);
}

async function loadRecentSearches() {
  const container = $("#recent-searches");
  if (!container || !useApi) return;
  try {
    const searches = (await api("/visual-searches")).searches;
    visual.recent = searches;
    container.innerHTML = searches.length
      ? `<h4>Your recent visual searches</h4><div class="recent-row">${searches.map((s) => `<div class="recent-item" data-search="${s.id}"><img src="${s.imageUrl}" alt="Visual search" /><small>${new Date(s.createdAt).toLocaleDateString()}</small></div>`).join("")}</div>`
      : "";
  } catch { /* ignore */ }
}

/* ---------------- carousel ---------------- */

const slides = $(".slides-wrapper");
const dots = [...document.querySelectorAll(".dot")];
let current = 0;
let timer;

function goTo(index) {
  if (!slides || !dots.length) return;
  current = (index + dots.length) % dots.length;
  slides.style.transform = `translateX(-${current * 100}%)`;
  dots.forEach((dot, i) => dot.classList.toggle("active", i === current));
}
function restartTimer() {
  clearInterval(timer);
  timer = setInterval(() => goTo(current + 1), 5500);
}

/* ---------------- events ---------------- */

let searchTimer;
searchInput?.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => { applyFilters(); loadSuggestions(); }, 180);
});
searchInput?.addEventListener("focus", loadSuggestions);
$("#suggestions")?.addEventListener("click", (event) => {
  const button = event.target.closest("button[data-term]");
  if (!button || !searchInput) return;
  searchInput.value = button.dataset.term;
  $("#suggestions")?.classList.remove("show");
  applyFilters();
  $("#products")?.scrollIntoView({ behavior: "smooth" });
});
$(".search-container")?.addEventListener("submit", (e) => { e.preventDefault(); $("#products")?.scrollIntoView({ behavior: "smooth" }); });
document.querySelectorAll(".filter-pill").forEach((button) => button.addEventListener("click", () => {
  document.querySelectorAll(".filter-pill").forEach((b) => b.classList.remove("selected"));
  button.classList.add("selected");
  applyFilters();
}));

document.addEventListener("click", (event) => {
  if (!event.target.closest(".search-container")) $("#suggestions")?.classList.remove("show");
  const wishButton = event.target.closest(".wish-btn");
  if (wishButton) { event.stopPropagation(); toggleWishlist(wishButton.dataset.id); return; }
  const cartButton = event.target.closest(".cart-btn");
  if (cartButton) { event.stopPropagation(); addToCart(cartButton.dataset.id, cartButton); return; }
  const card = event.target.closest(".product-card, .match-card");
  if (card && !event.target.closest("button")) openDetail(card.dataset.id);
});

$("#cart-sidebar-items")?.addEventListener("click", (event) => {
  const plus = event.target.closest(".qty-plus");
  const minus = event.target.closest(".qty-minus");
  const remove = event.target.closest(".remove-item");
  if (plus) changeQty(plus.dataset.id, 1);
  else if (minus) changeQty(minus.dataset.id, -1);
  else if (remove) removeFromCart(remove.dataset.id);
});

$("#cart-toggle")?.addEventListener("click", () => setCartOpen(true));
$(".head-action")?.addEventListener("click", (e) => { e.preventDefault(); setCartOpen(true); });
$("#cart-sidebar-close")?.addEventListener("click", () => setCartOpen(false));
$("#cart-overlay")?.addEventListener("click", () => setCartOpen(false));
$(".checkout-btn")?.addEventListener("click", checkout);

$("#orders-link")?.addEventListener("click", (e) => { e.preventDefault(); openOrders(); });
$("#orders-close")?.addEventListener("click", () => setOrdersOpen(false));
$("#orders-overlay")?.addEventListener("click", () => setOrdersOpen(false));

/* auth */
$("#auth-trigger")?.addEventListener("click", (e) => { e.preventDefault(); currentUser ? openProfile() : openAuth("login"); });
$("#register-trigger")?.addEventListener("click", (e) => { e.preventDefault(); currentUser ? logout() : openAuth("register"); });
$("#member-auth")?.addEventListener("click", (e) => { e.preventDefault(); currentUser ? openProfile() : openAuth("login"); });
$("#member-register")?.addEventListener("click", (e) => { e.preventDefault(); currentUser ? logout() : openAuth("register"); });
document.querySelectorAll(".auth-tab").forEach((tab) => tab.addEventListener("click", () => setAuthMode(tab.dataset.mode)));
$("#auth-form")?.addEventListener("submit", submitAuth);
$("#auth-close")?.addEventListener("click", closeAuth);
$("#auth-overlay")?.addEventListener("click", closeAuth);

/* wishlist + profile */
$("#wishlist-link")?.addEventListener("click", (e) => { e.preventDefault(); setWishlistOpen(true); loadWishlist(); });
$("#wishlist-close")?.addEventListener("click", () => setWishlistOpen(false));
$("#wishlist-overlay")?.addEventListener("click", () => setWishlistOpen(false));
$("#wishlist-body")?.addEventListener("click", (event) => {
  const remove = event.target.closest(".remove-item");
  if (remove) toggleWishlist(remove.dataset.id);
});
$("#profile-close")?.addEventListener("click", closeProfile);
$("#profile-overlay")?.addEventListener("click", closeProfile);
$("#profile-body")?.addEventListener("click", async (event) => {
  if (event.target.closest("#profile-signin")) { closeProfile(); openAuth("login"); return; }
  const action = event.target.closest("[data-profile]")?.dataset.profile;
  if (!action) return;
  if (action === "orders") { closeProfile(); openOrders(); }
  if (action === "wishlist") { closeProfile(); setWishlistOpen(true); loadWishlist(); }
  if (action === "signout") {
    closeProfile();
    await logout();
    toast("You've signed out");
  }
  if (action === "reviews") {
    closeProfile();
    const review = currentUser ? (await api("/profile").catch(() => ({ reviews: [] }))).reviews[0] : null;
    if (review) openDetail(review.productId);
    else toast("You haven't written any reviews yet");
  }
});

/* coupons + recommendations */
$("#coupon-apply")?.addEventListener("click", applyCoupon);
$("#coupon-code")?.addEventListener("keydown", (e) => { if (e.key === "Enter") applyCoupon(); });
$("#refresh-recommend")?.addEventListener("click", () => { loadRecommendations(); toast("Fresh picks loaded"); });

/* detail + reviews */
$("#detail-close")?.addEventListener("click", closeDetail);
$("#detail-overlay")?.addEventListener("click", closeDetail);
$("#detail-content")?.addEventListener("click", (event) => {
  if (event.target.closest("#detail-similar")) return findSimilarToProduct(event.target.closest("#detail-similar").dataset.id);
  if (event.target.closest("#review-signin")) { closeDetail(); openAuth("login"); return; }
  const star = event.target.closest("[data-star]");
  if (star) {
    selectedRating = Number(star.dataset.star);
    document.querySelectorAll("[data-star]").forEach((button) => button.classList.toggle("on", Number(button.dataset.star) <= selectedRating));
  }
});
document.addEventListener("submit", async (event) => {
  if (event.target.id !== "review-form") return;
  event.preventDefault();
  const productId = Number($("#detail-similar")?.dataset.id);
  const title = $("#review-title")?.value.trim();
  const body = $("#review-body")?.value.trim();
  if (!body) return toast("Please write a short review");
  try {
    await api(`/products/${productId}/reviews`, { method: "POST", body: JSON.stringify({ rating: selectedRating, title, body }) });
    selectedRating = 5;
    toast("Thanks for sharing your review!");
    loadReviews(productId);
    loadRecommendations();
  } catch (error) { toast(error.message); }
});

/* visual search */
["#visual-trigger", "#global-visual", "#hero-visual", "#deal-visual", "#rail-visual"].forEach((selector) => {
  $(selector)?.addEventListener("click", (e) => { e.preventDefault(); openVisual(); });
});
$("#visual-close")?.addEventListener("click", closeVisual);
$("#visual-overlay")?.addEventListener("click", closeVisual);
$("#visual-clear")?.addEventListener("click", () => {
  visual = { dataUrl: null, palette: [], result: null };
  $("#visual-file").value = "";
  $("#visual-preview")?.classList.remove("show");
  $("#visual-preview").innerHTML = "";
  $("#visual-results").innerHTML = "";
});
$("#visual-file")?.addEventListener("change", (e) => handleVisualFile(e.target.files[0]));
const dropzone = $("#visual-dropzone");
["dragenter", "dragover"].forEach((type) => dropzone?.addEventListener(type, (e) => { e.preventDefault(); dropzone.classList.add("dragover"); }));
["dragleave", "drop"].forEach((type) => dropzone?.addEventListener(type, (e) => { e.preventDefault(); dropzone.classList.remove("dragover"); }));
dropzone?.addEventListener("drop", (e) => handleVisualFile(e.dataTransfer.files[0]));
$("#recent-searches")?.addEventListener("click", (event) => {
  const item = event.target.closest(".recent-item");
  if (!item || !useApi) return;
  const search = visual.recent?.find((s) => s.id === item.dataset.search);
  if (search) renderVisualMatches(search.matches.map((m) => ({ ...m, score: m.score })));
});

/* global view */
["#global-nav", "#global-banner-btn", "#more-deals", "#deal-global", "#bottom-global", "#hero-global"].forEach((selector) => {
  $(selector)?.addEventListener("click", (e) => { e.preventDefault(); showGlobal(); });
});
$("#global-back")?.addEventListener("click", hideGlobal);
["#global-origin", "#global-category", "#global-sort"].forEach((selector) => $(selector)?.addEventListener("change", loadGlobal));
$("#global-search")?.addEventListener("input", () => { clearTimeout(searchTimer); searchTimer = setTimeout(loadGlobal, 180); });
$("#global-chips")?.addEventListener("click", (event) => {
  const chip = event.target.closest(".chip");
  if (!chip) return;
  document.querySelectorAll(".chip").forEach((c) => c.classList.remove("active"));
  chip.classList.add("active");
  const origin = $("#global-origin");
  if (origin) { origin.value = chip.dataset.origin === "All" ? "" : chip.dataset.origin; loadGlobal(); }
});

/* carousel */
$(".slider-btn.next")?.addEventListener("click", () => { goTo(current + 1); restartTimer(); });
$(".slider-btn.prev")?.addEventListener("click", () => { goTo(current - 1); restartTimer(); });
dots.forEach((dot, i) => dot.addEventListener("click", () => { goTo(i); restartTimer(); }));

document.addEventListener("keydown", (e) => {
  if (e.key !== "Escape") return;
  setCartOpen(false); setOrdersOpen(false); setWishlistOpen(false); closeAuth(); closeDetail(); closeVisual(); closeProfile(); hideGlobal();
});

/* ---------------- init ---------------- */

(async function init() {
  await loadCatalog();
  await loadUser();
  await Promise.all([loadWishlistIds(), loadCart()]);
  renderHome(products);
  loadRecent();
  loadRecommendations();
  restartTimer();
})();
