"""
main.py
Backend API for Curable with Three-Day Checkins
- Exposes endpoints for profile summary, chat with AI assistant, and cleanup.
- Uses FastAPI, Supabase, and OpenAI Assistants API.
"""

import os
import datetime
import logging
from typing import Dict, Any

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from openai import OpenAI
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# ========== Setup ==========
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ASSISTANT_ID = os.getenv("ASSISTANT_ID")

# Clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
client = OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI(title="Curable Backend")

# Allow frontend calls
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

# ------------- HELPERS -------------

def build_profile_summary(user_id: str) -> Dict[str, Any]:
    """
    Build comprehensive patient profile from three_day_checkins and other data
    """
    try:
        onboarding = supabase.table("onboarding").select("*").eq("user_id", user_id).execute().data
        three_day_checkins = supabase.table("three_day_checkins").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(3).execute().data
        mental_assesment = supabase.table("mental_health_assessment").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(3).execute().data
        medication = supabase.table("medications").select("*").eq("user_id", user_id).execute().data

        user_name = onboarding[0].get('name', 'there') if onboarding else 'there'
        insights = []
        
        # Build AI-readable summary
        summary = f"PATIENT PROFILE FOR {user_name.upper()}:\n\n"
        
        # Basic information
        if onboarding:
            o = onboarding[0]
            summary += "BASIC INFORMATION:\n"
            summary += f"- Name: {o.get('name', 'Not provided')}\n"
            summary += f"- Age/DOB: {o.get('dob', 'Not provided')}\n"
            summary += f"- Gender: {o.get('gender', 'Not provided')}\n"
            summary += f"- BMI: {o.get('bmi', 'Not provided')}\n"
            summary += f"- Chronic Conditions: {o.get('chronic_condition', 'None')}\n"
            summary += f"- Long-term Medications: {o.get('long_term_medication', 'None')}\n\n"
        
        # Three-day checkins data
        if three_day_checkins:
            latest = three_day_checkins[0]
            summary += "LATEST 3-DAY CHECK-IN:\n"
            
            # Mood and mental
            if latest.get('mood_numeric') is not None:
                mood_text = latest.get('mood', 'No description')[:100] if latest.get('mood') else 'No description'
                summary += f"- Mood: {latest['mood_numeric']}/10 - {mood_text}\n"
                if latest['mood_numeric'] <= 4:
                    insights.append(f"mood is low at {latest['mood_numeric']}/10")
                elif latest['mood_numeric'] >= 8:
                    insights.append(f"mood is excellent at {latest['mood_numeric']}/10")
            
            if latest.get('sleep_quality_numeric') is not None:
                sleep_qual_text = latest.get('sleep_quality', 'No description')[:100] if latest.get('sleep_quality') else 'No description'
                summary += f"- Sleep Quality: {latest['sleep_quality_numeric']}/10 - {sleep_qual_text}\n"
            
            if latest.get('sleep_hours_numeric') is not None:
                sleep_hrs_text = latest.get('sleep_hours', 'No description')[:100] if latest.get('sleep_hours') else 'No description'
                summary += f"- Sleep Hours: {latest['sleep_hours_numeric']} hours - {sleep_hrs_text}\n"
                if latest['sleep_hours_numeric'] < 6:
                    insights.append(f"sleeping only {latest['sleep_hours_numeric']} hours")
                elif latest['sleep_hours_numeric'] > 9:
                    insights.append(f"sleeping {latest['sleep_hours_numeric']} hours - well rested")
            
            # Stress and energy
            if latest.get('what_stresses_you_numeric') is not None:
                stress_text = latest.get('what_stresses_you', 'No description')[:100] if latest.get('what_stresses_you') else 'No description'
                summary += f"- Stress Level: {latest['what_stresses_you_numeric']}/10 - {stress_text}\n"
                if latest['what_stresses_you_numeric'] >= 7:
                    insights.append(f"stress level is high at {latest['what_stresses_you_numeric']}/10")
            
            if latest.get('energy_level_numeric') is not None:
                energy_text = latest.get('energy_level', 'No description')[:100] if latest.get('energy_level') else 'No description'
                summary += f"- Energy Level: {latest['energy_level_numeric']}/10 - {energy_text}\n"
                if latest['energy_level_numeric'] <= 4:
                    insights.append(f"energy level is low at {latest['energy_level_numeric']}/10")
            
            # Physical health
            if latest.get('meals_today_numeric') is not None:
                meals_text = latest.get('meals_today', 'No description')[:100] if latest.get('meals_today') else 'No description'
                summary += f"- Meals Today: {latest['meals_today_numeric']} - {meals_text}\n"
                if latest['meals_today_numeric'] < 3:
                    insights.append(f"having only {latest['meals_today_numeric']} meals per day")
            
            if latest.get('exercise_level_numeric') is not None:
                exercise_text = latest.get('exercise_level', 'No description')[:100] if latest.get('exercise_level') else 'No description'
                summary += f"- Exercise Intensity: {latest['exercise_level_numeric']}/10 - {exercise_text}\n"
                if latest['exercise_level_numeric'] >= 7:
                    insights.append(f"exercise intensity is high at {latest['exercise_level_numeric']}/10")
            
            if latest.get('any_headache_numeric') is not None:
                pain_text = latest.get('any_headache', 'No description')[:100] if latest.get('any_headache') else 'No description'
                summary += f"- Pain Level: {latest['any_headache_numeric']}/10 - {pain_text}\n"
                if latest['any_headache_numeric'] >= 5:
                    insights.append(f"experiencing pain at level {latest['any_headache_numeric']}/10")
            
            # Additional metrics
            if latest.get('water_bottles_numeric') is not None:
                summary += f"- Water Intake: {latest['water_bottles_numeric']} cups\n"
            
            if latest.get('mental_health_rating_numeric') is not None:
                mental_text = latest.get('mental_health_rating', 'No description')[:100] if latest.get('mental_health_rating') else 'No description'
                summary += f"- Mental Wellness: {latest['mental_health_rating_numeric']}/10 - {mental_text}\n"
            
            if latest.get('continuous_tiredness_numeric') is not None:
                fatigue_text = latest.get('continuous_tiredness', 'No description')[:100] if latest.get('continuous_tiredness') else 'No description'
                summary += f"- Fatigue Level: {latest['continuous_tiredness_numeric']}/10 - {fatigue_text}\n"
                if latest['continuous_tiredness_numeric'] >= 7:
                    insights.append(f"fatigue level is high at {latest['continuous_tiredness_numeric']}/10")
            
            summary += "\n"
        
        # Mental health assessments
        if mental_assesment:
            summary += "RECENT MENTAL HEALTH ASSESSMENTS:\n"
            for i, m in enumerate(mental_assesment[:2]):
                summary += f"- Mood: {m.get('feeling_today', 'N/A')}, Stress: {m.get('stress_anxiety_overwhelm', 'N/A')}/10\n"
            summary += "\n"
        
        # Medications
        if medication:
            summary += "CURRENT MEDICATIONS:\n"
            for med in medication:
                summary += f"- {med.get('medication_name', 'Unknown')} ({med.get('dosage', 'Unknown')})\n"
            summary += "\n"
        
        # Trend analysis
        if len(three_day_checkins) >= 2:
            current = three_day_checkins[0]
            previous = three_day_checkins[1]
            
            if current.get('mood_numeric') and previous.get('mood_numeric'):
                diff = current['mood_numeric'] - previous['mood_numeric']
                if abs(diff) >= 2:
                    trend = "improved" if diff > 0 else "declined"
                    insights.append(f"mood has {trend} from {previous['mood_numeric']} to {current['mood_numeric']}/10")
            
            if current.get('sleep_hours_numeric') and previous.get('sleep_hours_numeric'):
                diff = current['sleep_hours_numeric'] - previous['sleep_hours_numeric']
                if abs(diff) >= 1:
                    trend = "increased" if diff > 0 else "decreased"
                    insights.append(f"sleep has {trend} from {previous['sleep_hours_numeric']} to {current['sleep_hours_numeric']} hours")
        
        # Add insights section
        if insights:
            summary += "KEY INSIGHTS FOR PERSONALIZATION:\n"
            for insight in insights[:4]:
                summary += f"- {insight}\n"

        return {
            "summary": summary.strip(),
            "user_name": user_name,
            "insights": insights,
            "has_data": len(three_day_checkins) > 0,
            "latest_checkin": three_day_checkins[0] if three_day_checkins else None
        }

    except Exception as e:
        logging.error(f"Error building profile summary: {e}")
        return {
            "summary": "No profile data available.", 
            "user_name": "there", 
            "insights": [], 
            "has_data": False, 
            "latest_checkin": None
        }

