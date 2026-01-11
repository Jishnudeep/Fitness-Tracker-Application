# TheCutRoute - Fitness Tracker Application

TheCutRoute is a comprehensive workout and calorie tracker with detailed lift logging, progress visualization, and an integrated AI fitness assistant powered by Gemini.

## Project Structure

- `ui/`: The frontend application built with React, Vite, and Tailwind CSS.

## Status

⚠️ **Backend Pending**: Currently, the application uses local storage for data persistence. A dedicated backend for user authentication and cloud data storage is planned for future development.

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Jishnudeep/Fitness-Tracker-Application.git
   cd Fitness-Tracker-Application
   ```

2. Navigate to the UI directory and install dependencies:
   ```bash
   cd ui
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the `ui/` directory and add your Gemini API key:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

4. Run the development server:
   ```bash
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
- **Icons**: Lucide React
- **Charts**: Recharts
- **AI**: Google Gemini AI
