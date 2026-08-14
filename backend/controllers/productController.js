const prisma = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { deleteImages } = require('../utils/cloudinaryHelper');
const { isValidUUID } = require('../utils/validateUUID');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
// FIX #020: minPrice/maxPrice are validated with isFinite() before use so NaN
//           values from non-numeric query strings are rejected, not silently passed to Prisma.
const getProducts = asyncHandler(async (req, res) => {
  const { category, search, minPrice, maxPrice, priceRanges, sortBy, pageNumber } = req.query;

  const pageSize = 12;
  const page = parseInt(pageNumber, 10) || 1;
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

  if (minPrice !== undefined || maxPrice !== undefined) {
    const parsedMin = parseFloat(minPrice);
    const parsedMax = parseFloat(maxPrice);

    if (minPrice !== undefined && !isFinite(parsedMin)) {
      res.status(400);
      throw new Error('minPrice must be a valid number');
    }
    if (maxPrice !== undefined && !isFinite(parsedMax)) {
      res.status(400);
      throw new Error('maxPrice must be a valid number');
    }
    if (isFinite(parsedMin) && isFinite(parsedMax) && parsedMin > parsedMax) {
      res.status(400);
      throw new Error('minPrice cannot be greater than maxPrice');
    }

    filter.price = {};
    if (minPrice !== undefined) filter.price.gte = parsedMin;
    if (maxPrice !== undefined) filter.price.lte = parsedMax;
  }

  if (priceRanges) {
    const ranges = priceRanges.split(',').map(r => {
      const [min, max] = r.split('-');
      let condition = {};
      if (min !== '') condition.gte = Math.round(parseFloat(min) * 100);
      if (max !== '') condition.lte = Math.round(parseFloat(max) * 100);
      return { price: condition };
    });
    filter.OR = ranges;
  }

  const count = await prisma.product.count({ where: filter });

  const products = await prisma.product.findMany({
    where: filter,
    include: {
      images: true,
      sizes: true,
      colors: true,
    },
    orderBy: sortBy === 'LowToHigh' ? { price: 'asc' } : (sortBy === 'HighToLow' ? { price: 'desc' } : { createdAt: 'desc' }),
    skip: pageSize * (page - 1),
    take: pageSize,
  });

  res.json({
    products,
    page,
    pages: Math.ceil(count / pageSize),
    total: count,
  });
});

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = asyncHandler(async (req, res) => {
  // FIX #011: validate UUID before querying DB
  if (!isValidUUID(req.params.id)) {
    res.status(400);
    throw new Error('Invalid product ID format');
  }

  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: {
      images: true,
      sizes: true,
      colors: true,
      reviews: {
        include: {
          user: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
    },
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

  if (!name || !description || !category) {
    res.status(400);
    throw new Error('name, description, and category are required');
  }
  if (typeof name === 'string' && name.length > 255) {
    res.status(400);
    throw new Error('Name cannot exceed 255 characters');
  }
  if (typeof description === 'string' && description.length > 5000) {
    res.status(400);
    throw new Error('Description cannot exceed 5000 characters');
  }
  if (price === undefined || price === null || isNaN(parseFloat(price)) || parseFloat(price) <= 0) {
    res.status(400);
    throw new Error('A valid price greater than 0 is required');
  }
  const parsedDiscount = parseFloat(discount) || 0;
  if (parsedDiscount < 0 || parsedDiscount > 100) {
    res.status(400);
    throw new Error('discount must be between 0 and 100');
  }
  if (stock !== undefined && (isNaN(parseInt(stock, 10)) || parseInt(stock, 10) < 0)) {
    res.status(400);
    throw new Error('stock must be a non-negative integer');
  }

  // FIX #006: admin UI sends price in rupees and discount as a percentage (0–100).
  // Store in DB as paise (Int) and basis points (Int) respectively.
  const pricePaise = Math.round(parseFloat(price) * 100);
  const discountBasisPoints = Math.round(parsedDiscount * 100);

  const product = await prisma.product.create({
    data: {
      name,
      description,
      category,
      price: pricePaise,
      discount: discountBasisPoints,
      stock: parseInt(stock, 10) || 0,
      isFeatured: Boolean(isFeatured),
      isActive: true,
      images: {
        create: Array.isArray(images) ? images.map(img => ({ url: String(img.url), publicId: String(img.publicId) })) : [],
      },
      sizes: {
        create: Array.isArray(sizes) ? sizes.filter(s => typeof s === 'string').map(size => ({ name: size })) : [],
      },
      colors: {
        create: Array.isArray(colors)
          ? colors.filter(c => c && typeof c.name === 'string' && typeof c.hexCode === 'string').map(color => ({ name: color.name, hexCode: color.hexCode }))
          : [],
      },
    },
    include: { images: true, sizes: true, colors: true },
  });

  res.status(201).json(product);
});

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/SuperAdmin
// FIX #006: Array.isArray() guard on sizes and colors before deleteMany+create.
//           Without this, a non-array truthy value (e.g. a string) crashes the handler
//           AFTER the deleteMany has already wiped the existing records, leaving the
//           product permanently without sizes/colors.
const updateProduct = asyncHandler(async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    res.status(400);
    throw new Error('Invalid product ID format');
  }

  const { name, description, category, price, discount, stock, isFeatured, isActive, images, sizes, colors } = req.body;

  if (name && typeof name === 'string' && name.length > 255) {
    res.status(400);
    throw new Error('Name cannot exceed 255 characters');
  }
  if (description && typeof description === 'string' && description.length > 5000) {
    res.status(400);
    throw new Error('Description cannot exceed 5000 characters');
  }

  const existingProduct = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { images: true },
  });

  if (!existingProduct) {
    res.status(404);
    throw new Error('Product not found');
  }

  if (price !== undefined) {
    const parsedPrice = parseFloat(price);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      res.status(400);
      throw new Error('A valid price greater than 0 is required');
    }
  }

  const updateData = {
    name,
    description,
    category,
    // FIX #006: convert rupees → paise and % → basis points
    price: price !== undefined ? Math.round(parseFloat(price) * 100) : undefined,
    discount: discount !== undefined ? Math.round(parseFloat(discount) * 100) : undefined,
    stock: stock !== undefined ? parseInt(stock, 10) : undefined,
    isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
    isActive: isActive !== undefined ? Boolean(isActive) : undefined,
  };

  if (images !== undefined) {
    if (!Array.isArray(images)) {
      res.status(400);
      throw new Error('images must be an array');
    }

    // Only delete images from Cloudinary that are actually being removed
    const imagesToDelete = existingProduct.images.filter(
      oldImg => !images.some(newImg => newImg.publicId === oldImg.publicId)
    );

    if (imagesToDelete.length > 0) {
      await deleteImages(imagesToDelete);
    }

    // Replace images in DB with the provided list (even if it's empty)
    updateData.images = {
      deleteMany: {},
      create: images.map(img => ({ url: String(img.url), publicId: String(img.publicId) })),
    };
  }

  if (sizes !== undefined) {
    if (!Array.isArray(sizes) || !sizes.every(s => typeof s === 'string')) {
      res.status(400);
      throw new Error('sizes must be an array of strings');
    }
    updateData.sizes = {
      deleteMany: {},
      create: sizes.map(size => ({ name: size })),
    };
  }

  if (colors !== undefined) {
    if (!Array.isArray(colors) || !colors.every(c => c && typeof c.name === 'string' && typeof c.hexCode === 'string')) {
      res.status(400);
      throw new Error('colors must be an array of objects with name and hexCode strings');
    }
    updateData.colors = {
      deleteMany: {},
      create: colors.map(color => ({ name: color.name, hexCode: color.hexCode })),
    };
  }

  const product = await prisma.product.update({
    where: { id: req.params.id },
    data: updateData,
    include: { images: true, sizes: true, colors: true },
  });

  res.json(product);
});

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/SuperAdmin
const deleteProduct = asyncHandler(async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    res.status(400);
    throw new Error('Invalid product ID format');
  }

  const product = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { images: true },
  });

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  // Check if product has order history
  const orderItemsCount = await prisma.orderItem.count({
    where: { productId: req.params.id }
  });

  if (orderItemsCount > 0) {
    res.status(400);
    throw new Error('Cannot delete product because it has order history. Please update it and set it to Inactive instead.');
  }

  await deleteImages(product.images);
  await prisma.product.delete({ where: { id: req.params.id } });

  res.json({ message: 'Product and associated images removed' });
});