def get_or_create_thread(user_id: str) -> str:
    """
    Get existing thread or create new one for user
    """
    profiles = supabase.table("profiles").select("thread_id").eq("id", user_id).execute().data
    if profiles and profiles[0].get("thread_id"):
        return profiles[0]["thread_id"]

    thread = client.beta.threads.create()
    thread_id = thread.id
    supabase.table("profiles").update({"thread_id": thread_id}).eq("id", user_id).execute()
    return thread_id

def generate_proactive_greeting(user_name: str, insights: list, latest_checkin: Dict[str, Any]) -> str:
    """
    Generate Dr. Shaun Murphy style greeting
    """
    if not insights:
        return f"Hey {user_name}! 👋 Dr. Shaun Murphy here, your medical assistant in your pocket. I'm here to help you with any health questions!"
    
    greeting = f"Hey {user_name}! 👋 Dr. Shaun Murphy here. "
    greeting += f"I've {insights[0]}"
    
    if len(insights) > 1:
        greeting += f" and also {insights[1]}"
    
    # Add context based on specific issues
    if latest_checkin:
        if latest_checkin.get('what_stresses_you_numeric', 0) >= 7:
            greeting += ". Let's talk about managing that stress."
        elif latest_checkin.get('sleep_hours_numeric', 0) < 6:
            greeting += ". Good sleep is crucial for your health."
        elif latest_checkin.get('mood_numeric', 0) <= 4:
            greeting += ". I want to make sure you're feeling supported."
        else:
            greeting += ". How can I help you today?"
    
    return greeting

