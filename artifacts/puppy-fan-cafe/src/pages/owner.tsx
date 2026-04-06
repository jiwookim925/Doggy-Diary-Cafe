import { Layout } from "@/components/layout";
import { useGetProfile } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Instagram, Youtube, BookOpen, MapPin, Bone } from "lucide-react";
import heroMaltese from "@/assets/hero-maltese.png";
import { formatDistanceToNowStrict, parseISO } from "date-fns";
import { ko } from "date-fns/locale";

export default function OwnerPage() {
  const { data: profile, isLoading } = useGetProfile();

  if (isLoading) {
    return <Layout><div className="flex-1 flex justify-center items-center"><div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div></div></Layout>;
  }

  const defaultProfile = {
    dogName: "별이",
    dogBreed: "실버푸들",
    dogBirthdate: "2018-12-25",
    dogDescription: "수원에서 가장 귀여운 실버푸들이에요. 산책할 때 꼬리를 살랑살랑 흔들고, 간식 봉지 소리만 들으면 번개처럼 달려와요!",
    dogImageUrl: heroMaltese,
    ownerName: "문주원",
    ownerBio: "별이와 함께하는 매일이 행복해요~~^^!",
    ownerImageUrl: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&h=400&fit=crop",
    socialLinks: {
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
      blog: null,
    }
  };

  const p = profile || defaultProfile;

  let ageText = "알 수 없음";
  try {
    ageText = formatDistanceToNowStrict(parseISO(p.dogBirthdate), { locale: ko });
  } catch (e) {}

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-5xl">
        
        {/* 강아지 프로필 */}
        <section className="mb-24">
          <div className="bg-card rounded-[3rem] p-8 md:p-12 shadow-xl border border-border/50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
            
            <div className="grid md:grid-cols-2 gap-12 items-center relative z-10">
              <div className="order-2 md:order-1 space-y-6">
                <div>
                  <h1 className="text-5xl md:text-6xl font-serif font-bold mb-2">{p.dogName}</h1>
                  <p className="text-xl text-primary font-medium tracking-wide uppercase">{p.dogBreed}</p>
                </div>
                
                <div className="flex flex-wrap gap-4 pt-2">
                  <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-2xl">
                    <Bone className="w-5 h-5 text-amber-600" />
                    <span className="font-medium text-foreground">{ageText} 됐어요</span>
                  </div>
                  <div className="flex items-center gap-2 bg-secondary/50 px-4 py-2 rounded-2xl">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    <span className="font-medium text-foreground">Suwon, KR</span>
                  </div>
                </div>

                <div className="pt-4 border-t border-border/50">
                  <p className="text-lg text-muted-foreground leading-relaxed italic">
                    "{p.dogDescription}"
                  </p>
                </div>
              </div>
              
              <div className="order-1 md:order-2 relative">
                <div className="aspect-square rounded-[2.5rem] overflow-hidden border-8 border-white shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-500">
                  <img src={p.dogImageUrl || defaultProfile.dogImageUrl} alt={p.dogName} className="w-full h-full object-cover" />
                </div>
                <div className="absolute -bottom-6 -left-6 bg-white p-4 rounded-full shadow-lg">
                  <span className="text-4xl">🐾</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 주인 프로필 */}
        <section className="mb-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-serif font-bold">주인 소개</h2>
            <p className="text-muted-foreground mt-2">24세 미모의 여성</p>
          </div>

          <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center gap-10">
            <div className="w-48 h-48 rounded-full overflow-hidden border-4 border-secondary shadow-lg shrink-0">
              <img src={p.ownerImageUrl ? (p.ownerImageUrl.startsWith('http') ? p.ownerImageUrl : `${import.meta.env.BASE_URL}${p.ownerImageUrl.replace(/^\//, '')}`) : defaultProfile.ownerImageUrl} alt={p.ownerName} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" />
            </div>
            
            <div className="text-center md:text-left">
              <h3 className="text-2xl font-bold mb-4">{p.ownerName}</h3>
              <p className="text-lg text-muted-foreground leading-relaxed mb-6">
                {p.ownerBio}
              </p>
              
              <div className="flex flex-wrap justify-center md:justify-start gap-4">
                {p.socialLinks?.instagram && (
                  <Button variant="outline" className="rounded-full gap-2 border-2 hover:bg-pink-50 hover:text-pink-600 hover:border-pink-200">
                    <Instagram className="w-4 h-4" /> 인스타그램
                  </Button>
                )}
                {p.socialLinks?.youtube && (
                  <Button variant="outline" className="rounded-full gap-2 border-2 hover:bg-red-50 hover:text-red-600 hover:border-red-200">
                    <Youtube className="w-4 h-4" /> 유튜브
                  </Button>
                )}
                {p.socialLinks?.blog && (
                  <Button variant="outline" className="rounded-full gap-2 border-2 hover:bg-green-50 hover:text-green-600 hover:border-green-200">
                    <BookOpen className="w-4 h-4" /> 블로그
                  </Button>
                )}
              </div>
            </div>
          </div>
        </section>

      </div>
    </Layout>
  );
}
