import { v } from 'convex/values';
import { mutation, query } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/dist/server';

export const create = mutation({
  args: {
    items: v.array(v.object({ productId: v.id('products'), quantity: v.number() })),
  },
  handler: async (ctx, { items }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');
    const now = Date.now();
    // compute total
    let total = 0;
    for (const it of items) {
      const p = await ctx.db.get(it.productId);
      if (!p) throw new Error('Product missing');
      total += p.price * it.quantity;
    }
    const id = await ctx.db.insert('orders', { ownerId: userId, status: 'pending', items, total, createdAt: now, updatedAt: now });
    await ctx.db.insert('activity', { userId, type: 'order_create', at: now, meta: { id } });
    return id;
  }
});

export const updateStatus = mutation({
  args: { id: v.id('orders'), status: v.union(v.literal('pending'), v.literal('shipped'), v.literal('completed')) },
  handler: async (ctx, { id, status }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');
    const ord = await ctx.db.get(id);
    if (!ord || ord.ownerId !== userId) throw new Error('Not found');
    await ctx.db.patch(id, { status, updatedAt: Date.now() });
    await ctx.db.insert('activity', { userId, type: 'order_status', at: Date.now(), meta: { id, status } });
  }
});

export const list = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db.query('orders').withIndex('by_owner', q => q.eq('ownerId', userId)).collect();
  }
});
