from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from youtube_transcript_api import YouTubeTranscriptApi
from google import genai
import os

app = FastAPI(title="Wiztaara API")  # Instantiates FastAPI docs at /docs

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

client = genai.Client(api_key=os.environ.get("GEMINI_API_KEY"))

@app.get("/")
def home():
    return {"status": "Wiztaara API is active!"}

@app.get("/api/summarize")
def summarize(video_id: str):
    try:
        transcript_data = YouTubeTranscriptApi().fetch(video_id)
        full_transcript = " ".join([item.text for item in transcript_data])

        prompt = f"Summarize this YouTube transcript into 3 main points:\n\n{full_transcript}"
        response = client.models.generate_content(
            model="gemini-1.5-flash",
            contents=prompt
        )

        return {"summary": response.text}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))