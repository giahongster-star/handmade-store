import { run, get, all } from '../lib/db.js';
import crypto from 'crypto';

const uuid = () => crypto.randomUUID();

export const getOrCreateCart = async (cartId = null) => {
  let activeCartId = cartId;

  if (activeCartId) {
    const existing = await get('SELECT id FROM carts WHERE id = ?', [activeCartId]);
    if (!existing) {
      activeCartId = null;
    }
  }

  if (!activeCartId) {
    activeCartId = uuid();
    await run('INSERT INTO carts (id) VALUES (?)', [activeCartId]);
  }

  return activeCartId;
};

export const getCartDetails = async (cartId) => {
  const items = await all(`
    SELECT ci.id, ci.product_id, ci.quantity, 
           p.name, p.price, p.slug,
           (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image_url
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.cart_id = ?
  `, [cartId]);

  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return {
    cart_id: cartId,
    items,
    subtotal: parseFloat(subtotal.toFixed(2))
  };
};

export const addToCart = async (cartId, productId, quantity) => {
  // Check if product exists and has enough stock
  const product = await get('SELECT stock FROM products WHERE id = ?', [productId]);
  if (!product) throw new Error('Product not found');

  const existingItem = await get('SELECT id, quantity FROM cart_items WHERE cart_id = ? AND product_id = ?', [cartId, productId]);

  if (existingItem) {
    const newQty = existingItem.quantity + quantity;
    if (newQty > product.stock) {
      throw new Error(`Only ${product.stock} items left in stock`);
    }
    await run(
      'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      [newQty, existingItem.id]
    );
  } else {
    if (quantity > product.stock) {
      throw new Error(`Only ${product.stock} items left in stock`);
    }
    await run(
      'INSERT INTO cart_items (id, cart_id, product_id, quantity) VALUES (?, ?, ?, ?)',
      [uuid(), cartId, productId, quantity]
    );
  }

  return await getCartDetails(cartId);
};

export const updateCartItem = async (cartId, cartItemId, quantity) => {
  const item = await get('SELECT product_id FROM cart_items WHERE id = ? AND cart_id = ?', [cartItemId, cartId]);
  if (!item) throw new Error('Cart item not found');

  const product = await get('SELECT stock FROM products WHERE id = ?', [item.product_id]);
  if (quantity > product.stock) {
    throw new Error(`Only ${product.stock} items left in stock`);
  }

  await run(
    'UPDATE cart_items SET quantity = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
    [quantity, cartItemId]
  );

  return await getCartDetails(cartId);
};

export const removeFromCart = async (cartId, cartItemId) => {
  await run('DELETE FROM cart_items WHERE id = ? AND cart_id = ?', [cartItemId, cartId]);
  return await getCartDetails(cartId);
};
