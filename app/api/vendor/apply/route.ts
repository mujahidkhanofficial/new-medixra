import { NextResponse, NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'
import { phoneSchema, emailSchema } from '@/lib/validation'
import { verifyApiAuth } from '@/lib/api/protect-route'
import { logAuditEvent } from '@/lib/audit/audit-logger'

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

export async function POST(req: NextRequest) {
  try {
    // 1. Verify authentication and authorization
    const authResult = await verifyApiAuth(req, {
      requiredRoles: ['user', 'vendor', 'technician'],
      auditAction: 'vendor.apply',
      logSuccess: false,
    })

    if (!authResult.authorized) {
      return authResult.response
    }

    const { user, profile } = authResult

    // Validate user exists
    if (!user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 2. Parse request body
    const body = await req.json()
    const parsed = applyVendorSchema.safeParse(body)
    
    if (!parsed.success) {
      await logAuditEvent({
        action: 'vendor.apply',
        userId: user.id,
        status: 'error',
        reason: 'Invalid input',
        route: '/api/vendor/apply',
        metadata: { errors: parsed.error.flatten() },
      })
      return NextResponse.json(
        { success: false, error: 'Invalid input' },
        { status: 400 }
      )
    }

    const supabase = await createClient()
    if (!supabase) {
      await logAuditEvent({
        action: 'vendor.apply',
        userId: user.id,
        status: 'error',
        reason: 'Service unavailable',
        route: '/api/vendor/apply',
      })
      return NextResponse.json(
        { success: false, error: 'Service Unavailable' },
        { status: 503 }
      )
    }

    const payload = parsed.data

    // 3. Create a stable showroom slug using user id suffix to avoid collisions
    const slug = slugify(payload.companyName, user.id.slice(0, 6))

    // 4. Upsert vendor record (vendors.id is FK to profiles.id)
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
      await logAuditEvent({
        action: 'vendor.apply',
        userId: user.id,
        status: 'error',
        reason: `Database error: ${vendorError.message}`,
        route: '/api/vendor/apply',
      })
      return NextResponse.json(
        { success: false, error: 'Failed to create vendor profile' },
        { status: 500 }
      )
    }

    // 5. Update profile role to vendor
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ role: 'vendor' })
      .eq('id', user.id)

    if (profileError) {
      console.error('Profile role update error:', profileError)
      // not fatal for the applicant flow
    }

    // 6. Log successful vendor application
    await logAuditEvent({
      action: 'vendor.apply',
      userId: user.id,
      status: 'success',
      route: '/api/vendor/apply',
      metadata: {
        companyName: payload.companyName,
        businessType: payload.businessType,
        showroomSlug: slug,
      },
    })

    return NextResponse.json({ success: true, vendor: vendorData }, { status: 200 })
  } catch (err) {
    console.error('Apply Vendor error:', err)
    await logAuditEvent({
      action: 'vendor.apply',
      userId: 'unknown',
      status: 'error',
      reason: `Unexpected error: ${err instanceof Error ? err.message : 'Unknown'}`,
      route: '/api/vendor/apply',
    })
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}