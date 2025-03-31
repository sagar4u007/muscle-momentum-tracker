
import { useState } from 'react';
import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Home, 
  Dumbbell, 
  Calendar, 
  LineChart, 
  User, 
  LogOut, 
  Menu, 
  X,
  BookTemplate
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

interface AppLayoutProps {
  children: React.ReactNode;
}

const AppLayout = ({ children }: AppLayoutProps) => {
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  const navLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: <Home className="mr-2 h-5 w-5" /> },
    { to: '/exercises', label: 'Exercises', icon: <Dumbbell className="mr-2 h-5 w-5" /> },
    { to: '/workouts', label: 'Workouts', icon: <Calendar className="mr-2 h-5 w-5" /> },
    { to: '/templates', label: 'Templates', icon: <BookTemplate className="mr-2 h-5 w-5" /> },
    { to: '/progress', label: 'Progress', icon: <LineChart className="mr-2 h-5 w-5" /> },
    { to: '/profile', label: 'Profile', icon: <User className="mr-2 h-5 w-5" /> },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile header */}
      <header className="md:hidden bg-dark-light p-4 flex-between">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <Menu className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold ml-2">Muscle Momentum</h1>
        </div>
        <div className="flex items-center">
          <span className="text-sm mr-2">{user?.username}</span>
        </div>
      </header>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/80 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed md:static top-0 left-0 h-full z-50 w-64 bg-dark-light transition-transform duration-300 transform md:transform-none",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex-between p-4">
          <h1 className="text-xl font-bold text-yellow">Muscle Momentum</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Separator className="bg-dark-lighter" />

        <div className="px-3 py-4">
          <nav className="space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md transition-colors",
                  location.pathname === link.to
                    ? "bg-yellow text-dark-light font-medium"
                    : "hover:bg-dark-lighter text-foreground"
                )}
                onClick={() => setSidebarOpen(false)}
              >
                {link.icon}
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 w-full p-4">
          <Button 
            variant="ghost" 
            className="w-full justify-start text-destructive"
            onClick={logout}
          >
            <LogOut className="mr-2 h-5 w-5" />
            Log Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 md:p-6 overflow-y-auto bg-dark">
        {children}
      </main>
    </div>
  );
};

export default AppLayout;
