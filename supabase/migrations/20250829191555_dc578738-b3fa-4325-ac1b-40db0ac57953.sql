-- Create health tracking table for daily questions
CREATE TABLE public.health_tracking (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  sleep_hours INTEGER,
  stress_level TEXT CHECK (stress_level IN ('low', 'medium', 'high')),
  water_intake_cups INTEGER,
  exercise_done BOOLEAN,
  exercise_intensity TEXT CHECK (exercise_intensity IN ('light', 'moderate', 'intense')),
  appetite TEXT CHECK (appetite IN ('good', 'poor', 'skipped_meals')),
  pain_experienced BOOLEAN,
  pain_location TEXT,
  new_symptoms TEXT[],
  mood TEXT CHECK (mood IN ('happy', 'neutral', 'sad', 'anxious')),
  medications_taken BOOLEAN,
  bowel_movement TEXT CHECK (bowel_movement IN ('normal', 'loose', 'constipated')),
  urine_changes TEXT CHECK (urine_changes IN ('normal', 'dark', 'painful', 'frequent')),
  menstrual_period_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create symptom assessments table to track AI diagnoses over time
CREATE TABLE public.symptom_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  symptoms TEXT NOT NULL,
  ai_diagnosis TEXT NOT NULL,
  confidence_score INTEGER CHECK (confidence_score >= 0 AND confidence_score <= 100),
  urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high')),
  recommendations TEXT[],
  suspected_conditions TEXT[],
  doctor_reviewed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create medications table for user's current medications
CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  medication_name TEXT NOT NULL,
  dosage TEXT,
  frequency TEXT,
  start_date DATE,
  end_date DATE,
  notes TEXT,
  is_prescribed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily questions tracking table
CREATE TABLE public.daily_questions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  questions_shown TEXT[],
  questions_answered JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, date)
);

-- Enable RLS on all tables
ALTER TABLE public.health_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.symptom_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_questions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for health_tracking
CREATE POLICY "Users can view their own health tracking" 
ON public.health_tracking 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own health tracking" 
ON public.health_tracking 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own health tracking" 
ON public.health_tracking 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for symptom_assessments
CREATE POLICY "Users can view their own symptom assessments" 
ON public.symptom_assessments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own symptom assessments" 
ON public.symptom_assessments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own symptom assessments" 
ON public.symptom_assessments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create RLS policies for medications
CREATE POLICY "Users can view their own medications" 
ON public.medications 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own medications" 
ON public.medications 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own medications" 
ON public.medications 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own medications" 
ON public.medications 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create RLS policies for daily_questions
CREATE POLICY "Users can view their own daily questions" 
ON public.daily_questions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily questions" 
ON public.daily_questions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily questions" 
ON public.daily_questions 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates on health_tracking
CREATE TRIGGER update_health_tracking_updated_at
BEFORE UPDATE ON public.health_tracking
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for automatic timestamp updates on medications
CREATE TRIGGER update_medications_updated_at
BEFORE UPDATE ON public.medications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();