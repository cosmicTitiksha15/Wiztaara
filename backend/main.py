from google import genai
from youtube_transcript_api import YouTubeTranscriptApi
from pydantic import BaseModel, Field
from typing import List, Optional

user_api_key = input("Enter your Gemini API KEY : ").strip()
client = genai.Client(api_key=user_api_key)


# General Question's Answers
# interaction = client.interactions.create(
#     model = "gemini-3.7-flash",
#     system_instruction = "You are Wiztaara - A chrome extension built to respond to user's queries based on particular youtube video.", 
#     input = "Classify the following items as [large, small]: Elephant Mouse Snail"
# )
# print(interaction.output_text)
# General Question Answers closed

# Getting a JSON Resonse - will be used for MCQs
# class Recipe(BaseModel):
#     recipe_name: str = Field(description="Name of the recipe.")
#     ingredients: List[str] = Field(description="List of ingredients.")
#     prep_time_minutes: Optional[int] = Field(description="Prep time in minutes.")


# interaction = client.interactions.create(
#     model = "gemini-3.7-flash",
#     input = "Give me a Recipe for banana Bread",
#     tools=[{"type": "google_search"}],
#     response_format = {
#         "type" : "text",
#         "mime_type" : "application/json",
#         "schema" : Recipe.model_json_schema()
#     },
# )

# recipe = Recipe.model_validate_json(interaction.output_text)
# print(recipe)
# Getting a JSON Resonse closed


# YouTube Transcripts fetching 
video_id = "0JDRWKrFZe4"

def fetch_transcript(video_id):
    ytt_api = YouTubeTranscriptApi()
    transcript = ytt_api.fetch(video_id)
    transcript_string = ""
    # Output text and timestamps
    for item in transcript:
        transcript_string += (item.text + " ")
    return transcript_string

# Summarization functionality
def summarize(prompt):
    interaction = client.interactions.create(
    model = "gemini-3.5-flash",
    system_instruction = "Summarize the input in 100 words.", 
    input = prompt
    )
    return interaction.output_text

print(summarize(fetch_transcript(video_id)))
