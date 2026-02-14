# 📟 TheCutRoute - Backend

The robust powerhouse of TheCutRoute, built with **FastAPI** and **Supabase**.

## 🛠️ Tech Stack
-   **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
-   **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
-   **Validation**: Pydantic
-   **Package Management**: [uv](https://github.com/astral-sh/uv)

## 📁 Structure
-   `app/main.py`: Entry point and CORS configuration.
-   `app/routers/`: API route definitions (Workouts, Diet, Templates).
-   `app/services/`: Business logic and Supabase client interactions.
-   `app/schemas/`: Pydantic models for request/response validation.
-   `migrations/`: SQL scripts for database schema and policies.

## ⚙️ Setup

1.  **Install dependencies**:
    ```bash
    pip install -r requirements.txt
    # OR using uv
    uv sync
    ```
2.  **Environment Variables**:
    Create a `.env` file:
    ```env
    SUPABASE_URL=...
    SUPABASE_SERVICE_ROLE_KEY=...
    ```
3.  **Run Development Server**:
    ```bash
    uvicorn app.main:app --reload
    ```

## 🗄️ Database
Ensure you run `migrations/full_schema.sql` in your Supabase SQL editor to set up:
-   Row Level Security (RLS) policies.
-   Tables for profiles, workouts, meals, and templates.
-   Automatic profile creation on user signup.
