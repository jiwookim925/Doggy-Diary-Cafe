import { Layout } from "@/components/layout";
import { useUser, useClerk } from "@clerk/react";
import { Redirect } from "wouter";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { LogOut, Settings, Heart, MessageCircle, Clock } from "lucide-react";
import { useListPosts } from "@workspace/api-client-react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { formatDistanceToNow } from "date-fns";

export default function ProfilePage() {
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  
  // In a real app, we'd pass a filter to get only this user's posts
  // For now, we'll fetch all and filter client side
  const { data, isLoading } = useListPosts({ page: 1, limit: 100 });

  if (!isLoaded) {
    return <Layout><div className="flex-1 flex justify-center items-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div></Layout>;
  }

  if (!user) {
    return <Redirect to="/sign-in" />;
  }

  const userPosts = data?.posts.filter(p => p.authorId === user.id) || [];

  return (
    <Layout>
      <div className="bg-primary/5 pb-24 pt-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="bg-card rounded-[3rem] p-8 shadow-sm border border-border mt-12 relative">
            <div className="absolute -top-16 left-1/2 transform -translate-x-1/2">
              <Avatar className="w-32 h-32 border-8 border-card shadow-lg bg-muted">
                <AvatarImage src={user.imageUrl} />
                <AvatarFallback className="text-4xl">{user.firstName?.[0] || 'U'}</AvatarFallback>
              </Avatar>
            </div>
            
            <div className="mt-16 text-center">
              <h1 className="text-3xl font-bold font-serif mb-1">{user.fullName || "Café Member"}</h1>
              <p className="text-muted-foreground mb-8">{user.primaryEmailAddress?.emailAddress}</p>
              
              <div className="flex justify-center gap-4">
                <Button variant="outline" className="rounded-full border-2 gap-2">
                  <Settings className="w-4 h-4" /> Edit Profile
                </Button>
                <Button variant="outline" className="rounded-full border-2 text-destructive hover:bg-destructive/10 hover:text-destructive gap-2" onClick={() => signOut()}>
                  <LogOut className="w-4 h-4" /> Sign Out
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-3 gap-4 border-t border-border/50 mt-10 pt-10 text-center">
              <div>
                <div className="text-3xl font-bold text-foreground mb-1">{userPosts.length}</div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Stories</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {userPosts.reduce((sum, p) => sum + p.likeCount, 0)}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Likes Received</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {formatDistanceToNow(user.createdAt || new Date(), { addSuffix: false })}
                </div>
                <div className="text-sm text-muted-foreground uppercase tracking-wider font-medium">Member Since</div>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-serif font-bold mb-8 flex items-center gap-3">
              <Clock className="w-6 h-6 text-primary" /> Your Recent Stories
            </h2>

            {isLoading ? (
              <div className="space-y-4">
                <div className="h-32 bg-card rounded-3xl animate-pulse"></div>
                <div className="h-32 bg-card rounded-3xl animate-pulse"></div>
              </div>
            ) : userPosts.length === 0 ? (
              <div className="text-center py-16 bg-card rounded-[2rem] border border-dashed border-border">
                <p className="text-muted-foreground mb-4">You haven't shared any stories yet.</p>
                <Link href="/community">
                  <Button className="rounded-full">Go to Board</Button>
                </Link>
              </div>
            ) : (
              <div className="grid gap-4">
                {userPosts.map(post => (
                  <Link key={post.id} href={`/community/${post.id}`}>
                    <Card className="hover:border-primary/50 transition-colors cursor-pointer rounded-2xl">
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-bold text-lg">{post.title}</h3>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-muted-foreground text-sm line-clamp-1 mb-4">{post.content}</p>
                        <div className="flex gap-4">
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Heart className="w-3.5 h-3.5" /> {post.likeCount}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MessageCircle className="w-3.5 h-3.5" /> {post.commentCount}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}