# Curable Health Monitoring App - Complete Project Specification

## Project Overview
Build a comprehensive health monitoring web application called "Curable" using React, TypeScript, Tailwind CSS, and Supabase. The app uses AI to monitor health patterns and detect potential issues early through daily/weekly check-ins and symptom tracking.

## Technology Stack
- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS with custom design system
- **Backend**: Supabase (PostgreSQL, Authentication, RLS)
- **Routing**: React Router DOM
- **Charts**: Recharts
- **UI Components**: Radix UI (shadcn/ui)
- **Forms**: React Hook Form with Zod validation
- **State Management**: React Query (TanStack Query)

## Database Schema (Supabase)

### 1. profiles table
```sql
CREATE TABLE public.profiles (
  id uuid NOT NULL DEFAULT auth.uid(),
  email text,
  full_name text,
  age integer,
  gender text,
  weight_kg numeric,
  height_cm numeric,
  bmi numeric,
  blood_group text,
  genotype text,
  onboarding_completed boolean DEFAULT false,
  baseline_established boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);
```

### 2. onboarding table
```sql
CREATE TABLE public.onboarding (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  full_name text,
  date_of_birth date,
  gender text,
  weight_kg numeric,
  height_cm numeric,
  blood_group text,
  location text,
  smoker boolean DEFAULT false,
  alcohol_drinker boolean DEFAULT false,
  chronic_conditions text[],
  long_term_medications text[],
  family_history text[],
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);
```

### 3. daily_questions table
```sql
CREATE TABLE public.daily_questions (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  checkin_type text DEFAULT 'daily',
  questions_shown text[],
  questions_answered jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
```

### 4. health_tracking table
```sql
CREATE TABLE public.health_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  sleep_hours integer,
  water_intake_cups integer,
  exercise_done boolean,
  exercise_intensity text,
  mood text,
  stress_level text,
  pain_experienced boolean,
  pain_location text,
  medications_taken boolean,
  appetite text,
  bowel_movement text,
  urine_changes text,
  new_symptoms text[],
  menstrual_period_date date,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
```

### 5. weekly_checkins table
```sql
CREATE TABLE public.weekly_checkins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_start_date date NOT NULL,
  average_sleep_hours numeric,
  exercise_frequency_per_week integer,
  stress_level text,
  fruit_vegetable_frequency text,
  smoking_drinking_frequency boolean,
  lifestyle_changes text,
  family_history_updates text[],
  created_at timestamp with time zone DEFAULT now(),
  completed_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);
```

### 6. emergency_checkins table
```sql
CREATE TABLE public.emergency_checkins (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  symptom_description text NOT NULL,
  severity_level text NOT NULL,
  symptom_start_time timestamp with time zone,
  getting_worse boolean,
  medication_taken text,
  ai_assessment text,
  urgency_score integer,
  wants_doctor_connection boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);
```

### 7. mental_health_assessments table
```sql
CREATE TABLE public.mental_health_assessments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  feeling_today text,
  thought_heaviness_scale integer,
  stress_anxiety_overwhelm boolean,
  stress_anxiety_details text,
  sleep_changes text,
  hopelessness_loss_interest boolean,
  hopelessness_explanation text,
  has_support_person boolean,
  self_harm_thoughts boolean,
  mood_score integer,
  is_flagged_urgent boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
```

### 8. symptom_assessments table
```sql
CREATE TABLE public.symptom_assessments (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  symptoms text NOT NULL,
  ai_diagnosis text NOT NULL,
  suspected_conditions text[],
  confidence_score integer,
  recommendations text[],
  urgency_level text,
  doctor_reviewed boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
```

### 9. medications table
```sql
CREATE TABLE public.medications (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  medication_name text NOT NULL,
  dosage text,
  frequency text,
  start_date date,
  end_date date,
  is_prescribed boolean DEFAULT false,
  notes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  PRIMARY KEY (id)
);
```

