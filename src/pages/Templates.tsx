
import { useState, useEffect } from 'react';
import AppLayout from '@/components/layout/AppLayout';
import { templateAPI } from '@/services/api';
import { Template } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BookTemplate, 
  Plus, 
  Copy, 
  Calendar,
  ChevronDown, 
  ChevronUp,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useNavigate } from 'react-router-dom';

const Templates = () => {
  const [systemTemplates, setSystemTemplates] = useState<Template[]>([]);
  const [customTemplates, setCustomTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [targetDate, setTargetDate] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        const [systemResponse, customResponse] = await Promise.all([
          templateAPI.getSystemTemplates(),
          templateAPI.getCustomTemplates()
        ]);
        
        setSystemTemplates(systemResponse.data);
        setCustomTemplates(customResponse.data);
      } catch (error) {
        console.error('Error fetching templates:', error);
        toast.error('Failed to load templates');
      } finally {
        setIsLoading(false);
      }
    };

    fetchTemplates();
    
    // Set target date to today
    setTargetDate(new Date().toISOString().split('T')[0]);
  }, []);

  const handleCopyTemplate = async (template: Template) => {
    try {
      if (!template.id) return;
      
      await templateAPI.copyTemplate(template.id);
      
      // Refresh custom templates
      const { data } = await templateAPI.getCustomTemplates();
      setCustomTemplates(data);
      
      toast.success('Template copied to your collection');
    } catch (error) {
      console.error('Error copying template:', error);
      toast.error('Failed to copy template');
    }
  };

  const handleUseTemplate = (template: Template) => {
    setSelectedTemplate(template);
    setIsDialogOpen(true);
  };

  const handleCreateWorkoutFromTemplate = async () => {
    if (!selectedTemplate || !targetDate) return;
    
    try {
      // Create a workout from the template
      const workoutData = {
        date: targetDate,
        dayOfWeek: new Date(targetDate).toLocaleString('en-US', { weekday: 'long' }).toUpperCase(),
        exercises: selectedTemplate.days[0].exercises.map(templateExercise => ({
          exerciseId: '', // This would need to be matched with actual exercises
          sets: Array.from({ length: templateExercise.recommendedSets }).map(() => ({
            reps: parseInt(templateExercise.recommendedRepsRange.split('-')[0]),
            weight: 0
          }))
        }))
      };
      
      // In a real implementation, you would match the template exercises with actual exercise IDs
      // For now, navigate to the new workout page
      navigate('/workouts/new');
      toast.success('Template applied - customize your workout');
      
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error creating workout from template:', error);
      toast.error('Failed to create workout from template');
    }
  };

  const TemplateCard = ({ template, isSystemTemplate = false }: { template: Template, isSystemTemplate?: boolean }) => (
    <Card className="bg-dark-light border-dark-lighter card-hover">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{template.name}</CardTitle>
          <BookTemplate className="h-5 w-5 text-yellow" />
        </div>
        <CardDescription>{template.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {template.days.map((day, index) => (
            <AccordionItem key={index} value={`day-${index}`} className="border-dark-lighter">
              <AccordionTrigger className="hover:bg-dark-lighter rounded-md py-2">
                {day.name}
              </AccordionTrigger>
              <AccordionContent>
                <div className="space-y-2 pl-2">
                  {day.exercises.map((exercise, exIndex) => (
                    <div key={exIndex} className="p-2 bg-dark-lighter rounded-md">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{exercise.name}</p>
                          <p className="text-xs text-muted-foreground">{exercise.muscleGroup.replace('_', ' ')}</p>
                        </div>
                        <div className="text-xs bg-secondary px-2 py-1 rounded-full">
                          {exercise.recommendedSets} × {exercise.recommendedRepsRange}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{exercise.description}</p>
                    </div>
                  ))}
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
      <CardFooter className="flex gap-2">
        <Button 
          variant="outline" 
          className="flex-1"
          onClick={() => handleUseTemplate(template)}
        >
          <Calendar className="mr-2 h-4 w-4" />
          Use Template
        </Button>
        
        {isSystemTemplate && (
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => handleCopyTemplate(template)}
          >
            <Copy className="mr-2 h-4 w-4" />
            Copy to My Templates
          </Button>
        )}
      </CardFooter>
    </Card>
  );

  return (
    <AppLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Workout Templates</h1>
            <p className="text-muted-foreground">Browse and manage workout templates</p>
          </div>
          
          <Button 
            asChild 
            className="mt-4 sm:mt-0 yellow-gradient"
          >
            <div onClick={() => navigate('/templates/new')}>
              <Plus className="mr-2 h-4 w-4" />
              Create Template
            </div>
          </Button>
        </div>

        <Tabs defaultValue="system">
          <TabsList>
            <TabsTrigger value="system">System Templates</TabsTrigger>
            <TabsTrigger value="custom">My Templates</TabsTrigger>
          </TabsList>
          
          <TabsContent value="system" className="mt-6">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="bg-dark-light border-dark-lighter animate-pulse">
                    <CardHeader>
                      <div className="w-3/4 h-5 bg-secondary rounded mb-2"></div>
                      <div className="w-full h-4 bg-secondary rounded"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 bg-secondary rounded w-full"></div>
                        <div className="h-4 bg-secondary rounded w-full"></div>
                        <div className="h-4 bg-secondary rounded w-3/4"></div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="w-full h-9 bg-secondary rounded"></div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : systemTemplates.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {systemTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} isSystemTemplate />
                ))}
              </div>
            ) : (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>No system templates available</AlertTitle>
                <AlertDescription>
                  System templates are not available at the moment.
                </AlertDescription>
              </Alert>
            )}
          </TabsContent>
          
          <TabsContent value="custom" className="mt-6">
            {isLoading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {[1, 2].map((i) => (
                  <Card key={i} className="bg-dark-light border-dark-lighter animate-pulse">
                    <CardHeader>
                      <div className="w-3/4 h-5 bg-secondary rounded mb-2"></div>
                      <div className="w-full h-4 bg-secondary rounded"></div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        <div className="h-4 bg-secondary rounded w-full"></div>
                        <div className="h-4 bg-secondary rounded w-full"></div>
                        <div className="h-4 bg-secondary rounded w-3/4"></div>
                      </div>
                    </CardContent>
                    <CardFooter>
                      <div className="w-full h-9 bg-secondary rounded"></div>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : customTemplates.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {customTemplates.map((template) => (
                  <TemplateCard key={template.id} template={template} />
                ))}
              </div>
            ) : (
              <div className="text-center p-12 bg-dark-light rounded-lg border border-dark-lighter">
                <BookTemplate className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">No custom templates</h3>
                <p className="mt-2 text-muted-foreground">
                  You haven't created any custom workout templates yet.
                </p>
                <div className="mt-4 flex flex-col sm:flex-row gap-4 justify-center">
                  <Button
                    className="yellow-gradient"
                    onClick={() => navigate('/templates/new')}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Create Template
                  </Button>
                  {systemTemplates.length > 0 && (
                    <Button
                      variant="outline"
                      onClick={() => handleCopyTemplate(systemTemplates[0])}
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy a System Template
                    </Button>
                  )}
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Dialog for using a template */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-dark-light border-dark-lighter">
          <DialogHeader>
            <DialogTitle>Use Template</DialogTitle>
            <DialogDescription>
              Create a new workout based on this template.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="mb-4">
              <h3 className="font-medium mb-1">{selectedTemplate?.name}</h3>
              <p className="text-sm text-muted-foreground">{selectedTemplate?.description}</p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="workout-date">Workout Date</Label>
              <Input
                id="workout-date"
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
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
              onClick={handleCreateWorkoutFromTemplate}
            >
              Create Workout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
};

export default Templates;
