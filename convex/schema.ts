import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  alerts: defineTable({
    title: v.string(),
    description: v.string(),
    location: v.string(),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    status: v.union(v.literal("active"), v.literal("resolved")),
    createdBy: v.id("users"),
  }).index("by_status", ["status"]),
  notifications: defineTable({
    userId: v.id("users"),
    alertId: v.id("alerts"),
    read: v.boolean(),
  }).index("by_user_unread", ["userId", "read"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
