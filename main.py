import os
import datetime
import logging
from typing import Dict, Any, List, Optional
import json

from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from openai import OpenAI
from supabase import create_client, Client
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

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

app = FastAPI(title="Curable Backend")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8080", "https://curable18.onrender.com", "http://localhost:5173", "http://localhost:3000"],
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

# ------------- HELPER FUNCTIONS -------------

def get_all_patient_data(user_id: str) -> Dict[str, Any]:
    """Fetch ALL historical data"""
    try:
        return {
            "onboarding": supabase.table("onboarding").select("*").eq("user_id", user_id).execute().data,
            "three_day_checkins": supabase.table("three_day_checkins").select("*").eq("user_id", user_id).order("created_at", asc=True).execute().data,
            "mental_assessments": supabase.table("mental_health_assessments").select("*").eq("user_id", user_id).order("created_at", asc=True).execute().data,
            "medications": supabase.table("medications").select("*").eq("user_id", user_id).execute().data,
        }
    except Exception as e:
        logging.error(f"Error fetching patient data: {e}")
        return {}

def build_basic_profile_summary(user_id: str) -> Dict[str, Any]:
    """Build basic profile summary"""
    try:
        onboarding = supabase.table("onboarding").select("*").eq("user_id", user_id).execute().data
        user_name = onboarding[0].get('full_name', 'there') if onboarding else 'there'
        
        summary = f"PATIENT: {user_name}\n"
        if onboarding:
            o = onboarding[0]
            summary += f"Age: {o.get('dob', 'N/A')}\n"
            summary += f"Gender: {o.get('gender', 'N/A')}\n"
            summary += f"BMI: {o.get('bmi', 'N/A')}\n"
            summary += f"Chronic Conditions: {o.get('chronic_condition', 'None')}\n"
        
        return {
            "summary": summary,
            "user_name": user_name,
            "insights_used": False
        }
    except Exception as e:
        logging.error(f"Profile error: {e}")
        return {"summary": "Profile unavailable", "user_name": "there", "insights_used": False}

def extract_assistant_reply(messages) -> str:
    """Extract the assistant's reply from messages list"""
    try:
        for message in messages.data:
            if message.role == "assistant":
                if message.content and len(message.content) > 0:
                    content_block = message.content[0]
                    
                    if hasattr(content_block, 'text') and hasattr(content_block.text, 'value'):
                        reply = content_block.text.value
                        logging.info(f"✓ Extracted reply (length: {len(reply)})")
                        return reply
        
        logging.error("No assistant message found")
        return "I apologize, but I couldn't generate a response. Please try again."
        
    except Exception as e:
        logging.error(f"Error extracting reply: {e}", exc_info=True)
        return "I apologize, but I encountered an error. Please try again."

def get_or_create_thread(user_id: str) -> str:
    """Get existing thread or create new one for user"""
    try:
        profiles = supabase.table("profiles").select("thread_id").eq("id", user_id).execute().data
        if profiles and profiles[0].get("thread_id"):
            return profiles[0]["thread_id"]

        thread = client.beta.threads.create()
        thread_id = thread.id
        supabase.table("profiles").update({"thread_id": thread_id}).eq("id", user_id).execute()
        return thread_id
    except Exception as e:
        logging.error(f"Thread error: {e}")
        raise HTTPException(status_code=500, detail="Failed to create thread")

# ------------- ROUTES -------------

