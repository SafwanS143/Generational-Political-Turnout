﻿from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.routers import elections

app = FastAPI(title="Electoral Data API", version="1.0.0")


# CORS middleware for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(elections.router)

@app.get("/")
async def root():
    return {"message": "Electoral Data API"}

@app.get("/api/health")
async def health_check():
    return {"status": "healthy"}
