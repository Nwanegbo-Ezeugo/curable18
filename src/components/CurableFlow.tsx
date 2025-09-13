import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import OnboardingFlow from './OnboardingFlow';
import DailyHealthQuestions from './DailyHealthQuestions';
import WeeklyCheckin from './WeeklyCheckin';
import EmergencyCheckin from './EmergencyCheckin';
import HealthCharts from './HealthCharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertTriangle, Calendar, TrendingUp, User, BarChart3, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function CurableFlow() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showEmergency, setShowEmergency] = useState(false);
  const [showGraphs, setShowGraphs] = useState(false);
  const [activeTab, setActiveTab] = useState('daily');

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    try {
      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from('profiles')
        .select('onboarding_completed')
        .eq('id', user.id)
        .maybeSingle();

      setOnboardingCompleted(profile?.onboarding_completed || false);
    } catch (error) {
      console.error('Error checking onboarding status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOnboardingComplete = () => {
    setOnboardingCompleted(true);
  };

  const handleEmergencySubmit = () => {
    setShowEmergency(false);
  };

  const handleDailyComplete = () => {
    setShowGraphs(true);
    setActiveTab('graphs');
  };

  const handleWeeklyComplete = () => {
    setShowGraphs(true);
    setActiveTab('graphs');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-medium">Loading your health profile...</h2>
        </div>
      </div>
    );
  }

  // Show onboarding if not completed
  if (!onboardingCompleted) {
    return <OnboardingFlow onComplete={handleOnboardingComplete} />;
  }

  // Show emergency check-in if triggered
  if (showEmergency) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-lg mx-auto">
          <EmergencyCheckin onSubmit={handleEmergencySubmit} />
          <div className="mt-4 text-center">
            <Button 
              variant="outline" 
              onClick={() => setShowEmergency(false)}
              className="w-full"
            >
              Cancel Emergency Check-in
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Main dashboard with all check-in options
  return (
    <div className="min-h-screen bg-background">
       {/* Header */}
      <div className="bg-primary text-primary-foreground p-4">
        <div className="">
          <h1 className="text-xl font-bold flex items-center gap-2">
            <User className="h-6 w-6" />
            Curable Health Monitor
          </h1>
          <p className="text-primary-foreground/80 text-sm mt-1">
            Your personalized health tracking
          </p>
        </div>
      </div>

      {/* Emergency Button */}
      <div className="p-4">
        <div className="max-w-lg mx-auto space-y-4">
          <Button
            onClick={() => setShowEmergency(true)}
            variant="destructive"
            className="w-full py-6 text-lg"
          >
            <AlertTriangle className="h-6 w-6 mr-2" />
            Emergency Symptom Check
          </Button>
          
          <Button
            onClick={() => navigate('/mental-health-crisis')}
            variant="secondary"
            className="w-full py-6 text-lg bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-200 hover:bg-gradient-to-r hover:from-purple-500/20 hover:to-pink-500/20 text-foreground"
          >
            <Heart className="h-6 w-6 mr-2 text-purple-600" />
            Mental Health Support
          </Button>
        </div>
      </div>

      {/* Main Content Tabs */}
      <div className="px-4 pb-8">
        <div className="max-w-4xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="daily" className="text-xs">
                <Calendar className="h-4 w-4 mr-1" />
                Daily
              </TabsTrigger>
              <TabsTrigger value="weekly" className="text-xs">
                <TrendingUp className="h-4 w-4 mr-1" />
                Weekly
              </TabsTrigger>
              <TabsTrigger value="graphs" className="text-xs">
                <BarChart3 className="h-4 w-4 mr-1" />
                Insights
              </TabsTrigger>
              <TabsTrigger value="profile" className="text-xs">
                <User className="h-4 w-4 mr-1" />
                Profile
              </TabsTrigger>
            </TabsList>

            <TabsContent value="daily" className="space-y-4 animate-fade-in">
              <DailyHealthQuestions onComplete={handleDailyComplete} />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Today's Health Tips</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>• Drink at least 8 cups of water today</p>
                    <p>• Take a 10-minute walk if possible</p>
                    <p>• Practice deep breathing for stress relief</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="weekly" className="space-y-4 animate-fade-in">
              <WeeklyCheckin onComplete={handleWeeklyComplete} />
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Weekly Health Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground">
                    <p>Your weekly patterns help us understand your health baseline and detect changes early.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="graphs" className="space-y-4 animate-fade-in">
              {showGraphs ? (
                <div className="space-y-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-primary" />
                        Your Health Analytics
                      </CardTitle>
                      <CardDescription>
                        AI-powered insights from your health data for better decision making
                      </CardDescription>
                    </CardHeader>
                  </Card>
                  <HealthCharts />
                </div>
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Health Analytics</CardTitle>
                    <CardDescription>
                      Complete your daily or weekly check-ins to see your health insights
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-8">
                      <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                      <p className="text-sm text-muted-foreground">
                        Your personalized health charts and AI insights will appear here after completing check-ins
                      </p>
                    </div>
                  </CardContent>
                  <HealthCharts />
                </Card>
              )}
            </TabsContent>

            <TabsContent value="profile" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Health Profile</CardTitle>
                  <CardDescription>
                    Your personal health information and settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>✓ Onboarding completed</p>
                    <p>✓ Daily check-ins active</p>
                    <p>✓ Health monitoring enabled</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">About Curable</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm text-muted-foreground space-y-2">
                    <p>Curable uses AI to monitor your health patterns and detect potential issues early.</p>
                    <p>Your data is private and secure, used only to improve your health outcomes.</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
 
        </div>
  );
}