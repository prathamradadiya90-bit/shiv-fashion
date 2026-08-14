const prisma = require('../config/db');
const asyncHandler = require('../middleware/asyncHandler');
const { isValidUUID } = require('../utils/validateUUID');

// @desc    Get all addresses for logged in user
// @route   GET /api/addresses
// @access  Private
const getAddresses = asyncHandler(async (req, res) => {
  const addresses = await prisma.address.findMany({
    where: { userId: req.user.id },
    orderBy: [
      { isDefault: 'desc' },
      { createdAt: 'desc' },
    ],
  });

  res.json(addresses);
});

// @desc    Add a new address
// @route   POST /api/addresses
// @access  Private
const addAddress = asyncHandler(async (req, res) => {
  const { street, city, state, zipCode, country = 'India', isDefault = false } = req.body;

  if (!street || !city || !state || !zipCode) {
    res.status(400);
    throw new Error('Street, city, state, and zipCode are required');
  }

  const existingCount = await prisma.address.count({
    where: { userId: req.user.id },
  });

  // If this is the user's first address, force it to be default
  const shouldBeDefault = isDefault || existingCount === 0;

  const newAddress = await prisma.$transaction(async (tx) => {
    if (shouldBeDefault && existingCount > 0) {
      await tx.address.updateMany({
        where: { userId: req.user.id },
        data: { isDefault: false },
      });
    }

    return await tx.address.create({
      data: {
        userId: req.user.id,
        street: street.trim(),
        city: city.trim(),
        state: state.trim(),
        zipCode: zipCode.trim(),
        country: country ? country.trim() : 'India',
        isDefault: shouldBeDefault,
      },
    });
  });

  res.status(201).json(newAddress);
});

// @desc    Update an address
// @route   PUT /api/addresses/:id
// @access  Private
const updateAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { street, city, state, zipCode, country, isDefault } = req.body;

  if (!isValidUUID(id)) {
    res.status(400);
    throw new Error('Invalid address ID format');
  }

  const address = await prisma.address.findUnique({
    where: { id },
  });

  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  if (address.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to update this address');
  }

  const updateData = {};
  if (street !== undefined) updateData.street = street.trim();
  if (city !== undefined) updateData.city = city.trim();
  if (state !== undefined) updateData.state = state.trim();
  if (zipCode !== undefined) updateData.zipCode = zipCode.trim();
  if (country !== undefined) updateData.country = country.trim();
  if (isDefault !== undefined) updateData.isDefault = Boolean(isDefault);

  const updatedAddress = await prisma.$transaction(async (tx) => {
    if (updateData.isDefault === true) {
      await tx.address.updateMany({
        where: { userId: req.user.id, id: { not: id } },
        data: { isDefault: false },
      });
    }

    return await tx.address.update({
      where: { id },
      data: updateData,
    });
  });

  res.json(updatedAddress);
});

// @desc    Delete an address
// @route   DELETE /api/addresses/:id
// @access  Private
const deleteAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    res.status(400);
    throw new Error('Invalid address ID format');
  }

  const address = await prisma.address.findUnique({
    where: { id },
  });

  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  if (address.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to delete this address');
  }

  await prisma.$transaction(async (tx) => {
    await tx.address.delete({
      where: { id },
    });

    // If the deleted address was default, set the latest remaining address as default
    if (address.isDefault) {
      const remainingAddress = await tx.address.findFirst({
        where: { userId: req.user.id },
        orderBy: { createdAt: 'desc' },
      });

      if (remainingAddress) {
        await tx.address.update({
          where: { id: remainingAddress.id },
          data: { isDefault: true },
        });
      }
    }
  });

  res.json({ message: 'Address deleted successfully' });
});

// @desc    Set address as default
// @route   PUT /api/addresses/:id/default
// @access  Private
const setDefaultAddress = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidUUID(id)) {
    res.status(400);
    throw new Error('Invalid address ID format');
  }

  const address = await prisma.address.findUnique({
    where: { id },
  });

  if (!address) {
    res.status(404);
    throw new Error('Address not found');
  }

  if (address.userId !== req.user.id) {
    res.status(403);
    throw new Error('Not authorized to modify this address');
  }

  await prisma.$transaction(async (tx) => {
    await tx.address.updateMany({
      where: { userId: req.user.id },
      data: { isDefault: false },
    });

    await tx.address.update({
      where: { id },
      data: { isDefault: true },
    });
  });

  const updatedAddress = await prisma.address.findUnique({ where: { id } });
  res.json(updatedAddress);
});

module.exports = {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};
