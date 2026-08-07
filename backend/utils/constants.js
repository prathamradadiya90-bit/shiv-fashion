/**
 * Shared business constants for Shreeji Fashion backend.
 * Change values here — they propagate everywhere automatically.
 */

// Minimum order value (in rupees) for free shipping
const FREE_SHIPPING_THRESHOLD = 5000;

// Flat shipping fee in rupees when order is below the threshold
const SHIPPING_CHARGE = 250;

// COD advance payment amount in rupees
const COD_ADVANCE = 500;

// GST rate as a decimal (18 % → 0.18)
const GST_RATE = 0.18;

// Maximum quantity of a single item a customer can order
const MAX_ITEM_QUANTITY = 20;

module.exports = {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_CHARGE,
  COD_ADVANCE,
  GST_RATE,
  MAX_ITEM_QUANTITY,
};
