export interface AdFormData {
    category: string
    name: string
    model: string
    description: string
    price: string
    priceType: string
    currency: string
    condition: string
    specialities: string[]
    tags: string[]
    brand: string
    warranty: string

    // Regulatory
    ceCertified: boolean
    fdaApproved: boolean
    isoCertified: boolean
    drapRegistered: boolean
    otherCertifications: string

    // Origin & Service
    originCountry: string
    refurbishmentCountry: string
    installationSupportCountry: string
    amcAvailable: boolean
    sparePartsAvailable: boolean
    installationIncluded: boolean

    city: string
    area: string
}

export type ImageState = {
    id: string
    file: File
    preview: string
    status: 'waiting' | 'uploading' | 'complete' | 'error'
    url?: string
    error?: string
}