## Row Level Security (RLS) Policies
For ALL tables, implement these policies:
- Users can only view their own data (`auth.uid() = user_id`)
- Users can only insert their own data (`auth.uid() = user_id`) 
- Users can only update their own data (`auth.uid() = user_id`)
- Delete policies vary by table (most don't allow deletes except medications)

## Authentication System
- Use Supabase Auth with email/password
- Create AuthProvider context with useAuth hook
- Implement ProtectedRoute and PublicRoute components
- Auto-redirect based on auth state

## Application Routes
```
/ - Landing page (public)
/auth - Authentication page (public)
/dashboard - Main dashboard (protected)
/symptom-checker - AI symptom analysis (protected)
/health-profile - User health information (protected)
/medications - Medication tracking (protected)
/mental-health-crisis - Mental health assessment (protected)
```

## Core Features & Components

### 1. Landing Page (Index.tsx)
- Hero section with app introduction
- Features overview
- Call-to-action buttons
- Responsive design

### 2. Authentication (Auth.tsx)
- Sign up and sign in forms
- Form validation with Zod
- Supabase integration
- Error handling and loading states

### 3. Main Dashboard (CurableFlow.tsx)
- Onboarding flow for new users
- Tab-based interface: Daily, Weekly, Insights, Profile
- Emergency symptom check button
- Mental health support button
- Health tips and insights

### 4. Onboarding Flow (OnboardingFlow.tsx)
Multi-step form collecting:
- Personal information (name, DOB, gender)
- Physical metrics (height, weight, blood group)
- Lifestyle habits (smoking, drinking)
- Medical history (chronic conditions, medications, family history)
- Save to both onboarding and profiles tables

### 5. Daily Health Questions (DailyHealthQuestions.tsx)
Rotating set of health questions:
- Sleep quality and hours
- Water intake
- Exercise activity
- Mood and stress levels
- Pain and symptoms
- Medication adherence
- Appetite and digestion
- Show 3-5 questions per day
- Save to both daily_questions and health_tracking tables

### 6. Weekly Check-ins (WeeklyCheckin.tsx)
Weekly comprehensive assessment:
- Average sleep patterns
- Exercise frequency
- Stress levels
- Nutrition habits
- Lifestyle changes
- Family history updates

### 7. Emergency Check-ins (EmergencyCheckin.tsx)
Urgent symptom reporting:
- Symptom description
- Severity assessment
- Timeline tracking
- Medication taken
- Doctor connection option
- AI assessment simulation

### 8. Mental Health Crisis (MentalHealthCrisis.tsx)
Step-by-step mental health assessment:
- Current feelings (free text)
- Thought heaviness scale (1-5)
- Stress/anxiety questions
- Sleep changes
- Hopelessness assessment
- Support system check
- Self-harm screening (urgent flagging)
- One question per screen with smooth transitions

### 9. Health Charts (HealthCharts.tsx)
Data visualization using Recharts:
- Sleep & hydration trends (line chart)
- Mood & stress levels (bar chart)
- AI health insights (pie chart of suspected conditions)
- Exercise activity tracking
- 30-day data analysis

### 10. Symptom Checker (SymptomChecker.tsx)
AI-powered symptom analysis:
- Symptom input textarea
- Mock AI diagnosis generation
- Confidence scoring
- Recommendations list
- Urgency assessment
- Doctor review option
- Save assessments to database

## UI/UX Design System

### Color Scheme (HSL values in index.css)
```css
:root {
  --background: 0 0% 100%;
  --foreground: 240 10% 3.9%;
  --primary: 240 5.9% 10%;
  --primary-foreground: 0 0% 98%;
  --secondary: 240 4.8% 95.9%;
  --secondary-foreground: 240 5.9% 10%;
  --muted: 240 4.8% 95.9%;
  --muted-foreground: 240 3.8% 46.1%;
  --accent: 240 4.8% 95.9%;
  --accent-foreground: 240 5.9% 10%;
  --destructive: 0 84.2% 60.2%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 5.9% 90%;
  --input: 240 5.9% 90%;
  --ring: 240 5.9% 10%;
  --radius: 0.5rem;
}

.dark {
  --background: 240 10% 3.9%;
  --foreground: 0 0% 98%;
  --primary: 0 0% 98%;
  --primary-foreground: 240 5.9% 10%;
  --secondary: 240 3.7% 15.9%;
  --secondary-foreground: 0 0% 98%;
  --muted: 240 3.7% 15.9%;
  --muted-foreground: 240 5% 64.9%;
  --accent: 240 3.7% 15.9%;
  --accent-foreground: 0 0% 98%;
  --destructive: 0 62.8% 30.6%;
  --destructive-foreground: 0 0% 98%;
  --border: 240 3.7% 15.9%;
  --input: 240 3.7% 15.9%;
  --ring: 240 4.9% 83.9%;
}
```

### Design Principles
- Dark, calm, futuristic aesthetic
- Consistent with OpenAI-style interface
- Generous white space and clean typography
- Smooth animations and transitions
- Mobile-first responsive design
- Accessibility-focused components

### Key UI Components
- Use shadcn/ui components throughout
- Custom Button variants for different actions
- Card layouts for information grouping
- Progress indicators for multi-step flows
- Toast notifications for user feedback
- Loading states and skeletons

## Data Flow & State Management

### Health Data Collection
1. Onboarding → profiles + onboarding tables
2. Daily questions → daily_questions + health_tracking tables  
3. Weekly check-ins → weekly_checkins table
4. Emergency symptoms → emergency_checkins table
5. Mental health → mental_health_assessments table
6. Symptom analysis → symptom_assessments table

### Analytics & Insights
- Aggregate health_tracking data for charts
- Calculate mood/stress trends over time
- Track symptom patterns and suspected conditions
- Generate AI-driven health insights
- Display progress and correlations

## Security & Privacy
- All user data protected by RLS policies
- Sensitive mental health data flagged appropriately
- No direct access to auth.users table
- Secure data transmission with Supabase
- HIPAA-ready data handling practices

## Future AI Integration Points
- Chatbot analysis of stored health responses
- Personalized health recommendations
- Trend detection and early warning systems
- Correlation analysis between different health metrics
- Automated follow-up questions based on previous responses

## Performance Optimizations
- React Query for efficient data fetching
- Lazy loading for route components
- Optimized database queries with proper indexing
- Image optimization and compression
- Bundle splitting and code optimization

## Testing Requirements
- Component unit tests for critical flows
- Integration tests for Supabase operations
- E2E tests for complete user journeys
- Accessibility testing compliance
- Mobile responsiveness testing

## Deployment
- Vite build optimization
- Supabase project configuration
- Environment variable management
- Progressive Web App capabilities
- Analytics and monitoring setup

This specification represents a complete, production-ready health monitoring application with comprehensive data collection, AI-ready architecture, and enterprise-grade security.