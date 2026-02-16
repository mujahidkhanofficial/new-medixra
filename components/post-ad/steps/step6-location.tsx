import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Button } from '@/components/ui/button'
import { AdFormData } from '../types'
import { CITIES } from '@/lib/constants'

interface Step6Props {
    formData: AdFormData
    updateFormData: (data: Partial<AdFormData>) => void
    onNext: () => void
    onBack: () => void
    errors: Record<string, string>
    formLoading: boolean
}

export function Step6Location({ formData, updateFormData, onNext, onBack, errors, formLoading }: Step6Props) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold">Location</h2>
            <div className="space-y-4">
                <FormField label="City" required error={errors.city}>
                    <select
                        value={formData.city}
                        onChange={e => {
                            updateFormData({ city: e.target.value })
                        }}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background"
                        disabled={formLoading}
                    >
                        <option value="">Select City</option>
                        {CITIES.map(city => (
                            <option key={city} value={city}>{city}</option>
                        ))}
                    </select>
                </FormField>
                <FormField label="Area / Location">
                    <Input
                        type="text"
                        value={formData.area}
                        onChange={e => updateFormData({ area: e.target.value })}
                        placeholder="e.g. DHA Phase 6"
                        disabled={formLoading}
                    />
                </FormField>
            </div>
            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack} disabled={formLoading}>Back</Button>
                <Button onClick={onNext} disabled={formLoading}>Next</Button>
            </div>
        </div>
    )
}
