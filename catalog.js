/* ============================================================
   Veya — shared catalog + cart
   Real products & variant IDs from the Veya Shopify store.
   "Add to cart" builds a real Shopify cart permalink at checkout.
   ============================================================ */

const VEYA_SHOP = "zqrvju-gp.myshopify.com";
const DISCLAIMER =
  "These statements have not been evaluated by the Food and Drug Administration. This product is not intended to diagnose, treat, cure, or prevent any disease. Consult a healthcare provider before use, especially if pregnant, nursing, taking medication, or managing a medical condition.";

/* Each product → a single card. Focus Powder consolidates its 3 flavors,
   each mapping to its own Shopify product/variant. */
const PRODUCTS = [
  {
    handle: "lucid-brain-focus-formula",
    name: "Brain & Focus Formula",
    img: "images/brain-focus.png",
    accent: "#6fb4ff",
    cat: "focus",
    form: "Daily nootropic · capsule",
    price: 39.90,
    variantId: "46413464600749",
    tagline: "Clear thinking, on demand.",
    body:
      "A daily nootropic capsule crafted to support healthy cognitive function — concentration, memory, and mental clarity — for the hours that need your sharpest self.",
    bullets: [
      "Supports focus, memory, and cognitive clarity",
      "Daily nootropic support in a simple capsule",
      "Pairs well with Focus Powder for active sessions",
    ],
    how: "Take as directed.",
    shape: "bottle",
  },
  {
    handle: "lucid-focus-powder",
    name: "Focus Powder",
    cat: "focus",
    form: "Nootropic energy drink mix",
    price: 39.90,
    tagline: "Mix it. Sip it. Lock in.",
    body:
      "A mix-and-go nootropic energy blend — Alpha-GPC, L-theanine, and natural caffeine for clean, crash-free focus, with Asian ginseng, L-arginine, B vitamins, inositol, and black pepper extract to round it out. A smarter alternative to sugary energy drinks.",
    bullets: [
      "Supports sustained focus and clean, steady energy",
      "L-theanine + natural caffeine for alertness without the crash",
      "Three sour flavors — mixes fast, no clumps",
    ],
    how: "Mix 2 scoops with water. Do not exceed the recommended servings per day.",
    shape: "pouch",
    flavors: [
      { name: "Sour Grape", variantId: "46413464010925", handle: "lucid-focus-powder-sour-grape", accent: "#a06bff", img: "images/focus-powder-grape.png" },
      { name: "Sour Candy", variantId: "46413463748781", handle: "lucid-focus-powder-sour-candy", accent: "#ff6ba6", img: "images/focus-powder-candy.png" },
      { name: "Sour Gummi Worm", variantId: "46413462667437", handle: "lucid-focus-powder-sour-gummi-worm", accent: "#ff9d3c", img: "images/focus-powder-gummi.png" },
    ],
  },
  {
    handle: "lucid-sleep-support",
    name: "Sleep Support",
    img: "images/sleep-support.png",
    accent: "#b18cff",
    cat: "rest",
    form: "Nightly capsule",
    price: 29.90,
    variantId: "46413461291181",
    tagline: "Calm the noise. Settle in.",
    body:
      "A comprehensive nightly capsule — magnesium citrate and vitamin B6 to support normal nervous system and muscle function, melatonin to work with your natural sleep cycle, and a calming botanical blend of chamomile, passion flower, lemon balm, GABA, L-theanine, ashwagandha, and 5-HTP.",
    bullets: [
      "Supports a calm, relaxed state before bed",
      "Magnesium citrate + B6 for normal nervous system function",
      "Botanical blend to help quiet a busy mind",
    ],
    how: "Take two capsules daily, ahead of bedtime.",
    shape: "bottle",
  },
  {
    handle: "sleep-formula",
    name: "Sleep Formula",
    img: "images/sleep-formula.png",
    accent: "#b18cff",
    cat: "rest",
    form: "Botanical capsule",
    price: 29.90,
    variantId: "46413458768045",
    tagline: "Wind down naturally. Wake up ready.",
    body:
      "Calming botanicals and sleep-supporting compounds — including valerian extract, chamomile, and GABA — to help you ease into a restful night, the natural way. No artificial additives.",
    bullets: [
      "Supports relaxation and a calm, restful night",
      "Works with your body's natural sleep cycle",
      "Botanical blend — no artificial additives",
    ],
    how: "Take as directed, 30–45 minutes before bed.",
    shape: "bottle",
  },
  {
    handle: "sleep-strips-raspberry-flavor",
    name: "Sleep Strips",
    img: "images/sleep-strips.png",
    accent: "#bf9bff",
    cat: "rest",
    form: "Dissolvable oral strips · Raspberry",
    price: 36.50,
    variantId: "46413459751085",
    tagline: "One strip. Lights out.",
    body:
      "Dissolve right on your tongue — no water, no capsules. A fast, fuss-free way to cue your wind-down, with valerian, lavender, chamomile, hibiscus, and a measured dose of melatonin.",
    bullets: [
      "Fast-dissolving oral strip — no water needed",
      "Supports relaxation and an easy drift to sleep",
      "Raspberry flavor — travel-friendly and simple to use",
    ],
    how: "Place one strip on your tongue before bed. One strip per day.",
    shape: "box",
  },
];

