# STEM MUN Scoring System

A real-time, event-driven scoring system for STEM Model United Nations events. Built with Next.js, Tailwind CSS, Framer Motion, and Supabase.

## 🧩 Features

- **Event-Driven Scoring**: Scores are stored as discrete events for auditability and real-time calculation.
- **Real-Time Leaderboard**: Live updates via Supabase Realtime for instant feedback.
- **Role-Based Access**:
  - **Admin**: Configure profiles, judges, and scoring rules.
  - **Judge**: Rapid input scoring for live sessions.
  - **Public**: Minimalist dashboard for visitors.
- **Luxury Minimal UI**: High-performance, monochrome aesthetic.

## 🏗️ Project Structure

```bash
src/
├── app/          # Next.js routes
├── components/   # Shared UI components
├── lib/          # Utilities (Supabase, hooks, etc.)
└── modules/      # Feature-based logic
    ├── admin/    # Admin panel
    ├── judge/    # Judge dashboard
    └── public/   # Leaderboard & profiles
```

## 🚀 Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```

2.  **Environment Variables**:
    Create a `.env.local` file with your Supabase credentials:
    ```bash
    NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
    ```

3.  **Run Development Server**:
    ```bash
    npm run dev
    ```

## 🛠️ Tech Stack

- **Frontend**: Next.js (App Router), Tailwind CSS v4, Framer Motion
- **Backend/DB**: Supabase (PostgreSQL, Realtime)
- **Language**: TypeScript
