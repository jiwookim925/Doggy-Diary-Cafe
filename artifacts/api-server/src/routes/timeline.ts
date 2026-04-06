import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { db, timelineTable } from "@workspace/db";
import {
  CreateTimelineEventBody,
  DeleteTimelineEventParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/timeline", async (_req, res): Promise<void> => {
  const events = await db.select().from(timelineTable).orderBy(asc(timelineTable.eventDate));
  res.json(events.map(e => ({
    ...e,
    createdAt: e.createdAt.toISOString(),
  })));
});

router.post("/timeline", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreateTimelineEventBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [event] = await db.insert(timelineTable).values({
    title: parsed.data.title,
    description: parsed.data.description,
    mediaUrl: parsed.data.mediaUrl ?? null,
    mediaType: parsed.data.mediaType,
    eventDate: parsed.data.eventDate,
  }).returning();

  res.status(201).json({ ...event, createdAt: event.createdAt.toISOString() });
});

router.delete("/timeline/:id", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = DeleteTimelineEventParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [event] = await db.select().from(timelineTable).where(eq(timelineTable.id, params.data.id));
  if (!event) {
    res.status(404).json({ error: "Event not found" });
    return;
  }

  await db.delete(timelineTable).where(eq(timelineTable.id, params.data.id));
  res.sendStatus(204);
});

export default router;
