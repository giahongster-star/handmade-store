import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { run, all, get, initDb } from './src/lib/db.js';

const app = express();
const PORT = process.env.PORT || 3000;

// Set up views and static files
app.set('view engine', 'ejs');
app.set('views', path.join(process.cwd(), 'views'));
app.use(express.static(path.join(process.cwd(), 'public')));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Database Initialization
initDb().then(() => {
  console.log('Database initialized successfully.');
}).catch(err => {
  console.error('Failed to initialize database:', err);
});

// Helper: Format currency
const formatPrice = (price) => {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
};
app.locals.formatPrice = formatPrice;

// Helper: Generate order or cart IDs
const generateId = () => {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
};

// Middleware: Get Cart ID
const getCartId = async (req, res, next) => {
  let cartId = req.cookies['x-cart-id'];
  if (!cartId) {
    cartId = 'cart_' + generateId();
    res.cookie('x-cart-id', cartId, { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
    // Also insert empty cart into DB
    await run('INSERT INTO carts (id, user_id) VALUES (?, ?)', [cartId, null]);
  }
  req.cartId = cartId;
  next();
};

// Middleware: Get Authenticated User
const getAuthUser = async (req, res, next) => {
  let user = null;
  const authUserCookie = req.cookies['auth_user'];
  if (authUserCookie) {
    try {
      user = JSON.parse(authUserCookie);
    } catch (e) {
      res.clearCookie('auth_user');
    }
  }
  req.user = user;
  res.locals.user = user;
  next();
};

app.use(getCartId);
app.use(getAuthUser);

// Middleware to inject cart quantity in locals for header rendering
app.use(async (req, res, next) => {
  try {
    const items = await all('SELECT ci.id, ci.quantity FROM cart_items ci WHERE ci.cart_id = ?', [req.cartId]);
    res.locals.cartTotalItems = items.reduce((sum, item) => sum + item.quantity, 0) || 0;
  } catch (err) {
    res.locals.cartTotalItems = 0;
  }
  next();
});

// ==========================================
// ROUTES
// ==========================================

// 1. Homepage
app.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = 8;
    const offset = (page - 1) * limit;
    const categorySlug = req.query.category || '';
    const search = req.query.search || '';
    const sort = req.query.sort || 'created_at:desc';

    // Get categories
    const categories = await all('SELECT * FROM categories ORDER BY name ASC');
    let selectedCategoryId = '';
    if (categorySlug) {
      const cat = categories.find(c => c.slug === categorySlug);
      if (cat) {
        selectedCategoryId = cat.id;
      }
    }

    // Build SQL query based on filters
    let productsQuery = 'SELECT p.*, c.name as category_name, pi.url as primary_image_url FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1';
    let params = [];
    let whereClauses = [];

    if (selectedCategoryId) {
      whereClauses.push('p.category_id = ?');
      params.push(selectedCategoryId);
    }

    if (search) {
      whereClauses.push('(p.name LIKE ? OR p.description LIKE ?)');
      const searchParam = `%${search}%`;
      params.push(searchParam, searchParam);
    }

    if (whereClauses.length > 0) {
      productsQuery += ' WHERE ' + whereClauses.join(' AND ');
    }

    // Sort order
    if (sort === 'price:asc') {
      productsQuery += ' ORDER BY p.price ASC';
    } else if (sort === 'price:desc') {
      productsQuery += ' ORDER BY p.price DESC';
    } else if (sort === 'created_at:asc') {
      productsQuery += ' ORDER BY p.created_at ASC';
    } else {
      productsQuery += ' ORDER BY p.created_at DESC';
    }

    // Pagination Params
    productsQuery += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    // Fetch products
    const products = await all(productsQuery, params);

    // Get count for total pages
    let countQuery = 'SELECT COUNT(*) as total FROM products p';
    let countParams = [];
    if (whereClauses.length > 0) {
      countQuery += ' WHERE ' + whereClauses.join(' AND ');
      // exclude limit/offset params
      countParams = params.slice(0, params.length - 2);
    }
    const countResult = await get(countQuery, countParams);
    const total = countResult ? countResult.total : 0;
    const totalPages = Math.ceil(total / limit) || 1;

    res.render('index', {
      title: 'AuraCraft | Đồ Thủ Công Mỹ Nghệ Tinh Sảo',
      products,
      categories,
      categorySlug,
      search,
      sort,
      currentPage: page,
      totalPages,
    });
  } catch (err) {
    console.error('Error serving homepage:', err);
    res.status(500).send('Internal Server Error');
  }
});

