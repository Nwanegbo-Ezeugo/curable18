import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');
const supabaseUrl = Deno.env.get('SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get the authorization header to get user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    // Create Supabase client with service role for comprehensive data access
    const supabase = createClient(supabaseUrl!, supabaseServiceKey!);
    
    // Create user client
const token = authHeader.replace('Bearer ', '').trim();
const userSupabase = createClient(supabaseUrl!, Deno.env.get('SUPABASE_ANON_KEY')!, {
  auth: { persistSession: false }
});

// Get user directly from token
const { data: { user }, error: userError } = await userSupabase.auth.getUser(token);
if (userError || !user) {
  console.error('Auth error:', userError);
  return new Response(JSON.stringify({ success: false, error: 'Unauthorized' }), {
    status: 401,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

    const { symptoms } = await req.json();
    
    console.log(`Starting AI diagnosis for user: ${user.id}`);

    // Aggregate all patient data
    const [
      profileResult,
      healthTrackingResult,
      medicationsResult,
      previousAssessmentsResult,
      mentalHealthResult,
      emergencyCheckinsResult
    ] = await Promise.all([
      // User profile
      supabase.from('profiles').select('*').eq('id', user.id).single(),
      
      // Recent health tracking (last 30 days)
      supabase
        .from('health_tracking')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false }),
      
      // Current medications
      supabase
        .from('medications')
        .select('*')
        .eq('user_id', user.id)
        .is('end_date', null),
      
      // Previous symptom assessments (last 6 months)
      supabase
        .from('symptom_assessments')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(10),
      
      // Recent mental health assessments
      supabase
        .from('mental_health_assessments')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5),
      
      // Emergency check-ins (last 90 days)
      supabase
        .from('emergency_checkins')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })
        .limit(5)
    ]);

    const profile = profileResult.data;
    const healthTracking = healthTrackingResult.data || [];
    const medications = medicationsResult.data || [];
    const previousAssessments = previousAssessmentsResult.data || [];
    const mentalHealth = mentalHealthResult.data || [];
    const emergencyCheckins = emergencyCheckinsResult.data || [];

    // Create comprehensive patient context for AI
    const patientContext = {
      demographics: {
        age: profile?.age,
        gender: profile?.gender,
        bmi: profile?.bmi,
        bloodGroup: profile?.blood_group
      },
      currentSymptoms: symptoms,
      recentHealthData: healthTracking.slice(0, 7), // Last week
      currentMedications: medications.map(med => ({
        name: med.medication_name,
        dosage: med.dosage,
        frequency: med.frequency,
        isPrescribed: med.is_prescribed
      })),
      medicalHistory: {
        previousDiagnoses: previousAssessments.map(a => ({
          symptoms: a.symptoms,
          diagnosis: a.ai_diagnosis,
          conditions: a.suspected_conditions,
          urgency: a.urgency_level,
          date: a.created_at
        })),
        mentalHealthStatus: mentalHealth.length > 0 ? {
          latestMoodScore: mentalHealth[0]?.mood_score,
          stressAnxiety: mentalHealth[0]?.stress_anxiety_overwhelm,
          sleepChanges: mentalHealth[0]?.sleep_changes,
          isUrgent: mentalHealth[0]?.is_flagged_urgent
        } : null,
        emergencyEvents: emergencyCheckins.map(ec => ({
          symptoms: ec.symptom_description,
          severity: ec.severity_level,
          urgencyScore: ec.urgency_score,
          date: ec.created_at
        }))
      }
    };

    // Create detailed medical prompt
const medicalPrompt = `You are a confident and highly skilled Nigerian medical doctor AI. 
You speak with authority, clarity, and honesty, like a senior doctor guiding younger patients. 
You understand Nigerian culture, youth lifestyle, and common health challenges in Africa, while also being capable of addressing global conditions.

PATIENT CONTEXT:
${JSON.stringify(patientContext, null, 2)}

INSTRUCTIONS:
1. Use the patient’s full history: demographics, medical history, medications, daily/weekly check-ins, mental health, and current symptoms.
2. Prioritize conditions common among Nigerians and Africans but also consider global conditions.
3. Give a clear, simple, and youth-friendly summary of what is likely wrong with the patient.
4. Suggest one or two quick remedies they can try while waiting to see a doctor.
5. Provide suspected conditions and a confidence score.
6. Assess urgency level and list any red-flag symptoms that need urgent care.
7. Always include a disclaimer: AI can be wrong, and patients must seek a doctor for confirmation.
8. End by asking if they would like a more detailed technical explanation.

Please respond in the following JSON format:
{
  "summary": "Short, simple explanation of what may be wrong",
  "quick_remedy": ["Remedy 1", "Remedy 2"],
  "suspected_conditions": ["Condition A", "Condition B"],
  "confidence_score": 0-100,
  "urgency_level": "low | medium | high",
  "recommendations": ["Next steps", "What to avoid"],
  "red_flags": ["Symptoms that need urgent care"],
  "follow_up_timeline": "Suggested time to see a doctor",
  "disclaimer": "Reminder that AI may be wrong and doctor review is required",
  "ask_more": "Would you like a more detailed explanation?"
}`;

    console.log('Sending request to OpenAI...');

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4.1 ',
        messages: [
          { 
            role: 'system', 
            content: 'You are a medical AI assistant that provides structured preliminary health assessments. Always respond in valid JSON format and include appropriate medical disclaimers.' 
          },
          { role: 'user', content: medicalPrompt }
        ],
        max_completion_tokens: 1000,
        response_format: { type: "json_object" }
      }),
    });

    if (!openAIResponse.ok) {
      const errorText = await openAIResponse.text();
      console.error('OpenAI API error:', errorText);
      throw new Error(`OpenAI API error: ${openAIResponse.status}`);
    }

    const openAIData = await openAIResponse.json();
    const aiDiagnosis = JSON.parse(openAIData.choices[0].message.content);

    console.log('AI diagnosis received:', aiDiagnosis);

    // Save assessment to database
    const { data: savedAssessment, error: saveError } = await supabase
      .from('symptom_assessments')
      .insert({
        user_id: user.id,
        symptoms: symptoms,
        ai_diagnosis: aiDiagnosis.summary,
        suspected_conditions: aiDiagnosis.suspected_conditions,
        recommendations: aiDiagnosis.recommendations,
        confidence_score: aiDiagnosis.confidence_score,
        urgency_level: aiDiagnosis.urgency_level,
        doctor_reviewed: false
      })
      .select()
      .single();

   if (saveError) {
  console.error('Error saving assessment:', JSON.stringify(saveError, null, 2));
  throw new Error(`Failed to save assessment: ${saveError.message || saveError.details || JSON.stringify(saveError)}`);
}


    console.log('Assessment saved successfully');

    // Return comprehensive response
    return new Response(JSON.stringify({
      success: true,
      assessment: {
        id: savedAssessment.id,
        symptoms: symptoms,
        ai_diagnosis: aiDiagnosis.summary,
        suspected_conditions: aiDiagnosis.suspected_conditions,
        recommendations: aiDiagnosis.recommendations,
        confidence_score: aiDiagnosis.confidence_score,
        urgency_level: aiDiagnosis.urgency_level,
        reasoning: aiDiagnosis.reasoning,
        red_flags: aiDiagnosis.red_flags || [],
        follow_up_timeline: aiDiagnosis.follow_up_timeline,
        created_at: savedAssessment.created_at
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in ai-diagnose function:', error);
    const message =
      error instanceof Error
        ? error.message
        : typeof error === 'string'
        ? error
        : JSON.stringify(error);
    return new Response(JSON.stringify({ 
      success: false,
      error: message
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

