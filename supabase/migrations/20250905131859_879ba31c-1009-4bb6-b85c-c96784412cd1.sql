-- Create mental health assessments table
CREATE TABLE public.mental_health_assessments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  feeling_today TEXT,
  thought_heaviness_scale INTEGER,
  stress_anxiety_overwhelm BOOLEAN,
  stress_anxiety_details TEXT,
  sleep_changes TEXT,
  hopelessness_loss_interest BOOLEAN,
  hopelessness_explanation TEXT,
  has_support_person BOOLEAN,
  self_harm_thoughts BOOLEAN,
  is_flagged_urgent BOOLEAN DEFAULT FALSE,
  mood_score INTEGER,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.mental_health_assessments ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own mental health assessments" 
ON public.mental_health_assessments 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own mental health assessments" 
ON public.mental_health_assessments 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mental health assessments" 
ON public.mental_health_assessments 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_mental_health_assessments_updated_at
BEFORE UPDATE ON public.mental_health_assessments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();