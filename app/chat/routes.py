from fastapi import APIRouter
from pydantic import BaseModel

router = APIRouter()

# Request body model
class ChatRequest(BaseModel):
    user_id: str
    message: str

@router.post("/chat")
async def chat_endpoint(req: ChatRequest):
    """
    Receives user message and returns AI/echo reply.
    """
    # For now, just echo back — later we plug in OpenAI Assistant
    return {"reply": f"AI says: {req.message}"}
