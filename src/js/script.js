// =====================
// PRODUCT DATA
// =====================
const productData = [
	{
		id: 1,
		name: "Roller eraser for elementary school",
		price: 2.5,
		img: "https://img.alicdn.com/bao/uploaded/i2/3862696800/O1CN01rO2CJd206S8AoMDgS_!!0-item_pic.jpg_460x460q90.jpg_.webp",
	},
	{
		id: 2,
		name: "Anti-Myopia stitched notebook Student",
		price: 5.05,
		img: "https://img.alicdn.com/bao/uploaded/i3/2124153145/O1CN012bmdJF1Z6SiIMEv0x_!!4611686018427380025-0-item_pic.jpg_460x460q90.jpg_.webp",
	},
	{
		id: 3,
		name: "GT2 watch charger 2E charging",
		price: 55.25,
		img: "https://img.alicdn.com/bao/uploaded/i4/2219543796828/O1CN01RThleO20JHQlwT67O_!!4611686018427386972-0-item_pic.jpg_460x460q90.jpg_.webp",
	},
	{
		id: 4,
		name: "Wholesale phone holder, ring buckle",
		price: 7.79,
		img: "https://img.alicdn.com/bao/uploaded/i1/2209083264270/O1CN010YSHwm1hPiGos2xUl_!!2209083264270.jpg_460x460q90.jpg_.webp",
	},
	{
		id: 5,
		name: "Disposable waterproof and anti bacterial toilet seat cover",
		price: 7.5,
		img: "https://img.alicdn.com/bao/uploaded/i4/2219902819204/O1CN01hpvBoC2HrUVKOJ8k0_!!2219902819204.jpg_460x460q90.jpg_.webp",
	},
	{
		id: 6,
		name: "Operating room sandals, medical clogs",
		price: 45.9,
		img: "https://img.alicdn.com/bao/uploaded/i3/2216300976695/O1CN01gS8v2f1zKMk4L18ms_!!4611686018427386423-0-item_pic.jpg_460x460q90.jpg_.webp",
	},
	{
		id: 7,
		name: "Car perfume, Car fragrance, car air freshener",
		price: 38.75,
		img: "https://img.alicdn.com/bao/uploaded/i3/2218742651986/O1CN01MopT3a1QXdgKFXVZE_!!2218742651986.jpg_460x460q90.jpg_.webp",
	},
	{
		id: 8,
		name: "Clean and soft sterile disposable mens underwear",
		price: 110.55,
		img: "https://img.alicdn.com/bao/uploaded/i2/2217618979812/O1CN01wkXatR2MLxK1JSEjP_!!4611686018427386852-0-item_pic.jpg_460x460q90.jpg_.webp",
	},
	{
		id: 9,
		name: "Titanium gray large-pore frosted magnetic case for apple",
		price: 69.1,
		img: "https://img.alicdn.com/bao/uploaded/i2/2218612120115/O1CN01aDhM131CiieOAh2O4_!!4611686018427386419-0-item_pic.jpg_460x460q90.jpg_.webp",
	},
	{
		id: 10,
		name: "German Ultra-loud wireless Bluetooth speaker",
		price: 67.6,
		img: "https://img.alicdn.com/bao/uploaded/i2/2208457612939/O1CN01zqDlsy1Xa75A9CCt0_!!4611686018427387531-0-item_pic.jpg_460x460q90.jpg_.webp",
	},
	{
		id: 11,
		name: "ASUS Fearless 16 core Ultra5 Laptop",
		price: 8970.7,
		img: "https://img.alicdn.com/bao/uploaded/i3/686773455/O1CN01uzEl501bORWwiJKP4_!!4611686018427385039-0-item_pic.jpg_460x460q90.jpg_.webp",
	},
];

