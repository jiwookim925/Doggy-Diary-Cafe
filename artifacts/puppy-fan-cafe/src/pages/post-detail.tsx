import { Layout } from "@/components/layout";
import { useParams, Link } from "wouter";
import { useGetPost, useListComments, useCreateComment, useLikePost, useDeletePost, useDeleteComment } from "@workspace/api-client-react";
import { getGetPostQueryKey, getListCommentsQueryKey, getListPostsQueryKey } from "@workspace/api-client-react";
import { useUser, Show } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Heart, MessageCircle, ArrowLeft, Trash2 } from "lucide-react";
import { formatDistanceToNow, format } from "date-fns";
import { ko } from "date-fns/locale";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";

export default function PostDetailPage() {
  const params = useParams();
  const id = parseInt(params.id || "0", 10);
  const [, setLocation] = useLocation();
  const { user } = useUser();
  const queryClient = useQueryClient();
  
  const { data: post, isLoading: postLoading } = useGetPost(id, { query: { enabled: !!id } });
  const { data: comments, isLoading: commentsLoading } = useListComments(id, { query: { enabled: !!id } });
  
  const likePost = useLikePost();
  const createComment = useCreateComment();
  const deletePost = useDeletePost();
  const deleteCommentObj = useDeleteComment();

  const [commentText, setCommentText] = useState("");

  if (postLoading) {
    return <Layout><div className="flex-1 flex justify-center items-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div></Layout>;
  }

  if (!post) {
    return <Layout><div className="text-center py-20">게시물을 찾을 수 없어요.</div></Layout>;
  }

  const handleLike = () => {
    likePost.mutate({ id }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(id) });
      }
    });
  };

  const handleComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    createComment.mutate({
      id,
      data: { content: commentText }
    }, {
      onSuccess: () => {
        setCommentText("");
        queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(id) });
        queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(id) });
      }
    });
  };

  const handleDeletePost = () => {
    if (confirm("이 게시물을 삭제할까요?")) {
      deletePost.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
          setLocation("/community");
        }
      });
    }
  };

  const handleDeleteComment = (commentId: number) => {
    if (confirm("댓글을 삭제할까요?")) {
      deleteCommentObj.mutate({ id: commentId }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCommentsQueryKey(id) });
          queryClient.invalidateQueries({ queryKey: getGetPostQueryKey(id) });
        }
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <Link href="/community" className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary mb-8 transition-colors">
          <ArrowLeft className="w-4 h-4" /> 게시판으로 돌아가기
        </Link>

        <article className="bg-card rounded-[2.5rem] shadow-sm border border-border/50 overflow-hidden mb-12">
          {post.imageUrl && (
            <div className="w-full aspect-[2/1] sm:aspect-[21/9] bg-muted relative">
              <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
            </div>
          )}
          
          <div className="p-8 md:p-12">
            <div className="flex items-center justify-between mb-8 pb-8 border-b border-border/50">
              <div className="flex items-center gap-4">
                <Avatar className="w-12 h-12 border-2 border-primary/20">
                  <AvatarFallback className="bg-primary/10 text-primary text-lg">{post.authorName[0]}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="font-bold text-foreground text-lg">{post.authorName}</div>
                  <div className="text-sm text-muted-foreground">{format(new Date(post.createdAt), "yyyy년 M월 d일 a h:mm", { locale: ko })}</div>
                </div>
              </div>
              
              {user && user.id === post.authorId && (
                <Button variant="ghost" size="icon" onClick={handleDeletePost} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full">
                  <Trash2 className="w-5 h-5" />
                </Button>
              )}
            </div>

            <h1 className="text-3xl md:text-4xl font-bold font-serif mb-6 leading-tight">{post.title}</h1>
            
            <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground whitespace-pre-wrap">
              {post.content}
            </div>

            <div className="flex items-center gap-4 mt-12 pt-8 border-t border-border/50">
              <Button 
                variant="outline" 
                size="lg" 
                className="rounded-full gap-2 border-2 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200 transition-all"
                onClick={handleLike}
                disabled={likePost.isPending || !user}
              >
                <Heart className={`w-5 h-5 ${likePost.isPending ? 'animate-pulse' : ''}`} />
                <span className="font-bold text-lg">{post.likeCount}</span>
              </Button>
              <div className="flex items-center gap-2 text-muted-foreground px-4 py-2 bg-muted/50 rounded-full">
                <MessageCircle className="w-5 h-5" />
                <span className="font-bold text-lg">{post.commentCount}</span>
              </div>
            </div>
          </div>
        </article>

        {/* 댓글 섹션 */}
        <div className="space-y-8">
          <h3 className="text-2xl font-serif font-bold flex items-center gap-3">
            댓글 <span className="text-muted-foreground text-lg font-sans bg-muted px-3 py-1 rounded-full">{post.commentCount}</span>
          </h3>

          <Show when="signed-in">
            <form onSubmit={handleComment} className="flex gap-4">
              <Avatar className="w-10 h-10 shrink-0">
                <AvatarImage src={user?.imageUrl} />
                <AvatarFallback>{user?.firstName?.[0] || '나'}</AvatarFallback>
              </Avatar>
              <div className="flex-1 space-y-4">
                <Textarea 
                  value={commentText}
                  onChange={e => setCommentText(e.target.value)}
                  placeholder="따뜻한 댓글을 남겨보세요..."
                  className="min-h-[100px] resize-none rounded-2xl p-4 bg-card border-border/50 focus-visible:ring-primary/30"
                />
                <div className="flex justify-end">
                  <Button type="submit" disabled={!commentText.trim() || createComment.isPending} className="rounded-full px-8">
                    {createComment.isPending ? "등록 중..." : "댓글 달기"}
                  </Button>
                </div>
              </div>
            </form>
          </Show>
          
          <Show when="signed-out">
            <div className="bg-secondary/30 p-8 rounded-[2rem] text-center border border-border/50">
              <p className="text-muted-foreground mb-4">댓글을 남기려면 로그인이 필요해요.</p>
              <Link href="/sign-in">
                <Button variant="outline" className="rounded-full border-2 bg-card">로그인하기</Button>
              </Link>
            </div>
          </Show>

          <div className="space-y-6 mt-8">
            {commentsLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="h-24 bg-muted rounded-2xl"></div>
                <div className="h-24 bg-muted rounded-2xl"></div>
              </div>
            ) : comments?.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground italic">
                아직 댓글이 없어요. 첫 번째 댓글을 남겨보세요!
              </div>
            ) : (
              comments?.map(comment => (
                <div key={comment.id} className="flex gap-4 group">
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarFallback className="bg-secondary text-secondary-foreground">{comment.authorName[0]}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 bg-card border border-border/50 rounded-[2rem] rounded-tl-sm p-5 relative">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-bold text-foreground mr-2">{comment.authorName}</span>
                        <span className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true, locale: ko })}</span>
                      </div>
                      {user && user.id === comment.authorId && (
                        <button 
                          onClick={() => handleDeleteComment(comment.id)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                    <p className="text-muted-foreground whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
