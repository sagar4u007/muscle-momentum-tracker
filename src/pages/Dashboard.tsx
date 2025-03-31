
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/contexts/AuthContext';
import { workoutAPI } from '@/services/api';
import { Workout } from '@/types';
import { Dumbbell, Calendar, BarChart3, PlusCircle, ChevronRight } from 'lucide-react';
import { format, startOfWeek, endOfWeek } from 'date-fns';

const Dashboard = () => {
  const { user } = useAuth();
  const [recentWorkouts, setRecentWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchRecentWorkouts = async () => {
      try {
        const today = new Date();
        const startDate = format(startOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        const endDate = format(endOfWeek(today, { weekStartsOn: 1 }), 'yyyy-MM-dd');
        
        const { data } = await workoutAPI.getByDateRange(startDate, endDate);
        setRecentWorkouts(data);
      } catch (error) {
        console.error('Error fetching recent workouts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecentWorkouts();
  }, []);

  // Calculate total volume (weights * reps * sets) for the week
  const totalVolume = recentWorkouts.reduce((total, workout) => {
    const workoutVolume = workout.exercises.reduce((exerciseTotal, exercise) => {
      const exerciseVolume = exercise.sets.reduce((setTotal, set) => {
        return setTotal + (set.weight * set.reps);
      }, 0);
      return exerciseTotal + exerciseVolume;
    }, 0);
    return total + workoutVolume;
  }, 0);

  // Count total sets for the week
  const totalSets = recentWorkouts.reduce((total, workout) => {
    const workoutSets = workout.exercises.reduce((exerciseTotal, exercise) => {
      return exerciseTotal + exercise.sets.length;
    }, 0);
    return total + workoutSets;
  }, 0);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Welcome, {user?.username}!</h1>
            <p className="text-muted-foreground">Here's an overview of your fitness progress this week.</p>
          </div>
          <Button 
            asChild 
            className="mt-4 md:mt-0 yellow-gradient"
          >
            <Link to="/workouts/new">
              <PlusCircle className="mr-2 h-4 w-4" />
              New Workout
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-dark-light border-dark-lighter card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Weekly Volume</CardTitle>
              <BarChart3 className="h-4 w-4 text-yellow" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalVolume.toLocaleString()} lbs</div>
              <p className="text-xs text-muted-foreground">
                Total weight moved this week
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-light border-dark-lighter card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Sets</CardTitle>
              <Dumbbell className="h-4 w-4 text-yellow" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalSets}</div>
              <p className="text-xs text-muted-foreground">
                Sets completed this week
              </p>
            </CardContent>
          </Card>
          
          <Card className="bg-dark-light border-dark-lighter card-hover">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Workouts</CardTitle>
              <Calendar className="h-4 w-4 text-yellow" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{recentWorkouts.length}</div>
              <p className="text-xs text-muted-foreground">
                Workouts completed this week
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="col-span-1 bg-dark-light border-dark-lighter card-hover">
            <CardHeader>
              <CardTitle>Recent Workouts</CardTitle>
              <CardDescription>Your latest workout sessions</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">Loading recent workouts...</div>
              ) : recentWorkouts.length > 0 ? (
                <div className="space-y-4">
                  {recentWorkouts.slice(0, 3).map((workout) => (
                    <div key={workout.id} className="flex items-center">
                      <div className="bg-secondary p-2 rounded-md mr-4">
                        <Calendar className="h-5 w-5 text-yellow" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <p className="font-medium">{format(new Date(workout.date), 'EEEE, MMMM d')}</p>
                        <p className="text-sm text-muted-foreground">
                          {workout.exercises.length} exercise{workout.exercises.length !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <Button variant="ghost" size="icon" asChild>
                        <Link to={`/workouts/${workout.id}`}>
                          <ChevronRight className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  ))}
                  
                  <Separator className="my-4" />
                  
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    asChild
                  >
                    <Link to="/workouts">View all workouts</Link>
                  </Button>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground mb-4">No workouts found for this week</p>
                  <Button asChild className="yellow-gradient">
                    <Link to="/workouts/new">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Start a Workout
                    </Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="col-span-1 bg-dark-light border-dark-lighter card-hover">
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Common tasks you might want to do</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button 
                  className="w-full justify-start bg-secondary hover:bg-secondary/80 text-foreground" 
                  asChild
                >
                  <Link to="/workouts/new">
                    <PlusCircle className="mr-2 h-4 w-4 text-yellow" />
                    Start a new workout
                  </Link>
                </Button>
                <Button 
                  className="w-full justify-start bg-secondary hover:bg-secondary/80 text-foreground" 
                  asChild
                >
                  <Link to="/exercises">
                    <Dumbbell className="mr-2 h-4 w-4 text-yellow" />
                    View exercises
                  </Link>
                </Button>
                <Button 
                  className="w-full justify-start bg-secondary hover:bg-secondary/80 text-foreground" 
                  asChild
                >
                  <Link to="/templates">
                    <Calendar className="mr-2 h-4 w-4 text-yellow" />
                    Browse workout templates
                  </Link>
                </Button>
                <Button 
                  className="w-full justify-start bg-secondary hover:bg-secondary/80 text-foreground" 
                  asChild
                >
                  <Link to="/progress">
                    <BarChart3 className="mr-2 h-4 w-4 text-yellow" />
                    View progress charts
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Dashboard;
