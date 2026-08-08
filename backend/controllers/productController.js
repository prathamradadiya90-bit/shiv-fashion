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
  const { category, search, minPrice, maxPrice, pageNumber } = req.query;

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
  if (price === undefined || price === null || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
    res.status(400);
    throw new Error('A valid price is required');
  }
  if (stock !== undefined && (isNaN(parseInt(stock, 10)) || parseInt(stock, 10) < 0)) {
    res.status(400);
    throw new Error('stock must be a non-negative integer');
  }

  const product = await prisma.product.create({
    data: {
      name,
      description,
      category,
      price: parseFloat(price),
      discount: parseFloat(discount) || 0,
      stock: parseInt(stock, 10) || 0,
      isFeatured: Boolean(isFeatured),
      isActive: true,
      images: {
        create: Array.isArray(images) ? images.map(img => ({ url: img.url, publicId: img.publicId })) : [],
      },
      sizes: {
        create: Array.isArray(sizes) ? sizes.map(size => ({ name: size })) : [],
      },
      colors: {
        create: Array.isArray(colors)
          ? colors.map(color => ({ name: color.name, hexCode: color.hexCode }))
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

  const existingProduct = await prisma.product.findUnique({
    where: { id: req.params.id },
    include: { images: true },
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
    stock: stock !== undefined ? parseInt(stock, 10) : undefined,
    isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
    isActive: isActive !== undefined ? Boolean(isActive) : undefined,
  };

  if (images !== undefined) {
    if (!Array.isArray(images)) {
      res.status(400);
      throw new Error('images must be an array');
    }
    if (images.length > 0) {
      await deleteImages(existingProduct.images);
      updateData.images = {
        deleteMany: {},
        create: images.map(img => ({ url: img.url, publicId: img.publicId })),
      };
    }
  }

  if (sizes !== undefined) {
    if (!Array.isArray(sizes)) {
      res.status(400);
      throw new Error('sizes must be an array');
    }
    updateData.sizes = {
      deleteMany: {},
      create: sizes.map(size => ({ name: size })),
    };
  }

  if (colors !== undefined) {
    if (!Array.isArray(colors)) {
      res.status(400);
      throw new Error('colors must be an array');
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

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleWishlist,
  createProductReview,
};