const productByHandle = (h) => PRODUCTS.find((p) => p.handle === h);

/* ---------- cart (localStorage) ---------- */
const CART_KEY = "lucid_cart_v1";
const getCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } };
const saveCart = (c) => { localStorage.setItem(CART_KEY, JSON.stringify(c)); renderCart(); };

function addToCart(variantId, name, price, qty = 1, sub = "") {
  const cart = getCart();
  const found = cart.find((i) => i.variantId === variantId);
  if (found) found.qty += qty;
  else cart.push({ variantId, name, price, sub, qty });
  saveCart(cart);
  openCart();
  pulseCartBtn();
}
function setQty(variantId, qty) {
  let cart = getCart();
  if (qty <= 0) cart = cart.filter((i) => i.variantId !== variantId);
  else { const it = cart.find((i) => i.variantId === variantId); if (it) it.qty = qty; }
  saveCart(cart);
}
const cartCount = () => getCart().reduce((n, i) => n + i.qty, 0);
const cartTotal = () => getCart().reduce((s, i) => s + i.price * i.qty, 0);

function checkout() {
  const cart = getCart();
  if (!cart.length) return;
  const path = cart.map((i) => `${i.variantId}:${i.qty}`).join(",");
  window.location.href = `https://${VEYA_SHOP}/cart/${path}`;
}

