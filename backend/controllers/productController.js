const prisma = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { deleteImages } = require('../utils/cloudinaryHelper');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = asyncHandler(async (req, res) => {
  const { category, search, minPrice, maxPrice, pageNumber } = req.query;
  
  const pageSize = 12;
  const page = Number(pageNumber) || 1;
  const filter = { isActive: true };

  if (category) {
    filter.category = category;
  }

  if (search) {
    filter.name = {
      contains: search,
      mode: 'insensitive',
    };
  }

  if (minPrice || maxPrice) {
    filter.price = {};
    if (minPrice) filter.price.gte = parseFloat(minPrice);
    if (maxPrice) filter.price.lte = parseFloat(maxPrice);
  }

  const count = await prisma.product.count({ where: filter });

  const products = await prisma.product.findMany({
    where: filter,
    include: {
      images: true,
      sizes: true,
      colors: true,
    },
    orderBy: { createdAt: 'desc' },
    skip: pageSize * (page - 1),
    take: pageSize,
  });

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count
  });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      images: true,
      sizes: true,
      colors: true,
      reviews: {
        include: {
          user: { select: { name: true } }
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  res.json(product);
});

// @desc    Create a product
// @route   POST /api/products
// @access  Private/SuperAdmin
const createProduct = asyncHandler(async (req, res) => {
  const { name, description, category, price, discount, stock, isFeatured, images, sizes, colors } = req.body;

  const product = await prisma.product.create({
    data: {
      name,
      description,
      category,
      price: parseFloat(price),
      discount: parseFloat(discount) || 0,
      stock: parseInt(stock),
      isFeatured: Boolean(isFeatured),
      isActive: true,
      images: {
        create: images?.map(img => ({ url: img.url, publicId: img.publicId })) || [],
      },
      sizes: {
        create: sizes?.map(size => ({ name: size })) || [],
      },
      colors: {
        create: colors?.map(color => ({ name: color.name, hexCode: color.hexCode })) || [],
      },
    },
    include: { images: true, sizes: true, colors: true }
  });

  res.status(201).json(product);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/SuperAdmin
const updateProduct = asyncHandler(async (req, res) => {
  const { name, description, category, price, discount, stock, isFeatured, isActive, images, sizes, colors } = req.body;

  const existingProduct = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { images: true }
  });

  if (!existingProduct) {
    res.status(404);
    throw new Error('Product not found');
  }

  const updateData = {
    name,
    description,
    category,
    price: price !== undefined ? parseFloat(price) : undefined,
    discount: discount !== undefined ? parseFloat(discount) : undefined,
    stock: stock !== undefined ? parseInt(stock) : undefined,
    isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
    isActive: isActive !== undefined ? Boolean(isActive) : undefined,
  };

  if (images && images.length > 0) {
    // Delete old images concurrently using helper
    await deleteImages(existingProduct.images);

    updateData.images = {
      deleteMany: {},
      create: images.map(img => ({ url: img.url, publicId: img.publicId }))
    };
  }

  if (sizes) {
    updateData.sizes = {
      deleteMany: {},
      create: sizes.map(size => ({ name: size }))
    };
  }

  if (colors) {
    updateData.colors = {
      deleteMany: {},
      create: colors.map(color => ({ name: color.name, hexCode: color.hexCode }))
    };
  }

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: updateData,
    include: { images: true, sizes: true, colors: true }
  });

  res.json(product);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/SuperAdmin
const deleteProduct = asyncHandler(async (req, res) => {
  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { images: true }
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Delete images concurrently
  await deleteImages(product.images);

  await prisma.product.delete({
    where: { id: req.params.id },
  });
  
  res.json({ message: 'Product and associated images removed' });
});

// @desc    Toggle product in wishlist
// @route   POST /api/products/:id/wishlist
// @access  Private
const toggleWishlist = asyncHandler(async (req, res) => {
  // Optimize: only check if this specific product is in the user's wishlist
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      wishlist: {
        where: { id: req.params.id },
        select: { id: true }
      }
    }
  });

  const isWished = user.wishlist && user.wishlist.length > 0;

  if (isWished) {
    // Remove from wishlist
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        wishlist: {
          disconnect: { id: req.params.id }
        }
      }
    });
    res.json({ message: 'Product removed from wishlist', isWished: false });
  } else {
    // Add to wishlist
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        wishlist: {
          connect: { id: req.params.id }
        }
      }
    });
    res.json({ message: 'Product added to wishlist', isWished: true });
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  const { rating, comment } = req.body;
  const productId = req.params.id;
  const userId = req.user.id;
  
  // Check if user already reviewed
  const alreadyReviewed = await prisma.review.findFirst({
    where: { productId, userId }
  });

  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Product already reviewed');
  }

  const review = await prisma.review.create({
    data: {
      rating: Number(rating),
      comment,
      productId,
      userId
    }
  });

  // Calculate new rating and numReviews
  const productReviews = await prisma.review.findMany({
    where: { productId }
  });

  const numReviews = productReviews.length;
  const avgRating = productReviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;

  // Update product model
  await prisma.product.update({
    where: { id: productId },
    data: {
      rating: avgRating,
      numReviews: numReviews
    }
  });

  res.status(201).json({ message: 'Review added', review });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleWishlist,
  createProductReview
};