// 2. Product Detail
app.get('/product/:slug', async (req, res) => {
  try {
    const slug = req.params.slug;
    const product = await get('SELECT p.*, c.name as category_name FROM products p LEFT JOIN categories c ON p.category_id = c.id WHERE p.slug = ?', [slug]);

    if (!product) {
      return res.status(404).send('Product Not Found');
    }

    // Get product images
    const images = await all('SELECT url, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC', [product.id]);

    // Get related products
    const relatedProducts = await all(
      'SELECT p.*, c.name as category_name, pi.url as primary_image_url FROM products p LEFT JOIN categories c ON p.category_id = c.id LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1 WHERE p.category_id = ? AND p.id != ? LIMIT 4',
      [product.category_id, product.id]
    );

    res.render('product-detail', {
      title: `${product.name} | AuraCraft`,
      product,
      images,
      relatedProducts,
    });
  } catch (err) {
    console.error('Error serving product detail:', err);
    res.status(500).send('Internal Server Error');
  }
});

// 3. Cart Page
app.get('/cart', async (req, res) => {
  try {
    const items = await all(
      'SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.slug, pi.url as primary_image_url FROM cart_items ci JOIN products p ON ci.product_id = p.id LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1 WHERE ci.cart_id = ?',
      [req.cartId]
    );

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

    res.render('cart', {
      title: 'Giỏ Hàng | AuraCraft',
      items,
      subtotal,
    });
  } catch (err) {
    console.error('Error serving cart page:', err);
    res.status(500).send('Internal Server Error');
  }
});

// 4. Checkout Handler
app.post('/checkout', async (req, res) => {
  try {
    const { name, phone, address, city, payment_method } = req.body;
    if (!name || !phone || !address || !city) {
      return res.status(400).send('Tất cả các trường địa chỉ giao hàng là bắt buộc.');
    }

    const items = await all(
      'SELECT ci.id, ci.product_id, ci.quantity, p.price, p.stock FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?',
      [req.cartId]
    );

    if (items.length === 0) {
      return res.redirect('/cart');
    }

    // Verify stock
    for (const item of items) {
      if (item.stock < item.quantity) {
        return res.status(400).send(`Sản phẩm với ID ${item.product_id} đã hết hàng hoặc không đủ số lượng trong kho.`);
      }
    }

    const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);
    const shippingFee = 30000; // Flat shipping rate
    const totalAmount = subtotal + shippingFee;
    const orderId = 'ord_' + generateId();
    const orderCode = 'AC-' + Math.floor(100000 + Math.random() * 900000);
    const fullAddress = `${address}, ${city}`;

    // Create Order
    await run(
      'INSERT INTO orders (id, code, total_amount, shipping_fee, status, payment_status, payment_method, shipping_address) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
      [orderId, orderCode, totalAmount, shippingFee, 'pending', 'unpaid', payment_method || 'cod', fullAddress]
    );

    // Create Order Items and decrease stock
    for (const item of items) {
      const orderItemId = 'oi_' + generateId();
      await run('INSERT INTO order_items (id, order_id, product_id, price, quantity) VALUES (?, ?, ?, ?, ?)', [
        orderItemId,
        orderId,
        item.product_id,
        item.price,
        item.quantity,
      ]);
      await run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
    }

    // Clear Cart Items
    await run('DELETE FROM cart_items WHERE cart_id = ?', [req.cartId]);

    res.redirect(`/order/${orderCode}`);
  } catch (err) {
    console.error('Error processing checkout:', err);
    res.status(500).send('Internal Server Error');
  }
});

// 5. Order Details
app.get('/order/:code', async (req, res) => {
  try {
    const code = req.params.code;
    const order = await get('SELECT * FROM orders WHERE code = ?', [code]);

    if (!order) {
      return res.status(404).send('Đơn hàng không tồn tại');
    }

    const items = await all(
      'SELECT oi.id, oi.product_id, oi.price, oi.quantity, p.name, p.slug, pi.url as primary_image_url FROM order_items oi JOIN products p ON oi.product_id = p.id LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = 1 WHERE oi.order_id = ?',
      [order.id]
    );

    res.render('order-details', {
      title: 'Đặt Hàng Thành Công! | AuraCraft',
      order,
      items,
    });
  } catch (err) {
    console.error('Error serving order details:', err);
    res.status(500).send('Internal Server Error');
  }
});

// ==========================================
// API ENDPOINTS
// ==========================================

// Auth API: Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await get('SELECT * FROM users WHERE email = ?', [email]);
    if (!user || user.password !== password) {
      return res.json({ success: false, error: 'Email hoặc mật khẩu không chính xác.' });
    }
    const token = 'token_' + generateId();
    res.cookie('auth_user', JSON.stringify({ id: user.id, name: user.name, email: user.email, role: user.role }), { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: false });
    res.cookie('auth_token', token, { maxAge: 7 * 24 * 60 * 60 * 1000, httpOnly: false });
    res.json({ success: true, user: { id: user.id, name: user.name, email: user.email, role: user.role }, token });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Auth API: Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.json({ success: false, error: 'Vui lòng điền đầy đủ các thông tin.' });
    }
    const existingUser = await get('SELECT id FROM users WHERE email = ?', [email]);
    if (existingUser) {
      return res.json({ success: false, error: 'Email này đã được sử dụng.' });
    }
    const userId = 'usr_' + generateId();
    await run('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', [
      userId,
      name,
      email,
      password,
      'user'
    ]);
    res.json({ success: true });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Auth API: Logout
