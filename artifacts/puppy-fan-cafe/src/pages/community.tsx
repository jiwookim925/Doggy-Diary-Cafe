import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { useListPosts, useCreatePost } from "@workspace/api-client-react";
import { useUser, Show } from "@clerk/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Heart, MessageCircle, PenLine, Image as ImageIcon } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useQueryClient } from "@tanstack/react-query";
import { getListPostsQueryKey } from "@workspace/api-client-react";

export default function CommunityPage() {
  const { data, isLoading } = useListPosts({ page: 1, limit: 50 });
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Layout>
      <div className="bg-secondary/30 py-12 border-b border-border">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">Café Board</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Share your favorite Coco moments, fan art, or just say hello to other fans. 
            This is our cozy space.
          </p>
          
          <Show when="signed-in">
            <div className="mt-8">
              <CreatePostDialog open={isOpen} onOpenChange={setIsOpen} />
            </div>
          </Show>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {isLoading ? (
          <div className="space-y-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-48 rounded-3xl bg-secondary/50 animate-pulse" />
            ))}
          </div>
        ) : data?.posts.length === 0 ? (
          <div className="text-center py-20 bg-card rounded-3xl border border-border border-dashed">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
              <PenLine className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-serif font-bold mb-2">It's quiet here...</h3>
            <p className="text-muted-foreground mb-6">Be the first to share something about Coco!</p>
            <Show when="signed-in">
              <Button onClick={() => setIsOpen(true)} className="rounded-full">Write a Post</Button>
            </Show>
          </div>
        ) : (
          <div className="grid gap-6">
            {data?.posts.map((post) => (
              <Link key={post.id} href={`/community/${post.id}`}>
                <Card className="group hover:border-primary/50 hover:shadow-md transition-all cursor-pointer rounded-3xl overflow-hidden">
                  <CardContent className="p-0 sm:flex">
                    {post.imageUrl && (
                      <div className="sm:w-1/3 aspect-video sm:aspect-auto relative overflow-hidden bg-muted">
                        <img 
                          src={post.imageUrl} 
                          alt="Post attachment" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                        />
                      </div>
                    )}
                    <div className={`p-6 sm:p-8 flex flex-col justify-between ${post.imageUrl ? 'sm:w-2/3' : 'w-full'}`}>
                      <div>
                        <div className="flex items-center gap-3 mb-4">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback>{post.authorName[0]}</AvatarFallback>
                          </Avatar>
                          <div className="text-sm">
                            <span className="font-medium text-foreground">{post.authorName}</span>
                            <span className="text-muted-foreground mx-2">•</span>
                            <span className="text-muted-foreground">{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}</span>
                          </div>
                        </div>
                        <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">{post.title}</h3>
                        <p className="text-muted-foreground line-clamp-2">{post.content}</p>
                      </div>
                      
                      <div className="flex items-center gap-6 mt-6 pt-4 border-t border-border/50">
                        <div className="flex items-center gap-2 text-muted-foreground group-hover:text-pink-500 transition-colors">
                          <Heart className="w-5 h-5" />
                          <span className="font-medium">{post.likeCount}</span>
                        </div>
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MessageCircle className="w-5 h-5" />
                          <span className="font-medium">{post.commentCount}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}

function CreatePostDialog({ open, onOpenChange }: { open: boolean, onOpenChange: (open: boolean) => void }) {
  const { user } = useUser();
  const queryClient = useQueryClient();
  const createPost = useCreatePost();
  
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    createPost.mutate({
      data: {
        title,
        content,
        imageUrl: imageUrl || null
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListPostsQueryKey() });
        onOpenChange(false);
        setTitle("");
        setContent("");
        setImageUrl("");
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button size="lg" className="rounded-full shadow-lg h-14 px-8 text-lg hover:-translate-y-1 transition-transform">
          <PenLine className="w-5 h-5 mr-2" />
          Share a Story
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px] rounded-[2rem] p-8">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-serif">Write something nice</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Input 
              placeholder="Give your post a title..." 
              value={title}
              onChange={e => setTitle(e.target.value)}
              className="text-lg font-medium border-0 border-b-2 border-border rounded-none px-0 focus-visible:ring-0 focus-visible:border-primary bg-transparent"
            />
          </div>
          
          <div className="space-y-2">
            <Textarea 
              placeholder="What's on your mind? Did you see Coco today?" 
              value={content}
              onChange={e => setContent(e.target.value)}
              className="min-h-[150px] resize-none border-border rounded-2xl p-4 focus-visible:ring-primary/20 bg-muted/30"
            />
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-3 px-4 py-3 bg-muted/50 rounded-2xl border border-border/50">
              <ImageIcon className="w-5 h-5 text-muted-foreground shrink-0" />
              <Input 
                placeholder="Image URL (optional)" 
                value={imageUrl}
                onChange={e => setImageUrl(e.target.value)}
                className="border-0 bg-transparent h-auto p-0 focus-visible:ring-0"
              />
            </div>
            {imageUrl && (
              <div className="mt-4 rounded-xl overflow-hidden max-h-[200px] border border-border">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
              </div>
            )}
          </div>
          
          <Button 
            type="submit" 
            className="w-full rounded-full h-12 text-lg"
            disabled={!title.trim() || !content.trim() || createPost.isPending}
          >
            {createPost.isPending ? "Posting..." : "Post to Board"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}