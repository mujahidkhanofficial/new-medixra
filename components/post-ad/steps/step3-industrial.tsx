import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { FormError } from '@/components/ui/form-error'
import { Button } from '@/components/ui/button'
import { MultiSelectGrid } from '@/components/ui/multi-select-grid'
import { AdFormData } from '../types'
import { WARRANTIES, EQUIPMENT_TYPES, EQUIPMENT_HIERARCHY, SPECIALTIES } from '@/lib/constants'
import { Tag, Stethoscope } from 'lucide-react'

interface Step3Props {
    formData: AdFormData
    updateFormData: (data: Partial<AdFormData>) => void
    onNext: () => void
    onBack: () => void
    formLoading: boolean
    error: string | null
}

export function Step3Industrial({ formData, updateFormData, onNext, onBack, formLoading, error }: Step3Props) {
    // Derive dynamic specialities based on selected category
    const dynamicSpecialties = EQUIPMENT_HIERARCHY.find(
        c => c.name === formData.category
    )?.subcategories || []

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold">Industrial Grade Data</h2>
            <p className="text-sm text-muted-foreground">Buyers trust ads with complete technical details.</p>
            {error && <FormError message={error} />}
            <div className="space-y-4">
                <FormField label="Brand / Manufacturer">
                    <Input
                        type="text"
                        value={formData.brand}
                        onChange={e => updateFormData({ brand: e.target.value })}
                        placeholder="e.g. GE, Philips, Siemens, Mindray"
                        disabled={formLoading}
                    />
                </FormField>
                <div>
                    <label className="block text-sm font-medium mb-2">Warranty</label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                        {WARRANTIES.map(w => (
                            <button
                                key={w}
                                onClick={() => updateFormData({ warranty: w })}
                                className={`py-2 px-3 rounded-lg border text-xs font-medium transition-all
                                ${formData.warranty === w ? 'bg-primary text-primary-foreground border-primary' : 'bg-background hover:bg-muted'}
                            `}
                                disabled={formLoading}
                            >
                                {w}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Tag className="h-4 w-4" />
                        Equipment Type Tags
                    </h3>
                    <MultiSelectGrid
                        items={EQUIPMENT_TYPES}
                        selected={formData.tags}
                        onChange={(tags) => updateFormData({ tags })}
                        disabled={formLoading}
                    />
                </div>

                <div className="space-y-4 pt-4 border-t">
                    <h3 className="text-sm font-semibold flex items-center gap-2">
                        <Stethoscope className="h-4 w-4" />
                        Medical Specialities (Secondary Tags)
                    </h3>
                    {dynamicSpecialties.length > 0 ? (
                        <MultiSelectGrid
                            items={dynamicSpecialties}
                            selected={formData.specialities}
                            onChange={(specialities) => updateFormData({ specialities })}
                            disabled={formLoading}
                        />
                    ) : (
                        <p className="text-sm text-muted-foreground italic">
                            No specific specialities available for this category.
                        </p>
                    )}
                </div>
            </div>
            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack} disabled={formLoading}>Back</Button>
                <Button onClick={onNext} disabled={formLoading}>Next</Button>
            </div>
        </div>
    )
}
