"use client";
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client.ts";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, User, Heart, Sparkles, BarChart3, Brain, Activity, Trophy, Calendar } from "lucide-react";

export default function CurableFlow() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);
  const [streakCount, setStreakCount] = useState(0);
  const [checkinData, setCheckinData] = useState([]);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
      fetchCheckinData();
    }
  }, [user]);

  const checkOnboardingStatus = async () => {
    if (!user) return;

    try {
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

  const fetchCheckinData = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('three_day_checkins')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setCheckinData(data || []);
      
      // Streak is now simply the number of check-ins
      setStreakCount(data?.length || 0);
    } catch (error) {
      console.error('Error fetching checkin data:', error);
    }
  };

  // Comprehensive Health Trends Component - Single Graph with Multiple Lines
  const HealthTrendsDashboard = () => {
    if (checkinData.length === 0) {
      return (
        <div className="text-center py-12">
          <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-300 mb-2">No Check-in Data Yet</h3>
          <p className="text-gray-400 mb-6">Complete your first enhanced check-in to see beautiful health trends</p>
          <Button 
            onClick={() => navigate("/checkins")}
            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400"
          >
            Start Your First Check-in
          </Button>
        </div>
      );
    }

    // Extract all numeric data for the comprehensive trend graph
    const metrics = [
      { key: 'mood_numeric', label: 'Mood', color: '#3B82F6' },
      { key: 'sleep_quality_numeric', label: 'Sleep Quality', color: '#8B5CF6' },
      { key: 'energy_level_numeric', label: 'Energy Level', color: '#10B981' },
      { key: 'mental_health_rating_numeric', label: 'Mental Wellness', color: '#EF4444' },
      { key: 'what_stresses_you_numeric', label: 'Stress Level', color: '#F59E0B' },
      { key: 'exercise_level_numeric', label: 'Exercise', color: '#EC4899' },
    ];

    // Filter out metrics that have no data
    const availableMetrics = metrics.filter(metric => 
      checkinData.some(checkin => checkin[metric.key] !== null)
    );

    return (
      <div className="space-y-6">
        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <StatCard 
            title="Total Check-ins" 
            value={checkinData.length} 
            icon="📊"
            color="from-blue-500 to-cyan-500"
          />
          <StatCard 
            title="Current Streak" 
            value={streakCount} 
            icon="🔥"
            color="from-amber-500 to-orange-500"
          />
          <StatCard 
            title="Data Points" 
            value={checkinData.length * availableMetrics.length} 
            icon="📈"
            color="from-purple-500 to-pink-500"
          />
        </div>

        {/* Single Comprehensive Health Trend Graph */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-white">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              Comprehensive Health Trends
            </CardTitle>
            <CardDescription className="text-gray-400">
              All your health metrics in one view - each line represents a different aspect of your wellbeing
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ComprehensiveTrendGraph 
              checkinData={checkinData}
              metrics={availableMetrics}
              height={400}
            />
          </CardContent>
        </Card>

        {/* Metric Legend */}
        <div className="bg-gray-800/30 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3">Metrics Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {availableMetrics.map(metric => (
              <div key={metric.key} className="flex items-center space-x-2">
                <div 
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: metric.color }}
                ></div>
                <span className="text-white text-sm">{metric.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  // Comprehensive Trend Graph Component
  const ComprehensiveTrendGraph = ({ checkinData, metrics, height = 400 }) => {
    if (metrics.length === 0) {
      return (
        <div className="flex items-center justify-center h-64 text-gray-400">
          Complete a check-in with numeric ratings to see your health trends.
        </div>
      );
    }

    const maxValue = 10; // Since most metrics are 1-10 scales
    const dataPoints = checkinData.length;

    return (
      <div className="relative" style={{ height: `${height}px` }}>
        {/* Y-axis */}
        <div className="absolute left-0 top-0 bottom-0 w-8 flex flex-col justify-between text-xs text-gray-400">
          <span>10</span>
          <span>7.5</span>
          <span>5</span>
          <span>2.5</span>
          <span>0</span>
        </div>

        {/* Graph area */}
        <div className="ml-8 h-full relative">
          {/* Grid lines */}
          <div className="absolute inset-0 flex flex-col justify-between">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="border-t border-gray-600"></div>
            ))}
          </div>

          {/* Data lines */}
          <svg className="w-full h-full" preserveAspectRatio="none">
            {metrics.map(metric => {
              const points = checkinData
                .map((checkin, index) => {
                  const value = checkin[metric.key];
                  if (value === null || value === undefined) return null;
                  
                  const x = (index / (dataPoints - 1 || 1)) * 100;
                  const y = 100 - (value / maxValue * 100);
                  return { x, y, value };
                })
                .filter(point => point !== null);

              if (points.length < 2) return null;

              return (
                <g key={metric.key}>
                  {/* Line */}
                  <path
                    d={`M ${points.map(p => `${p.x}% ${p.y}%`).join(' L ')}`}
                    stroke={metric.color}
                    strokeWidth="2"
                    fill="none"
                    strokeLinecap="round"
                  />
                  
                  {/* Data points */}
                  {points.map((point, index) => (
                    <circle
                      key={index}
                      cx={`${point.x}%`}
                      cy={`${point.y}%`}
                      r="4"
                      fill={metric.color}
                      stroke="#1F2937"
                      strokeWidth="1"
                    />
                  ))}
                </g>
              );
            })}
          </svg>

          {/* X-axis labels */}
          <div className="absolute bottom-0 left-0 right-0 flex justify-between text-xs text-gray-400 px-2">
            {checkinData.map((checkin, index) => {
              if (index % Math.ceil(dataPoints / 5) === 0 || index === dataPoints - 1) {
                return (
                  <span key={index}>
                    {new Date(checkin.created_at).toLocaleDateString()}
                  </span>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    );
  };

  // Helper components
  const StatCard = ({ title, value, icon, color }) => (
    <div className={`bg-gradient-to-br ${color} rounded-xl p-4 text-white shadow-lg`}>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-sm opacity-90">{title}</div>
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" style={{fontFamily: 'Inter, sans-serif'}}>
        <div className="text-center">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-slate-300 font-medium">Loading your health dashboard...</p>
        </div>
      </div>
    );
  }

  if (!onboardingCompleted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-white" style={{fontFamily: 'Inter, sans-serif'}}>
        <div className="text-center">
          <p className="text-lg text-slate-300">Please complete onboarding first</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" style={{fontFamily: 'Inter, sans-serif'}}>
      
      {/* Professional Header with Streak */}
      <header className="bg-white/5 backdrop-blur-sm border-b border-white/10 px-6 py-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <Activity className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight">Curable</h1>
                <p className="text-sm text-slate-400 font-medium">AI-Powered Health Intelligence</p>
              </div>
            </div>
            
            {/* Streak Display - Now based on number of check-ins */}
            <div className="flex items-center gap-6">
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-400/30 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  <span className="text-amber-100 font-semibold text-sm">CHECK-INS</span>
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                  {streakCount}
                </div>
                <div className="text-xs text-amber-200/80 mt-1">total</div>
              </div>
              
              <div className="h-8 w-8 bg-slate-800 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-slate-300" />
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        
        {/* Hero Section - AI Symptom Checker */}
        <div className="mb-12">
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/20 to-amber-500/20 rounded-2xl blur-xl"></div>
            <div className="relative bg-gradient-to-r from-yellow-500/10 to-amber-500/10 backdrop-blur-sm border border-yellow-500/30 rounded-2xl p-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-6">
                  <div className="h-16 w-16 bg-gradient-to-r from-yellow-500 to-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/25">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-2">AI Symptom Analysis</h2>
                    <p className="text-yellow-100/80 text-lg max-w-md">Get instant, intelligent health insights powered by advanced AI</p>
                  </div>
                </div>
                
                <Button 
                  onClick={() => navigate("/symptom-checker")}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-400 hover:to-amber-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                >
                  <Sparkles className="h-5 w-5 mr-2 inline" />
                  Start Analysis
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Two Main Action Buttons */}
        <div className="mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Mental Health Assessment */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-3 text-lg text-white">
                  <Heart className="h-5 w-5 text-pink-400" />
                  Mental Wellness
                </CardTitle>
                <CardDescription className="text-slate-400 text-sm">
                  Emotional health evaluation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={() => navigate("/mental-health-crisis")}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-300"
                >
                  Start Evaluation
                </Button>
              </CardContent>
            </Card>

            {/* Check-in Button - Glowing Effect */}
            <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-2xl blur-lg opacity-50 animate-pulse"></div>
              <div className="relative z-10">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-3 text-lg text-white">
                    <Calendar className="h-5 w-5 text-green-400" />
                    Health Check-in
                  </CardTitle>
                  <CardDescription className="text-slate-400 text-sm">
                    Detailed 3-day assessment
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    onClick={() => navigate("/checkins")}
                    className="w-full py-3 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-400 hover:to-emerald-400 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg shadow-green-500/25 hover:shadow-green-500/40 animate-pulse"
                  >
                    Start Check-in
                  </Button>
                </CardContent>
              </div>
            </Card>
          </div>
        </div>

        {/* Health Trends Dashboard */}
        <div className="mb-12">
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <TrendingUp className="h-7 w-7 text-indigo-400" />
                Health Trends Overview
              </CardTitle>
              <CardDescription className="text-slate-400 text-lg">
                Track all your health metrics in one comprehensive view
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HealthTrendsDashboard />
            </CardContent>
          </Card>
        </div>

      </main>
    </div>
  );
}