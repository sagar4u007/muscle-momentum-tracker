
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { exerciseAPI } from '@/services/api';
import { Exercise, MuscleGroup } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dumbbell, Plus, Search } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

// Muscle group color map
const muscleGroupColors: Record<MuscleGroup, string> = {
  CHEST: 'bg-red-500',
  BACK: 'bg-blue-500',
  SHOULDERS: 'bg-green-500',
  ARMS: 'bg-purple-500',
  LEGS: 'bg-orange-500',
  CORE: 'bg-pink-500',
  FULL_BODY: 'bg-indigo-500',
  CARDIO: 'bg-yellow-500',
  OTHER: 'bg-gray-500'
};

// List of all muscle groups
const muscleGroups: MuscleGroup[] = [
  'CHEST', 'BACK', 'SHOULDERS', 'ARMS', 'LEGS', 'CORE', 'FULL_BODY', 'CARDIO', 'OTHER'
];

const Exercises = () => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [filteredExercises, setFilteredExercises] = useState<Exercise[]>([]);
  const [activeTab, setActiveTab] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // New exercise form state
  const [newExercise, setNewExercise] = useState({
    name: '',
    muscleGroup: 'CHEST' as MuscleGroup,
    description: '',
    requiresWeight: true
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const { data } = await exerciseAPI.getAll();
        setExercises(data);
        setFilteredExercises(data);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        toast.error('Failed to load exercises');
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, []);

  useEffect(() => {
    // Filter exercises based on active tab and search query
    let filtered = exercises;
    
    // Filter by muscle group if not ALL
    if (activeTab !== 'ALL') {
      filtered = filtered.filter(ex => ex.muscleGroup === activeTab);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(ex => 
        ex.name.toLowerCase().includes(query) || 
        ex.description.toLowerCase().includes(query)
      );
    }
    
    setFilteredExercises(filtered);
  }, [activeTab, searchQuery, exercises]);

  const handleTabChange = (value: string) => {
    setActiveTab(value);
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewExercise((prev) => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (value: string) => {
    setNewExercise((prev) => ({ ...prev, muscleGroup: value as MuscleGroup }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setNewExercise((prev) => ({ ...prev, requiresWeight: checked }));
  };

  const handleCreateExercise = async () => {
    try {
      await exerciseAPI.create(newExercise);
      
      // Refetch exercises
      const { data } = await exerciseAPI.getAll();
      setExercises(data);
      
      // Reset form
      setNewExercise({
        name: '',
        muscleGroup: 'CHEST',
        description: '',
        requiresWeight: true
      });
      
      setIsDialogOpen(false);
      toast.success('Exercise created successfully');
    } catch (error) {
      console.error('Error creating exercise:', error);
      toast.error('Failed to create exercise');
    }
  };

  const initializeDefaultExercises = async () => {
    try {
      await exerciseAPI.initialize();
      
      // Refetch exercises
      const { data } = await exerciseAPI.getAll();
      setExercises(data);
      
      toast.success('Default exercises initialized successfully');
    } catch (error) {
      console.error('Error initializing exercises:', error);
      toast.error('Failed to initialize default exercises');
    }
  };

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Exercises</h1>
            <p className="text-muted-foreground">Browse and manage your exercise library</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 mt-4 sm:mt-0">
            {exercises.length === 0 && !isLoading && (
              <Button 
                variant="outline" 
                onClick={initializeDefaultExercises}
              >
                Initialize Default Exercises
              </Button>
            )}
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="yellow-gradient">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Exercise
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-dark-light border-dark-lighter">
                <DialogHeader>
                  <DialogTitle>Create New Exercise</DialogTitle>
                  <DialogDescription>
                    Add a new exercise to your collection
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Exercise Name</Label>
                    <Input 
                      id="name" 
                      name="name" 
                      placeholder="Bench Press" 
                      value={newExercise.name}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="muscleGroup">Muscle Group</Label>
                    <Select 
                      value={newExercise.muscleGroup} 
                      onValueChange={handleSelectChange}
                    >
                      <SelectTrigger id="muscleGroup">
                        <SelectValue placeholder="Select muscle group" />
                      </SelectTrigger>
                      <SelectContent className="bg-dark-light border-dark-lighter">
                        {muscleGroups.map((group) => (
                          <SelectItem key={group} value={group}>
                            {group.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      placeholder="Brief description of the exercise"
                      value={newExercise.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="requiresWeight"
                      checked={newExercise.requiresWeight}
                      onCheckedChange={handleSwitchChange}
                    />
                    <Label htmlFor="requiresWeight">Requires Weight</Label>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    className="yellow-gradient"
                    onClick={handleCreateExercise}
                    disabled={!newExercise.name || !newExercise.description}
                  >
                    Create Exercise
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search className="h-4 w-4 text-muted-foreground" />
          </div>
          <Input
            type="search"
            placeholder="Search exercises..."
            className="pl-10"
            value={searchQuery}
            onChange={handleSearch}
          />
        </div>

        <Tabs defaultValue="ALL" onValueChange={handleTabChange}>
          <TabsList className="bg-dark-light w-full overflow-x-auto flex justify-start sm:justify-center whitespace-nowrap">
            <TabsTrigger value="ALL">All</TabsTrigger>
            {muscleGroups.map((group) => (
              <TabsTrigger key={group} value={group}>
                {group.replace('_', ' ')}
              </TabsTrigger>
            ))}
          </TabsList>
          
          <TabsContent value={activeTab} className="mt-6">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="animate-pulse flex justify-center">
                  <Dumbbell className="h-12 w-12 text-yellow" />
                </div>
                <p className="mt-4 text-muted-foreground">Loading exercises...</p>
              </div>
            ) : filteredExercises.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredExercises.map((exercise) => (
                  <Card 
                    key={exercise.id} 
                    className="bg-dark-light border-dark-lighter card-hover cursor-pointer"
                    onClick={() => navigate(`/exercises/${exercise.id}`)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className={`h-3 w-3 rounded-full ${muscleGroupColors[exercise.muscleGroup]}`} />
                          <CardDescription>
                            {exercise.muscleGroup.replace('_', ' ')}
                          </CardDescription>
                        </div>
                        <Dumbbell className="h-4 w-4 text-yellow" />
                      </div>
                      <CardTitle className="text-lg">{exercise.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {exercise.description}
                      </p>
                      <div className="mt-4 flex items-center gap-2">
                        <div className="text-xs px-2 py-1 bg-secondary rounded-full">
                          {exercise.requiresWeight ? 'Weighted' : 'Bodyweight'}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-dark-light rounded-lg border border-dark-lighter">
                <Dumbbell className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No exercises found</h3>
                <p className="mt-1 text-muted-foreground">
                  {activeTab !== 'ALL' 
                    ? `No exercises found for ${activeTab.replace('_', ' ')} muscle group.` 
                    : 'No exercises match your search criteria.'}
                </p>
                <Button
                  className="mt-4 yellow-gradient"
                  onClick={() => setIsDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Exercise
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  );
};

export default Exercises;
