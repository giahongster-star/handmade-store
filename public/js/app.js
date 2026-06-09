// Global state / helper
let isRegisterMode = false;

// Modal control
function openAuthModal() {
  const modal = document.getElementById('auth-modal');
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  document.body.classList.add('overflow-hidden');
  setAuthMode(false);
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  document.body.classList.remove('overflow-hidden');
  document.getElementById('auth-error-msg').classList.add('hidden');
}

function setAuthMode(registerMode) {
  isRegisterMode = registerMode;
  const title = document.getElementById('auth-modal-title');
  const subtitle = document.getElementById('auth-modal-subtitle');
  const nameField = document.getElementById('name-field-container');
  const submitBtn = document.getElementById('auth-submit-btn');
  const toggleText = document.getElementById('auth-toggle-text');
  const toggleBtn = document.getElementById('auth-toggle-btn');
  const regNameInput = document.getElementById('reg-name');

  if (isRegisterMode) {
    title.textContent = 'Đăng Ký';
    subtitle.textContent = 'Trở thành thành viên của gia đình AuraCraft';
    nameField.classList.remove('hidden');
    regNameInput.required = true;
    submitBtn.textContent = 'Đăng Ký Thành Viên';
    toggleText.textContent = 'Đã có tài khoản?';
    toggleBtn.textContent = 'Đăng nhập ngay';
  } else {
    title.textContent = 'Đăng Nhập';
    subtitle.textContent = 'Mừng bạn quay trở lại với AuraCraft';
    nameField.classList.add('hidden');
    regNameInput.required = false;
    submitBtn.textContent = 'Đăng Nhập';
    toggleText.textContent = 'Chưa có tài khoản?';
    toggleBtn.textContent = 'Tạo tài khoản mới';
  }
}

function toggleAuthMode() {
  setAuthMode(!isRegisterMode);
}

// Handle User Login/Register form submission
async function handleAuthSubmit(e) {
  e.preventDefault();
  const email = document.getElementById('auth-email').value;
  const password = document.getElementById('auth-password').value;
  const nameInput = document.getElementById('reg-name');
  const errorDiv = document.getElementById('auth-error-msg');

  errorDiv.classList.add('hidden');

  let endpoint = '/api/auth/login';
  let body = { email, password };

  if (isRegisterMode) {
    endpoint = '/api/auth/register';
    body.name = nameInput.value;
  }

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });
    const data = await res.json();

    if (data.success) {
      if (isRegisterMode) {
        // If registered, auto login next
        isRegisterMode = false;
        const loginRes = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const loginData = await loginRes.json();
        if (loginData.success) {
          window.location.reload();
        } else {
          errorDiv.textContent = loginData.error || 'Lỗi tự động đăng nhập';
          errorDiv.classList.remove('hidden');
        }
      } else {
        window.location.reload();
      }
    } else {
      errorDiv.textContent = data.error || 'Lỗi thao tác xác thực';
      errorDiv.classList.remove('hidden');
    }
  } catch (err) {
    console.error(err);
    errorDiv.textContent = 'Không thể kết nối máy chủ.';
    errorDiv.classList.remove('hidden');
  }
}

// User Menu Dropdown
function toggleDropdown() {
  const dropdown = document.getElementById('user-dropdown');
  dropdown.classList.toggle('hidden');
}

async function handleLogout() {
  try {
    const res = await fetch('/api/auth/logout', { method: 'POST' });
    const data = await res.json();
    if (data.success) {
      window.location.reload();
    }
  } catch (err) {
    console.error(err);
  }
}

// Cart actions
async function addToCart(productId, quantity = 1) {
  try {
    const res = await fetch('/api/cart/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId, quantity })
    });
    const data = await res.json();

    if (data.success) {
      // Update Header Cart Badge dynamically
      const badge = document.getElementById('cart-badge');
      badge.textContent = data.cartTotalItems;
      badge.classList.remove('hidden');
      return true;
    } else {
      alert(data.error || 'Không thể thêm sản phẩm vào giỏ hàng.');
      return false;
    }
  } catch (err) {
    console.error(err);
    alert('Lỗi kết nối khi thêm vào giỏ hàng.');
    return false;
  }
}

// Quick add click handler on grid listings
async function handleAddToCartClick(e, productId) {
  e.preventDefault();
  e.stopPropagation();
  
  const button = e.currentTarget;
  const originalHTML = button.innerHTML;
  
  // Show loading indicator inside button
  button.disabled = true;
  button.innerHTML = `
    <svg class="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
    </svg>
  `;
  
  const success = await addToCart(productId, 1);
  
  button.disabled = false;
  button.innerHTML = originalHTML;

  if (success) {
    // Alert / Success Toast
    const toast = document.createElement('div');
    toast.className = 'fixed bottom-5 left-5 bg-[#1A1918] text-white px-5 py-3 rounded-xl shadow-2xl text-xs z-50 animate-bounce';
    toast.textContent = 'Đã thêm sản phẩm vào giỏ hàng!';
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  }
}

// Close dropdown if clicking outside
window.addEventListener('click', function(e) {
  const dropdown = document.getElementById('user-dropdown');
  const userBtn = document.getElementById('user-menu-btn');
  if (dropdown && !dropdown.classList.contains('hidden')) {
    if (userBtn && !userBtn.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.add('hidden');
    }
  }
});

// Wishlist click handler
async function handleWishlistClick(e, productId) {
  e.preventDefault();
  e.stopPropagation();
  
  try {
    const res = await fetch('/api/wishlist/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ product_id: productId })
    });
    const data = await res.json();
    
    if (data.success) {
      // 1. Update Header Wishlist Badge
      const badge = document.getElementById('wishlist-badge');
      if (badge) {
        badge.textContent = data.wishlistTotalItems;
        if (data.wishlistTotalItems > 0) {
          badge.classList.remove('hidden');
        } else {
          badge.classList.add('hidden');
        }
      }
      
      // 2. Update all heart icons on the page matching this product-id
      const buttons = document.querySelectorAll(`[data-product-id="${productId}"][data-testid="wishlist-toggle-btn"], #detail-wishlist-btn[data-product-id="${productId}"]`);
      buttons.forEach(btn => {
        const svg = btn.querySelector('.heart-icon');
        if (svg) {
          if (data.isFavorited) {
            svg.setAttribute('fill', '#EF4444');
            svg.setAttribute('stroke', '#EF4444');
            btn.setAttribute('title', 'Xóa khỏi yêu thích');
          } else {
            svg.setAttribute('fill', 'none');
            // If it is on details page, stroke should be dark gray, else current color
            if (btn.id === 'detail-wishlist-btn') {
              svg.setAttribute('stroke', '#2C2A29');
            } else {
              svg.setAttribute('stroke', 'currentColor');
            }
            btn.setAttribute('title', 'Thêm vào yêu thích');
          }
        }
      });
      
      // 3. Show Feedback Toast
      const toast = document.createElement('div');
      toast.className = 'fixed bottom-5 left-5 bg-[#1A1918] text-white px-5 py-3 rounded-xl shadow-2xl text-xs z-50 animate-bounce';
      toast.textContent = data.isFavorited ? 'Đã thêm vào danh sách yêu thích!' : 'Đã xóa khỏi danh sách yêu thích!';
      document.body.appendChild(toast);
      setTimeout(() => toast.remove(), 2500);
    } else {
      alert(data.error || 'Có lỗi xảy ra.');
    }
  } catch (err) {
    console.error(err);
    alert('Lỗi kết nối máy chủ.');
  }
}
