from utils.threads import create_thread
from backend.send_profile import send_profile
from backend.chat import send_message

thread_id = create_thread()
print("Thread:", thread_id)

send_profile(thread_id, "Name: John Doe\nAge: 25\nSymptoms: cough, fatigue")

reply = send_message(thread_id, "What could be happening?")
print("Assistant says:", reply)