// =====================
// INVENTORY / STOCK DATA
// =====================
const inventory = [
	{ id: 1, name: "Roller Eraser", price: 2.5, stock: 15 },
	{ id: 2, name: "Anti-Myopia Notebook", price: 5.05, stock: 52 },
	{ id: 3, name: "GT2 Watch Charger", price: 55.25, stock: 8 },
	{ id: 4, name: "Phone Holder", price: 7.79, stock: 27 },
	{ id: 5, name: "Toilet Seat Cover", price: 7.5, stock: 22 },
	{ id: 6, name: "Medical Clogs", price: 45.9, stock: 32 },
	{ id: 7, name: "Car Perfume", price: 38.75, stock: 45 },
	{ id: 8, name: "Mens Underwear", price: 110.55, stock: 11 },
	{ id: 9, name: "iPhone Case", price: 69.1, stock: 56 },
	{ id: 10, name: "Bluetooth Speaker", price: 67.6, stock: 16 },
	{ id: 11, name: "ASUS Laptop", price: 8970.7, stock: 4 },
];

// =====================
// CART STATE
// =====================
let cartItems = JSON.parse(localStorage.getItem("cartItems")) || [];
let cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

// =====================
// RENDER PRODUCTS (DRY)
// =====================
const renderProducts = () => {
	const wrapper = document.getElementById("products-wrapper");
	wrapper.innerHTML = productData
		.map(
			({ id, name, price, img }) => `
	  <div class="product-card" data-id="${id}">
		<img src="${img}" alt="${name}"
		  onerror="this.src='https://via.placeholder.com/200x200?text=No+Image'" />
		<p>${name}</p>
		<p class="price">GH$ ${price.toFixed(2)}</p>
		<button class="cart-btn" onclick="addToCart('${name}', ${price}, '${img}', this)">
		  Add to Cart
		</button>
	  </div>
	`
		)
		.join("");
};

renderProducts();

// =====================
// SEARCH / FILTER + PRODUCT COUNT
// =====================
const searchInput = document.querySelector(".search-container input");
const productsWrapper = document.querySelector(".products-wrapper");
const totalProducts = document.querySelectorAll(".product-card").length;

const countDisplay = document.createElement("p");
countDisplay.id = "product-count";
countDisplay.textContent = `Showing ${totalProducts} products`;
productsWrapper.insertAdjacentElement("beforebegin", countDisplay);

const clearSearch = () => {
	searchInput.value = "";
	document
		.querySelectorAll(".product-card")
		.forEach((c) => (c.style.display = "flex"));
	const existing = document.getElementById("empty-state");
	if (existing) existing.remove();
	countDisplay.textContent = `Showing ${totalProducts} products`;
};

searchInput.addEventListener("input", function () {
	const searchText = this.value.toLowerCase();
	const cards = document.querySelectorAll(".product-card");
	let visibleCount = 0;

	cards.forEach((card) => {
		const name = card.querySelector("p").textContent.toLowerCase();
		const show = name.includes(searchText);
		card.style.display = show ? "flex" : "none";
		if (show) visibleCount++;
	});

	const existing = document.getElementById("empty-state");
	if (existing) existing.remove();

	if (visibleCount === 0 && searchText !== "") {
		const emptyState = document.createElement("div");
		emptyState.id = "empty-state";
		emptyState.innerHTML = `
		<div class="empty-state">
		  <p> No products found for "<strong>${searchText}</strong>"</p>
		  <p>Try searching for something else!</p>
		  <button onclick="clearSearch()">Clear Search</button>
		</div>`;
		productsWrapper.insertAdjacentElement("afterend", emptyState);
	}

	countDisplay.textContent =
		visibleCount === totalProducts
			? `Showing ${totalProducts} products`
			: `Showing ${visibleCount} of ${totalProducts} products`;
});

// =====================
// CART DISPLAY
// =====================
const cartCountDisplay = document.getElementById("cart-count");
cartCountDisplay.textContent = cartCount;

// =====================
// ADD TO CART (ONE FUNCTION FOR ALL)
// =====================
const addToCart = (name, price, img, button) => {
	const existing = cartItems.find((item) => item.name === name);
	if (existing) {
		existing.quantity++;
	} else {
		cartItems.push({ name, price, img, quantity: 1 });
	}

	cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
	cartCountDisplay.textContent = cartCount;
	localStorage.setItem("cartItems", JSON.stringify(cartItems));
	localStorage.setItem("cartCount", cartCount);

	button.textContent = " Added!";
	button.style.background = "#006600";
	setTimeout(() => {
		button.textContent = "Add to Cart";
		button.style.background = "#cc0000";
	}, 1500);
};

