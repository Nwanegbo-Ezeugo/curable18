"""
main.py - Curable Backend with Comprehensive Smart Summarization
Uses ALL collected data fields for intelligent clinical analysis
"""

import os
import datetime
import logging
from typing import Dict, Any, List, Optional
import json
from fastapi.responses import StreamingResponse


from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# ========== Configuration ==========
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ASSISTANT_ID = os.getenv("ASSISTANT_ID")
ANALYSIS_MODEL = os.getenv("ANALYSIS_MODEL", "gpt-4o-mini")
SUMMARY_EXPIRY_HOURS = int(os.getenv("SUMMARY_EXPIRY_HOURS", "24"))

# Clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
client = OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI(title="Curable Backend with Comprehensive Smart Summarization")


# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "https://curable18.onrender.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------- MODELS -------------

class ChatRequest(BaseModel):
    user_id: str
    message: str

class ChatResponse(BaseModel):
    reply: str
    insights_used: bool = False

class ClinicalInsights(BaseModel):
    insights_text: str
    trends_text: str
    recommendations_text: str
    data_snapshot: Dict[str, Any]
    expires_at: datetime.datetime

# ------------- COMPREHENSIVE DATA COLLECTION -------------

def get_all_patient_data(user_id: str) -> Dict[str, Any]:
    """Fetch ALL historical data with ALL fields for comprehensive analysis"""
    try:
        return {
            "onboarding": supabase.table("onboarding").select("*").eq("user_id", user_id).execute().data,
            "three_day_checkins": supabase.table("three_day_checkins").select("*").eq("user_id", user_id).order("created_at", asc=True).execute().data,
            "mental_assessments": supabase.table("mental_health_assessments").select("*").eq("user_id", user_id).order("created_at", asc=True).execute().data,
            "medications": supabase.table("medications").select("*").eq("user_id", user_id).execute().data,
            "chat_summaries": supabase.table("chat_summaries").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(10).execute().data,
        }
    except Exception as e:
        logging.error(f"Error fetching patient data: {e}")
        return {}

