import fs from 'fs';
import path from 'path';

// Persistent writable path for Vercel Serverless (using /tmp)
// and standard local workspace file for development.
const getDbPath = () => {
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    return path.join('/tmp', 'database.json');
  }
  return path.join(process.cwd(), 'database.json');
};

const DB_PATH = getDbPath();

const defaultData = {
  categories: [],
  products: [],
  product_images: [],
  carts: [],
  cart_items: [],
  orders: [],
  order_items: [],
  users: []
};

// Global in-memory cache for Vercel execution contexts
let memoryCache = null;

const readDb = () => {
  if (memoryCache) return memoryCache;

  try {
    if (!fs.existsSync(DB_PATH)) {
      // Attempt to load from pre-seeded file in project root if available
      const rootDbPath = path.join(process.cwd(), 'database.json');
      if (fs.existsSync(rootDbPath)) {
        const content = fs.readFileSync(rootDbPath, 'utf-8');
        memoryCache = JSON.parse(content);
        return memoryCache;
      }
      memoryCache = JSON.parse(JSON.stringify(defaultData));
      return memoryCache;
    }
    const content = fs.readFileSync(DB_PATH, 'utf-8');
    memoryCache = JSON.parse(content || JSON.stringify(defaultData));
    return memoryCache;
  } catch (err) {
    console.error('Error reading JSON DB:', err);
    memoryCache = JSON.parse(JSON.stringify(defaultData));
    return memoryCache;
  }
};

const writeDb = (data) => {
  memoryCache = data;
  try {
    // Write to /tmp or root folder depending on environment
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    // Safe fallback for strict read-only environments
    console.warn('Fallback to in-memory state:', err.message);
  }
};