// @desc    Toggle product in wishlist
// @route   POST /api/products/:id/wishlist
// @access  Private
const toggleWishlist = asyncHandler(async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    res.status(400);
    throw new Error('Invalid product ID format');
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: {
      wishlist: {
        where: { id: req.params.id },
        select: { id: true },
      },
    },
  });

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  const isWished = user.wishlist && user.wishlist.length > 0;

  if (isWished) {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { wishlist: { disconnect: { id: req.params.id } } },
    });
    res.json({ message: 'Product removed from wishlist', isWished: false });
  } else {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { wishlist: { connect: { id: req.params.id } } },
    });
    res.json({ message: 'Product added to wishlist', isWished: true });
  }
});

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = asyncHandler(async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    res.status(400);
    throw new Error('Invalid product ID format');
  }

  const { rating, comment } = req.body;
  const productId = req.params.id;
  const userId = req.user.id;

  if (!rating || isNaN(Number(rating)) || Number(rating) < 1 || Number(rating) > 5) {
    res.status(400);
    throw new Error('Rating must be a number between 1 and 5');
  }
  if (!comment || typeof comment !== 'string' || comment.trim() === '') {
    res.status(400);
    throw new Error('Comment is required');
  }

  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { userId, status: 'DELIVERED' },
    },
  });

  if (!hasPurchased) {
    res.status(403);
    throw new Error('You can only review products you have purchased and received');
  }

  const alreadyReviewed = await prisma.review.findFirst({ where: { productId, userId } });
  if (alreadyReviewed) {
    res.status(400);
    throw new Error('Product already reviewed');
  }

  let createdReview;

  await prisma.$transaction(async (tx) => {
    createdReview = await tx.review.create({
      data: {
        rating: Number(rating),
        comment: comment.trim(),
        productId,
        userId,
      },
    });

    const productReviews = await tx.review.findMany({ where: { productId } });
    const numReviews = productReviews.length;
    const totalRating = productReviews.reduce((acc, item) => acc + item.rating, 0);
    const avgRating = totalRating / numReviews;

    await tx.product.update({
      where: { id: productId },
      data: { rating: avgRating, numReviews },
    });
  });

  res.status(201).json({ message: 'Review added', review: createdReview });
});

