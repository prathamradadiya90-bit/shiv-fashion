-- Migration: add_coupon_usage_limits
-- Generated for: Fix #005 — coupon usage limit per-user and global not enforced
-- Run with: npx prisma migrate dev --name add_coupon_usage_limits
--
-- This migration:
--   1. Adds maxUsage, usageCount, maxUsagePerUser to Coupon
--   2. Adds couponCode to Order
--   3. Creates CouponUsage join table

-- Add usage limit columns to Coupon
ALTER TABLE "Coupon" ADD COLUMN "maxUsage" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Coupon" ADD COLUMN "usageCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "Coupon" ADD COLUMN "maxUsagePerUser" INTEGER NOT NULL DEFAULT 0;

-- Add couponCode reference to Order
ALTER TABLE "Order" ADD COLUMN "couponCode" TEXT;

-- Create CouponUsage join table
CREATE TABLE "CouponUsage" (
    "id"        TEXT NOT NULL,
    "couponId"  TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "orderId"   TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CouponUsage_pkey" PRIMARY KEY ("id")
);

-- Unique constraint: one usage record per order
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_orderId_key" UNIQUE ("orderId");

-- Composite unique: same coupon cannot be used by same user on same order twice
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_couponId_userId_orderId_key" UNIQUE ("couponId", "userId", "orderId");

-- Index for per-user usage lookups
CREATE INDEX "CouponUsage_couponId_userId_idx" ON "CouponUsage"("couponId", "userId");

-- Foreign keys
ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_couponId_fkey"
    FOREIGN KEY ("couponId") REFERENCES "Coupon"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "CouponUsage" ADD CONSTRAINT "CouponUsage_orderId_fkey"
    FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;
