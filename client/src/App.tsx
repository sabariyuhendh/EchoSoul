
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import NavigationRedesigned from "./components/NavigationRedesigned";
import { Component, ReactNode } from "react";

// Simple Error Boundary without external dependency
class ErrorBoundary extends Component<
  { children: ReactNode; fallback?: ReactNode },
  { hasError: boolean }
> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Application error caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
          <div className="text-center max-w-md">
            <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
            <p className="text-gray-400 mb-6">We encountered an unexpected error. Don't worry, your data is safe.</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg"
            >
              Reload page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
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
import HumourClub from "./pages/HumourClub";
import NotFound from "./pages/NotFound";
import ReflectionRoom from "./pages/ReflectionRoom";

const queryClient = new QueryClient();

// Removed all protected route components - authentication no longer required

function AppRouter() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black">
        <NavigationRedesigned />
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
          <Route path="/humour" component={HumourClub} />
          <Route path="/reflection" component={ReflectionRoom} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </ErrorBoundary>
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
