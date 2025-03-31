
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '@/components/layout/AppLayout';
import { exerciseAPI, workoutAPI } from '@/services/api';
import { Exercise, VolumeData } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Dumbbell, Calendar, TrendingUp, Weight } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, subDays } from 'date-fns';
import { toast } from 'sonner';

const ExerciseDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [volumeData, setVolumeData] = useState<VolumeData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExerciseDetails = async () => {
      try {
        if (!id) return;
        
        const { data } = await exerciseAPI.getById(id);
        setExercise(data);
        
        // Fetch volume data for the last 30 days
        const volumePromises = Array.from({ length: 30 }).map((_, index) => {
          const date = format(subDays(new Date(), index), 'yyyy-MM-dd');
          return workoutAPI.getVolume(id, date)
            .then(response => ({
              date,
              volume: response.data.volume || 0
            }))
            .catch(() => ({
              date,
              volume: 0
            }));
        });
        
        const results = await Promise.all(volumePromises);
        // Filter to only show days with volume and reverse for chronological order
        const filteredData = results.filter(item => item.volume > 0).reverse();
        setVolumeData(filteredData);
        
      } catch (error) {
        console.error('Error fetching exercise details:', error);
        toast.error('Failed to load exercise details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExerciseDetails();
  }, [id]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <Dumbbell className="h-12 w-12 text-yellow mb-4" />
            <p>Loading exercise details...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  if (!exercise) {
    return (
      <AppLayout>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold mb-4">Exercise not found</h2>
          <p className="text-muted-foreground mb-6">The exercise you're looking for doesn't exist or was removed.</p>
          <Button onClick={() => navigate('/exercises')}>
            Go back to exercises
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
          onClick={() => navigate('/exercises')} 
          className="mb-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Exercises
        </Button>
        
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <div className="bg-yellow p-2 rounded">
                <Dumbbell className="h-5 w-5 text-dark" />
              </div>
              <h1 className="text-2xl font-bold">{exercise.name}</h1>
            </div>
            <p className="text-muted-foreground mt-1">{exercise.description}</p>
          </div>
          
          <div className="flex flex-wrap gap-2">
            <div className="bg-secondary px-3 py-1 rounded-full text-sm flex items-center">
              <span>{exercise.muscleGroup.replace('_', ' ')}</span>
            </div>
            <div className="bg-secondary px-3 py-1 rounded-full text-sm flex items-center">
              <span>{exercise.requiresWeight ? 'Weighted' : 'Bodyweight'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="bg-dark-light border-dark-lighter">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Progress Over Time</CardTitle>
              <TrendingUp className="h-5 w-5 text-yellow" />
            </div>
            <CardDescription>Track your volume progress for this exercise</CardDescription>
          </CardHeader>
          <CardContent>
            {volumeData.length > 0 ? (
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={volumeData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                    <XAxis 
                      dataKey="date" 
                      stroke="#888" 
                      tickFormatter={(date) => format(new Date(date), 'MMM d')}
                    />
                    <YAxis
                      stroke="#888"
                      tickFormatter={(value) => `${value} lbs`}
                    />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#202020', borderColor: '#333' }}
                      formatter={(value) => [`${value} lbs`, 'Volume']}
                      labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                    />
                    <Line
                      type="monotone"
                      dataKey="volume"
                      stroke="#FFDC00"
                      strokeWidth={2}
                      dot={{ fill: '#FFDC00', r: 4 }}
                      activeDot={{ r: 6, fill: '#FFDC00' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] border border-dashed border-secondary rounded-md">
                <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-center text-muted-foreground">
                  No workout data available for this exercise.
                </p>
                <p className="text-center text-sm text-muted-foreground mt-1">
                  Complete workouts with this exercise to track progress.
                </p>
                <Button 
                  className="mt-4 yellow-gradient"
                  onClick={() => navigate('/workouts/new')}
                >
                  Start a Workout
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-dark-light border-dark-lighter">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Exercise Information</CardTitle>
              <Weight className="h-5 w-5 text-yellow" />
            </div>
            <CardDescription>Key details about this exercise</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                <p className="text-lg">{exercise.name}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Muscle Group</h3>
                <p className="text-lg">{exercise.muscleGroup.replace('_', ' ')}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Type</h3>
                <p className="text-lg">{exercise.requiresWeight ? 'Weighted Exercise' : 'Bodyweight Exercise'}</p>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                <p className="text-lg">{exercise.description}</p>
              </div>
              
              {volumeData.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Last Recorded Volume</h3>
                  <p className="text-lg">
                    {volumeData[volumeData.length - 1].volume.toLocaleString()} lbs on {format(new Date(volumeData[volumeData.length - 1].date), 'MMMM d, yyyy')}
                  </p>
                </div>
              )}
              
              <div className="pt-4">
                <Button 
                  className="w-full yellow-gradient"
                  onClick={() => navigate('/workouts/new', { state: { selectedExercise: exercise } })}
                >
                  <Dumbbell className="mr-2 h-4 w-4" />
                  Add to Workout
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
};

export default ExerciseDetail;
