from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import workouts, diet, templates

app = FastAPI(
    title="TheCutRoute API",
    description="Backend for Fitness Tracker Application",
    version="0.1.0"
)

# CORS configuration
origins = [
    "http://localhost:5173",  # Vite default port
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(workouts.router)
app.include_router(diet.router)
app.include_router(templates.router)

@app.get("/")
async def root():
    return {"message": "Welcome to TheCutRoute API"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
