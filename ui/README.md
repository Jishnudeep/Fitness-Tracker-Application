# 🎨 TheCutRoute - UI

The premium frontend experience of TheCutRoute, crafted with **React** and **Tailwind CSS**.

## 🛠️ Tech Stack
-   **Core**: React 18, TypeScript
-   **Build Tool**: [Vite](https://vitejs.dev/)
-   **Styling**: Tailwind CSS (Monochrome/Minimalist theme)
-   **Charts**: [Recharts](https://recharts.org/)
-   **Icons**: [Lucide React](https://lucide.dev/)
-   **AI**: Google Gemini Pro (via API)

## 📁 Structure
-   `App.tsx`: Main navigation and view state management.
-   `components/`: Reusable UI modules (Dashboard, WorkoutLog, CardioLog, etc.).
-   `services/`: Frontend API clients and auth helpers.
-   `types.ts`: Global TypeScript interfaces.

## ⚙️ Setup

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Environment Variables**:
    Create a `.env.local` file:
    ```env
    VITE_SUPABASE_URL=your_project_url
    VITE_SUPABASE_ANON_KEY=your_anon_key
    GEMINI_API_KEY=your_google_ai_studio_key
    ```
3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## ✨ Design Philosophy
Monochrome, high-contrast, and minimalist. Every interaction is designed to be frictionless, allowing you to focus on your training while the app handles the data.
