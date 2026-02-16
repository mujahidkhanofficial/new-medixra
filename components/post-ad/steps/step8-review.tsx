import { Button } from '@/components/ui/button'
import { AdFormData, ImageState } from '../types'
import { FileCheck, MapPin, Shield, Globe, Wrench, Tag, Package } from 'lucide-react'
import Image from 'next/image'

interface Step8Props {
    formData: AdFormData
    images: ImageState[]
    onSubmit: () => void
    onBack: () => void
    formLoading: boolean
}

export function Step8Review({ formData, images, onSubmit, onBack, formLoading }: Step8Props) {
    const completedImages = images.filter(img => img.status === 'complete')
    const hasCertifications = formData.ceCertified || formData.fdaApproved || formData.isoCertified || formData.drapRegistered || !!formData.otherCertifications
    const hasServices = formData.amcAvailable || formData.sparePartsAvailable || formData.installationIncluded

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <div className="text-center mb-6">
                <div className="h-16 w-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileCheck className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold">Review Your Listing</h2>
                <p className="text-sm text-muted-foreground mt-1">Make sure everything looks correct before posting</p>
            </div>

            <div className="bg-card border border-border rounded-xl p-6 text-sm space-y-5">

                {/* Header: Name, Category, Condition, Price */}
                <div className="flex justify-between items-start border-b pb-4">
                    <div>
                        <h3 className="font-bold text-lg">{formData.name || <span className="text-destructive italic">Missing</span>}</h3>
                        <p className="text-muted-foreground">
                            {formData.category || 'No category'} • {formData.condition}
                        </p>
                    </div>
                    <div className="text-right">
                        <p className="font-bold text-lg text-primary">
                            {formData.priceType === 'quote'
                                ? 'Quote Only'
                                : `${formData.currency} ${parseInt(formData.price || '0').toLocaleString()}`}
                        </p>
                        {formData.priceType !== 'quote' && formData.priceType !== 'fixed' && (
                            <span className="text-xs text-muted-foreground capitalize">{formData.priceType}</span>
                        )}
                    </div>
                </div>

                {/* Description */}
                {formData.description && (
                    <div className="border-b pb-4">
                        <span className="block text-xs text-muted-foreground mb-1">Description</span>
                        <p className="text-foreground whitespace-pre-wrap line-clamp-4">{formData.description}</p>
                    </div>
                )}

                {/* Technical Details */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-b pb-4">
                    <div>
                        <span className="block text-xs text-muted-foreground">Brand</span>
                        <span className="font-medium">{formData.brand || '-'}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-muted-foreground">Model</span>
                        <span className="font-medium">{formData.model || '-'}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-muted-foreground">Warranty</span>
                        <span className="font-medium">{formData.warranty || 'None'}</span>
                    </div>
                    <div>
                        <span className="block text-xs text-muted-foreground">Condition</span>
                        <span className="font-medium">{formData.condition}</span>
                    </div>
                </div>

                {/* Compliance & Certifications */}
                <div className="grid grid-cols-2 gap-4 border-b pb-4">
                    <div>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Shield className="h-3 w-3" /> Compliance
                        </span>
                        <div className="flex flex-wrap gap-1">
                            {formData.ceCertified && <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">CE</span>}
                            {formData.fdaApproved && <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs">FDA</span>}
                            {formData.isoCertified && <span className="px-2 py-0.5 bg-yellow-100 text-yellow-700 rounded text-xs">ISO</span>}
                            {formData.drapRegistered && <span className="px-2 py-0.5 bg-purple-100 text-purple-700 rounded text-xs">DRAP</span>}
                            {formData.otherCertifications && <span className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs">{formData.otherCertifications}</span>}
                            {!hasCertifications && <span className="text-muted-foreground">-</span>}
                        </div>
                    </div>
                    <div>
                        <span className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                            <Globe className="h-3 w-3" /> Origin
                        </span>
                        <span className="font-medium">{formData.originCountry || '-'}</span>
                        {formData.refurbishmentCountry && (
                            <span className="block text-xs text-muted-foreground mt-0.5">
                                Refurbished in {formData.refurbishmentCountry}
                            </span>
                        )}
                    </div>
                </div>

                {/* Service & Support */}
                {hasServices && (
                    <div className="border-b pb-4">
                        <span className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                            <Wrench className="h-3 w-3" /> Service & Support
                        </span>
                        <div className="flex flex-wrap gap-2">
                            {formData.amcAvailable && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">AMC Available</span>}
                            {formData.sparePartsAvailable && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">Spare Parts</span>}
                            {formData.installationIncluded && <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs">Installation Included</span>}
                        </div>
                    </div>
                )}

                {/* Tags & Specialities */}
                {(formData.tags.length > 0 || formData.specialities.length > 0) && (
                    <div className="border-b pb-4 space-y-3">
                        {formData.tags.length > 0 && (
                            <div>
                                <span className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                                    <Tag className="h-3 w-3" /> Equipment Tags
                                </span>
                                <div className="flex flex-wrap gap-1">
                                    {formData.tags.map(t => (
                                        <span key={t} className="px-2 py-0.5 bg-secondary text-secondary-foreground rounded text-xs border">{t}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                        {formData.specialities.length > 0 && (
                            <div>
                                <span className="block text-xs text-muted-foreground mb-1">Specialities</span>
                                <div className="flex flex-wrap gap-1">
                                    {formData.specialities.map(s => (
                                        <span key={s} className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded text-xs border border-blue-100">{s}</span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Location */}
                <div className="border-b pb-4">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground mb-1">
                        <MapPin className="h-3 w-3" /> Location
                    </span>
                    <span className="font-medium">
                        {[formData.area, formData.city].filter(Boolean).join(', ') || '-'}
                    </span>
                </div>

                {/* Images */}
                <div>
                    <span className="flex items-center gap-1 text-xs text-muted-foreground mb-2">
                        <Package className="h-3 w-3" /> Images ({completedImages.length})
                    </span>
                    {completedImages.length > 0 ? (
                        <div className="flex gap-2 overflow-x-auto pb-2">
                            {completedImages.map((img, i) => (
                                <div key={img.id} className="relative h-16 w-16 min-w-16 rounded-md overflow-hidden bg-muted border">
                                    {i === 0 && (
                                        <span className="absolute top-0 left-0 z-10 px-1.5 py-0.5 bg-primary text-primary-foreground text-[10px] rounded-br font-medium">Cover</span>
                                    )}
                                    <Image
                                        src={img.preview}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm italic text-destructive">No images uploaded — at least 1 is required.</p>
                    )}
                </div>
            </div>

            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack} disabled={formLoading}>Back</Button>
                <Button className="w-full ml-4" size="lg" onClick={onSubmit} disabled={formLoading}>
                    {formLoading ? 'Posting...' : 'Post Ad Now'}
                </Button>
            </div>
        </div>
    )
}
