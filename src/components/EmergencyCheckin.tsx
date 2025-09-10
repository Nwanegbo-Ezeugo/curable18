import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Phone, Clock, Pill } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface EmergencyData {
  symptom_description: string;
  severity_level: string;
  symptom_start_time: string;
  getting_worse: boolean | null;
  medication_taken: string;
  wants_doctor_connection: boolean | null;
}

const SEVERITY_LEVELS = [
  { value: 'mild', label: 'Mild', color: 'text-green-600' },
  { value: 'moderate', label: 'Moderate', color: 'text-yellow-600' },
  { value: 'severe', label: 'Severe', color: 'text-red-600' }
];

export default function EmergencyCheckin({ onSubmit }: { onSubmit?: () => void }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<EmergencyData>({
    symptom_description: '',
    severity_level: '',
    symptom_start_time: '',
    getting_worse: null,
    medication_taken: '',
    wants_doctor_connection: null
  });

  const totalSteps = 4;

  const handleInputChange = (field: keyof EmergencyData, value: any) => {
    setData(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      submitEmergencyCheckin();
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const calculateUrgencyScore = (): number => {
    let score = 1;
    
    // Severity weight
    if (data.severity_level === 'severe') score += 6;
    else if (data.severity_level === 'moderate') score += 3;
    else score += 1;
    
    // Getting worse adds urgency
    if (data.getting_worse) score += 2;
    
    // Recent onset adds urgency
    if (data.symptom_start_time) {
      const startTime = new Date(data.symptom_start_time);
      const hoursAgo = (Date.now() - startTime.getTime()) / (1000 * 60 * 60);
      if (hoursAgo < 6) score += 1;
    }
    
    return Math.min(score, 10);
  };

  const submitEmergencyCheckin = async () => {
    if (!user) return;

    setIsLoading(true);
    try {
      const urgencyScore = calculateUrgencyScore();
      
      // Mock AI assessment based on severity and symptoms
      let aiAssessment = '';
      if (data.severity_level === 'severe') {
        aiAssessment = 'URGENT: Severe symptoms detected. Recommend immediate medical attention.';
      } else if (data.severity_level === 'moderate') {
        aiAssessment = 'MODERATE: Symptoms warrant medical consultation within 24 hours.';
      } else {
        aiAssessment = 'MILD: Monitor symptoms. Consider telemedicine consultation if symptoms persist.';
      }

      const { error } = await supabase
        .from('emergency_checkins')
        .insert({
          user_id: user.id,
          symptom_description: data.symptom_description,
          severity_level: data.severity_level,
          symptom_start_time: data.symptom_start_time,
          getting_worse: data.getting_worse,
          medication_taken: data.medication_taken,
          wants_doctor_connection: data.wants_doctor_connection,
          ai_assessment: aiAssessment,
          urgency_score: urgencyScore
        });

      if (error) throw error;

      toast({
        title: "Emergency assessment submitted",
        description: urgencyScore >= 7 
          ? "High urgency detected. Please seek immediate medical attention." 
          : "Assessment recorded. Monitor your symptoms closely.",
        variant: urgencyScore >= 7 ? "destructive" : "default"
      });

      onSubmit?.();
    } catch (error) {
      console.error('Error saving emergency checkin:', error);
      toast({
        title: "Error",
        description: "Failed to submit emergency assessment. Please try again.",
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
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                If this is a life-threatening emergency, call emergency services immediately.
              </AlertDescription>
            </Alert>

            <div>
              <Label htmlFor="symptoms">Describe your symptoms in detail *</Label>
              <Textarea
                id="symptoms"
                value={data.symptom_description}
                onChange={(e) => handleInputChange('symptom_description', e.target.value)}
                placeholder="e.g., Severe chest pain, difficulty breathing, high fever..."
                className="mt-2"
                rows={4}
              />
            </div>

            <div>
              <Label>How severe are your symptoms? *</Label>
              <ToggleGroup
                type="single"
                value={data.severity_level}
                onValueChange={(value) => value && handleInputChange('severity_level', value)}
                className="mt-3 grid grid-cols-1 gap-3"
              >
                {SEVERITY_LEVELS.map((level) => (
                  <ToggleGroupItem
                    key={level.value}
                    value={level.value}
                    className={`h-16 w-full justify-start text-left font-medium transition-all hover:scale-105 data-[state=on]:ring-2 data-[state=on]:ring-primary ${
                      level.value === 'mild' ? 'border-green-200 bg-green-50 hover:bg-green-100 data-[state=on]:bg-green-100 data-[state=on]:text-green-800' :
                      level.value === 'moderate' ? 'border-yellow-200 bg-yellow-50 hover:bg-yellow-100 data-[state=on]:bg-yellow-100 data-[state=on]:text-yellow-800' :
                      'border-red-200 bg-red-50 hover:bg-red-100 data-[state=on]:bg-red-100 data-[state=on]:text-red-800'
                    }`}
                  >
                    <div className="flex flex-col items-start">
                      <span className="text-lg">{level.label}</span>
                      <span className="text-sm opacity-70">
                        {level.value === 'mild' ? 'Manageable discomfort' :
                         level.value === 'moderate' ? 'Noticeable impact on daily activities' :
                         'Severe impact requiring immediate attention'}
                      </span>
                    </div>
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Clock className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Symptom Timeline</h3>
            </div>

            <div>
              <Label htmlFor="start_time">When did this symptom start? *</Label>
              <Input
                id="start_time"
                type="datetime-local"
                value={data.symptom_start_time}
                onChange={(e) => handleInputChange('symptom_start_time', e.target.value)}
                className="mt-2"
              />
            </div>

            <div>
              <Label>Are your symptoms getting worse or better?</Label>
              <ToggleGroup
                type="single"
                value={data.getting_worse === true ? 'true' : data.getting_worse === false ? 'false' : 'same'}
                onValueChange={(value) => {
                  if (value === 'true') handleInputChange('getting_worse', true);
                  else if (value === 'false') handleInputChange('getting_worse', false);
                  else handleInputChange('getting_worse', null);
                }}
                className="mt-3 grid grid-cols-1 gap-3"
              >
                <ToggleGroupItem
                  value="true"
                  className="h-14 w-full justify-start text-left font-medium transition-all hover:scale-105 border-red-200 bg-red-50 hover:bg-red-100 data-[state=on]:bg-red-100 data-[state=on]:text-red-800 data-[state=on]:ring-2 data-[state=on]:ring-red-500"
                >
                  <span className="text-red-600">Getting worse</span>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="false"
                  className="h-14 w-full justify-start text-left font-medium transition-all hover:scale-105 border-green-200 bg-green-50 hover:bg-green-100 data-[state=on]:bg-green-100 data-[state=on]:text-green-800 data-[state=on]:ring-2 data-[state=on]:ring-green-500"
                >
                  <span className="text-green-600">Getting better</span>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="same"
                  className="h-14 w-full justify-start text-left font-medium transition-all hover:scale-105 border-muted bg-muted/20 hover:bg-muted/40 data-[state=on]:bg-muted data-[state=on]:text-foreground data-[state=on]:ring-2 data-[state=on]:ring-primary"
                >
                  <span>Staying the same</span>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Pill className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Treatment Taken</h3>
            </div>

            <div>
              <Label htmlFor="medication">Have you taken any medication for this symptom?</Label>
              <Textarea
                id="medication"
                value={data.medication_taken}
                onChange={(e) => handleInputChange('medication_taken', e.target.value)}
                placeholder="e.g., Paracetamol 500mg, Aspirin, No medication taken..."
                className="mt-2"
                rows={3}
              />
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-6">
              <Phone className="h-6 w-6 text-primary" />
              <h3 className="text-lg font-semibold">Medical Consultation</h3>
            </div>

            <div>
              <Label>Do you want to connect to a doctor immediately?</Label>
              <ToggleGroup
                type="single"
                value={data.wants_doctor_connection?.toString() || ''}
                onValueChange={(value) => handleInputChange('wants_doctor_connection', value === 'true')}
                className="mt-3 grid grid-cols-1 gap-3"
              >
                <ToggleGroupItem
                  value="true"
                  className="h-16 w-full justify-start text-left font-medium transition-all hover:scale-105 border-primary bg-primary/10 hover:bg-primary/20 data-[state=on]:bg-primary data-[state=on]:text-primary-foreground data-[state=on]:ring-2 data-[state=on]:ring-primary"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-base">Yes, connect me to a doctor now</span>
                    <span className="text-sm opacity-70">Get immediate medical consultation</span>
                  </div>
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="false"
                  className="h-16 w-full justify-start text-left font-medium transition-all hover:scale-105 border-muted bg-muted/20 hover:bg-muted/40 data-[state=on]:bg-muted data-[state=on]:text-foreground data-[state=on]:ring-2 data-[state=on]:ring-primary"
                >
                  <div className="flex flex-col items-start">
                    <span className="text-base">No, I'll monitor for now</span>
                    <span className="text-sm opacity-70">Continue self-monitoring symptoms</span>
                  </div>
                </ToggleGroupItem>
              </ToggleGroup>
            </div>

            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Assessment Summary</h4>
              <div className="text-sm space-y-1 text-muted-foreground">
                <p><strong>Symptoms:</strong> {data.symptom_description}</p>
                <p><strong>Severity:</strong> {data.severity_level}</p>
                <p><strong>Getting worse:</strong> {data.getting_worse ? 'Yes' : 'No'}</p>
                <p><strong>Urgency Score:</strong> {calculateUrgencyScore()}/10</p>
              </div>
            </div>

            {calculateUrgencyScore() >= 7 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  HIGH URGENCY: Your symptoms indicate you should seek immediate medical attention.
                </AlertDescription>
              </Alert>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  if (!user) return null;

  return (
    <Card className="border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          Emergency Health Check
        </CardTitle>
        <CardDescription>
          Quick assessment for urgent symptoms - Step {currentStep} of {totalSteps}
        </CardDescription>
        <div className="w-full bg-muted rounded-full h-2">
          <div 
            className="bg-red-500 h-2 rounded-full transition-all duration-300" 
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
            disabled={isLoading || (currentStep === 1 && (!data.symptom_description || !data.severity_level))}
            className="flex-1"
            variant={calculateUrgencyScore() >= 7 ? "destructive" : "default"}
          >
            {currentStep === totalSteps ? 'Submit Assessment' : 'Next'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}