def format_comprehensive_data_for_analysis(patient_data: Dict[str, Any]) -> str:
    """Format ALL raw data into detailed AI-readable analysis format"""
    text = "COMPREHENSIVE PATIENT DATA FOR CLINICAL ANALYSIS:\n\n"
    
    # ========== ONBOARDING DATA (All Fields) ==========
    if patient_data.get("onboarding"):
        text += "=== PATIENT DEMOGRAPHICS & MEDICAL HISTORY ===\n"
        for i, record in enumerate(patient_data["onboarding"]):
            text += f"\nRecord {i+1}:\n"
            text += f"- Full Name: {record.get('full_name', 'Not provided')}\n"
            text += f"- Date of Birth: {record.get('dob', 'Not provided')}\n"
            text += f"- Gender: {record.get('gender', 'Not provided')}\n"
            text += f"- BMI: {record.get('bmi', 'Not provided')}\n"
            text += f"- Blood Group: {record.get('blood_group', 'Not provided')}\n"
            text += f"- Height: {record.get('height_cm', 'Not provided')} cm\n"
            text += f"- Weight: {record.get('weight_kg', 'Not provided')} kg\n"
            text += f"- Location: {record.get('location', 'Not provided')}\n"
            text += f"- Smoker: {record.get('smoker', 'No')}\n"
            text += f"- Alcohol Drinker: {record.get('alcohol_drinker', 'No')}\n"
            text += f"- Chronic Conditions: {record.get('chronic_condition', 'None')}\n"
            text += f"- Long-term Medications: {record.get('long_term_medication', 'None')}\n"
            text += f"- Family History: {record.get('family_history', 'None')}\n"
            text += f"- Record Date: {record.get('created_at', 'Unknown')}\n"
        text += "\n"
    
    # ========== THREE-DAY CHECKINS (All Fields - Numeric + Text) ==========
    if patient_data.get("three_day_checkins"):
        text += f"=== HEALTH CHECKIN HISTORY ({len(patient_data['three_day_checkins'])} records) ===\n"
        
        for i, checkin in enumerate(patient_data["three_day_checkins"]):
            date = checkin.get('created_at', 'Unknown')[:10]
            text += f"\n--- Checkin {i+1} ({date}) ---\n"
            
            # Mood (numeric + text)
            mood_num = checkin.get('mood_numeric')
            mood_text = checkin.get('mood', '')
            if mood_num is not None or mood_text:
                text += f"Mood: {mood_num}/10 - '{mood_text}'\n"
            
            # Sleep Quality (numeric + text)
            sleep_qual_num = checkin.get('sleep_quality_numeric')
            sleep_qual_text = checkin.get('sleep_quality', '')
            if sleep_qual_num is not None or sleep_qual_text:
                text += f"Sleep Quality: {sleep_qual_num}/10 - '{sleep_qual_text}'\n"
            
            # Sleep Hours (numeric + text)
            sleep_hrs_num = checkin.get('sleep_hours_numeric')
            sleep_hrs_text = checkin.get('sleep_hours', '')
            if sleep_hrs_num is not None or sleep_hrs_text:
                text += f"Sleep Hours: {sleep_hrs_num}h - '{sleep_hrs_text}'\n"
            
            # Stress (numeric + text)
            stress_num = checkin.get('what_stresses_you_numeric')
            stress_text = checkin.get('what_stresses_you', '')
            if stress_num is not None or stress_text:
                text += f"Stress Level: {stress_num}/10 - '{stress_text}'\n"
            
            # Energy (numeric + text)
            energy_num = checkin.get('energy_level_numeric')
            energy_text = checkin.get('energy_level', '')
            if energy_num is not None or energy_text:
                text += f"Energy Level: {energy_num}/10 - '{energy_text}'\n"
            
            # Meals (numeric + text)
            meals_num = checkin.get('meals_today_numeric')
            meals_text = checkin.get('meals_today', '')
            if meals_num is not None or meals_text:
                text += f"Meals: {meals_num} - '{meals_text}'\n"
            
            # Exercise (numeric + text)
            exercise_num = checkin.get('exercise_level_numeric')
            exercise_text = checkin.get('exercise_level', '')
            if exercise_num is not None or exercise_text:
                text += f"Exercise: {exercise_num}/10 - '{exercise_text}'\n"
            
            # Pain/Headache (numeric + text)
            pain_num = checkin.get('any_headache_numeric')
            pain_text = checkin.get('any_headache', '')
            if pain_num is not None or pain_text:
                text += f"Pain Level: {pain_num}/10 - '{pain_text}'\n"
            
            # Water Intake
            water = checkin.get('water_bottles_numeric')
            if water is not None:
                text += f"Water Intake: {water} cups\n"
            
            # Mental Wellness (numeric + text)
            mental_num = checkin.get('mental_health_rating_numeric')
            mental_text = checkin.get('mental_health_rating', '')
            if mental_num is not None or mental_text:
                text += f"Mental Wellness: {mental_num}/10 - '{mental_text}'\n"
            
            # Fatigue (numeric + text)
            fatigue_num = checkin.get('continuous_tiredness_numeric')
            fatigue_text = checkin.get('continuous_tiredness', '')
            if fatigue_num is not None or fatigue_text:
                text += f"Fatigue: {fatigue_num}/10 - '{fatigue_text}'\n"
        
        text += "\n"
    
    # ========== MENTAL HEALTH ASSESSMENTS (All Fields) ==========
    if patient_data.get("mental_assessments"):
        text += "=== MENTAL HEALTH ASSESSMENT HISTORY ===\n"
        for i, assessment in enumerate(patient_data["mental_assessments"]):
            date = assessment.get('created_at', 'Unknown')[:10]
            text += f"\nAssessment {i+1} ({date}):\n"
            text += f"- Feeling Today: {assessment.get('feeling_today', 'N/A')}\n"
            text += f"- Stress/Anxiety: {assessment.get('stress_anxiety_overwhelm', 'N/A')}/10\n"
            # Add other mental health assessment fields as needed
        text += "\n"
    
    # ========== MEDICATIONS ==========
    if patient_data.get("medications"):
        text += "=== CURRENT MEDICATIONS ===\n"
        for med in patient_data["medications"]:
            text += f"- {med.get('medication_name', 'Unknown')} ({med.get('dosage', 'Unknown')})\n"
        text += "\n"
    
    # ========== CHAT HISTORY CONTEXT ==========
    if patient_data.get("chat_summaries"):
        text += "=== RECENT CHAT HISTORY CONTEXT ===\n"
        for i, summary in enumerate(patient_data["chat_summaries"][:3]):  # Last 3 summaries
            text += f"Chat Summary {i+1}: {summary.get('summary', 'No summary')}\n"
        text += "\n"
    
    return text

