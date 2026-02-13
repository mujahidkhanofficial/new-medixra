-- Migration: Add status column to profiles table
-- Purpose: Track user suspension/activation separately from role
-- Replaces the anti-pattern of setting role='suspended'

ALTER TABLE public.profiles 
ADD COLUMN status text DEFAULT 'active' CHECK (status IN ('active', 'suspended'));

-- Create trigger to handle updated_at on status changes
CREATE TRIGGER set_profiles_updated_at_on_status 
BEFORE UPDATE OF status ON public.profiles 
FOR EACH ROW 
WHEN (OLD.status IS DISTINCT FROM NEW.status)
EXECUTE FUNCTION public.handle_updated_at();

-- Optional: Add index for faster status queries in admin panels
CREATE INDEX profiles_status_idx ON public.profiles(status);

-- Note: This migration allows concurrent role and status tracking.
-- A user can be role='vendor' and status='suspended' independently.
