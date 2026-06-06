import { run, get, all } from '../lib/db.js';
import { getCartDetails } from './cartService.js';
import crypto from 'crypto';

const uuid = () => crypto.randomUUID();

export const createOrder = async ({ cartId, paymentMethod = 'cod', shippingAddress }) => {
  const cart = await getCartDetails(cartId);
  if (!cart.items || cart.items.length === 0) {
    throw new Error('Giỏ hàng trống');
  }

  // Verify and update stocks
  for (const item of cart.items) {
    const prod = await get('SELECT stock FROM products WHERE id = ?', [item.product_id]);
    if (!prod || prod.stock < item.quantity) {
      throw new Error(`Sản phẩm "${item.name}" không đủ hàng trong kho (Còn lại: ${prod ? prod.stock : 0})`);
    }
  }

  // Deduct stock
  for (const item of cart.items) {
    await run('UPDATE products SET stock = stock - ? WHERE id = ?', [item.quantity, item.product_id]);
  }

  const orderId = uuid();
  const orderCode = `ORD-${Date.now().toString().slice(-8)}${Math.floor(100 + Math.random() * 900)}`;
  const shippingFee = cart.subtotal > 500000 ? 0 : 30000; // Free ship cho đơn hàng trên 500k, ngược lại 30k
  const totalAmount = cart.subtotal + shippingFee;

  // Insert Order
  await run(`
    INSERT INTO orders (id, code, total_amount, shipping_fee, status, payment_status, payment_method, shipping_address)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [
    orderId,
    orderCode,
    totalAmount,
    shippingFee,
    'pending',
    'pending',
    paymentMethod,
    JSON.stringify(shippingAddress)
  ]);

  // Insert Order Items
  for (const item of cart.items) {
    await run(`
      INSERT INTO order_items (id, order_id, product_id, price, quantity)
      VALUES (?, ?, ?, ?, ?)
    `, [
      uuid(),
      orderId,
      item.product_id,
      item.price,
      item.quantity
    ]);
  }

  // Clear Cart
  await run('DELETE FROM cart_items WHERE cart_id = ?', [cartId]);

  return {
    order_id: orderId,
    code: orderCode,
    total_amount: totalAmount,
    shipping_fee: shippingFee,
    status: 'pending',
    payment_status: 'pending',
    payment_method: paymentMethod,
    shipping_address: shippingAddress
  };
};

export const getOrderDetails = async (orderIdOrCode) => {
  const order = await get(`
    SELECT * FROM orders 
    WHERE id = ? OR code = ?
  `, [orderIdOrCode, orderIdOrCode]);

  if (!order) return null;

  order.shipping_address = order.shipping_address ? JSON.parse(order.shipping_address) : {};
  if (order.billing_address) {
    order.billing_address = JSON.parse(order.billing_address);
  }

  const items = await all(`
    SELECT oi.id, oi.product_id, oi.price, oi.quantity,
           p.name, p.slug,
           (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) as primary_image_url
    FROM order_items oi
    LEFT JOIN products p ON oi.product_id = p.id
    WHERE oi.order_id = ?
  `, [order.id]);

  order.items = items;

  return order;
};