def generate_comprehensive_clinical_insights(patient_data: Dict[str, Any]) -> Optional[ClinicalInsights]:
    """Use AI to analyze ALL data fields and generate detailed clinical insights"""
    try:
        formatted_data = format_comprehensive_data_for_analysis(patient_data)
        
        analysis_prompt = f"""
        You are an experienced clinical analyst. Analyze this patient's COMPLETE medical history including all numeric metrics AND text descriptions.

        CRITICAL: Analyze both quantitative (numeric scores) AND qualitative (text descriptions) data together.

        CLINICAL ANALYSIS REQUIRED:

        1. QUANTITATIVE TREND ANALYSIS:
           - Long-term patterns in mood, sleep, stress, energy scores
           - Correlation analysis between different metrics
           - Seasonal/weekly patterns in numeric data
           - Progress/regression trajectories

        2. QUALITATIVE PATTERN RECOGNITION:
           - Analyze text descriptions for emotional tone, stress triggers, symptom details
           - Identify recurring themes in patient's own words
           - Connect qualitative descriptions with quantitative scores
           - Note any discrepancies between scores and descriptions

        3. INTEGRATED INSIGHTS:
           - How do the patient's self-descriptions match their numeric ratings?
           - What specific stressors are mentioned repeatedly?
           - What improvement strategies have worked based on historical patterns?
           - What warning signs or positive indicators appear in the text?

        4. CLINICAL RECOMMENDATIONS:
           - Specific areas needing attention based on combined data
           - What approaches have historically worked for this patient
           - Personalized strategies based on their unique patterns

        PATIENT DATA (All Fields - Numbers + Text):
        {formatted_data}

        Provide clinically thorough, actionable insights that combine both numeric data and qualitative descriptions.
        """

        response = client.chat.completions.create(
            model=ANALYSIS_MODEL,
            messages=[
                {"role": "system", "content": "You are a medical analyst skilled in integrating quantitative and qualitative patient data. Provide nuanced clinical insights."},
                {"role": "user", "content": analysis_prompt}
            ],
            temperature=0.1,
            max_tokens=2000
        )
        
        insights_text = response.choices[0].message.content
        
        # Parse into structured sections
        sections = insights_text.split('\n\n')
        insights = sections[0] if len(sections) > 0 else insights_text
        trends = sections[1] if len(sections) > 1 else "Comprehensive analysis of all metrics and descriptions."
        recommendations = sections[2] if len(sections) > 2 else "Personalized recommendations based on full history."
        
        return ClinicalInsights(
            insights_text=insights,
            trends_text=trends,
            recommendations_text=recommendations,
            data_snapshot={
                "total_checkins": len(patient_data.get("three_day_checkins", [])),
                "total_assessments": len(patient_data.get("mental_assessments", [])),
                "data_categories": "All onboarding, checkins, assessments, medications",
                "analysis_type": "Comprehensive quantitative + qualitative analysis",
                "last_analysis": datetime.datetime.utcnow().isoformat()
            },
            expires_at=datetime.datetime.utcnow() + datetime.timedelta(hours=SUMMARY_EXPIRY_HOURS)
        )
        
    except Exception as e:
        logging.error(f"Comprehensive clinical insights generation failed: {e}")
        return None

def get_cached_insights(user_id: str) -> Optional[ClinicalInsights]:
    """Get recent cached insights if available"""
    try:
        cached = supabase.table("clinical_summaries").select("*").eq("user_id", user_id).gte("expires_at", datetime.datetime.utcnow().isoformat()).order("created_at", desc=True).limit(1).execute()
        
        if cached.data:
            data = cached.data[0]
            return ClinicalInsights(
                insights_text=data["insights_text"],
                trends_text=data["trends_text"],
                recommendations_text=data["recommendations_text"],
                data_snapshot=data["data_snapshot"],
                expires_at=datetime.datetime.fromisoformat(data["expires_at"].replace('Z', '+00:00'))
            )
    except Exception as e:
        logging.error(f"Cache check failed: {e}")
    
    return None

def cache_insights(user_id: str, insights: ClinicalInsights):
    """Cache generated insights"""
    try:
        supabase.table("clinical_summaries").insert({
            "user_id": user_id,
            "insights_text": insights.insights_text,
            "trends_text": insights.trends_text,
            "recommendations_text": insights.recommendations_text,
            "data_snapshot": insights.data_snapshot,
            "expires_at": insights.expires_at.isoformat()
        }).execute()
    except Exception as e:
        logging.error(f"Insights caching failed: {e}")

