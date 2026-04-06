import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { getAuth } from "@clerk/express";
import { db, postsTable, commentsTable, likesTable } from "@workspace/db";
import {
  CreatePostBody,
  GetPostParams,
  DeletePostParams,
  LikePostParams,
  ListPostsQueryParams,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/posts", async (req, res): Promise<void> => {
  const query = ListPostsQueryParams.safeParse(req.query);
  const page = query.success ? (query.data.page ?? 1) : 1;
  const limit = query.success ? (query.data.limit ?? 10) : 10;
  const offset = (page - 1) * limit;

  const [posts, countResult] = await Promise.all([
    db.select().from(postsTable).orderBy(desc(postsTable.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(postsTable),
  ]);

  res.json({
    posts: posts.map(p => ({
      ...p,
      createdAt: p.createdAt.toISOString(),
    })),
    total: Number(countResult[0]?.count ?? 0),
    page,
    limit,
  });
});

router.post("/posts", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = CreatePostBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const authorName = (req as any).auth?.sessionClaims?.fullName || "팬";

  const [post] = await db.insert(postsTable).values({
    authorId: auth.userId,
    authorName,
    title: parsed.data.title,
    content: parsed.data.content,
    imageUrl: parsed.data.imageUrl ?? null,
  }).returning();

  res.status(201).json({
    ...post,
    createdAt: post.createdAt.toISOString(),
  });
});

router.get("/posts/:id", async (req, res): Promise<void> => {
  const params = GetPostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, params.data.id));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json({ ...post, createdAt: post.createdAt.toISOString() });
});

router.delete("/posts/:id", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = DeletePostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [post] = await db.select().from(postsTable).where(eq(postsTable.id, params.data.id));
  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  if (post.authorId !== auth.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  await db.delete(postsTable).where(eq(postsTable.id, params.data.id));
  res.sendStatus(204);
});

router.post("/posts/:id/like", async (req, res): Promise<void> => {
  const auth = getAuth(req);
  if (!auth?.userId) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const params = LikePostParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const postId = params.data.id;
  const userId = auth.userId;

  const existingLike = await db.select().from(likesTable)
    .where(eq(likesTable.postId, postId));
  
  const userLike = existingLike.find(l => l.userId === userId);

  if (userLike) {
    await db.delete(likesTable).where(eq(likesTable.id, userLike.id));
    await db.update(postsTable)
      .set({ likeCount: sql`${postsTable.likeCount} - 1` })
      .where(eq(postsTable.id, postId));
    const [post] = await db.select({ likeCount: postsTable.likeCount }).from(postsTable).where(eq(postsTable.id, postId));
    res.json({ liked: false, likeCount: post?.likeCount ?? 0 });
  } else {
    await db.insert(likesTable).values({ postId, userId });
    await db.update(postsTable)
      .set({ likeCount: sql`${postsTable.likeCount} + 1` })
      .where(eq(postsTable.id, postId));
    const [post] = await db.select({ likeCount: postsTable.likeCount }).from(postsTable).where(eq(postsTable.id, postId));
    res.json({ liked: true, likeCount: post?.likeCount ?? 0 });
  }
});

router.get("/stats", async (_req, res): Promise<void> => {
  const [postCount, likeCount, commentCount] = await Promise.all([
    db.select({ count: sql<number>`count(*)` }).from(postsTable),
    db.select({ count: sql<number>`sum(${postsTable.likeCount})` }).from(postsTable),
    db.select({ count: sql<number>`count(*)` }).from(commentsTable),
  ]);

  res.json({
    totalPosts: Number(postCount[0]?.count ?? 0),
    totalMembers: 42,
    totalLikes: Number(likeCount[0]?.count ?? 0),
    totalComments: Number(commentCount[0]?.count ?? 0),
  });
});

export default router;
