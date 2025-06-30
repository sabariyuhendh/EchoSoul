
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "./components/Navigation";
// import Landing from "./pages/Landing";
import Index from "./pages/Index";
import Vault from "./pages/Vault";
import Letters from "./pages/Letters";
import LetItGo from "./pages/LetItGo";
import Mood from "./pages/Mood";
import Whisper from "./pages/Whisper";
import Soulmate from "./pages/Soulmate";
import Feed from "./pages/Feed";
import CalmSpace from "./pages/CalmSpace";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRouter() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <div className="min-h-screen bg-black">
      <Navigation />
      <Switch>
        <Route path="/" component={Index} />
        <Route path="/vault" component={Vault} />
        <Route path="/letters" component={Letters} />
        <Route path="/letitgo" component={LetItGo} />
        <Route path="/mood" component={Mood} />
        <Route path="/whisper" component={Whisper} />
        <Route path="/soulmate" component={Soulmate} />
        <Route path="/feed" component={Feed} />
        <Route path="/calm" component={CalmSpace} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AppRouter />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
