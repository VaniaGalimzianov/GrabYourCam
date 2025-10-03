// scripts/script.js
document.addEventListener('DOMContentLoaded', () => {

  // --- Работа с localStorage ---
  function loadCart() {
    try {
      return JSON.parse(localStorage.getItem('cart')) || [];
    } catch (e) {
      console.error('Ошибка парсинга cart из localStorage', e);
      return [];
    }
  }
  function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateHeaderCartCount();
  }

  // Обновление счётчика в хедере (если есть элемент с id="cart-count")
  function updateHeaderCartCount() {
    const countEl = document.getElementById('cart-count');
    if (!countEl) return;
    const cart = loadCart();
    const totalQuantity = cart.reduce((s, i) => s + Number(i.quantity || 0), 0);
    countEl.textContent = totalQuantity;
  }

  // --- Добавление товаров (на странице каталога) ---
  // ====== Добавление товаров (на странице каталога) ======
const addButtons = document.querySelectorAll('.add-to-cart');
if (addButtons && addButtons.length) {
  addButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const id = btn.dataset.id;
      const name = btn.dataset.name;
      const price = Number(btn.dataset.price) || 0;

      // ищем карточку товара
      const card = btn.closest('.product-card');
      const imgEl = card ? card.querySelector('.img-wrap img') : null;
      const image = imgEl ? imgEl.getAttribute('src') : '';

      const cart = loadCart();
      const exist = cart.find(it => String(it.id) === String(id));
      if (exist) {
        exist.quantity = Number(exist.quantity || 0) + 1;
      } else {
        cart.push({ 
          id: String(id), 
          name: String(name), 
          price: price, 
          quantity: 1,
          image: image   // ✅ сохраняем ссылку на картинку
        });
      }
      saveCart(cart);
    });
  });
}

  // --- Рендер корзины (на cart.html) ---
function renderCart() {
  const container = document.getElementById('cart-items');
  const totalEl = document.getElementById('cart-total');

  if (!container || !totalEl) return;

  const cart = loadCart();
  container.innerHTML = '';

  if (!cart.length) {
    container.innerHTML = '<p class="empty-cart">Ваша корзина пуста.</p>';
    totalEl.textContent = '0 ₽';
    return;
  }

  let total = 0;

  cart.forEach((item, index) => {
    const qty = Number(item.quantity || 0);
    const itemPrice = Number(item.price || 0);
    const itemTotal = itemPrice * qty;
    total += itemTotal;

    const el = document.createElement('div');
    el.className = 'cart-item';

    el.innerHTML = `
      <div class="cart-left">
        <img src="${escapeHtml(item.image || '')}" 
            alt="${escapeHtml(item.name)}" 
            class="cart-thumb" />
        <div class="cart-info">
          <div class="cart-name">${escapeHtml(String(item.name))}</div>
          <div class="cart-price">${itemPrice.toLocaleString()} ₽</div>
        </div>
      </div>

      <div class="cart-controls">
        <button class="decrease" data-index="${index}" aria-label="Уменьшить">−</button>
        <span class="qty">${qty}</span>
        <button class="increase" data-index="${index}" aria-label="Увеличить">+</button>
      </div>

      <div class="cart-sum">${itemTotal.toLocaleString()} ₽</div>

      <button class="remove" data-index="${index}" aria-label="Удалить">
        <img src="https://github.com/VaniaGalimzianov/GrabYourCam/blob/main/img/trash.svg" alt="Удалить" />
      </button>
    `;

    container.appendChild(el);
  });

  totalEl.textContent = total.toLocaleString() + ' ₽';

  // обработчики (+ / − / удалить)
  container.querySelectorAll('.increase').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      const cart = loadCart();
      if (cart[idx]) {
        cart[idx].quantity++;
        saveCart(cart);
        renderCart();
      }
    });
  });

  container.querySelectorAll('.decrease').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      const cart = loadCart();
      if (cart[idx]) {
        if (cart[idx].quantity > 1) {
          cart[idx].quantity--;
        } else {
          cart.splice(idx, 1);
        }
        saveCart(cart);
        renderCart();
      }
    });
  });

  container.querySelectorAll('.remove').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      const cart = loadCart();
      if (cart[idx]) {
        cart.splice(idx, 1);
        saveCart(cart);
        renderCart();
      }
    });
  });
}


  // --- Создать заказ ---
  const orderBtn = document.getElementById('create-order');
  if (orderBtn) {
    orderBtn.addEventListener('click', () => {
      alert('Заказ создан!');
      localStorage.removeItem('cart');
      renderCart();
      updateHeaderCartCount();
    });
  }

  // --- Бургер-меню (только если элементы есть) ---
  const burger = document.getElementById('burger');
  const mobileMenu = document.getElementById('mobileMenu');
  if (burger && mobileMenu) {
    burger.addEventListener('click', () => {
      mobileMenu.classList.toggle('active');
      burger.classList.toggle('open');
    });
  }

  // Запуски при загрузке страницы
  renderCart();
  updateHeaderCartCount();

  // ===== Вспомогательные функции =====
  function escapeHtml(str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

}); // end DOMContentLoaded