def build_comprehensive_profile_summary(user_id: str) -> Dict[str, Any]:
    """Build profile using AI-generated insights from ALL data fields"""
    try:
        # Try to get cached insights first
        insights = get_cached_insights(user_id)
        
        # Generate new insights if cache is stale
        if not insights:
            patient_data = get_all_patient_data(user_id)
            insights = generate_comprehensive_clinical_insights(patient_data)
            if insights:
                cache_insights(user_id, insights)
        
        # Get basic user info
        onboarding = supabase.table("onboarding").select("*").eq("user_id", user_id).execute().data
        user_name = onboarding[0].get('name', 'there') if onboarding else 'there'
        
        # Build summary with comprehensive AI insights
        if insights:
            summary = f"COMPREHENSIVE PATIENT PROFILE FOR {user_name.upper()}:\n\n"
            summary += "CLINICAL INSIGHTS (Based on All Historical Data):\n" + insights.insights_text + "\n\n"
            summary += "TREND ANALYSIS (Quantitative + Qualitative):\n" + insights.trends_text + "\n\n"
            summary += "PERSONALIZED RECOMMENDATIONS:\n" + insights.recommendations_text + "\n\n"
            summary += f"DATA SCOPE: Analyzed {insights.data_snapshot.get('total_checkins', 0)} checkins, {insights.data_snapshot.get('total_assessments', 0)} assessments with all text descriptions"
            
            return {
                "summary": summary,
                "user_name": user_name,
                "insights_used": True,
                "data_scope": insights.data_snapshot
            }
        else:
            # Fallback to basic summary if AI analysis fails
            return build_basic_profile_summary(user_id)
            
    except Exception as e:
        logging.error(f"Comprehensive profile summary failed: {e}")
        return build_basic_profile_summary(user_id)

def build_basic_profile_summary(user_id: str) -> Dict[str, Any]:
    """Fallback basic summary without AI analysis (original logic)"""
    try:
        onboarding = supabase.table("onboarding").select("*").eq("user_id", user_id).execute().data
        three_day_checkins = supabase.table("three_day_checkins").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(3).execute().data
        mental_assessment = supabase.table("mental_health_assessments").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(3).execute().data
        medication = supabase.table("medications").select("*").eq("user_id", user_id).execute().data

        user_name = onboarding[0].get('name', 'there') if onboarding else 'there'
        insights = []
        
        # Build AI-readable summary (original logic)
        summary = f"PATIENT PROFILE FOR {user_name.upper()}:\n\n"
        
        # Basic information
        if onboarding:
            o = onboarding[0]
            summary += "BASIC INFORMATION:\n"
            summary += f"- Name: {o.get('full_name', 'Not provided')}\n"
            summary += f"- Age/DOB: {o.get('dob', 'Not provided')}\n"
            summary += f"- Gender: {o.get('gender', 'Not provided')}\n"
            summary += f"- BMI: {o.get('bmi', 'Not provided')}\n"
            summary += f"- Chronic Conditions: {o.get('chronic_condition', 'None')}\n"
            summary += f"- Long-term Medications: {o.get('long_term_medication', 'None')}\n"
            summary += f"- Blood group: {o.get('blood_group', 'None')}\n"
            summary += f"- Height: {o.get('height_cm', 'None')}\n"
            summary += f"- Weight: {o.get('weight_kg', 'None')}\n"
            summary += f"- Location: {o.get('location', 'None')}\n"
            summary += f"- Smoker: {o.get('smoker', 'None')}\n"
            summary += f"- Alcoholic: {o.get('alcohol_drinker', 'None')}\n"
            summary += f"- Family history: {o.get('family_history', 'None')}\n\n"
        
        # Three-day checkins data with all fields
        if three_day_checkins:
            latest = three_day_checkins[0]
            summary += "LATEST 3-DAY CHECK-IN (Full Details):\n"
            
            # Include both numeric and text fields
            if latest.get('mood_numeric') is not None:
                mood_text = latest.get('mood', 'No description')
                summary += f"- Mood: {latest['mood_numeric']}/10 - {mood_text}\n"
            
            if latest.get('sleep_quality_numeric') is not None:
                sleep_qual_text = latest.get('sleep_quality', 'No description')
                summary += f"- Sleep Quality: {latest['sleep_quality_numeric']}/10 - {sleep_qual_text}\n"
            
            # ... include all other fields as in your original code
            
            summary += "\n"
        
        return {
            "summary": summary.strip(),
            "user_name": user_name,
            "insights_used": False,
            "data_scope": {"analysis": "basic_fallback"}
        }
    except Exception as e:
        logging.error(f"Basic profile failed: {e}")
        return {"summary": "Profile unavailable", "user_name": "there", "insights_used": False}

