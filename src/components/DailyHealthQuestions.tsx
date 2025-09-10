import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, SkipForward } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface DailyQuestion {
  id: string;
  question: string;
  type: 'radio' | 'number' | 'text' | 'boolean';
  options?: string[];
  field: string;
}

// Updated to match Curable spec - rotating daily questions
const DAILY_QUESTIONS_POOL: DailyQuestion[] = [
  // Sleep Category
  {
    id: 'sleep_hours',
    question: 'How many hours did you sleep last night?',
    type: 'number',
    field: 'sleep_hours'
  },
  {
    id: 'sleep_quality',
    question: 'How refreshed do you feel today?',
    type: 'radio',
    options: ['Very refreshed (5)', 'Refreshed (4)', 'Neutral (3)', 'Tired (2)', 'Exhausted (1)'],
    field: 'mood'
  },
  
  // Energy & Mood Category
  {
    id: 'energy_level',
    question: 'How is your energy level today?',
    type: 'radio',
    options: ['Very high (5)', 'High (4)', 'Moderate (3)', 'Low (2)', 'Very low (1)'],
    field: 'mood'
  },
  {
    id: 'mood',
    question: 'How is your mood today?',
    type: 'radio',
    options: ['Happy', 'Neutral', 'Sad', 'Stressed', 'Angry'],
    field: 'mood'
  },
  
  // Nutrition & Hydration Category
  {
    id: 'meals',
    question: 'Did you eat at least 2 proper meals yesterday?',
    type: 'radio',
    options: ['Yes', 'No'],
    field: 'appetite'
  },
  {
    id: 'water',
    question: 'How many cups of water did you drink yesterday?',
    type: 'number',
    field: 'water_intake_cups'
  },
  
  // Activity & Movement Category
  {
    id: 'exercise',
    question: 'Did you do any physical activity today?',
    type: 'radio',
    options: ['No', 'Walking', 'Running', 'Sports', 'Gym', 'Other'],
    field: 'exercise_intensity'
  },
  
  // Symptoms & Body Signals Category
  {
    id: 'pain',
    question: 'Are you experiencing any pain today?',
    type: 'text',
    field: 'pain_location'
  },
  {
    id: 'symptoms',
    question: 'Any unusual symptoms today? (Cough, Fever, Headache, Stomach ache, Other)',
    type: 'text',
    field: 'new_symptoms'
  },
  
  // Medication Adherence Category
  {
    id: 'medications_taken',
    question: 'Did you take your prescribed medication today?',
    type: 'radio',
    options: ['Yes', 'No', 'Not applicable'],
    field: 'medications_taken'
  },
  {
    id: 'medication_side_effects',
    question: 'Any side effects noticed from medications?',
    type: 'text',
    field: 'new_symptoms'
  }
];

interface DailyHealthQuestionsProps {
  onComplete?: () => void;
}