@app.post("/chat", response_model=ChatResponse)
def chat_with_ai(req: ChatRequest):
    """Simple chat endpoint without streaming"""
    try:
        logging.info(f"Chat request from user: {req.user_id}")
        
        thread_id = get_or_create_thread(req.user_id)
        profile_data = build_basic_profile_summary(req.user_id)
        
        messages = client.beta.threads.messages.list(thread_id=thread_id)
        is_first_message = len(messages.data) == 0

        if is_first_message:
            greeting = f"Hey {profile_data['user_name']}! 👋 Dr. Shaun Murphy here. I'm here to help with your health questions!"
            
            client.beta.threads.messages.create(
                thread_id=thread_id,
                role="user",
                content=f"[System: Patient profile loaded. Greeting: '{greeting}']\n\nPATIENT PROFILE:\n{profile_data['summary']}"
            )
            
            run = client.beta.threads.runs.create_and_poll(
                thread_id=thread_id, 
                assistant_id=ASSISTANT_ID,
                timeout=60
            )
            
            if run.status != "completed":
                logging.error(f"Run failed: {run.status}")
                raise HTTPException(status_code=500, detail=f"Run failed: {run.status}")
            
            messages = client.beta.threads.messages.list(thread_id=thread_id, limit=5)
            reply_text = extract_assistant_reply(messages)
            
            logging.info(f"First message reply: {reply_text[:100]}...")
            
            return ChatResponse(reply=reply_text, insights_used=False)

        # Regular message
        client.beta.threads.messages.create(
            thread_id=thread_id, 
            role="user", 
            content=req.message
        )
        
        run = client.beta.threads.runs.create_and_poll(
            thread_id=thread_id, 
            assistant_id=ASSISTANT_ID,
            timeout=60
        )
        
        if run.status != "completed":
            logging.error(f"Run failed: {run.status}")
            raise HTTPException(status_code=500, detail=f"Run failed: {run.status}")

        messages = client.beta.threads.messages.list(thread_id=thread_id, limit=5)
        reply_text = extract_assistant_reply(messages)
        
        logging.info(f"Reply: {reply_text[:100]}...")
        
        return ChatResponse(reply=reply_text, insights_used=False)

    except HTTPException:
        raise
    except Exception as e:
        logging.error(f"Chat error: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Chat failed: {str(e)}")

@app.post("/chat-stream")
async def chat_stream(req: ChatRequest):
    """Streaming chat endpoint with typing effect"""
    import asyncio
    
    async def generate():
        try:
            logging.info(f"=== STREAM START - User: {req.user_id}, Message: {req.message[:50]}... ===")
            
            thread_id = get_or_create_thread(req.user_id)
            logging.info(f"Thread ID: {thread_id}")
            
            profile_data = build_basic_profile_summary(req.user_id)
            logging.info(f"Profile loaded for: {profile_data['user_name']}")
            
            messages = client.beta.threads.messages.list(thread_id=thread_id)
            is_first_message = len(messages.data) == 0
            logging.info(f"Is first message: {is_first_message}")

            if is_first_message:
                greeting = f"Hey {profile_data['user_name']}! 👋 Dr. Shaun Murphy here. I'm here to help with your health questions!"
                
                client.beta.threads.messages.create(
                    thread_id=thread_id,
                    role="user",
                    content=f"[System: Patient profile loaded. Greeting: '{greeting}']\n\nPATIENT PROFILE:\n{profile_data['summary']}"
                )
                logging.info("First message created")
            else:
                client.beta.threads.messages.create(
                    thread_id=thread_id, 
                    role="user", 
                    content=req.message
                )
                logging.info("Regular message created")
            
            # Stream the response
            logging.info("Starting OpenAI stream...")
            with client.beta.threads.runs.stream(
                thread_id=thread_id,
                assistant_id=ASSISTANT_ID
            ) as stream:
                chunk_count = 0
                for text in stream.text_deltas:
                    chunk_count += 1
                    if chunk_count == 1:
                        logging.info("First chunk received from OpenAI")
                    yield text
                    await asyncio.sleep(0)  # Force immediate flush
                    
            logging.info(f"=== STREAM COMPLETE - Total chunks: {chunk_count} ===")
                    
        except Exception as e:
            logging.error(f"!!! STREAM ERROR: {e}", exc_info=True)
            yield f"⚠️ Error: I'm having trouble responding right now. Please try again."
    
    return StreamingResponse(
        generate(), 
        media_type="text/plain",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",
        }
    )

@app.get("/")
def read_root():
    return {"message": "Curable Backend API - Ready"}

@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.datetime.utcnow().isoformat()}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)