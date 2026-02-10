-- MEDIXRA COMPLETE DATABASE SCHEMA
-- Run this in the Supabase SQL Editor to set up the entire database structure.

-- 1. Enable UUID Extension
create extension if not exists "uuid-ossp";

-- 2. Create PROFILES Table (Extends Supabase Auth)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text not null,
  full_name text,
  avatar_url text,
  phone text,
  city text,
  role text default 'buyer' check (role in ('buyer', 'vendor', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Create VENDORS Table (Business Profiles)
create table if not exists public.vendors (
  id uuid references public.profiles(id) on delete cascade primary key,
  business_name text not null,
  description text,
  is_verified boolean default false,
  contact_phone text,
  whatsapp_number text,
  city text,
  showroom_slug text unique,
  banner_url text,
  is_featured boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Create PRODUCTS Table
create table if not exists public.products (
  id uuid default uuid_generate_v4() primary key,
  vendor_id uuid references public.profiles(id) on delete cascade not null,
  name text not null,
  description text,
  category text not null, -- e.g. 'Imaging Equipment'
  price numeric not null,
  condition text check (condition in ('New', 'Used', 'Refurbished')),
  brand text,
  warranty text, -- e.g. '6 Months'
  speciality text, -- e.g. 'Cardiology'
  image_url text, -- Main display image
  location text, -- Product specific location
  city text,
  area text,
  status text default 'active' check (status in ('active', 'pending', 'sold', 'expired', 'archived')),
  views integer default 0,
  whatsapp_clicks integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Create PRODUCT_IMAGES Table (Gallery)
create table if not exists public.product_images (
  id uuid default uuid_generate_v4() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  url text not null,
  display_order integer default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Enable Row Level Security (RLS)
alter table public.profiles enable row level security;
alter table public.vendors enable row level security;
alter table public.products enable row level security;
alter table public.product_images enable row level security;

-- 7. RLS Policies

-- Profiles: Public Read, User Edit Own
create policy "Public Profiles" on public.profiles for select using (true);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);

-- Vendors: Public Read, Vendor Edit Own
create policy "Public Vendors" on public.vendors for select using (true);
create policy "Vendors can update own business" on public.vendors for update using (auth.uid() = id);
create policy "Vendors can insert own business" on public.vendors for insert with check (auth.uid() = id);

-- Products: Public Read (Active), Vendor Edit Own
create policy "Public Active Products" on public.products for select using (status = 'active' OR auth.uid() = vendor_id);
create policy "Vendors can insert products" on public.products for insert with check (auth.uid() = vendor_id);
create policy "Vendors can update own products" on public.products for update using (auth.uid() = vendor_id);
create policy "Vendors can delete own products" on public.products for delete using (auth.uid() = vendor_id);

-- Product Images: Public Read, Vendor Edit
create policy "Public Images" on public.product_images for select using (true);
create policy "Vendors can manage images" on public.product_images for all using (
  exists (select 1 from public.products where id = public.product_images.product_id and vendor_id = auth.uid())
);

-- 8. Create Triggers for Updated At
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_profiles_updated_at before update on public.profiles for each row execute procedure public.handle_updated_at();
create trigger set_vendors_updated_at before update on public.vendors for each row execute procedure public.handle_updated_at();
create trigger set_products_updated_at before update on public.products for each row execute procedure public.handle_updated_at();

-- 9. Auto-create Profile on Signup (Optional but recommended)
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  return new;
end;
$$ language plpgsql security definer;

-- Trigger the function every time a user is created
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 10. Indexes for Performance
create index if not exists idx_products_vendor_id on public.products(vendor_id);
create index if not exists idx_products_category on public.products(category);
create index if not exists idx_products_city on public.products(city);
create index if not exists idx_products_price on public.products(price);
create index if not exists idx_products_status on public.products(status);
create index if not exists idx_vendors_showroom_slug on public.vendors(showroom_slug);