// =====================
// PROMO BUTTONS
// =====================
const promoButtons = document.querySelectorAll(".promo-btn");
const productCards = document.querySelectorAll(".product-card");

const getPrice = (card) =>
	parseFloat(
		card.querySelector(".price").textContent.replace("GH$", "").trim()
	);

const scrollToProducts = () =>
	document
		.querySelector(".products-wrapper")
		.scrollIntoView({ behavior: "smooth" });

const filterCards = (filterFn) => {
	productCards.forEach((card) => {
		card.style.display = filterFn(card) ? "flex" : "none";
	});
	scrollToProducts();
};

promoButtons[0]?.addEventListener("click", () =>
	filterCards((c) => getPrice(c) <= 20)
);
promoButtons[1]?.addEventListener("click", () =>
	filterCards((c) => getPrice(c) >= 20 && getPrice(c) <= 60)
);
promoButtons[2]?.addEventListener("click", () => filterCards(() => true));

// =====================
// DROPDOWN CATEGORY FILTER
// =====================
document.querySelectorAll(".dropdown-menu li a").forEach((link) => {
	link.addEventListener("click", (e) => {
		e.preventDefault();
		const category = link.textContent.toLowerCase();
		filterCards((card) =>
			card.querySelector("p").textContent.toLowerCase().includes(category)
		);
	});
});

// =====================
// IMAGE SLIDER
// =====================
const slidesWrapper = document.querySelector(".slides-wrapper");
const dots = document.querySelectorAll(".dot");
const prevBtn = document.querySelector(".slider-btn.prev");
const nextBtn = document.querySelector(".slider-btn.next");
let currentSlide = 0;
const totalSlides = 3;

const goToSlide = (index) => {
	currentSlide = (index + totalSlides) % totalSlides;
	slidesWrapper.style.transform = `translateX(-${currentSlide * 100}%)`;
	dots.forEach((d) => d.classList.remove("active"));
	dots[currentSlide].classList.add("active");
};

nextBtn?.addEventListener("click", () => goToSlide(currentSlide + 1));
prevBtn?.addEventListener("click", () => goToSlide(currentSlide - 1));
dots.forEach((dot, i) => dot.addEventListener("click", () => goToSlide(i)));
setInterval(() => goToSlide(currentSlide + 1), 4000);

// =====================
// FILTER BY PRICE
// =====================
const filterByPrice = (maxPrice) => {
	const cards = document.querySelectorAll(".product-card");
	let count = 0;
	cards.forEach((card) => {
		const show = getPrice(card) <= maxPrice;
		card.style.display = show ? "flex" : "none";
		if (show) count++;
	});
	console.log(` Products under GH$ ${maxPrice}: ${count} found`);
};

// =====================
// PRICE CALCULATOR
// =====================
const products = [
	{ id: 1, name: "Roller Eraser", price: 2.5 },
	{ id: 2, name: "Anti-Myopia Notebook", price: 5.05 },
	{ id: 3, name: "GT2 Watch Charger", price: 55.25 },
	{ id: 4, name: "Phone Holder", price: 7.79 },
	{ id: 5, name: "Toilet Seat Cover", price: 7.5 },
	{ id: 6, name: "Medical Clogs", price: 45.9 },
	{ id: 7, name: "Car Perfume", price: 38.75 },
	{ id: 8, name: "Mens Underwear", price: 110.55 },
	{ id: 9, name: "iPhone Case", price: 69.1 },
	{ id: 10, name: "Bluetooth Speaker", price: 67.6 },
];

const TAX_RATE = 0.15;
const CURRENCY = "GH$";
let discount = 0;

const calculatePrice = (productId, quantity) => {
	const product = products.find(({ id }) => id === productId);
	if (!product) return console.log(" Product not found!");
	const { name, price } = product;
	const subtotal = price * quantity;
	const tax = subtotal * TAX_RATE;
	const total = subtotal + tax - discount;
	console.log("================================");
	console.log("🛒 TMALL PRICE CALCULATOR");
	console.log("================================");
	console.log(` Product   : ${name}`);
	console.log(` Unit Price: ${CURRENCY} ${price}`);
	console.log(` Quantity  : ${quantity}`);
	console.log(` Subtotal  : ${CURRENCY} ${subtotal.toFixed(2)}`);
	console.log(` Tax (15%) : ${CURRENCY} ${tax.toFixed(2)}`);
	if (discount > 0)
		console.log(` Discount  : -${CURRENCY} ${discount.toFixed(2)}`);
	console.log("--------------------------------");
	console.log(` TOTAL     : ${CURRENCY} ${total.toFixed(2)}`);
	console.log("================================");
};

