import { all, get } from '../lib/db.js';

export const getProducts = async ({ page = 1, limit = 10, category_id, search, sort }) => {
  const offset = (page - 1) * limit;
  let query = `
    SELECT p.*, c.name as category_name, 
           pi.url as primary_image_url
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    LEFT JOIN product_images pi ON pi.product_id = p.id AND pi.is_primary = 1
    WHERE 1=1
  `;
  const params = [];

  if (category_id) {
    query += ` AND p.category_id = ?`;
    params.push(category_id);
  }

  if (search) {
    query += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
    params.push(`%${search}%`, `%${search}%`);
  }

  if (sort) {
    const [field, order] = sort.split(':');
    if (['price', 'created_at'].includes(field) && ['asc', 'desc'].includes(order.toLowerCase())) {
      query += ` ORDER BY p.${field} ${order.toUpperCase()}`;
    }
  } else {
    query += ` ORDER BY p.created_at DESC`;
  }

  query += ` LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));

  const products = await all(query, params);

  // Parse attributes for each product
  const formattedProducts = products.map(p => ({
    ...p,
    attributes: p.attributes ? JSON.parse(p.attributes) : {},
  }));

  // Fetch count for pagination
  let countQuery = `SELECT COUNT(*) as total FROM products p WHERE 1=1`;
  const countParams = [];
  if (category_id) {
    countQuery += ` AND p.category_id = ?`;
    countParams.push(category_id);
  }
  if (search) {
    countQuery += ` AND (p.name LIKE ? OR p.description LIKE ?)`;
    countParams.push(`%${search}%`, `%${search}%`);
  }
  const totalRes = await get(countQuery, countParams);
  const totalRecords = totalRes ? totalRes.total : 0;

  return {
    products: formattedProducts,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total_records: totalRecords,
      total_pages: Math.ceil(totalRecords / limit)
    }
  };
};

export const getProductBySlugOrId = async (slugOrId) => {
  const query = `
    SELECT p.*, c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.id = ? OR p.slug = ?
  `;
  const product = await get(query, [slugOrId, slugOrId]);
  if (!product) return null;

  product.attributes = product.attributes ? JSON.parse(product.attributes) : {};

  // Fetch all images
  const images = await all('SELECT url, is_primary FROM product_images WHERE product_id = ? ORDER BY is_primary DESC', [product.id]);
  product.images = images;

  return product;
};

export const getCategories = async () => {
  return await all('SELECT * FROM categories ORDER BY name ASC');
};
