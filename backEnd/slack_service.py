# slack_service.py
import os
from slack_sdk import WebClient
from slack_sdk.errors import SlackApiError

slack_token = os.getenv("SLACK_BOT_TOKEN")
slack_channel = os.getenv("SLACK_CHANNEL")  # e.g. "U08PZ84QHSP"

client = WebClient(token=slack_token)

def post_message(text: str):
    try:
        resp = client.chat_postMessage(channel=slack_channel, text=text)
        return resp.data
    except SlackApiError as e:
        # raise or log
        raise RuntimeError(f"Slack API error: {e.response['error']}")
