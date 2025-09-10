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
import { CalendarDays, User, Heart, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface OnboardingData {
  full_name: string;
  date_of_birth: string;
  gender: string;
  weight_kg: number;
  height_cm: number;
  location: string;
  blood_group: string;
  smoker: boolean;
  alcohol_drinker: boolean;
  chronic_conditions: string[];
  long_term_medications: string[];
  family_history: string[];
}

const CHRONIC_CONDITIONS = [
  'Hypertension', 'Diabetes', 'Asthma', 'Sickle Cell', 'Heart Disease', 
  'Cancer', 'Kidney Disease', 'Liver Disease', 'Thyroid Disorder', 'Other'
];

const FAMILY_HISTORY_CONDITIONS = [
  'Hypertension', 'Diabetes', 'Cancer', 'Heart Disease', 'Stroke',
  'Mental Health Issues', 'Kidney Disease', 'Other'
];

export default function OnboardingFlow({ onComplete }: { onComplete: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<OnboardingData>({
    full_name: '',
    date_of_birth: '',
    gender: '',
    weight_kg: 0,
    height_cm: 0,
    location: '',
    blood_group: '',
    smoker: false,
    alcohol_drinker: false,
    chronic_conditions: [],
    long_term_medications: [],
    family_history: []
  });

  const totalSteps = 4;

  const handleInputChange = (field: keyof OnboardingData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayChange = (field: keyof OnboardingData, item: string, checked: boolean) => {
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
      submitOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const submitOnboarding = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      // Save onboarding data
      const { error: onboardingError } = await supabase
        .from('onboarding')
        .insert({
          user_id: user.id,
          ...data
        });

      if (onboardingError) throw onboardingError;

      // Update profile to mark onboarding as complete
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          onboarding_completed: true,
          full_name: data.full_name,
          height_cm: data.height_cm,
          weight_kg: data.weight_kg
          // BMI is auto-calculated by the database as a generated column
        });

      if (profileError) throw profileError;

      toast({
        title: "Welcome to Curable!",
        description: "Your health profile has been set up successfully.",
      });

      onComplete();
    } catch (error) {
      console.error('Error saving onboarding:', error);
      toast({
        title: "Error",
        description: "Failed to save your information. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <User className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Personal Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={data.full_name}
                  onChange={(e) => handleInputChange('full_name', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="date_of_birth">Date of Birth *</Label>
                <Input
                  id="date_of_birth"
                  type="date"
                  value={data.date_of_birth}
                  onChange={(e) => handleInputChange('date_of_birth', e.target.value)}
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-base font-semibold">Gender *</Label>
                <div className="mt-3 grid grid-cols-3 gap-3">
                  {[
                    { value: 'male', label: 'Male', icon: '👨' },
                    { value: 'female', label: 'Female', icon: '👩' },
                    { value: 'other', label: 'Other', icon: '👤' }
                  ].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => handleInputChange('gender', option.value)}
                      className={`
                        flex flex-col items-center p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] touch-target
                        ${data.gender === option.value 
                          ? 'border-primary bg-primary/10 text-primary shadow-interactive' 
                          : 'border-border bg-card hover:border-accent hover:bg-accent/10'
                        }
                      `}
                    >
                      <span className="text-2xl mb-2">{option.icon}</span>
                      <span className="font-medium">{option.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="location">Location (City/State)</Label>
                <Input
                  id="location"
                  value={data.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="e.g., Lagos, Nigeria"
                  className="mt-1"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Heart className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Physical Health</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="weight_kg">Weight (kg) *</Label>
                <Input
                  id="weight_kg"
                  type="number"
                  value={data.weight_kg || ''}
                  onChange={(e) => handleInputChange('weight_kg', parseFloat(e.target.value))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="height_cm">Height (cm) *</Label>
                <Input
                  id="height_cm"
                  type="number"
                  value={data.height_cm || ''}
                  onChange={(e) => handleInputChange('height_cm', parseFloat(e.target.value))}
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label className="text-base font-semibold">Blood Group (if known)</Label>
              <div className="mt-3 grid grid-cols-4 gap-2">
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => handleInputChange('blood_group', type)}
                    className={`
                      p-3 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] font-semibold touch-target
                      ${data.blood_group === type 
                        ? 'border-primary bg-primary/10 text-primary shadow-interactive' 
                        : 'border-border bg-card hover:border-accent hover:bg-accent/10'
                      }
                    `}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              {[
                { key: 'smoker', label: 'Do you smoke?', icon: '🚭' },
                { key: 'alcohol_drinker', label: 'Do you drink alcohol?', icon: '🍷' }
              ].map((option) => (
                <button
                  key={option.key}
                  type="button"
                  onClick={() => handleInputChange(option.key as keyof OnboardingData, !data[option.key as keyof OnboardingData])}
                  className={`
                    w-full flex items-center gap-4 p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02] touch-target
                    ${data[option.key as keyof OnboardingData] 
                      ? 'border-primary bg-primary/10 text-primary shadow-interactive' 
                      : 'border-border bg-card hover:border-accent hover:bg-accent/10'
                    }
                  `}
                >
                  <span className="text-2xl">{option.icon}</span>
                  <span className="font-medium text-left flex-1">{option.label}</span>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all duration-200 ${
                    data[option.key as keyof OnboardingData] ? 'border-primary bg-primary' : 'border-muted-foreground'
                  }`}>
                    {data[option.key as keyof OnboardingData] && (
                      <div className="w-2 h-2 rounded-full bg-primary-foreground"></div>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <FileText className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Medical History</h2>
            </div>
            
            <div>
              <Label className="text-base font-medium">Do you have any chronic conditions?</Label>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {CHRONIC_CONDITIONS.map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => handleArrayChange('chronic_conditions', condition, !data.chronic_conditions.includes(condition))}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all duration-200 hover:scale-[1.02] touch-target
                      ${data.chronic_conditions.includes(condition) 
                        ? 'border-primary bg-primary/10 text-primary shadow-interactive' 
                        : 'border-border bg-card hover:border-accent hover:bg-accent/10'
                      }
                    `}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      data.chronic_conditions.includes(condition) ? 'border-primary bg-primary' : 'border-muted-foreground'
                    }`}>
                      {data.chronic_conditions.includes(condition) && (
                        <div className="w-2 h-2 rounded-sm bg-primary-foreground"></div>
                      )}
                    </div>
                    <span className="text-sm font-medium">{condition}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="medications">Current long-term medications (if any)</Label>
              <Textarea
                id="medications"
                value={data.long_term_medications.join('\n')}
                onChange={(e) => handleInputChange('long_term_medications', e.target.value.split('\n').filter(x => x.trim()))}
                placeholder="List each medication on a new line"
                className="mt-1"
                rows={4}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <CalendarDays className="h-6 w-6 text-primary" />
              <h2 className="text-xl font-semibold">Family History</h2>
            </div>
            
            <div>
              <Label className="text-base font-medium">Family history of chronic diseases</Label>
              <p className="text-sm text-muted-foreground mt-1 mb-3">
                Select any conditions that run in your family
              </p>
              <div className="grid grid-cols-2 gap-2">
                {FAMILY_HISTORY_CONDITIONS.map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => handleArrayChange('family_history', condition, !data.family_history.includes(condition))}
                    className={`
                      flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all duration-200 hover:scale-[1.02] touch-target
                      ${data.family_history.includes(condition) 
                        ? 'border-primary bg-primary/10 text-primary shadow-interactive' 
                        : 'border-border bg-card hover:border-accent hover:bg-accent/10'
                      }
                    `}
                  >
                    <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all duration-200 ${
                      data.family_history.includes(condition) ? 'border-primary bg-primary' : 'border-muted-foreground'
                    }`}>
                      {data.family_history.includes(condition) && (
                        <div className="w-2 h-2 rounded-sm bg-primary-foreground"></div>
                      )}
                    </div>
                    <span className="text-sm font-medium">{condition}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-lg mx-auto">
        <Card>
          <CardHeader>
            <CardTitle className="text-center">Welcome to Curable</CardTitle>
            <CardDescription className="text-center">
              Let's set up your health profile to personalize your experience
            </CardDescription>
            <div className="flex justify-center space-x-2 mt-4">
              {Array.from({ length: totalSteps }, (_, i) => (
                <div
                  key={i}
                  className={`h-3 w-8 rounded-full transition-all duration-300 ${
                    i + 1 <= currentStep 
                      ? 'bg-gradient-to-r from-primary to-accent shadow-glow' 
                      : 'bg-muted'
                  } ${i + 1 === currentStep ? 'scale-110' : ''}`}
                />
              ))}
            </div>
          </CardHeader>
          
          <CardContent>
            {renderStep()}
            
            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <Button
                  variant="outline"
                  size="lg"
                  onClick={prevStep}
                  disabled={isLoading}
                  className="flex-1"
                >
                  Previous
                </Button>
              )}
              <Button
                variant={currentStep === totalSteps ? "gradient" : "default"}
                size="lg"
                onClick={nextStep}
                disabled={isLoading}
                className={`flex-1 ${currentStep === totalSteps ? 'animate-pulse-glow' : ''}`}
              >
                {currentStep === totalSteps ? '✨ Complete Setup' : 'Next Step'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}