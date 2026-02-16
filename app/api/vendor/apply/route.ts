import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { phoneSchema, emailSchema } from '@/lib/validation'

const applyVendorSchema = z.object({
  companyName: z.string().min(2),
  businessType: z.string().min(2),
  location: z.string().min(2),
  phone: phoneSchema.optional(),
  email: emailSchema.optional(),
  description: z.string().optional(),
  yearsInBusiness: z.string().optional(),
})

function slugify(name: string, suffix = '') {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^[-]+|[-]+$/g, '') +
    (suffix ? `-${suffix}` : '')
  )
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const parsed = applyVendorSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 })
    }

    const supabase = await createClient()

    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Service Unavailable' }, { status: 503 })
    }

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const payload = parsed.data

    // Create a stable showroom slug using user id suffix to avoid collisions
    const slug = slugify(payload.companyName, user.id.slice(0, 6))

    // Upsert vendor record (vendors.id is FK to profiles.id)
    const { data: vendorData, error: vendorError } = await supabase
      .from('vendors')
      .upsert({
        id: user.id,
        business_name: payload.companyName,
        description: payload.description || null,
        contact_phone: payload.phone || null,
        whatsapp_number: payload.phone || null,
        city: payload.location || null,
        showroom_slug: slug,
        banner_url: null,
        is_featured: false,
      } as any, { onConflict: 'id' })
      .select()
      .single()

    if (vendorError) {
      console.error('Vendor upsert error:', vendorError)
      return NextResponse.json({ success: false, error: 'Database error' }, { status: 500 })
    }

    // Update profile role to vendor
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'vendor' })
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile role update error:', profileError)
      // not fatal for the applicant flow
    }

    return NextResponse.json({ success: true, vendor: vendorData }, { status: 200 })
  } catch (err) {
    console.error('Apply Vendor error:', err)
    return NextResponse.json({ success: false, error: 'Unexpected server error' }, { status: 500 })
  }
}