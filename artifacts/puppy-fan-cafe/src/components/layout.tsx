import { Link, useLocation } from "wouter";
import { Show, useUser, useClerk } from "@clerk/react";
import { Heart, Coffee, Clock, User as UserIcon, LogOut, Menu } from "lucide-react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";

export function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user } = useUser();
  const { signOut } = useClerk();

  const navLinks = [
    { href: "/community", label: "커뮤니티", icon: Coffee },
    { href: "/timeline", label: "일대기", icon: Clock },
    { href: "/owner", label: "별이 소개", icon: Heart },
  ];

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-primary font-serif font-bold text-2xl">
            <Heart className="w-6 h-6 fill-current" />
            <span>별이 팬카페</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-2 text-sm font-medium transition-colors hover:text-primary ${
                  location.startsWith(link.href) ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Show when="signed-out">
              <Link href="/sign-in" className="hidden md:block">
                <Button variant="ghost" className="rounded-full">로그인</Button>
              </Link>
              <Link href="/sign-up">
                <Button className="rounded-full shadow-sm">카페 가입</Button>
              </Link>
            </Show>

            <Show when="signed-in">
              <div className="hidden md:flex items-center gap-4">
                <Link href="/profile">
                  <Avatar className="w-9 h-9 border-2 border-primary/20 cursor-pointer hover:border-primary transition-colors">
                    <AvatarImage src={user?.imageUrl} />
                    <AvatarFallback><UserIcon className="w-4 h-4" /></AvatarFallback>
                  </Avatar>
                </Link>
                <Button variant="ghost" size="icon" onClick={() => signOut()} className="rounded-full text-muted-foreground hover:text-destructive">
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </Show>

            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="w-6 h-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[80vw] sm:w-[350px] bg-background/95 backdrop-blur-xl">
                <div className="flex flex-col gap-8 mt-8">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="flex items-center gap-4 text-lg font-medium text-foreground hover:text-primary transition-colors"
                    >
                      <link.icon className="w-5 h-5" />
                      {link.label}
                    </Link>
                  ))}
                  
                  <Show when="signed-in">
                    <div className="h-px bg-border my-4" />
                    <Link href="/profile" className="flex items-center gap-4 text-lg font-medium text-foreground hover:text-primary transition-colors">
                      <UserIcon className="w-5 h-5" />
                      내 프로필
                    </Link>
                    <button onClick={() => signOut()} className="flex items-center gap-4 text-lg font-medium text-destructive transition-colors text-left">
                      <LogOut className="w-5 h-5" />
                      로그아웃
                    </button>
                  </Show>
                  
                  <Show when="signed-out">
                    <div className="h-px bg-border my-4" />
                    <Link href="/sign-in" className="text-lg font-medium">로그인</Link>
                    <Link href="/sign-up" className="text-lg font-medium text-primary">카페 가입</Link>
                  </Show>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </header>

      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="py-12 bg-secondary/30 mt-auto border-t border-border/50">
        <div className="container mx-auto px-4 text-center">
          <p className="text-muted-foreground font-serif italic text-lg mb-4">"강아지는 지구상에서 자신보다 당신을 더 사랑하는 유일한 존재예요."</p>
          <p className="text-sm text-muted-foreground/70">© {new Date().getFullYear()} 별이 팬카페. 사랑을 담아 만들었어요.</p>
        </div>
      </footer>
    </div>
  );
}