// @desc    Get all reviews (Admin)
// @route   GET /api/products/reviews/all
// @access  Private/SuperAdmin
const getAllReviews = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page, 10) || 1);
  const pageSize = 20;

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        product: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.review.count(),
  ]);

  res.json({ reviews, page, pages: Math.ceil(total / pageSize), total });
});

// @desc    Delete a review (Admin)
// @route   DELETE /api/products/reviews/:id
// @access  Private/SuperAdmin
const deleteReview = asyncHandler(async (req, res) => {
  if (!isValidUUID(req.params.id)) {
    res.status(400);
    throw new Error('Invalid review ID format');
  }

  const review = await prisma.review.findUnique({ where: { id: req.params.id } });
  if (!review) {
    res.status(404);
    throw new Error('Review not found');
  }

  const productId = review.productId;

  await prisma.$transaction(async (tx) => {
    await tx.review.delete({ where: { id: req.params.id } });

    const productReviews = await tx.review.findMany({ where: { productId } });
    const numReviews = productReviews.length;
    const totalRating = productReviews.reduce((acc, item) => acc + item.rating, 0);
    const avgRating = numReviews > 0 ? totalRating / numReviews : 0;

    await tx.product.update({
      where: { id: productId },
      data: { rating: avgRating, numReviews },
    });
  });

  res.json({ message: 'Review deleted successfully' });
});

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleWishlist,
  createProductReview,
  getAllReviews,
  deleteReview,
};
