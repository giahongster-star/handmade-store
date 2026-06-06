'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/orders/${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setOrder(data.data);
        } else {
          setOrder(null);
        }
      })
      .catch(err => console.error(err))
      .finally(() => setLoading(false));
  }, [id]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const getStatusText = (status) => {
    const statusMap = {
      'pending': 'Chờ xử lý',
      'processing': 'Đang chuẩn bị hàng',
      'shipping': 'Đang giao hàng',
      'completed': 'Đã giao hàng thành công',
      'cancelled': 'Đã hủy đơn'
    };
    return statusMap[status] || status;
  };

  const getPaymentMethodText = (method) => {
    const methodMap = {
      'cod': 'Thanh toán khi nhận hàng (COD)',
      'bank_transfer': 'Chuyển khoản ngân hàng'
    };
    return methodMap[method] || method;
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center animate-pulse">
        <div className="mx-auto h-16 w-16 bg-gray-200 rounded-full mb-6" />
        <div className="h-8 bg-gray-200 rounded w-1/2 mx-auto mb-4" />
        <div className="h-4 bg-gray-200 rounded w-1/3 mx-auto mb-12" />
        <div className="h-64 bg-gray-200 rounded-2xl" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-24 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-red-500 mx-auto mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z" />
        </svg>
        <h2 className="font-serif text-2xl font-bold text-gray-900 mb-2">Đơn hàng không tồn tại</h2>
        <p className="text-gray-500 mb-6">Chúng tôi không thể tìm thấy thông tin đơn hàng này.</p>
        <Link href="/" className="px-6 py-3 rounded-full bg-[#1A1918] text-white hover:bg-[#D4A373] transition">
          Quay lại cửa hàng
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Success banner */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-50 text-green-600 mb-4 border border-green-200 shadow-sm">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-8 h-8">
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 12.75 6 6 9-13.5" />
          </svg>
        </div>
        <h1 className="font-serif text-3xl font-bold text-[#1A1918] mb-2">Đặt Hàng Thành Công!</h1>
        <p className="text-[#5C5752] text-sm font-light">
          Cảm ơn bạn đã lựa chọn sản phẩm thủ công tại AuraCraft. Đơn hàng của bạn đang được kiểm tra.
        </p>
      </div>

      {/* Main receipt card */}
      <div className="bg-white rounded-3xl border border-[#EAE6DF] shadow-sm overflow-hidden">
        {/* Header receipt info */}
        <div className="bg-[#FAF9F6] px-6 py-6 border-b border-[#EAE6DF] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="text-xs uppercase tracking-wider text-[#8C867E]">Mã đơn hàng</span>
            <p data-testid="order-code" data-order-code={order.code} data-order-id={order.id} className="text-lg font-bold text-[#1A1918]">{order.code}</p>
          </div>
          <div>
            <span className="text-xs uppercase tracking-wider text-[#8C867E]">Trạng thái đơn hàng</span>
            <p className="text-sm font-bold text-[#C2410C] mt-0.5">{getStatusText(order.status)}</p>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-8">
          {/* Order Details */}
          <div>
            <h3 className="text-xs uppercase tracking-wider text-[#1A1918] font-bold mb-4">Danh sách sản phẩm</h3>
            <div className="divide-y divide-[#F2EFE9]">
              {order.items?.map((item) => (
                <div key={item.id} className="py-4 flex gap-4 items-center">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-[#FAF9F6] border border-[#EAE6DF] flex-shrink-0">
                    <img src={item.primary_image_url} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-grow">
                    <h4 className="font-serif text-sm font-bold text-[#1A1918] line-clamp-1">{item.name}</h4>
                    <p className="text-xs text-[#8C867E] mt-0.5">Số lượng: {item.quantity}</p>
                  </div>
                  <span className="text-sm font-bold text-[#2C2A29] flex-shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Checkout pricing details */}
          <div className="border-t border-[#F2EFE9] pt-6 space-y-3">
            <div className="flex justify-between text-sm text-[#5C5752]">
              <span>Tạm tính:</span>
              <span>{formatPrice(order.total_amount - order.shipping_fee)}</span>
            </div>
            <div className="flex justify-between text-sm text-[#5C5752]">
              <span>Vận chuyển:</span>
              <span>{order.shipping_fee === 0 ? 'Miễn phí' : formatPrice(order.shipping_fee)}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-[#1A1918] pt-2 border-t border-dashed border-[#EAE6DF]">
              <span>Tổng thanh toán:</span>
              <span data-testid="order-total" data-value={order.total_amount} className="text-[#C2410C] text-lg">{formatPrice(order.total_amount)}</span>
            </div>
          </div>

          {/* Delivery & Payment Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 border-t border-[#F2EFE9] pt-8">
            <div>
              <h3 className="text-xs uppercase tracking-wider text-[#8C867E] font-bold mb-3">Thông tin giao hàng</h3>
              <div className="text-sm space-y-1.5 font-light text-[#2C2A29]">
                <p className="font-semibold">{order.shipping_address.recipient_name}</p>
                <p>SĐT: {order.shipping_address.phone}</p>
                <p>{order.shipping_address.address_line}</p>
                <p>{order.shipping_address.city}, Việt Nam</p>
              </div>
            </div>
            <div>
              <h3 className="text-xs uppercase tracking-wider text-[#8C867E] font-bold mb-3">Phương thức & Trạng thái</h3>
              <div className="text-sm space-y-2 text-[#2C2A29]">
                <div>
                  <span className="text-xs text-[#8C867E] block">Thanh toán:</span>
                  <span className="font-medium">{getPaymentMethodText(order.payment_method)}</span>
                </div>
                <div>
                  <span className="text-xs text-[#8C867E] block">Trạng thái thanh toán:</span>
                  <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full ${
                    order.payment_status === 'paid' ? 'bg-green-50 text-green-700' : 'bg-orange-50 text-orange-700'
                  }`}>
                    {order.payment_status === 'paid' ? 'Đã thanh toán' : 'Chưa thanh toán'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-10">
        <Link href="/" data-testid="continue-shopping-btn" className="px-8 py-3.5 bg-[#1A1918] hover:bg-[#D4A373] text-white rounded-full font-semibold transition shadow hover:shadow-md">
          Tiếp Tục Mua Sắm
        </Link>
      </div>
    </div>
  );
}