# ------------- ROUTES -------------

@app.post("/chat", response_model=ChatResponse)
def chat_with_ai(req: ChatRequest):
    """
    Handle chat with AI assistant using three_day_checkins data
    """
    try:
        thread_id = get_or_create_thread(req.user_id)
        profile_data = build_profile_summary(req.user_id)
        
        messages = client.beta.threads.messages.list(thread_id=thread_id)
        is_first_message = len(messages.data) == 0

        # First message - send proactive greeting
        if is_first_message and profile_data["has_data"]:
            proactive_greeting = generate_proactive_greeting(
                profile_data["user_name"], 
                profile_data["insights"], 
                profile_data["latest_checkin"]
            )
            
            # Send greeting instruction and profile to assistant
            client.beta.threads.messages.create(
                thread_id=thread_id,
                role="user",
                content=f"[System: Patient has opened chat. Provide this proactive greeting: '{proactive_greeting}']"
            )
            
            client.beta.threads.messages.create(
                thread_id=thread_id,
                role="user",
                content=f"Here is my complete medical profile:\n{profile_data['summary']}"
            )
            
            # Generate greeting response
            run = client.beta.threads.runs.create(thread_id=thread_id, assistant_id=ASSISTANT_ID)
            while True:
                status = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)
                if status.status == "completed":
                    break
            
            messages = client.beta.threads.messages.list(thread_id=thread_id)
            assistant_messages = [m for m in messages.data if m.role == "assistant"]
            
            if assistant_messages:
                return ChatResponse(reply=assistant_messages[0].content[0].text.value)

        # Regular message handling
        client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=req.message
        )

        run = client.beta.threads.runs.create(thread_id=thread_id, assistant_id=ASSISTANT_ID)
        while True:
            status = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)
            if status.status == "completed":
                break

        messages = client.beta.threads.messages.list(thread_id=thread_id)
        reply = next((m.content[0].text.value for m in messages.data if m.role == "assistant"), "No response")

        return ChatResponse(reply=reply)

    except Exception as e:
        logging.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="AI chat failed")

@app.get("/user/{user_id}/insights")
def get_user_insights(user_id: str):
    """
    Get proactive insights for frontend display
    """
    try:
        profile_data = build_profile_summary(user_id)
        greeting = generate_proactive_greeting(
            profile_data["user_name"], 
            profile_data["insights"], 
            profile_data["latest_checkin"]
        )
        
        return {
            "user_name": profile_data["user_name"],
            "insights": profile_data["insights"],
            "greeting": greeting,
            "has_data": profile_data["has_data"]
        }
    except Exception as e:
        logging.error(f"Insights error: {e}")
        return {
            "user_name": "there", 
            "insights": [], 
            "greeting": "Hello! Dr. Murphy here. How can I help?", 
            "has_data": False
        }

@app.post("/cleanup/{user_id}")
def cleanup_user(user_id: str):
    """
    Summarize conversations and reset thread
    """
    try:
        profile = supabase.table("profiles").select("thread_id").eq("id", user_id).execute().data
        if not profile or not profile[0].get("thread_id"):
            return {"status": "no_thread"}

        thread_id = profile[0]["thread_id"]
        messages = client.beta.threads.messages.list(thread_id=thread_id)

        convo_text = "\n".join([f"{m.role}: {m.content[0].text.value}" for m in messages.data])
        summary_prompt = f"Summarize this patient conversation in 5 sentences:\n{convo_text}"

        summary_resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Summarize conversations for medical record."},
                {"role": "user", "content": summary_prompt}
            ]
        )

        summary = summary_resp.choices[0].message.content

        supabase.table("chat_summaries").insert({
            "user_id": user_id,
            "summary": summary,
            "created_at": datetime.datetime.utcnow().isoformat()
        }).execute()

        new_thread = client.beta.threads.create()
        supabase.table("profiles").update({"thread_id": new_thread.id}).eq("id", user_id).execute()

        return {"status": "success", "summary": summary}

    except Exception as e:
        logging.error(f"Cleanup error: {e}")
        raise HTTPException(status_code=500, detail="Cleanup failed")

@app.get("/")
def read_root():
    return {"message": "Curable Backend API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)