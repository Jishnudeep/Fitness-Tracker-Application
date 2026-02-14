# ✂️ TheCutRoute

**TheCutRoute** is a premium, minimalist fitness tracking ecosystem designed for performance. It combines precise lift logging, dedicated cardio tracking, and advanced nutrition management with an integrated AI Fitness Assistant powered by **Google Gemini**.

![TheCutRoute Banner](https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6)

## 🚀 Key Features

-   **Precision Lifting**: Log every set, rep, and KG with an interface designed for the gym floor.
-   **dedicated Cardio**: Specialized tracking for speed, incline, and **Step Tracking**.
-   **Smart Templates**: Save your routines and watch them evolve with your progress (Progressive Overload).
-   **Macro Mastery**: Quick-add meals with detailed calorie and protein breakdowns.
-   **AI Intelligence**: An on-demand Fitness Assistant powered by Gemini for form tips, meal ideas, and motivation.
-   **Visual Insights**: Clean, monochrome charts to track your volume, caloric intake, and step trends.

---

## 🏗️ Architecture

The project is split into two main tiers:

-   **/ui**: A high-performance React + Vite frontend styled with Tailwind CSS.
-   **/backend**: A robust FastAPI + Supabase backend designed for high concurrency and speed.

---

## 🛠️ Setup & Installation

### 1. Prerequisites
-   [Python 3.10+](https://www.python.org/downloads/)
-   [Node.js 18+](https://nodejs.org/)
-   [Supabase Account](https://supabase.com/)

### 2. Backend Setup
```bash
cd backend
# Recommended: Create a virtual environment
python -m venv .venv
source .venv/bin/activate # Windows: .venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt # Or use 'uv' for faster setup
```
Set up your `.env` in the `backend/` folder:
```env
SUPABASE_URL=your_project_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### 3. Database Initialization
Run the consolidated script in your Supabase SQL Editor:
-   `backend/migrations/full_schema.sql`

### 4. Frontend Setup
```bash
cd ui
npm install
```
Set up your `.env.local` in the `ui/` folder:
```env
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
GEMINI_API_KEY=your_google_ai_studio_key
```

---

## 🚦 Running Locally

1.  **Start the Backend**:
    ```bash
    cd backend
    uvicorn app.main:app --reload
    ```
2.  **Start the Frontend**:
    ```bash
    cd ui
    npm run dev
    ```

---

## 🛠️ Tech Stack

-   **Frontend**: React, TypeScript, Vite, Tailwind CSS, Recharts, Lucide Icons.
-   **Backend**: FastAPI, Pydantic, Supabase-py.
-   **Database**: PostgreSQL (via Supabase) with Row Level Security (RLS).
-   **AI**: Google Gemini Pro API.

---

## 📄 License & Credits
Built with focus by [Jishnudeep](https://github.com/Jishnudeep).
Inspired by the pursuit of the perfect cut. ✂️
