import os
from openai import OpenAI


client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])

def send_message(thread_id, user_input):
    client.beta.threads.messages.create(
        thread_id=thread_id,
        role="user",
        content=user_input
    )

    run = client.beta.threads.runs.create(
        thread_id=thread_id,
        assistant_id=os.environ["ASSISTANT_ID"]
    )

    # Poll until complete
    while True:
        status = client.beta.threads.runs.retrieve(thread_id=thread_id, run_id=run.id)
        if status.status == "completed":
            break

    # Fetch reply
    messages = client.beta.threads.messages.list(thread_id=thread_id)
    for msg in messages.data:
        if msg.role == "assistant":
            return msg.content[0].text.value
