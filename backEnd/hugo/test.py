import json
import firebase_admin
from firebase_admin import credentials, firestore
from hugo import Hugo
import getpass
import os
from langchain.chat_models import init_chat_model
from dotenv import load_dotenv


def main():
  # Run the data
  load_dotenv()
  if not os.getenv("OPENAI_API_KEY"):
    os.environ["OPENAI_API_KEY"] = getpass.getpass("Enter API key for OpenAI: ")

  model = init_chat_model("gpt-4o-mini", model_provider="openai")
  model.invoke("Hello, world!")
  print("here")


if __name__ == "__main__":
  main()