// Helper function to mock run command
export const run = async (sql, params = []) => {
  const data = readDb();
  const cleanedSql = sql.replace(/\s+/g, ' ').trim();

  // 1. Create Tables (no-op since structure is predefined)
  if (cleanedSql.startsWith('CREATE TABLE')) {
    return { id: 0, changes: 0 };
  }

  // 2. Insert Category
  if (cleanedSql.startsWith('INSERT INTO categories')) {
    const [id, name, slug, description] = params;
    // Prevent duplicate slugs
    data.categories = data.categories.filter(c => c.slug !== slug);
    data.categories.push({
      id,
      name,
      slug,
      description,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    writeDb(data);
    return { id, changes: 1 };
  }

  // 3. Insert Product
  if (cleanedSql.startsWith('INSERT INTO products')) {
    const [id, category_id, name, slug, description, price, stock, status, attributes] = params;
    data.products = data.products.filter(p => p.slug !== slug);
    data.products.push({
      id,
      category_id,
      name,
      slug,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      status,
      attributes, // already JSON stringified or raw string
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    writeDb(data);
    return { id, changes: 1 };
  }

  // 4. Insert Product Image
  if (cleanedSql.startsWith('INSERT INTO product_images')) {
    const [id, product_id, url, is_primary] = params;
    data.product_images.push({
      id,
      product_id,
      url,
      is_primary: parseInt(is_primary),
      created_at: new Date().toISOString()
    });
    writeDb(data);
    return { id, changes: 1 };
  }

  // 5. Insert Cart
  if (cleanedSql.startsWith('INSERT INTO carts')) {
    const [id, user_id] = params;
    data.carts.push({
      id,
      user_id: user_id || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    writeDb(data);
    return { id, changes: 1 };
  }

  // 6. Insert Cart Item
  if (cleanedSql.startsWith('INSERT INTO cart_items')) {
    const [id, cart_id, product_id, quantity] = params;
    // Remove duplicate
    data.cart_items = data.cart_items.filter(ci => !(ci.cart_id === cart_id && ci.product_id === product_id));
    data.cart_items.push({
      id,
      cart_id,
      product_id,
      quantity: parseInt(quantity),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    writeDb(data);
    return { id, changes: 1 };
  }

  // 7. Update Cart Item
  if (cleanedSql.startsWith('UPDATE cart_items SET quantity =')) {
    const [quantity, id] = params;
    const item = data.cart_items.find(ci => ci.id === id);
    if (item) {
      item.quantity = parseInt(quantity);
      item.updated_at = new Date().toISOString();
      writeDb(data);
      return { id, changes: 1 };
    }
    return { id: null, changes: 0 };
  }

  // 8. Delete Cart Item
  if (cleanedSql.startsWith('DELETE FROM cart_items WHERE id =')) {
    const [id, cart_id] = params;
    const initialLen = data.cart_items.length;
    data.cart_items = data.cart_items.filter(ci => !(ci.id === id && ci.cart_id === cart_id));
    writeDb(data);
    return { id, changes: initialLen - data.cart_items.length };
  }

  // 9. Update Product Stock
  if (cleanedSql.startsWith('UPDATE products SET stock = stock -')) {
    const [quantity, id] = params;
    const prod = data.products.find(p => p.id === id);
    if (prod) {
      prod.stock = Math.max(0, prod.stock - parseInt(quantity));
      prod.updated_at = new Date().toISOString();
      writeDb(data);
      return { id, changes: 1 };
    }
    return { id: null, changes: 0 };
  }

  // 10. Insert Order
  if (cleanedSql.startsWith('INSERT INTO orders')) {
    const [id, code, total_amount, shipping_fee, status, payment_status, payment_method, shipping_address] = params;
    data.orders.push({
      id,
      code,
      total_amount: parseFloat(total_amount),
      shipping_fee: parseFloat(shipping_fee),
      status,
      payment_status,
      payment_method,
      shipping_address,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    writeDb(data);
    return { id, changes: 1 };
  }

  // 11. Insert Order Item
  if (cleanedSql.startsWith('INSERT INTO order_items')) {
    const [id, order_id, product_id, price, quantity] = params;
    data.order_items.push({
      id,
      order_id,
      product_id,
      price: parseFloat(price),
      quantity: parseInt(quantity),
      created_at: new Date().toISOString()
    });
    writeDb(data);
    return { id, changes: 1 };
  }

  // 12. Delete Cart Items (clear cart)
  if (cleanedSql.startsWith('DELETE FROM cart_items WHERE cart_id =')) {
    const [cart_id] = params;
    const initialLen = data.cart_items.length;
    data.cart_items = data.cart_items.filter(ci => ci.cart_id !== cart_id);
    writeDb(data);
    return { id: null, changes: initialLen - data.cart_items.length };
  }

  // 13. Insert User
  if (cleanedSql.startsWith('INSERT INTO users')) {
    const [id, name, email, password, role] = params;
    data.users = data.users || [];
    data.users = data.users.filter(u => u.email !== email);
    data.users.push({
      id,
      name,
      email,
      password,
      role: role || 'user',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
    writeDb(data);
    return { id, changes: 1 };
  }

  console.warn('Unhandled raw SQL run:', sql);
  return { id: null, changes: 0 };
};

// Helper function to mock get all rows command
export const all = async (sql, params = []) => {
  const data = readDb();
  const cleanedSql = sql.replace(/\s+/g, ' ').trim();

  // 1. Get products list with joint details
  if (cleanedSql.includes('SELECT p.*, c.name as category_name, pi.url as primary_image_url')) {
    let list = data.products.map(p => {
      const cat = data.categories.find(c => c.id === p.category_id);
      const img = data.product_images.find(pi => pi.product_id === p.id && pi.is_primary === 1);
      return {
        ...p,
        category_name: cat ? cat.name : null,
        primary_image_url: img ? img.url : null
      };
    });

    // Handle Category Filter
    if (cleanedSql.includes('p.category_id = ?')) {
      const catId = params[0];
      list = list.filter(p => p.category_id === catId);
    }

    // Handle Search Filter
    if (cleanedSql.includes('p.name LIKE ?')) {
      // Search term is at the end of filter params (before sort/limit)
      const searchVal = params[params.length - 3] || params[params.length - 2];
      if (searchVal) {
        const keyword = searchVal.replace(/%/g, '').toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(keyword) || p.description.toLowerCase().includes(keyword));
      }
    }

    // Handle Sorting
    if (cleanedSql.includes('ORDER BY p.price ASC')) {
      list.sort((a, b) => a.price - b.price);
    } else if (cleanedSql.includes('ORDER BY p.price DESC')) {
      list.sort((a, b) => b.price - a.price);
    } else if (cleanedSql.includes('ORDER BY p.created_at ASC')) {
      list.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    } else {
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }

    // Handle Pagination Limit/Offset
    const limit = params[params.length - 2];
    const offset = params[params.length - 1];
    if (typeof limit === 'number' && typeof offset === 'number') {
      list = list.slice(offset, offset + limit);
    }

    return list;
  }

  // 2. Get product images
  if (cleanedSql.startsWith('SELECT url, is_primary FROM product_images WHERE product_id =')) {
    const [productId] = params;
    return data.product_images
      .filter(img => img.product_id === productId)
      .sort((a, b) => b.is_primary - a.is_primary)
      .map(img => ({ url: img.url, is_primary: img.is_primary }));
  }

  // 3. Get all categories
  if (cleanedSql.startsWith('SELECT * FROM categories ORDER BY name ASC')) {
    const list = [...data.categories];
    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
  }

  // 4. Get cart details (with full info including product details and image)
  if (cleanedSql.includes('SELECT ci.id, ci.product_id, ci.quantity, p.name, p.price, p.slug')) {
    const [cartId] = params;
    const items = data.cart_items.filter(ci => ci.cart_id === cartId);
    return items.map(item => {
      const p = data.products.find(prod => prod.id === item.product_id);
      const img = data.product_images.find(pi => pi.product_id === item.product_id && pi.is_primary === 1);
      return {
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        name: p ? p.name : 'Unknown Product',
        price: p ? p.price : 0,
        slug: p ? p.slug : '',
        primary_image_url: img ? img.url : null
      };
    });
  }

  // 4b. Get simple cart items quantity / id (used in header middleware)
  if (cleanedSql.includes('SELECT ci.id, ci.quantity FROM cart_items ci')) {
    const [cartId] = params;
    return data.cart_items
      .filter(ci => ci.cart_id === cartId)
      .map(item => ({ id: item.id, quantity: item.quantity }));
  }

  // 4b-2. Get cart items quantities (used in api/cart/add)
  if (cleanedSql.includes('SELECT quantity FROM cart_items WHERE cart_id =')) {
    const [cartId] = params;
    return data.cart_items
      .filter(ci => ci.cart_id === cartId)
      .map(item => ({ quantity: item.quantity }));
  }

  // 4b-3. Get cart items with price (used in api/cart/update and api/cart/remove)
  if (cleanedSql.includes('SELECT ci.id, ci.quantity, p.price FROM cart_items ci')) {
    const [cartId] = params;
    const items = data.cart_items.filter(ci => ci.cart_id === cartId);
    return items.map(item => {
      const p = data.products.find(prod => prod.id === item.product_id);
      return {
        id: item.id,
        quantity: item.quantity,
        price: p ? p.price : 0
      };
    });
  }

  // 4c. Get cart items with price and stock (used in checkout)
  if (cleanedSql.includes('SELECT ci.id, ci.product_id, ci.quantity, p.price, p.stock FROM cart_items ci')) {
    const [cartId] = params;
    const items = data.cart_items.filter(ci => ci.cart_id === cartId);
    return items.map(item => {
      const p = data.products.find(prod => prod.id === item.product_id);
      return {
        id: item.id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: p ? p.price : 0,
        stock: p ? p.stock : 0
      };
    });
  }

  // 5. Get order items details
  if (cleanedSql.includes('SELECT oi.id, oi.product_id, oi.price, oi.quantity, p.name, p.slug')) {
    const [orderId] = params;
    const items = data.order_items.filter(oi => oi.order_id === orderId);
    return items.map(item => {
      const p = data.products.find(prod => prod.id === item.product_id);
      const img = data.product_images.find(pi => pi.product_id === item.product_id && pi.is_primary === 1);
      return {
        id: item.id,
        product_id: item.product_id,
        price: item.price,
        quantity: item.quantity,
        name: p ? p.name : 'Unknown Product',
        slug: p ? p.slug : '',
        primary_image_url: img ? img.url : null
      };
    });
  }

  console.warn('Unhandled raw SQL all:', sql);
  return [];
};

// Helper function to mock get single row command
export const get = async (sql, params = []) => {
  const data = readDb();
  const cleanedSql = sql.replace(/\s+/g, ' ').trim();

  // 1. Get Category by slug
  if (cleanedSql.includes('SELECT id FROM categories WHERE slug =')) {
    const [slug] = params;
    const cat = data.categories.find(c => c.slug === slug);
    return cat ? { id: cat.id } : null;
  }

  // 2. Get Product by slug
  if (cleanedSql.includes('SELECT id FROM products WHERE slug =')) {
    const [slug] = params;
    const prod = data.products.find(p => p.slug === slug);
    return prod ? { id: prod.id } : null;
  }

  // 3. Count products
  if (cleanedSql.startsWith('SELECT COUNT(*) as total FROM products p')) {
    let list = [...data.products];
    if (cleanedSql.includes('p.category_id = ?')) {
      const catId = params[0];
      list = list.filter(p => p.category_id === catId);
    }
    if (cleanedSql.includes('p.name LIKE ?')) {
      const searchVal = params[params.length - 1];
      if (searchVal) {
        const keyword = searchVal.replace(/%/g, '').toLowerCase();
        list = list.filter(p => p.name.toLowerCase().includes(keyword) || p.description.toLowerCase().includes(keyword));
      }
    }
    return { total: list.length };
  }

  // 4. Get product detail by ID or slug
  if (cleanedSql.includes('SELECT p.*, c.name as category_name FROM products p')) {
    const [slugOrId1, slugOrId2] = params;
    const p = data.products.find(prod => prod.id === slugOrId1 || prod.slug === slugOrId1 || prod.id === slugOrId2 || prod.slug === slugOrId2);
    if (!p) return null;

    const cat = data.categories.find(c => c.id === p.category_id);
    return {
      ...p,
      category_name: cat ? cat.name : null
    };
  }

  // 5. Get cart by ID
  if (cleanedSql.startsWith('SELECT id FROM carts WHERE id =')) {
    const [id] = params;
    const cart = data.carts.find(c => c.id === id);
    return cart ? { id: cart.id } : null;
  }

  // 6. Get product stock or details by ID (handles "SELECT id, stock..." or "SELECT stock...")
  if (cleanedSql.includes('FROM products WHERE id =')) {
    const [id] = params;
    const p = data.products.find(prod => prod.id === id);
    return p ? { id: p.id, stock: p.stock } : null;
  }

  // 7. Get cart item by cart & product
  if (cleanedSql.startsWith('SELECT id, quantity FROM cart_items WHERE cart_id =')) {
    const [cartId, productId] = params;
    const item = data.cart_items.find(ci => ci.cart_id === cartId && ci.product_id === productId);
    return item ? { id: item.id, quantity: item.quantity } : null;
  }

  // 8. Get cart item by ID and cart
  if (cleanedSql.startsWith('SELECT product_id FROM cart_items WHERE id =')) {
    const [id, cartId] = params;
    const item = data.cart_items.find(ci => ci.id === id && ci.cart_id === cartId);
    return item ? { product_id: item.product_id } : null;
  }

  // 8b. Get cart item stock and product ID (used in cart update checks)
  if (cleanedSql.includes('SELECT ci.product_id, p.stock FROM cart_items ci')) {
    const [itemId, cartId] = params;
    const item = data.cart_items.find(ci => ci.id === itemId && ci.cart_id === cartId);
    if (!item) return null;
    const p = data.products.find(prod => prod.id === item.product_id);
    return p ? { product_id: item.product_id, stock: p.stock } : null;
  }

  // 9. Get Order detail
  if (cleanedSql.includes('FROM orders WHERE')) {
    const [val] = params;
    const order = data.orders.find(o => o.id === val || o.code === val);
    return order ? { ...order } : null;
  }

  // 10. Get User by Email (handles both "SELECT * FROM users..." and "SELECT id FROM users...")
  if (cleanedSql.includes('FROM users WHERE email =')) {
    const [email] = params;
    data.users = data.users || [];
    const user = data.users.find(u => u.email === email);
    return user ? { ...user } : null;
  }

  // 11. Get User by ID
  if (cleanedSql.startsWith('SELECT * FROM users WHERE id =')) {
    const [id] = params;
    data.users = data.users || [];
    const user = data.users.find(u => u.id === id);
    return user ? { ...user } : null;
  }

  console.warn('Unhandled raw SQL get:', sql);
  return null;
};

// Initialize empty DB (preseeded data is verified during runtime load)
export const initDb = async () => {
  // Pre-seed mock files check or write standard format if empty
  const data = readDb();
  writeDb(data);
};
