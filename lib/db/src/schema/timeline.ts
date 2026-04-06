import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const timelineTable = pgTable("timeline_events", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  mediaUrl: text("media_url"),
  mediaType: text("media_type").notNull().default("none"),
  eventDate: text("event_date").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTimelineSchema = createInsertSchema(timelineTable).omit({ id: true, createdAt: true });
export type InsertTimeline = z.infer<typeof insertTimelineSchema>;
export type TimelineEvent = typeof timelineTable.$inferSelect;