const applyDiscount = (amount) => {
	discount = amount;
	console.log(` Discount of ${CURRENCY} ${amount} applied!`);
};

const showProducts = () => {
	console.log("================================");
	console.log(" AVAILABLE PRODUCTS");
	console.log("================================");
	products.forEach(({ id, name, price }) =>
		console.log(`ID: ${id} | ${name} | ${CURRENCY} ${price}`)
	);
	console.log("================================");
	console.log(" Usage: calculatePrice(id, quantity)");
};

// =====================
// STOCK CHECKER
// =====================
const getStockStatus = ({ name, stock }) => {
	if (stock === 0) return ` ${name} — Out of Stock`;
	if (stock <= 5) return `  ${name} — Only ${stock} left!`;
	if (stock <= 10) return ` ${name} — Low Stock: ${stock} units`;
	return ` ${name} — In Stock: ${stock} units`;
};

const checkAllStock = () => {
	console.log("================================");
	console.log("📦 STOCK CHECKER - ALL PRODUCTS");
	console.log("================================");
	const inStock = inventory.filter(({ stock }) => stock > 0);
	const outOfStock = inventory.filter(({ stock }) => stock === 0);
	inventory.forEach((p) => console.log(getStockStatus(p)));
	console.log("--------------------------------");
	console.log(`In Stock    : ${inStock.length} products`);
	console.log(` Out of Stock: ${outOfStock.length} products`);
	console.log("================================");
};

const findFirstAvailable = () => {
	const first = inventory.find(({ stock }) => stock > 0);
	console.log("================================");
	console.log(" FINDING FIRST AVAILABLE ITEM");
	console.log("================================");
	first
		? console.log(` ${first.name} | GH$ ${first.price} | ${first.stock} units`)
		: console.log(" No products available!");
	console.log("================================");
};

const checkStock = (productId) => {
	const product = inventory.find(({ id }) => id === productId);
	if (!product) return console.log(" Product not found!");
	console.log(getStockStatus(product));
};

// =====================
// AUTO RUN ON PAGE LOAD
// =====================
console.log(" Tmall Loaded! Available commands:");
console.log(" showProducts() |  calculatePrice(id, qty) | applyDiscount(amt)");
console.log("checkAllStock() |  checkStock(id) |  findFirstAvailable()");
console.log(" filterByPrice(maxPrice)");
showProducts();
checkAllStock();

// =====================
// FETCH LIVE EXCHANGE RATE
// =====================
const getLiveRate = async () => {
	try {
		const res = await fetch("https://api.exchangerate-api.com/v4/latest/USD");
		const data = await res.json();
		console.log(`💱 Live Rate: 1 USD = GH$ ${data.rates.GHS}`);
		return data.rates.GHS;
	} catch {
		console.log(" Using fallback rate: GH$ 15.50");
		return 15.5;
	}
};

// =====================
// FETCH PRODUCTS (YOU MIGHT LIKE)
// =====================
const fetchProducts = async () => {
	const container = document.getElementById("fetched-products");
	try {
		container.innerHTML = `<div class="loading-state"><p> Loading products...</p></div>`;
		const USD_TO_GHS = await getLiveRate();
		const res = await fetch("https://fakestoreapi.com/products?limit=8");
		if (!res.ok) throw new Error(`Server error: ${res.status}`);
		const fetched = await res.json();
		if (!fetched || fetched.length === 0) {
			container.innerHTML = `<div class="empty-state"><p> No products available right now.</p></div>`;
			return;
		}
		container.innerHTML = fetched
			.map(
				({ id, title, price, image }) => `
		<div class="fetched-card" data-id="${id}">
		  <img src="${image}" alt="${title}"
			onerror="this.src='https://via.placeholder.com/200x200?text=No+Image'" />
		  <p>${title}</p>
		  <p class="price">GH$ ${(price * USD_TO_GHS).toFixed(2)}</p>
		  <button class="cart-btn"
			onclick="addToCart('${title}', ${parseFloat(
					(price * USD_TO_GHS).toFixed(2)
				)}, '${image}', this)">
			Add to Cart
		  </button>
		</div>
	  `
			)
			.join("");
	} catch (error) {
		container.innerHTML = `
		<div class="error-state">
		  <p> Oops! Could not load products.</p>
		  <p>Check your internet connection and try again.</p>
		  <button onclick="fetchProducts()"> Retry</button>
		</div>`;
		console.log("API Error:", error.message);
	}
};

