from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

# Import routers
from app.chat.routes import router as chat_router
from app.profile.routes import router as profile_router
from dotenv import load_dotenv


load_dotenv()
app = FastAPI(
    title="Curable AI Backend",
    description="Backend API for chat and profile lookup",
    version="1.0.0",
)

# Allow frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://curable.onrender.com"],  # React dev server
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers with prefixes to avoid clashes
app.include_router(chat_router, prefix="/chat", tags=["Chat"])
app.include_router(profile_router, prefix="/profile", tags=["Profile"])

@app.get("/", tags=["Health"])
async def root():
    return {"message": "Backend running!"}



