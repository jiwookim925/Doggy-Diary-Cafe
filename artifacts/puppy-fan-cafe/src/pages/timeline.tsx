import { Layout } from "@/components/layout";
import { useListTimeline } from "@workspace/api-client-react";
import { format } from "date-fns";
import { ko } from "date-fns/locale";
import { CalendarHeart, Image as ImageIcon, Video } from "lucide-react";

export default function TimelinePage() {
  const { data: events, isLoading } = useListTimeline();

  return (
    <Layout>
      <div className="bg-primary/10 py-16">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <CalendarHeart className="w-12 h-12 mx-auto text-primary mb-4" />
          <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4">별이의 일대기</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            우리의 사랑스러운 솜뭉치, 별이의 성장 이야기를 시간순으로 함께해요.
            강아지 시절부터 지금까지의 소중한 순간들이에요.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-20 max-w-4xl">
        {isLoading ? (
          <div className="space-y-12">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-8 opacity-50 animate-pulse">
                <div className="w-16 flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-primary/50 mb-2"></div>
                  <div className="w-1 h-full bg-border"></div>
                </div>
                <div className="flex-1 h-64 bg-secondary/50 rounded-[2.5rem]"></div>
              </div>
            ))}
          </div>
        ) : events?.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground text-lg">
            아직 첫 번째 추억을 기다리고 있어요.
          </div>
        ) : (
          <div className="relative">
            {/* 세로선 */}
            <div className="absolute left-[31px] md:left-1/2 top-0 bottom-0 w-1 bg-border transform md:-translate-x-1/2 z-0"></div>

            <div className="space-y-16">
              {events?.map((event, index) => {
                const isEven = index % 2 === 0;
                const eventDate = new Date(event.eventDate);
                
                return (
                  <div key={event.id} className={`relative z-10 flex flex-col md:flex-row gap-8 md:gap-0 items-start ${isEven ? 'md:flex-row-reverse' : ''}`}>
                    
                    {/* 중앙 점 */}
                    <div className="absolute left-[20px] md:left-1/2 top-6 w-6 h-6 rounded-full bg-primary border-4 border-background transform md:-translate-x-1/2 flex items-center justify-center shadow-sm"></div>
                    
                    {/* 내용 박스 */}
                    <div className={`w-full pl-20 md:pl-0 md:w-1/2 ${isEven ? 'md:pl-16' : 'md:pr-16 text-left md:text-right'}`}>
                      <div className="bg-card hover:bg-white dark:hover:bg-card border border-border/50 p-6 md:p-8 rounded-[2rem] shadow-sm hover:shadow-xl transition-all duration-500 hover:-translate-y-2 group">
                        
                        <div className={`inline-block px-4 py-1.5 rounded-full bg-secondary text-secondary-foreground text-sm font-bold tracking-wider mb-4 ${isEven ? '' : 'md:float-right'}`}>
                          {format(eventDate, "yyyy년 M월 d일", { locale: ko })}
                        </div>
                        
                        <div className="clear-both"></div>
                        
                        <h3 className="text-2xl font-serif font-bold mb-3">{event.title}</h3>
                        <p className="text-muted-foreground mb-6 leading-relaxed">{event.description}</p>
                        
                        {event.mediaUrl && event.mediaType !== 'none' && (
                          <div className="mt-4 rounded-[1.5rem] overflow-hidden bg-muted aspect-video relative group-hover:shadow-lg transition-shadow">
                            {event.mediaType === 'image' ? (
                              <img src={event.mediaUrl} alt={event.title} className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-secondary/50">
                                <Video className="w-12 h-12 text-muted-foreground/30" />
                                <video src={event.mediaUrl} className="absolute inset-0 w-full h-full object-cover opacity-80" controls />
                              </div>
                            )}
                            <div className="absolute top-4 right-4 w-8 h-8 bg-background/80 backdrop-blur-sm rounded-full flex items-center justify-center text-foreground">
                              {event.mediaType === 'image' ? <ImageIcon className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
