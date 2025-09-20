from openai import OpenAI
import os
from dotenv import load_dotenv

# ========== Setup ==========


load_dotenv()

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

def create_thread():
    thread = client.beta.threads.create()
    return thread.id
