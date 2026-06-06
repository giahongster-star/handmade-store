import { NextResponse } from 'next/server';
import { getOrCreateCart, getCartDetails, addToCart } from '@/services/cartService.js';

export async function GET(request) {
  try {
    const cartIdHeader = request.headers.get('x-cart-id');
    const activeCartId = await getOrCreateCart(cartIdHeader);
    const cart = await getCartDetails(activeCartId);

    const response = NextResponse.json({ success: true, data: cart });
    // If a new cart was created, set header so client knows
    response.headers.set('x-cart-id', activeCartId);
    return response;
  } catch (error) {
    console.error('Error fetching cart:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const cartIdHeader = request.headers.get('x-cart-id');
    const activeCartId = await getOrCreateCart(cartIdHeader);

    const { product_id, quantity } = await request.json();
    if (!product_id || !quantity) {
      return NextResponse.json({ success: false, error: 'Product ID and quantity are required' }, { status: 400 });
    }

    const cart = await addToCart(activeCartId, product_id, parseInt(quantity));

    const response = NextResponse.json({ success: true, message: 'Item added to cart', data: cart });
    response.headers.set('x-cart-id', activeCartId);
    return response;
  } catch (error) {
    console.error('Error adding to cart:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
