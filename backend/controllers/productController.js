const prisma = require('../config/db');
const cloudinary = require('../config/cloudinary');

// @desc    Fetch all products
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const { category, search, minPrice, maxPrice } = req.query;
    
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

    const products = await prisma.product.findMany({
      where: filter,
      include: {
        images: true,
        sizes: true,
        colors: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
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

    if (product) {
      // Calculate rating
      const numReviews = product.reviews.length;
      const rating = numReviews > 0 
        ? product.reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews 
        : 0;

      res.json({ ...product, numReviews, rating });
    } else {
      res.status(404);
      throw new Error('Product not found');
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
// @access  Private/SuperAdmin
const createProduct = async (req, res) => {
  const { name, description, category, price, discount, stock, isFeatured, images, sizes, colors } = req.body;

  try {
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
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
// @access  Private/SuperAdmin
const updateProduct = async (req, res) => {
  const { name, description, category, price, discount, stock, isFeatured, isActive } = req.body;

  try {
    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: {
        name,
        description,
        category,
        price: price ? parseFloat(price) : undefined,
        discount: discount ? parseFloat(discount) : undefined,
        stock: stock ? parseInt(stock) : undefined,
        isFeatured: isFeatured !== undefined ? Boolean(isFeatured) : undefined,
        isActive: isActive !== undefined ? Boolean(isActive) : undefined,
      },
    });

    res.json(product);
  } catch (error) {
    res.status(404);
    res.json({ message: 'Product not found or update failed' });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
// @access  Private/SuperAdmin
const deleteProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { images: true }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Delete images from cloudinary
    if (product.images && product.images.length > 0) {
      for (const image of product.images) {
        if (image.publicId) {
          await cloudinary.uploader.destroy(image.publicId);
        }
      }
    }

    await prisma.product.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'Product and associated images removed' });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Toggle product in wishlist
// @route   POST /api/products/:id/wishlist
// @access  Private
const toggleWishlist = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      include: { wishlist: true }
    });

    const isWished = user.wishlist.some(product => product.id === req.params.id);

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
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    
    // Check if user already reviewed
    const alreadyReviewed = await prisma.review.findFirst({
      where: {
        productId: req.params.id,
        userId: req.user.id
      }
    });

    if (alreadyReviewed) {
      return res.status(400).json({ message: 'Product already reviewed' });
    }

    const review = await prisma.review.create({
      data: {
        rating: Number(rating),
        comment,
        productId: req.params.id,
        userId: req.user.id
      }
    });

    res.status(201).json({ message: 'Review added', review });
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  toggleWishlist,
  createProductReview
};