app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('auth_user');
  res.clearCookie('auth_token');
  res.json({ success: true });
});

// Cart API: Add Item
app.post('/api/cart/add', async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const parsedQty = parseInt(quantity) || 1;

    const product = await get('SELECT id, stock FROM products WHERE id = ?', [product_id]);
    if (!product) {
      return res.json({ success: false, error: 'Sản phẩm không tồn tại.' });
    }

    const existingItem = await get('SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?', [req.cartId, product_id]);

    if (existingItem) {
      const newQty = existingItem.quantity + parsedQty;
      if (newQty > product.stock) {
        return res.json({ success: false, error: 'Không đủ số lượng trong kho.' });
      }
      await run('UPDATE cart_items SET quantity = ? WHERE id = ?', [newQty, existingItem.id]);
    } else {
      if (parsedQty > product.stock) {
        return res.json({ success: false, error: 'Không đủ số lượng trong kho.' });
      }
      const cartItemId = 'ci_' + generateId();
      await run('INSERT INTO cart_items (id, cart_id, product_id, quantity) VALUES (?, ?, ?, ?)', [
        cartItemId,
        req.cartId,
        product_id,
        parsedQty,
      ]);
    }

    const items = await all('SELECT quantity FROM cart_items WHERE cart_id = ?', [req.cartId]);
    const cartTotalItems = items.reduce((sum, item) => sum + item.quantity, 0) || 0;

    res.json({ success: true, cartTotalItems });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Cart API: Update Item
app.post('/api/cart/update', async (req, res) => {
  try {
    const { itemId, quantity } = req.body;
    const parsedQty = parseInt(quantity);

    if (parsedQty <= 0) {
      await run('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [itemId, req.cartId]);
    } else {
      // Get product details to check stock
      const item = await get('SELECT ci.product_id, p.stock FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.id = ? AND ci.cart_id = ?', [itemId, req.cartId]);
      if (!item) {
        return res.json({ success: false, error: 'Mặt hàng giỏ hàng không tồn tại.' });
      }
      if (parsedQty > item.stock) {
        return res.json({ success: false, error: 'Không đủ số lượng trong kho.' });
      }
      await run('UPDATE cart_items SET quantity = ? WHERE id = ?', [parsedQty, itemId]);
    }

    // Calculate new total and count
    const items = await all(
      'SELECT ci.id, ci.quantity, p.price FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?',
      [req.cartId]
    );

    const subtotal = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const cartTotalItems = items.reduce((sum, i) => sum + i.quantity, 0) || 0;

    res.json({ success: true, subtotal, cartTotalItems, formattedSubtotal: formatPrice(subtotal) });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Cart API: Remove Item
app.post('/api/cart/remove', async (req, res) => {
  try {
    const { itemId } = req.body;
    await run('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [itemId, req.cartId]);

    // Recalculate totals
    const items = await all(
      'SELECT ci.id, ci.quantity, p.price FROM cart_items ci JOIN products p ON ci.product_id = p.id WHERE ci.cart_id = ?',
      [req.cartId]
    );

    const subtotal = items.reduce((acc, i) => acc + (i.price * i.quantity), 0);
    const cartTotalItems = items.reduce((sum, i) => sum + i.quantity, 0) || 0;

    res.json({ success: true, subtotal, cartTotalItems, formattedSubtotal: formatPrice(subtotal) });
  } catch (err) {
    res.json({ success: false, error: err.message });
  }
});

// Recommendation API wrapper (for dynamic frontend loading)
app.post('/api/recommendation', async (req, res) => {
  try {
    const response = await fetch('https://recsys-tracker-module-d8ty.onrender.com/recommendation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        AnonymousId: req.cookies['recsys_anon_id'] || req.cartId,
        DomainKey: 'f9f56da43d7619526498c07717aeb3144bd9ed960899ed5aa20c1a5faf5625ee',
        NumberItems: req.body.NumberItems || 5,
        UserId: req.user ? req.user.id : undefined
      }),
    });
    
    if (!response.ok) {
      return res.json({ item: [], keyword: '', lastItem: '' });
    }
    
    // Read raw text to handle potential UTF-8 double encoding issue
    const rawText = await response.text();
    let decodedText = rawText;
    try {
      const bytes = new Uint8Array(rawText.length);
      for (let i = 0; i < rawText.length; i++) {
        bytes[i] = rawText.charCodeAt(i) & 0xff;
      }
      decodedText = new TextDecoder('utf-8').decode(bytes);
    } catch (e) {
      console.error('Failed to decode recommendation text', e);
    }
    
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.send(decodedText);
  } catch (err) {
    console.error('Error fetching recommendations from wrapper API:', err);
    res.json({ item: [], keyword: '', lastItem: '' });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
