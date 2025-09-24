import { query } from './_generated/server';
import { getAuthUserId } from '@convex-dev/auth/dist/server';

export const metrics = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return { products: 0, activeOrders: 0, completedOrders: 0, activityCount: 0 };
    const products = await ctx.db.query('products').withIndex('by_owner', i => i.eq('ownerId', userId)).collect();
    const orders = await ctx.db.query('orders').withIndex('by_owner', i => i.eq('ownerId', userId)).collect();
    const activity = await ctx.db.query('activity').withIndex('by_user', i => i.eq('userId', userId)).collect();
    return {
      products: products.length,
      activeOrders: orders.filter(o => o.status !== 'completed').length,
      completedOrders: orders.filter(o => o.status === 'completed').length,
      activityCount: activity.length,
    };
  }
});