export default function DailyHealthQuestions({ onComplete }: DailyHealthQuestionsProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [todaysQuestions, setTodaysQuestions] = useState<DailyQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      checkTodaysQuestions();
    }
  }, [user]);

  const checkTodaysQuestions = async () => {
    if (!user) return;

    const today = new Date().toISOString().split('T')[0];
    
    // Check if user already answered questions today
    const { data: existingEntry } = await supabase
      .from('daily_questions')
      .select('*')
      .eq('user_id', user.id)
      .eq('date', today)
      .single();

    if (existingEntry) {
      setIsCompleted(true);
      return;
    }

    // Get 2-3 random questions for today
    const shuffled = [...DAILY_QUESTIONS_POOL].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 3);
    setTodaysQuestions(selected);
  };

  const handleAnswer = (questionField: string, value: any) => {
    setAnswers(prev => ({ ...prev, [questionField]: value }));
  };

  const nextQuestion = () => {
    if (currentQuestionIndex < todaysQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    } else {
      submitAnswers();
    }
  };

  const skipQuestion = () => {
    nextQuestion();
  };

  const submitAnswers = async () => {
    if (!user) return;

    setIsLoading(true);
    const today = new Date().toISOString().split('T')[0];

    try {
      // Save to daily_questions table
      await supabase
        .from('daily_questions')
        .insert({
          user_id: user.id,
          date: today,
          questions_shown: todaysQuestions.map(q => q.id),
          questions_answered: answers
        });

      // Also save to health_tracking table
      const trackingData: any = {
        user_id: user.id,
        date: today
      };

      // Map answers to health_tracking fields
      Object.entries(answers).forEach(([field, value]) => {
        if (field === 'exercise_done') {
          trackingData.exercise_done = value !== 'No';
          if (value !== 'No') {
            trackingData.exercise_intensity = value.toLowerCase();
          }
        } else if (field === 'new_symptoms') {
          trackingData.new_symptoms = value ? [value] : [];
        } else if (field === 'pain_location') {
          trackingData.pain_experienced = !!value;
          if (value) trackingData.pain_location = value;
        } else if (field === 'medications_taken') {
          trackingData.medications_taken = value === 'Yes';
        } else {
          trackingData[field] = typeof value === 'string' ? value.toLowerCase() : value;
        }
      });

      await supabase
        .from('health_tracking')
        .insert(trackingData);

      setIsCompleted(true);
      toast({
        title: "Health questions completed!",
        description: "Thank you for tracking your daily health data.",
      });
      
      // Trigger completion callback
      if (onComplete) {
        setTimeout(() => onComplete(), 1000); // Delay for better UX
      }
    } catch (error) {
      console.error('Error saving answers:', error);
      toast({
        title: "Error",
        description: "Failed to save your answers. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  if (isCompleted) {
    return (
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-primary">
            <CheckCircle className="h-5 w-5" />
            Daily Health Check Complete
          </CardTitle>
          <CardDescription>
            You've completed today's health questions. Check back tomorrow for new questions!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date().toLocaleDateString()}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  if (todaysQuestions.length === 0) {
    return null;
  }

  const currentQuestion = todaysQuestions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / todaysQuestions.length) * 100;

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-primary">Daily Health Check</CardTitle>
          <Badge variant="outline">
            {currentQuestionIndex + 1} of {todaysQuestions.length}
          </Badge>
        </div>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${progress}%` }}
          />
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
          
          {currentQuestion.type === 'radio' && currentQuestion.options && (
            <ToggleGroup
              type="single"
              value={answers[currentQuestion.field] || ''}
              onValueChange={(value) => value && handleAnswer(currentQuestion.field, value)}
              className="grid grid-cols-1 gap-3"
            >
              {currentQuestion.options.map((option) => (
                <ToggleGroupItem
                  key={option}
                  value={option}
                  className="h-16 w-full justify-start text-left font-medium transition-all hover:scale-105 border-2 border-border/20 bg-card/50 backdrop-blur-sm hover:bg-card/80 hover:border-primary/40 hover:shadow-xl data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:ring-2 data-[state=on]:ring-primary"
                >
                  <span className="text-base">{option}</span>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
          )}
          
          {currentQuestion.type === 'number' && (
            <Input
              type="number"
              placeholder="Enter number"
              value={answers[currentQuestion.field] || ''}
              onChange={(e) => handleAnswer(currentQuestion.field, parseInt(e.target.value) || 0)}
            />
          )}
          
          {currentQuestion.type === 'text' && (
            <Textarea
              placeholder="Describe here..."
              value={answers[currentQuestion.field] || ''}
              onChange={(e) => handleAnswer(currentQuestion.field, e.target.value)}
            />
          )}
        </div>

        <div className="flex gap-3">
          <Button 
            onClick={nextQuestion}
            disabled={isLoading}
            className="flex-1"
          >
            {currentQuestionIndex === todaysQuestions.length - 1 ? 'Complete' : 'Next'}
          </Button>
          <Button 
            variant="outline" 
            onClick={skipQuestion}
            disabled={isLoading}
          >
            <SkipForward className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}