/* ---------- cart drawer UI (injected on every page) ---------- */
function ensureCartDOM() {
  if (document.getElementById("lucid-cart-style")) return;
  const css = `
  .lucid-cartbtn{position:relative;background:transparent;border:1px solid var(--line);color:var(--ink);
    width:44px;height:44px;border-radius:100px;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;transition:border-color .2s,transform .2s}
  .lucid-cartbtn:hover{border-color:rgba(255,255,255,.3);transform:translateY(-1px)}
  .lucid-cartbtn .cnt{position:absolute;top:-6px;right:-6px;min-width:19px;height:19px;padding:0 5px;border-radius:100px;
    background:linear-gradient(120deg,var(--focus),var(--rest));color:#0a0b10;font-size:11px;font-weight:700;display:none;align-items:center;justify-content:center;font-family:'Inter',sans-serif}
  .lucid-cartbtn.has .cnt{display:flex}
  .lucid-cartbtn.pulse{animation:lucidpulse .5s var(--ease)}
  @keyframes lucidpulse{0%{transform:scale(1)}40%{transform:scale(1.18)}100%{transform:scale(1)}}
  .lucid-overlay{position:fixed;inset:0;background:rgba(4,5,9,.6);backdrop-filter:blur(3px);opacity:0;pointer-events:none;transition:opacity .3s;z-index:90}
  .lucid-overlay.open{opacity:1;pointer-events:auto}
  .lucid-drawer{position:fixed;top:0;right:0;height:100%;width:400px;max-width:92vw;background:#0d0f17;border-left:1px solid var(--line);
    z-index:91;transform:translateX(105%);transition:transform .38s var(--ease);display:flex;flex-direction:column;box-shadow:-30px 0 80px rgba(0,0,0,.5)}
  .lucid-drawer.open{transform:none}
  .lucid-drawer .dh{display:flex;align-items:center;justify-content:space-between;padding:22px 24px;border-bottom:1px solid var(--line)}
  .lucid-drawer .dh h3{font-family:'Fraunces',serif;font-size:22px;margin:0}
  .lucid-drawer .dh button{background:none;border:none;color:var(--muted);font-size:24px;cursor:pointer;line-height:1}
  .lucid-items{flex:1;overflow-y:auto;padding:8px 24px}
  .lucid-empty{color:var(--muted);text-align:center;padding:60px 20px;font-size:15px}
  .lucid-row{display:flex;gap:14px;align-items:center;padding:18px 0;border-bottom:1px solid var(--line)}
  .lucid-row .thumb{width:52px;height:52px;border-radius:12px;flex:0 0 auto;background:linear-gradient(150deg,var(--focus),var(--rest))}
  .lucid-row.rest .thumb{background:linear-gradient(150deg,var(--rest),var(--rest-2))}
  .lucid-row .info{flex:1;min-width:0}
  .lucid-row .info b{font-size:14px;font-weight:600;display:block;line-height:1.3}
  .lucid-row .info span{font-size:12px;color:var(--muted)}
  .lucid-stepper{display:inline-flex;align-items:center;gap:0;border:1px solid var(--line);border-radius:100px;margin-top:8px}
  .lucid-stepper button{background:none;border:none;color:var(--ink);width:26px;height:26px;cursor:pointer;font-size:15px}
  .lucid-stepper span{font-size:13px;min-width:22px;text-align:center}
  .lucid-row .pr{font-family:'Fraunces',serif;font-size:15px;white-space:nowrap}
  .lucid-foot{padding:20px 24px;border-top:1px solid var(--line)}
  .lucid-foot .tot{display:flex;justify-content:space-between;align-items:baseline;margin-bottom:14px}
  .lucid-foot .tot b{font-family:'Fraunces',serif;font-size:24px}
  .lucid-foot .tot span{color:var(--muted);font-size:13px}
  .lucid-foot .co{width:100%;justify-content:center;background:var(--ink);color:#0a0b10;border:none;padding:15px;border-radius:100px;font-weight:600;font-size:15px;font-family:inherit;cursor:pointer;transition:transform .2s,box-shadow .2s}
  .lucid-foot .co:hover{transform:translateY(-2px);box-shadow:0 14px 38px rgba(255,255,255,.14)}
  .lucid-foot .co:disabled{opacity:.4;cursor:not-allowed;transform:none;box-shadow:none}
  .lucid-foot .sec{text-align:center;color:var(--muted);font-size:11px;margin-top:10px}
  .pc-media .pviz-img{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1}
  .media .pviz-img{display:block;width:100%;height:auto;border-radius:24px}
  `;
  const style = document.createElement("style");
  style.id = "lucid-cart-style";
  style.textContent = css;
  document.head.appendChild(style);

  const wrap = document.createElement("div");
  wrap.innerHTML = `
    <div class="lucid-overlay" id="lucidOverlay" onclick="closeCart()"></div>
    <aside class="lucid-drawer" id="lucidDrawer" aria-label="Shopping cart">
      <div class="dh"><h3>Your cart</h3><button onclick="closeCart()" aria-label="Close">×</button></div>
      <div class="lucid-items" id="lucidItems"></div>
      <div class="lucid-foot">
        <div class="tot"><span>Subtotal</span><b id="lucidTotal">$0.00</b></div>
        <button class="co" id="lucidCheckout" onclick="checkout()">Checkout securely →</button>
        <div class="sec">Secure checkout on Shopify · Free shipping over $70</div>
      </div>
    </aside>`;
  document.body.appendChild(wrap);
}

function renderCart() {
  const items = document.getElementById("lucidItems");
  if (!items) return;
  const cart = getCart();
  if (!cart.length) {
    items.innerHTML = `<div class="lucid-empty">Your cart is empty.<br>Time to get clear.</div>`;
  } else {
    items.innerHTML = cart
      .map((i) => {
        const p = PRODUCTS.find((x) => i.name.includes(x.name)) || {};
        const restCls = p.cat === "rest" ? "rest" : "";
        return `<div class="lucid-row ${restCls}">
          <div class="thumb"></div>
          <div class="info"><b>${i.name}</b><span>${i.sub || ""}</span>
            <div class="lucid-stepper">
              <button onclick="setQty('${i.variantId}', ${i.qty - 1})">−</button>
              <span>${i.qty}</span>
              <button onclick="setQty('${i.variantId}', ${i.qty + 1})">+</button>
            </div>
          </div>
          <div class="pr">$${(i.price * i.qty).toFixed(2)}</div>
        </div>`;
      })
      .join("");
  }
  const tot = document.getElementById("lucidTotal");
  if (tot) tot.textContent = "$" + cartTotal().toFixed(2);
  const co = document.getElementById("lucidCheckout");
  if (co) co.disabled = !cart.length;
  document.querySelectorAll(".lucid-cartbtn").forEach((b) => {
    const c = cartCount();
    b.classList.toggle("has", c > 0);
    const cnt = b.querySelector(".cnt");
    if (cnt) cnt.textContent = c;
  });
}
function openCart() { ensureCartDOM(); document.getElementById("lucidDrawer").classList.add("open"); document.getElementById("lucidOverlay").classList.add("open"); }
function closeCart() { const d = document.getElementById("lucidDrawer"); if (d) { d.classList.remove("open"); document.getElementById("lucidOverlay").classList.remove("open"); } }
function pulseCartBtn() { document.querySelectorAll(".lucid-cartbtn").forEach((b) => { b.classList.remove("pulse"); void b.offsetWidth; b.classList.add("pulse"); }); }

