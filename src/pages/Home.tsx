
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Dumbbell, LineChart, ArrowRight, Calendar } from 'lucide-react';

const Home = () => {
  return (
    <div className="min-h-screen bg-dark flex flex-col">
      {/* Hero Section */}
      <header className="px-4 py-6 flex items-center justify-between border-b border-dark-lighter">
        <div className="flex items-center">
          <Dumbbell className="h-6 w-6 text-yellow mr-2" />
          <h1 className="text-xl font-bold">Muscle Momentum</h1>
        </div>
        <div className="space-x-4">
          <Link to="/login">
            <Button variant="outline" size="sm">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button className="yellow-gradient hover:bg-yellow-dark" size="sm">Sign Up</Button>
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-4xl mx-auto px-4 py-16 md:py-24 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 space-y-6">
            <h1 className="text-3xl md:text-5xl font-bold">
              Track your <span className="text-yellow">progressive overload</span> with precision
            </h1>
            <p className="text-lg text-muted-foreground">
              Muscle Momentum helps you track your weight training progress by focusing on the most important metric: progressive overload (weight × reps × sets).
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link to="/register">
                <Button className="yellow-gradient hover:bg-yellow-dark w-full sm:w-auto" size="lg">
                  Get Started <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="bg-dark-light p-8 rounded-xl shadow-xl border border-dark-lighter max-w-md">
              <Dumbbell className="h-16 w-16 text-yellow mx-auto mb-6" />
              <h2 className="text-2xl font-bold text-center mb-4">Track Your Lifting Journey</h2>
              <ul className="space-y-4">
                <li className="flex items-start">
                  <div className="bg-dark-lighter p-2 rounded-full mr-3">
                    <Dumbbell className="h-5 w-5 text-yellow" />
                  </div>
                  <div>
                    <h3 className="font-medium">Log Your Exercises</h3>
                    <p className="text-sm text-muted-foreground">Record sets, reps, and weight for each exercise</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-dark-lighter p-2 rounded-full mr-3">
                    <Calendar className="h-5 w-5 text-yellow" />
                  </div>
                  <div>
                    <h3 className="font-medium">Plan Your Workouts</h3>
                    <p className="text-sm text-muted-foreground">Create and follow workout templates</p>
                  </div>
                </li>
                <li className="flex items-start">
                  <div className="bg-dark-lighter p-2 rounded-full mr-3">
                    <LineChart className="h-5 w-5 text-yellow" />
                  </div>
                  <div>
                    <h3 className="font-medium">Track Your Progress</h3>
                    <p className="text-sm text-muted-foreground">Visualize volume and progression over time</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </section>

        <section className="bg-dark-light py-16">
          <div className="max-w-4xl mx-auto px-4 space-y-8">
            <h2 className="text-3xl font-bold text-center">How to Use Muscle Momentum</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-dark p-6 rounded-lg border border-dark-lighter">
                <div className="bg-dark-lighter h-10 w-10 flex-center rounded-full mb-4">
                  <span className="text-yellow font-bold">1</span>
                </div>
                <h3 className="text-xl font-medium mb-2">Create an Account</h3>
                <p className="text-muted-foreground">Sign up to get started tracking your fitness journey.</p>
              </div>
              <div className="bg-dark p-6 rounded-lg border border-dark-lighter">
                <div className="bg-dark-lighter h-10 w-10 flex-center rounded-full mb-4">
                  <span className="text-yellow font-bold">2</span>
                </div>
                <h3 className="text-xl font-medium mb-2">Log Your Workouts</h3>
                <p className="text-muted-foreground">Record your exercises, sets, reps, and weights after each session.</p>
              </div>
              <div className="bg-dark p-6 rounded-lg border border-dark-lighter">
                <div className="bg-dark-lighter h-10 w-10 flex-center rounded-full mb-4">
                  <span className="text-yellow font-bold">3</span>
                </div>
                <h3 className="text-xl font-medium mb-2">Track Your Progress</h3>
                <p className="text-muted-foreground">Monitor your progressive overload and muscle growth over time.</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="bg-dark-light border-t border-dark-lighter py-8">
        <div className="max-w-4xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center">
          <div className="flex items-center mb-4 md:mb-0">
            <Dumbbell className="h-6 w-6 text-yellow mr-2" />
            <span className="font-bold">Muscle Momentum</span>
          </div>
          <div className="text-center md:text-right">
            <p className="text-sm text-muted-foreground">
              Track, analyze, and improve your strength training
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
