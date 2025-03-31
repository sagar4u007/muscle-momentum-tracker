
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { workoutAPI } from '@/services/api';
import { Workout } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  ArrowLeft, 
  Calendar, 
  Copy, 
  Dumbbell, 
  Pencil, 
  Trash2,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';

const WorkoutDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workout, setWorkout] = useState<Workout | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCopyDialogOpen, setIsCopyDialogOpen] = useState(false);
  const [targetDate, setTargetDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  useEffect(() => {
    const fetchWorkoutDetails = async () => {
      try {
        if (!id) return;
        
        const { data } = await workoutAPI.getById(id);
        setWorkout(data);
      } catch (error) {
        console.error('Error fetching workout details:', error);
        toast.error('Failed to load workout details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkoutDetails();
  }, [id]);

  const handleDeleteWorkout = async () => {
    try {
      if (!id) return;
      
      await workoutAPI.delete(id);
      toast.success('Workout deleted successfully');
      navigate('/workouts');
    } catch (error) {
      console.error('Error deleting workout:', error);
      toast.error('Failed to delete workout');
    }
  };

  const handleCopyWorkout = async () => {
    try {
      if (!id) return;
      
      const { data } = await workoutAPI.copyWorkout(id, targetDate);
      toast.success('Workout copied successfully');
      setIsCopyDialogOpen(false);
      navigate(`/workouts/${data.id}`);
    } catch (error) {
      console.error('Error copying workout:', error);
      toast.error('Failed to copy workout');
    }
  };

  // Calculate total volume for the workout
  const calculateWorkoutVolume = () => {
    if (!workout) return 0;
    
    return workout.exercises.reduce((total, exercise) => {
      const exerciseVolume = exercise.sets.reduce((exerciseTotal, set) => {
        return exerciseTotal + (set.weight * set.reps);
      }, 0);
      return total + exerciseVolume;
    }, 0);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <Calendar className="h-12 w-12 text-yellow mb-4" />
            <p>Loading workout details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!workout) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Workout not found</h2>
          <p className="text-muted-foreground mb-6">The workout you're looking for doesn't exist or was removed.</p>
          <Button onClick={() => navigate('/workouts')}>
            Go back to workouts
          </Button>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="mb-6">
        <Button 
          variant="ghost" 
          onClick={() => navigate('/workouts')} 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Workouts
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="bg-yellow p-2 rounded">
                <Calendar className="h-5 w-5 text-dark" />
              </div>
              <h1 className="text-2xl font-bold">
                {format(new Date(workout.date), 'EEEE, MMMM d, yyyy')}
              </h1>
            </div>
            <p className="text-muted-foreground mt-1">
              {workout.exercises.length} {workout.exercises.length === 1 ? 'exercise' : 'exercises'} · 
              {workout.exercises.reduce((total, ex) => total + ex.sets.length, 0)} sets · 
              {calculateWorkoutVolume().toLocaleString()} lbs total volume
            </p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsCopyDialogOpen(true)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Copy
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              asChild
            >
              <Link to={`/workouts/edit/${workout.id}`}>
                <Pencil className="mr-2 h-4 w-4" />
                Edit
              </Link>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="text-destructive hover:text-destructive"
              onClick={() => setIsDeleteDialogOpen(true)}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
      </div>

      <Card className="bg-dark-light border-dark-lighter">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Exercises</CardTitle>
            <div className="bg-secondary px-3 py-1 rounded-full text-sm">
              {workout.dayOfWeek} workout
            </div>
          </div>
          <CardDescription>All exercises performed during this workout</CardDescription>
        </CardHeader>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {workout.exercises.map((exercise, index) => (
              <AccordionItem key={index} value={`item-${index}`} className="border-dark-lighter">
                <AccordionTrigger className="hover:bg-dark-lighter rounded-md px-4 py-2">
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center gap-2">
                      <Dumbbell className="h-4 w-4 text-yellow" />
                      <span>{exercise.name || `Exercise ${index + 1}`}</span>
                    </div>
                    <div className="text-sm text-muted-foreground mr-2">
                      {exercise.sets.length} sets
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pt-2 pb-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-12 gap-2 text-sm font-medium text-muted-foreground">
                      <div className="col-span-2">Set</div>
                      <div className="col-span-5">Weight</div>
                      <div className="col-span-5">Reps</div>
                    </div>
                    <Separator className="bg-dark-lighter" />
                    {exercise.sets.map((set, setIndex) => (
                      <div key={setIndex} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-2 font-medium">{setIndex + 1}</div>
                        <div className="col-span-5">{set.weight} lbs</div>
                        <div className="col-span-5">{set.reps} reps</div>
                      </div>
                    ))}
                    
                    <div className="mt-4 pt-4 border-t border-dark-lighter">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">Total Volume:</span>
                        <span className="font-bold">
                          {exercise.sets.reduce((total, set) => total + (set.weight * set.reps), 0).toLocaleString()} lbs
                        </span>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="bg-dark-light border-dark-lighter">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this workout? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive"
              onClick={handleDeleteWorkout}
            >
              Delete Workout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Copy Workout Dialog */}
      <Dialog open={isCopyDialogOpen} onOpenChange={setIsCopyDialogOpen}>
        <DialogContent className="bg-dark-light border-dark-lighter">
          <DialogHeader>
            <DialogTitle>Copy Workout</DialogTitle>
            <DialogDescription>
              Select a date to copy this workout to.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Label htmlFor="target-date">Target Date</Label>
            <Input
              id="target-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
              className="mt-1"
            />
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsCopyDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              className="yellow-gradient"
              onClick={handleCopyWorkout}
            >
              Copy Workout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default WorkoutDetail;
