from openai import OpenAI
import os


client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

def send_profile(thread_id, profile_summary):
    client.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=f"Here is the patient profile:\n{profile_summary}"
    )
