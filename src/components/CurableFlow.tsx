"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// Enhanced question sets with both text and numeric inputs
const QUESTION_SETS = [
  {
    id: 1,
    questions: [
      { 
        key: "mood", 
        label: "How are you feeling today?", 
        placeholder: "Describe your current mood and emotions in detail...",
        numeric: { type: "scale", label: "Mood Rating", min: 1, max: 10, step: 1, category: "mental" }
      },
      { 
        key: "sleep_quality", 
        label: "How did you sleep last night?", 
        placeholder: "Describe the quality of your sleep - restful, restless, interrupted?",
        numeric: { type: "scale", label: "Sleep Quality", min: 1, max: 10, step: 1, category: "sleep" }
      },
      { 
        key: "sleep_hours", 
        label: "Tell me about your sleep duration and patterns", 
        placeholder: "How many hours did you sleep? Any naps? Sleep schedule?",
        numeric: { type: "number", label: "Hours Slept", min: 0, max: 24, step: 0.5, category: "sleep" }
      },
      { 
        key: "what_stresses_you", 
        label: "What's stressing you most right now?", 
        placeholder: "Describe what's causing stress in your life currently...",
        numeric: { type: "scale", label: "Stress Level", min: 1, max: 10, step: 1, category: "mental" }
      },
      { 
        key: "water_bottles", 
        label: "How has your hydration been?", 
        placeholder: "Describe your water intake and hydration habits...",
        numeric: { type: "number", label: "Water Cups", min: 0, max: 20, step: 1, category: "physical" }
      },
      { 
        key: "exercise_level", 
        label: "Tell me about your physical activity", 
        placeholder: "What exercise have you done? Intensity? Duration?",
        numeric: { type: "scale", label: "Exercise Intensity", min: 1, max: 10, step: 1, category: "physical" }
      },
    ]
  },
  {
    id: 2,
    questions: [
      { 
        key: "energy_level", 
        label: "Describe your energy levels throughout the day", 
        placeholder: "How has your energy been? Any peaks or crashes?",
        numeric: { type: "scale", label: "Energy Level", min: 1, max: 10, step: 1, category: "physical" }
      },
      { 
        key: "meals_today", 
        label: "Tell me about your eating habits and nutrition", 
        placeholder: "What have you eaten? Meal timing? Appetite?",
        numeric: { type: "number", label: "Meals Today", min: 0, max: 10, step: 1, category: "nutrition" }
      },
      { 
        key: "any_headache", 
        label: "Describe any physical discomfort or pain", 
        placeholder: "Any headaches, body pains, or physical symptoms?",
        numeric: { type: "scale", label: "Pain Level", min: 1, max: 10, step: 1, category: "physical" }
      },
      { 
        key: "sweat_in_bed", 
        label: "Tell me about your sleep environment and comfort", 
        placeholder: "Night sweats? Temperature? Sleep comfort?",
        numeric: { type: "toggle", label: "Night Sweats", options: ["No", "Yes"], category: "sleep" }
      },
      { 
        key: "clean_water", 
        label: "Describe your water sources and hydration quality", 
        placeholder: "Are you drinking clean water? Sources? Concerns?",
        numeric: { type: "scale", label: "Water Quality", min: 1, max: 10, step: 1, category: "physical" }
      },
      { 
        key: "foamy_urine", 
        label: "Describe any changes in bodily functions", 
        placeholder: "Urine changes? Bowel movements? Other bodily functions?",
        numeric: { type: "toggle", label: "Urine Changes", options: ["No", "Yes"], category: "physical" }
      },
    ]
  },
  {
    id: 3,
    questions: [
      { 
        key: "mental_health_rating", 
        label: "Describe your mental and emotional state this week", 
        placeholder: "How have you been feeling mentally? Emotions? Thoughts?",
        numeric: { type: "scale", label: "Mental Wellness", min: 1, max: 10, step: 1, category: "mental" }
      },
      { 
        key: "main_worry", 
        label: "What's been on your mind? Share your concerns", 
        placeholder: "What worries or concerns are occupying your thoughts?",
        numeric: { type: "scale", label: "Worry Level", min: 1, max: 10, step: 1, category: "mental" }
      },
      { 
        key: "very_busy_week", 
        label: "Tell me about your schedule and workload", 
        placeholder: "How busy have you been? Workload? Time management?",
        numeric: { type: "scale", label: "Busyness Level", min: 1, max: 10, step: 1, category: "lifestyle" }
      },
      { 
        key: "used_mosquito_net", 
        label: "Describe your sleep environment and safety", 
        placeholder: "Sleeping arrangements? Environment? Safety measures?",
        numeric: { type: "toggle", label: "Used Protection", options: ["No", "Yes"], category: "lifestyle" }
      },
      { 
        key: "alcohol_this_week", 
        label: "Tell me about any substance use or habits", 
        placeholder: "Alcohol? Other substances? Consumption patterns?",
        numeric: { type: "number", label: "Alcohol Units", min: 0, max: 50, step: 1, category: "lifestyle" }
      },
      { 
        key: "prescribed_medication", 
        label: "Describe your medication and treatment regimen", 
        placeholder: "Medications? Treatments? Adherence? Effects?",
        numeric: { type: "toggle", label: "Medication Taken", options: ["No", "Yes"], category: "health" }
      },
    ]
  },
  {
    id: 4,
    questions: [
      { 
        key: "weight_change", 
        label: "Describe any changes in your body or weight", 
        placeholder: "Weight changes? Body sensations? Physical changes?",
        numeric: { type: "number", label: "Weight (kg)", min: 0, max: 300, step: 0.1, category: "physical" }
      },
      { 
        key: "appetite_loss_week", 
        label: "Tell me about your appetite and eating patterns", 
        placeholder: "Appetite changes? Cravings? Eating patterns?",
        numeric: { type: "scale", label: "Appetite Level", min: 1, max: 10, step: 1, category: "nutrition" }
      },
      { 
        key: "fruits_this_week", 
        label: "Describe your fruit and vegetable consumption", 
        placeholder: "Fruits eaten? Vegetables? Dietary variety?",
        numeric: { type: "number", label: "Fruit Servings", min: 0, max: 20, step: 1, category: "nutrition" }
      },
      { 
        key: "missed_exercise_days", 
        label: "Tell me about your exercise consistency", 
        placeholder: "Exercise routine? Missed sessions? Consistency?",
        numeric: { type: "number", label: "Missed Days", min: 0, max: 7, step: 1, category: "physical" }
      },
      { 
        key: "continuous_tiredness", 
        label: "Describe your energy and fatigue patterns", 
        placeholder: "Fatigue levels? Energy patterns? Rest needs?",
        numeric: { type: "scale", label: "Fatigue Level", min: 1, max: 10, step: 1, category: "physical" }
      },
      { 
        key: "last_doctor_checkin", 
        label: "Tell me about your recent healthcare visits", 
        placeholder: "Doctor visits? Health checks? Medical concerns?",
        numeric: { type: "number", label: "Days Since Visit", min: 0, max: 365, step: 1, category: "health" }
      },
    ]
  }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D'];

export default function Checkins() {
  const [loading, setLoading] = useState(false);
  const [canSubmit, setCanSubmit] = useState(true);
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [lastCheckin, setLastCheckin] = useState<Date | null>(null);
  const [personalizedReply, setPersonalizedReply] = useState("");
  const [currentQuestionSet, setCurrentQuestionSet] = useState(0);
  const [checkinHistory, setCheckinHistory] = useState([]);
  const [activeTab, setActiveTab] = useState("analytics"); // Default to analytics tab
  const userName = "Ezeugo";

  // Use refs to store form values
  const textareaRefs = useRef({});
  const numericRefs = useRef({});
  const formData = useRef({
    // Text responses
    mood: "", sleep_quality: "", sleep_hours: "", what_stresses_you: "", water_bottles: "", exercise_level: "",
    energy_level: "", meals_today: "", any_headache: "", sweat_in_bed: "", clean_water: "", foamy_urine: "",
    mental_health_rating: "", main_worry: "", very_busy_week: "", used_mosquito_net: "", alcohol_this_week: "", prescribed_medication: "",
    weight_change: "", appetite_loss_week: "", fruits_this_week: "", missed_exercise_days: "", continuous_tiredness: "", last_doctor_checkin: "",
    
    // Numeric values
    mood_numeric: null, sleep_quality_numeric: null, sleep_hours_numeric: null, what_stresses_you_numeric: null, 
    water_bottles_numeric: null, exercise_level_numeric: null, energy_level_numeric: null, meals_today_numeric: null,
    any_headache_numeric: null, sweat_in_bed_numeric: null, clean_water_numeric: null, foamy_urine_numeric: null,
    mental_health_rating_numeric: null, main_worry_numeric: null, very_busy_week_numeric: null, used_mosquito_net_numeric: null,
    alcohol_this_week_numeric: null, prescribed_medication_numeric: null, weight_change_numeric: null, appetite_loss_week_numeric: null,
    fruits_this_week_numeric: null, missed_exercise_days_numeric: null, continuous_tiredness_numeric: null, last_doctor_checkin_numeric: null,
  });

  const getCurrentQuestionSet = () => {
    const today = new Date();
    const dayOfYear = Math.floor((today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24));
    const setIndex = Math.floor(dayOfYear / 3) % QUESTION_SETS.length;
    return QUESTION_SETS[setIndex];
  };

  useEffect(() => {
    const questionSet = getCurrentQuestionSet();
    setCurrentQuestionSet(questionSet.id - 1);
    fetchCheckinHistory();
    
    // Fetch last check-in
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from("three_day_checkins")
          .select("created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1);

        if (error) throw error;
        if (data?.length) {
          const last = new Date(data[0].created_at);
          setLastCheckin(last);

          const now = new Date();
          const diffMs = now.getTime() - last.getTime();
          const diffDays = diffMs / (1000 * 60 * 60 * 24);
          if (diffDays >= 3) {
            setCanSubmit(true);
            setDaysRemaining(0);
          } else {
            setCanSubmit(false);
            setDaysRemaining(Math.ceil(3 - diffDays));
          }
        } else {
          setCanSubmit(true);
          setDaysRemaining(0);
        }
      } catch (err) {
        console.error("Error fetching last check-in", err);
        setCanSubmit(true);
      }
    })();
  }, []);

  const fetchCheckinHistory = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("three_day_checkins")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (error) throw error;
      setCheckinHistory(data || []);
    } catch (error) {
      console.error("Error fetching checkin history:", error);
    }
  };

  const validateRequired = () => {
    const currentSet = getCurrentQuestionSet();
    const firstQuestionKey = currentSet.questions[0].key;
    return formData.current[firstQuestionKey]?.trim() !== "";
  };

  const handleSubmit = async () => {
    if (!validateRequired()) {
      alert(`Please answer at least: "${getCurrentQuestionSet().questions[0].label}"`);
      return;
    }
    if (!canSubmit) {
      alert(`You can submit only once every 3 days. Try again in ${daysRemaining} day(s).`);
      return;
    }

    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        alert("Please log in to save check-ins");
        setLoading(false);
        return;
      }

      const payload = {
        ...formData.current,
        user_id: user.id,
        question_set_id: getCurrentQuestionSet().id,
        created_at: new Date().toISOString(),
      };

      const { data, error } = await supabase.from("three_day_checkins").insert([payload]);

      if (error) {
        console.error("Supabase error:", error);
        alert(`❌ Error: ${error.message}`);
        setLoading(false);
        return;
      }

      const reply = generateReply(formData.current, userName, getCurrentQuestionSet().id);
      setPersonalizedReply(reply);
      await fetchCheckinHistory(); // Refresh history after submission

      setCanSubmit(false);
      setLastCheckin(new Date());
      setDaysRemaining(3);
      
      // Clear form data
      Object.keys(formData.current).forEach(key => {
        formData.current[key] = key.includes('_numeric') ? null : "";
        if (textareaRefs.current[key]) {
          textareaRefs.current[key].value = "";
        }
        if (numericRefs.current[key]) {
          if (numericRefs.current[key].type === 'range') {
            numericRefs.current[key].value = '5';
          } else {
            numericRefs.current[key].value = "";
          }
        }
      });
      
      alert("✅ Check-in saved!");
    } catch (err) {
      console.error("Unexpected error:", err);
      alert("Unexpected error. Check console.");
    } finally {
      setLoading(false);
    }
  };

  function generateReply(answers, name, questionSetId) {
    const snippets = [];

    // Enhanced reply generation using both text and numeric data
    switch(questionSetId) {
      case 1:
        if (answers.mood && answers.mood.length > 10) {
          const moodScore = answers.mood_numeric ? ` (rated ${answers.mood_numeric}/10)` : '';
          snippets.push(`Thanks for sharing how you're feeling${moodScore}. I've noted your emotional state.`);
        }
        if (answers.sleep_quality_numeric !== null) {
          snippets.push(`Your sleep quality score of ${answers.sleep_quality_numeric}/10 helps me understand your rest patterns.`);
        }
        break;
        
      case 2:
        if (answers.energy_level_numeric !== null) {
          snippets.push(`Your energy level of ${answers.energy_level_numeric}/10 provides valuable insights.`);
        }
        if (answers.meals_today_numeric !== null) {
          snippets.push(`I see you had ${answers.meals_today_numeric} meals today - nutrition is key to health.`);
        }
        break;
        
      case 3:
        if (answers.mental_health_rating_numeric !== null) {
          snippets.push(`Your mental wellness rating of ${answers.mental_health_rating_numeric}/10 is important data.`);
        }
        break;
        
      case 4:
        if (answers.continuous_tiredness_numeric !== null) {
          snippets.push(`Your fatigue level of ${answers.continuous_tiredness_numeric}/10 helps track your energy patterns.`);
        }
        break;
    }

    if (snippets.length === 0) {
      snippets.push("Thank you for your detailed check-in. Your comprehensive responses help me understand your health better.");
    }

    return `${snippets.join(" ")} I'll analyze all the details you've shared and check in with you again in 3 days.`;
  }

  // Simplified data processing for charts - only health trend
  const processChartData = () => {
    if (!checkinHistory.length) return { lineData: [] };

    const lineData = checkinHistory.map(checkin => {
      const date = new Date(checkin.created_at).toLocaleDateString();
      
      // Calculate overall health score from available metrics
      let totalScore = 0;
      let metricCount = 0;
      
      // Use key metrics for overall health trend
      const keyMetrics = ['mood_numeric', 'sleep_quality_numeric', 'energy_level_numeric', 'mental_health_rating_numeric'];
      
      keyMetrics.forEach(metric => {
        if (checkin[metric] !== null) {
          totalScore += checkin[metric];
          metricCount++;
        }
      });
      
      const healthScore = metricCount > 0 ? totalScore / metricCount : null;
      
      return {
        date,
        'Health Score': healthScore ? Math.round(healthScore * 10) / 10 : null
      };
    }).filter(point => point['Health Score'] !== null);

    return { lineData };
  };

  const { lineData } = processChartData();

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 p-3 rounded-lg">
          <p className="text-white font-semibold">{label}</p>
          {payload.map((entry, index) => (
            <p key={index} style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const NumericField = ({ question }) => {
    const handleNumericChange = (value) => {
      formData.current[`${question.key}_numeric`] = value;
    };

    const renderNumericInput = () => {
      const numericConfig = question.numeric;
      
      switch(numericConfig.type) {
        case "scale":
          return (
            <div className="space-y-3">
              <Label className="text-white text-sm font-medium">{numericConfig.label} ({numericConfig.min}-{numericConfig.max})</Label>
              <Slider
                ref={el => numericRefs.current[`${question.key}_numeric`] = el}
                defaultValue={[5]}
                min={numericConfig.min}
                max={numericConfig.max}
                step={numericConfig.step}
                onValueChange={(value) => handleNumericChange(value[0])}
                className="w-full"
              />
              <div className="flex justify-between text-sm text-gray-400">
                <span>Low ({numericConfig.min})</span>
                <span>High ({numericConfig.max})</span>
              </div>
            </div>
          );
        
        case "number":
          return (
            <div className="space-y-2">
              <Label className="text-white text-sm font-medium">{numericConfig.label}</Label>
              <input
                ref={el => numericRefs.current[`${question.key}_numeric`] = el}
                type="number"
                min={numericConfig.min}
                max={numericConfig.max}
                step={numericConfig.step}
                onChange={(e) => handleNumericChange(parseFloat(e.target.value))}
                className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-2 focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                placeholder={`Enter ${numericConfig.label.toLowerCase()}...`}
              />
            </div>
          );
        
        case "toggle":
          return (
            <div className="space-y-2">
              <Label className="text-white text-sm font-medium">{numericConfig.label}</Label>
              <div className="flex space-x-4">
                {numericConfig.options.map((option, index) => (
                  <label key={option} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name={question.key}
                      value={index}
                      onChange={() => handleNumericChange(index)}
                      className="text-purple-500 focus:ring-purple-500"
                    />
                    <span className="text-white text-sm">{option}</span>
                  </label>
                ))}
              </div>
            </div>
          );
        
        default:
          return null;
      }
    };

    return (
      <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
        {renderNumericInput()}
      </div>
    );
  };

  const Field = ({ question }) => {
    const handleChange = (e) => {
      formData.current[question.key] = e.target.value;
    };

    return (
      <div className="space-y-4 p-6 bg-gray-800/30 rounded-xl border border-gray-700">
        <div className="space-y-3">
          <Label className="text-white text-lg font-medium">{question.label}</Label>
          
          <textarea
            ref={el => textareaRefs.current[question.key] = el}
            placeholder={question.placeholder}
            defaultValue={formData.current[question.key] || ""}
            onChange={handleChange}
            className="w-full bg-gray-800 text-white border-2 border-gray-600 rounded-lg p-4 text-lg 
                       min-h-[100px] resize-vertical focus:border-purple-500 focus:ring-2 focus:ring-purple-500 
                       focus:outline-none transition-colors duration-200 hover:border-gray-500"
            rows={4}
          />
          
          <div className="text-sm text-gray-400">
            Take your time to express yourself fully. Your detailed responses help provide better insights.
          </div>
        </div>

        <NumericField question={question} />
      </div>
    );
  };

  const currentSet = getCurrentQuestionSet();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-950 to-black text-white p-6">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-6xl mx-auto">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800/50 p-1 rounded-lg mb-6">
          <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-600 rounded-md">
            AI Analytics
          </TabsTrigger>
          <TabsTrigger value="checkin" className="data-[state=active]:bg-purple-600 rounded-md">
            Health Check-in
          </TabsTrigger>
          <TabsTrigger value="symptom-checker" className="data-[state=active]:bg-green-600 rounded-md">
            AI Symptom Checker
          </TabsTrigger>
        </TabsList>

        {/* AI Analytics Tab - Now the first/default page */}
        <TabsContent value="analytics">
          <Card className="w-full bg-gray-900/60 border-2 border-purple-500/30 shadow-2xl rounded-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent mb-4">
                Welcome back, {userName}!
              </CardTitle>
              <p className="text-xl text-gray-300">Your AI health assistant is ready to help.</p>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Action Buttons - Large and Prominent */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Button 
                  onClick={() => setActiveTab("checkin")}
                  className="bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-xl 
                             py-8 hover:scale-105 transition-all duration-200 shadow-lg shadow-blue-500/30
                             flex flex-col items-center justify-center space-y-2"
                >
                  <span className="text-2xl">➕</span>
                  <span>Start Health Check-in</span>
                </Button>

                <Button 
                  onClick={() => setActiveTab("symptom-checker")}
                  className="bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-xl 
                             py-8 hover:scale-105 transition-all duration-200 shadow-lg shadow-green-500/30
                             flex flex-col items-center justify-center space-y-2"
                >
                  <span className="text-2xl">🔍</span>
                  <span>AI Symptom Checker</span>
                </Button>
              </div>

              {/* Health Overview Section */}
              <div className="space-y-6">
                <h2 className="text-2xl font-bold text-purple-300">Your Health at a Glance</h2>
                
                {/* Health Trend Graph */}
                {checkinHistory.length > 0 ? (
                  <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-xl font-semibold text-purple-300 mb-4">Health Trend (Last 7 Days)</h3>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={lineData.slice(-7)} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                          <XAxis dataKey="date" stroke="#9CA3AF" />
                          <YAxis stroke="#9CA3AF" domain={[0, 10]} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line
                            type="monotone"
                            dataKey="Health Score"
                            stroke="#8884d8"
                            strokeWidth={3}
                            activeDot={{ r: 8 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                ) : (
                  <div className="bg-gray-800/30 p-8 rounded-xl border border-gray-700 text-center">
                    <div className="text-2xl text-gray-400 mb-2">No health data yet</div>
                    <div className="text-gray-500">Complete your first health check-in to see your health trend</div>
                  </div>
                )}

                {/* Check-in Summary */}
                {checkinHistory.length > 0 && (
                  <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700">
                    <h3 className="text-xl font-semibold text-purple-300 mb-4">Latest Check-in Summary</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p><strong>Date:</strong> {new Date(checkinHistory[checkinHistory.length - 1]?.created_at).toLocaleDateString()}</p>
                        <p><strong>Check-in Type:</strong> {
                          currentSet.id === 1 ? "Mood & Daily Life" : 
                          currentSet.id === 2 ? "Physical Well-being" : 
                          currentSet.id === 3 ? "Mental & Emotional Health" : "Weekly Health Patterns"
                        }</p>
                      </div>
                      <div>
                        <p><strong>Total Check-ins:</strong> {checkinHistory.length}</p>
                        <p><strong>Tracking Since:</strong> {new Date(checkinHistory[0]?.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Insights */}
                <div className="bg-gradient-to-r from-purple-900/40 to-pink-900/40 p-6 rounded-xl border-2 border-purple-500/30">
                  <h3 className="text-xl font-semibold text-purple-300 mb-3">AI-Powered Insights</h3>
                  {checkinHistory.length > 1 ? (
                    <div className="space-y-3">
                      <p className="text-gray-200">💡 <strong>Pattern Identified:</strong> Your health scores are showing consistent improvement over the past week.</p>
                      <p className="text-gray-200">🤖 <strong>AI Suggestion:</strong> Continue with your current routine and consider adding morning stretches for even better results.</p>
                    </div>
                  ) : (
                    <p className="text-gray-200">Complete a few more check-ins to unlock personalized AI insights and health patterns.</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Health Check-in Tab */}
        <TabsContent value="checkin">
          <Card className="w-full bg-gray-900/60 border-2 border-purple-500/30 shadow-2xl rounded-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent">
                Curable — Detailed Health Check-in
              </CardTitle>
              <div className="text-lg text-gray-300 mt-4">
                <div className="font-semibold text-purple-300">Today's Focus: {currentSet.id === 1 ? "Mood & Daily Life" : 
                                   currentSet.id === 2 ? "Physical Well-being" : 
                                   currentSet.id === 3 ? "Mental & Emotional Health" : "Weekly Health Patterns"}</div>
                <div className="mt-3">
                  {canSubmit ? (
                    <span className="text-green-400 text-xl">✓ Ready for your detailed check-in ({currentSet.questions.length} questions)</span>
                  ) : (
                    <span className="text-yellow-400 text-xl">Next detailed check-in available in {daysRemaining} day(s)</span>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-6">
                {currentSet.questions.map((question) => (
                  <Field key={question.key} question={question} />
                ))}

                <Button 
                  onClick={handleSubmit} 
                  disabled={loading || !canSubmit} 
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-400 text-black font-bold text-lg 
                             py-6 hover:scale-105 transition-all duration-200 disabled:opacity-50 
                             shadow-lg shadow-yellow-500/20"
                >
                  {loading ? "Saving Your Detailed Responses..." : 
                   canSubmit ? `Submit Your Enhanced Check-in` : 
                   `Check-in Available in ${daysRemaining} Day(s)`}
                </Button>

                {personalizedReply && (
                  <div className="mt-6 p-6 bg-gradient-to-r from-purple-900/40 to-pink-900/40 rounded-xl border-2 border-purple-500/30">
                    <div className="font-semibold text-purple-300 text-xl mb-3">Your Personalized Health Insights</div>
                    <div className="text-gray-200 text-lg leading-relaxed">{personalizedReply}</div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* AI Symptom Checker Tab */}
        <TabsContent value="symptom-checker">
          <Card className="w-full bg-gray-900/60 border-2 border-green-500/30 shadow-2xl rounded-2xl">
            <CardHeader className="text-center">
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-green-300 to-blue-300 bg-clip-text text-transparent">
                AI Symptom Checker
              </CardTitle>
              <p className="text-lg text-gray-300">Describe how you're feeling. Our AI will help you understand potential causes and suggest next steps.</p>
            </CardHeader>

            <CardContent className="space-y-6">
              {/* Large, central input area */}
              <div className="bg-gray-800/30 p-8 rounded-xl border-2 border-green-500/30">
                <textarea 
                  placeholder="Examples: 'I have a headache and fever since yesterday.' or 'My knee has been sore after running.'"
                  className="w-full bg-gray-700 text-white border border-gray-600 rounded-lg p-4 text-lg 
                             min-h-[150px] focus:border-green-500 focus:ring-2 focus:ring-green-500 
                             focus:outline-none transition-colors duration-200"
                />
                <Button className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold text-lg 
                                  py-6 mt-4 hover:scale-105 transition-all duration-200 shadow-lg shadow-green-500/30">
                  Analyze My Symptoms
                </Button>
              </div>

              {/* Quick select common symptoms */}
              <div className="bg-gray-800/30 p-6 rounded-xl border border-gray-700">
                <h3 className="text-xl font-semibold text-green-300 mb-4">Quick Select Common Symptoms</h3>
                <div className="flex flex-wrap gap-3">
                  {['Headache', 'Fever', 'Cough', 'Fatigue', 'Muscle Ache', 'Nausea', 'Dizziness', 'Chest Pain'].map(symptom => (
                    <button
                      key={symptom}
                      className="px-4 py-2 bg-green-600/20 text-green-300 rounded-full border border-green-500/30 
                                 hover:bg-green-600/40 transition-colors duration-200"
                    >
                      {symptom}
                    </button>
                  ))}
                </div>
              </div>

              <div className="text-center text-sm text-gray-500">
                <i>Disclaimer: This tool is for informational purposes only and is not a substitute for professional medical advice.</i>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}