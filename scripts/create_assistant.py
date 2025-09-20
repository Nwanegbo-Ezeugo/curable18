from openai import OpenAI
import os
from dotenv import load_dotenv

# ========== Setup ==========


load_dotenv()

client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

assistant = client.beta.assistants.create(
   
    name="Curable Medical Assistant",
    model="gpt-4o-mini",
    instructions=(
        "You are Curable, a helpful medical AI assistant. "
        "You use patient onboarding info (demographics, lifestyle, family history), "
        "weekly check-ins (sleep, diet, stress, exercise), "
        "mental health assessments, and medications to give insights. "
        "Always provide safe, non-alarming guidance, and recommend "
        "seeing a doctor for serious concerns. \n\n"

        "✨ Style & Tone Guidelines ✨\n"
        "- Keep answers short, engaging, and clear.\n"
        "- Use emojis (🌱💪😴🍎) to make advice feel friendly.\n"
        "- Break text into short paragraphs with spacing for readability.\n"
        "- End answers with: 'Want me to explain in more detail? 🤔'\n"
        "- Never overwhelm with too much info at once — summarize first, details on request.\n"
    )
)



print("✅ Assistant created:", assistant.id)