/* ---------- homepage catalog rendering ---------- */
function money(n) { return "$" + n.toFixed(2); }

function productCard(p) {
  const flavorOpts = p.flavors
    ? `<div class="pc-flavors" data-handle="${p.handle}">${p.flavors
        .map((f, idx) => `<button class="pc-flav ${idx === 0 ? "on" : ""}" style="--fa:${f.accent}" data-vid="${f.variantId}" data-name="${f.name}">${f.name}</button>`)
        .join("")}</div>`
    : "";
  const defaultVid = p.flavors ? p.flavors[0].variantId : p.variantId;
  const defaultSub = p.flavors ? p.flavors[0].name : p.form;
  return `<article class="pc ${p.cat}">
    <a class="pc-media" href="product.html?handle=${p.handle}" aria-label="${p.name}">
      <span class="pc-aura"></span>
      ${productVisual(p)}
    </a>
    <div class="pc-body">
      <div class="pc-form">${p.form}</div>
      <h3><a href="product.html?handle=${p.handle}">Veya ${p.name}</a></h3>
      <p class="pc-tag">${p.tagline}</p>
      ${flavorOpts}
      <div class="pc-buy">
        <div class="pc-price">${money(p.price)}</div>
        <button class="pc-add" data-handle="${p.handle}" data-vid="${defaultVid}" data-name="${p.name}" data-sub="${defaultSub}" data-price="${p.price}">Add to cart</button>
      </div>
    </div>
  </article>`;
}

/* CSS-rendered fallback shape (used when a real photo isn't on disk yet) */
function cssVisual(p) {
  if (p.shape === "pouch")
    return `<div class="viz pouch"><div class="seal"></div><div class="lbl"><b>${p.name.toUpperCase()}</b><small>Focus Mix</small></div></div>`;
  if (p.shape === "box")
    return `<div class="viz box"><div class="lbl"><b>${p.name.toUpperCase()}</b><small>30 Strips</small></div></div>`;
  return `<div class="viz vial"><div class="lbl"><b>${p.name.split(" ")[0].toUpperCase()}</b><small>${p.cat === "rest" ? "Night" : "Day"} Formula</small></div></div>`;
}

/* Real photo if available, else graceful fallback to the CSS shape */
function productVisual(p, imgUrl) {
  const url = imgUrl || p.img || (p.flavors && p.flavors[0].img);
  if (url) return `<img src="${url}" alt="Veya ${p.name}" class="pviz-img" onerror="lucidImgFail(this,'${p.handle}')">`;
  return cssVisual(p);
}
function lucidImgFail(el, handle) {
  const p = productByHandle(handle);
  if (p) el.outerHTML = cssVisual(p);
}

function renderCatalog() {
  const focusWrap = document.getElementById("grid-focus");
  const restWrap = document.getElementById("grid-rest");
  if (focusWrap) focusWrap.innerHTML = PRODUCTS.filter((p) => p.cat === "focus").map(productCard).join("");
  if (restWrap) restWrap.innerHTML = PRODUCTS.filter((p) => p.cat === "rest").map(productCard).join("");

  // flavor switching
  document.querySelectorAll(".pc-flavors").forEach((row) => {
    row.querySelectorAll(".pc-flav").forEach((btn) => {
      btn.addEventListener("click", () => {
        row.querySelectorAll(".pc-flav").forEach((b) => b.classList.remove("on"));
        btn.classList.add("on");
        const card = row.closest(".pc");
        const add = card.querySelector(".pc-add");
        add.dataset.vid = btn.dataset.vid;
        add.dataset.sub = btn.dataset.name;
        // swap the product photo to match the selected flavor
        const flav = PRODUCTS.flatMap((p) => p.flavors || []).find((f) => f.variantId === btn.dataset.vid);
        const img = card.querySelector(".pc-media .pviz-img");
        if (flav && flav.img && img) img.src = flav.img;
      });
    });
  });
  // add to cart
  document.querySelectorAll(".pc-add").forEach((btn) => {
    btn.addEventListener("click", () => {
      addToCart(btn.dataset.vid, "Veya " + btn.dataset.name, parseFloat(btn.dataset.price), 1, btn.dataset.sub);
      const t = btn.textContent; btn.textContent = "Added ✓";
      setTimeout(() => (btn.textContent = t), 1300);
    });
  });
}

/* ---------- boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  ensureCartDOM();
  renderCart();
  renderCatalog();
  document.querySelectorAll(".lucid-cartbtn").forEach((b) => b.addEventListener("click", openCart));
});
