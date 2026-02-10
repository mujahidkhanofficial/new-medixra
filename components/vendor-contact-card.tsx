import { Star, MapPin, MessageSquare, Phone } from 'lucide-react'
import WhatsAppContact from '@/components/whatsapp-contact'
import { Button } from '@/components/ui/button'

interface VendorContactCardProps {
  vendorName: string
  location: string
  rating?: number
  reviews?: number
  whatsappNumber: string
  phoneNumber?: string
  memberSince?: string
  compact?: boolean
}

export default function VendorContactCard({
  vendorName,
  location,
  rating = 4.8,
  reviews = 100,
  whatsappNumber,
  phoneNumber,
  memberSince,
  compact = false,
}: VendorContactCardProps) {
  if (compact) {
    return (
      <div className="rounded-lg border border-border bg-card p-4">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-semibold text-foreground text-sm">{vendorName}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
              <MapPin className="h-3 w-3" />
              {location}
            </div>
          </div>
          {rating && (
            <div className="flex items-center gap-0.5 bg-yellow-50 px-2 py-1 rounded">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs font-bold text-yellow-700">{rating}</span>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <WhatsAppContact
            phoneNumber={whatsappNumber}
            name="Message on WhatsApp"
            message={`Hi ${vendorName}, I'm interested in your products`}
            size="sm"
            fullWidth
          />
          {phoneNumber && (
            <Button asChild variant="outline" size="sm" className="w-full gap-2">
              <a href={`tel:${phoneNumber}`}>
                <Phone className="h-4 w-4" />
                Call
              </a>
            </Button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-border bg-card p-6">
      <div className="mb-4">
        <h2 className="text-xl font-bold text-foreground mb-2">{vendorName}</h2>
        <div className="flex items-center gap-2 text-muted-foreground mb-3">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{location}</span>
        </div>

        {rating && (
          <div className="flex items-center gap-2 mb-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${i < Math.floor(rating) ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
                />
              ))}
            </div>
            <span className="text-sm text-muted-foreground">
              {rating} ({reviews} reviews)
            </span>
          </div>
        )}

        {memberSince && (
          <p className="text-xs text-muted-foreground">Member since {memberSince}</p>
        )}
      </div>

      <div className="border-t border-border pt-4 space-y-3">
        <h3 className="text-sm font-semibold text-foreground">Contact Vendor</h3>
        <WhatsAppContact
          phoneNumber={whatsappNumber}
          name="WhatsApp"
          message={`Hi ${vendorName}, I'm interested in your products. Can you help me?`}
          fullWidth
        />
        {phoneNumber && (
          <Button asChild variant="outline" className="w-full gap-2">
            <a href={`tel:${phoneNumber}`}>
              <Phone className="h-4 w-4" />
              Call {vendorName}
            </a>
          </Button>
        )}
      </div>
    </div>
  )
}
