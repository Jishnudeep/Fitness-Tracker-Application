# TheCutRoute - Fitness Tracker Application

TheCutRoute is a comprehensive workout and calorie tracker with detailed lift logging, progress visualization, and an integrated AI fitness assistant powered by Gemini.

## Project Structure

- `ui/`: The frontend application built with React, Vite, and Tailwind CSS.
- `backend/`: The backend API built with FastAPI and Python.

## Status

🚀 **Backend Under Development**: The application is transitioning from local storage to a dedicated FastAPI backend for persistent data storage and user authentication.

## Getting Started

### Prerequisites

- **Frontend**: Node.js (v18 or higher), npm or yarn
- **Backend**: Python (v3.10 or higher)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Jishnudeep/Fitness-Tracker-Application.git
   cd Fitness-Tracker-Application
   ```

2. **Frontend Setup**:
   ```bash
   cd ui
   npm install
   ```
   Create a `.env.local` file in the `ui/` directory and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

3. **Backend Setup**:

   **Using `uv` (Recommended)**:
   ```bash
   cd ../backend
   uv venv
   uv pip install fastapi uvicorn
   ```

   **Using standard `venv`**:
   ```bash
   cd ../backend
   python -m venv venv
   # Windows
   .\venv\Scripts\activate
   # macOS/Linux
   source venv/bin/activate
   pip install fastapi uvicorn
   ```

## Running the Application

### 1. Start the Backend

**Using `uv`**:
```bash
cd backend
uv run uvicorn main:app --reload
```

**Using standard `venv`**:
```bash
cd backend
# Activate venv if not already active
.\venv\Scripts\activate
uvicorn main:app --reload
```

### 2. Start the Frontend
```bash
cd ui
npm run dev
```

## Features

- **Workout Logging**: Track exercises, sets, reps, and weights.
- **Calorie Tracking**: Log meals and monitor daily caloric intake.
- **AI Fitness Coach**: Chat with an AI assistant for workout suggestions and nutrition advice.
- **Dashboard**: Visualize your progress with interactive charts.
- **Dark Mode**: Sleek, modern interface with dark mode support.

## Technologies Used

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: FastAPI, Python, Uvicorn, [uv](https://github.com/astral-sh/uv) (package manager)
- **Icons**: Lucide React
- **Charts**: Recharts
- **AI**: Google Gemini AI
