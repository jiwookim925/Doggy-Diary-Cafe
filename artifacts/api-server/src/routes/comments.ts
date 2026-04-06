import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { db, commentsTable, postsTable } from "@workspace/db";
import { sql } from "drizzle-orm";
import {
  CreateCommentBody,
  ListCommentsParams,
  CreateCommentParams,
  DeleteCommentParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/posts/:id/comments", async (req, res): Promise<void> => {
  const params = ListCommentsParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const comments = await db.select().from(commentsTable)
    .where(eq(commentsTable.postId, params.data.id))
    .orderBy(commentsTable.createdAt);

  res.json(comments.map(c => ({ ...c, createdAt: c.createdAt.toISOString() })));
});

router.post("/posts/:id/comments", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = CreateCommentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = CreateCommentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const authorName = (req as any).auth?.sessionClaims?.fullName || "팬";

  const [comment] = await db.insert(commentsTable).values({
    postId: params.data.id,
    authorId: auth.userId,
    authorName,
    content: parsed.data.content,
  }).returning();

  await db.update(postsTable)
    .set({ commentCount: sql`${postsTable.commentCount} + 1` })
    .where(eq(postsTable.id, params.data.id));

  res.status(201).json({ ...comment, createdAt: comment.createdAt.toISOString() });
});

router.delete("/comments/:id", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = DeleteCommentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [comment] = await db.select().from(commentsTable).where(eq(commentsTable.id, params.data.id));
  if (!comment) {
    res.status(404).json({ error: "Comment not found" });
    return;
  }

  if (comment.authorId !== auth.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  await db.delete(commentsTable).where(eq(commentsTable.id, params.data.id));
  await db.update(postsTable)
    .set({ commentCount: sql`${postsTable.commentCount} - 1` })
    .where(eq(postsTable.id, comment.postId));

  res.sendStatus(204);
});

export default router;
