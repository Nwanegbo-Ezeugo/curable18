import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Activity, Brain, AlertTriangle } from 'lucide-react';

interface HealthData {
  date: string;
  sleep_hours?: number;
  stress_level?: string;
  mood?: string;
  water_intake_cups?: number;
  exercise_done?: boolean;
}

interface SymptomData {
  date: string;
  suspected_conditions: string[];
  confidence_score: number;
  urgency_level: string;
}

const chartConfig = {
  sleep: {
    label: "Sleep Hours",
    color: "hsl(var(--primary))",
  },
  water: {
    label: "Water Intake",
    color: "hsl(var(--secondary))",
  },
  mood: {
    label: "Mood Score",
    color: "hsl(var(--accent))",
  },
  stress: {
    label: "Stress Level",
    color: "hsl(var(--destructive))",
  }
};

const MOOD_SCORES = { happy: 4, neutral: 3, sad: 2, anxious: 1 };
const STRESS_SCORES = { low: 1, medium: 2, high: 3 };

export default function HealthCharts() {
  const { user } = useAuth();
  const [healthData, setHealthData] = useState<HealthData[]>([]);
  const [symptomData, setSymptomData] = useState<SymptomData[]>([]);
  const [suspectedConditions, setSuspectedConditions] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      fetchHealthData();
      fetchSymptomData();
    }
  }, [user]);

  const fetchHealthData = async () => {
    if (!user) return;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data } = await supabase
      .from('health_tracking')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (data) {
      setHealthData(data);
    }
  };

  const fetchSymptomData = async () => {
    if (!user) return;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data } = await supabase
      .from('symptom_assessments')
      .select('*')
      .eq('user_id', user.id)
      .gte('created_at', thirtyDaysAgo.toISOString())
      .order('created_at', { ascending: false });

    if (data) {
      setSymptomData(data.map(item => ({
        date: new Date(item.created_at).toLocaleDateString(),
        suspected_conditions: item.suspected_conditions || [],
        confidence_score: item.confidence_score,
        urgency_level: item.urgency_level
      })));

      // Process suspected conditions for pie chart
      const conditionCounts: Record<string, number> = {};
      data.forEach(item => {
        if (item.suspected_conditions) {
          item.suspected_conditions.forEach(condition => {
            conditionCounts[condition] = (conditionCounts[condition] || 0) + 1;
          });
        }
      });

      const conditionsArray = Object.entries(conditionCounts)
        .map(([name, value]) => ({ name, value }))
        .sort((a, b) => b.value - a.value)
        .slice(0, 5); // Top 5 conditions

      setSuspectedConditions(conditionsArray);
    }
  };

  const chartData = healthData.map(item => ({
    date: new Date(item.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    sleep: item.sleep_hours || 0,
    water: item.water_intake_cups || 0,
    moodScore: item.mood ? MOOD_SCORES[item.mood as keyof typeof MOOD_SCORES] || 0 : 0,
    stressScore: item.stress_level ? STRESS_SCORES[item.stress_level as keyof typeof STRESS_SCORES] || 0 : 0,
    exercise: item.exercise_done ? 1 : 0
  }));

  const pieColors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))', 'hsl(var(--destructive))'];

  if (!user) return null;

  return (
    <div className="space-y-6">
      {/* Sleep and Water Intake Chart */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Sleep & Hydration Trends
            </CardTitle>
            <CardDescription>
              Your daily sleep hours and water intake over the past 30 days
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line 
                    type="monotone" 
                    dataKey="sleep" 
                    stroke={chartConfig.sleep.color}
                    strokeWidth={2}
                    name="Sleep Hours"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="water" 
                    stroke={chartConfig.water.color}
                    strokeWidth={2}
                    name="Water Cups"
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Mood and Stress Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-accent" />
              Mood & Stress Levels
            </CardTitle>
            <CardDescription>
              Your emotional wellbeing patterns over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={chartConfig} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-xs" />
                  <YAxis domain={[0, 4]} className="text-xs" />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="moodScore" 
                    fill={chartConfig.mood.color}
                    name="Mood Score"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar 
                    dataKey="stressScore" 
                    fill={chartConfig.stress.color}
                    name="Stress Level"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {/* Suspected Conditions Chart */}
      {suspectedConditions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              AI Health Insights
            </CardTitle>
            <CardDescription>
              Most frequently suspected conditions from your symptom assessments
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <ChartContainer config={chartConfig} className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={suspectedConditions}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {suspectedConditions.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                        ))}
                      </Pie>
                      <ChartTooltip content={<ChartTooltipContent />} />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </div>
              <div className="space-y-3">
                <h4 className="font-semibold text-sm">Top Conditions:</h4>
                {suspectedConditions.map((condition, index) => (
                  <div key={condition.name} className="flex items-center gap-3">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: pieColors[index % pieColors.length] }}
                    />
                    <span className="text-sm">{condition.name}</span>
                    <span className="text-xs text-muted-foreground ml-auto">
                      {condition.value} time{condition.value > 1 ? 's' : ''}
                    </span>
                  </div>
                ))}
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs text-muted-foreground">
                    <AlertTriangle className="h-3 w-3 inline mr-1" />
                    This data is from AI assessments and should not replace professional medical advice.
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Exercise Activity Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-secondary" />
            Exercise Activity
          </CardTitle>
          <CardDescription>
            Your daily exercise habits over the past 30 days
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="date" className="text-xs" />
                <YAxis domain={[0, 1]} className="text-xs" />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar 
                  dataKey="exercise" 
                  fill={chartConfig.water.color}
                  name="Exercise Done"
                  radius={[2, 2, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}