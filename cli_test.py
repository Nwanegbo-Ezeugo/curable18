# cli_chat.py
import os
from utils.threads import create_thread
from backend.send_profile import send_profile
from backend.chat import send_message

def main():
    print("🚀 Starting Curable AI Chat\n")

    # Create a new thread
    thread_id = create_thread()
    print(f"🧵 New thread created: {thread_id}\n")

    # Collect patient profile
    print("📋 Let's set up the patient profile:")
    name = input("Name: ")
    age = input("Age: ")
    symptoms = input("Symptoms (comma-separated): ")
    lifestyle = input("Lifestyle/Notes: ")

    profile = f"""Name: {name}
Age: {age}
Symptoms: {symptoms}
Lifestyle: {lifestyle}"""
    send_profile(thread_id, profile)
    print("\n📤 Patient profile sent to assistant.\n")

    # Chat loop
    print("💬 You can now chat with Curable AI (type 'exit' to quit).\n")
    while True:
        user_input = input("👤 You: ")
        if user_input.lower() in ["exit", "quit"]:
            print("👋 Ending chat. Stay healthy!")
            break

        reply = send_message(thread_id, user_input)
        print(f"🤖 Assistant: {reply}\n")

if __name__ == "__main__":
    main()
