# Voice-First Task App

A modern, highly interactive task management application where the primary input method is natural language voice. Built as an assignment to demonstrate full-stack capabilities, AI integration, and user-centric design.

## 🚀 Features

-   **Voice-First Data Entry:** Uses the Web Speech API to capture user speech seamlessly.
-   **AI Natural Language Processing (NLP):** Integrates with OpenRouter (using Google Gemini 2.5 Flash Free or similar models) to extract structured JSON data (`title`, `description`, `dueDate`) from messy human speech.
-   **Ambiguity Handling:** Features a beautiful "Review Card" that displays the LLM's parsed guesses, allowing the user to manually correct dates or titles before confirming the task.
-   **Task Management:** Users can complete, cancel, and delay tasks. 
    -   *Delay Feature:* A special action that pushes a task's due date 1 day into the future while incrementing a `delay_count` for analytics tracking.
-   **Authentication:** Fully protected routes with secure signup/login handled by **Supabase Auth** and Next.js Server-Side Rendering (SSR) cookies.
-   **Analytics Dashboard:** Visualizes user habits using **Recharts**. Displays on-time vs. delayed task completions, current task distribution, and delay frequency.
-   **Beautiful UI/UX:** Styled completely with Tailwind CSS, featuring modern dark mode aesthetics, dynamic micro-animations, and Lucide React icons.

## 💻 Tech Stack

-   **Frontend:** Next.js 15 (App Router), React 19, Tailwind CSS v4, date-fns, Lucide React, Recharts
-   **Backend/Database:** Supabase (PostgreSQL), Next.js API Routes, Server Actions
-   **AI/NLP:** OpenRouter API (Access to various LLMs for fast parsing)

## 🛠️ Setup & Installation

Follow these steps to run the project locally.

### 1. Prerequisites
-   Node.js (v18+)
-   A free [Supabase](https://supabase.com/) account and project.
-   A free [OpenRouter](https://openrouter.ai/) account and API key.

### 2. Clone and Install
```bash
# Clone the repository (if applicable)
# git clone <repo_url>
# cd senpiper-assignment

# Install dependencies
npm install
```

### 3. Database Setup (Supabase)
Navigate to your Supabase project's SQL Editor and run the following script to create the required table and Row Level Security (RLS) policies:

```sql
-- 1. Create tasks table
create table public.tasks (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    title text not null,
    description text,
    due_date timestamptz,
    status text not null default 'PENDING'
        check (status in ('PENDING', 'COMPLETED', 'CANCELLED')),
    delay_count integer not null default 0,
    created_at timestamptz not null default now()
);

-- 2. Enable Row Level Security
alter table public.tasks enable row level security;

-- 3. Policy: Users can SELECT their own tasks
create policy "Users can view their own tasks"
on public.tasks for select using (auth.uid() = user_id);

-- 4. Policy: Users can INSERT their own tasks
create policy "Users can insert their own tasks"
on public.tasks for insert with check (auth.uid() = user_id);

-- 5. Policy: Users can UPDATE their own tasks
create policy "Users can update their own tasks"
on public.tasks for update using (auth.uid() = user_id);

-- 6. Policy: Users can DELETE their own tasks
create policy "Users can delete their own tasks"
on public.tasks for delete using (auth.uid() = user_id);
```

### 4. Environment Variables
Create a `.env.local` file in the root of the project by copying the example:
```bash
cp .env.example .env.local
```

Fill in the required keys:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENROUTER_API_KEY=your_openrouter_api_key
```

### 5. Run the Application
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser. 
*(Note: Google Chrome is highly recommended as it provides the most robust native support for the Web Speech API).*
