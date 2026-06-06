import { NextResponse } from 'next/server';
import { updateCartItem, removeFromCart } from '@/services/cartService.js';

export async function PUT(request, { params }) {
  try {
    const { itemId } = await params;
    const cartIdHeader = request.headers.get('x-cart-id');
    if (!cartIdHeader) {
      return NextResponse.json({ success: false, error: 'Cart ID header is missing' }, { status: 400 });
    }

    const { quantity } = await request.json();
    if (quantity === undefined) {
      return NextResponse.json({ success: false, error: 'Quantity is required' }, { status: 400 });
    }

    const cart = await updateCartItem(cartIdHeader, itemId, parseInt(quantity));
    return NextResponse.json({ success: true, message: 'Cart item updated', data: cart });
  } catch (error) {
    console.error('Error updating cart item:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { itemId } = await params;
    const cartIdHeader = request.headers.get('x-cart-id');
    if (!cartIdHeader) {
      return NextResponse.json({ success: false, error: 'Cart ID header is missing' }, { status: 400 });
    }

    const cart = await removeFromCart(cartIdHeader, itemId);
    return NextResponse.json({ success: true, message: 'Item removed from cart', data: cart });
  } catch (error) {
    console.error('Error removing cart item:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
