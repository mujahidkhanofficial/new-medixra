-- FIX DATABASE SCHEMA AND POLICIES
-- Run this in Supabase SQL Editor

-- 1. PRODUCTS TABLE FIXES
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
  image_url text,
  status text default 'active' check (status in ('active', 'pending', 'sold', 'expired', 'archived')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Safely reset policies for products
alter table public.products enable row level security;

drop policy if exists "Authenticated users can insert products" on public.products;
drop policy if exists "Authenticated access" on public.products;
drop policy if exists "Public read access" on public.products;
drop policy if exists "Users can update own products" on public.products;
drop policy if exists "Users can delete own products" on public.products;

create policy "Public read access" 
on public.products for select 
using (true);

create policy "Authenticated users can insert products" 
on public.products for insert 
with check (auth.uid() = vendor_id);

create policy "Users can update own products" 
on public.products for update 
using (auth.uid() = vendor_id);

create policy "Users can delete own products" 
on public.products for delete 
using (auth.uid() = vendor_id);


-- 2. PRODUCT IMAGES TABLE (Crucial for the next step of Post Ad)
create table if not exists public.product_images (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  url text not null,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Safely reset policies for product_images
alter table public.product_images enable row level security;

drop policy if exists "Public read access images" on public.product_images;
drop policy if exists "Authenticated insert images" on public.product_images;
drop policy if exists "Users can update own images" on public.product_images;
drop policy if exists "Users can delete own images" on public.product_images;

create policy "Public read access images" 
on public.product_images for select 
using (true);

-- For inserting images, we check if the user owns the related product
create policy "Authenticated insert images" 
on public.product_images for insert 
with check (
  exists (
    select 1 from public.products
    where id = product_images.product_id
    and vendor_id = auth.uid()
  )
);

create policy "Users can update own images" 
on public.product_images for update 
using (
  exists (
    select 1 from public.products
    where id = product_images.product_id
    and vendor_id = auth.uid()
  )
);

create policy "Users can delete own images" 
on public.product_images for delete 
using (
  exists (
    select 1 from public.products
    where id = product_images.product_id
    and vendor_id = auth.uid()
  )
);
