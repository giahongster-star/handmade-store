import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const uuid = () => crypto.randomUUID();

const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove Vietnamese accents
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

const DB_PATH = path.join(process.cwd(), 'database.json');
const CSV_PATH = path.join(process.cwd(), 'products.csv');

// Load database.json
if (!fs.existsSync(DB_PATH)) {
  console.error('database.json not found!');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf-8'));

// Get existing categories to map correctly
const categoryMap = {};
data.categories.forEach(c => {
  categoryMap[c.slug] = c.id;
});

const moreProducts = [
  // 1. Gốm sứ thủ công (10 sản phẩm)
  {
    category: 'gom-su-thu-cong',
    name: 'Cốc Sứ Vẽ Tay Hoa Mai',
    price: 150000,
    stock: 25,
    description: 'Cốc uống nước bằng sứ tráng men cao cấp, họa tiết hoa mai được vẽ tay tỉ mỉ từ nghệ nhân Bát Tràng.',
    attributes: { material: 'Sứ Bát Tràng', capacity: '350ml', heat_resistant: 'Có', color: 'Trắng vẽ hoa xanh' },
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'gom-su-thu-cong',
    name: 'Chậu Cây Gốm Đất Nung Khắc Nổi',
    price: 180000,
    stock: 15,
    description: 'Chậu trồng cây để bàn làm từ đất nung tự nhiên, họa tiết hình học được khắc nổi mộc mạc phong cách vintage.',
    attributes: { material: 'Đất nung đỏ', dimensions: '12cm x 12cm', drainage_hole: 'Có', weight: '400g' },
    imageUrl: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'gom-su-thu-cong',
    name: 'Đĩa Sứ Trưng Bày Men Rạn',
    price: 320000,
    stock: 8,
    description: 'Đĩa sứ tráng men rạn truyền thống cổ kính. Thích hợp để trưng bày phòng khách hoặc đựng trái cây sang trọng.',
    attributes: { material: 'Sứ tráng men rạn cổ', dimensions: 'Đường kính 25cm', style: 'Cổ điển Đông Dương' },
    imageUrl: 'https://images.unsplash.com/photo-1589987607627-616cac5c2c5a?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'gom-su-thu-cong',
    name: 'Chén Trà Gốm Tráng Men Ngọc',
    price: 90000,
    stock: 40,
    description: 'Chén uống trà nhỏ xinh tráng men ngọc bích sáng bóng, viền gốm thô cầm chắc tay cách nhiệt tốt.',
    attributes: { material: 'Gốm men ngọc', capacity: '60ml', style: 'Zen Nhật Bản' },
    imageUrl: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'gom-su-thu-cong',
    name: 'Bình Tỳ Bà Gốm Chu Đậu',
    price: 1250000,
    stock: 4,
    description: 'Bình hoa dáng tỳ bà nghệ thuật vẽ lam cổ điển từ gốm Chu Đậu nổi tiếng. Phù hợp làm quà tặng tân gia đẳng cấp.',
    attributes: { material: 'Gốm Chu Đậu cổ', dimensions: 'Cao 35cm', decoration: 'Vẽ tay chim hoa cổ' },
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'gom-su-thu-cong',
    name: 'Bộ Muỗng Nĩa Sứ Vintage',
    price: 240000,
    stock: 12,
    description: 'Bộ sản phẩm gồm 4 muỗng và 4 nĩa cán sứ tráng men hoa cúc nhỏ xinh, sang trọng cho bàn ăn gia đình.',
    attributes: { material: 'Inox 304 cán sứ tráng men', length: '15cm', quantity: '8 món' },
    imageUrl: 'https://images.unsplash.com/photo-1543510473-ac2c35329a28?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'gom-su-thu-cong',
    name: 'Tượng Phật Gốm Sa Thạch',
    price: 490000,
    stock: 6,
    description: 'Tượng thiền phật bằng chất liệu gốm sa thạch thô ráp trầm mặc, mang lại cảm giác bình yên thư thái cho bàn trà.',
    attributes: { material: 'Sa thạch nung thô', height: '18cm', weight: '700g' },
    imageUrl: 'https://images.unsplash.com/photo-1606744824163-985d376605aa?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'gom-su-thu-cong',
    name: 'Khay Trà Gốm Đất Nung Khảm Chỉ',
    price: 590000,
    stock: 5,
    description: 'Khay trà chữ nhật bằng đất nung nâu trầm ấm, khảm chỉ đồng mờ quanh mép tinh xảo.',
    attributes: { material: 'Đất nung đen khảm chỉ đồng', dimensions: '30cm x 20cm', origin: 'Móng Cái' },
    imageUrl: 'https://images.unsplash.com/photo-1563822249548-9a72b6353cd1?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'gom-su-thu-cong',
    name: 'Lọ Hoa Thủy Tinh Vẽ Gốm',
    price: 195000,
    stock: 18,
    description: 'Sự kết hợp độc đáo giữa thân thủy tinh thổi thủ công và miệng lọ bọc gốm sần nghệ thuật màu đất.',
    attributes: { material: 'Thủy tinh tái chế, gốm sần', height: '25cm' },
    imageUrl: 'https://images.unsplash.com/photo-1581781898089-9157cf168f5c?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'gom-su-thu-cong',
    name: 'Bát Ăn Dặm Gốm Hình Thú',
    price: 110000,
    stock: 30,
    description: 'Bát ăn cho bé làm từ đất sét hữu cơ không chứa chì, tạo hình chú gấu nâu ngộ nghĩnh kích thích bé ăn ngon miệng.',
    attributes: { material: 'Đất sét hữu cơ nung nhiệt độ cao', safety: 'BPA-Free, Không chì', dimensions: '12cm' },
    imageUrl: 'https://images.unsplash.com/photo-1594911774802-8822a7079ae1?auto=format&fit=crop&w=600&q=80'
  },

  // 2. Đồ da cao cấp (10 sản phẩm)
  {
    category: 'do-da-cao-cap',
    name: 'Bao Da Đựng Passport Khắc Tên',
    price: 290000,
    stock: 20,
    description: 'Bao da hộ chiếu nhỏ gọn làm từ da bò Veg-tan mộc mạc, khâu chỉ gai chịu lực tốt.',
    attributes: { material: 'Da bò Veg-tan nhập khẩu', dimensions: '14cm x 10cm', slots: '1 ngăn passport, 2 ngăn thẻ' },
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'do-da-cao-cap',
    name: 'Ví Sen Đựng Thẻ Da Epsom',
    price: 390000,
    stock: 25,
    description: 'Ví đựng thẻ và tiền gấp siêu gọn nhẹ dáng ví Sen độc đáo chế tác từ da Epsom chống xước cực tốt.',
    attributes: { material: 'Da bò Epsom cao cấp', dimensions: '10cm x 7.5cm', capacity: 'Đựng 6 thẻ & 10 tờ tiền' },
    imageUrl: 'https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'do-da-cao-cap',
    name: 'Móc Khóa Da Bò Sáp Bện Dây',
    price: 850000,
    stock: 50,
    description: 'Móc khóa đồng thau kết hợp dây da bò sáp bện tay chắc chắn, cá tính.',
    attributes: { material: 'Da bò sáp, đồng thau nguyên khối', length: '12cm' },
    imageUrl: 'https://images.unsplash.com/photo-1547082299-de196ea013d6?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'do-da-cao-cap',
    name: 'Bao Da Bút Ký Cao Cấp',
    price: 180000,
    stock: 35,
    description: 'Ống cắm bút ký cá nhân may tay bằng da Pull-up mềm mại, bảo vệ bút mực đắt giá của bạn tránh trầy xước.',
    attributes: { material: 'Da bò Pull-up thật', capacity: '1 bút lớn', length: '16cm' },
    imageUrl: 'https://images.unsplash.com/photo-1583485088034-697b5bc54ccd?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'do-da-cao-cap',
    name: 'Dây Đồng Hồ Da Đà Điểu Khâu Tay',
    price: 450000,
    stock: 15,
    description: 'Dây đeo đồng hồ từ da đà điểu tự nhiên với hoa văn hạt đặc trưng, lót da bò Zermatt chống thấm mồ hôi hiệu quả.',
    attributes: { material: 'Da chân đà điểu, lót Zermatt', strap_size: '20mm - 22mm', length: '115mm/75mm' },
    imageUrl: 'https://images.unsplash.com/photo-1524592094714-0f0654e20314?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'do-da-cao-cap',
    name: 'Sổ Tay Bọc Da Bò Vintage',
    price: 350000,
    stock: 18,
    description: 'Cuốn sổ tay có bìa bọc da bò sáp nguyên tấm dày dặn, ruột giấy kraft xi măng viết nhật ký rất có chiều sâu.',
    attributes: { material: 'Da bò sáp nguyên tấm, giấy Kraft', size: 'Khổ A5 (200 trang)', layout: 'Kẻ ngang' },
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'do-da-cao-cap',
    name: 'Túi Đựng Mỹ Phẩm Da Thật',
    price: 690000,
    stock: 10,
    description: 'Túi đựng đồ cá nhân dáng hộp rộng rãi cho các chuyến du lịch, khóa kéo mượt mà chống nước nhẹ.',
    attributes: { material: 'Da bò Mill hạt, lót chống thấm', dimensions: '20cm x 12cm x 8cm' },
    imageUrl: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'do-da-cao-cap',
    name: 'Bao Da Airpods Khâu Đục Tay',
    price: 220000,
    stock: 30,
    description: 'Case bảo vệ tai nghe Airpods khâu tay ôm khít thiết bị, kèm móc treo thắt lưng đồng thau tiện lợi.',
    attributes: { material: 'Da bò Buttero Ý', closure: 'Khuy bấm đồng', compatibility: 'Airpods Pro / Airpods 3' },
    imageUrl: 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'do-da-cao-cap',
    name: 'Thắt Lưng Da Bò Một Lớp Bản Tròn',
    price: 490000,
    stock: 14,
    description: 'Dây nịt da bò nguyên miếng đanh dẻo, đầu khóa kim chất liệu hợp kim chống gỉ mạ màu đồng cổ.',
    attributes: { material: 'Da bò nguyên tấm một lớp', strap_width: '3.8cm', length: '115cm - 125cm' },
    imageUrl: 'https://images.unsplash.com/photo-1624224971170-2f84fed5eb5e?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'do-da-cao-cap',
    name: 'Ví Cầm Tay Clutch Da Epsom Nữ',
    price: 1200000,
    stock: 5,
    description: 'Clutch cầm tay nữ sang trọng đựng vừa điện thoại và tiền mặt phẳng, thiết kế thanh lịch tối giản.',
    attributes: { material: 'Da Epsom Ý khâu tay', dimensions: '22cm x 13cm x 3cm', hardware: 'Khóa mạ vàng 18K' },
    imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc15aae9?auto=format&fit=crop&w=600&q=80'
  },

  // 3. Nến thơm nghệ thuật (10 sản phẩm)
  {
    category: 'nen-thom-nghe-thuat',
    name: 'Xà Phòng Sinh Dược Bạc Hà',
    price: 45000,
    stock: 100,
    description: 'Xà bông thảo dược tự nhiên sản xuất thủ công tại hợp tác xã Sinh Dược, mát lạnh sảng khoái.',
    attributes: { material: 'Dầu dừa, tinh dầu bạc hà, mật ong', weight: '100g', shelf_life: '18 tháng' },
    imageUrl: 'https://images.unsplash.com/photo-1607006342445-5659b8d4f40f?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'nen-thom-nghe-thuat',
    name: 'Nến Thơm Sáp Ong Hoa Oải Hương',
    price: 270000,
    stock: 15,
    description: 'Nến sáp ong tự nhiên bấc cotton không khói, tinh dầu oải hương Pháp nhẹ nhàng dễ ngủ.',
    attributes: { material: 'Sáp ong nguyên chất, bấc cotton', burn_time: '30 giờ', scent: 'Lavender & Rosemary' },
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'nen-thom-nghe-thuat',
    name: 'Nến Thơm Hoa Hồng Ngọt Ngào',
    price: 260000,
    stock: 22,
    description: 'Nến thơm đựng trong hũ thủy tinh Amber mộc mạc, hương hoa hồng Bungari lãng mạn.',
    attributes: { material: 'Sáp đậu nành bấc gỗ kêu lách tách', weight: '180g', scent_notes: 'Rose, Red Apple, Amber' },
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'nen-thom-nghe-thuat',
    name: 'Tinh Dầu Treo Xe Bưởi Hồng',
    price: 120000,
    stock: 45,
    description: 'Lọ khuếch tán tinh dầu nắp gỗ treo xe ô tô hoặc tủ quần áo khử mùi, mang lại sự mát lành từ vỏ bưởi.',
    attributes: { material: 'Tinh dầu bưởi hồng nguyên chất', capacity: '10ml', durability: '2-3 tháng sử dụng' },
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'nen-thom-nghe-thuat',
    name: 'Nến Thơm Trà Xanh Thanh Mát',
    price: 240000,
    stock: 18,
    description: 'Hương thơm sảng khoái mát lành của lá trà xanh sương sớm kết hợp hoa nhài dịu nhẹ.',
    attributes: { material: 'Sáp dừa sáp đậu nành bấc cotton', weight: '150g', scent_notes: 'Green Tea, Jasmine, Musk' },
    imageUrl: 'https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'nen-thom-nghe-thuat',
    name: 'Xà Phòng Than Tre Trị Mụn',
    price: 55000,
    stock: 60,
    description: 'Xà bông than tre hoạt tính thải độc da body, giúp giảm mụn lưng và làm sạch sâu tế bào chết.',
    attributes: { material: 'Than tre hoạt tính, dầu ô liu', weight: '90g', type: 'Dùng cho body & mặt' },
    imageUrl: 'https://images.unsplash.com/photo-1607006342445-5659b8d4f40f?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'nen-thom-nghe-thuat',
    name: 'Nến Trụ Decor Bọt Biển',
    price: 180000,
    stock: 10,
    description: 'Nến thơm tạo hình khối vuông bọt biển dùng để decor bàn làm việc cực đẹp, hương gỗ vani ngọt ngào.',
    attributes: { material: 'Sáp paraffin cọ tự nhiên', dimensions: '6cm x 6cm', scent: 'Vanilla & Coffee' },
    imageUrl: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'nen-thom-nghe-thuat',
    name: 'Sáp Thơm Treo Tủ Quần Áo',
    price: 85000,
    stock: 40,
    description: 'Miếng sáp treo đính kèm hoa khô thiên nhiên trang trí, giúp lưu hương tủ quần áo thơm ngát.',
    attributes: { material: 'Sáp đậu nành, hoa cúc khô, tinh dầu hoa cam', duration: '2 tháng' },
    imageUrl: 'https://images.unsplash.com/photo-1508747703725-719ae2c73ee0?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'nen-thom-nghe-thuat',
    name: 'Nến Ly Nghệ Thuật Hoa Khô',
    price: 350000,
    stock: 8,
    description: 'Ly nến gel thủy tinh trong suốt ôm lấy những đóa hoa cúc vàng khô lấp lánh như bức tranh nghệ thuật.',
    attributes: { material: 'Nến gel trong suốt bấc không chì', burn_time: '40 giờ', scent: 'Citrus & Amber' },
    imageUrl: 'https://images.unsplash.com/photo-1547949003-9792a18a2601?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'nen-thom-nghe-thuat',
    name: 'Xịt Thơm Phòng Sả Chanh Đuổi Muỗi',
    price: 140000,
    stock: 30,
    description: 'Xịt kháng khuẩn khử mùi phòng tinh dầu sả chanh tự nhiên, hỗ trợ xua đuổi côn trùng hiệu quả.',
    attributes: { material: 'Tinh dầu sả chanh chưng cất hơi nước', capacity: '100ml', safety: 'Phù hợp nhà có trẻ nhỏ' },
    imageUrl: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=600&q=80'
  },

  // 4. Trang sức & phụ kiện (10 sản phẩm)
  {
    category: 'trang-suc-phu-kien',
    name: 'Dây Chuyền Mặt Đá Mặt Trăng',
    price: 480000,
    stock: 12,
    description: 'Dây chuyền bạc đính đá Moonstone lấp lánh phản quang xanh huyền ảo phong cách bohemian.',
    attributes: { material: 'Bạc S925, đá Moonstone tự nhiên', chain_length: '40cm + 5cm xích chờ' },
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'trang-suc-phu-kien',
    name: 'Nhẫn Bạc Chỉ Đơn Giản May Mắn',
    price: 190000,
    stock: 30,
    description: 'Chiếc nhẫn bạc trơn dáng mảnh ổ khóa xoắn đơn giản nhưng mang ý nghĩa bảo vệ bình an.',
    attributes: { material: 'Bạc S925 nguyên chất', size: 'Ni tay từ 10 đến 16' },
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'trang-suc-phu-kien',
    name: 'Lắc Chân Hạt Đậu Bạc Dễ Thương',
    price: 280000,
    stock: 15,
    description: 'Lắc chân xích mảnh kết hợp các hạt đậu bạc nhỏ tròn lăn tăn vui mắt ôm chân.',
    attributes: { material: 'Bạc S925 xi bạch kim', length: '22cm + 3cm' },
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'trang-suc-phu-kien',
    name: 'Kính Mắt Gọng Gỗ Mun Thủ Công',
    price: 1650000,
    stock: 3,
    description: 'Kính râm gọng làm hoàn toàn bằng gỗ mun đen sọc tự nhiên đánh bóng dầu oliu cực chất.',
    attributes: { material: 'Gỗ mun thật, tròng kính polarized chống UV400', weight: '28g' },
    imageUrl: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'trang-suc-phu-kien',
    name: 'Vòng Cổ Choker Hạt Cườm Biển',
    price: 95000,
    stock: 50,
    description: 'Choker cá tính cho mùa hè biển đan từ hạt cườm cẩm thạch lam kết hợp vỏ sò biển tự nhiên.',
    attributes: { material: 'Hạt cườm cẩm thạch, vỏ điệp tự nhiên', length: '38cm' },
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'trang-suc-phu-kien',
    name: 'Khuyên Tai Tròn Bạc Phay Xước',
    price: 210000,
    stock: 25,
    description: 'Khuyên tai khoen tròn basic được mài phay xước bề mặt hiện đại chống trầy.',
    attributes: { material: 'Bạc S925 nguyên chất', diameter: '20mm' },
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'trang-suc-phu-kien',
    name: 'Vòng Tay Chỉ Đỏ Kim Cương Nhân Tạo',
    price: 150000,
    stock: 80,
    description: 'Vòng tay chỉ đỏ phong thủy may mắn đính viên đá CZ bạc 3 ly lấp lánh như kim cương.',
    attributes: { material: 'Sợi dù chỉ đỏ Thái Lan, chốt bạc S925, đá CZ', size: 'Tự điều chỉnh dây' },
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'trang-suc-phu-kien',
    name: 'Trâm Cài Tóc Gỗ Đào Khắc Sen',
    price: 130000,
    stock: 20,
    description: 'Trâm gỗ đào tự nhiên chạm khắc đóa sen nở rộ mộc mạc, phù hợp diện cổ phục hoặc áo dài.',
    attributes: { material: 'Gỗ đào tự nhiên', length: '18cm' },
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'trang-suc-phu-kien',
    name: 'Nhẫn Bạc Đính Đá Lapis Xanh Dương',
    price: 490000,
    stock: 6,
    description: 'Chiếc nhẫn bạc rèn thủ công đính viên đá Lapis Lazuli xanh thẳm như bầu trời đêm đầy sao.',
    attributes: { material: 'Bạc S925, đá Lapis Lazuli tự nhiên', style: 'Retro Tây Tạng' },
    imageUrl: 'https://images.unsplash.com/photo-1611591437281-460bfbe1220a?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'trang-suc-phu-kien',
    name: 'Vòng Dây Da Unisex Đính Charm Đồng',
    price: 190000,
    stock: 30,
    description: 'Dây đeo cổ bằng da bò bện nhiều sợi nhỏ mềm, đính kèm mặt charm hình mỏ neo đồng thau cổ điển.',
    attributes: { material: 'Dây da bò, charm đồng chốt thép', length: '45cm' },
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80'
  },

  // 5. Trang trí Macrame (10 sản phẩm)
  {
    category: 'trang-tri-macrame',
    name: 'Giá Treo Cây Macrame Đơn',
    price: 180000,
    stock: 35,
    description: 'Giỏ thắt dây treo chậu cây trang trí ban công hoặc cửa sổ phong cách sân vườn xinh xắn.',
    attributes: { material: 'Sợi cotton trắng ngà 3mm, vòng gỗ sồi', length: '90cm', max_load: '3kg' },
    imageUrl: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'trang-tri-macrame',
    name: 'Thảm Treo Đầu Giường Macrame Lá',
    price: 420000,
    stock: 12,
    description: 'Tranh macrame kết hình các chiếc lá thông đan xen nhiều gam màu vintage đất ấm áp.',
    attributes: { material: 'Sợi cotton nhuộm hữu cơ, cành thông tự nhiên', width: '50cm', height: '65cm' },
    imageUrl: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'trang-tri-macrame',
    name: 'Đế Lót Ly Macrame Tua Rua',
    price: 35000,
    stock: 120,
    description: 'Miếng lót cốc thắt dây cotton bo viền tua rua bảo vệ mặt bàn trà chống xước cách nhiệt tốt.',
    attributes: { material: 'Sợi cotton dẹt mềm', diameter: '15cm cả viền' },
    imageUrl: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'trang-tri-macrame',
    name: 'Kệ Gỗ Treo Tường Dây Thắt',
    price: 290000,
    stock: 15,
    description: 'Kệ gỗ thông tự nhiên treo tường nâng đỡ bằng hệ thống dây thắt Macrame chắc chắn nghệ thuật.',
    attributes: { material: 'Gỗ thông ghép thanh 2cm, sợi cotton 4mm', dimensions: '40cm x 15cm x 50cm' },
    imageUrl: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'trang-tri-macrame',
    name: 'Vòng Bắt Giấc Mơ Dreamcatcher Boho',
    price: 220000,
    stock: 25,
    description: 'Dreamcatcher thắt nút kết hợp hạt gỗ và lông vũ bay bổng, đem lại giấc ngủ an nhiên tinh khôi.',
    attributes: { material: 'Vành mây tự nhiên, sợi đan, hạt gỗ, lông vũ', diameter: '20cm', length: '55cm' },
    imageUrl: 'https://images.unsplash.com/photo-1508247967583-7d982ea00926?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'trang-tri-macrame',
    name: 'Võng Treo Mèo Macrame Thư Giãn',
    price: 380000,
    stock: 8,
    description: 'Chiếc võng treo xinh xắn êm ái cho thú cưng đan dệt chắc chắn chịu lực lên tới 8kg.',
    attributes: { material: 'Sợi cotton chịu lực 4mm, đệm lót nỉ nhung', length: '120cm', ring_diameter: '35cm' },
    imageUrl: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'trang-tri-macrame',
    name: 'Đèn Ngủ Thả Trần Macrame',
    price: 650000,
    stock: 4,
    description: 'Chao đèn ngủ thắt dây rủ tạo bóng nắng lấp lánh dịu kỳ dịu ấm áp cho phòng ngủ boho.',
    attributes: { material: 'Khung thép sơn tĩnh điện, sợi cotton', diameter: '30cm', height: '40cm' },
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'trang-tri-macrame',
    name: 'Gương Decor Tròn Viền Macrame',
    price: 390000,
    stock: 10,
    description: 'Gương soi treo tường trang trí phòng khách viền dệt ren dây tua rua sang xịn bừng sáng không gian.',
    attributes: { material: 'Gương Bỉ chống mốc, sợi dệt cotton', mirror_diameter: '25cm', total_diameter: '40cm' },
    imageUrl: 'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'trang-tri-macrame',
    name: 'Túi Xách Nữ Macrame Đi Biển',
    price: 320000,
    stock: 20,
    description: 'Túi xách tay đan dây cotton thoáng nhẹ vintage, lót trong túi vải thô bố kéo khóa an toàn.',
    attributes: { material: 'Sợi cotton dai mộc mạc, quai gỗ sồi tròn', size: '30cm x 25cm' },
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=600&q=80'
  },
  {
    category: 'trang-tri-macrame',
    name: 'Rèm Cửa Sổ Ngăn Phòng Macrame',
    price: 1550000,
    stock: 2,
    description: 'Rèm ngăn không gian cỡ lớn dệt dây họa tiết chéo thanh lịch kín đáo độc đáo cho homestay decor.',
    attributes: { material: 'Sợi cotton xoắn dày 5mm', dimensions: 'Rộng 1.2m x Cao 2m', weight: '3.5kg' },
    imageUrl: 'https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&w=600&q=80'
  }
];

async function main() {
  console.log('--- GENERATING 50 ADDITIONAL PRODUCTS ---');

  let addedCount = 0;
  for (const item of moreProducts) {
    const categoryId = categoryMap[item.category];
    if (!categoryId) {
      console.warn(`Category not found for slug: ${item.category}`);
      continue;
    }

    const slug = slugify(item.name);
    // Check duplicates
    if (data.products.find(p => p.slug === slug)) {
      continue;
    }

    const productId = uuid();
    
    // Add product
    data.products.push({
      id: productId,
      category_id: categoryId,
      name: item.name,
      slug,
      description: item.description,
      price: parseFloat(item.price),
      stock: parseInt(item.stock),
      status: 'active',
      attributes: JSON.stringify(item.attributes),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    // Add product image
    data.product_images.push({
      id: uuid(),
      product_id: productId,
      url: item.imageUrl,
      is_primary: 1,
      created_at: new Date().toISOString()
    });

    addedCount++;
  }

  // Save updated JSON
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`Successfully added ${addedCount} products to database.json.`);

  // Export to CSV
  console.log('\n--- EXPORTING PRODUCTS TO CSV ---');
  
  // Header definition
  const headers = ['ID', 'Category ID', 'Name', 'Slug', 'Price', 'Stock', 'Status', 'Attributes', 'Image URL'];
  const csvRows = [headers.join(',')];

  data.products.forEach(p => {
    const primaryImg = data.product_images.find(img => img.product_id === p.id && img.is_primary === 1)?.url || '';
    
    // Escape double quotes in CSV fields
    const escapeField = (val) => {
      if (val === null || val === undefined) return '""';
      const str = val.toString().replace(/"/g, '""');
      return `"${str}"`;
    };

    const row = [
      escapeField(p.id),
      escapeField(p.category_id),
      escapeField(p.name),
      escapeField(p.slug),
      p.price,
      p.stock,
      escapeField(p.status),
      escapeField(p.attributes),
      escapeField(primaryImg)
    ];

    csvRows.push(row.join(','));
  });

  fs.writeFileSync(CSV_PATH, '\ufeff' + csvRows.join('\n'), 'utf-8'); // Add UTF-8 BOM for Excel compatibility in Vietnamese
  console.log(`Successfully exported products to: ${CSV_PATH}`);
}

main().catch(console.error);
