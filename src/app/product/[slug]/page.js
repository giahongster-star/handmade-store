'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { slug } = params;

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [adding, setAdding] = useState(false);
  const { addItem } = useCart();

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    fetch(`/api/products/${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProduct(data.data);
          // Set primary image or first image
          const primary = data.data.images?.find(img => img.is_primary === 1) || data.data.images?.[0];
          setActiveImage(primary?.url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80');
        } else {
          setProduct(null);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = async () => {
    if (!product || product.stock === 0) return;
    setAdding(true);
    const res = await addItem(product.id, quantity);
    setAdding(false);
    if (res.success) {
      router.push('/cart');
    } else {
      alert(res.error || 'Lỗi thêm sản phẩm');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse">
        <div className="h-6 w-24 bg-gray-200 rounded mb-8" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="aspect-square bg-gray-200 rounded-2xl" />
          <div className="space-y-6">
            <div className="h-4 bg-gray-200 rounded w-1/4" />
            <div className="h-10 bg-gray-200 rounded w-3/4" />
            <div className="h-6 bg-gray-200 rounded w-1/3" />
            <div className="h-24 bg-gray-200 rounded" />
            <div className="h-12 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">Không tìm thấy sản phẩm</h2>
        <p className="text-gray-500 mb-6">Sản phẩm có thể đã bị xóa hoặc đường dẫn không chính xác.</p>
        <Link href="/" className="px-6 py-3 rounded-full bg-[#1A1918] text-white hover:bg-[#D4A373] transition">
          Quay lại trang chủ
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center space-x-2 text-sm text-[#8C867E]">
        <Link href="/" className="hover:text-[#1A1918] transition">Trang chủ</Link>
        <span>/</span>
        <Link href={`/?category=${product.category_id}`} className="hover:text-[#1A1918] transition">{product.category_name}</Link>
        <span>/</span>
        <span className="text-[#1A1918] font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* Product Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE6DF] shadow-sm">
        
        {/* Gallery */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          <div className="aspect-square w-full rounded-2xl overflow-hidden bg-[#FAF9F6] border border-[#FAF9F6]">
            <img
              src={activeImage}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img.url)}
                  className={`aspect-square w-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImage === img.url ? 'border-[#D4A373] scale-95' : 'border-[#EAE6DF] hover:border-[#1A1918]'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div>
            <span className="text-xs uppercase tracking-[0.2em] text-[#8C867E] font-semibold block mb-2">
              {product.category_name}
            </span>
            <h1 data-testid="product-title" data-product-id={product.id} className="font-serif text-3xl sm:text-4xl font-bold text-[#1A1918] leading-tight mb-4">
              {product.name}
            </h1>

            <div className="flex items-center space-x-3 mb-6">
              <span data-testid="product-price" data-price={product.price} className="text-2xl font-bold text-[#C2410C]">
                {formatPrice(product.price)}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                product.stock > 0 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
              }`}>
                {product.stock > 0 ? `Còn hàng (${product.stock})` : 'Hết hàng'}
              </span>
            </div>

            <div className="prose prose-sm text-[#5C5752] leading-relaxed mb-6 font-light">
              <p>{product.description}</p>
            </div>

            {/* Dynamic Attributes */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="bg-[#FAF9F6] p-5 rounded-2xl border border-[#EAE6DF] mb-6">
                <h3 className="text-xs uppercase tracking-wider text-[#1A1918] font-bold mb-3">Thông số sản phẩm</h3>
                <dl className="grid grid-cols-2 gap-y-2.5 gap-x-4 text-sm">
                  {Object.entries(product.attributes).map(([key, val]) => (
                    <div key={key} className="flex flex-col">
                      <dt className="text-xs text-[#8C867E] capitalize">{key.replace('_', ' ')}</dt>
                      <dd className="font-medium text-[#2C2A29] mt-0.5">{val}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>

          {/* Action section */}
          {product.stock > 0 && (
            <div className="border-t border-[#F2EFE9] pt-6 space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-[#8C867E]">Số lượng:</span>
                <div className="flex items-center border border-[#EAE6DF] rounded-xl overflow-hidden bg-[#FAF9F6]">
                  <button
                    data-testid="quantity-decrement"
                    onClick={() => setQuantity(q => Math.max(1, q - 1))}
                    className="px-3.5 py-2 text-[#5C5752] hover:bg-[#F2EFE9] transition font-bold"
                  >
                    -
                  </button>
                  <span data-testid="quantity-value" className="px-4 py-2 font-medium text-sm text-[#2C2A29]">{quantity}</span>
                  <button
                    data-testid="quantity-increment"
                    onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                    className="px-3.5 py-2 text-[#5C5752] hover:bg-[#F2EFE9] transition font-bold"
                  >
                    +
                  </button>
                </div>
              </div>

              <button
                id="add-to-cart-main"
                data-testid="add-to-cart-main"
                data-product-id={product.id}
                disabled={adding}
                onClick={handleAddToCart}
                className="w-full py-4 bg-[#1A1918] hover:bg-[#D4A373] text-white rounded-full font-semibold transition-all duration-300 shadow-md hover:shadow-lg flex items-center justify-center space-x-2"
              >
                {adding ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                    </svg>
                    <span>Thêm Vào Giỏ Hàng</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
