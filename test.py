from app.db import supabase

res = supabase.table("profiles").select("*").ilike("full_name", "%ezeugo%").execute()
print(res.data)
