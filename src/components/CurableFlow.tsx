import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AlertTriangle, TrendingUp, User, Heart, Sparkles, BarChart3, Brain, Activity, Trophy } from "lucide-react";
import WeeklyCheckin from "./WeeklyCheckin";
import HealthCharts from "./HealthCharts";

export default function CurableFlow() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [onboardingCompleted, setOnboardingCompleted] = useState(false);

  useEffect(() => {
    if (user) {
      checkOnboardingStatus();
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
            
            {/* Streak Display - Moved to Header */}
            <div className="flex items-center gap-6">
              <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 backdrop-blur-sm border border-amber-400/30 rounded-2xl p-4 text-center">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <Trophy className="h-5 w-5 text-amber-400" />
                  <span className="text-amber-100 font-semibold text-sm">STREAK</span>
                </div>
                <div className="text-3xl font-bold bg-gradient-to-r from-amber-300 to-orange-300 bg-clip-text text-transparent">
                  12
                </div>
                <div className="text-xs text-amber-200/80 mt-1">days</div>
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

        {/* Action Buttons Row - Only Mental Health Assessment */}
        <div className="mb-12">
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 group max-w-2xl mx-auto">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl text-white">
                <Heart className="h-6 w-6 text-pink-400" />
                Mental Wellness Assessment
              </CardTitle>
              <CardDescription className="text-slate-400">
                Professional emotional health evaluation and support
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={() => navigate("/mental-health-crisis")}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold rounded-xl transition-all duration-300"
              >
                Start Evaluation
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* AI Insights Section */}
        <div className="mb-12">
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <BarChart3 className="h-7 w-7 text-indigo-400" />
                AI Health Insights
              </CardTitle>
              <CardDescription className="text-slate-400 text-lg">
                Based on your latest check-ins and patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <HealthCharts />
            </CardContent>
          </Card>
        </div>

        {/* Weekly Check-in Component */}
        <div className="mb-12">
          <Card className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8">
            <CardHeader className="pb-6">
              <CardTitle className="flex items-center gap-3 text-2xl text-white">
                <TrendingUp className="h-7 w-7 text-blue-400" />
                Weekly Health Overview
              </CardTitle>
              <CardDescription className="text-slate-400 text-lg">
                Your weekly patterns help us understand your health baseline
              </CardDescription>
            </CardHeader>
            <CardContent>
              <WeeklyCheckin onComplete={() => {}} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}