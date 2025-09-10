import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Stethoscope, User, Activity, Heart, LogOut, BarChart3, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import DailyHealthQuestions from '@/components/DailyHealthQuestions';
import HealthCharts from '@/components/HealthCharts';

interface Profile {
  id: string;
  age?: number;
  blood_group?: string;
  bmi?: number;
  created_at?: string;
  email?: string;
  full_name?: string;
  gender?: string;
  genotype?: string;
  height_cm?: number;
  updated_at?: string;
  weight_kg?: number;
}

export default function HealthProfile() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<Profile>({
    id: '',
    full_name: '',
    age: 0,
    gender: '',
    height_cm: 0,
    weight_kg: 0,
    blood_group: '',
    genotype: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching profile:', error);
      return;
    }

    if (data) {
      setProfile(data);
    } else {
      setProfile(prev => ({ ...prev, id: user.id }));
    }
  };

  const calculateBMI = () => {
    if (profile.height_cm && profile.weight_kg) {
      const heightInMeters = profile.height_cm / 100;
      return profile.weight_kg / (heightInMeters * heightInMeters);
    }
    return 0;
  };

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return 'Underweight';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Overweight';
    return 'Obese';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);

    try {
      const bmi = calculateBMI();
      const profileData = {
        ...profile,
        id: user.id,
        bmi: bmi > 0 ? bmi : null,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabase
        .from('profiles')
        .upsert(profileData, { onConflict: 'id' });

      if (error) throw error;

      toast({
        title: "Profile updated",
        description: "Your health profile has been saved successfully.",
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/80 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Stethoscope className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Curable
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">
              Welcome, {user?.email}
            </span>
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              Health{' '}
              <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                Dashboard
              </span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Track your daily health, view trends, and manage your health profile.
            </p>
          </div>

          <Tabs defaultValue="daily" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="daily" className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Daily Check
              </TabsTrigger>
              <TabsTrigger value="trends" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Health Trends
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Profile
              </TabsTrigger>
            </TabsList>

            {/* Daily Health Check Tab */}
            <TabsContent value="daily" className="space-y-6">
              <DailyHealthQuestions />
              
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    Manage your health data and access other features
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <a href="/symptom-checker">
                        <Stethoscope className="h-6 w-6" />
                        <div className="text-center">
                          <div className="font-medium">Symptom Checker</div>
                          <div className="text-xs text-muted-foreground">AI-powered health assessment</div>
                        </div>
                      </a>
                    </Button>
                    <Button asChild variant="outline" className="h-auto p-4 flex flex-col items-center gap-2">
                      <a href="/medications">
                        <Heart className="h-6 w-6" />
                        <div className="text-center">
                          <div className="font-medium">My Medications</div>
                          <div className="text-xs text-muted-foreground">Track current medications</div>
                        </div>
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Health Trends Tab */}
            <TabsContent value="trends">
              <HealthCharts />
            </TabsContent>

            {/* Profile Tab */}
            <TabsContent value="profile">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5 text-primary" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your basic health information
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Info */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="full_name">Full Name</Label>
                        <Input
                          id="full_name"
                          value={profile.full_name}
                          onChange={(e) => setProfile(prev => ({ ...prev, full_name: e.target.value }))}
                          placeholder="Enter your full name"
                        />
                      </div>
                      <div>
                        <Label htmlFor="age">Age</Label>
                        <Input
                          id="age"
                          type="number"
                          value={profile.age}
                          onChange={(e) => setProfile(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                          placeholder="Enter your age"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="gender">Gender</Label>
                        <Select value={profile.gender} onValueChange={(value) => setProfile(prev => ({ ...prev, gender: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="male">Male</SelectItem>
                            <SelectItem value="female">Female</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                            <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="blood_group">Blood Group</Label>
                        <Select value={profile.blood_group} onValueChange={(value) => setProfile(prev => ({ ...prev, blood_group: value }))}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="A+">A+</SelectItem>
                            <SelectItem value="A-">A-</SelectItem>
                            <SelectItem value="B+">B+</SelectItem>
                            <SelectItem value="B-">B-</SelectItem>
                            <SelectItem value="AB+">AB+</SelectItem>
                            <SelectItem value="AB-">AB-</SelectItem>
                            <SelectItem value="O+">O+</SelectItem>
                            <SelectItem value="O-">O-</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="genotype">Genotype</Label>
                      <Select value={profile.genotype} onValueChange={(value) => setProfile(prev => ({ ...prev, genotype: value }))}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select genotype" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="AA">AA</SelectItem>
                          <SelectItem value="AS">AS</SelectItem>
                          <SelectItem value="SS">SS</SelectItem>
                          <SelectItem value="AC">AC</SelectItem>
                          <SelectItem value="SC">SC</SelectItem>
                          <SelectItem value="CC">CC</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Physical Health */}
                    <div className="border-t pt-6">
                      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Physical Health
                      </h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="height_cm">Height (cm)</Label>
                          <Input
                            id="height_cm"
                            type="number"
                            step="0.1"
                            value={profile.height_cm}
                            onChange={(e) => setProfile(prev => ({ ...prev, height_cm: parseFloat(e.target.value) || 0 }))}
                            placeholder="Enter height in cm"
                          />
                        </div>
                        <div>
                          <Label htmlFor="weight_kg">Weight (kg)</Label>
                          <Input
                            id="weight_kg"
                            type="number"
                            step="0.1"
                            value={profile.weight_kg}
                            onChange={(e) => setProfile(prev => ({ ...prev, weight_kg: parseFloat(e.target.value) || 0 }))}
                            placeholder="Enter weight in kg"
                          />
                        </div>
                      </div>

                      {/* BMI Display */}
                      {profile.height_cm && profile.height_cm > 0 && profile.weight_kg && profile.weight_kg > 0 && (
                        <div className="mt-4 p-4 bg-muted/50 rounded-lg">
                          <div className="flex items-center gap-2">
                            <Heart className="h-4 w-4 text-primary" />
                            <span className="font-medium">BMI: {calculateBMI().toFixed(1)}</span>
                            <span className="text-sm text-muted-foreground">({getBMICategory(calculateBMI())})</span>
                          </div>
                        </div>
                      )}
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full">
                      {isLoading ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}