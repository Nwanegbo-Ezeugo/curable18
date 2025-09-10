import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { AlertTriangle, Heart, ChevronRight, ChevronLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface AssessmentData {
  feelingToday: string;
  thoughtHeaviness: number[];
  stressAnxiety: string;
  stressDetails: string;
  sleepChanges: string;
  hopelessness: string;
  hopelessnessDetails: string;
  supportPerson: string;
  selfHarm: string;
}

export default function MentalHealthCrisis() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [assessmentData, setAssessmentData] = useState<AssessmentData>({
    feelingToday: "",
    thoughtHeaviness: [3],
    stressAnxiety: "",
    stressDetails: "",
    sleepChanges: "",
    hopelessness: "",
    hopelessnessDetails: "",
    supportPerson: "",
    selfHarm: ""
  });

  const totalSteps = 7;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!user) return;

    setIsSubmitting(true);
    try {
      const isUrgent = assessmentData.selfHarm === "yes";
      
      const { error } = await supabase
        .from("mental_health_assessments")
        .insert({
          user_id: user.id,
          feeling_today: assessmentData.feelingToday,
          thought_heaviness_scale: assessmentData.thoughtHeaviness[0],
          stress_anxiety_overwhelm: assessmentData.stressAnxiety === "yes",
          stress_anxiety_details: assessmentData.stressDetails,
          sleep_changes: assessmentData.sleepChanges,
          hopelessness_loss_interest: assessmentData.hopelessness === "yes",
          hopelessness_explanation: assessmentData.hopelessnessDetails,
          has_support_person: assessmentData.supportPerson === "yes",
          self_harm_thoughts: assessmentData.selfHarm === "yes",
          is_flagged_urgent: isUrgent,
          mood_score: assessmentData.thoughtHeaviness[0]
        });

      if (error) throw error;

      if (isUrgent) {
        toast({
          title: "Immediate Support Available",
          description: "Your responses indicate you may need immediate support. Please consider contacting a crisis helpline.",
          variant: "destructive"
        });
      } else {
        toast({
          title: "Assessment Complete",
          description: "Thank you for sharing. Your mental health journey matters to us."
        });
      }

      // Reset form
      setCurrentStep(1);
      setAssessmentData({
        feelingToday: "",
        thoughtHeaviness: [3],
        stressAnxiety: "",
        stressDetails: "",
        sleepChanges: "",
        hopelessness: "",
        hopelessnessDetails: "",
        supportPerson: "",
        selfHarm: ""
      });
    } catch (error) {
      console.error("Error submitting assessment:", error);
      toast({
        title: "Error",
        description: "Failed to submit assessment. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderQuestion = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <Heart className="h-12 w-12 text-primary mx-auto" />
              <h2 className="text-2xl font-semibold">How are you feeling today?</h2>
              <p className="text-muted-foreground">Take your time to express yourself freely</p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="feeling">Your feelings</Label>
              <Textarea
                id="feeling"
                placeholder="I feel..."
                value={assessmentData.feelingToday}
                onChange={(e) => setAssessmentData(prev => ({ ...prev, feelingToday: e.target.value }))}
                className="min-h-32"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">How heavy do your thoughts feel?</h2>
              <p className="text-muted-foreground">On a scale of 1 to 5, where 1 is light and 5 is very heavy</p>
            </div>
            <div className="space-y-6">
              <div className="px-4">
                <Slider
                  value={assessmentData.thoughtHeaviness}
                  onValueChange={(value) => setAssessmentData(prev => ({ ...prev, thoughtHeaviness: value }))}
                  max={5}
                  min={1}
                  step={1}
                  className="w-full"
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground px-4">
                <span>Light (1)</span>
                <span className="font-medium text-primary">
                  {assessmentData.thoughtHeaviness[0]}
                </span>
                <span>Very Heavy (5)</span>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">Do you often feel stressed, anxious, or overwhelmed?</h2>
            </div>
            <RadioGroup
              value={assessmentData.stressAnxiety}
              onValueChange={(value) => setAssessmentData(prev => ({ ...prev, stressAnxiety: value }))}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="yes" id="stress-yes" />
                <Label htmlFor="stress-yes" className="flex-1 cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="no" id="stress-no" />
                <Label htmlFor="stress-no" className="flex-1 cursor-pointer">No</Label>
              </div>
            </RadioGroup>
            {assessmentData.stressAnxiety === "yes" && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="stress-details">Can you tell us more about it?</Label>
                <Textarea
                  id="stress-details"
                  placeholder="Describe what's causing stress or anxiety..."
                  value={assessmentData.stressDetails}
                  onChange={(e) => setAssessmentData(prev => ({ ...prev, stressDetails: e.target.value }))}
                  className="min-h-24"
                />
              </div>
            )}
          </div>
        );

      case 4:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">Have you been experiencing changes in sleep?</h2>
            </div>
            <RadioGroup
              value={assessmentData.sleepChanges}
              onValueChange={(value) => setAssessmentData(prev => ({ ...prev, sleepChanges: value }))}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="better" id="sleep-better" />
                <Label htmlFor="sleep-better" className="flex-1 cursor-pointer">Better than usual</Label>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="worse" id="sleep-worse" />
                <Label htmlFor="sleep-worse" className="flex-1 cursor-pointer">Worse than usual</Label>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="no-change" id="sleep-no-change" />
                <Label htmlFor="sleep-no-change" className="flex-1 cursor-pointer">No change</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">Do you often feel hopeless or lose interest in things you used to enjoy?</h2>
            </div>
            <RadioGroup
              value={assessmentData.hopelessness}
              onValueChange={(value) => setAssessmentData(prev => ({ ...prev, hopelessness: value }))}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="yes" id="hopeless-yes" />
                <Label htmlFor="hopeless-yes" className="flex-1 cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="no" id="hopeless-no" />
                <Label htmlFor="hopeless-no" className="flex-1 cursor-pointer">No</Label>
              </div>
            </RadioGroup>
            {assessmentData.hopelessness === "yes" && (
              <div className="space-y-2 animate-fade-in">
                <Label htmlFor="hopeless-details">Can you share more about this feeling?</Label>
                <Textarea
                  id="hopeless-details"
                  placeholder="Tell us about what you've been experiencing..."
                  value={assessmentData.hopelessnessDetails}
                  onChange={(e) => setAssessmentData(prev => ({ ...prev, hopelessnessDetails: e.target.value }))}
                  className="min-h-24"
                />
              </div>
            )}
          </div>
        );

      case 6:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-semibold">Do you have someone you feel comfortable talking to about your feelings?</h2>
            </div>
            <RadioGroup
              value={assessmentData.supportPerson}
              onValueChange={(value) => setAssessmentData(prev => ({ ...prev, supportPerson: value }))}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="yes" id="support-yes" />
                <Label htmlFor="support-yes" className="flex-1 cursor-pointer">Yes, I have someone to talk to</Label>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="no" id="support-no" />
                <Label htmlFor="support-no" className="flex-1 cursor-pointer">No, I don't have anyone</Label>
              </div>
            </RadioGroup>
          </div>
        );

      case 7:
        return (
          <div className="space-y-6">
            <div className="text-center space-y-4">
              <AlertTriangle className="h-12 w-12 text-destructive mx-auto" />
              <h2 className="text-2xl font-semibold">Have you had any thoughts of harming yourself?</h2>
              <p className="text-muted-foreground">Your safety is our priority. This information helps us provide appropriate support.</p>
            </div>
            <RadioGroup
              value={assessmentData.selfHarm}
              onValueChange={(value) => setAssessmentData(prev => ({ ...prev, selfHarm: value }))}
              className="space-y-4"
            >
              <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="yes" id="harm-yes" />
                <Label htmlFor="harm-yes" className="flex-1 cursor-pointer">Yes</Label>
              </div>
              <div className="flex items-center space-x-3 p-4 rounded-lg border hover:bg-muted/50 transition-colors">
                <RadioGroupItem value="no" id="harm-no" />
                <Label htmlFor="harm-no" className="flex-1 cursor-pointer">No</Label>
              </div>
            </RadioGroup>
            {assessmentData.selfHarm === "yes" && (
              <div className="p-4 border border-destructive/20 bg-destructive/5 rounded-lg animate-fade-in">
                <p className="text-sm text-destructive font-medium">
                  If you're in immediate danger, please contact emergency services (911) or a crisis helpline immediately.
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-primary mb-4">We're here to listen and support you</h1>
            <p className="text-lg text-muted-foreground">
              Your mental health matters. This assessment helps us understand how you're feeling and provide the right support.
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-muted-foreground">Question {currentStep} of {totalSteps}</span>
              <span className="text-sm text-muted-foreground">{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-primary h-2 rounded-full transition-all duration-300" 
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>

          {/* Question Card */}
          <Card className="border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center">Mental Health Assessment</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {renderQuestion()}

              {/* Navigation */}
              <div className="flex justify-between pt-6">
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  disabled={currentStep === 1}
                  className="flex items-center gap-2"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>

                {currentStep < totalSteps ? (
                  <Button
                    onClick={handleNext}
                    className="flex items-center gap-2"
                    disabled={
                      (currentStep === 1 && !assessmentData.feelingToday) ||
                      (currentStep === 3 && !assessmentData.stressAnxiety) ||
                      (currentStep === 4 && !assessmentData.sleepChanges) ||
                      (currentStep === 5 && !assessmentData.hopelessness) ||
                      (currentStep === 6 && !assessmentData.supportPerson) ||
                      (currentStep === 7 && !assessmentData.selfHarm)
                    }
                  >
                    Next
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleSubmit}
                    disabled={!assessmentData.selfHarm || isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? "Submitting..." : "Complete Assessment"}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Crisis Resources */}
          <div className="mt-8 p-6 bg-card border rounded-lg">
            <h3 className="font-semibold mb-4 text-center">Immediate Support Resources</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium">Crisis Text Line</p>
                <p className="text-muted-foreground">Text HOME to 741741</p>
              </div>
              <div>
                <p className="font-medium">National Suicide Prevention Lifeline</p>
                <p className="text-muted-foreground">988 or 1-800-273-8255</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}