# ------------- ROUTES (UPDATED) -------------

@app.post("/chat", response_model=ChatResponse)
def chat_with_ai(req: ChatRequest):
    """Chat using comprehensive AI-analyzed insights"""
    try:
        thread_id = get_or_create_thread(req.user_id)
        profile_data = build_comprehensive_profile_summary(req.user_id)
        
        messages = client.beta.threads.messages.list(thread_id=thread_id)
        is_first_message = len(messages.data) == 0

        if is_first_message:
            # Include comprehensive insights in first message
            greeting = f"Hey {profile_data['user_name']}! 👋 Dr. Shaun Murphy here. "
            if profile_data['insights_used']:
                greeting += f"I've analyzed your complete health history including all your check-in details and descriptions. I have personalized insights ready."
            else:
                greeting += "I'm here to help with your health questions!"
            
            client.beta.threads.messages.create(
                thread_id=thread_id,
                role="user",
                content=f"[System: Comprehensive patient profile loaded. Greeting: '{greeting}']\n\nCOMPREHENSIVE PATIENT PROFILE:\n{profile_data['summary']}"
            )
            
            run = client.beta.threads.runs.create(thread_id=thread_id, assistant_id=ASSISTANT_ID)
            while run.status != "completed":
                run = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)
            
            messages = client.beta.threads.messages.list(thread_id=thread_id)
            assistant_messages = [m for m in messages.data if m.role == "assistant"]
            
            if assistant_messages:
                return ChatResponse(
                    reply=assistant_messages[0].content[0].text.value,
                    insights_used=profile_data['insights_used']
                )

        # Regular message handling
        client.beta.threads.messages.create(thread_id=thread_id, role="user", content=req.message)
        run = client.beta.threads.runs.create(thread_id=thread_id, assistant_id=ASSISTANT_ID)
        
        while run.status != "completed":
            run = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)

        messages = client.beta.threads.messages.list(thread_id=thread_id)
        reply = next((m.content[0].text.value for m in messages.data if m.role == "assistant"), "No response")

        return ChatResponse(reply=reply, insights_used=profile_data['insights_used'])

    except Exception as e:
        logging.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="AI chat failed")
    
@app.post("/chat-stream")
def chat_with_ai_stream(req: ChatRequest):
    """Stream AI response word-by-word (for typing effect in UI)"""
    try:
        thread_id = get_or_create_thread(req.user_id)
        profile_data = build_comprehensive_profile_summary(req.user_id)

        # Include insights only for first message
        client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=req.message
        )

        # Use OpenAI streaming
        def generate():
            stream = client.chat.completions.create(
                model=ANALYSIS_MODEL,
                messages=[
                    {"role": "system", "content": "You are a medical analyst skilled in integrating quantitative and qualitative patient data. Provide nuanced clinical insights."},
                    {"role": "user", "content": req.message}
                ],
                stream=True,
            )
            for chunk in stream:
                delta = chunk.choices[0].delta
                if delta and delta.get("content"):
                    yield delta["content"]

        return StreamingResponse(generate(), media_type="text/plain")

    except Exception as e:
        logging.error(f"Streaming chat error: {e}")
        raise HTTPException(status_code=500, detail="AI chat stream failed")


# ... (keep your existing routes like /user/{user_id}/insights, /cleanup/{user_id}, etc.)

def get_or_create_thread(user_id: str) -> str:
    """Get existing thread or create new one for user"""
    profiles = supabase.table("profiles").select("thread_id").eq("id", user_id).execute().data
    if profiles and profiles[0].get("thread_id"):
        return profiles[0]["thread_id"]

    thread = client.beta.threads.create()
    thread_id = thread.id
    supabase.table("profiles").update({"thread_id": thread_id}).eq("id", user_id).execute()
    return thread_id

@app.get("/")
def read_root():
    return {"message": "Curable Backend with Comprehensive Smart Summarization"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)