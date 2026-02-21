
-- Create goals table
create table if not exists public.goals (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) not null,
  current_height float, -- in cm
  current_weight float, -- in kg
  current_body_fat float, -- percentage
  goal_weight float,
  goal_body_fat float,
  target_date date,
  daily_caloric_deficit int,
  daily_calories int,
  age int, 
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- RLS Policies
alter table public.goals enable row level security;

create policy "Users can view their own goals"
  on public.goals for select
  using (auth.uid() = user_id);

create policy "Users can insert their own goals"
  on public.goals for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own goals"
  on public.goals for update
  using (auth.uid() = user_id);