fetchProducts();

// =====================
// MODAL SETUP
// =====================
const modalOverlay = document.getElementById("modal-overlay");
const modalContent = document.getElementById("modal-content");
const modalClose = document.getElementById("modal-close");

const closeModal = () => modalOverlay.classList.remove("active");
modalClose.addEventListener("click", closeModal);
modalOverlay.addEventListener("click", (e) => {
	if (e.target === modalOverlay) closeModal();
});

// =====================
// SMART MODAL POSITION HELPER
// =====================
const positionModal = (cardElement) => {
	const modal = document.querySelector(".modal");
	const cardRect = cardElement.getBoundingClientRect();
	const modalWidth = 340;
	const modalHeight = 420;
	const screenWidth = window.innerWidth;
	const screenHeight = window.innerHeight;

	// Horizontal: show right of card, flip left if no space
	let left = cardRect.right + 10;
	if (left + modalWidth > screenWidth) {
		left = cardRect.left - modalWidth - 10;
	}
	// Make sure it doesn't go off left edge
	if (left < 10) left = 10;

	// Vertical: align with card top, adjust if off bottom
	let top = cardRect.top;
	if (top + modalHeight > screenHeight) {
		top = screenHeight - modalHeight - 10;
	}
	if (top < 10) top = 10;

	modal.style.left = `${left}px`;
	modal.style.top = `${top}px`;
};

// =====================
// FETCHED CARD MODAL (API data)
// =====================
const loadProductDetail = async (productId, cardElement) => {
	modalOverlay.classList.add("active");
	modalContent.innerHTML = `<p>⏳ Loading product details...</p>`;

	try {
		const USD_TO_GHS = await getLiveRate();
		const res = await fetch(`https://fakestoreapi.com/products/${productId}`);
		if (!res.ok) throw new Error(`Server error: ${res.status}`);
		const { title, price, image, category, description, rating } =
			await res.json();
		const ghsPrice = (price * USD_TO_GHS).toFixed(2);
		modalContent.innerHTML = `
		<img src="${image}" alt="${title}" />
		<div class="modal-info">
		  <h3>${title}</h3>
		  <p class="price">GH$ ${ghsPrice}</p>
		  <p class="category">📂 ${category}</p>
		  <p class="rating">⭐ ${rating.rate} (${rating.count} reviews)</p>
		  <p class="description">${description}</p>
		  <button class="cart-btn"
			onclick="addToCart('${title}', ${parseFloat(ghsPrice)}, '${image}', this)">
			Add to Cart
		  </button>
		</div>`;
	} catch (error) {
		modalContent.innerHTML = `<p> Failed to load. Try again.</p>`;
	}
};

// =====================
// LOCAL CARD MODAL (local data)
// =====================
const loadLocalProductDetail = (productId, cardElement) => {
	const product = productData.find(({ id }) => id === productId);
	const stockInfo = inventory.find(({ id }) => id === productId);
	if (!product) return;

	modalOverlay.classList.add("active");
	positionModal(cardElement);

	const stock = stockInfo?.stock ?? "N/A";
	const stockLabel =
		stock === 0
			? `<span style="color:red"> Out of Stock</span>`
			: stock <= 5
			? `<span style="color:orange"> Only ${stock} left!</span>`
			: `<span style="color:green"> In Stock (${stock} units)</span>`;

	modalContent.innerHTML = `
	  <img src="${product.img}" alt="${product.name}" />
	  <div class="modal-info">
		<h3>${product.name}</h3>
		<p class="price">GH$ ${product.price.toFixed(2)}</p>
		<p class="rating">${stockLabel}</p>
		<p class="description">High quality product available on Tmall. Add to cart to order now!</p>
		<button class="cart-btn"
		  onclick="addToCart('${product.name}', ${product.price}, '${
		product.img
	}', this)">
		  Add to Cart
		</button>
	  </div>`;
};

