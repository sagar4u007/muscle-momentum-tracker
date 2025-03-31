
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import Dashboard from "@/pages/Dashboard";
import Exercises from "@/pages/Exercises";
import ExerciseDetail from "@/pages/ExerciseDetail";
import Workouts from "@/pages/Workouts";
import WorkoutDetail from "@/pages/WorkoutDetail";
import NewWorkout from "@/pages/NewWorkout";
import Progress from "@/pages/Progress";
import Templates from "@/pages/Templates";
import Profile from "@/pages/Profile";
import NotFound from "@/pages/NotFound";

// Auth Guard component
const AuthGuard = ({ children }: { children: React.ReactNode }) => {
  const token = localStorage.getItem('token');
  
  if (!token) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Protected routes */}
            <Route path="/dashboard" element={
              <AuthGuard>
                <Dashboard />
              </AuthGuard>
            } />
            <Route path="/exercises" element={
              <AuthGuard>
                <Exercises />
              </AuthGuard>
            } />
            <Route path="/exercises/:id" element={
              <AuthGuard>
                <ExerciseDetail />
              </AuthGuard>
            } />
            <Route path="/workouts" element={
              <AuthGuard>
                <Workouts />
              </AuthGuard>
            } />
            <Route path="/workouts/:id" element={
              <AuthGuard>
                <WorkoutDetail />
              </AuthGuard>
            } />
            <Route path="/workouts/new" element={
              <AuthGuard>
                <NewWorkout />
              </AuthGuard>
            } />
            <Route path="/progress" element={
              <AuthGuard>
                <Progress />
              </AuthGuard>
            } />
            <Route path="/templates" element={
              <AuthGuard>
                <Templates />
              </AuthGuard>
            } />
            <Route path="/profile" element={
              <AuthGuard>
                <Profile />
              </AuthGuard>
            } />
            
            {/* 404 Route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
