'use client';

import { useCart } from '@/context/CartContext';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, cartId, updateQuantity, removeItem, clearCartState, loading: cartLoading } = useCart();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [recipientName, setRecipientName] = useState('');
  const [phone, setPhone] = useState('');
  const [addressLine, setAddressLine] = useState('');
  const [city, setCity] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const handleQuantityChange = async (itemId, currentQty, amount) => {
    const newQty = currentQty + amount;
    if (newQty < 1) return;
    const res = await updateQuantity(itemId, newQty);
    if (!res.success) {
      alert(res.error || 'Không thể cập nhật số lượng');
    }
  };

  const handleRemove = async (itemId) => {
    if (confirm('Xóa sản phẩm này khỏi giỏ hàng?')) {
      const res = await removeItem(itemId);
      if (!res.success) {
        alert(res.error || 'Không thể xóa sản phẩm');
      }
    }
  };

  const handleCheckout = async (e) => {
    e.preventDefault();
    if (!recipientName || !phone || !addressLine || !city) {
      alert('Vui lòng điền đầy đủ thông tin giao nhận');
      return;
    }

    try {
      setSubmitting(true);
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-cart-id': cartId
        },
        body: JSON.stringify({
          payment_method: paymentMethod,
          shipping_address: {
            recipient_name: recipientName,
            phone,
            address_line: addressLine,
            city,
            country: 'Vietnam'
          }
        })
      });

      const data = await res.json();
      if (data.success) {
        // Clear local storage and state cart
        clearCartState();
        localStorage.removeItem('cart_id');
        router.push(`/order/${data.data.order_id}`);
      } else {
        alert(data.error || 'Lỗi đặt hàng');
      }
    } catch (err) {
      console.error(err);
      alert('Đã xảy ra lỗi kết nối');
    } finally {
      setSubmitting(false);
    }
  };

  if (!mounted) return null;

  const items = cart?.items || [];
  const subtotal = cart?.subtotal || 0;
  const shippingFee = subtotal > 500000 || subtotal === 0 ? 0 : 30000;
  const total = subtotal + shippingFee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-serif text-3xl font-bold text-[#1A1918] mb-8">Giỏ Hàng Của Bạn</h1>

      {items.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-3xl border border-[#EAE6DF] p-8">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-20 h-20 text-[#8C867E] mx-auto mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 1 0-7.5 0v4.5m11.356-1.993 1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 0 1-1.12-1.243l1.264-12A1.125 1.125 0 0 1 5.513 7.5h12.974c.576 0 1.059.435 1.119 1.007ZM8.625 10.5a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Zm7.5 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
          </svg>
          <h2 className="font-serif text-xl font-semibold text-[#1A1918] mb-2">Giỏ hàng trống</h2>
          <p className="text-sm text-[#8C867E] mb-6">Bạn chưa có sản phẩm nào trong giỏ hàng.</p>
          <Link href="/" className="px-6 py-3 rounded-full bg-[#1A1918] text-white hover:bg-[#D4A373] transition">
            Tiếp tục mua sắm
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Cart Items List */}
          <div className="lg:col-span-7 space-y-4">
            {items.map((item) => (
              <div key={item.id} className="flex gap-4 bg-white p-4 rounded-2xl border border-[#EAE6DF] shadow-sm relative overflow-hidden group">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-[#FAF9F6] border border-[#FAF9F6] flex-shrink-0">
                  <img src={item.primary_image_url} alt={item.name} className="w-full h-full object-cover" />
                </div>
                <div className="flex-grow flex flex-col justify-between py-1">
                  <div>
                    <h3 className="font-serif text-base font-bold text-[#1A1918] line-clamp-1">
                      <Link href={`/product/${item.slug}`} className="hover:text-[#D4A373] transition">
                        {item.name}
                      </Link>
                    </h3>
                    <p className="text-sm font-semibold text-[#C2410C] mt-1">{formatPrice(item.price)}</p>
                  </div>
                  
                  <div className="flex justify-between items-center mt-2">
                    {/* Quantity Selector */}
                    <div className="flex items-center border border-[#EAE6DF] rounded-lg overflow-hidden bg-[#FAF9F6]">
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity, -1)}
                        className="px-2.5 py-1 text-[#5C5752] hover:bg-[#F2EFE9] transition font-bold"
                      >
                        -
                      </button>
                      <span className="px-3 py-1 font-medium text-xs text-[#2C2A29]">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantityChange(item.id, item.quantity, 1)}
                        className="px-2.5 py-1 text-[#5C5752] hover:bg-[#F2EFE9] transition font-bold"
                      >
                        +
                      </button>
                    </div>

                    {/* Delete item */}
                    <button
                      onClick={() => handleRemove(item.id)}
                      className="text-xs text-red-500 hover:text-red-700 transition font-medium cursor-pointer"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Checkout & Pricing summary */}
          <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-3xl border border-[#EAE6DF] shadow-sm space-y-6">
            <h2 className="font-serif text-xl font-bold text-[#1A1918] border-b border-[#F2EFE9] pb-3">Đơn hàng & Thanh toán</h2>
            
            {/* Price list */}
            <div className="space-y-3 text-sm border-b border-[#F2EFE9] pb-4">
              <div className="flex justify-between text-[#5C5752]">
                <span>Tạm tính:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#5C5752]">
                <span>Vận chuyển:</span>
                <span>{shippingFee === 0 ? 'Miễn phí' : formatPrice(shippingFee)}</span>
              </div>
              {shippingFee > 0 && (
                <p className="text-[10px] text-[#8C867E] text-right italic">
                  *Miễn phí vận chuyển cho đơn hàng từ {formatPrice(500000)}
                </p>
              )}
              <div className="flex justify-between text-base font-bold text-[#1A1918] pt-2">
                <span>Tổng cộng:</span>
                <span className="text-[#C2410C]">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Delivery Form */}
            <form onSubmit={handleCheckout} className="space-y-4">
              <h3 className="text-xs uppercase tracking-wider text-[#8C867E] font-bold">Thông tin giao hàng</h3>
              <div>
                <label className="block text-xs font-semibold text-[#5C5752] mb-1">Họ tên người nhận *</label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A373]"
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5C5752] mb-1">Số điện thoại *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A373]"
                  placeholder="0987654321"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-[#5C5752] mb-1">Địa chỉ chi tiết *</label>
                  <input
                    type="text"
                    required
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A373]"
                    placeholder="Số 123 Đường Lê Lợi"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-[#5C5752] mb-1">Tỉnh / Thành phố *</label>
                  <input
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-[#FAF9F6] border border-[#EAE6DF] rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-[#D4A373]"
                    placeholder="Hồ Chí Minh"
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2 pt-2">
                <span className="block text-xs font-semibold text-[#5C5752]">Phương thức thanh toán</span>
                <div className="grid grid-cols-2 gap-3">
                  <label className={`flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer text-center transition ${
                    paymentMethod === 'cod' ? 'border-[#D4A373] bg-[#D4A373]/5' : 'border-[#EAE6DF]'
                  }`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="cod"
                      checked={paymentMethod === 'cod'}
                      onChange={() => setPaymentMethod('cod')}
                      className="sr-only"
                    />
                    <span className="text-sm font-semibold">COD</span>
                    <span className="text-[10px] text-[#8C867E] mt-0.5">Thanh toán khi nhận hàng</span>
                  </label>
                  <label className={`flex flex-col items-center justify-center p-3 border rounded-xl cursor-pointer text-center transition ${
                    paymentMethod === 'bank_transfer' ? 'border-[#D4A373] bg-[#D4A373]/5' : 'border-[#EAE6DF]'
                  }`}>
                    <input
                      type="radio"
                      name="payment_method"
                      value="bank_transfer"
                      checked={paymentMethod === 'bank_transfer'}
                      onChange={() => setPaymentMethod('bank_transfer')}
                      className="sr-only"
                    />
                    <span className="text-sm font-semibold">Chuyển Khoản</span>
                    <span className="text-[10px] text-[#8C867E] mt-0.5">Thanh toán tài khoản ngân hàng</span>
                  </label>
                </div>
              </div>

              {/* Submit Checkout */}
              <button
                type="submit"
                disabled={submitting}
                className="w-full mt-4 py-4 bg-[#C2410C] hover:bg-[#D4A373] text-white rounded-full font-bold transition shadow flex items-center justify-center space-x-2 cursor-pointer"
              >
                {submitting ? (
                  <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                ) : (
                  <span>Đặt Hàng Ngay</span>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
