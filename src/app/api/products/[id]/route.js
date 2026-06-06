import { NextResponse } from 'next/server';
import { getProductBySlugOrId } from '@/services/productService.js';

export async function GET(request, { params }) {
  try {
    const { id } = await params;
    const product = await getProductBySlugOrId(id);
    if (!product) {
      return NextResponse.json({ success: false, error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Error fetching product detail:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
