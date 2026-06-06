'use client';

import { useEffect, useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

function HomePageContent() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('created_at:desc');
  const [pagination, setPagination] = useState({ page: 1, total_pages: 1 });
  const [page, setPage] = useState(1);
  const { addItem } = useCart();
  const [addingId, setAddingId] = useState(null);

  const searchParams = useSearchParams();
  const router = useRouter();

  // Load categories
  useEffect(() => {
    fetch('/api/categories')
      .then(res => res.json())
      .then(data => {
        if (data.success) setCategories(data.data);
      });
  }, []);

  // Update selected category if query param exists
  useEffect(() => {
    const catSlug = searchParams.get('category');
    if (catSlug && categories.length > 0) {
      const cat = categories.find(c => c.slug === catSlug);
      if (cat) {
        setSelectedCategory(cat.id);
        setPage(1);
      }
    } else if (!catSlug) {
      setSelectedCategory('');
    }
  }, [searchParams, categories]);

  // Fetch products based on search, category, sort, and page
  useEffect(() => {
    setLoading(true);
    let url = `/api/products?page=${page}&limit=8&sort=${sortBy}`;
    if (selectedCategory) {
      url += `&category_id=${selectedCategory}`;
    }
    if (search) {
      url += `&search=${encodeURIComponent(search)}`;
    }

    fetch(url)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setProducts(data.products);
          setPagination(data.pagination);
        }
      })
      .finally(() => setLoading(false));
  }, [selectedCategory, search, sortBy, page]);

  const handleAddToCart = async (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    setAddingId(productId);
    const res = await addItem(productId, 1);
    setAddingId(null);
    if (res.success) {
      // Small feedback/toast could be triggered here
    } else {
      alert(res.error || 'Lỗi thêm sản phẩm');
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <div className="pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-[#1A1918] py-24 px-4 text-center sm:px-6 lg:px-8">
        <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center" />
        <div className="relative max-w-3xl mx-auto">
          <span className="text-xs uppercase tracking-[0.3em] text-[#D4A373] font-semibold mb-3 block">
            Nghệ Thuật Chế Tác Bản Địa
          </span>
          <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-white mb-6 leading-tight">
            Thổi Hồn Vào Không Gian Sống Của Bạn
          </h1>
          <p className="text-base sm:text-lg text-[#D6D3D1] mb-8 max-w-xl mx-auto font-light leading-relaxed">
            Khám phá bộ sưu tập đồ gốm nung hỏa biến, đồ da thật khâu tay và các sản phẩm nghệ thuật độc bản làm tay 100%.
          </p>
          <div className="max-w-md mx-auto relative">
            <input
              type="text"
              placeholder="Tìm kiếm sản phẩm độc đáo của bạn..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full px-5 py-4 pr-12 rounded-full border-none bg-white/10 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#D4A373] backdrop-blur-md transition-all shadow-lg text-sm"
            />
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-white/50">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m21-21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.608 10.608Z" />
              </svg>
            </span>
          </div>
        </div>
      </section>

      {/* Main Content: Categories & Products */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Sidebar Filters */}
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="bg-white p-6 rounded-2xl border border-[#EAE6DF] sticky top-28">
              <h2 className="font-serif text-lg font-bold text-[#1A1918] mb-4 pb-2 border-b border-[#F2EFE9]">
                Bộ Lọc Tìm Kiếm
              </h2>
              
              {/* Categories */}
              <div className="mb-6">
                <h3 className="text-xs uppercase tracking-wider text-[#8C867E] font-semibold mb-3">
                  Danh Mục
                </h3>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedCategory('');
                      setPage(1);
                      router.push('/');
                    }}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      selectedCategory === ''
                        ? 'bg-[#F2EFE9] text-[#1A1918] font-semibold'
                        : 'text-[#5C5752] hover:bg-[#FAF9F6] hover:text-[#1A1918]'
                    }`}
                  >
                    Tất cả sản phẩm
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategory(cat.id);
                        setPage(1);
                        router.push(`/?category=${cat.slug}`);
                      }}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        selectedCategory === cat.id
                          ? 'bg-[#F2EFE9] text-[#1A1918] font-semibold'
                          : 'text-[#5C5752] hover:bg-[#FAF9F6] hover:text-[#1A1918]'
                      }`}
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Sort Options */}
              <div>
                <h3 className="text-xs uppercase tracking-wider text-[#8C867E] font-semibold mb-3">
                  Sắp Xếp
                </h3>
                <select
                  value={sortBy}
                  onChange={(e) => {
                    setSortBy(e.target.value);
                    setPage(1);
                  }}
                  className="w-full bg-[#FAF9F6] border border-[#EAE6DF] rounded-lg px-3 py-2 text-sm text-[#2C2A29] focus:outline-none focus:ring-1 focus:ring-[#D4A373]"
                >
                  <option value="created_at:desc">Mới nhất</option>
                  <option value="price:asc">Giá: Thấp đến Cao</option>
                  <option value="price:desc">Giá: Cao đến Thấp</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Product Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[...Array(6)].map((_, idx) => (
                  <div key={idx} className="bg-white rounded-2xl border border-[#EAE6DF] overflow-hidden animate-pulse">
                    <div className="h-64 bg-[#F2EFE9]" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-[#F2EFE9] rounded w-2/3" />
                      <div className="h-3 bg-[#F2EFE9] rounded w-1/3" />
                      <div className="h-6 bg-[#F2EFE9] rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-2xl border border-[#EAE6DF] p-8">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-16 h-16 text-[#8C867E] mx-auto mb-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m21-21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.608 10.608Z" />
                </svg>
                <h3 className="font-serif text-lg font-semibold text-[#1A1918] mb-1">Không tìm thấy sản phẩm</h3>
                <p className="text-sm text-[#8C867E]">Thử thay đổi bộ lọc hoặc từ khóa tìm kiếm của bạn.</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product) => (
                    <Link
                      href={`/product/${product.slug}`}
                      key={product.id}
                      className="group bg-white rounded-2xl border border-[#EAE6DF] overflow-hidden hover:shadow-xl hover:border-[#D4A373]/50 transition-all duration-300 flex flex-col justify-between"
                    >
                      <div>
                        {/* Image Container */}
                        <div className="relative aspect-square overflow-hidden bg-[#FAF9F6]">
                          <img
                            src={product.primary_image_url || 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=600&q=80'}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            loading="lazy"
                          />
                          {product.stock === 0 && (
                            <span className="absolute top-3 left-3 bg-[#1A1918] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                              Hết Hàng
                            </span>
                          )}
                        </div>

                        {/* Text details */}
                        <div className="p-5">
                          <span className="text-[10px] uppercase tracking-widest text-[#8C867E] font-medium block mb-1.5">
                            {product.category_name}
                          </span>
                          <h3 className="font-serif text-base font-bold text-[#1A1918] group-hover:text-[#D4A373] transition duration-300 line-clamp-1">
                            {product.name}
                          </h3>
                          <p className="text-xs text-[#8C867E] line-clamp-2 mt-1.5 leading-relaxed font-light">
                            {product.description}
                          </p>
                        </div>
                      </div>

                      {/* Footer Section */}
                      <div className="p-5 pt-0 flex items-center justify-between border-t border-[#FAF9F6] mt-4">
                        <span className="text-base font-bold text-[#C2410C]">
                          {formatPrice(product.price)}
                        </span>
                        
                        <button
                          disabled={product.stock === 0 || addingId === product.id}
                          onClick={(e) => handleAddToCart(e, product.id)}
                          className="p-2 rounded-full bg-[#1A1918] text-white hover:bg-[#D4A373] transition-colors disabled:bg-gray-200 disabled:text-gray-400 cursor-pointer disabled:cursor-not-allowed"
                          title="Thêm vào giỏ"
                        >
                          {addingId === product.id ? (
                            <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                            </svg>
                          ) : (
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Pagination */}
                {pagination.total_pages > 1 && (
                  <div className="flex items-center justify-center space-x-2 mt-12">
                    <button
                      disabled={page === 1}
                      onClick={() => setPage(p => Math.max(p - 1, 1))}
                      className="px-4 py-2 border border-[#EAE6DF] rounded-xl text-sm text-[#5C5752] hover:bg-[#F2EFE9] disabled:opacity-50 transition"
                    >
                      Trước
                    </button>
                    <span className="text-sm font-medium text-[#2C2A29]">
                      Trang {page} / {pagination.total_pages}
                    </span>
                    <button
                      disabled={page === pagination.total_pages}
                      onClick={() => setPage(p => Math.min(p + 1, pagination.total_pages))}
                      className="px-4 py-2 border border-[#EAE6DF] rounded-xl text-sm text-[#5C5752] hover:bg-[#F2EFE9] disabled:opacity-50 transition"
                    >
                      Sau
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center text-[#8C867E] animate-pulse">
        Đang tải cửa hàng AuraCraft...
      </div>
    }>
      <HomePageContent />
    </Suspense>
  );
}
