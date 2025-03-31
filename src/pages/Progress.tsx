
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { exerciseAPI, workoutAPI } from '@/services/api';
import { Exercise, VolumeData } from '@/types';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { format, subMonths, eachDayOfInterval, startOfMonth, endOfMonth } from 'date-fns';
import { Calendar, LineChart as LineChartIcon, Dumbbell, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const Progress = () => {
  const { user } = useAuth();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [volumeData, setVolumeData] = useState<VolumeData[]>([]);
  const [monthlyData, setMonthlyData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { data } = await exerciseAPI.getAll();
        setExercises(data);
        
        if (data.length > 0) {
          setSelectedExercise(data[0].id);
        }
      } catch (error) {
        console.error('Error fetching exercises:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, []);

  useEffect(() => {
    const fetchVolumeData = async () => {
      if (!selectedExercise) return;
      
      try {
        setIsLoading(true);
        
        // Fetch last 30 days of data for the line chart
        const today = new Date();
        const thirtyDaysAgo = new Date(today);
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        const dateRange = eachDayOfInterval({
          start: thirtyDaysAgo,
          end: today
        });
        
        const volumePromises = dateRange.map(date => {
          const formattedDate = format(date, 'yyyy-MM-dd');
          return workoutAPI.getVolume(selectedExercise, formattedDate)
            .then(response => ({
              date: formattedDate,
              volume: response.data.volume || 0
            }))
            .catch(() => ({
              date: formattedDate,
              volume: 0
            }));
        });
        
        const results = await Promise.all(volumePromises);
        // Only show days with volume
        const filteredData = results.filter(item => item.volume > 0);
        setVolumeData(filteredData);
        
        // Fetch monthly data for the bar chart
        const last3Months = Array.from({ length: 3 }).map((_, i) => {
          const month = subMonths(new Date(), i);
          return {
            month: format(month, 'MMM yyyy'),
            startDate: format(startOfMonth(month), 'yyyy-MM-dd'),
            endDate: format(endOfMonth(month), 'yyyy-MM-dd')
          };
        });
        
        const monthlyPromises = last3Months.map(async ({ month, startDate, endDate }) => {
          try {
            const { data } = await workoutAPI.getByDateRange(startDate, endDate);
            
            // Calculate total volume for the selected exercise in this month
            let totalVolume = 0;
            for (const workout of data) {
              for (const exercise of workout.exercises) {
                if (exercise.exerciseId === selectedExercise) {
                  totalVolume += exercise.sets.reduce((total, set) => total + (set.weight * set.reps), 0);
                }
              }
            }
            
            return {
              month,
              volume: totalVolume
            };
          } catch (error) {
            return { month, volume: 0 };
          }
        });
        
        const monthlyResults = await Promise.all(monthlyPromises);
        setMonthlyData(monthlyResults.reverse()); // Reverse for chronological order
        
      } catch (error) {
        console.error('Error fetching volume data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchVolumeData();
  }, [selectedExercise]);

  return (
    <AppLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Progress Tracking</h1>
          <p className="text-muted-foreground">Track your performance and progress over time</p>
        </div>

        <Card className="bg-dark-light border-dark-lighter">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <CardTitle>Exercise Progress</CardTitle>
              <div className="w-full md:w-[250px]">
                <Select
                  value={selectedExercise}
                  onValueChange={setSelectedExercise}
                  disabled={exercises.length === 0}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an exercise" />
                  </SelectTrigger>
                  <SelectContent className="bg-dark-light border-dark-lighter max-h-[300px]">
                    {exercises.map(exercise => (
                      <SelectItem key={exercise.id} value={exercise.id}>
                        {exercise.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <CardDescription>Track your volume progress for specific exercises</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-pulse flex flex-col items-center">
                  <LineChartIcon className="h-12 w-12 text-yellow mb-4" />
                  <p>Loading progress data...</p>
                </div>
              </div>
            ) : exercises.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-dark-lighter rounded-md">
                <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">No exercises found in your library</p>
                <CardDescription>
                  Add exercises to your library to track your progress.
                </CardDescription>
              </div>
            ) : (
              <Tabs defaultValue="line">
                <TabsList className="mb-4">
                  <TabsTrigger value="line">
                    <LineChartIcon className="h-4 w-4 mr-2" />
                    Daily Progress
                  </TabsTrigger>
                  <TabsTrigger value="bar">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Monthly Progress
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="line">
                  {volumeData.length > 0 ? (
                    <div className="h-[400px]">
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
                    <div className="flex flex-col items-center justify-center h-[400px] border border-dashed border-dark-lighter rounded-md">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-center text-muted-foreground">
                        No workout data available for this exercise.
                      </p>
                      <CardDescription className="text-center mt-2">
                        Complete workouts with this exercise to track progress.
                      </CardDescription>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="bar">
                  {monthlyData.length > 0 && monthlyData.some(d => d.volume > 0) ? (
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                          <XAxis 
                            dataKey="month" 
                            stroke="#888" 
                          />
                          <YAxis
                            stroke="#888"
                            tickFormatter={(value) => `${value} lbs`}
                          />
                          <Tooltip
                            contentStyle={{ backgroundColor: '#202020', borderColor: '#333' }}
                            formatter={(value) => [`${value} lbs`, 'Total Volume']}
                          />
                          <Legend />
                          <Bar
                            dataKey="volume"
                            name="Total Volume"
                            fill="#FFDC00"
                            radius={[4, 4, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[400px] border border-dashed border-dark-lighter rounded-md">
                      <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
                      <p className="text-center text-muted-foreground">
                        No monthly data available for this exercise.
                      </p>
                      <CardDescription className="text-center mt-2">
                        Complete workouts across different months to see trends.
                      </CardDescription>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>

        <div className="grid gap-6 md:grid-cols-2">
          <Card className="bg-dark-light border-dark-lighter">
            <CardHeader>
              <CardTitle className="flex items-center">
                <LineChartIcon className="h-5 w-5 text-yellow mr-2" />
                Progressive Overload
              </CardTitle>
              <CardDescription>Track your progressive overload metrics</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">What is Progressive Overload?</h3>
                  <p className="mt-1">
                    Progressive overload is the gradual increase of stress placed on the body during exercise training. It's essential for continuous improvement in strength, endurance, and muscle size.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">How We Track It</h3>
                  <p className="mt-1">
                    We calculate volume as <span className="text-yellow font-medium">Weight × Reps × Sets</span>, allowing you to see your progress over time for each exercise.
                  </p>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Ways to Achieve Progressive Overload</h3>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    <li>Increase the weight lifted</li>
                    <li>Increase the number of reps</li>
                    <li>Increase the number of sets</li>
                    <li>Improve exercise form</li>
                    <li>Decrease rest time between sets</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-dark-light border-dark-lighter">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Dumbbell className="h-5 w-5 text-yellow mr-2" />
                Training Stats
              </CardTitle>
              <CardDescription>Your overall training statistics</CardDescription>
            </CardHeader>
            <CardContent>
              {user ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Workouts</p>
                      <div className="mt-1 flex items-baseline">
                        <p className="text-2xl font-semibold">
                          {/* This would need to be fetched from the API */}
                          12
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-secondary rounded-lg">
                      <p className="text-sm text-muted-foreground">Most Trained</p>
                      <div className="mt-1">
                        <p className="text-lg font-semibold">Chest</p>
                        <p className="text-xs text-muted-foreground">5 workouts</p>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Personal Records</h3>
                    <div className="mt-2 space-y-2">
                      <div className="flex justify-between items-center p-2 bg-dark-lighter rounded">
                        <div>
                          <p className="font-medium">Bench Press</p>
                          <p className="text-xs text-muted-foreground">Chest</p>
                        </div>
                        <p className="text-yellow font-semibold">225 lbs × 5</p>
                      </div>
                      
                      <div className="flex justify-between items-center p-2 bg-dark-lighter rounded">
                        <div>
                          <p className="font-medium">Squat</p>
                          <p className="text-xs text-muted-foreground">Legs</p>
                        </div>
                        <p className="text-yellow font-semibold">315 lbs × 3</p>
                      </div>
                      
                      <div className="flex justify-between items-center p-2 bg-dark-lighter rounded">
                        <div>
                          <p className="font-medium">Deadlift</p>
                          <p className="text-xs text-muted-foreground">Back</p>
                        </div>
                        <p className="text-yellow font-semibold">365 lbs × 2</p>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-muted-foreground">
                    Please log in to view your training statistics.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
};

export default Progress;
