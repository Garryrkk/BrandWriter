# main.py
import os
from fastapi import FastAPI, Depends, HTTPException, Request
from dotenv import load_dotenv
from app.db import init_db, get_db
from app.routes import auth_router, posts_router, media_router
from app.services.scheduler_service import start_scheduler

load_dotenv()
API_KEY = os.getenv("INSTA_SERVICE_API_KEY")

app = FastAPI(title="InstaApp Service")

# include routers
app.include_router(auth_router, prefix="/auth", tags=["auth"])
app.include_router(posts_router, prefix="/posts", tags=["posts"])
app.include_router(media_router, prefix="/media", tags=["media"])

@app.on_event("startup")
async def startup_event():
    init_db()
    start_scheduler(app)  # start APScheduler background jobs
    print("InstaApp started")

@app.get("/")
def root():
    return {"status": "InstaApp running"}
