import { v } from 'convex/values';
import { mutation, query, action } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/dist/server';

export const create = mutation({
  args: {
    name: v.string(),
    description: v.string(),
    price: v.number(),
    category: v.string(),
    imageId: v.optional(v.id('_storage')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');
    const now = Date.now();
    const id = await ctx.db.insert('products', {
      ownerId: userId,
      name: args.name,
      description: args.description,
      price: args.price,
      category: args.category,
      imageId: args.imageId,
      active: true,
      createdAt: now,
      updatedAt: now,
      lastActiveAt: now,
    });
    await ctx.db.insert('activity', { userId, type: 'product_create', at: now, meta: { id } });
    return id;
  }
});

export const update = mutation({
  args: {
    id: v.id('products'),
    name: v.optional(v.string()),
    description: v.optional(v.string()),
    price: v.optional(v.number()),
    category: v.optional(v.string()),
    imageId: v.optional(v.id('_storage')),
    active: v.optional(v.boolean()),
  },
  handler: async (ctx, { id, ...patch }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');
    const product = await ctx.db.get(id);
    if (!product || product.ownerId !== userId) throw new Error('Not found');
    const now = Date.now();
    await ctx.db.patch(id, { ...patch, updatedAt: now, lastActiveAt: now });
    await ctx.db.insert('activity', { userId, type: 'product_update', at: now, meta: { id } });
  }
});

export const remove = mutation({
  args: { id: v.id('products') },
  handler: async (ctx, { id }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');
    const product = await ctx.db.get(id);
    if (!product || product.ownerId !== userId) throw new Error('Not found');
    await ctx.db.delete(id);
    await ctx.db.insert('activity', { userId, type: 'product_delete', at: Date.now(), meta: { id } });
  }
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db.query('products').withIndex('by_owner', q => q.eq('ownerId', userId)).collect();
  }
});

export const uploadUrl = mutation({
  args: { contentType: v.string() },
  handler: async (ctx, { contentType }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');
    return await ctx.storage.generateUploadUrl();
  }
});

export const markInactiveOlderThan = action({
  args: { days: v.number() },
  handler: async (ctx, { days }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');
    const cutoff = Date.now() - days * 24 * 3600 * 1000;
    const products = await ctx.runQuery(list, {});
    const toDeactivate = products.filter(p => p.lastActiveAt < cutoff && p.active);
    for (const p of toDeactivate) {
      await ctx.runMutation(update, { id: p._id, active: false });
    }
    return toDeactivate.length;
  }
});
