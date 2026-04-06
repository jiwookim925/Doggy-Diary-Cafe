import { useEffect, useRef } from "react";
import { ClerkProvider, SignIn, SignUp, Show, useClerk, useUser } from '@clerk/react';
import { Switch, Route, Redirect, useLocation, Router as WouterRouter } from 'wouter';
import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";

import HomePage from "./pages/home";
import CommunityPage from "./pages/community";
import PostDetailPage from "./pages/post-detail";
import TimelinePage from "./pages/timeline";
import OwnerPage from "./pages/owner";
import ProfilePage from "./pages/profile";

const queryClient = new QueryClient();
const clerkPubKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const clerkProxyUrl = import.meta.env.VITE_CLERK_PROXY_URL;
const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

function stripBase(path: string): string {
  return basePath && path.startsWith(basePath) ? path.slice(basePath.length) || "/" : path;
}

if (!clerkPubKey) throw new Error('Missing VITE_CLERK_PUBLISHABLE_KEY');

function SignInPage() {
  return (
    <div className="min-h-screen bg-[url('/src/assets/cafe-bg.png')] bg-cover bg-center flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
        <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground font-serif">다시 만나서 반가워요</h1>
          <p className="text-muted-foreground text-center mt-2">별이 팬카페에 로그인하세요</p>
        </div>
        <SignIn routing="path" path={`${basePath}/sign-in`} signUpUrl={`${basePath}/sign-up`} />
      </div>
    </div>
  );
}

function SignUpPage() {
  return (
    <div className="min-h-screen bg-[url('/src/assets/cafe-bg.png')] bg-cover bg-center flex items-center justify-center p-4">
      <div className="w-full max-w-md glass-card rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700">
         <div className="flex flex-col items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground font-serif">별이 팬카페 가입하기</h1>
          <p className="text-muted-foreground text-center mt-2">계정을 만들고 사랑을 나눠요</p>
        </div>
        <SignUp routing="path" path={`${basePath}/sign-up`} signInUrl={`${basePath}/sign-in`} />
      </div>
    </div>
  );
}

function ClerkQueryClientCacheInvalidator() {
  const { addListener } = useClerk();
  const queryClient = useQueryClient();
  const prevUserIdRef = useRef<string | null | undefined>(undefined);
  useEffect(() => {
    const unsubscribe = addListener(({ user }) => {
      const userId = user?.id ?? null;
      if (prevUserIdRef.current !== undefined && prevUserIdRef.current !== userId) queryClient.clear();
      prevUserIdRef.current = userId;
    });
    return unsubscribe;
  }, [addListener, queryClient]);
  return null;
}

function HomeRedirect() {
  return <>
    <Show when="signed-in"><Redirect to="/community" /></Show>
    <Show when="signed-out"><HomePage /></Show>
  </>;
}

function ClerkProviderWithRoutes() {
  const [, setLocation] = useLocation();
  return <ClerkProvider publishableKey={clerkPubKey} proxyUrl={clerkProxyUrl}
    routerPush={(to) => setLocation(stripBase(to))}
    routerReplace={(to) => setLocation(stripBase(to), { replace: true })}>
    <QueryClientProvider client={queryClient}>
      <ClerkQueryClientCacheInvalidator />
      <Switch>
        <Route path="/" component={HomeRedirect} />
        <Route path="/sign-in/*?" component={SignInPage} />
        <Route path="/sign-up/*?" component={SignUpPage} />
        <Route path="/community" component={CommunityPage} />
        <Route path="/community/:id" component={PostDetailPage} />
        <Route path="/timeline" component={TimelinePage} />
        <Route path="/owner" component={OwnerPage} />
        <Route path="/profile" component={ProfilePage} />
      </Switch>
    </QueryClientProvider>
  </ClerkProvider>;
}

function App() {
  return <WouterRouter base={basePath}>
    <ClerkProviderWithRoutes />
    <Toaster />
  </WouterRouter>;
}

export default App;
