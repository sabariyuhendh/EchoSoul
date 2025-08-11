
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Route, Switch } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import Navigation from "./components/NavigationRedesigned";
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
import GoogleLogin from "./pages/GoogleLogin";
import NotFound from "./pages/NotFound";
import ProtectedRoute from './components/ProtectedRoute';
import ReflectionRoom from "./pages/ReflectionRoom";

const queryClient = new QueryClient();

// Protected route components to prevent re-render issues
const ProtectedVault = () => (
  <ProtectedRoute fallbackMessage="Your vault entries are private and require authentication.">
    <Vault />
  </ProtectedRoute>
);

const ProtectedLetters = () => (
  <ProtectedRoute fallbackMessage="Your letters are personal and require authentication to protect your privacy.">
    <Letters />
  </ProtectedRoute>
);

const ProtectedLetItGo = () => (
  <ProtectedRoute fallbackMessage="Your emotional release sessions are private and require authentication.">
    <LetItGo />
  </ProtectedRoute>
);

const ProtectedMood = () => (
  <ProtectedRoute fallbackMessage="Your mood tracking data is personal and requires authentication.">
    <Mood />
  </ProtectedRoute>
);

const ProtectedWhisper = () => (
  <ProtectedRoute fallbackMessage="Your voice recordings are private and require authentication.">
    <Whisper />
  </ProtectedRoute>
);

const ProtectedSoulmate = () => (
  <ProtectedRoute fallbackMessage="Your AI companion conversations are personal and require authentication.">
    <Soulmate />
  </ProtectedRoute>
);

const ProtectedFeed = () => (
  <ProtectedRoute fallbackMessage="Accessing the community feed requires authentication.">
    <Feed />
  </ProtectedRoute>
);

const ProtectedCalmSpace = () => (
  <ProtectedRoute fallbackMessage="Your meditation sessions and preferences require authentication.">
    <CalmSpace />
  </ProtectedRoute>
);

const ProtectedHumourClub = () => (
  <ProtectedRoute fallbackMessage="The Humour Club features require authentication.">
    <HumourClub />
  </ProtectedRoute>
);

const ProtectedReflectionRoom = () => (
  <ProtectedRoute fallbackMessage="Your reflection questions and responses are private and require authentication.">
    <ReflectionRoom />
  </ProtectedRoute>
);

function AppRouter() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-black">
        <Navigation />
        <Switch>
          <Route path="/" component={Index} />
          <Route path="/vault" component={ProtectedVault} />
          <Route path="/letters" component={ProtectedLetters} />
          <Route path="/letitgo" component={ProtectedLetItGo} />
          <Route path="/mood" component={ProtectedMood} />
          <Route path="/whisper" component={ProtectedWhisper} />
          <Route path="/soulmate" component={ProtectedSoulmate} />
          <Route path="/feed" component={ProtectedFeed} />
          <Route path="/calm" component={ProtectedCalmSpace} />
          <Route path="/humour" component={ProtectedHumourClub} />
          <Route path="/reflection" component={ProtectedReflectionRoom} />
          <Route path="/login" component={GoogleLogin} />
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
