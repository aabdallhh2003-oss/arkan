import { v } from 'convex/values';
import { query } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/dist/server';

export const search = query({
  args: { q: v.string() },
  handler: async (ctx, { q }) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { products: [], orders: [] };
    const qLower = q.toLowerCase();
    const products = (await ctx.db.query('products').withIndex('by_owner', i => i.eq('ownerId', userId)).collect())
      .filter(p => [p.name, p.description, p.category].some(s => s.toLowerCase().includes(qLower)));
    const orders = (await ctx.db.query('orders').withIndex('by_owner', i => i.eq('ownerId', userId)).collect())
      .filter(o => o.items.length > 0 && qLower && qLower.length > 0);
    return { products, orders };
  }
});
