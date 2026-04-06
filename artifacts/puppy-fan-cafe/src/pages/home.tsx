import { Link } from "wouter";
import { Layout } from "@/components/layout";
import { Button } from "@/components/ui/button";
import { Heart, Users, MessageCircle, ArrowRight, Coffee } from "lucide-react";
import heroMaltese from "@/assets/hero-maltese.png";
import cafeBg from "@/assets/cafe-bg.png";
import { useGetStats } from "@workspace/api-client-react";

export default function HomePage() {
  const { data: stats, isLoading } = useGetStats();

  return (
    <Layout>
      {/* 히어로 섹션 */}
      <section className="relative min-h-[85vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img src={cafeBg} alt="카페 배경" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/80 to-background" />
        </div>
        
        <div className="container relative z-10 px-4 grid lg:grid-cols-2 gap-12 items-center">
          <div className="max-w-2xl space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary font-medium text-sm">
              <Heart className="w-4 h-4 fill-current" />
              공식 팬카페에 오신 것을 환영해요
            </div>
            <h1 className="text-5xl md:text-7xl font-bold font-serif text-foreground leading-tight">
              별이를 사랑하는 <br />
              <span className="text-primary italic">모두를 위한 공간</span>
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed">
              우리의 포근한 팬카페에 들어와 수원에서 가장 귀여운 실버푸들, 별이와 함께하는 특별한 순간들을 나눠요.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link href="/sign-up">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg w-full sm:w-auto shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  카페 가입하기
                </Button>
              </Link>
              <Link href="/community">
                <Button size="lg" variant="outline" className="rounded-full h-14 px-8 text-lg w-full sm:w-auto border-2 hover:bg-secondary/50">
                  커뮤니티 둘러보기
                </Button>
              </Link>
            </div>
          </div>
          
          <div className="relative animate-in fade-in zoom-in-95 duration-1000 delay-300">
            <div className="absolute inset-0 bg-primary/20 rounded-[3rem] blur-3xl transform rotate-3" />
            <img 
              src={heroMaltese} 
              alt="카페에 있는 별이" 
              className="relative z-10 rounded-[2.5rem] shadow-2xl object-cover aspect-square sm:aspect-[4/3] w-full border-8 border-white/50"
            />
            <div className="absolute -bottom-6 -left-6 z-20 glass-card p-6 rounded-3xl animate-bounce-slow">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-primary">
                  <Heart className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <p className="font-bold text-xl">100%</p>
                  <p className="text-sm text-muted-foreground">순수 솜뭉치</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 통계 섹션 */}
      <section className="py-24 bg-secondary/20 relative">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-serif font-bold mb-4">우리의 가족들</h2>
            <p className="text-muted-foreground text-lg">별이 덕분에 하루가 밝아지는 팬들의 이야기예요.</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {[
              { label: "멤버", value: stats?.totalMembers || 0, icon: Users, color: "text-blue-500", bg: "bg-blue-50" },
              { label: "이야기", value: stats?.totalPosts || 0, icon: Coffee, color: "text-amber-600", bg: "bg-amber-50" },
              { label: "좋아요", value: stats?.totalLikes || 0, icon: Heart, color: "text-pink-500", bg: "bg-pink-50" },
              { label: "댓글", value: stats?.totalComments || 0, icon: MessageCircle, color: "text-green-500", bg: "bg-green-50" },
            ].map((stat, i) => (
              <div key={i} className="bg-card rounded-3xl p-6 text-center shadow-sm border border-border/50 hover:shadow-md transition-all hover:-translate-y-1">
                <div className={`w-12 h-12 mx-auto rounded-full ${stat.bg} ${stat.color} flex items-center justify-center mb-4`}>
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold mb-1">{isLoading ? "-" : stat.value}</div>
                <div className="text-sm font-medium text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
      
      {/* 행동 유도 섹션 */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center max-w-3xl">
          <h2 className="text-4xl font-serif font-bold mb-6">별이에 대한 사랑을 나눠볼까요?</h2>
          <p className="text-xl text-muted-foreground mb-10">별이 덕분에 매일 미소 짓는 수많은 팬들과 함께해요.</p>
          <Link href="/sign-up">
            <Button size="lg" className="rounded-full h-14 px-10 text-lg shadow-xl hover:shadow-primary/25 group">
              멤버 되기
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </section>
    </Layout>
  );
}
