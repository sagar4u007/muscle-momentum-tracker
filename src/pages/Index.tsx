
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to login page
    navigate('/login');
  }, [navigate]);

  return (
    <div className="min-h-screen flex-center bg-dark">
      <div className="animate-pulse text-center">
        <h1 className="text-2xl font-bold mb-4">Muscle Momentum Tracker</h1>
        <p className="text-lg text-muted-foreground">Redirecting to login...</p>
      </div>
    </div>
  );
};

export default Index;
