
import sys
import os
from dotenv import load_dotenv

load_dotenv()

# --- PYWIN32 PATH PATCH (Must be before any imports that use pywin32) ---
if os.name == 'nt':
    try:
        import site
        # Find site-packages in the venv
        venv_root = sys.prefix
        site_packages = os.path.join(venv_root, 'Lib', 'site-packages')
        
        paths_to_add = [
            os.path.join(site_packages, 'win32'),
            os.path.join(site_packages, 'win32', 'lib'),
            os.path.join(site_packages, 'Pythonwin'),
            os.path.join(site_packages, 'pywin32_system32'),
        ]
        
        for p in paths_to_add:
            if os.path.exists(p):
                if p not in sys.path:
                    sys.path.append(p)
                os.environ["PATH"] += os.pathsep + p
    except Exception as e:
        print(f"Warning: Failed to patch pywin32 paths: {e}")
# ------------------------------------------------------------------------

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import workouts, diet, templates, goals, agents

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
app.include_router(goals.router)
app.include_router(agents.router)

@app.get("/")
async def root():
    return {"message": "Welcome to TheCutRoute API"}

@app.get("/health")
async def health_check():
    return {"status": "ok"}
