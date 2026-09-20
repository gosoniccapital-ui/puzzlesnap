-- =========================================================
-- PuzzleSnap & CunFashion Database Schema (PostgreSQL for Supabase)
-- =========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. CATEGORIES TABLE
create table if not exists public.categories (
    id uuid primary key default gen_random_uuid(),
    name text not null unique,
    slug text not null unique,
    icon text,
    description text,
    created_at timestamp with time zone default now()
);

-- 2. PUZZLES TABLE
create table if not exists public.puzzles (
    id uuid primary key default gen_random_uuid(),
    slug text not null unique,
    title text not null,
    description text,
    image_url text not null,
    thumbnail_url text,
    category_id uuid references public.categories(id) on delete set null,
    difficulty text default 'medium',
    plays_count integer default 0,
    likes_count integer default 0,
    is_daily boolean default false,
    daily_date date,
    is_custom boolean default false,
    created_at timestamp with time zone default now()
);

-- 3. PUZZLE SCORES & LEADERBOARDS
create table if not exists public.puzzle_scores (
    id uuid primary key default gen_random_uuid(),
    puzzle_id uuid references public.puzzles(id) on delete cascade,
    player_name text not null,
    time_seconds integer not null,
    moves_count integer not null,
    pieces_count integer not null,
    score integer not null, -- lower is better (seconds + moves)
    created_at timestamp with time zone default now()
);

-- 4. AFFILIATE CLICKS (Global Analytics & Click Stream)
create table if not exists public.affiliate_clicks (
    id text primary key,
    product_id text,
    product_name text not null,
    platform text not null,
    price text,
    target_url text,
    referrer text,
    timestamp text not null,
    created_at timestamp with time zone default now()
);

-- 5. AFFILIATE CONVERSIONS (Postback Tracking & Order Match)
create table if not exists public.affiliate_conversions (
    id text primary key,
    click_id text,
    order_id text not null,
    platform text not null,
    product_id text,
    product_name text,
    amount numeric default 0,
    commission numeric default 0,
    currency text default 'USD',
    status text default 'approved',
    created_at text not null,
    recorded_at timestamp with time zone default now()
);

-- Indexes for performance & lookups
create index if not exists idx_puzzles_slug on public.puzzles(slug);
create index if not exists idx_puzzles_daily on public.puzzles(is_daily, daily_date);
create index if not exists idx_puzzle_scores_leaderboard on public.puzzle_scores(puzzle_id, score asc);
create index if not exists idx_affiliate_clicks_timestamp on public.affiliate_clicks(timestamp desc);
create index if not exists idx_affiliate_clicks_platform on public.affiliate_clicks(platform);
create index if not exists idx_affiliate_conversions_click on public.affiliate_conversions(click_id);
create index if not exists idx_affiliate_conversions_order on public.affiliate_conversions(order_id);

-- Enable Row Level Security (RLS)
alter table public.categories enable row level security;
alter table public.puzzles enable row level security;
alter table public.puzzle_scores enable row level security;
alter table public.affiliate_clicks enable row level security;
alter table public.affiliate_conversions enable row level security;

-- Policies: Anyone can view categories, puzzles, and leaderboards
create policy "Allow public read categories" on public.categories for select using (true);
create policy "Allow public read puzzles" on public.puzzles for select using (true);
create policy "Allow public insert custom puzzles" on public.puzzles for insert with check (is_custom = true);
create policy "Allow public read puzzle_scores" on public.puzzle_scores for select using (true);
create policy "Allow public insert puzzle_scores" on public.puzzle_scores for insert with check (true);
create policy "Allow public insert affiliate_clicks" on public.affiliate_clicks for insert with check (true);
create policy "Allow service_role full affiliate_clicks" on public.affiliate_clicks for all using (true);
create policy "Allow service_role full affiliate_conversions" on public.affiliate_conversions for all using (true);

-- Storage bucket for puzzle images
insert into storage.buckets (id, name, public) 
values ('puzzle-images', 'puzzle-images', true)
on conflict (id) do nothing;

create policy "Allow public read puzzle-images storage" 
on storage.objects for select using (bucket_id = 'puzzle-images');

create policy "Allow public upload puzzle-images storage" 
on storage.objects for insert with check (bucket_id = 'puzzle-images');
