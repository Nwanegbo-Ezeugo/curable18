-- Create onboarding table for user baseline data
CREATE TABLE public.onboarding (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  date_of_birth DATE,
  gender TEXT,
  weight_kg NUMERIC,
  height_cm NUMERIC,
  location TEXT,
  blood_group TEXT,
  smoker BOOLEAN DEFAULT false,
  alcohol_drinker BOOLEAN DEFAULT false,
  chronic_conditions TEXT[],
  long_term_medications TEXT[],
  family_history TEXT[],
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.onboarding ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own onboarding" 
ON public.onboarding 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own onboarding" 
ON public.onboarding 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own onboarding" 
ON public.onboarding 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create weekly check-ins table
CREATE TABLE public.weekly_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start_date DATE NOT NULL,
  average_sleep_hours NUMERIC,
  fruit_vegetable_frequency TEXT,
  exercise_frequency_per_week INTEGER,
  stress_level TEXT,
  smoking_drinking_frequency BOOLEAN,
  family_history_updates TEXT[],
  lifestyle_changes TEXT,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.weekly_checkins ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own weekly checkins" 
ON public.weekly_checkins 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own weekly checkins" 
ON public.weekly_checkins 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own weekly checkins" 
ON public.weekly_checkins 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create emergency checkins table
CREATE TABLE public.emergency_checkins (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  symptom_description TEXT NOT NULL,
  severity_level TEXT NOT NULL CHECK (severity_level IN ('mild', 'moderate', 'severe')),
  symptom_start_time TIMESTAMP WITH TIME ZONE,
  getting_worse BOOLEAN,
  medication_taken TEXT,
  wants_doctor_connection BOOLEAN DEFAULT false,
  ai_assessment TEXT,
  urgency_score INTEGER CHECK (urgency_score >= 1 AND urgency_score <= 10),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.emergency_checkins ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own emergency checkins" 
ON public.emergency_checkins 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own emergency checkins" 
ON public.emergency_checkins 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Add trigger for updated_at
CREATE TRIGGER update_onboarding_updated_at
BEFORE UPDATE ON public.onboarding
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update daily_questions table to include check-in type
ALTER TABLE public.daily_questions 
ADD COLUMN checkin_type TEXT DEFAULT 'daily' CHECK (checkin_type IN ('daily', 'weekly', 'emergency'));

-- Update profiles table to track onboarding completion
ALTER TABLE public.profiles 
ADD COLUMN onboarding_completed BOOLEAN DEFAULT false,
ADD COLUMN baseline_established BOOLEAN DEFAULT false;