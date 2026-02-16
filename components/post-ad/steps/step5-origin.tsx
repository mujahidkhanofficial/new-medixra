import { Input } from '@/components/ui/input'
import { FormField } from '@/components/ui/form-field'
import { Button } from '@/components/ui/button'
import { AdFormData } from '../types'
import { Wrench } from 'lucide-react'

interface Step5Props {
    formData: AdFormData
    updateFormData: (data: Partial<AdFormData>) => void
    onNext: () => void
    onBack: () => void
    formLoading: boolean
}

export function Step5Origin({ formData, updateFormData, onNext, onBack, formLoading }: Step5Props) {
    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
            <h2 className="text-xl font-semibold">Origin & Service Support</h2>
            <div className="space-y-6">
                {/* Origin Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField label="Country of Origin">
                        <Input
                            value={formData.originCountry}
                            onChange={e => updateFormData({ originCountry: e.target.value })}
                            placeholder="e.g. Germany, Japan"
                        />
                    </FormField>
                    {formData.condition !== 'New' && (
                        <FormField label="Country of Refurbishment">
                            <Input
                                value={formData.refurbishmentCountry}
                                onChange={e => updateFormData({ refurbishmentCountry: e.target.value })}
                                placeholder="e.g. USA, UK"
                            />
                        </FormField>
                    )}
                </div>

                {/* Service Fields */}
                <div className="p-4 border rounded-xl bg-blue-50/50 dark:bg-blue-900/10 space-y-4">
                    <h3 className="font-medium text-sm flex items-center gap-2">
                        <Wrench className="h-4 w-4" />
                        After-Sales Support
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.amcAvailable}
                                onChange={e => updateFormData({ amcAvailable: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm">AMC Available</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.sparePartsAvailable}
                                onChange={e => updateFormData({ sparePartsAvailable: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm">Spare Parts Available</span>
                        </label>
                        <label className="flex items-center space-x-3 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.installationIncluded}
                                onChange={e => updateFormData({ installationIncluded: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <span className="text-sm">Installation Support Included</span>
                        </label>
                    </div>
                </div>
            </div>
            <div className="flex justify-between pt-4">
                <Button variant="outline" onClick={onBack} disabled={formLoading}>Back</Button>
                <Button onClick={onNext} disabled={formLoading}>Next</Button>
            </div>
        </div>
    )
}
