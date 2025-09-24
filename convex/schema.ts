import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/dist/server';

export default defineSchema({
  ...authTables,
  users: defineTable({
    name: v.string(),
    email: v.string(),
    locale: v.optional(v.string()), // 'en' | 'ar'
    createdAt: v.number(),
  }).index('by_email', ['email']),
  products: defineTable({
    ownerId: v.id('users'),
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    imageId: v.optional(v.id('_storage')),
    active: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
    lastActiveAt: v.number(),
  }).index('by_owner', ['ownerId']).index('by_active', ['active']).index('by_name', ['name']),
  orders: defineTable({
    ownerId: v.id('users'),
    status: v.union(v.literal('pending'), v.literal('shipped'), v.literal('completed')),
    items: v.array(v.object({
      productId: v.id('products'),
      quantity: v.number(),
    })),
    total: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index('by_owner', ['ownerId']).index('by_status', ['status']),
  activity: defineTable({
    userId: v.id('users'),
    type: v.string(),
    at: v.number(),
    meta: v.optional(v.any()),
  }).index('by_user', ['userId']).index('by_type', ['type']),
});
