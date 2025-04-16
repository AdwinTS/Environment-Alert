import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const createAlert = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    location: v.string(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const alertId = await ctx.db.insert("alerts", {
      ...args,
      status: "active",
      createdBy: userId,
    });

    // Create notifications for all users
    const users = await ctx.db.query("users").collect();
    await Promise.all(
      users.map((user) =>
        ctx.db.insert("notifications", {
          userId: user._id,
          alertId,
          read: false,
        })
      )
    );

    return alertId;
  },
});

export const listAlerts = query({
  args: {
    status: v.optional(v.union(v.literal("active"), v.literal("resolved"))),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const query = ctx.db.query("alerts");
    if (args.status !== undefined) {
      return await query
        .withIndex("by_status", (q) => q.eq("status", args.status as "active" | "resolved"))
        .order("desc")
        .collect();
    }
    return await query.order("desc").collect();
  },
});

export const getUnreadNotifications = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const notifications = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => q.eq("userId", userId).eq("read", false))
      .collect();

    const alerts = await Promise.all(
      notifications.map((n) => ctx.db.get(n.alertId))
    );
    return alerts.filter(Boolean);
  },
});

export const markNotificationRead = mutation({
  args: {
    alertId: v.id("alerts"),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    const notification = await ctx.db
      .query("notifications")
      .withIndex("by_user_unread", (q) => q.eq("userId", userId).eq("read", false))
      .filter((q) => q.eq(q.field("alertId"), args.alertId))
      .unique();

    if (notification) {
      await ctx.db.patch(notification._id, { read: true });
    }
  },
});
