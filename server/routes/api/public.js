import { Router } from 'express';
import Product from '../../models/Product.js';

const router = Router();

// Get all products (public - no authentication required)
router.get('/products', async (req, res) => {
  try {
    const { search, category, sortBy, page = 1, limit = 12 } = req.query;

    let query = {};

    // Search filter
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { category: { $regex: search, $options: 'i' } }
      ];
    }

    // Category filter
    if (category && category !== 'all') {
      query.category = category;
    }

    let productsQuery = Product.find(query);

    // Sorting
    switch (sortBy) {
      case 'name':
        productsQuery = productsQuery.sort({ name: 1 });
        break;
      case 'price-low':
        productsQuery = productsQuery.sort({ price: 1 });
        break;
      case 'price-high':
        productsQuery = productsQuery.sort({ price: -1 });
        break;
      case 'rating':
        productsQuery = productsQuery.sort({ rating: -1, reviewCount: -1 });
        break;
      default:
        productsQuery = productsQuery.sort({ createdAt: -1 });
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const total = await Product.countDocuments(query);
    
    const products = await productsQuery.skip(skip).limit(parseInt(limit));

    // Transform products
    const transformedProducts = products.map(product => ({
      id: product._id.toString(),
      name: product.name,
      price: product.price,
      category: product.category,
      image: product.image,
      images: product.images || [product.image],
      description: product.description,
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      stock: product.stock,
      seller: product.seller
    }));

    res.json({
      success: true,
      products: transformedProducts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
        hasMore: skip + products.length < total
      }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      error: 'Failed to fetch products',
      message: 'An error occurred while fetching products'
    });
  }
});

// Get single product (public)
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'No product found with this ID'
      });
    }

    res.json({
      success: true,
      product: {
        id: product._id.toString(),
        name: product.name,
        price: product.price,
        category: product.category,
        image: product.image,
        images: product.images || [product.image],
        description: product.description,
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0,
        reviews: product.reviews || [],
        stock: product.stock,
        seller: product.seller
      }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      error: 'Failed to fetch product',
      message: 'An error occurred while fetching product'
    });
  }
});

// Get product categories (public)
router.get('/categories', async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    
    res.json({
      success: true,
      categories
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      error: 'Failed to fetch categories',
      message: 'An error occurred while fetching categories'
    });
  }
});

// Get product reviews (public)
router.get('/products/:id/reviews', async (req, res) => {
  try {
    const { page = 1, limit = 10, sortBy = 'newest' } = req.query;
    
    const product = await Product.findById(req.params.id).select('reviews rating reviewCount');

    if (!product) {
      return res.status(404).json({
        error: 'Product not found',
        message: 'No product found with this ID'
      });
    }

    let reviews = [...product.reviews];

    // Sort reviews
    switch (sortBy) {
      case 'newest':
        reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        reviews.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'highest':
        reviews.sort((a, b) => b.rating - a.rating);
        break;
      case 'lowest':
        reviews.sort((a, b) => a.rating - b.rating);
        break;
      case 'helpful':
        reviews.sort((a, b) => b.helpful - a.helpful);
        break;
      default:
        reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedReviews = reviews.slice(skip, skip + parseInt(limit));

    // Calculate rating distribution
    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    reviews.forEach(review => {
      distribution[review.rating] = (distribution[review.rating] || 0) + 1;
    });

    res.json({
      success: true,
      reviews: paginatedReviews,
      rating: product.rating || 0,
      reviewCount: product.reviewCount || 0,
      distribution,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: reviews.length,
        totalPages: Math.ceil(reviews.length / parseInt(limit)),
        hasMore: skip + paginatedReviews.length < reviews.length
      }
    });
  } catch (error) {
    console.error('Get product reviews error:', error);
    res.status(500).json({
      error: 'Failed to fetch reviews',
      message: 'An error occurred while fetching reviews'
    });
  }
});

// Get recent reviews across platform (public)
router.get('/reviews/recent', async (req, res) => {
  try {
    const { limit = 10 } = req.query;

    // Find products with reviews
    const products = await Product.find({
      reviewCount: { $gt: 0 }
    }).select('name image reviews').limit(50);

    // Collect all reviews with product info
    const allReviews = [];
    products.forEach(product => {
      product.reviews.forEach(review => {
        allReviews.push({
          ...review.toObject(),
          productId: product._id,
          productName: product.name,
          productImage: product.image
        });
      });
    });

    // Sort by date and limit
    allReviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    const recentReviews = allReviews.slice(0, parseInt(limit));

    res.json({
      success: true,
      reviews: recentReviews
    });
  } catch (error) {
    console.error('Get recent reviews error:', error);
    res.status(500).json({
      error: 'Failed to fetch recent reviews',
      message: 'An error occurred while fetching recent reviews'
    });
  }
});

export default router;