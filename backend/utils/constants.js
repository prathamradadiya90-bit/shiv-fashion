/**
 * Shared business constants for Shreeji Fashion backend.
 * Change values here — they propagate everywhere automatically.
 *
 * For values that may need per-environment tuning, a .env override is supported
 * (see RESET_TOKEN_EXPIRES_MINUTES below).
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

// FIX #017: password reset token expiry — read from .env so it can be tuned
// without a code change or redeploy. Defaults to 15 minutes.
// Set RESET_TOKEN_EXPIRES_MINUTES in your .env to override.
const RESET_TOKEN_EXPIRES_MINUTES =
  parseInt(process.env.RESET_TOKEN_EXPIRES_MINUTES, 10) || 15;

module.exports = {
  FREE_SHIPPING_THRESHOLD,
  SHIPPING_CHARGE,
  COD_ADVANCE,
  GST_RATE,
  MAX_ITEM_QUANTITY,
  RESET_TOKEN_EXPIRES_MINUTES,
};
