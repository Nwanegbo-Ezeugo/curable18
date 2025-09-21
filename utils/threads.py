from openai import OpenAI
import os


client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

def create_thread():
    thread = client.beta.threads.create()
    return thread.id