// =====================
// CLICK HANDLERS FOR MODALS
// =====================
const backdrop = document.getElementById("card-backdrop");

document.addEventListener("click", (e) => {
	// Close if backdrop clicked
	if (e.target === backdrop) {
		document
			.querySelectorAll(".expanded")
			.forEach((c) => c.classList.remove("expanded"));
		backdrop.classList.remove("active");
		return;
	}

	const card = e.target.closest(".product-card, .fetched-card");
	if (card && !e.target.classList.contains("cart-btn")) {
		const isExpanded = card.classList.contains("expanded");
		document
			.querySelectorAll(".expanded")
			.forEach((c) => c.classList.remove("expanded"));
		if (!isExpanded) {
			card.classList.add("expanded");
			backdrop.classList.add("active");
		} else {
			backdrop.classList.remove("active");
		}
	}
});

// =====================
// CART SIDEBAR
// =====================
const cartSidebar = document.getElementById("cart-sidebar");
const cartSidebarClose = document.getElementById("cart-sidebar-close");
const cartSidebarItems = document.getElementById("cart-sidebar-items");
const cartOverlay = document.getElementById("cart-overlay");
const cartTotalDisplay = document.getElementById("cart-total");

const renderCartSidebar = () => {
	if (cartItems.length === 0) {
		cartSidebarItems.innerHTML = `<p class="cart-empty">🛒 Your cart is empty!</p>`;
		cartTotalDisplay.textContent = "GH$ 0.00";
		return;
	}
	cartSidebarItems.innerHTML = cartItems
		.map(
			(item, index) => `
	  <div class="cart-item">
		<img src="${item.img}" alt="${item.name}" />
		<div class="cart-item-info">
		  <p>${item.name}</p>
		  <span>GH$ ${item.price.toFixed(2)} x ${item.quantity}</span>
		</div>
		<div class="cart-item-controls">
		  <button onclick="decreaseQty(${index})">−</button>
		  <span>${item.quantity}</span>
		  <button onclick="increaseQty(${index})">+</button>
		  <button class="cart-item-remove" onclick="removeFromCart(${index})">🗑️</button>
		</div>
	  </div>
	`
		)
		.join("");
	const total = cartItems.reduce(
		(sum, item) => sum + item.price * item.quantity,
		0
	);
	cartTotalDisplay.textContent = `GH$ ${total.toFixed(2)}`;
};

document.querySelector(".cart-icon").addEventListener("click", () => {
	cartSidebar.classList.add("open");
	cartOverlay.classList.add("active");
	renderCartSidebar();
});

const closeCartSidebar = () => {
	cartSidebar.classList.remove("open");
	cartOverlay.classList.remove("active");
};

cartSidebarClose.addEventListener("click", closeCartSidebar);
cartOverlay.addEventListener("click", closeCartSidebar);

const removeFromCart = (index) => {
	const removed = cartItems.splice(index, 1)[0];
	cartCount -= removed.quantity;
	if (cartCount < 0) cartCount = 0;
	cartCountDisplay.textContent = cartCount;
	localStorage.setItem("cartItems", JSON.stringify(cartItems));
	localStorage.setItem("cartCount", cartCount);
	renderCartSidebar();
};

const increaseQty = (index) => {
	cartItems[index].quantity++;
	cartCount++;
	cartCountDisplay.textContent = cartCount;
	localStorage.setItem("cartItems", JSON.stringify(cartItems));
	localStorage.setItem("cartCount", cartCount);
	renderCartSidebar();
};

const decreaseQty = (index) => {
	if (cartItems[index].quantity > 1) {
		cartItems[index].quantity--;
		cartCount--;
		cartCountDisplay.textContent = cartCount;
		localStorage.setItem("cartItems", JSON.stringify(cartItems));
		localStorage.setItem("cartCount", cartCount);
		renderCartSidebar();
	} else {
		removeFromCart(index);
	}
};
