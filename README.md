# Tmall Homepage Clone (English)

A visual and functional clone of the Tmall homepage. Plain HTML/CSS/JS on the frontend, a zero-dependency Node.js HTTP server on the backend, with products, accounts, carts, orders, and image-based search stored in JSON files.

## Run it

```bash
npm start
```

Open **http://localhost:3000**. No `npm install` needed — only Node.js 18+. Set `PORT=4000 npm start` to use another port.

You can also open `index.html` directly. Without the server, the page falls back to built-in product data, a localStorage cart, and local colour matching — accounts and uploads need the server.

## What you can do

- **Browse** 28 products on the homepage, with search and price filters.
- **Explore Global Finds** — a full catalog view with country chips, origin/category filters, sorting, and brand info.
- **Sign in / register** — password hashing (scrypt) and cookie sessions. Your guest cart and orders merge into your account when you sign in.
- **Cart** — add items, change quantities with +/− buttons, remove items, and see live totals and free-shipping progress. Stock is enforced.
- **Checkout** — places an order, reduces stock, clears the cart, and shows it in **Order History** (top bar). Free shipping over ¥200, otherwise ¥10.
- **Find Similar** — upload or drop a photo (or click "Find similar" on any product). The browser extracts its dominant colours, the server matches them against product palettes and returns ranked matches with a match percentage. Uploads are saved locally and your recent searches are shown in Global Finds.
- **Product details** — click any product card for a larger image, description, brand, origin, stock, colour swatches, star rating, reviews, and one-click "Find similar".
- **Favorites** — tap the ♡ on any card to save a product; manage saved items from the Favorites link in the top bar.
- **Reviews & ratings** — signed-in users can post star ratings and reviews; verified-purchase badges are awarded automatically. Ratings appear on product cards.
- **Personalised picks** — "Picked for You" ranks products using your recently viewed items, favorites, cart, orders and colour preferences. A "Recently Viewed" strip lets you pick up where you left off.
- **Coupons** — apply `WELCOME20` (20% off ¥100+), `SAVE10` (¥10 off ¥50+), or `FREESHIP` in the cart before checkout.
- **Profile dashboard** — click your name in the top bar for order count, total spent, favorites, reviews, and visual-search stats.
- **Smart search** — the search box suggests products, brands and countries as you type, plus trending terms.

## API

| Method | Endpoint | Description |
| --- | --- | --- |
| `GET` | `/api/products?search=&category=&origin=&brand=&global=&sort=&filter=` | Product list + facets |
| `GET` | `/api/products/:id` | Single product |
| `POST` | `/api/auth/register` | `{ name, email, password }` |
| `POST` | `/api/auth/login` | `{ email, password }` |
| `POST` | `/api/auth/logout` | End session |
| `GET` | `/api/auth` | Current user (or null) |
| `GET` | `/api/cart` | Cart with `items`, `count`, `subtotal` |
| `POST` | `/api/cart` | Add `{ id, quantity? }` |
| `PUT` | `/api/cart/:id` | Set `{ quantity }` (0 removes) |
| `DELETE` | `/api/cart/:id` | Remove item |
| `POST` | `/api/checkout` | Place order from cart |
| `GET` | `/api/orders` | Current owner's order history |
| `POST` | `/api/visual-search` | `{ image: dataURL, palette, category? }` → ranked matches |
| `GET` | `/api/visual-searches` | Recent visual searches |
| `GET` / `POST` | `/api/wishlist` | List favorites / toggle `{ id }` |
| `DELETE` | `/api/wishlist/:id` | Remove favorite |
| `GET` / `POST` | `/api/recently-viewed` | List / record `{ id }` |
| `GET` / `POST` | `/api/recommendations?limit=` | Personalised product picks |
| `GET` / `POST` | `/api/products/:id/reviews` | List / add `{ rating, title, body }` (sign-in required to add) |
| `GET` | `/api/coupons` | Available coupon codes |
| `POST` | `/api/coupons/validate` | `{ code, subtotal }` → validity + discount |
| `GET` | `/api/suggestions?q=` | Search suggestions + trending terms |
| `GET` | `/api/profile` | Account stats + reviews |

## Data

- `data/products.json` — seed catalog (brands, origins, colours, stock, descriptions)
- `data/store.json` — runtime state: users, sessions, carts, orders, visual searches (auto-created, gitignored)
- `data/uploads/` — uploaded search images (gitignored)

Delete `data/store.json` and `data/uploads/` while the server is stopped to reset everything.
