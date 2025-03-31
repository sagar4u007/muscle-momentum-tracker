
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { workoutAPI } from '@/services/api';
import { Workout } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar, Plus, Dumbbell, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { format, startOfMonth, endOfMonth, subMonths, addMonths } from 'date-fns';

const Workouts = () => {
  const [workouts, setWorkouts] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchWorkouts = async () => {
      try {
        setIsLoading(true);
        const start = format(startOfMonth(currentMonth), 'yyyy-MM-dd');
        const end = format(endOfMonth(currentMonth), 'yyyy-MM-dd');
        
        const { data } = await workoutAPI.getByDateRange(start, end);
        setWorkouts(data);
      } catch (error) {
        console.error('Error fetching workouts:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkouts();
  }, [currentMonth]);

  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const formatDate = (date: string) => {
    return format(new Date(date), 'EEEE, MMMM d, yyyy');
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Workouts</h1>
            <p className="text-muted-foreground">View and manage your workout history</p>
          </div>
          
          <Button 
            asChild 
            className="mt-4 sm:mt-0 yellow-gradient"
          >
            <Link to="/workouts/new">
              <Plus className="mr-2 h-4 w-4" />
              New Workout
            </Link>
          </Button>
        </div>

        <div className="flex items-center justify-between">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePreviousMonth}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <h2 className="text-xl font-semibold">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNextMonth}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Card key={i} className="bg-dark-light border-dark-lighter animate-pulse">
                <CardHeader className="pb-2">
                  <div className="w-3/4 h-5 bg-secondary rounded mb-2"></div>
                  <div className="w-1/2 h-4 bg-secondary rounded"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-secondary rounded mr-2"></div>
                      <div className="h-4 bg-secondary rounded w-full"></div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-secondary rounded mr-2"></div>
                      <div className="h-4 bg-secondary rounded w-full"></div>
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="w-full h-9 bg-secondary rounded"></div>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : workouts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workouts.map((workout) => (
              <Card 
                key={workout.id} 
                className="bg-dark-light border-dark-lighter card-hover"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-yellow" />
                      <CardDescription>{workout.dayOfWeek}</CardDescription>
                    </div>
                    <div className="text-xs bg-secondary px-2 py-1 rounded-full">
                      {workout.exercises.length} exercises
                    </div>
                  </div>
                  <CardTitle className="text-lg">{formatDate(workout.date)}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {workout.exercises.slice(0, 3).map((exercise) => (
                      <div key={exercise.exerciseId} className="flex items-center">
                        <Dumbbell className="h-4 w-4 text-muted-foreground mr-2" />
                        <span className="text-sm">
                          {exercise.name || 'Exercise'} - {exercise.sets.length} sets
                        </span>
                      </div>
                    ))}
                    {workout.exercises.length > 3 && (
                      <div className="text-xs text-muted-foreground">
                        +{workout.exercises.length - 3} more exercises
                      </div>
                    )}
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    asChild
                  >
                    <Link to={`/workouts/${workout.id}`}>
                      View Details
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center p-12 bg-dark-light rounded-lg border border-dark-lighter">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground" />
            <h3 className="mt-4 text-lg font-medium">No workouts found</h3>
            <p className="mt-2 text-muted-foreground">
              You don't have any workouts logged for {format(currentMonth, 'MMMM yyyy')}.
            </p>
            <Button
              asChild
              className="mt-4 yellow-gradient"
            >
              <Link to="/workouts/new">
                <Plus className="mr-2 h-4 w-4" />
                Log a Workout
              </Link>
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  );
};

export default Workouts;
