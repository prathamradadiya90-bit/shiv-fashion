/**
 * Validates that a string is a properly formatted UUID v4.
 * Used to return 400 (Bad Request) instead of a cryptic 500 when a malformed
 * ID is passed to a Prisma query that expects a UUID.
 */
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const isValidUUID = (value) => {
  return typeof value === 'string' && UUID_REGEX.test(value);
};

module.exports = { isValidUUID };
