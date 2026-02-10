-- 1. Create the 'products' table if it doesn't exist
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  vendor_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text,
  price numeric not null,
  category text not null,
  condition text check (condition in ('New', 'Used', 'Refurbished')),
  brand text,
  warranty text,
  speciality text,
  location text,
  city text,
  area text,
  image_url text, -- Main display image
  status text default 'active' check (status in ('active', 'pending', 'sold', 'expired', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Enable RLS (Security)
alter table public.products enable row level security;

-- 3. Allow Authenticated Users (You) to Insert Products
create policy "Authenticated users can insert products" 
on public.products for insert 
with check (auth.uid() = vendor_id);

-- 4. Allow Everyone to Read Products
create policy "Public read access" 
on public.products for select 
using (true);

-- 5. Allow Updates (Just in case)
create policy "Users can update own products" 
on public.products for update 
using (auth.uid() = vendor_id);

-- 6. Allow Deletes (Just in case)
create policy "Users can delete own products" 
on public.products for delete 
using (auth.uid() = vendor_id);