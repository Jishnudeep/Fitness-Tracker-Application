-- Fitness Tracker Application - Consolidated Database Schema
-- This file contains all table definitions, triggers, and RLS policies.

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles (Users)
create table public.profiles (
  id uuid references auth.users not null primary key,
  username text unique,
  updated_at timestamp with time zone,
  full_name text,
  avatar_url text
);

-- 2. Exercises (Master list)
create table public.exercises (
  id uuid default uuid_generate_v4() primary key,
  name text unique not null,
  muscle_group text not null, -- 'Chest', 'Back', etc.
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Workouts
create table public.workouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null,
  date timestamp with time zone not null,
  duration_minutes integer,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Workout Exercises (Join table)
create table public.workout_exercises (
  id uuid default uuid_generate_v4() primary key,
  workout_id uuid references public.workouts(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) not null,
  order_index integer not null
);

-- 5. Sets
create table public.sets (
  id uuid default uuid_generate_v4() primary key,
  workout_exercise_id uuid references public.workout_exercises(id) on delete cascade not null,
  reps integer not null,
  weight numeric not null,
  speed numeric,
  incline numeric,
  time_seconds integer,
  calories_burnt numeric default 0,
  steps integer default 0,
  completed boolean default false,
  set_order integer,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Workout Templates
create table public.workout_templates (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  name text not null,
  description text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

create table public.workout_template_exercises (
  id uuid default uuid_generate_v4() primary key,
  template_id uuid references public.workout_templates(id) on delete cascade not null,
  exercise_id uuid references public.exercises(id) not null,
  default_sets integer default 3,
  default_reps integer default 10,
  default_weight numeric default 0,
  default_speed numeric,
  default_incline numeric,
  default_time_seconds integer,
  default_calories_burnt numeric default 60,
  default_steps integer default 0,
  order_index integer not null
);

-- 7. Meals
create table public.meals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) not null,
  name text, -- 'Breakfast', 'Lunch', etc.
  date date not null,
  type text not null, -- 'Breakfast', 'Lunch', 'Dinner', 'Snack'
  total_calories integer default 0,
  total_protein numeric default 0,
  total_carbs numeric default 0,
  total_fats numeric default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Food Items
create table public.food_items (
  id uuid default uuid_generate_v4() primary key,
  meal_id uuid references public.meals(id) on delete cascade not null,
  name text not null,
  calories integer not null,
  protein numeric not null,
  carbs numeric not null,
  fats numeric not null,
  quantity numeric default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


-- FUNCTIONS & TRIGGERS --

-- Create a function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a trigger to call the function on user creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- RLS POLICIES --

-- Profiles
alter table public.profiles enable row level security;
create policy "Public profiles are viewable by everyone." on profiles for select using ( true );
create policy "Users can insert their own profile." on profiles for insert with check ( auth.uid() = id );
create policy "Users can update own profile." on profiles for update using ( auth.uid() = id );

-- Exercises
alter table public.exercises enable row level security;
create policy "Everyone can read exercises" on public.exercises for select using (true);
create policy "Authenticated users can create exercises" on public.exercises for insert with check (auth.role() = 'authenticated');

-- Workouts
alter table public.workouts enable row level security;
create policy "Users can CRUD own workouts" on public.workouts using (auth.uid() = user_id);

-- Workout Exercises
alter table public.workout_exercises enable row level security;
create policy "Users can CRUD own workout exercises" on public.workout_exercises using (
  exists (select 1 from public.workouts where workouts.id = workout_exercises.workout_id and workouts.user_id = auth.uid())
);

-- Sets
alter table public.sets enable row level security;
create policy "Users can CRUD own sets" on public.sets using (
  exists (
    select 1 from public.workout_exercises
    join public.workouts on workouts.id = workout_exercises.workout_id
    where workout_exercises.id = sets.workout_exercise_id and workouts.user_id = auth.uid()
  )
);

-- Templates
alter table public.workout_templates enable row level security;
create policy "Users can CRUD own templates" on public.workout_templates using (auth.uid() = user_id);

-- Template Exercises
alter table public.workout_template_exercises enable row level security;
create policy "Users can CRUD own template exercises" on public.workout_template_exercises using (
  exists (select 1 from public.workout_templates where workout_templates.id = workout_template_exercises.template_id and workout_templates.user_id = auth.uid())
);

-- Meals
alter table public.meals enable row level security;
create policy "Users can CRUD own meals" on public.meals using (auth.uid() = user_id);

-- Food Items
alter table public.food_items enable row level security;
create policy "Users can CRUD own food items" on public.food_items using (
  exists (select 1 from public.meals where meals.id = food_items.meal_id and meals.user_id = auth.uid())
);
