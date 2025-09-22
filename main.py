"""
main.py
Backend API for Curable
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

from fastapi import WebSocket, WebSocketDisconnect
from typing import List
from app.chat.routes import router as chat_router
from dotenv import load_dotenv


load_dotenv()
# ========== Setup ==========


# Load ENV
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_KEY")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
ASSISTANT_ID = os.getenv("ASSISTANT_ID")  # from create_assistant.py

# Clients
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
client = OpenAI(api_key=OPENAI_API_KEY)

app = FastAPI(title="Curable Backend")
app.include_router(chat_router, prefix="/chat", tags=["chat"])


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

def build_profile_summary(user_id: str) -> str:
    """
    Fetch onboarding, weekly checkins, mental health, medications
    from Supabase and return a text summary for AI context.
    """
    try:
        onboarding = supabase.table("onboarding").select("*").eq("user_id", user_id).execute().data
        weekly_checkins = supabase.table("weekly_checkins").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute().data
        mental_assesment = supabase.table("mental_health_assessment").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(1).execute().data
        medication = supabase.table("medications").select("*").eq("user_id", user_id).execute().data

        summary = "Patient Profile Summary:\n"

        if onboarding:
            o = onboarding[0]
            summary += f"- Name: {o.get('name')}, Age: {o.get('dob')}, Gender: {o.get('gender')}\n"
            summary += f"- BMI: {o.get('bmi')} | Chronic: {o.get('chronic_condition')} | Medications: {o.get('long_term_medication')}\n"

        if weekly_checkins:
            w = weekly_checkins[0]
            summary += f"- Weekly Check-in: Sleep {w.get('sleep_hours')}h, Stress {w.get('stress_level')}, Exercise {w.get('exercise_frequency')}x/week\n"

        if mental_assesment:
            m = mental_assesment[0]
            summary += f"- Mental Health: Mood today {m.get('feeling_today')}, Stress/Anxiety {m.get('stress_anxiety_overwhelm')}\n"

        if medication:
            summary += "- Current Medications:\n"
            for med in medication:
                summary += f"  • {med.get('medication_name')} ({med.get('dosage')})\n"

        return summary.strip()

    except Exception as e:
        logging.error(f"Error building profile summary: {e}")
        return "No profile data available."


def get_or_create_thread(user_id: str) -> str:
    """
    Check if user already has a thread_id stored in profiles.
    If not, create a new one and save to Supabase.
    """
    profiles = supabase.table("profiles").select("thread_id").eq("id", user_id).execute().data
    if profiles and profiles[0].get("thread_id"):
        return profiles[0]["thread_id"]

    # Create new thread
    thread = client.beta.threads.create()
    thread_id = thread.id

    supabase.table("profiles").update({"thread_id": thread_id}).eq("id", user_id).execute()
    return thread_id


# ------------- ROUTES -------------

@app.post("/chat", response_model=ChatResponse)
def chat_with_ai(req: ChatRequest):
    """
    Handle chat with the AI assistant, passing user profile as context.
    """
    try:
        # 1. Get or create thread for user
        thread_id = get_or_create_thread(req.user_id)

        # 2. Build profile context
        profile_summary = build_profile_summary(req.user_id)

        # 3. Send profile summary (first time only, check thread msg count)
        messages = client.beta.threads.messages.list(thread_id=thread_id)
        if len(messages.data) == 0:
            client.beta.threads.messages.create(
                thread_id=thread_id,
                role="user",
                content=f"Here is my medical profile:\n{profile_summary}"
            )

        # 4. Send user message
        client.beta.threads.messages.create(
            thread_id=thread_id,
            role="user",
            content=req.message
        )

        # 5. Run assistant
        run = client.beta.threads.runs.create(thread_id=thread_id, assistant_id=ASSISTANT_ID)

        # Poll until completion
        while True:
            status = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)
            if status.status == "completed":
                break

        # 6. Fetch last assistant message
        messages = client.beta.threads.messages.list(thread_id=thread_id)
        reply = next((m.content[0].text.value for m in messages.data if m.role == "assistant"), "No response")

        return ChatResponse(reply=reply)

    except Exception as e:
        logging.error(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail="AI chat failed")


@app.post("/cleanup/{user_id}")
def cleanup_user(user_id: str):
    """
    Summarize last 30 days of messages, save to DB, reset thread.
    """
    try:
        # Get thread
        profile = supabase.table("profiles").select("thread_id").eq("id", user_id).execute().data
        if not profile or not profile[0].get("thread_id"):
            return {"status": "no_thread"}

        thread_id = profile[0]["thread_id"]

        # Fetch messages
        messages = client.beta.threads.messages.list(thread_id=thread_id)

        # Summarize them
        convo_text = "\n".join([f"{m.role}: {m.content[0].text.value}" for m in messages.data])
        summary_prompt = f"Summarize the following patient conversation in 5 sentences:\n{convo_text}"

        summary_resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "Summarize conversations for medical record."},
                {"role": "user", "content": summary_prompt}
            ]
        )

        summary = summary_resp.choices[0].message.content

        # Save summary in Supabase
        supabase.table("chat_summaries").insert({
            "user_id": user_id,
            "summary": summary,
            "created_at": datetime.datetime.utcnow().isoformat()
        }).execute()

        # Reset thread
        new_thread = client.beta.threads.create()
        supabase.table("profiles").update({"thread_id": new_thread.id}).eq("id", user_id).execute()

        return {"status": "success", "summary": summary}

    except Exception as e:
        logging.error(f"Cleanup error: {e}")
        raise HTTPException(status_code=500, detail="Cleanup failed")
