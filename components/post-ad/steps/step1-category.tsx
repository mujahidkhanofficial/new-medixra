import Image from 'next/image'
import { PRODUCT_CATEGORIES } from '@/lib/constants'
import { AdFormData } from '../types'
import { CheckCircle2 } from 'lucide-react'

// Map product category to PNG in public/assets/categories
const CATEGORY_ICON: Record<string, string> = {
    'Anesthesia & Critical Care': '/assets/categories/Anesthesia.png',
    'Cardiology & Cath Lab': '/assets/categories/Cardiology .png',
    'ENT (Otolaryngology)': '/assets/categories/ent.png',
    'Neurosurgery': '/assets/categories/neurosurgeon.png',
    'Orthopedics': '/assets/categories/orthopedics.png',
    'Urology': '/assets/categories/Urology.png',
    'Gynecology & Obstetrics': '/assets/categories/gynecologist.png',
    'General Surgery': '/assets/categories/surgeon.png',
    'Medical Imaging & Diagnostics': '/assets/categories/ImagingDiagnostics.png',
    'Laboratory & Research': '/assets/categories/Laboratory.png',
    'Primary & Secondary Care': '/assets/categories/primaryandsecondarycare.png',
    'Hygiene & Sterilization': '/assets/categories/Hygiene.png',
    'Furniture & Facility': '/assets/categories/furniture.png',
    'Medical Infrastructure': '/assets/categories/Infrastructure.png',
    'Dental': '/assets/categories/dental.png',
    'Rehabilitation & Physiotherapy': '/assets/categories/Physiotherapy.png',
    'Veterinary': '/assets/categories/veterinary.png',
    'Other': '/assets/categories/other.png',
}

interface Step1Props {
    formData: AdFormData
    updateFormData: (data: Partial<AdFormData>) => void
    onNext: () => void
}

export function Step1Category({ formData, updateFormData, onNext }: Step1Props) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold mb-4">Core Identity: Choose Category</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {PRODUCT_CATEGORIES.map((catName) => {
                    const src = CATEGORY_ICON[catName] ?? '/assets/categories/other.png'
                    return (
                        <button
                            key={catName}
                            onClick={() => {
                                updateFormData({ category: catName })
                                onNext()
                            }}
                            className={`p-4 flex flex-col items-center justify-center gap-3 rounded-xl border transition-all hover:border-primary hover:bg-primary/5 min-h-[100px]
                                ${formData.category === catName ? 'border-primary bg-primary/10 ring-1 ring-primary' : 'border-border bg-card'}
                            `}
                        >
                            <div className="h-12 w-12 relative">
                                <Image src={encodeURI(src)} alt={`${catName} icon`} fill className="object-contain" />
                            </div>
                            <span className="font-medium text-sm text-center">{catName}</span>
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
