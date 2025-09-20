# app/profile/routes.py
from fastapi import APIRouter, HTTPException
from app.db import supabase
import logging

router = APIRouter()

@router.get("/{username}")
async def get_profile(username: str):
    """
    Lookup profile by username (case-insensitive partial match).
    Included under main.py with prefix='/profile', so final route is /profile/{username}
    """
    try:
        logging.info(f"Profile lookup: {username}")
        res = (
            supabase.table("profiles")
            .select("*")
            .ilike("full_name", f"%{username}%")
            .limit(5)
            .execute()
        )
        if res.data and len(res.data) > 0:
            # return the first match (or modify to return all)
            return res.data[0]
        raise HTTPException(status_code=404, detail="Profile not found")
    except Exception as e:
        logging.exception("Error querying profile")
        raise HTTPException(status_code=500, detail=str(e))
