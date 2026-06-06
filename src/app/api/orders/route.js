import { NextResponse } from 'next/server';
import { createOrder } from '@/services/orderService.js';

export async function POST(request) {
  try {
    const cartIdHeader = request.headers.get('x-cart-id');
    if (!cartIdHeader) {
      return NextResponse.json({ success: false, error: 'Cart ID header is missing' }, { status: 400 });
    }

    const { payment_method, shipping_address } = await request.json();
    if (!shipping_address || !shipping_address.recipient_name || !shipping_address.phone || !shipping_address.address_line || !shipping_address.city) {
      return NextResponse.json({ success: false, error: 'Detailed shipping address is required' }, { status: 400 });
    }

    const order = await createOrder({
      cartId: cartIdHeader,
      paymentMethod: payment_method,
      shippingAddress: shipping_address
    });

    return NextResponse.json({ success: true, message: 'Order created successfully', data: order });
  } catch (error) {
    console.error('Error creating order:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
