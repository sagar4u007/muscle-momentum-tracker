
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exerciseAPI, workoutAPI } from '@/services/api';
import { Exercise, WorkoutExercise, DayOfWeek, Workout } from '@/types';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  Save, 
  Dumbbell, 
  Search,
  ChevronDown,
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

interface ExerciseInputProps {
  exercises: Exercise[];
  exerciseData: WorkoutExercise;
  onUpdate: (exerciseData: WorkoutExercise) => void;
  onRemove: () => void;
  index: number;
}

const ExerciseInput: React.FC<ExerciseInputProps> = ({ 
  exercises, 
  exerciseData, 
  onUpdate, 
  onRemove,
  index
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleExerciseChange = (value: string) => {
    onUpdate({
      ...exerciseData,
      exerciseId: value
    });
  };

  const handleAddSet = () => {
    onUpdate({
      ...exerciseData,
      sets: [...exerciseData.sets, { reps: 8, weight: 0 }]
    });
  };

  const handleRemoveSet = (index: number) => {
    const newSets = [...exerciseData.sets];
    newSets.splice(index, 1);
    onUpdate({
      ...exerciseData,
      sets: newSets
    });
  };

  const handleSetChange = (index: number, field: 'reps' | 'weight', value: number) => {
    const newSets = [...exerciseData.sets];
    newSets[index] = {
      ...newSets[index],
      [field]: value
    };
    onUpdate({
      ...exerciseData,
      sets: newSets
    });
  };

  const selectedExercise = exercises.find(ex => ex.id === exerciseData.exerciseId);

  return (
    <Card className="bg-dark-light border-dark-lighter mb-4">
      <CardHeader className="pb-2">
        <div 
          className="flex items-center justify-between cursor-pointer"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center gap-2">
            <Dumbbell className="h-5 w-5 text-yellow" />
            <CardTitle className="text-lg">Exercise {index + 1}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8"
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
            {isExpanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </div>
        </div>
        {selectedExercise && !isExpanded && (
          <CardDescription>
            {selectedExercise.name} - {exerciseData.sets.length} sets
          </CardDescription>
        )}
      </CardHeader>
      
      {isExpanded && (
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor={`exercise-${index}`}>Select Exercise</Label>
              <Select 
                value={exerciseData.exerciseId} 
                onValueChange={handleExerciseChange}
              >
                <SelectTrigger id={`exercise-${index}`}>
                  <SelectValue placeholder="Select an exercise" />
                </SelectTrigger>
                <SelectContent className="bg-dark-light border-dark-lighter max-h-[300px]">
                  {exercises.map(exercise => (
                    <SelectItem key={exercise.id} value={exercise.id}>
                      {exercise.name} ({exercise.muscleGroup.replace('_', ' ')})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedExercise && (
              <>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <Label>Sets</Label>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={handleAddSet}
                      className="h-8"
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Add Set
                    </Button>
                  </div>
                  
                  {exerciseData.sets.length > 0 ? (
                    <div>
                      <div className="grid grid-cols-12 gap-2 mb-2 text-xs text-muted-foreground">
                        <div className="col-span-2">Set</div>
                        <div className="col-span-4">Weight (lbs)</div>
                        <div className="col-span-4">Reps</div>
                        <div className="col-span-2"></div>
                      </div>
                      
                      {exerciseData.sets.map((set, setIndex) => (
                        <div key={setIndex} className="grid grid-cols-12 gap-2 mb-2 items-center">
                          <div className="col-span-2 font-medium">{setIndex + 1}</div>
                          <div className="col-span-4">
                            <Input
                              type="number"
                              min={0}
                              value={set.weight}
                              onChange={(e) => handleSetChange(setIndex, 'weight', Number(e.target.value))}
                              className="h-9"
                            />
                          </div>
                          <div className="col-span-4">
                            <Input
                              type="number"
                              min={1}
                              value={set.reps}
                              onChange={(e) => handleSetChange(setIndex, 'reps', Number(e.target.value))}
                              className="h-9"
                            />
                          </div>
                          <div className="col-span-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              onClick={() => handleRemoveSet(setIndex)}
                              className="h-9 w-9"
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-4 border border-dashed border-dark-lighter rounded-md">
                      <p className="text-muted-foreground mb-2">No sets added yet</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={handleAddSet}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Set
                      </Button>
                    </div>
                  )}
                </div>
                
                {exerciseData.sets.length > 0 && (
                  <div className="pt-2 border-t border-dark-lighter">
                    <div className="flex justify-between">
                      <span className="text-sm text-muted-foreground">Total Volume:</span>
                      <span className="font-medium">
                        {exerciseData.sets.reduce((total, set) => total + (set.weight * set.reps), 0).toLocaleString()} lbs
                      </span>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

const NewWorkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [workoutData, setWorkoutData] = useState<Workout>({
    date: format(new Date(), 'yyyy-MM-dd'),
    dayOfWeek: format(new Date(), 'EEEE').toUpperCase() as DayOfWeek,
    exercises: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { data } = await exerciseAPI.getAll();
        setExercises(data);
        
        // Check if we have a selected exercise from navigation
        const selectedExercise = location.state?.selectedExercise as Exercise;
        if (selectedExercise) {
          setWorkoutData(prev => ({
            ...prev,
            exercises: [
              ...prev.exercises,
              {
                exerciseId: selectedExercise.id,
                sets: [{ reps: 8, weight: 0 }]
              }
            ]
          }));
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
        toast.error('Failed to load exercises');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, [location.state]);

  // Update dayOfWeek whenever date changes
  useEffect(() => {
    const date = new Date(workoutData.date);
    const newDayOfWeek = format(date, 'EEEE').toUpperCase() as DayOfWeek;
    
    setWorkoutData(prev => ({
      ...prev,
      dayOfWeek: newDayOfWeek
    }));
  }, [workoutData.date]);

  const handleAddExercise = () => {
    setWorkoutData(prev => ({
      ...prev,
      exercises: [
        ...prev.exercises,
        {
          exerciseId: '',
          sets: [{ reps: 8, weight: 0 }]
        }
      ]
    }));
  };

  const handleRemoveExercise = (index: number) => {
    const newExercises = [...workoutData.exercises];
    newExercises.splice(index, 1);
    setWorkoutData(prev => ({
      ...prev,
      exercises: newExercises
    }));
  };

  const handleExerciseUpdate = (index: number, exerciseData: WorkoutExercise) => {
    const newExercises = [...workoutData.exercises];
    newExercises[index] = exerciseData;
    setWorkoutData(prev => ({
      ...prev,
      exercises: newExercises
    }));
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setWorkoutData(prev => ({
      ...prev,
      date: e.target.value
    }));
  };

  const isWorkoutValid = () => {
    if (!workoutData.date) return false;
    if (workoutData.exercises.length === 0) return false;
    
    for (const exercise of workoutData.exercises) {
      if (!exercise.exerciseId) return false;
      if (exercise.sets.length === 0) return false;
      
      for (const set of exercise.sets) {
        if (set.reps <= 0) return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!isWorkoutValid()) {
      toast.error('Please fill in all required fields');
      return;
    }
    
    try {
      setIsSaving(true);
      const { data } = await workoutAPI.create(workoutData);
      toast.success('Workout saved successfully');
      navigate(`/workouts/${data.id}`);
    } catch (error) {
      console.error('Error saving workout:', error);
      toast.error('Failed to save workout');
    } finally {
      setIsSaving(false);
    }
  };

  const filteredExercises = searchQuery 
    ? exercises.filter(ex => 
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.muscleGroup.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.description.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : exercises;

  // Calculate total volume
  const totalVolume = workoutData.exercises.reduce((total, exercise) => {
    return total + exercise.sets.reduce((setTotal, set) => setTotal + (set.weight * set.reps), 0);
  }, 0);

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
            <h1 className="text-2xl font-bold tracking-tight">New Workout</h1>
            <p className="text-muted-foreground">Log your workout details</p>
          </div>
          
          <Button 
            className="yellow-gradient"
            onClick={handleSubmit}
            disabled={isSaving || !isWorkoutValid()}
          >
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Saving...' : 'Save Workout'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card className="bg-dark-light border-dark-lighter">
            <CardHeader>
              <CardTitle>Workout Details</CardTitle>
              <CardDescription>Enter the date and add exercises to your workout</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="date">Workout Date</Label>
                  <Input
                    id="date"
                    type="date"
                    value={workoutData.date}
                    onChange={handleDateChange}
                  />
                </div>

                <Separator className="bg-dark-lighter" />
                
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <Label>Exercises</Label>
                    <div className="flex items-center gap-2">
                      <div className="relative w-[200px]">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                          placeholder="Search exercises..."
                          className="pl-8"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      <Button 
                        onClick={handleAddExercise}
                        className="yellow-gradient"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Exercise
                      </Button>
                    </div>
                  </div>
                  
                  {workoutData.exercises.length === 0 ? (
                    <div className="text-center py-12 border border-dashed border-dark-lighter rounded-md">
                      <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-muted-foreground mb-4">No exercises added yet</p>
                      <Button 
                        onClick={handleAddExercise}
                        className="yellow-gradient"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Add Exercise
                      </Button>
                    </div>
                  ) : (
                    <div>
                      {workoutData.exercises.map((exercise, index) => (
                        <ExerciseInput
                          key={index}
                          index={index}
                          exercises={filteredExercises}
                          exerciseData={exercise}
                          onUpdate={(updated) => handleExerciseUpdate(index, updated)}
                          onRemove={() => handleRemoveExercise(index)}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="space-y-6">
          <Card className="bg-dark-light border-dark-lighter sticky top-4">
            <CardHeader>
              <CardTitle>Workout Summary</CardTitle>
              <CardDescription>Overview of your workout</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                  <p className="text-lg">
                    {workoutData.date ? format(new Date(workoutData.date), 'EEEE, MMMM d, yyyy') : 'Not set'}
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Exercises</h3>
                  <p className="text-lg">{workoutData.exercises.length} exercises</p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Sets</h3>
                  <p className="text-lg">
                    {workoutData.exercises.reduce((total, ex) => total + ex.sets.length, 0)} sets
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Total Volume</h3>
                  <p className="text-lg">{totalVolume.toLocaleString()} lbs</p>
                </div>
                
                <Separator className="bg-dark-lighter" />
                
                {!isWorkoutValid() && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Unable to save</AlertTitle>
                    <AlertDescription>
                      Please add at least one exercise with sets and reps to save your workout.
                    </AlertDescription>
                  </Alert>
                )}
                
                <Button 
                  className="w-full yellow-gradient"
                  onClick={handleSubmit}
                  disabled={isSaving || !isWorkoutValid()}
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save Workout'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default NewWorkout;
