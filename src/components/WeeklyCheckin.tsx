import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Calendar, CheckCircle, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WeeklyData {
  average_sleep_hours: number;
  fruit_vegetable_frequency: string;
  exercise_frequency_per_week: number;
  stress_level: string;
  smoking_drinking_frequency: boolean;
  family_history_updates: string[];
  lifestyle_changes: string;
}

const STRESS_LEVELS = ['Rarely', 'Sometimes', 'Often', 'Always'];
const FRUIT_VEG_FREQUENCY = ['Never', '1-2 times', '3-5 times', 'Daily'];

interface WeeklyCheckinProps {
  onComplete?: () => void;
}

export default function WeeklyCheckin({ onComplete }: WeeklyCheckinProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isCompleted, setIsCompleted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [data, setData] = useState<WeeklyData>({
    average_sleep_hours: 0,
    fruit_vegetable_frequency: '',
    exercise_frequency_per_week: 0,
    stress_level: '',
    smoking_drinking_frequency: false,
    family_history_updates: [],
    lifestyle_changes: ''
  });

  const totalSteps = 3;

  useEffect(() => {
    if (user) {
      checkWeeklyCompletion();
    }
  }, [user]);

  const checkWeeklyCompletion = async () => {
    if (!user) return;

    // Get start of current week (Monday)
    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - daysToMonday);
    weekStart.setHours(0, 0, 0, 0);

    const { data: existingEntry } = await supabase
      .from('weekly_checkins')
      .select('*')
      .eq('user_id', user.id)
      .eq('week_start_date', weekStart.toISOString().split('T')[0])
      .maybeSingle();

    if (existingEntry) {
      setIsCompleted(true);
    }
  };

  const handleInputChange = (field: keyof WeeklyData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof WeeklyData, item: string, checked: boolean) => {
    setData(prev => ({
      ...prev,
      [field]: checked 
        ? [...(prev[field] as string[]), item]
        : (prev[field] as string[]).filter(x => x !== item)
    }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      submitWeeklyCheckin();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitWeeklyCheckin = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const now = new Date();
      const dayOfWeek = now.getDay();
      const daysToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
      const weekStart = new Date(now);
      weekStart.setDate(now.getDate() - daysToMonday);
      weekStart.setHours(0, 0, 0, 0);

      const { error } = await supabase
        .from('weekly_checkins')
        .insert({
          user_id: user.id,
          week_start_date: weekStart.toISOString().split('T')[0],
          ...data
        });

      if (error) throw error;

      setIsCompleted(true);
      toast({
        title: "Weekly check-in completed!",
        description: "Thank you for providing your weekly health insights.",
      });
      
      // Trigger completion callback
      if (onComplete) {
        setTimeout(() => onComplete(), 1000); // Delay for better UX
      }
    } catch (error) {
      console.error('Error saving weekly checkin:', error);
      toast({
        title: "Error",
        description: "Failed to save your weekly check-in. Please try again.",
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
            Weekly Check-in Complete
          </CardTitle>
          <CardDescription>
            You've completed this week's deep health check. See you next week!
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            <Calendar className="h-3 w-3 mr-1" />
            Week of {new Date().toLocaleDateString()}
          </Badge>
        </CardContent>
      </Card>
    );
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Sleep & Activity Patterns</h3>
            </div>

            <div>
              <Label htmlFor="sleep_hours">On average, how many hours do you sleep per night?</Label>
              <Input
                id="sleep_hours"
                type="number"
                step="0.5"
                min="0"
                max="24"
                value={data.average_sleep_hours || ''}
                onChange={(e) => handleInputChange('average_sleep_hours', parseFloat(e.target.value))}
                className="mt-2"
              />
            </div>

            <div>
              <Label>How many times do you exercise per week?</Label>
              <Input
                type="number"
                min="0"
                max="14"
                value={data.exercise_frequency_per_week || ''}
                onChange={(e) => handleInputChange('exercise_frequency_per_week', parseInt(e.target.value))}
                className="mt-2"
              />
            </div>

            <div>
              <Label>How often do you eat fruits/vegetables in a week?</Label>
              <RadioGroup
                value={data.fruit_vegetable_frequency}
                onValueChange={(value) => handleInputChange('fruit_vegetable_frequency', value)}
                className="mt-3"
              >
                {FRUIT_VEG_FREQUENCY.map((freq) => (
                  <div key={freq} className="flex items-center space-x-2">
                    <RadioGroupItem value={freq} id={freq} />
                    <Label htmlFor={freq}>{freq}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Calendar className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Stress & Lifestyle</h3>
            </div>

            <div>
              <Label>Do you often feel stressed?</Label>
              <RadioGroup
                value={data.stress_level}
                onValueChange={(value) => handleInputChange('stress_level', value)}
                className="mt-3"
              >
                {STRESS_LEVELS.map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <RadioGroupItem value={level} id={level} />
                    <Label htmlFor={level}>{level}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="smoking_drinking"
                  checked={data.smoking_drinking_frequency}
                  onCheckedChange={(checked) => handleInputChange('smoking_drinking_frequency', checked)}
                />
                <Label htmlFor="smoking_drinking">
                  Do you smoke or drink more than once a week?
                </Label>
              </div>
            </div>

            <div>
              <Label htmlFor="lifestyle_changes">
                Any significant lifestyle changes this week?
              </Label>
              <Textarea
                id="lifestyle_changes"
                value={data.lifestyle_changes}
                onChange={(e) => handleInputChange('lifestyle_changes', e.target.value)}
                placeholder="e.g., Started new medication, changed diet, increased exercise..."
                className="mt-2"
                rows={3}
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Family Health Updates</h3>
            </div>

            <div>
              <Label>Any new family health developments to report?</Label>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Select if any family members have been diagnosed with new conditions
              </p>
              <div className="space-y-2">
                {['Hypertension', 'Diabetes', 'Cancer', 'Heart Disease', 'Stroke', 'Mental Health Issues'].map((condition) => (
                  <div key={condition} className="flex items-center space-x-2">
                    <Checkbox
                      id={`family_${condition}`}
                      checked={data.family_history_updates.includes(condition)}
                      onCheckedChange={(checked) => handleArrayChange('family_history_updates', condition, !!checked)}
                    />
                    <Label htmlFor={`family_${condition}`} className="text-sm">{condition}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Review Your Responses</h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p>Sleep: {data.average_sleep_hours} hours/night</p>
                <p>Exercise: {data.exercise_frequency_per_week} times/week</p>
                <p>Fruits/Vegetables: {data.fruit_vegetable_frequency}</p>
                <p>Stress Level: {data.stress_level}</p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Weekly Health Deep-Check</span>
          <Badge variant="outline">
            {currentStep} of {totalSteps}
          </Badge>
        </CardTitle>
        <CardDescription>
          Let's review your health patterns from this week
        </CardDescription>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
            style={{ width: `${(currentStep / totalSteps) * 100}%` }}
          />
        </div>
      </CardHeader>
      
      <CardContent>
        {renderStep()}
        
        <div className="flex gap-3 mt-8">
          {currentStep > 1 && (
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={isLoading}
              className="flex-1"
            >
              Previous
            </Button>
          )}
          <Button
            onClick={nextStep}
            disabled={isLoading}
            className="flex-1"
          >
            {currentStep === totalSteps ? 'Complete Check-in' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}