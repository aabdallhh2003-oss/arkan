import { action } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/dist/server';
import * as products from './products';
import * as orders from './orders';

export const autoRemoveInactiveProducts = action({
  args: { days: v.number() },
  handler: async (ctx, { days }) => {
    // For demo we apply to current user. In production, run as admin across all users.
    return await ctx.runAction(products.markInactiveOlderThan, { days });
  }
});

export const notifyUnfulfilledOrders = action({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Not authenticated');
    const list = await ctx.runQuery(orders.list, {});
    const pending = list.filter(o => o.status !== 'completed');
    // Here you would integrate with email/push provider. We'll log activity.
    await Promise.all(pending.map(o => ctx.db.insert('activity', { userId, type: 'order_reminder', at: Date.now(), meta: { orderId: o._id, status: o.status } })));
    return pending.length;
  }
});
