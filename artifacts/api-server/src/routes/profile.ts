import { Router, type IRouter } from "express";

const router: IRouter = Router();

router.get("/profile", async (_req, res): Promise<void> => {
  res.json({
    dogName: "코코",
    dogBreed: "말티즈",
    dogBirthdate: "2020-03-15",
    dogDescription: "안녕하세요! 저는 코코예요. 산책하는 걸 제일 좋아하고, 간식을 보면 눈이 반짝반짝해져요. 매일 행복하게 살고 있답니다!",
    dogImageUrl: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&h=400&fit=crop",
    ownerName: "박지수",
    ownerBio: "코코와 함께하는 매일이 행복해요. 강아지 육아 일기를 공유하고 싶어서 이 팬카페를 만들었답니다. 코코를 사랑해주시는 모든 분들께 감사드려요!",
    ownerImageUrl: "https://images.unsplash.com/photo-1494790108755-2616b612b47c?w=400&h=400&fit=crop",
    socialLinks: {
      instagram: "https://instagram.com",
      youtube: "https://youtube.com",
      blog: null,
    },
  });
});

export default router;
